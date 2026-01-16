import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    // Create assignment (Mentor only)
    @Post('module/:moduleId')
    @UseGuards(RolesGuard)
    @Roles('MENTOR')
    async createAssignment(
        @Param('moduleId') moduleId: string,
        @Body() body: {
            title: string;
            description: string;
            dueDate?: string;
            maxScore?: number;
        }
    ) {
        return this.assignmentsService.createAssignment(moduleId, {
            ...body,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        });
    }

    // Get module assignments
    @Get('module/:moduleId')
    async getModuleAssignments(@Param('moduleId') moduleId: string) {
        return this.assignmentsService.getModuleAssignments(moduleId);
    }

    // Get assignment by ID
    @Get(':id')
    async getAssignment(@Param('id') id: string) {
        return this.assignmentsService.getAssignment(id);
    }

    // Submit assignment (Student only)
    @Post(':id/submit')
    @UseGuards(RolesGuard)
    @Roles('STUDENT')
    async submitAssignment(
        @Request() req,
        @Param('id') assignmentId: string,
        @Body() body: {
            content: string;
            fileUrl?: string;
        }
    ) {
        return this.assignmentsService.submitAssignment(
            assignmentId,
            req.user.userId,
            body
        );
    }

    // Grade submission (Mentor only)
    @Put('submissions/:id/grade')
    @UseGuards(RolesGuard)
    @Roles('MENTOR')
    async gradeSubmission(
        @Request() req,
        @Param('id') submissionId: string,
        @Body() body: {
            score: number;
            feedback?: string;
        }
    ) {
        return this.assignmentsService.gradeSubmission(
            submissionId,
            req.user.userId,
            body
        );
    }

    // Get student's submissions
    @Get('student/submissions')
    @UseGuards(RolesGuard)
    @Roles('STUDENT')
    async getStudentSubmissions(
        @Request() req,
        @Param('courseId') courseId?: string
    ) {
        return this.assignmentsService.getStudentSubmissions(
            req.user.userId,
            courseId
        );
    }

    // Get course submissions (Mentor only)
    @Get('course/:courseId/submissions')
    @UseGuards(RolesGuard)
    @Roles('MENTOR')
    async getCourseSubmissions(
        @Request() req,
        @Param('courseId') courseId: string
    ) {
        return this.assignmentsService.getCourseSubmissions(
            courseId,
            req.user.userId
        );
    }

    // Delete assignment (Mentor only)
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('MENTOR')
    async deleteAssignment(
        @Request() req,
        @Param('id') id: string
    ) {
        await this.assignmentsService.deleteAssignment(id, req.user.userId);
        return { message: 'Assignment deleted successfully' };
    }
}
