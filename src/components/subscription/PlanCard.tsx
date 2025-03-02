
import React from 'react';
import { Button } from '../ui/button';
import { CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PlanFeature {
  text: string;
  included?: boolean;
}

interface PlanCardProps {
  title: string;
  price: number;
  features: PlanFeature[];
  buttonText: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  isProcessing?: boolean;
  isDisabled?: boolean;
  badge?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  price,
  features,
  buttonText,
  buttonVariant = 'default',
  isCurrentPlan = false,
  isPopular = false,
  isProcessing = false,
  isDisabled = false,
  badge,
  icon,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-lg border p-6 transition-all',
        isPopular ? 'border-primary shadow-md' : 'border-border',
      )}
    >
      {/* Card Header */}
      <div className="mb-5 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          {icon && <span>{icon}</span>}
        </div>
        
        {badge && (
          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {badge}
          </span>
        )}
        
        <div className="flex items-baseline text-2xl font-semibold md:text-3xl">
          ₹{price}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {price > 0 ? '/month' : ''}
          </span>
        </div>
      </div>
      
      {/* Features List */}
      <ul className="mb-6 space-y-2 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">{feature.text}</span>
          </li>
        ))}
      </ul>
      
      {/* Action Button */}
      <Button
        variant={buttonVariant as any}
        className={cn(
          'mt-auto w-full',
          isPopular && buttonVariant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
        disabled={isCurrentPlan || isProcessing || isDisabled}
        onClick={onClick}
      >
        {isProcessing ? (
          <>
            <span className="animate-spin mr-2">◌</span>
            Processing...
          </>
        ) : buttonText}
      </Button>
    </div>
  );
};

export default PlanCard;
