
import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: This relies on `process.env.API_KEY` being set in the execution environment.
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateSummary(articleText: string): Promise<string> {
    if (!articleText) {
      return '';
    }

    try {
      const prompt = `Summarize the following news article for a commuter who wants a quick audio briefing. The summary should be concise, easy to understand when spoken aloud, and capture the main points of the article. Focus on clarity and flow. Avoid complex sentences and jargon. Here is the article:\n\n---\n\n${articleText}`;

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const summaryText = response.text;
      if (!summaryText) {
        throw new Error('Received an empty summary from the API.');
      }
      return summaryText;
    } catch (error) {
      console.error('Error generating summary with Gemini API:', error);
      // Re-throw the error to be handled by the component
      throw new Error('Failed to communicate with the AI model.');
    }
  }
}
