'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, GitFork, Eye, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useWalletAuth } from '@/lib/hooks/use-wallet-auth';
import { ProjectWithStats } from '@/types';
import { toggleProjectLike, forkProject } from '@/app/actions/projects';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ContractCardProps {
  project: ProjectWithStats;
  onUpdate?: () => void;
}

export function ContractCard({ project, onUpdate }: ContractCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useWalletAuth();
  const [liking, setLiking] = useState(false);
  const [forking, setForking] = useState(false);
  const [likesCount, setLikesCount] = useState(project.likes_count || 0);
  const [forksCount, setForksCount] = useState(project.forks_count || 0);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please connect your wallet to like projects');
      return;
    }

    setLiking(true);
    const result = await toggleProjectLike(project.id);

    if (result.success) {
      setLikesCount(prev => result.liked ? prev + 1 : prev - 1);
      toast.success(result.liked ? 'Liked!' : 'Unliked');
      onUpdate?.();
    } else {
      toast.error(result.error || 'Failed to like project');
    }
    setLiking(false);
  };

  const handleFork = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please connect your wallet to fork projects');
      return;
    }

    setForking(true);
    const result = await forkProject(project.id);

    if (result.success && result.data) {
      setForksCount(prev => prev + 1);
      toast.success('Project forked successfully!');
      router.push(`/studio/${result.data.id}`);
    } else {
      toast.error(result.error || 'Failed to fork project');
    }
    setForking(false);
  };

  return (
    <div className="bg-background rounded-lg border p-6 hover:shadow-lg transition-all hover:border-yellow-400/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link href={`/hub/${project.id}`} className="group">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-yellow-600 transition-colors">
              {project.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags?.map((tag) => (
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
          {project.author_avatar ? (
            <img
              src={project.author_avatar}
              alt={project.author_username || 'Author'}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-muted" />
          )}
          <span className="text-sm text-muted-foreground">
            {project.author_username || project.author_wallet?.slice(0, 8) + '...'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <button
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {liking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {likesCount}
          </button>
          <span className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {forksCount}
          </span>
          {project.avg_rating && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {project.avg_rating}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <span className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
        </span>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/hub/${project.id}`}>
              <Eye className="h-3 w-3" />
              View
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-black text-white hover:bg-black/90 gap-2"
            onClick={handleFork}
            disabled={forking}
          >
            {forking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <GitFork className="h-3 w-3" />
            )}
            Fork
          </Button>
        </div>
      </div>
    </div>
  );
}
