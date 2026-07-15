import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiProxyService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && !apiKey.startsWith('AIza') && !apiKey.startsWith('AQ.')) {
      throw new Error('Invalid API Key format: Key must start with "AIza" or "AQ."');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  private async executePrompt(contents: string, expectJson: boolean): Promise<any> {
    const groqApiKey = this.configService.get<string>('GROQ_API_KEY');
    if (groqApiKey) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'user', content: contents }
            ],
            response_format: expectJson ? { type: 'json_object' } : undefined
          })
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Status ${res.status}: ${errText}`);
        }
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '{}';
        return JSON.parse(text);
      } catch (error) {
        console.error('Groq Execution Error:', error);
        throw error;
      }
    }

    // Default Gemini path
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: expectJson ? { responseMimeType: 'application/json' } : undefined,
    });
    return JSON.parse(response.text || '{}');
  }

  async processPatientIntake(chatHistory: any[]): Promise<any> {
    try {
      return await this.executePrompt(
        `You are an AI Patient Intake assistant. Guide the patient through a structured intake flow to collect:
1. Chief complaint
2. Symptom duration
3. Severity (on a scale of 1-10)
4. Relevant medical history
5. Current medications

Analyze the conversation history. If you have gathered sufficient details for all 5 points, return a JSON response signaling completion and providing the summary:
{
  "complete": true,
  "summary": {
    "chiefComplaint": "string",
    "duration": "string",
    "severity": number,
    "history": "string",
    "medications": "string"
  }
}

If any details are still missing, ask for the missing fields politely and clearly. Return a JSON response signaling non-completion and providing the follow-up question:
{
  "complete": false,
  "nextQuestion": "string"
}

Do not include any extra text outside the JSON.
Conversation history: ${JSON.stringify(chatHistory)}`,
        true
      );
    } catch (error) {
      console.error('AI Intake Error:', error);
      throw new InternalServerErrorException('AI Intake failed');
    }
  }

  async recommendNextSteps(intakeData: any): Promise<any> {
    try {
      return await this.executePrompt(
        `Based on the following intake data: ${JSON.stringify(intakeData)}, suggest clinical recommendations/triage steps and recommend the medical specialty. Return ONLY a valid JSON object matching this schema: {"recommendations": string[], "triageLevel": "Low" | "Medium" | "High" | "Critical", "recommendedSpecialty": "General Practice" | "Cardiology" | "Dermatology" | "Orthopedics", "rationale": string, "confidence": "High" | "Medium" | "Low"}.`,
        true
      );
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      throw new InternalServerErrorException('AI Recommendation failed');
    }
  }

  async formatSoapNote(rawNotes: string): Promise<any> {
    try {
      return await this.executePrompt(
        `Format the following raw medical notes into a structured SOAP note. Notes: "${rawNotes}". Return ONLY a valid JSON object matching this schema: {"subjective": string, "objective": string, "assessment": string, "plan": string}.`,
        true
      );
    } catch (error) {
      console.error('AI SOAP Note Formatter Error:', error);
      throw new InternalServerErrorException('AI SOAP Formatting failed');
    }
  }

  async predictNoShowRisk(patientData: any): Promise<any> {
    try {
      return await this.executePrompt(
        `Analyze this patient's profile and appointment history to predict the likelihood of a no-show. Data: ${JSON.stringify(patientData)}. Provide a risk score (0-100) and brief reasoning. Return ONLY a valid JSON object matching this schema: {"riskScore": number, "reasoning": string}.`,
        true
      );
    } catch (error) {
      console.error('AI No-Show Risk Predictor Error:', error);
      throw new InternalServerErrorException('AI Risk Prediction failed');
    }
  }
}
