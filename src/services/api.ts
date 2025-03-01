// API service for code debugging with Nebius AI's Qwen2.5-Coder-32B-Instruct model

import { supabase } from '../integrations/supabase/client';

export interface DebugResponse {
  data: string;
}

export const debugCode = async (code: string): Promise<DebugResponse> => {
  try {
    // Call our Supabase Edge Function to debug the code
    // This keeps our API key secure on the server side
    const { data, error } = await supabase.functions.invoke('debug-code', {
      body: { code }
    });

    if (error) throw new Error(error.message);

    return { data: data.debuggedCode };
  } catch (error) {
    console.error('Failed to debug code:', error);
    throw new Error('Failed to debug code. Please check your API key and try again.');
  }
};
