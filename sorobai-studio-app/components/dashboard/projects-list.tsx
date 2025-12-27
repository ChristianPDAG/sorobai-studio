'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Code2, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserProjects, deleteProject } from '@/app/actions/projects';
import { EditProjectDialog } from '@/components/studio/edit-project-dialog';
import { Project } from '@/types';
import { toast } from 'sonner';

export function ProjectsList() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const result = await getUserProjects();
    if (result.success && result.data) {
      setProjects(result.data);
    } else {
      toast.error(result.error || 'Failed to load projects');
    }
    setLoading(false);
  };

  const handleDelete = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.preventDefault();

    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(projectId);
    const result = await deleteProject(projectId);

    if (result.success) {
      toast.success('Project deleted successfully');
      setProjects(projects.filter(p => p.id !== projectId));
    } else {
      toast.error(result.error || 'Failed to delete project');
    }
    setDeletingId(null);
  };

  const handleEditClick = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingProjectId(projectId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return null; // Parent will show EmptyState
  }

  return (
    <>
      <div className="space-y-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/studio/${project.id}`}
            className="block bg-background rounded-lg border p-6 hover:shadow-md transition-all hover:border-yellow-400/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="icon" disabled={deletingId === project.id}>
                    {deletingId === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => handleEditClick(project.id, e)}>
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={(e) => handleDelete(project.id, project.name, e)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="capitalize">{project.language}</span>
              <span>•</span>
              <span>
                {mounted
                  ? `Updated ${formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}`
                  : 'Updated recently'
                }
              </span>
              {project.is_public && (
                <>
                  <span>•</span>
                  <span className="text-green-600">Public</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {editingProjectId && (
        <EditProjectDialog
          open={!!editingProjectId}
          onOpenChange={(open) => !open && setEditingProjectId(null)}
          projectId={editingProjectId}
          onSuccess={loadProjects}
        />
      )}
    </>
  );
}

