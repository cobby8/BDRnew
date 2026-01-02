import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';

@Controller('tournaments')
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createTournamentDto: CreateTournamentDto) {
        return this.tournamentsService.create(createTournamentDto);
    }

    @Get()
    findAll() {
        return this.tournamentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tournamentsService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTournamentDto: UpdateTournamentDto) {
        return this.tournamentsService.update(+id, updateTournamentDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tournamentsService.remove(+id);
    }

    // Registrations
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/registrations')
    registerTeam(@Param('id') id: string, @Body() dto: CreateRegistrationDto) {
        return this.tournamentsService.registerTeam(+id, dto);
    }

    @Get(':id/registrations')
    getRegistrations(@Param('id') id: string) {
        return this.tournamentsService.getRegistrations(+id);
    }
}
