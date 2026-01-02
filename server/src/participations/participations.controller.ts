import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateParticipationDto, UpdateParticipationStatusDto } from './dto/create-participation.dto';
import { ParticipationsService } from './participations.service';

@Controller('participations')
export class ParticipationsController {
    constructor(private readonly participationsService: ParticipationsService) { }

    @Post()
    create(@Body() dto: CreateParticipationDto) {
        return this.participationsService.create(dto);
    }

    @Get('tournament/:tournamentId')
    findByTournament(@Param('tournamentId') tournamentId: string) {
        return this.participationsService.findByTournament(+tournamentId);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateParticipationStatusDto) {
        return this.participationsService.updateStatus(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.participationsService.remove(+id);
    }
}
