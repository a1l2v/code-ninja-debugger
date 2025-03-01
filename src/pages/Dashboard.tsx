
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CodeEditor from '../components/CodeEditor';
import DebugResults from '../components/DebugResults';
import DebugHistory from '../components/DebugHistory';
import { useAuth } from '../contexts/AuthContext';
import { debugCode, saveDebugHistory, getDebugHistory, DebugHistoryItem } from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, GitBranch, History, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState<string>('');
  const [historyItems, setHistoryItems] = useState<DebugHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load debug history when component mounts
  useEffect(() => {
    if (user) {
      loadDebugHistory();
    }
  }, [user]);

  const loadDebugHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const history = await getDebugHistory();
      setHistoryItems(history);
    } catch (error) {
      console.error('Failed to load debug history:', error);
      toast.error('Failed to load debug history');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleDebug = async (codeToDebug: string) => {
    setIsLoading(true);
    setResults(null); // Clear previous results
    setCode(codeToDebug);
    
    try {
      const response = await debugCode(codeToDebug);
      setResults(response.data);
      
      // Save to history
      await saveDebugHistory(codeToDebug, response.data);
      
      // Reload history
      await loadDebugHistory();
      
      toast.success('Code successfully debugged!');
    } catch (error) {
      toast.error('Failed to debug code: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: DebugHistoryItem) => {
    setCode(item.code);
    setResults(item.result);
    setActiveTab('editor');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              Paste your code below and let our AI find and fix issues for you. Powered by the Nebius AI Qwen2.5-Coder-32B-Instruct model.
            </p>
          </div>
          
          <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="editor">
                <Code className="h-4 w-4 mr-2" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-6">
              <CodeEditor onDebug={handleDebug} isLoading={isLoading} initialCode={code} />
              <DebugResults results={results} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="history">
              <DebugHistory 
                history={historyItems} 
                isLoading={isHistoryLoading} 
                onSelectSession={handleSelectHistoryItem}
              />
            </TabsContent>
          </Tabs>
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
