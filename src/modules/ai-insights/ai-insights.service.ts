import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiInsightsService {
    private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    private apiKey = process.env.GROQ_API_KEY;

    async generateInsight(data: any) {
        const prompt = `
      Analyze this LMS Data:
      - Students: ${data.totalStudents}
      - Active Courses: ${data.activeCourses}
      - Recent Enrollments: ${data.recentEnrollments}
      - Revenue: $${data.revenue}

      Task: Provide 3 strategic insights for the Admin.
      Format: Return ONLY a JSON object with a single key 'insights' which is an array of strings.
    `;

        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    model: 'llama3-8b-8192',
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const content = response.data.choices[0]?.message?.content || '{}';
            return JSON.parse(content);

        } catch (error) {
            console.error("Groq API Error:", error.response?.data || error.message);
            return {
                insights: [
                    "Growth is stable (AI Service Unavailable)",
                    "Check Groq API Key configuration",
                    "Ensure student engagement remains high"
                ],
                source: "System-Fallback"
            };
        }
    }
}