import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserRole } from '@prisma/client';
import { AnalyticsResponseDto } from './dto/analytics.dto';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get real-time platform statistics
     */
    async getStats(): Promise<AnalyticsResponseDto> {
        // Get total users by role
        const [totalStudents, totalMentors, totalAdmins] = await Promise.all([
            this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
            this.prisma.user.count({ where: { role: UserRole.MENTOR } }),
            this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
        ]);

        // Get active courses (published courses)
        const activeCourses = await this.prisma.course.count({
            where: { isPublished: true },
        });

        // Get total enrollments
        const totalEnrollments = await this.prisma.enrollment.count();

        // Get recent enrollments (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentEnrollments = await this.prisma.enrollment.count({
            where: {
                enrolledAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });

        // Calculate completion rate
        const completedEnrollments = await this.prisma.enrollment.count({
            where: {
                completedAt: {
                    not: null,
                },
            },
        });

        const completionRate = totalEnrollments > 0
            ? (completedEnrollments / totalEnrollments) * 100
            : 0;

        // Calculate average progress
        const enrollments = await this.prisma.enrollment.findMany({
            select: { progress: true },
        });

        const averageProgress = enrollments.length > 0
            ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
            : 0;

        // Revenue (placeholder - implement based on your payment system)
        const revenue = 0;

        return {
            totalStudents,
            totalMentors,
            totalAdmins,
            activeCourses,
            totalEnrollments,
            recentEnrollments,
            completionRate: Math.round(completionRate * 100) / 100,
            averageProgress: Math.round(averageProgress * 100) / 100,
            revenue,
        };
    }

    /**
     * Get historical analytics data
     */
    async getAnalytics(startDate?: string, endDate?: string): Promise<any> {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Get user growth over time
        const users = await this.prisma.user.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Group by date
        const userGrowth = this.groupUsersByDate(users);

        // Get course statistics
        const courses = await this.prisma.course.findMany({
            include: {
                enrollments: {
                    select: {
                        progress: true,
                        completedAt: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        const courseStats = courses.map(course => {
            const completedCount = course.enrollments.filter(e => e.completedAt !== null).length;
            const completionRate = course.enrollments.length > 0
                ? (completedCount / course.enrollments.length) * 100
                : 0;

            return {
                courseId: course.id,
                title: course.title,
                enrollments: course._count.enrollments,
                completionRate: Math.round(completionRate * 100) / 100,
            };
        });

        return {
            userGrowth,
            courseStats,
        };
    }

    /**
     * Get all users with pagination
     */
    async getUsers(page: number = 1, limit: number = 20, role?: UserRole) {
        const skip = (page - 1) * limit;

        const where = role ? { role } : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: {
                            enrollments: true,
                            coursesOwned: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Helper function to group users by date
     */
    private groupUsersByDate(users: any[]): any[] {
        const grouped = new Map<string, { students: number; mentors: number }>();

        users.forEach(user => {
            const date = user.createdAt.toISOString().split('T')[0];

            if (!grouped.has(date)) {
                grouped.set(date, { students: 0, mentors: 0 });
            }

            const stats = grouped.get(date)!;
            if (user.role === UserRole.STUDENT) {
                stats.students++;
            } else if (user.role === UserRole.MENTOR) {
                stats.mentors++;
            }
        });

        return Array.from(grouped.entries()).map(([date, stats]) => ({
            date,
            ...stats,
        }));
    }

    /**
     * Save analytics snapshot to database
     */
    async saveAnalyticsSnapshot(): Promise<void> {
        const stats = await this.getStats();

        await this.prisma.analytics.create({
            data: {
                totalStudents: stats.totalStudents,
                totalMentors: stats.totalMentors,
                totalAdmins: stats.totalAdmins,
                activeCourses: stats.activeCourses,
                totalEnrollments: stats.totalEnrollments,
                completionRate: stats.completionRate,
                averageProgress: stats.averageProgress,
                revenue: stats.revenue,
            },
        });
    }
}
