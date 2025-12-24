import { Plus, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectsList } from '@/components/dashboard/projects-list';
import { EmptyState } from '@/components/shared/empty-state';

export default function StudioPage() {
  const hasProjects = true; // Mock

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Studio</h1>
          <p className="text-muted-foreground">
            Create and manage your Soroban smart contracts
          </p>
        </div>
        <Button className="bg-black text-white hover:bg-black/90 gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {hasProjects ? (
        <ProjectsList />
      ) : (
        <EmptyState
          icon={Code2}
          title="No projects yet"
          description="Create your first Soroban smart contract with AI assistance"
          action={{
            label: 'Create Project',
            onClick: () => console.log('Create project'),
          }}
        />
      )}
    </div>
  );
}
