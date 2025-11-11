import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { transcription, provider = 'openai' } = await req.json();
    
    if (!transcription) {
      throw new Error('No transcription text provided');
    }

    console.log(`Starting summarization for transcription with ${provider}:`, transcription.substring(0, 100) + '...');

    const systemPrompt = `لخّص المحادثة التالية في شكل حوار قصير ومباشر بين المحصل والعميل فقط، 
مع المحافظة على الأسلوب البسيط واللغة العامية المستخدمة. 
استخدم التنسيق التالي:

المحصل:
[جملة أو جملتين تلخص كلام المحصل]

العميل:
[جملة أو جملتين تلخص كلام العميل]

المحادثة:
[ضع هنا نص المحادثة الأصلي]`;

    let response: Response;
    
    if (provider === 'groq') {
      const groqApiKey = Deno.env.get('GROQ_API_KEY');
      if (!groqApiKey) {
        throw new Error('Groq API key not configured');
      }

      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: transcription }
          ],
          max_tokens: 1000,
        }),
      });
    } else {
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAIApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: transcription }
          ],
          max_completion_tokens: 1000,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} API error:`, errorText);
      throw new Error(`${provider} API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    console.log('Summarization result:', summary);

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in summarize-conversation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});