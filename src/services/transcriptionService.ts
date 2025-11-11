import { supabase } from "@/integrations/supabase/client";

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
}

export type AIProvider = 'openai' | 'groq';

export const transcribeAudio = async (audioFile: File, provider: AIProvider = 'openai'): Promise<TranscriptionResult> => {
  try {
    console.log('Transcribing audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      lastModified: audioFile.lastModified,
      constructor: audioFile.constructor.name
    });
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('provider', provider);
    
    console.log(`Transcribing with ${provider}...`);
    
    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('transcribe-audio', {
      body: formData,
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message);
    }

    if (!data.success) {
      throw new Error(data.error || 'Transcription failed');
    }

    return {
      success: true,
      text: data.text
    };

  } catch (error) {
    console.error('Transcription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transcription error'
    };
  }
};