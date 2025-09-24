-- Clean up duplicate transcription_results records
-- Keep only the most recent record for each file_id
WITH duplicates AS (
  SELECT id, file_id,
         ROW_NUMBER() OVER (PARTITION BY file_id ORDER BY created_at DESC) as rn
  FROM transcription_results
  WHERE file_id IS NOT NULL
)
DELETE FROM transcription_results 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add a unique constraint to prevent future duplicates
ALTER TABLE transcription_results 
ADD CONSTRAINT transcription_results_file_id_unique UNIQUE (file_id);