import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Assignment, Submission } from '@prisma/client';

@Injectable()
export class AssignmentsService {
    constructor(private prisma: PrismaService) { }

    // Create assignment (Mentor only)
    async createAssignment(moduleId: string, data: {
        title: string;
        description: string;
        dueDate?: Date;
        maxScore?: number;
    }): Promise<Assignment> {
        // Verify module exists
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
        });

        if (!module) {
            throw new NotFoundException('Module not found');
        }

        return this.prisma.assignment.create({
            data: {
                moduleId,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                maxScore: data.maxScore || 100,
            },
        });
    }

    // Get all assignments for a module
    async getModuleAssignments(moduleId: string): Promise<Assignment[]> {
        return this.prisma.assignment.findMany({
            where: { moduleId },
            include: {
                submissions: {
                    select: {
                        id: true,
                        studentId: true,
                        submittedAt: true,
                        score: true,
                    },
                },
                _count: {
                    select: { submissions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Get assignment by ID
    async getAssignment(id: string): Promise<Assignment> {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: {
                module: {
                    include: {
                        course: true,
                    },
                },
                submissions: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }

        return assignment;
    }

    // Submit assignment (Student only)
    async submitAssignment(
        assignmentId: string,
        studentId: string,
        data: {
            content: string;
            fileUrl?: string;
        }
    ): Promise<Submission> {
        // Check if assignment exists
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
        });

        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }

        // Check if already submitted
        const existing = await this.prisma.submission.findUnique({
            where: {
                assignmentId_studentId: {
                    assignmentId,
                    studentId,
                },
            },
        });

        if (existing) {
            // Update existing submission
            return this.prisma.submission.update({
                where: {
                    assignmentId_studentId: {
                        assignmentId,
                        studentId,
                    },
                },
                data: {
                    content: data.content,
                    fileUrl: data.fileUrl,
                    submittedAt: new Date(),
                },
            });
        }

        // Create new submission
        return this.prisma.submission.create({
            data: {
                assignmentId,
                studentId,
                content: data.content,
                fileUrl: data.fileUrl,
            },
        });
    }

    // Grade assignment (Mentor only)
    async gradeSubmission(
        submissionId: string,
        mentorId: string,
        data: {
            score: number;
            feedback?: string;
        }
    ): Promise<Submission> {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                assignment: {
                    include: {
                        module: {
                            include: {
                                course: true,
                            },
                        },
                    },
                },
            },
        });

        if (!submission) {
            throw new NotFoundException('Submission not found');
        }

        // Verify mentor owns the course
        if (submission.assignment.module.course.mentorId !== mentorId) {
            throw new ForbiddenException('You can only grade submissions for your own courses');
        }

        return this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                score: data.score,
                feedback: data.feedback,
                gradedAt: new Date(),
            },
        });
    }

    // Get student's submissions
    async getStudentSubmissions(studentId: string, courseId?: string): Promise<Submission[]> {
        return this.prisma.submission.findMany({
            where: {
                studentId,
                ...(courseId && {
                    assignment: {
                        module: {
                            courseId,
                        },
                    },
                }),
            },
            include: {
                assignment: {
                    include: {
                        module: {
                            include: {
                                course: true,
                            },
                        },
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
    }

    // Get submissions for a course (Mentor view)
    async getCourseSubmissions(courseId: string, mentorId: string): Promise<Submission[]> {
        // Verify mentor owns the course
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course || course.mentorId !== mentorId) {
            throw new ForbiddenException('You can only view submissions for your own courses');
        }

        return this.prisma.submission.findMany({
            where: {
                assignment: {
                    module: {
                        courseId,
                    },
                },
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignment: {
                    include: {
                        module: true,
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
    }

    // Delete assignment (Mentor only)
    async deleteAssignment(id: string, mentorId: string): Promise<void> {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: {
                module: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }

        if (assignment.module.course.mentorId !== mentorId) {
            throw new ForbiddenException('You can only delete assignments from your own courses');
        }

        await this.prisma.assignment.delete({
            where: { id },
        });
    }
}
