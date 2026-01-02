import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from './entities/tournament.entity';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

import { TournamentDivision } from './entities/tournament-division.entity';

import { Registration } from './entities/registration.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tournament, TournamentDivision, Registration])],
    controllers: [TournamentsController],
    providers: [TournamentsService],
})
export class TournamentsModule { }
