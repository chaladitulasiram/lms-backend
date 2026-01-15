import { IsOptional, IsDateString } from 'class-validator';

export class GetAnalyticsDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class AnalyticsResponseDto {
    totalStudents: number;
    totalMentors: number;
    totalAdmins: number;
    activeCourses: number;
    totalEnrollments: number;
    recentEnrollments: number;
    completionRate: number;
    averageProgress: number;
    revenue: number;
    userGrowth?: {
        date: string;
        students: number;
        mentors: number;
    }[];
    courseStats?: {
        courseId: string;
        title: string;
        enrollments: number;
        completionRate: number;
    }[];
}
