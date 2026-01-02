import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { ParticipationStatus } from '../entities/participation.entity';

export class CreateParticipationDto {
    @IsInt()
    @IsNotEmpty()
    teamId: number;

    @IsInt()
    @IsNotEmpty()
    divisionId: number;
}

export class UpdateParticipationStatusDto {
    @IsEnum(ParticipationStatus)
    @IsNotEmpty()
    status: ParticipationStatus;
}
