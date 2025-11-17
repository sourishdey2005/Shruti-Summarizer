import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { articleText } = req.body;

  if (!articleText || typeof articleText !== 'string' || articleText.length < 100) {
    return res.status(400).json({ error: 'A valid article text with at least 100 characters is required.' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error('API_KEY environment variable not set on the server.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Summarize the following news article for a commuter who wants a quick audio briefing. The summary should be concise, easy to understand when spoken aloud, and capture the main points of the article. Focus on clarity and flow. Avoid complex sentences and jargon. Here is the article:\n\n---\n\n${articleText}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const summaryText = response.text;
    if (!summaryText) {
      throw new Error('Received an empty summary from the API.');
    }

    res.status(200).json({ summary: summaryText });
  } catch (error) {
    console.error('Error generating summary with Gemini API:', error);
    res.status(500).json({ error: 'Failed to communicate with the AI model.' });
  }
}
