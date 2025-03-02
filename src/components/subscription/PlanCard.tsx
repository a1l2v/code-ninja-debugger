
import React from 'react';
import { CheckCircle, Crown, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface PlanFeature {
  text: string;
}

export interface PlanCardProps {
  title: string;
  price: number;
  features: PlanFeature[];
  buttonText: string;
  buttonVariant?: 'default' | 'outline';
  onClick?: () => void;
  icon?: React.ReactNode;
  badge?: string;
  isCurrentPlan?: boolean;
  isProcessing?: boolean;
  isPopular?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  price,
  features,
  buttonText,
  buttonVariant = 'default',
  onClick,
  icon,
  badge,
  isCurrentPlan = false,
  isProcessing = false,
  isPopular = false,
}) => {
  return (
    <Card className={`${isPopular ? 'border-primary/50 shadow-md' : isCurrentPlan ? 'border-primary/20' : ''} relative overflow-hidden`}>
      {badge && (
        <div className="absolute top-0 right-0 m-2">
          <Badge className="bg-primary">
            <Star className="h-3 w-3 mr-1 fill-primary-foreground" />
            {badge}
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          <div className="text-2xl font-bold">
            ₹{price} <span className="text-sm font-normal">/ month</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          variant={buttonVariant} 
          className="w-full"
          onClick={onClick}
          disabled={isCurrentPlan || isProcessing}
        >
          {isProcessing ? 'Processing...' : isCurrentPlan ? 'Current Plan' : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
