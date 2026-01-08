import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { useSessions } from '@/hooks/queries';

export function SessionsPage() {
  const { data: sessions, isLoading } = useSessions();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sessions</h2>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions?.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono">{session.id}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {session.sessionID.slice(0, 16)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{session.clientType}</Badge>
                    </TableCell>
                    <TableCell>
                      {session.projectID === 0 ? (
                        <span className="text-gray-400">None</span>
                      ) : (
                        `#${session.projectID}`
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {(!sessions || sessions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No sessions yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
