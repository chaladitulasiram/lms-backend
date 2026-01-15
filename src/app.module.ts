import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AiInsightsModule } from './modules/ai-insights/ai-insights.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { RedisModule } from './redis/redis.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    AiInsightsModule,
    DocumentsModule,
    AdminModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
  ],
  exports: [PrismaService],
})
export class AppModule { }