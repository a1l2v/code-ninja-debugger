
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import SubscriptionPlans from '../components/subscription/SubscriptionPlans';
import { getSubscriptionPlans, SubscriptionPlan } from '../services/api';
import { useRazorpayPayment } from '../hooks/useRazorpayPayment';

const Upgrade: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  // Use our improved custom hook
  const { handleUpgrade, razorpayLoaded } = useRazorpayPayment({
    onProcessingChange: setIsProcessing
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const availablePlans = await getSubscriptionPlans();
        console.log('📋 Available plans:', availablePlans);
        setPlans(availablePlans);
      } catch (error) {
        console.error('❌ Failed to fetch plans:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPlans();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl pt-24 pb-16 px-4">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Upgrade Your Plan
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Choose the plan that's right for you and take your debugging to the next level.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border p-6">
                  <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SubscriptionPlans 
              isProcessing={isProcessing} 
              onUpgrade={handleUpgrade} 
              isRazorpayLoaded={razorpayLoaded}
            />
          )}
        </div>
      </main>
      
      <footer className="border-t py-6 bg-background/80 backdrop-blur-sm">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              CodeDebugAI © {new Date().getFullYear()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Secure payments powered by Razorpay
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Upgrade;
