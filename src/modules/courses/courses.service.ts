import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Course, Module as CourseModule } from '@prisma/client';

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) { }

    // 1. Create a Course (Mentors Only)
    async createCourse(data: { title: string; description: string }, mentorId: string): Promise<Course> {
        return this.prisma.course.create({
            data: {
                ...data,
                mentorId: mentorId,
            },
        });
    }

    // 2. Add a Module/Lesson to a Course (Mentors Only)
    async addModule(courseId: string, data: { title: string; content: string; videoUrl?: string }): Promise<CourseModule> {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        // Get the highest order number
        const maxOrder = await this.prisma.module.findFirst({
            where: { courseId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });

        return this.prisma.module.create({
            data: {
                title: data.title,
                content: data.content,
                videoUrl: data.videoUrl || null,
                courseId: courseId,
                order: (maxOrder?.order || 0) + 1,
            },
        });
    }

    // 3. Get All Courses (Catalog - Summary View)
    async findAll(): Promise<any[]> {
        const courses = await this.prisma.course.findMany({
            include: {
                mentor: {
                    select: {
                        email: true,
                        id: true,
                        name: true,
                        designation: true,
                        avatar: true,
                    }
                },
                modules: true,
                enrollments: {
                    select: {
                        userId: true,
                        user: {
                            select: {
                                email: true,
                                name: true
                            }
                        }
                    }
                },
                ratings: {
                    select: {
                        rating: true,
                    }
                },
                _count: {
                    select: { enrollments: true, ratings: true }
                }
            },
        });

        // Calculate average rating for each course
        return courses.map(course => {
            const averageRating = course.ratings.length > 0
                ? course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length
                : 0;

            return {
                ...course,
                averageRating: Math.round(averageRating * 10) / 10,
            };
        });
    }

    // 4. Get Single Course (Detailed View for Classroom)
    async findOne(id: string): Promise<any> {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    orderBy: { order: 'asc' }
                },
                mentor: {
                    select: {
                        email: true,
                        id: true,
                        name: true,
                        designation: true,
                        avatar: true,
                        bio: true,
                    }
                },
                enrollments: {
                    select: {
                        userId: true,
                        user: {
                            select: {
                                email: true,
                                name: true,
                                avatar: true,
                            }
                        },
                        progress: true,
                        enrolledAt: true,
                        completedAt: true,
                    }
                },
                ratings: {
                    select: {
                        rating: true,
                        review: true,
                        user: {
                            select: {
                                name: true,
                                avatar: true,
                            }
                        },
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                },
                _count: {
                    select: { enrollments: true, ratings: true }
                }
            },
        });

        if (!course) throw new NotFoundException(`Course with ID ${id} not found`);

        // Calculate average rating
        const averageRating = course.ratings.length > 0
            ? course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length
            : 0;

        return {
            ...course,
            averageRating: Math.round(averageRating * 10) / 10,
        };
    }

    // 5. Enroll a Student (Students Only)
    async enroll(userId: string, courseId: string) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        const existing = await this.prisma.enrollment.findFirst({
            where: { userId, courseId },
        });

        if (existing) {
            throw new ConflictException('Student is already enrolled in this course');
        }

        return this.prisma.enrollment.create({
            data: {
                userId,
                courseId,
            },
        });
    }

    // 6. Check if user is enrolled in a course
    async checkEnrollment(userId: string, courseId: string) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: { userId, courseId },
        });

        return {
            isEnrolled: !!enrollment,
            enrollment: enrollment || null,
        };
    }
}