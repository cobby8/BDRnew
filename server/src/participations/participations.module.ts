import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../teams/entities/team.entity';
import { TournamentDivision } from '../tournaments/entities/tournament-division.entity';
import { Participation } from './entities/participation.entity';
import { ParticipationsController } from './participations.controller';
import { ParticipationsService } from './participations.service';

@Module({
    imports: [TypeOrmModule.forFeature([Participation, Team, TournamentDivision])],
    controllers: [ParticipationsController],
    providers: [ParticipationsService],
    exports: [ParticipationsService]
})
export class ParticipationsModule { }
