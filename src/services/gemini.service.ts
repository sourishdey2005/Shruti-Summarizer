import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface SummaryResponse {
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly http = inject(HttpClient);

  async generateSummary(articleText: string): Promise<string> {
    if (!articleText) {
      return '';
    }

    try {
      // Call our Vercel serverless function, which acts as a secure proxy.
      const response = await firstValueFrom(
        this.http.post<SummaryResponse>('/api/summarize', { articleText })
      );

      if (!response?.summary) {
        throw new Error('Received an invalid summary from the server.');
      }
      return response.summary;
    } catch (error) {
      console.error('Error fetching summary from backend:', error);
      // Let the component know something went wrong.
      throw new Error('Failed to communicate with the summarization service.');
    }
  }
}
