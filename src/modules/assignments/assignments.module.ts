import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { PrismaService } from '../../prisma.service';

@Module({
    providers: [AssignmentsService, PrismaService],
    controllers: [AssignmentsController],
    exports: [AssignmentsService],
})
export class AssignmentsModule { }
