import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { Player } from './entities/player.entity';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private teamsRepository: Repository<Team>,
        @InjectRepository(Player)
        private playersRepository: Repository<Player>,
    ) { }

    async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
        const team = this.teamsRepository.create(createTeamDto);
        return await this.teamsRepository.save(team);
    }

    async findAllTeams(category?: string): Promise<Team[]> {
        const query = this.teamsRepository.createQueryBuilder('team')
            .leftJoinAndSelect('team.school', 'school')
            .leftJoinAndSelect('team.players', 'players');

        if (category && category !== 'ALL') {
            query.where('team.divisionCategory = :category', { category });
        }

        return await query.getMany();
    }

    async findOneTeam(id: number): Promise<Team> {
        const team = await this.teamsRepository.findOne({
            where: { id },
            relations: ['school', 'players'],
        });
        if (!team) throw new NotFoundException(`Team with ID ${id} not found`);
        return team;
    }

    async updateTeam(id: number, updateData: Partial<Team>): Promise<Team> {
        await this.teamsRepository.update(id, updateData);
        return this.findOneTeam(id);
    }

    async deleteTeam(id: number): Promise<void> {
        await this.teamsRepository.delete(id);
    }

    // Player Management
    async addPlayer(teamId: number, createPlayerDto: CreatePlayerDto): Promise<Player> {
        const team = await this.findOneTeam(teamId);
        const player = this.playersRepository.create({
            ...createPlayerDto,
            team: team,
        });
        return await this.playersRepository.save(player);
    }

    async removePlayer(playerId: number): Promise<void> {
        await this.playersRepository.softDelete(playerId);
    }

    async updatePlayer(playerId: number, updateData: Partial<Player>): Promise<Player | null> {
        await this.playersRepository.update(playerId, updateData);
        return await this.playersRepository.findOne({ where: { id: playerId } });
    }
}
