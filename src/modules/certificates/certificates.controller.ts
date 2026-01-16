import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('certificates')
export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) { }

    // Generate certificate (called after course completion)
    @Post('generate/:courseId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    async generateCertificate(
        @Request() req,
        @Param('courseId') courseId: string
    ) {
        return this.certificatesService.generateCertificate(req.user.userId, courseId);
    }

    // Get certificate by ID
    @Get(':id')
    async getCertificate(@Param('id') id: string) {
        return this.certificatesService.getCertificate(id);
    }

    // Get certificate by number (for verification)
    @Get('verify/:certificateNumber')
    async verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
        return this.certificatesService.verifyCertificate(certificateNumber);
    }

    // Get student's certificates
    @Get('student/my-certificates')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('STUDENT')
    async getStudentCertificates(@Request() req) {
        return this.certificatesService.getStudentCertificates(req.user.userId);
    }

    // Get course certificates (Mentor/Admin)
    @Get('course/:courseId')
    @UseGuards(JwtAuthGuard)
    async getCourseCertificates(@Param('courseId') courseId: string) {
        return this.certificatesService.getCourseCertificates(courseId);
    }
}
