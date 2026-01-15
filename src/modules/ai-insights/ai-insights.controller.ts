import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AiInsightsService } from './ai-insights.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ai-insights')
export class AiInsightsController {
    constructor(private readonly aiService: AiInsightsService) { }

    @Post('analyze')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN') // Strict RBAC: Only Admins can trigger AI analysis
    async analyzePlatform(@Body() dashboardStats: any) {
        return this.aiService.generateInsight(dashboardStats);
    }
}