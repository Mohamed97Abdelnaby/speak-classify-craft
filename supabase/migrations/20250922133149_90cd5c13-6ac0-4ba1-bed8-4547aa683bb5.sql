-- Add final_classification column to transcription_results table
ALTER TABLE public.transcription_results 
ADD COLUMN final_classification text;