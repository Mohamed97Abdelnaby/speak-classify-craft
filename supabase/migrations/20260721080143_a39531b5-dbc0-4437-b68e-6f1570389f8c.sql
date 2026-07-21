CREATE TABLE public.transcription_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id TEXT UNIQUE,
  batch_id TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  audio_duration NUMERIC,
  transcription_text TEXT,
  summary TEXT,
  ai_classification TEXT,
  ai_confidence NUMERIC,
  verified_classification TEXT,
  final_classification TEXT,
  user_satisfaction TEXT,
  processing_duration NUMERIC,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.transcription_results TO service_role;

ALTER TABLE public.transcription_results ENABLE ROW LEVEL SECURITY;

-- Table is written only by trusted edge functions using service_role.
-- No client (anon/authenticated) access policies are granted.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_transcription_results_updated_at
BEFORE UPDATE ON public.transcription_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();