
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DebugHistoryItem } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Code, FileText } from 'lucide-react';

interface DebugHistoryProps {
  history: DebugHistoryItem[];
  isLoading: boolean;
  onSelectSession: (item: DebugHistoryItem) => void;
}

const DebugHistory: React.FC<DebugHistoryProps> = ({ 
  history, 
  isLoading,
  onSelectSession
}) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
        <div className="flex flex-col items-center justify-center h-40 space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No debug history found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Debug History</h3>
        <p className="text-sm text-muted-foreground">
          Your previous debugging sessions
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onSelectSession(item)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DebugHistory;
