import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserStatus } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('status/:status')
    findByStatus(@Param('status') status: UserStatus) {
        return this.usersService.findByStatus(status);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
        return this.usersService.updateStatus(id, status);
    }
}
