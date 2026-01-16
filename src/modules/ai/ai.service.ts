import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private groq: Groq;
    private readonly model: string;
    private readonly cacheEnabled: boolean;

    constructor(
        private configService: ConfigService,
        private redisService: RedisService,
    ) {
        // Initialize Groq client
        const apiKey = this.configService.get('GROQ_API_KEY');

        if (!apiKey) {
            this.logger.warn('GROQ_API_KEY not found. AI features will be disabled.');
        }

        this.groq = new Groq({
            apiKey: apiKey,
        });

        // Use Groq's fast model
        this.model = 'llama-3.3-70b-versatile';
        this.cacheEnabled = this.configService.get('AI_CACHE_ENABLED', 'true') === 'true';

        this.logger.log(`AI Service initialized with Groq model: ${this.model}`);
    }

    /**
     * Analyze student performance and provide insights
     */
    async analyzePerformance(studentData: any): Promise<string> {
        const cacheKey = `ai:performance:${JSON.stringify(studentData)}`;

        // Check cache
        if (this.cacheEnabled) {
            const cached = await this.redisService.get(cacheKey);
            if (cached) {
                this.logger.log('Returning cached performance analysis');
                return cached;
            }
        }

        const prompt = `You are an educational AI assistant analyzing student performance data.

Student Performance Data:
- Total Enrollments: ${studentData.enrollments}
- Completed Courses: ${studentData.completedCourses}
- Average Progress: ${studentData.averageProgress}%
- Assignments Submitted: ${studentData.assignmentsSubmitted}
- Average Score: ${studentData.averageScore}%

Provide a concise, actionable analysis (max 200 words) covering:
1. Overall performance assessment
2. Strengths and areas for improvement
3. Specific recommendations for the student
4. Suggested next steps

Format your response in a friendly, encouraging tone.`;

        try {
            const response = await this.generateCompletion(prompt);

            // Cache for 1 hour
            if (this.cacheEnabled) {
                await this.redisService.set(cacheKey, response, 3600);
            }

            return response;
        } catch (error) {
            this.logger.error('Error analyzing performance:', error);
            return 'Unable to generate performance analysis at this time. Please ensure your Groq API key is valid.';
        }
    }

    /**
     * Generate course improvement insights
     */
    async generateCourseInsights(courseData: any): Promise<string> {
        const prompt = `You are an educational AI assistant analyzing course performance.

Course Data:
- Title: ${courseData.title}
- Total Enrollments: ${courseData.enrollments}
- Completion Rate: ${courseData.completionRate}%
- Average Student Progress: ${courseData.averageProgress}%
- Number of Modules: ${courseData.moduleCount}

Provide actionable insights (max 200 words) for the course instructor:
1. What's working well
2. Areas that need improvement
3. Specific recommendations to increase engagement and completion
4. Suggestions for content enhancement

Be specific and data-driven.`;

        try {
            return await this.generateCompletion(prompt);
        } catch (error) {
            this.logger.error('Error generating course insights:', error);
            return 'Unable to generate course insights at this time.';
        }
    }

    /**
     * Generate quiz questions based on topic
     */
    async generateQuiz(topic: string, difficulty: string = 'medium', count: number = 5): Promise<any> {
        const prompt = `Generate ${count} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY a valid JSON array with this exact structure (no additional text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]

Make questions educational, clear, and appropriate for the difficulty level.`;

        try {
            const response = await this.generateCompletion(prompt);

            // Try to parse JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Invalid JSON response from AI');
        } catch (error) {
            this.logger.error('Error generating quiz:', error);
            return [];
        }
    }

    /**
     * Generate structured data for document templates
     */
    async generateDocumentData(type: string, prompt: string, context: any): Promise<any> {
        let systemPrompt = '';

        switch (type) {
            case 'certificate':
                systemPrompt = `Generate certificate data in JSON format:
{
  "studentName": "string",
  "courseName": "string",
  "completionDate": "YYYY-MM-DD",
  "grade": "string",
  "instructor": "string",
  "certificateNumber": "string"
}

Context: ${JSON.stringify(context)}
User Request: ${prompt}

Return ONLY valid JSON, no additional text.`;
                break;

            case 'syllabus':
                systemPrompt = `Generate course syllabus data in JSON format:
{
  "courseTitle": "string",
  "instructor": "string",
  "duration": "string",
  "description": "string",
  "objectives": ["string"],
  "topics": [{"week": number, "title": "string", "content": "string"}],
  "assessments": ["string"],
  "resources": ["string"]
}

User Request: ${prompt}

Return ONLY valid JSON, no additional text.`;
                break;

            case 'report':
                systemPrompt = `Generate performance report data in JSON format:
{
  "studentName": "string",
  "reportPeriod": "string",
  "coursesCompleted": number,
  "averageScore": number,
  "strengths": ["string"],
  "improvements": ["string"],
  "recommendations": ["string"]
}

Context: ${JSON.stringify(context)}
User Request: ${prompt}

Return ONLY valid JSON, no additional text.`;
                break;
        }

        try {
            const response = await this.generateCompletion(systemPrompt);

            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Invalid JSON response from AI');
        } catch (error) {
            this.logger.error('Error generating document data:', error);
            return null;
        }
    }

    /**
     * Generate personalized learning recommendations
     */
    async generateLearningPath(studentProfile: any): Promise<string> {
        const prompt = `You are an educational AI creating personalized learning recommendations.

Student Profile:
- Completed Courses: ${studentProfile.completedCourses?.join(', ') || 'None'}
- Interests: ${studentProfile.interests?.join(', ') || 'Not specified'}
- Skill Level: ${studentProfile.skillLevel || 'Beginner'}
- Learning Goals: ${studentProfile.goals || 'Not specified'}
- Available Time: ${studentProfile.availableTime || 'Not specified'}

Recommend 3-5 courses or learning paths that would be most beneficial. For each recommendation:
1. Course/topic name
2. Why it's recommended
3. Expected time commitment
4. Prerequisites (if any)

Keep it concise and actionable (max 250 words).`;

        try {
            return await this.generateCompletion(prompt);
        } catch (error) {
            this.logger.error('Error generating learning path:', error);
            return 'Unable to generate personalized recommendations at this time.';
        }
    }

    /**
     * Core method to generate completions using Groq
     */
    private async generateCompletion(prompt: string): Promise<string> {
        try {
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 1024,
            });

            return chatCompletion.choices[0]?.message?.content || 'No response generated';
        } catch (error) {
            this.logger.error('Groq API error:', error);

            // Provide helpful error messages
            if (error.status === 401) {
                throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY in .env file.');
            } else if (error.status === 429) {
                throw new Error('Groq API rate limit exceeded. Please try again later.');
            }

            throw new Error('AI service is currently unavailable. Please try again later.');
        }
    }

    /**
     * Check if AI service is available
     */
    async healthCheck(): Promise<boolean> {
        try {
            // Test with a simple completion
            await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: 'test' }],
                model: this.model,
                max_tokens: 5,
            });
            return true;
        } catch (error) {
            this.logger.error('AI service health check failed:', error);
            return false;
        }
    }
}
