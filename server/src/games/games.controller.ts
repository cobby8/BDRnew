import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateGroupStageDto } from './dto/create-group-stage.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    @Post('bracket/:divisionId')
    generateBracket(@Param('divisionId') divisionId: string) {
        return this.gamesService.generateBracket(+divisionId);
    }

    @Post('group-stage/:divisionId')
    generateGroupStage(@Param('divisionId') divisionId: string, @Body() body: CreateGroupStageDto) {
        return this.gamesService.generateGroupStage(+divisionId, body.groupCount);
    }

    @Patch(':id/score')
    updateGameScore(@Param('id') id: string, @Body() body: UpdateGameDto) {
        return this.gamesService.updateGameScore(+id, body);
    }

    @Get('standings/:divisionId')
    getGroupStandings(@Param('divisionId') divisionId: string) {
        return this.gamesService.getGroupStandings(+divisionId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.gamesService.findOne(+id);
    }

    @Get('division/:divisionId')
    findByDivision(@Param('divisionId') divisionId: string) {
        return this.gamesService.findAllByDivision(+divisionId);
    }
}
