/* tslint:disable */
export interface Caption {
  word: string;
  startTime: number;
  endTime: number;
}
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
export interface Example {
  title: string;
  url: string;
  spec: string;
  summary: string;
  transcript: string;
  captions: Caption[];
  chatHistory?: ChatMessage[];
  component?: string;
}