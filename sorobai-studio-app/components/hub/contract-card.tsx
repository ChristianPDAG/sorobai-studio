'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, GitFork, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useGitHubAuth } from '@/lib/hooks/use-github-auth';
import { GitHubRequiredModal } from '@/components/auth/github-required-modal';

interface ContractCardProps {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar: string;
  likes: number;
  forks: number;
  tags: string[];
  updatedAt: Date;
}

export function ContractCard({
  id,
  name,
  description,
  author,
  authorAvatar,
  likes,
  forks,
  tags,
  updatedAt,
}: ContractCardProps) {
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const { isConnected } = useGitHubAuth();

  const handleFork = () => {
    if (!isConnected) {
      setShowGitHubModal(true);
    } else {
      // TODO: Implementar fork
      console.log('Forking contract:', id);
    }
  };

  return (
    <>
    <div className="bg-background rounded-lg border p-6 hover:shadow-lg transition-all hover:border-yellow-400/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link href={`/hub/${id}`} className="group">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-yellow-600 transition-colors">
              {name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={authorAvatar}
            alt={author}
            className="h-6 w-6 rounded-full"
          />
          <span className="text-sm text-muted-foreground">{author}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {likes}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {forks}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <span className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
        </span>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/hub/${id}`}>
              <Eye className="h-3 w-3" />
              View
            </Link>
          </Button>
          <Button 
            size="sm" 
            className="bg-black text-white hover:bg-black/90 gap-2"
            onClick={handleFork}
          >
            <GitFork className="h-3 w-3" />
            Fork
          </Button>
        </div>
      </div>
    </div>

    <GitHubRequiredModal 
      open={showGitHubModal} 
      onOpenChange={setShowGitHubModal}
      action="fork"
    />
    </>
  );
}
