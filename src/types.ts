export type VoiceName = "Charon" | "Puck" | "Fenrir";

export interface VoiceOption {
  name: VoiceName;
  label: string;
  description: string;
  accent: string;
  vibe: string;
}

export interface SpeechHistoryItem {
  id: string;
  text: string;
  voiceName: VoiceName;
  date: string;
  audioBase64: string; // Storing the base64 audio data for local replay/download
  rate: number;
  pitch: number;
  volume: number;
}

export interface AppSettings {
  selectedVoice: VoiceName;
  theme: "dark" | "light";
  rate: number;
  pitch: number;
  volume: number;
}
