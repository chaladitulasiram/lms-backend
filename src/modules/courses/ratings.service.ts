import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class RatingsService {
    constructor(
        private prisma: PrismaService,
        private certificatesService: CertificatesService
    ) { }

    // Submit a rating for a course (only after completion)
    async rateCourse(userId: string, courseId: string, rating: number, review?: string) {
        // Check if user has completed the course
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (!enrollment) {
            throw new NotFoundException('You are not enrolled in this course');
        }

        if (!enrollment.completedAt) {
            throw new BadRequestException('You must complete the course before rating it');
        }

        // Check if rating already exists
        const existingRating = await this.prisma.courseRating.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (existingRating) {
            // Update existing rating
            return this.prisma.courseRating.update({
                where: {
                    userId_courseId: {
                        userId,
                        courseId,
                    },
                },
                data: {
                    rating,
                    review,
                },
            });
        }

        // Create new rating
        return this.prisma.courseRating.create({
            data: {
                userId,
                courseId,
                rating,
                review,
            },
        });
    }

    // Get course ratings
    async getCourseRatings(courseId: string) {
        const ratings = await this.prisma.courseRating.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate average rating
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalRatings: ratings.length,
            ratings,
        };
    }

    // Check if user can rate a course
    async canRate(userId: string, courseId: string) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        return {
            canRate: enrollment?.completedAt != null,
            hasRated: await this.hasRated(userId, courseId),
            completedAt: enrollment?.completedAt,
        };
    }

    // Check if user has already rated
    async hasRated(userId: string, courseId: string): Promise<boolean> {
        const rating = await this.prisma.courseRating.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        return rating != null;
    }

    // Mark course as completed
    async markCourseComplete(userId: string, courseId: string) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        if (enrollment.completedAt) {
            throw new BadRequestException('Course already marked as completed');
        }

        // Mark as complete
        const updated = await this.prisma.enrollment.update({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            data: {
                completedAt: new Date(),
                progress: 100,
            },
        });

        // Auto-generate certificate
        try {
            await this.certificatesService.generateCertificate(userId, courseId);
        } catch (error) {
            console.error('Failed to generate certificate:', error);
            // Don't fail the completion if certificate generation fails
        }

        return updated;
    }
}
