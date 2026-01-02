import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipationStatus } from '../participations/entities/participation.entity';
import { ParticipationsService } from '../participations/participations.service';
import { Team } from '../teams/entities/team.entity';
import { TournamentDivision } from '../tournaments/entities/tournament-division.entity';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game, GameStage, GameStatus } from './entities/game.entity';
import { GamesGateway } from './games.gateway';

@Injectable()
export class GamesService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
        @InjectRepository(TournamentDivision)
        private divisionRepository: Repository<TournamentDivision>,
        private participationsService: ParticipationsService,
        private gamesGateway: GamesGateway
    ) { }

    async findAllByDivision(divisionId: number): Promise<Game[]> {
        return this.gameRepository.find({
            where: { division: { id: divisionId } },
            relations: ['homeTeam', 'awayTeam', 'homeTeam.school', 'awayTeam.school'], // Load schools too
            order: { roundOf: 'DESC', matchIndex: 'ASC' }
        });
    }

    async findOne(id: number): Promise<Game> {
        const game = await this.gameRepository.findOne({
            where: { id },
            relations: ['homeTeam', 'awayTeam', 'homeTeam.school', 'awayTeam.school']
        });
        if (!game) throw new NotFoundException(`Game #${id} not found`);
        return game;
    }

    // Generate a single elimination bracket
    async generateBracket(divisionId: number): Promise<Game[]> {
        const division = await this.divisionRepository.findOne({ where: { id: divisionId } });
        if (!division) throw new NotFoundException('Division not found');

        // Check if bracket already exists
        const existing = await this.gameRepository.count({ where: { division: { id: divisionId } } });
        if (existing > 0) throw new BadRequestException('Bracket already exists for this division');

        const participations = await this.participationsService.findByDivision(divisionId);
        const approvedTeams = participations
            .filter(p => p.status === ParticipationStatus.APPROVED)
            .map(p => p.team);

        const teamCount = approvedTeams.length;
        if (teamCount < 2) throw new BadRequestException('Not enough teams to generate bracket (Need at least 2)');

        // 1. Determine size (Next Power of 2)
        // e.g. 5 teams -> 8,  9 teams -> 16
        const size = Math.pow(2, Math.ceil(Math.log2(teamCount)));

        // 2. Create Games from Final (Round of 2) backwards to First Round
        // But to link nextGameId, it's easier to create Final first, then Semis, etc.
        const createdGames: Game[] = [];

        // We will store created games in a map "roundOf-index" -> Game to link them
        const gameMap = new Map<string, Game>();

        // maxRound: e.g. size=8 -> roundOf 8, 4, 2
        // We iterate: 2, 4, 8 ... until size

        let currentRoundOf = 2; // Final
        while (currentRoundOf <= size) {
            const matchCount = currentRoundOf / 2; // e.g. Round of 4 has 2 matches

            for (let i = 0; i < matchCount; i++) {
                const game = new Game();
                game.division = division;
                game.roundOf = currentRoundOf;
                game.matchIndex = i;
                game.status = GameStatus.SCHEDULED;

                // Find Next Game (Parent)
                if (currentRoundOf > 2) {
                    const parentRound = currentRoundOf / 2;
                    const parentIndex = Math.floor(i / 2);
                    const parentKey = `${parentRound}-${parentIndex}`;
                    const parentGame = gameMap.get(parentKey);
                    if (parentGame) {
                        game.nextGameId = parentGame.id;
                    }
                }

                const savedGame = await this.gameRepository.save(game);
                createdGames.push(savedGame);
                gameMap.set(`${currentRoundOf}-${i}`, savedGame);
            }

            currentRoundOf *= 2;
        }

        // 3. Assign Teams to the outermost round (First Round)
        // currentRoundOf loop ended at (size * 2), so the last processed round was `size`.
        const firstRound = size;

        // Shuffle teams
        const shuffledTeams = [...approvedTeams].sort(() => 0.5 - Math.random());

        // Place teams in the slots of "firstRound" games
        // There are `firstRound / 2` matches. Each match has Home and Away.
        // Total slots = firstRound.
        // If teamCount < size, some slots are empty (Byes).

        // Strategy: Fill slots 1 by 1.
        // If we want to distribute Byes evenly, that's complex.
        // Simple Top-Down fill for MVP.

        const firstRoundGames = createdGames.filter(g => g.roundOf === firstRound).sort((a, b) => a.matchIndex - b.matchIndex);

        let teamIdx = 0;
        for (const game of firstRoundGames) {
            // Home Slot
            if (teamIdx < shuffledTeams.length) {
                game.homeTeam = shuffledTeams[teamIdx++];
            }
            // Away Slot
            if (teamIdx < shuffledTeams.length) {
                game.awayTeam = shuffledTeams[teamIdx++];
            }

            // Auto-advance if BYE (Single team in match) - Optional Logic
            // For now, just save.
            await this.gameRepository.save(game);
        }

        return createdGames;
    }

    async generateGroupStage(divisionId: number, groupCount: number): Promise<Game[]> {
        const division = await this.divisionRepository.findOne({ where: { id: divisionId } });
        if (!division) throw new NotFoundException('Division not found');

        // Check for existing games
        const existing = await this.gameRepository.count({ where: { division: { id: divisionId } } });
        if (existing > 0) throw new BadRequestException('Games already exist for this division');

        const participations = await this.participationsService.findByDivision(divisionId);
        const approvedTeams = participations
            .filter(p => p.status === ParticipationStatus.APPROVED)
            .map(p => p.team);

        if (approvedTeams.length < groupCount) {
            throw new BadRequestException('Not enough teams for the requested number of groups');
        }

        // Shuffle Teams
        const shuffled = [...approvedTeams].sort(() => 0.5 - Math.random());

        // Distribute into Groups
        // e.g. 10 teams, 3 groups -> A:4, B:3, C:3
        const groups: Team[][] = Array.from({ length: groupCount }, () => []);
        shuffled.forEach((team, index) => {
            const groupIndex = index % groupCount;
            groups[groupIndex].push(team);
        });

        const createdGames: Game[] = [];

        // Generate Round Robin for each Group
        const groupNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let i = 0; i < groupCount; i++) {
            const groupName = groupNames[i] || `G${i + 1}`;
            const groupTeams = groups[i];

            // Round Robin Logic:
            // For N teams, each plays N-1 games. Total matches = N*(N-1)/2.
            for (let j = 0; j < groupTeams.length; j++) {
                for (let k = j + 1; k < groupTeams.length; k++) {
                    const game = new Game();
                    game.division = division;
                    game.stage = GameStage.GROUP;
                    game.groupName = groupName;
                    game.roundOf = 0; // Not applicable for Group
                    game.matchIndex = 0;
                    game.status = GameStatus.SCHEDULED;
                    game.homeTeam = groupTeams[j];
                    game.awayTeam = groupTeams[k];
                    createdGames.push(game);
                }
            }

        }

        return this.gameRepository.save(createdGames);
    }

    async updateGameScore(id: number, dto: UpdateGameDto): Promise<Game> {
        const game = await this.gameRepository.findOne({
            where: { id },
            relations: ['homeTeam', 'awayTeam']
        });
        if (!game) throw new NotFoundException('Game not found');

        const oldStatus = game.status;

        if (dto.homeScore !== undefined) game.homeScore = dto.homeScore;
        if (dto.awayScore !== undefined) game.awayScore = dto.awayScore;
        if (dto.status !== undefined) game.status = dto.status;

        // Validation: If marking FINAL, ensure scores exist
        if (dto.status === GameStatus.FINAL) {
            if (game.homeScore === null || game.awayScore === null) {
                throw new BadRequestException('Cannot mark FINAL without scores');
            }
            if (game.homeScore === game.awayScore) {
                throw new BadRequestException('Draw is not allowed in tournament matches');
            }
        }

        const savedGame = await this.gameRepository.save(game);
        this.gamesGateway.sendGameUpdate(savedGame.id, savedGame);

        // Winner Advancement Logic
        // Trigger only if status changed to FINAL
        if (dto.status === GameStatus.FINAL && oldStatus !== GameStatus.FINAL && game.stage === GameStage.TOURNAMENT) {
            await this.advanceWinner(savedGame);
        }

        return savedGame;
    }

    private async advanceWinner(game: Game) {
        if (!game.nextGameId) return;

        const nextGame = await this.gameRepository.findOne({
            where: { id: game.nextGameId },
            relations: ['homeTeam', 'awayTeam']
        });

        if (!nextGame) return;

        const winner = game.homeScore > game.awayScore ? game.homeTeam : game.awayTeam;

        // Determine slot based on matchIndex (Even -> Home, Odd -> Away)
        // This assumes the bracket generation logic where pair (0,1) -> 0, (2,3) -> 1, etc.
        if (game.matchIndex % 2 === 0) {
            nextGame.homeTeam = winner;
        } else {
            nextGame.awayTeam = winner;
        }

        const savedNext = await this.gameRepository.save(nextGame);
        this.gamesGateway.sendGameUpdate(savedNext.id, savedNext);
    }

    async getGroupStandings(divisionId: number) {
        // Fetch all group games that are FINAL
        const games = await this.gameRepository.find({
            where: {
                division: { id: divisionId },
                stage: GameStage.GROUP
            },
            relations: ['homeTeam', 'awayTeam']
        });

        // Initialize Standings Map: TeamId -> Stat Object
        const stats: Record<number, {
            teamId: number;
            teamName: string;
            groupName: string;
            played: number;
            won: number;
            lost: number;
            pointsFor: number;
            pointsAgainst: number;
            pointDiff: number;
        }> = {};

        games.forEach(game => {
            if (!game.homeTeam || !game.awayTeam) return;

            // Ensure stats exist for home
            if (!stats[game.homeTeam.id]) {
                stats[game.homeTeam.id] = {
                    teamId: game.homeTeam.id,
                    teamName: game.homeTeam.name,
                    groupName: game.groupName,
                    played: 0, won: 0, lost: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0
                };
            }
            // Ensure stats exist for away
            if (!stats[game.awayTeam.id]) {
                stats[game.awayTeam.id] = {
                    teamId: game.awayTeam.id,
                    teamName: game.awayTeam.name,
                    groupName: game.groupName,
                    played: 0, won: 0, lost: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0
                };
            }

            // Only process if GAME IS FINAL (or has scores)
            if (game.status === GameStatus.FINAL) {
                const hScore = game.homeScore || 0;
                const aScore = game.awayScore || 0;

                const home = stats[game.homeTeam.id];
                const away = stats[game.awayTeam.id];

                home.played++;
                away.played++;
                home.pointsFor += hScore;
                home.pointsAgainst += aScore;
                home.pointDiff += (hScore - aScore);

                away.pointsFor += aScore;
                away.pointsAgainst += hScore;
                away.pointDiff += (aScore - hScore);

                if (hScore > aScore) home.won++;
                else if (aScore > hScore) away.won++;

                // Loss calculation
                home.lost = home.played - home.won;
                away.lost = away.played - away.won;
            }
        });

        // Convert to Array and Sort
        const standingList = Object.values(stats);

        // Sort: Group Name ASC -> Won DESC -> Point Diff DESC -> Points For DESC
        standingList.sort((a, b) => {
            if (a.groupName < b.groupName) return -1;
            if (a.groupName > b.groupName) return 1;

            if (b.won !== a.won) return b.won - a.won;
            if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
            return b.pointsFor - a.pointsFor;
        });

        return standingList;
    }
}
