import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AiInsightsModule } from './modules/ai-insights/ai-insights.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [UsersModule, AuthModule, CoursesModule, AiInsightsModule, DocumentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
