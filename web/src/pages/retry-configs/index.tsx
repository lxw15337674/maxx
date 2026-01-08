import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Input } from '@/components/ui';
import { useRetryConfigs, useCreateRetryConfig, useUpdateRetryConfig, useDeleteRetryConfig } from '@/hooks/queries';
import { Plus, Trash2, Pencil } from 'lucide-react';
import type { RetryConfig } from '@/lib/transport';

export function RetryConfigsPage() {
  const { data: configs, isLoading } = useRetryConfigs();
  const createConfig = useCreateRetryConfig();
  const updateConfig = useUpdateRetryConfig();
  const deleteConfig = useDeleteRetryConfig();
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RetryConfig | undefined>();

  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [maxRetries, setMaxRetries] = useState('3');
  const [initialInterval, setInitialInterval] = useState('1000');
  const [backoffRate, setBackoffRate] = useState('2');
  const [maxInterval, setMaxInterval] = useState('30000');

  const resetForm = () => {
    setName('');
    setIsDefault(false);
    setMaxRetries('3');
    setInitialInterval('1000');
    setBackoffRate('2');
    setMaxInterval('30000');
  };

  const handleEdit = (config: RetryConfig) => {
    setEditingConfig(config);
    setName(config.name);
    setIsDefault(config.isDefault);
    setMaxRetries(String(config.maxRetries));
    setInitialInterval(String(config.initialInterval / 1_000_000));
    setBackoffRate(String(config.backoffRate));
    setMaxInterval(String(config.maxInterval / 1_000_000));
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingConfig(undefined);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      isDefault,
      maxRetries: Number(maxRetries),
      initialInterval: Number(initialInterval) * 1_000_000,
      backoffRate: Number(backoffRate),
      maxInterval: Number(maxInterval) * 1_000_000,
    };

    if (editingConfig) {
      updateConfig.mutate(
        { id: editingConfig.id, data },
        { onSuccess: handleCloseForm }
      );
    } else {
      createConfig.mutate(data, { onSuccess: handleCloseForm });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this retry config?')) {
      deleteConfig.mutate(id);
    }
  };

  const formatInterval = (ns: number) => `${(ns / 1_000_000).toFixed(0)}ms`;
  const isPending = createConfig.isPending || updateConfig.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Retry Configs</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Config
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingConfig ? 'Edit Retry Config' : 'New Retry Config'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Max Retries</label>
                  <Input type="number" value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)} min="0" required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Initial Interval (ms)</label>
                  <Input type="number" value={initialInterval} onChange={(e) => setInitialInterval(e.target.value)} min="0" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Backoff Rate</label>
                  <Input type="number" value={backoffRate} onChange={(e) => setBackoffRate(e.target.value)} min="1" step="0.1" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Max Interval (ms)</label>
                  <Input type="number" value={maxInterval} onChange={(e) => setMaxInterval(e.target.value)} min="0" required />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isDefault" className="text-sm font-medium">Set as default</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : editingConfig ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Retry Configs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Max Retries</TableHead>
                  <TableHead>Initial</TableHead>
                  <TableHead>Backoff</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs?.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-mono">{config.id}</TableCell>
                    <TableCell className="font-medium">
                      {config.name}
                      {config.isDefault && <Badge variant="info" className="ml-2">Default</Badge>}
                    </TableCell>
                    <TableCell>{config.maxRetries}</TableCell>
                    <TableCell className="font-mono text-xs">{formatInterval(config.initialInterval)}</TableCell>
                    <TableCell>{config.backoffRate}x</TableCell>
                    <TableCell className="font-mono text-xs">{formatInterval(config.maxInterval)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(config)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(config.id)} disabled={deleteConfig.isPending}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!configs || configs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">No retry configs</TableCell>
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
