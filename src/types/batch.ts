export interface BatchFile {
  id: string;
  name: string;
  file: File;
  category?: string;
  status: 'uploading' | 'transcribing' | 'summarizing' | 'ready_for_review' | 'classifying' | 'completed';
  transcription?: string;
  summary?: string;
  classification?: {
    predicted: string;
    confidence: number;
    verified?: string;
    aiClassification?: string;
    classificationTimestamp?: string;
  };
}

export interface BatchData {
  id: string;
  files: BatchFile[];
  createdAt: Date;
  status: 'processing' | 'reviewing' | 'completed';
  transcriptionProvider?: 'openai' | 'groq';
  summarizationProvider?: 'openai' | 'groq';
  classificationProvider?: 'openai' | 'groq';
}

export interface EmailRequest {
  to: string;
  subject: string;
  batchId: string;
}