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
  user_id: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  razorpay_plan_id: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'pro_plus';
  starts_at: string;
  expires_at: string | null;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  is_active: boolean;
}

export interface DebugUsage {
  id: string;
  user_id: string;
  debug_count: number;
  last_reset_date: string;
  month_start_date: string;
}

export interface SubscriptionInfo {
  subscription: UserSubscription;
  usage: DebugUsage;
  limits: {
    free: { daily: number | null; monthly: number | null };
    pro: { daily: number | null; monthly: number | null };
    pro_plus: { daily: number | null; monthly: number | null };
  };
}

export const debugCode = async (code: string): Promise<DebugResponse> => {
  try {
    // Check if user can debug based on their subscription
    await checkAndUpdateDebugUsage();

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
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('debug_history')
      .insert({
        code,
        result,
        title,
        user_id: user.id  // Add the user_id field
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

// Subscription-related functions
export const getUserSubscription = async (): Promise<SubscriptionInfo> => {
  try {
    const { data, error } = await supabase.functions.invoke('subscription', {
      body: { action: 'get_user_subscription' }
    });

    if (error) throw new Error(error.message);
    
    return data as SubscriptionInfo;
  } catch (error) {
    console.error('Failed to get user subscription:', error);
    throw new Error('Failed to get user subscription details');
  }
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('subscription', {
      body: { action: 'get_plans' }
    });

    if (error) throw new Error(error.message);
    
    return data.plans as SubscriptionPlan[];
  } catch (error) {
    console.error('Failed to get subscription plans:', error);
    throw new Error('Failed to get subscription plans');
  }
};

export const createSubscription = async (planId: string): Promise<{ key: string; subscription: any }> => {
  try {
    console.log('🔄 Creating subscription for plan:', planId);
    const { data, error } = await supabase.functions.invoke('subscription', {
      body: { action: 'create_subscription', planId }
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(error.message);
    }
    
    if (!data || !data.key || !data.subscription) {
      console.error('❌ Invalid response data:', data);
      throw new Error('Invalid response from server');
    }
    
    console.log('✅ Subscription created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to create subscription:', error);
    throw new Error('Failed to create subscription');
  }
};

export const verifySubscription = async (subscriptionId: string): Promise<{ success: boolean; plan: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('subscription', {
      body: { action: 'verify_subscription', subscriptionId }
    });

    if (error) throw new Error(error.message);
    
    return data;
  } catch (error) {
    console.error('Failed to verify subscription:', error);
    throw new Error('Failed to verify subscription');
  }
};

// Helper function to check and update debug usage
export const checkAndUpdateDebugUsage = async (): Promise<boolean> => {
  try {
    // Check if user can debug
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Use the can_debug function to check if user can debug
    const { data, error } = await supabase
      .rpc('can_debug', { user_uuid: user.id });
      
    if (error) throw error;
    
    if (!data) {
      throw new Error('You have reached your debugging limit. Please upgrade your plan for more debug requests.');
    }
    
    // Increment debug count
    await supabase.rpc('increment_debug_count', { user_uuid: user.id });
    
    return true;
  } catch (error) {
    console.error('Debug usage check failed:', error);
    throw error;
  }
};
