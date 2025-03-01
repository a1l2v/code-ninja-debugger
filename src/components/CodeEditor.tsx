
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Bug } from 'lucide-react';

interface CodeEditorProps {
  onDebug: (code: string) => void;
  isLoading: boolean;
  initialCode?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onDebug, isLoading, initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);

  // Update code when initialCode prop changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleDebug = () => {
    if (!code.trim()) {
      return;
    }
    onDebug(code);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Your Code</h3>
        <Button 
          onClick={handleDebug}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              Debugging...
            </>
          ) : (
            <>
              <Bug className="mr-2 h-4 w-4" />
              Debug Code
            </>
          )}
        </Button>
      </div>
      
      <div className="p-4">
        <Textarea
          className="font-mono h-[400px] resize-none"
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
