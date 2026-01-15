import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyzePerformanceDto, GenerateQuizDto, GenerateDocumentDto, CourseInsightsDto } from './dto/ai.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    /**
     * POST /ai/analyze-performance
     * Analyze student performance and provide insights
     */
    @Post('analyze-performance')
    async analyzePerformance(@Body() dto: AnalyzePerformanceDto) {
        const insights = await this.aiService.analyzePerformance(dto.studentData);
        return { insights };
    }

    /**
     * POST /ai/course-insights
     * Generate course improvement insights
     */
    @Post('course-insights')
    async getCourseInsights(@Body() dto: CourseInsightsDto) {
        // In a real implementation, fetch course data from database
        const courseData = {
            title: 'Sample Course',
            enrollments: 100,
            completionRate: 75,
            averageProgress: 60,
            moduleCount: 10,
        };

        const insights = await this.aiService.generateCourseInsights(courseData);
        return { insights };
    }

    /**
     * POST /ai/generate-quiz
     * Generate quiz questions using AI
     */
    @Post('generate-quiz')
    async generateQuiz(@Body() dto: GenerateQuizDto) {
        const questions = await this.aiService.generateQuiz(
            dto.topic,
            dto.difficulty || 'medium',
            dto.numberOfQuestions || 5,
        );

        return { questions };
    }

    /**
     * POST /ai/generate-document-data
     * Generate structured data for document templates
     */
    @Post('generate-document-data')
    async generateDocumentData(@Body() dto: GenerateDocumentDto) {
        const data = await this.aiService.generateDocumentData(
            dto.type,
            dto.prompt,
            dto.data || {},
        );

        return { data };
    }

    /**
     * POST /ai/learning-path
     * Generate personalized learning recommendations
     */
    @Post('learning-path')
    async generateLearningPath(@Body() studentProfile: any) {
        const recommendations = await this.aiService.generateLearningPath(studentProfile);
        return { recommendations };
    }

    /**
     * GET /ai/health
     * Check AI service health
     */
    @Get('health')
    async healthCheck() {
        const isHealthy = await this.aiService.healthCheck();
        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            model: process.env.AI_MODEL || 'qwen2.5:latest',
        };
    }
}
