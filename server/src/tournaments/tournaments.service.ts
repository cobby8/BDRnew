import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { Tournament } from './entities/tournament.entity';

import { Registration } from './entities/registration.entity';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament)
        private tournamentRepository: Repository<Tournament>,
        @InjectRepository(Registration)
        private registrationRepository: Repository<Registration>,
    ) { }

    create(createTournamentDto: CreateTournamentDto) {
        const tournament = this.tournamentRepository.create(createTournamentDto);
        return this.tournamentRepository.save(tournament);
    }

    findAll() {
        return this.tournamentRepository.find({
            order: { startDate: 'DESC' }, // Show latest first
            relations: ['divisions'],
        });
    }

    async findOne(id: number) {
        const tournament = await this.tournamentRepository.findOne({
            where: { id },
            relations: ['divisions']
        });
        if (!tournament) {
            throw new NotFoundException(`Tournament #${id} not found`);
        }
        return tournament;
    }

    async update(id: number, updateTournamentDto: UpdateTournamentDto) {
        const tournament = await this.findOne(id); // Check existence
        this.tournamentRepository.merge(tournament, updateTournamentDto);
        return this.tournamentRepository.save(tournament);
    }

    async remove(id: number) {
        const result = await this.tournamentRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Tournament #${id} not found`);
        }
        return { deleted: true };
    }

    // Registration Management
    async registerTeam(tournamentId: number, dto: CreateRegistrationDto) {
        const tournament = await this.findOne(tournamentId);

        // Check if already registered
        const existing = await this.registrationRepository.findOne({
            where: {
                tournament: { id: tournamentId },
                team: { id: dto.teamId }
            }
        });

        if (existing) {
            throw new Error('This team is already registered for this tournament.');
        }

        const registration = this.registrationRepository.create({
            tournament,
            team: { id: dto.teamId },
            roster: dto.playerIds ? dto.playerIds.map(id => ({ id })) : []
        });

        return this.registrationRepository.save(registration);
    }

    async getRegistrations(tournamentId: number) {
        return this.registrationRepository.find({
            where: { tournament: { id: tournamentId } },
            relations: ['team', 'roster'],
            order: { createdAt: 'DESC' }
        });
    }
}
