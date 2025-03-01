
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const NEBIUS_API_KEY = Deno.env.get('NEBIUS_API_KEY');

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
    // Ensure API key is set
    if (!NEBIUS_API_KEY) {
      throw new Error('NEBIUS_API_KEY is not set in environment variables');
    }

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      throw new Error('Invalid or missing code in request body');
    }

    // Prepare the system prompt for code debugging
    const systemPrompt = `You are an AI code debugging assistant. You analyze code, identify bugs and issues, 
      and provide corrected versions with explanations. Format your response as valid, runnable code with 
      comments explaining the fixes you made. Do not include markdown formatting in your response.`;

    // Prepare the user prompt with the code
    const userPrompt = `Debug the following code and explain what's wrong with it:
    
    \`\`\`
    ${code}
    \`\`\`
    
    If there are bugs or issues, fix them and explain your fixes. If the code looks correct, 
    confirm it and suggest any best practices or optimizations.`;

    // Make API call to Nebius
    const response = await fetch('https://api.studio.nebius.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEBIUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-Coder-32B-Instruct",
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Nebius API error:', errorData);
      throw new Error(`Nebius API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const debuggedCode = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ debuggedCode }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in debug-code function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
