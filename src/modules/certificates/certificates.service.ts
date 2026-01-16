import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Certificate } from '@prisma/client';

@Injectable()
export class CertificatesService {
    constructor(private prisma: PrismaService) { }

    // Generate certificate number
    private generateCertificateNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `CERT-${timestamp}-${random}`;
    }

    // Auto-generate certificate when course is completed
    async generateCertificate(userId: string, courseId: string): Promise<Certificate> {
        // Check if enrollment exists and is completed
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            include: {
                course: {
                    include: {
                        mentor: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        if (!enrollment.completedAt) {
            throw new Error('Course must be completed before generating certificate');
        }

        // Check if certificate already exists
        const existing = await this.prisma.certificate.findUnique({
            where: {
                studentId_courseId: {
                    studentId: userId,
                    courseId,
                },
            },
        });

        if (existing) {
            return existing;
        }

        // Generate certificate
        const certificateNumber = this.generateCertificateNumber();

        // In a real application, you would generate a PDF here
        // For now, we'll create a URL placeholder
        const certificateUrl = `/certificates/${certificateNumber}.pdf`;

        return this.prisma.certificate.create({
            data: {
                studentId: userId,
                courseId,
                certificateNumber,
                certificateUrl,
            },
        });
    }

    // Get certificate by ID
    async getCertificate(id: string): Promise<Certificate> {
        const certificate = await this.prisma.certificate.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                        description: true,
                        mentor: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!certificate) {
            throw new NotFoundException('Certificate not found');
        }

        return certificate;
    }

    // Get certificate by number
    async getCertificateByNumber(certificateNumber: string): Promise<Certificate> {
        const certificate = await this.prisma.certificate.findUnique({
            where: { certificateNumber },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                        description: true,
                        mentor: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!certificate) {
            throw new NotFoundException('Certificate not found');
        }

        return certificate;
    }

    // Get all certificates for a student
    async getStudentCertificates(studentId: string): Promise<Certificate[]> {
        return this.prisma.certificate.findMany({
            where: { studentId },
            include: {
                course: {
                    select: {
                        title: true,
                        description: true,
                        thumbnail: true,
                    },
                },
            },
            orderBy: { issuedAt: 'desc' },
        });
    }

    // Get all certificates for a course
    async getCourseCertificates(courseId: string): Promise<Certificate[]> {
        return this.prisma.certificate.findMany({
            where: { courseId },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { issuedAt: 'desc' },
        });
    }

    // Verify certificate
    async verifyCertificate(certificateNumber: string): Promise<{
        valid: boolean;
        certificate?: Certificate;
    }> {
        try {
            const certificate = await this.getCertificateByNumber(certificateNumber);
            return {
                valid: true,
                certificate,
            };
        } catch (error) {
            return {
                valid: false,
            };
        }
    }
}
