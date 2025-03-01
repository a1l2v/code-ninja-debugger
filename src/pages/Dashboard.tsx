
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CodeEditor from '../components/CodeEditor';
import DebugResults from '../components/DebugResults';
import { useAuth } from '../contexts/AuthContext';
import { debugCode } from '../services/api';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Code, GitBranch, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleDebug = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await debugCode(code);
      setResults(response.data);
    } catch (error) {
      toast.error('Failed to debug code. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl pt-24 pb-16 px-4">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          <div className="space-y-2 staggered-item">
            <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              <span className="text-xs font-medium">AI-Powered</span>
            </Badge>
            
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Debug your code with AI
            </h1>
            
            <p className="text-muted-foreground max-w-3xl">
              Paste your code below and let our AI find and fix issues for you. Powered by the Qwen2.5-Coder-32B-Instruct model.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <CodeEditor onDebug={handleDebug} isLoading={isLoading} />
            <DebugResults results={results} isLoading={isLoading} />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6 bg-background/80 backdrop-blur-sm">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <p className="text-sm text-muted-foreground">
              CodeDebugAI © {new Date().getFullYear()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Powered by Qwen2.5-Coder-32B-Instruct on Nebius AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
