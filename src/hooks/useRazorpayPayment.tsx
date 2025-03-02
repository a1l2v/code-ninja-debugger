
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
    // Add Razorpay script
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
      if (!razorpayLoaded) {
        console.error('Razorpay SDK not loaded yet');
        toast.error('Payment service is not ready. Please try again in a moment.');
        return;
      }

      onProcessingChange(true);
      
      // Create subscription on server
      const { key, subscription } = await createSubscription(planId);
      console.log('Subscription created:', subscription);
      console.log('Razorpay key:', key);
      
      if (!key || !subscription || !subscription.id) {
        console.error('Invalid response from create subscription API');
        toast.error('Failed to initiate payment process. Please try again later.');
        onProcessingChange(false);
        return;
      }
      
      // Initialize Razorpay with a proper try-catch
      try {
        const options = {
          key,
          subscription_id: subscription.id,
          name: 'CodeDebugAI',
          description: 'Subscription Payment',
          prefill: {
            email: user?.email || '',
          },
          theme: {
            color: '#7c3aed',
          },
          modal: {
            ondismiss: function() {
              toast.error('Payment cancelled');
              onProcessingChange(false);
            },
          },
          handler: async function(response: any) {
            try {
              console.log('Payment successful, verifying...', response);
              // Verify subscription
              const result = await verifySubscription(subscription.id);
              
              if (result.success) {
                toast.success(`Successfully upgraded to ${result.plan.replace('_', ' ')} plan!`);
                navigate('/dashboard');
              } else {
                toast.error('Failed to verify payment');
              }
            } catch (error) {
              console.error('Verification failed:', error);
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
        console.error('Failed to initialize Razorpay:', error);
        toast.error('Payment service initialization failed. Please try again later.');
        onProcessingChange(false);
      }
    } catch (error) {
      console.error('Failed to initiate upgrade:', error);
      toast.error('Failed to initiate payment process');
      onProcessingChange(false);
    }
  };

  return { handleUpgrade, razorpayLoaded };
};
