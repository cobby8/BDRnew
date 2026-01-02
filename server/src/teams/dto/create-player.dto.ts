import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlayerDto {
    @IsString()
    name: string;

    @Type(() => Number)
    @IsNumber()
    backNumber: number;

    @IsOptional()
    @IsString()
    birthDate?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    height?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    weight?: number;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    profileImageUrl?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    lastAttended?: string;

    @IsOptional()
    @IsString()
    experience?: string;
}
