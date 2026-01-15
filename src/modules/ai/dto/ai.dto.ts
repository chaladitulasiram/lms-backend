import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class AnalyzePerformanceDto {
    @IsObject()
    @IsNotEmpty()
    studentData: {
        enrollments: number;
        completedCourses: number;
        averageProgress: number;
        assignmentsSubmitted: number;
        averageScore: number;
    };
}

export class GenerateQuizDto {
    @IsString()
    @IsNotEmpty()
    courseId: string;

    @IsString()
    @IsNotEmpty()
    topic: string;

    @IsOptional()
    @IsString()
    difficulty?: string;

    @IsOptional()
    numberOfQuestions?: number;
}

export class GenerateDocumentDto {
    @IsString()
    @IsNotEmpty()
    type: 'certificate' | 'syllabus' | 'report';

    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsObject()
    @IsOptional()
    data?: any;
}

export class CourseInsightsDto {
    @IsString()
    @IsNotEmpty()
    courseId: string;
}
