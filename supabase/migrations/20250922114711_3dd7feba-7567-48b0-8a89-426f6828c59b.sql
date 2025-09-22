-- Create transcription_results table to store all transcription and classification data
CREATE TABLE public.transcription_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- File information
  file_name TEXT NOT NULL,
  file_size BIGINT,
  audio_duration REAL,
  
  -- Transcription data
  transcription_text TEXT NOT NULL,
  
  -- AI Classification data
  ai_classification TEXT NOT NULL,
  ai_confidence REAL,
  
  -- User feedback
  user_satisfaction TEXT CHECK (user_satisfaction IN ('satisfied', 'not-satisfied')),
  verified_classification TEXT,
  
  -- Processing metadata
  processing_duration REAL,
  token_count INTEGER,
  
  -- Additional metadata
  batch_id TEXT,
  file_id TEXT
);

-- Enable Row Level Security (for future user authentication)
ALTER TABLE public.transcription_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (can be restricted later with user auth)
CREATE POLICY "Allow all operations on transcription_results" 
ON public.transcription_results 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_transcription_results_created_at ON public.transcription_results(created_at DESC);
CREATE INDEX idx_transcription_results_batch_id ON public.transcription_results(batch_id);
CREATE INDEX idx_transcription_results_file_id ON public.transcription_results(file_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transcription_results_updated_at
  BEFORE UPDATE ON public.transcription_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();