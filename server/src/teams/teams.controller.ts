import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreatePlayerDto } from './dto/create-player.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Post()
    create(@Body() createTeamDto: CreateTeamDto) {
        return this.teamsService.createTeam(createTeamDto);
    }

    @Get()
    findAll(@Query('category') category?: string) {
        return this.teamsService.findAllTeams(category);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teamsService.findOneTeam(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.teamsService.updateTeam(+id, updateData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.teamsService.deleteTeam(+id);
    }

    // Player Endpoints
    @Post(':id/players')
    @UseInterceptors(FileInterceptor('profileImage', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    addPlayer(
        @Param('id') id: string,
        @Body() createPlayerDto: CreatePlayerDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (file) {
            createPlayerDto.profileImageUrl = `http://localhost:4000/uploads/${file.filename}`;
        }
        return this.teamsService.addPlayer(+id, createPlayerDto);
    }



    @Patch(':id/players/:playerId')
    @UseInterceptors(FileInterceptor('profileImage', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    updatePlayer(
        @Param('playerId') playerId: string,
        @Body() updatePlayerDto: UpdatePlayerDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (file) {
            updatePlayerDto.profileImageUrl = `http://localhost:8081/uploads/${file.filename}`;
        }
        return this.teamsService.updatePlayer(+playerId, updatePlayerDto);
    }

    @Delete(':id/players/:playerId')
    removePlayer(@Param('playerId') playerId: string) {
        return this.teamsService.removePlayer(+playerId);
    }
}
