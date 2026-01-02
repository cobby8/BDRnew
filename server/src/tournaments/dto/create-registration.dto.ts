import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateRegistrationDto {
    @IsNumber()
    teamId: number;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    playerIds?: number[];
}
