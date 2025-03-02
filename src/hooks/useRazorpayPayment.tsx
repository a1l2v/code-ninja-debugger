
import { useEffect, useState } from 'react';
import { createSubscription, verifySubscription } from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UseRazorpayPaymentProps {
  onProcessingChange: (isProcessing: boolean) => void;
}

export const useRazorpayPayment = ({ onProcessingChange }: UseRazorpayPaymentProps) => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log("✅ Razorpay already available in window object");
      setRazorpayLoaded(true);
      return;
    }

    // Add Razorpay script
    console.log("🔄 Loading Razorpay script...");
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log("✅ Razorpay script loaded successfully.");
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Razorpay script.");
      toast.error("Payment service couldn't be loaded. Please try again later.");
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleUpgrade = async (planId: string) => {
    try {
      if (!window.Razorpay) {
        console.error('❌ Razorpay SDK not loaded yet');
        toast.error('Payment service is not ready. Please try again in a moment.');
        return;
      }

      console.log('🔄 Initiating payment process for plan:', planId);
      onProcessingChange(true);
      
      // Create subscription on server
      const response = await createSubscription(planId);
      
      if (!response || !response.key || !response.subscription || !response.subscription.id) {
        console.error('❌ Invalid response from create subscription API:', response);
        toast.error('Failed to initiate payment process. Please try again later.');
        onProcessingChange(false);
        return;
      }
      
      console.log('✅ Subscription created:', response.subscription);
      console.log('✅ Razorpay key:', response.key);
      
      // Initialize Razorpay with a proper try-catch
      try {
        const options = {
          key: response.key,
          subscription_id: response.subscription.id,
          name: 'CodeDebugAI',
          description: 'Subscription Payment',
          prefill: {
            email: user?.email || '',
            name: user?.email?.split('@')[0] || 'User',
          },
          theme: {
            color: '#7c3aed',
          },
          modal: {
            ondismiss: function() {
              console.log('❌ Payment modal dismissed by user');
              toast.error('Payment cancelled');
              onProcessingChange(false);
            },
          },
          handler: async function(razorpayResponse: any) {
            try {
              console.log('✅ Payment successful, verifying...', razorpayResponse);
              // Verify subscription
              const result = await verifySubscription(response.subscription.id);
              
              if (result.success) {
                toast.success(`Successfully upgraded to ${result.plan.replace('_', ' ')} plan!`);
                navigate('/dashboard');
              } else {
                toast.error('Failed to verify payment');
              }
            } catch (error) {
              console.error('❌ Verification failed:', error);
              toast.error('Failed to verify payment');
            } finally {
              onProcessingChange(false);
            }
          }
        };
        
        console.log('🛠 Initializing Razorpay Checkout...');
        const razor = new window.Razorpay(options);
        razor.open();
      } catch (error) {
        console.error('❌ Failed to initialize Razorpay:', error);
        toast.error('Payment service initialization failed. Please try again later.');
        onProcessingChange(false);
      }
    } catch (error) {
      console.error('❌ Failed to initiate upgrade:', error);
      toast.error('Failed to initiate payment process');
      onProcessingChange(false);
    }
  };

  return { handleUpgrade, razorpayLoaded };
};
