'use client';

import { Save, Play, Settings, Github, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StudioToolbarProps {
  projectName: string;
  onEstimateCost?: () => void;
}

export function StudioToolbar({ projectName, onEstimateCost }: StudioToolbarProps) {
  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg">{projectName}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Testnet
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Autosaved 2 min ago</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="gap-2">
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline">Push</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={onEstimateCost}
        >
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Estimate Cost</span>
        </Button>

        <Button 
          size="sm" 
          className="bg-yellow-400 text-black hover:bg-yellow-500 gap-2"
        >
          <Play className="h-4 w-4" />
          Deploy
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Project Settings</DropdownMenuItem>
            <DropdownMenuItem>Make Public</DropdownMenuItem>
            <DropdownMenuItem>Export Code</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Delete Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
