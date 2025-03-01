
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface CodeEditorProps {
  onDebug: (code: string) => void;
  isLoading: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onDebug, isLoading }) => {
  const [code, setCode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onDebug(code);
    }
  };

  return (
    <div className="w-full staggered-item">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Input your code below
        </label>
        <span className="text-xs text-muted-foreground">
          Press Ctrl+Enter to debug
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-lg border bg-background shadow-sm transition-all">
          <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/50">
            <div className="flex">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-1.5"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">code.js</span>
          </div>
          
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
            placeholder="// Paste your code here..."
            className="code-editor p-4 w-full min-h-[300px] bg-background text-foreground font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-0"
            spellCheck="false"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading || !code.trim()} 
            className="group flex items-center gap-2 transition-all duration-300 relative overflow-hidden"
          >
            <span className="relative z-10">Debug Code</span>
            <Wand2 
              className={`h-4 w-4 transition-all duration-500 ${
                isLoading ? 'animate-spin' : 'group-hover:rotate-12'
              }`} 
            />
            <span className="absolute inset-0 bg-primary/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CodeEditor;
