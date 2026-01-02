import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { GameStatus } from '../entities/game.entity';

export class UpdateGameDto {
    @IsNumber()
    @IsOptional()
    homeScore?: number;

    @IsNumber()
    @IsOptional()
    awayScore?: number;

    @IsEnum(GameStatus)
    @IsOptional()
    status?: GameStatus;
}
