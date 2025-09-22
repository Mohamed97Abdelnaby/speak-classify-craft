-- Add summary column to transcription_results table
ALTER TABLE public.transcription_results 
ADD COLUMN summary TEXT;