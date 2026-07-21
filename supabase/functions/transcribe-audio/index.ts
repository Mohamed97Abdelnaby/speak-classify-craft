import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type AIProvider = 'openai' | 'groq';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing form data...');
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    const provider = 'groq' as AIProvider;
    
    if (!(audioFile instanceof File)) {
      throw new Error('Uploaded file is invalid or missing. Expected File object.');
    }

    console.log(`Processing audio file with ${provider}:`, {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    });

    if (!audioFile.type.startsWith('audio/')) {
      console.warn('File type is not audio:', audioFile.type);
    }

    console.log(`Preparing transcription request for ${provider}...`);
    
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const transcriptionFormData = new FormData();
    transcriptionFormData.append('file', audioFile);
    transcriptionFormData.append('model', 'whisper-large-v3-turbo');
    transcriptionFormData.append('response_format', 'json');

    console.log('Sending request to Groq...');
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: transcriptionFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} API error:`, errorText);
      throw new Error(`${provider} API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Transcription completed successfully');

    return new Response(
      JSON.stringify({ 
        text: result.text,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
