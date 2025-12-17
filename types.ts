export interface AnalysisItem {
  type: string;
  issue: string;
  original: string;
  suggestion: string;
  location: string;
}

export interface AssistantResponse {
  generated_text: string;
  analysis: AnalysisItem[];
}

export enum AppMode {
  DRAFTING = 'DRAFTING', // İçerik Üretimi
  ANALYSIS = 'ANALYSIS'  // Metin Analizi
}

export interface AnalysisOption {
  id: string;
  label: string;
  description: string;
  selected: boolean;
}
