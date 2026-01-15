import { Module } from '@nestjs/common';
import { AiInsightsService } from './ai-insights.service';
import { AiInsightsController } from './ai-insights.controller';

@Module({
  providers: [AiInsightsService],
  controllers: [AiInsightsController]
})
export class AiInsightsModule {}
