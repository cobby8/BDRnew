import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipationsModule } from '../participations/participations.module';
import { Team } from '../teams/entities/team.entity';
import { TournamentDivision } from '../tournaments/entities/tournament-division.entity';
import { Game } from './entities/game.entity';
import { GamesController } from './games.controller';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Game, Team, TournamentDivision]),
        ParticipationsModule // Need this to access participation data for bracket generation
    ],
    controllers: [GamesController],
    providers: [GamesService, GamesGateway],
    exports: [GamesService]
})
export class GamesModule { }
