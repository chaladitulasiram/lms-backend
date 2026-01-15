import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, Course, Module as CourseModule } from '@prisma/client';

@Injectable()
export class CoursesService {
    private prisma = new PrismaClient();

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
    async addModule(courseId: string, data: { title: string; content: string }): Promise<CourseModule> {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        return this.prisma.module.create({
            data: {
                ...data,
                courseId: courseId,
            },
        });
    }

    // 3. Get All Courses (Catalog - Summary View)
    async findAll(): Promise<Course[]> {
        return this.prisma.course.findMany({
            include: {
                mentor: { select: { email: true, id: true } },
                modules: true
            },
        });
    }

    // 4. Get Single Course (Detailed View for Classroom)
    async findOne(id: string): Promise<Course | null> {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    orderBy: { title: 'asc' } // Optional: Sort modules if needed
                },
                mentor: {
                    select: { email: true, id: true }
                }
            },
        });

        if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
        return course;
    }

    // 5. Enroll a Student (Students Only)
    async enroll(userId: string, courseId: string) {
        // Check if course exists
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        // Check if already enrolled
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
}