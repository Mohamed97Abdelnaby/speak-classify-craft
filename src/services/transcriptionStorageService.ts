import { supabase } from "@/integrations/supabase/client";
import { BatchFile } from "@/types/batch";

export interface SaveTranscriptionRequest {
  file_name: string;
  file_size?: number;  
  audio_duration?: number;
  transcription_text: string;
  summary?: string;
  ai_classification: string;
  ai_confidence?: number;
  processing_duration?: number;
  token_count?: number;
  batch_id?: string;
  file_id: string;
}

export interface SaveTranscriptionResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Save initial transcription and classification results to database
 */
export const saveTranscriptionResult = async (data: SaveTranscriptionRequest): Promise<SaveTranscriptionResult> => {
  try {
    console.log('Saving transcription result to database:', {
      fileName: data.file_name,
      fileId: data.file_id,
      hasTranscription: !!data.transcription_text,
      hasClassification: !!data.ai_classification
    });

    const { data: result, error } = await supabase.functions.invoke('save-transcription-result', {
      body: {
        operation: 'create',
        ...data
      }
    });

    if (error) {
      console.error('Supabase function invoke error:', {
        message: error.message,
        details: error,
        requestData: data
      });
      return {
        success: false,
        error: error.message || 'Failed to save transcription result'
      };
    }

    if (!result) {
      console.error('No result returned from function');
      return {
        success: false,
        error: 'No response from server'
      };
    }

    if (!result.success) {
      console.error('Function returned error:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to save transcription result'
      };
    }

    console.log('Transcription result saved successfully:', result.id);
    return {
      success: true,
      id: result.id
    };

  } catch (error) {
    console.error('Error calling save transcription service:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestData: data
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Save transcription results for a batch of files
 */
export const saveBatchTranscriptionResults = async (files: BatchFile[], batchId: string): Promise<SaveTranscriptionResult[]> => {
  const results: SaveTranscriptionResult[] = [];
  
  for (const file of files) {
    if (file.transcription && file.classification) {
      const saveRequest: SaveTranscriptionRequest = {
        file_name: file.name,
        file_size: file.file.size,
        transcription_text: file.transcription,
        summary: file.summary,
        ai_classification: file.classification.aiClassification || file.classification.predicted,
        ai_confidence: file.classification.confidence,
        batch_id: batchId,
        file_id: file.id
      };

      const result = await saveTranscriptionResult(saveRequest);
      results.push(result);

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
};

/**
 * Update satisfaction response for a specific file
 */
export const updateSatisfactionResponse = async (fileId: string, satisfaction: 'satisfied' | 'not-satisfied'): Promise<SaveTranscriptionResult> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('save-transcription-result', {
      body: {
        operation: 'update_satisfaction',
        file_id: fileId,
        user_satisfaction: satisfaction
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to update satisfaction'
      };
    }

    return {
      success: true,
      id: result.id
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Update verified classification for a specific file
 */
export const updateVerifiedClassification = async (fileId: string, verifiedClassification: string): Promise<SaveTranscriptionResult> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('save-transcription-result', {
      body: {
        operation: 'update_verification',
        file_id: fileId,
        verified_classification: verifiedClassification
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to update verification'
      };
    }

    return {
      success: true,
      id: result.id
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Update final classification after user satisfaction response
 */
export const updateFinalClassification = async (
  fileId: string, 
  finalClassification: string, 
  userSatisfaction: 'satisfied' | 'not-satisfied'
): Promise<SaveTranscriptionResult> => {
  try {
    const { data: result, error } = await supabase.functions.invoke('save-transcription-result', {
      body: { 
        operation: 'update_final_classification',
        file_id: fileId,
        final_classification: finalClassification,
        user_satisfaction: userSatisfaction
      }
    });

    if (error) {
      console.error('Error updating final classification:', error);
      return {
        success: false,
        error: error.message || 'Failed to update final classification'
      };
    }

    console.log('Successfully updated final classification for file:', fileId);
    return {
      success: true,
      id: result.id
    };

  } catch (error) {
    console.error('Failed to update final classification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};