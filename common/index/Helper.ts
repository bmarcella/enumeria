import { CodeText } from './extractCode';
export const  random = (min: number, max: number)  =>  { 
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export type AIOrigin = "user" | "system" | "assistant";
export type AIState = "sent" | "received" | "error";
export type AIType = "spinner" | "text" | "image" | "video" | "audio" | "file" | "location" | "contact" | "sticker" | "gif" | "voice" | "document" | "system" | "code";
export type AISender = "me" | "ai";
export type ModeMessage = "textsimple" | "textcode";

export type chatAiUi = {
  id :  string,
  model : string,
  object: string,
  service_tier: string,
  system_fingerprint: string,
}
export interface AIMessageText {
  role: AIOrigin ,
  content: string;
  tool_calls?: []
  tool_call_id?: string;
  chat? : chatAiUi,
}

export interface ChatMessage{
   sender: AISender,
   origin?: AIOrigin ,
   mode : ModeMessage,
   message:  CodeText []; 
   state: AIState;
   type: AIType
}