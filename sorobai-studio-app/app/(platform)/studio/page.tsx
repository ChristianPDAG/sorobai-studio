'use client';

import { useState, useEffect } from 'react';
import { Plus, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectsList } from '@/components/dashboard/projects-list';
import { EmptyState } from '@/components/shared/empty-state';
import { CreateProjectDialog } from '@/components/studio/create-project-dialog';
import { getUserProjects } from '@/app/actions/projects';

export default function StudioPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProjects();
  }, []);

  const checkProjects = async () => {
    const result = await getUserProjects();
    if (result.success && result.data) {
      setHasProjects(result.data.length > 0);
    }
    setLoading(false);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Studio</h1>
          <p className="text-muted-foreground">
            Create and manage your Soroban smart contracts
          </p>
        </div>
        <Button
          className="bg-black text-white hover:bg-black/90 gap-2"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {!loading && (
        hasProjects ? (
          <ProjectsList />
        ) : (
          <EmptyState
            icon={Code2}
            title="No projects yet"
            description="Create your first Soroban smart contract with AI assistance"
            action={{
              label: 'Create Project',
              onClick: () => setCreateDialogOpen(true),
            }}
          />
        )
      )}

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
