export interface BatchFile {
  id: string;
  name: string;
  file: File;
  category?: string;
  status: 'uploading' | 'transcribing' | 'summarizing' | 'ready_for_review' | 'classifying' | 'completed';
  summary?: string;
  transcription?: string;
  classification?: {
    predicted: string;
    confidence: number;
    verified?: string;
    alternatives?: { category: string; confidence: number }[];
  };
  progress?: number;
}

export interface Batch {
  id: string;
  files: BatchFile[];
  createdAt: Date;
  status: 'uploading' | 'processing' | 'reviewing' | 'completed';
  name?: string;
}

export type ProcessingStep = 'transcribing' | 'summarizing' | 'classifying';