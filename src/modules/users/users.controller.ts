import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // 1. Only logged-in users can access this
    // 2. ONLY 'ADMIN' users can access this
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async findAll() {
        // We will add a simple findAll method to service in a moment
        return "This is protected data only for Admins!";
    }
}