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
    const { transcription } = await req.json();
    const provider = 'groq';

    if (!transcription) {
      throw new Error('النص المنسوخ مطلوب للتصنيف');
    }

    console.log(`Starting classification for transcription with ${provider}:`, transcription.substring(0, 100) + '...');

    const classificationPrompt = `You are an AI specialized in classifying customer behavior in debt collection conversations.  
You will receive a dialogue between "المحصل" (collector) and "العميل" (customer).  
Based on the conversation, classify the customer into *one of the following types*:

1. عميل متجاوب → Cooperative and ready to pay soon.  
2. عميل واعد → Promises to pay on a specific future date.  
3. عميل مماطل → Delays by asking for unnecessary details or avoiding commitment.  
4. عميل يستخدم التلاعب العاطفي والهجوم → Uses emotions or aggression to manipulate and avoid payment.  
5. عميل من رافض لمتجاوب → Initially rejects but then shows willingness if conditions are met.  
6. عميل غاضب ويتلفظ مسيء → Angry, offensive, or insulting in speech.  
7. عميل رافض → Clearly refuses to pay or rejects based on principles (e.g., religious reasons).  
8. عميل لا يستطيع → Genuinely unable to pay and requests help or discount.  

### Instructions:
- Analyze the full dialogue carefully.  
- Choose *only one category* that best fits the customer.  
- Respond with the category name in Arabic *without explanation*.`;

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: classificationPrompt },
          { role: 'user', content: transcription }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} API error:`, errorText);
      throw new Error(`${provider} API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const classification = data.choices[0].message.content.trim();

    console.log('Classification result:', classification);

    return new Response(JSON.stringify({ 
      success: true,
      classification: classification,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in classify-conversation function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});