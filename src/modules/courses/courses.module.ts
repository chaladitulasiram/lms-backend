import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaService } from '../../prisma.service'; // <--- Import Shared Service

@Module({
  providers: [CoursesService, PrismaService], // <--- Add PrismaService
  controllers: [CoursesController]
})
export class CoursesModule { }