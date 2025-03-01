
// API service for code debugging with Nebius AI's Qwen2.5-Coder-32B-Instruct model

import { supabase } from '../integrations/supabase/client';

export interface DebugResponse {
  data: string;
}

export interface DebugHistoryItem {
  id: string;
  code: string;
  result: string;
  created_at: string;
  title: string;
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

export const saveDebugHistory = async (code: string, result: string, title = 'Untitled Debug Session'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('debug_history')
      .insert({
        code,
        result,
        title
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Failed to save debug history:', error);
    throw new Error('Failed to save debug history');
  }
};

export const getDebugHistory = async (): Promise<DebugHistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('debug_history')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as DebugHistoryItem[];
  } catch (error) {
    console.error('Failed to fetch debug history:', error);
    throw new Error('Failed to fetch debug history');
  }
};

export const getDebugHistoryItem = async (id: string): Promise<DebugHistoryItem | null> => {
  try {
    const { data, error } = await supabase
      .from('debug_history')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    
    return data as DebugHistoryItem;
  } catch (error) {
    console.error(`Failed to fetch debug history item with ID ${id}:`, error);
    throw new Error('Failed to fetch debug history item');
  }
};
