import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiProxyService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async processPatientIntake(chatHistory: string[]): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI Patient Intake assistant. Analyze the following conversation history and extract the key symptoms, duration, and patient concerns. Return ONLY a valid JSON object matching this schema: {"symptoms": string[], "duration": string, "concerns": string}. Conversation: ${JSON.stringify(chatHistory)}`,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(response.text);
    } catch (error) {
      throw new InternalServerErrorException('AI Intake failed');
    }
  }

  async recommendNextSteps(intakeData: any): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following intake data, suggest 3 immediate clinical recommendations or triage steps. Data: ${JSON.stringify(intakeData)}. Return ONLY a valid JSON object matching this schema: {"recommendations": string[], "triageLevel": "Low" | "Medium" | "High" | "Critical"}.`,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(response.text);
    } catch (error) {
      throw new InternalServerErrorException('AI Recommendation failed');
    }
  }

  async formatSoapNote(rawNotes: string): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Format the following raw medical notes into a structured SOAP note. Notes: "${rawNotes}". Return ONLY a valid JSON object matching this schema: {"subjective": string, "objective": string, "assessment": string, "plan": string}.`,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(response.text);
    } catch (error) {
      throw new InternalServerErrorException('AI SOAP Formatting failed');
    }
  }

  async predictNoShowRisk(patientData: any): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this patient's profile and appointment history to predict the likelihood of a no-show. Data: ${JSON.stringify(patientData)}. Provide a risk score (0-100) and brief reasoning. Return ONLY a valid JSON object matching this schema: {"riskScore": number, "reasoning": string}.`,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(response.text);
    } catch (error) {
      throw new InternalServerErrorException('AI Risk Prediction failed');
    }
  }
}
