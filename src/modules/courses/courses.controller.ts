import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    // 1. Create Course - Only MENTORS
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MENTOR')
    async create(@Request() req, @Body() body: { title: string; description: string }) {
        // req.user is attached by the JwtAuthGuard
        return this.coursesService.createCourse(body, req.user.userId);
    }

    // 2. Add Module (Lesson) - Only MENTORS
    @Post(':id/modules')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MENTOR')
    async addModule(@Param('id') courseId: string, @Body() body: { title: string; content: string }) {
        return this.coursesService.addModule(courseId, body);
    }

    // 3. Get Course Catalog - Open to everyone (Authenticated)
    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {
        return this.coursesService.findAll();
    }

    // 4. Get Single Course (Classroom View) - Open to everyone (Authenticated)
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    // 5. Enroll in a Course - Only STUDENTS
    @Post(':id/enroll')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    async enroll(@Request() req, @Param('id') courseId: string) {
        return this.coursesService.enroll(req.user.userId, courseId);
    }
}