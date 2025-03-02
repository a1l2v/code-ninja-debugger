
import React from 'react';
import { Crown, Star } from 'lucide-react';
import PlanCard, { PlanFeature } from './PlanCard';

interface SubscriptionPlansProps {
  isProcessing: boolean;
  isRazorpayLoaded?: boolean;
  onUpgrade: (planId: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  isProcessing, 
  isRazorpayLoaded = false,
  onUpgrade 
}) => {
  const freePlanFeatures: PlanFeature[] = [
    { text: '5 debugs per day' },
    { text: 'Basic code analysis' },
    { text: 'Save debug history' },
  ];

  const proPlanFeatures: PlanFeature[] = [
    { text: '200 debugs per month' },
    { text: 'Advanced code analysis' },
    { text: 'Premium support' },
    { text: 'Save and organize debug history' },
  ];

  const proPlusPlanFeatures: PlanFeature[] = [
    { text: 'Unlimited debugs' },
    { text: 'Top priority in queue' },
    { text: 'Premium support with faster response' },
    { text: 'Early access to new features' },
    { text: 'Advanced dashboard with analytics' },
  ];

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Free Plan */}
      <PlanCard
        title="Free Plan"
        price={0}
        features={freePlanFeatures}
        buttonText="Current Plan"
        buttonVariant="outline"
        isCurrentPlan={true}
      />
      
      {/* Pro Plan */}
      <PlanCard
        title="Pro Plan"
        price={99}
        features={proPlanFeatures}
        buttonText={!isRazorpayLoaded ? "Loading Payment..." : "Upgrade to Pro"}
        icon={<Star className="h-5 w-5 text-primary" />}
        badge="Popular"
        isPopular={true}
        isProcessing={isProcessing}
        isDisabled={!isRazorpayLoaded || isProcessing}
        onClick={() => onUpgrade('pro')}
      />
      
      {/* Pro Plus Plan */}
      <PlanCard
        title="Pro Plus Plan"
        price={149}
        features={proPlusPlanFeatures}
        buttonText={!isRazorpayLoaded ? "Loading Payment..." : "Upgrade to Pro Plus"}
        buttonVariant="outline"
        icon={<Crown className="h-5 w-5 text-yellow-500" />}
        isProcessing={isProcessing}
        isDisabled={!isRazorpayLoaded || isProcessing}
        onClick={() => onUpgrade('pro_plus')}
      />
    </div>
  );
};

export default SubscriptionPlans;
