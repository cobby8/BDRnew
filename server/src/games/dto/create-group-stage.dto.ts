import { IsNumber, Min } from 'class-validator';

export class CreateGroupStageDto {
    @IsNumber()
    @Min(1)
    groupCount: number;
}
