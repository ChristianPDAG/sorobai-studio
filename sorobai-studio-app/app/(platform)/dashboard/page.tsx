'use client';

import { Plus, Github, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ProjectsList } from '@/components/dashboard/projects-list';
import { mockUser } from '@/lib/mock-data';
import { useGitHubAuth } from '@/lib/hooks/use-github-auth';

export default function DashboardPage() {
  const { isConnected } = useGitHubAuth();
  const [showBanner, setShowBanner] = useState(!isConnected);

  const handleConnectGitHub = () => {
    // TODO: Implementar OAuth de GitHub
    console.log('Connecting to GitHub...');
  };

  return (
    <div className="container py-8 space-y-8">
      {/* GitHub Banner */}
      {showBanner && !isConnected && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-10 w-10 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                <Github className="h-5 w-5 text-white dark:text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Link your GitHub account</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect GitHub to publish contracts, participate in bounties, and build your reputation.
                </p>
                <Button 
                  onClick={handleConnectGitHub}
                  size="sm"
                  className="bg-black text-white hover:bg-black/90"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Connect GitHub
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowBanner(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">
            Welcome back{isConnected ? `, ${mockUser.githubUsername}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Button className="bg-black text-white hover:bg-black/90 gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Recent Projects */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
        <ProjectsList />
      </div>
    </div>
  );
}
