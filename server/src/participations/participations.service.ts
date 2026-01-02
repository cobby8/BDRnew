import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../teams/entities/team.entity';
import { TournamentDivision } from '../tournaments/entities/tournament-division.entity';
import { CreateParticipationDto, UpdateParticipationStatusDto } from './dto/create-participation.dto';
import { Participation, ParticipationStatus } from './entities/participation.entity';

@Injectable()
export class ParticipationsService {
    constructor(
        @InjectRepository(Participation)
        private participationRepository: Repository<Participation>,
        @InjectRepository(Team)
        private teamRepository: Repository<Team>,
        @InjectRepository(TournamentDivision)
        private divisionRepository: Repository<TournamentDivision>,
    ) { }

    async create(dto: CreateParticipationDto): Promise<Participation> {
        const team = await this.teamRepository.findOne({ where: { id: dto.teamId } });
        if (!team) throw new NotFoundException('Team not found');

        const division = await this.divisionRepository.findOne({ where: { id: dto.divisionId } });
        if (!division) throw new NotFoundException('Division not found');

        // Check duplicate
        const existing = await this.participationRepository.findOne({
            where: { team: { id: dto.teamId }, division: { id: dto.divisionId } }
        });
        if (existing) throw new BadRequestException('Team already applied to this division');

        const participation = this.participationRepository.create({
            team,
            division,
            status: ParticipationStatus.PENDING
        });

        return this.participationRepository.save(participation);
    }

    async findAll(): Promise<Participation[]> {
        return this.participationRepository.find({ relations: ['team', 'division', 'division.tournament'] });
    }

    async findByDivision(divisionId: number): Promise<Participation[]> {
        return this.participationRepository.find({
            where: { division: { id: divisionId } },
            relations: ['team']
        });
    }

    // Find all participations for a whole tournament
    async findByTournament(tournamentId: number): Promise<Participation[]> {
        return this.participationRepository.find({
            where: { division: { tournament: { id: tournamentId } } },
            relations: ['team', 'division']
        });
    }

    async updateStatus(id: number, dto: UpdateParticipationStatusDto): Promise<Participation> {
        const participation = await this.participationRepository.findOne({ where: { id } });
        if (!participation) throw new NotFoundException('Participation not found');

        participation.status = dto.status;
        return this.participationRepository.save(participation);
    }

    async remove(id: number): Promise<void> {
        await this.participationRepository.delete(id);
    }
}
