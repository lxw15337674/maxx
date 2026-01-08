import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui';
import { useRoutes, useDeleteRoute, useProviders, useProjects } from '@/hooks/queries';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { RouteForm } from './form';
import type { Route } from '@/lib/transport';

export function RoutesPage() {
  const { data: routes, isLoading } = useRoutes();
  const { data: providers } = useProviders();
  const { data: projects } = useProjects();
  const deleteRoute = useDeleteRoute();
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | undefined>();

  const getProviderName = (providerId: number) => {
    return providers?.find((p) => p.id === providerId)?.name ?? `#${providerId}`;
  };

  const getProjectName = (projectId: number) => {
    if (projectId === 0) return 'Global';
    return projects?.find((p) => p.id === projectId)?.name ?? `#${projectId}`;
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRoute(undefined);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this route?')) {
      deleteRoute.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Routes</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRoute ? 'Edit Route' : 'New Route'}</CardTitle>
          </CardHeader>
          <CardContent>
            <RouteForm route={editingRoute} onClose={handleCloseForm} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes?.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-mono">{route.id}</TableCell>
                    <TableCell>
                      <Badge variant="info">{route.clientType}</Badge>
                    </TableCell>
                    <TableCell>{getProviderName(route.providerID)}</TableCell>
                    <TableCell>
                      <span className={route.projectID === 0 ? 'text-gray-400' : ''}>
                        {getProjectName(route.projectID)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">{route.position}</TableCell>
                    <TableCell>
                      <Badge variant={route.isEnabled ? 'success' : 'default'}>
                        {route.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(route)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(route.id)}
                          disabled={deleteRoute.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!routes || routes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No routes configured
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
