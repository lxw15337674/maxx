import { useNavigate } from 'react-router-dom';
import { Badge, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { useProxyRequests, useProxyRequestUpdates } from '@/hooks/queries';
import { Activity } from 'lucide-react';
import type { ProxyRequestStatus } from '@/lib/transport';

export const statusVariant: Record<ProxyRequestStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'default',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  FAILED: 'danger',
};

export function RequestsPage() {
  const navigate = useNavigate();
  const { data: requests, isLoading } = useProxyRequests({ limit: 50 });

  // Subscribe to real-time updates
  useProxyRequestUpdates();

  const formatDuration = (ns: number) => {
    const ms = ns / 1_000_000;
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-[73px] flex items-center justify-between p-lg border-b border-border bg-surface-primary flex-shrink-0">
        <div className="flex items-center gap-md">
          <Activity size={24} className="text-text-primary" />
          <div>
            <h2 className="text-headline font-semibold text-text-primary">Requests</h2>
            <p className="text-caption text-text-muted">Monitor proxy request history</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-lg">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-lg text-center text-text-muted">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.map((req) => (
                    <TableRow
                      key={req.id}
                      className="cursor-pointer hover:bg-surface-hover"
                      onClick={() => navigate(`/requests/${req.id}`)}
                    >
                      <TableCell className="font-mono text-xs">
                        {formatTime(req.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{req.clientType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {req.requestModel || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {req.duration ? formatDuration(req.duration) : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {req.inputTokenCount > 0 || req.outputTokenCount > 0
                          ? `${req.inputTokenCount}/${req.outputTokenCount}`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!requests || requests.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-text-muted py-xl">
                        No requests yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
