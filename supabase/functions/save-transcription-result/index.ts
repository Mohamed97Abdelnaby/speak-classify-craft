import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    console.log('Save transcription result request:', {
      hasFileInfo: !!requestData.file_name,
      hasTranscription: !!requestData.transcription_text,
      hasClassification: !!requestData.ai_classification,
      operation: requestData.operation || 'create'
    });

    // Handle different operations: create, update_satisfaction, update_verification
    const operation = requestData.operation || 'create';

    if (operation === 'create') {
      // Create new transcription result record
      const { data, error } = await supabase
        .from('transcription_results')
        .insert({
          file_name: requestData.file_name,
          file_size: requestData.file_size,
          audio_duration: requestData.audio_duration,
          transcription_text: requestData.transcription_text,
          summary: requestData.summary,
          ai_classification: requestData.ai_classification,
          ai_confidence: requestData.ai_confidence,
          processing_duration: requestData.processing_duration,
          token_count: requestData.token_count,
          batch_id: requestData.batch_id,
          file_id: requestData.file_id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating transcription result:', error);
        throw error;
      }

      console.log('Created transcription result:', data.id);
      return new Response(JSON.stringify({ 
        success: true, 
        id: data.id,
        message: 'Transcription result saved successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (operation === 'update_satisfaction') {
      // Update existing record with satisfaction feedback
      const { data, error } = await supabase
        .from('transcription_results')
        .update({
          user_satisfaction: requestData.user_satisfaction
        })
        .eq('file_id', requestData.file_id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating satisfaction:', error);
        throw error;
      }

      if (!data) {
        console.error('No record found with file_id:', requestData.file_id);
        throw new Error(`No transcription record found with file_id: ${requestData.file_id}`);
      }

      console.log('Updated satisfaction for file:', requestData.file_id);
      return new Response(JSON.stringify({ 
        success: true, 
        id: data.id,
        message: 'Satisfaction updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (operation === 'update_verification') {
      // Update existing record with verified classification
      const { data, error } = await supabase
        .from('transcription_results')
        .update({
          verified_classification: requestData.verified_classification
        })
        .eq('file_id', requestData.file_id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating verification:', error);
        throw error;
      }

      if (!data) {
        console.error('No record found with file_id:', requestData.file_id);
        throw new Error(`No transcription record found with file_id: ${requestData.file_id}`);
      }

      console.log('Updated verification for file:', requestData.file_id);
      return new Response(JSON.stringify({ 
        success: true, 
        id: data.id,
        message: 'Verification updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (operation === 'update_final_classification') {
      // Update existing record with final classification after satisfaction response
      // First try to find and update existing record
      const { data, error } = await supabase
        .from('transcription_results')
        .update({
          final_classification: requestData.final_classification,
          user_satisfaction: requestData.user_satisfaction
        })
        .eq('file_id', requestData.file_id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating final classification:', error);
        throw error;
      }

      if (!data) {
        // Record doesn't exist, create it with the provided information
        console.log('No existing record found, creating new record for file_id:', requestData.file_id);
        
        const { data: newData, error: createError } = await supabase
          .from('transcription_results')
          .insert({
            file_id: requestData.file_id,
            file_name: requestData.file_id, // Use file_id as fallback for file_name
            transcription_text: 'Text file content processed',
            ai_classification: requestData.final_classification,
            final_classification: requestData.final_classification,
            user_satisfaction: requestData.user_satisfaction,
            batch_id: requestData.batch_id
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating new record:', createError);
          throw createError;
        }

        console.log('Created new record with final classification for file:', requestData.file_id);
        return new Response(JSON.stringify({ 
          success: true, 
          id: newData.id,
          message: 'Final classification record created successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Updated final classification for file:', requestData.file_id);
      return new Response(JSON.stringify({ 
        success: true, 
        id: data.id,
        message: 'Final classification updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error(`Unknown operation: ${operation}`);
    }

  } catch (error) {
    console.error('Error in save-transcription-result function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});