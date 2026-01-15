import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class DocumentsService {

    async generateCertificate(studentName: string, courseName: string): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- PDF Design ---

            // 1. Border
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#1E3A8A'); // Blue Border

            // 2. Header
            doc.font('Helvetica-Bold').fontSize(40).fillColor('#1E3A8A').text('CERTIFICATE', 0, 100, { align: 'center' });
            doc.fontSize(20).fillColor('black').text('OF COMPLETION', 0, 150, { align: 'center' });

            // 3. Body
            doc.moveDown();
            doc.fontSize(15).text('This is to certify that', { align: 'center' });

            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(30).fillColor('#D97706').text(studentName, { align: 'center' }); // Student Name

            doc.moveDown();
            doc.font('Helvetica').fontSize(15).fillColor('black').text('has successfully completed the course', { align: 'center' });

            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(25).text(courseName, { align: 'center' }); // Course Name

            // 4. Footer
            const date = new Date().toLocaleDateString();
            doc.fontSize(12).text(`Date: ${date}`, 100, 500);
            doc.text('Authorized Signature', 600, 500);
            doc.moveTo(600, 490).lineTo(750, 490).stroke();

            doc.end();
        });
    }
}