import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateDivisionDto {
    @IsString()
    @IsNotEmpty()
    category: string; // e.g., '일반부'

    @IsString()
    @IsNotEmpty()
    divisionName: string; // e.g., 'A조'

    @IsString()
    @IsOptional()
    displayName: string;

    @IsString()
    @IsOptional()
    description: string;
}

export class CreateTournamentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsDateString()
    @IsOptional()
    regStart: string;

    @IsDateString()
    @IsOptional()
    regEnd: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    places: string[];

    @IsString()
    @IsOptional()
    status: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateDivisionDto)
    @IsOptional()
    divisions: CreateDivisionDto[];
}
