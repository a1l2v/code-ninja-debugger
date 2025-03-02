
import React, { useEffect, useState } from 'react';
import { getUserSubscription, SubscriptionInfo } from '../services/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const SubscriptionStatus: React.FC = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        setIsLoading(true);
        const info = await getUserSubscription();
        setSubscriptionInfo(info);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch subscription info:', err);
        setError('Failed to load subscription information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse p-6 rounded-lg border border-border">
        <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
        <div className="h-2 bg-muted rounded w-full mb-2"></div>
        <div className="h-2 bg-muted rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !subscriptionInfo) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Unable to load subscription information'}
        </AlertDescription>
      </Alert>
    );
  }

  const { subscription, usage, limits } = subscriptionInfo;
  const planLimits = limits[subscription.plan];
  
  // Calculate usage percentage based on plan type
  let usagePercentage = 0;
  let usageText = '';
  
  if (subscription.plan === 'free') {
    // Free plan: daily limit
    usagePercentage = (usage.debug_count / planLimits.daily!) * 100;
    usageText = `${usage.debug_count}/${planLimits.daily} daily debugs used`;
  } else if (subscription.plan === 'pro') {
    // Pro plan: monthly limit
    usagePercentage = (usage.debug_count / planLimits.monthly!) * 100;
    usageText = `${usage.debug_count}/${planLimits.monthly} monthly debugs used`;
  } else {
    // Pro Plus plan: unlimited
    usagePercentage = 0;
    usageText = 'Unlimited debugs';
  }

  return (
    <div className="rounded-lg border border-border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold capitalize">
            {subscription.plan.replace('_', ' ')} Plan
          </h3>
          <p className="text-sm text-muted-foreground">
            {subscription.plan === 'free' 
              ? 'Limited to 5 debugs per day' 
              : subscription.plan === 'pro' 
                ? 'Up to 200 debugs per month (₹99/month)' 
                : 'Unlimited debugs (₹149/month)'}
          </p>
        </div>
        
        {subscription.plan !== 'pro_plus' && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/upgrade')}
          >
            Upgrade
          </Button>
        )}
      </div>
      
      {subscription.plan !== 'pro_plus' && (
        <>
          <Progress value={usagePercentage} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">{usageText}</p>
        </>
      )}
    </div>
  );
};

export default SubscriptionStatus;
