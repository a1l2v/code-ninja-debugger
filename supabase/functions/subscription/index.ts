
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RazorpayCustomer {
  id: string;
  name: string;
  email: string;
  contact?: string;
}

interface RazorpaySubscription {
  id: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start: number;
  current_end: number;
  created_at: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  razorpay_plan_id: string;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Razorpay configurations
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || ''
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || ''
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1'

// Subscription plan details
const subscriptionPlans: Record<string, SubscriptionPlan> = {
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    amount: 99900, // 999 INR in paise
    currency: 'INR',
    description: 'Up to 200 debugs per month',
    razorpay_plan_id: '' // Set this up in the Razorpay Dashboard and add it here
  },
  pro_plus: {
    id: 'pro_plus',
    name: 'Pro Plus Plan',
    amount: 149900, // 1499 INR in paise
    currency: 'INR',
    description: 'Unlimited debugs',
    razorpay_plan_id: '' // Set this up in the Razorpay Dashboard and add it here
  }
}

// Helper functions to interact with Razorpay
async function createRazorpayCustomer(name: string, email: string): Promise<RazorpayCustomer> {
  const response = await fetch(`${RAZORPAY_API_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
    },
    body: JSON.stringify({ name, email })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create customer: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

async function createRazorpaySubscription(
  planId: string, 
  customerId: string, 
  totalCount: number = 12 // Default subscription period in months
): Promise<RazorpaySubscription> {
  const response = await fetch(`${RAZORPAY_API_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
    },
    body: JSON.stringify({
      plan_id: planId,
      customer_id: customerId,
      total_count: totalCount,
      quantity: 1
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create subscription: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

async function getRazorpaySubscription(subscriptionId: string): Promise<RazorpaySubscription> {
  const response = await fetch(`${RAZORPAY_API_URL}/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get subscription: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  const { action } = body;

  // Get the user from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  // Handle different actions
  try {
    if (action === 'get_plans') {
      return new Response(
        JSON.stringify({ plans: Object.values(subscriptionPlans) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    else if (action === 'create_subscription') {
      const { planId } = body;
      const plan = subscriptionPlans[planId];
      
      if (!plan) {
        return new Response(JSON.stringify({ error: 'Invalid plan' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Get user details
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (userError) {
        throw new Error(`Failed to get user details: ${userError.message}`);
      }

      // Create or get Razorpay customer
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('razorpay_customer_id')
        .eq('user_id', user.id)
        .single();

      let customerId;

      if (subscription?.razorpay_customer_id) {
        customerId = subscription.razorpay_customer_id;
      } else {
        // Create new customer in Razorpay
        const customer = await createRazorpayCustomer(
          userData.username || user.email || 'User',
          user.email || ''
        );
        customerId = customer.id;
        
        // Update user record with customer ID
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({ razorpay_customer_id: customerId })
          .eq('user_id', user.id);
          
        if (updateError) {
          throw new Error(`Failed to update customer ID: ${updateError.message}`);
        }
      }

      // Create subscription in Razorpay
      const razorpaySubscription = await createRazorpaySubscription(
        plan.razorpay_plan_id,
        customerId
      );

      return new Response(
        JSON.stringify({ 
          key: RAZORPAY_KEY_ID,
          subscription: razorpaySubscription
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    else if (action === 'verify_subscription') {
      const { subscriptionId } = body;
      
      if (!subscriptionId) {
        return new Response(JSON.stringify({ error: 'Missing subscription ID' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      // Get subscription details from Razorpay
      const subscription = await getRazorpaySubscription(subscriptionId);
      
      // Determine plan type from Razorpay plan ID
      let planType = 'free';
      Object.entries(subscriptionPlans).forEach(([key, plan]) => {
        if (plan.razorpay_plan_id === subscription.plan_id) {
          planType = key;
        }
      });
      
      // Calculate expiry date (1 year from now)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      
      // Update user subscription in database
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          plan: planType,
          razorpay_subscription_id: subscriptionId,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }
      
      return new Response(
        JSON.stringify({ success: true, plan: planType }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    else if (action === 'get_user_subscription') {
      // Get current subscription details
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (subError) {
        throw new Error(`Failed to get subscription: ${subError.message}`);
      }
      
      // Get usage details
      const { data: usage, error: usageError } = await supabase
        .from('debug_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (usageError) {
        throw new Error(`Failed to get usage: ${usageError.message}`);
      }
      
      return new Response(
        JSON.stringify({ 
          subscription, 
          usage,
          limits: {
            free: { daily: 5, monthly: null },
            pro: { daily: null, monthly: 200 },
            pro_plus: { daily: null, monthly: null }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
