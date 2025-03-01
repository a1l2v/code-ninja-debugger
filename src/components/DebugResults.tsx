
import React from 'react';
import { Check, AlarmClock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugResultsProps {
  results: string | null;
  isLoading: boolean;
}

const DebugResults: React.FC<DebugResultsProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full mt-8 rounded-lg border border-border p-6 animate-pulse staggered-item">
        <div className="flex items-center gap-2 mb-4">
          <AlarmClock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Processing code...</h3>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div 
      className={cn(
        "w-full mt-8 rounded-lg border border-border p-6 transition-all",
        "animate-entry staggered-item"
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Check className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-medium">Debugged Code</h3>
      </div>
      
      <div className="relative w-full overflow-hidden rounded-lg border bg-background shadow-sm">
        <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/50">
          <div className="flex">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-1.5"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs font-medium text-muted-foreground">debugged-code.js</span>
        </div>
        
        <pre className="p-4 overflow-auto max-h-[500px] text-sm font-mono whitespace-pre-wrap">
          <code>{results}</code>
        </pre>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={() => navigator.clipboard.writeText(results)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Copy to clipboard
        </button>
      </div>
    </div>
  );
};

export default DebugResults;
