import { useState } from 'react';
import { Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input } from '@/components/ui';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/queries';
import { Plus, Trash2, Pencil, Check, X, FolderKanban, Loader2, Calendar } from 'lucide-react';
import type { Project } from '@/lib/transport';

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({ name }, {
      onSuccess: () => {
        setShowForm(false);
        setName('');
      },
    });
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleSaveEdit = () => {
    if (editingId === null) return;
    updateProject.mutate(
      { id: editingId, data: { name: editingName } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingName('');
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject.mutate(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-[73px] flex items-center justify-between px-6 border-b border-border bg-surface-primary flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <FolderKanban size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary leading-tight">Projects</h2>
            <p className="text-xs text-text-secondary">
              Manage your projects and environments
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Project'}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {showForm && (
          <Card className="border-border bg-surface-primary animate-in slide-in-from-top-4 duration-200">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Project Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Production, Staging, Experiment-A"
                    required
                    className="bg-surface-secondary border-border"
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={createProject.isPending}>
                  {createProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Project'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-border bg-surface-primary">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="w-[100px] text-text-secondary">ID</TableHead>
                    <TableHead className="text-text-secondary">Name</TableHead>
                    <TableHead className="text-text-secondary">Created</TableHead>
                    <TableHead className="w-[100px] text-right text-text-secondary">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects?.map((project) => (
                    <TableRow key={project.id} className="border-border hover:bg-surface-hover">
                      <TableCell className="font-mono text-xs text-text-muted">{project.id}</TableCell>
                      <TableCell>
                        {editingId === project.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 bg-surface-secondary border-border"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                        ) : (
                          <span className="font-medium text-text-primary">{project.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-text-secondary text-xs">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === project.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={updateProject.isPending}
                              className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(project)}
                              className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(project.id)}
                              disabled={deleteProject.isPending}
                              className="h-8 w-8 p-0 text-text-muted hover:text-error hover:bg-error/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!projects || projects.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-text-muted border-border">
                         <div className="flex flex-col items-center justify-center gap-2">
                           <Calendar className="h-8 w-8 opacity-20" />
                           <p>No projects found</p>
                        </div>
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
