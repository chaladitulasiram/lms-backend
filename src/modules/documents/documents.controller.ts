import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express'; // <--- FIX HERE
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('certificate')
    @UseGuards(JwtAuthGuard)
    async downloadCertificate(
        @Body() body: { studentName: string; courseName: string },
        @Res() res: Response
    ) {
        const buffer = await this.documentsService.generateCertificate(body.studentName, body.courseName);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=certificate.pdf`,
            'Content-Length': buffer.length.toString(),
        });

        res.end(buffer);
    }
}