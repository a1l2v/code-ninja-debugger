
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getSubscriptionPlans, createSubscription, verifySubscription, SubscriptionPlan } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Upgrade: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Add Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
        setPlans(availablePlans);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPlans();
    }
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    try {
      setIsProcessing(true);
      
      // Create subscription on server
      const { key, subscription } = await createSubscription(planId);
      
      // Initialize Razorpay
      const razorpay = new window.Razorpay({
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
            setIsProcessing(false);
          },
        },
        handler: async function(response: any) {
          try {
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
            setIsProcessing(false);
          }
        }
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Failed to initiate upgrade:', error);
      toast.error('Failed to initiate payment process');
      setIsProcessing(false);
    }
  };

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
            <div className="grid gap-8 md:grid-cols-3">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Free Plan
                  </CardTitle>
                  <CardDescription>
                    <div className="text-2xl font-bold">
                      ₹0 <span className="text-sm font-normal">/ month</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>5 debugs per day</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Basic code analysis</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Save debug history</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Pro Plan */}
              <Card className="border-primary/50 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 m-2">
                  <Badge className="bg-primary">
                    <Star className="h-3 w-3 mr-1 fill-primary-foreground" />
                    Popular
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Pro Plan
                  </CardTitle>
                  <CardDescription>
                    <div className="text-2xl font-bold">
                      ₹999 <span className="text-sm font-normal">/ month</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>200 debugs per month</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Advanced code analysis</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Premium support</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Save and organize debug history</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleUpgrade('pro')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Upgrade to Pro'}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Pro Plus Plan */}
              <Card className="border-primary/20 relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Pro Plus Plan
                  </CardTitle>
                  <CardDescription>
                    <div className="text-2xl font-bold">
                      ₹1499 <span className="text-sm font-normal">/ month</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Unlimited debugs</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Top priority in queue</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Premium support with faster response</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Early access to new features</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Advanced dashboard with analytics</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleUpgrade('pro_plus')}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Upgrade to Pro Plus'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
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
