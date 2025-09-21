/* tslint:disable */
import { FinishReason, GoogleGenAI, Part } from '@google/genai';

export async function generateText(options: { modelName: string; prompt: string; videoUrl?: string; temperature?: number; }): Promise<string> {
  const {modelName, prompt, videoUrl, temperature = 0.75} = options;
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) throw new Error('API key is missing or empty.');
  const ai = new GoogleGenAI({apiKey: API_KEY});
  const parts: Part[] = [{text: prompt}];
  if (videoUrl) parts.push({fileData: {mimeType: 'video/mp4', fileUri: videoUrl}});
  
  const res = await ai.models.generateContent({ model: modelName, contents: {parts}, config: {temperature} });
  
  if (res.promptFeedback?.blockReason) {
    throw new Error(`Prompt blocked: ${res.promptFeedback.blockReason}`);
  }
  
  const cand = res.candidates?.[0];
  if (!cand || (cand.finishReason && cand.finishReason !== FinishReason.STOP)) {
    throw new Error(`Generation failed: ${cand?.finishReason || 'No content'}`);
  }
  
  return res.text;
}