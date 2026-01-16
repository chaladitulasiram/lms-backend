import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('courses')
export class CoursesController {
    constructor(
        private readonly coursesService: CoursesService,
        private readonly ratingsService: RatingsService,
    ) { }

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
    async addModule(@Param('id') courseId: string, @Body() body: { title: string; content: string; videoUrl?: string }) {
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

    // 6. Check Enrollment Status
    @Get(':id/enrollment-status')
    @UseGuards(JwtAuthGuard)
    async checkEnrollment(@Request() req, @Param('id') courseId: string) {
        return this.coursesService.checkEnrollment(req.user.userId, courseId);
    }

    // 7. Mark Course as Complete
    @Post(':id/complete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    async markComplete(@Request() req, @Param('id') courseId: string) {
        return this.ratingsService.markCourseComplete(req.user.userId, courseId);
    }

    // 8. Rate a Course (only after completion)
    @Post(':id/rate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    async rateCourse(
        @Request() req,
        @Param('id') courseId: string,
        @Body() body: { rating: number; review?: string }
    ) {
        return this.ratingsService.rateCourse(req.user.userId, courseId, body.rating, body.review);
    }

    // 9. Get Course Ratings
    @Get(':id/ratings')
    @UseGuards(JwtAuthGuard)
    async getRatings(@Param('id') courseId: string) {
        return this.ratingsService.getCourseRatings(courseId);
    }

    // 10. Check if user can rate
    @Get(':id/can-rate')
    @UseGuards(JwtAuthGuard)
    async canRate(@Request() req, @Param('id') courseId: string) {
        return this.ratingsService.canRate(req.user.userId, courseId);
    }
}