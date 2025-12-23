'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Code2, Heart, GitFork, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockProjects } from '@/lib/mock-data';

export function ProjectsList() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-4">
      {mockProjects.map((project) => (
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
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {project.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              {project.forksCount}
            </span>
            <span>•</span>
            <span>
              {mounted 
                ? `Updated ${formatDistanceToNow(project.updatedAt, { addSuffix: true })}`
                : 'Updated recently'
              }
            </span>
            {project.isPublic && (
              <>
                <span>•</span>
                <span className="text-green-600">Public</span>
              </>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
