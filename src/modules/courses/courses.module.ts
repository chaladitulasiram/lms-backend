import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { RatingsService } from './ratings.service';
import { CoursesController } from './courses.controller';
import { PrismaService } from '../../prisma.service';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [CertificatesModule],
  providers: [CoursesService, RatingsService, PrismaService],
  controllers: [CoursesController]
})
export class CoursesModule { }