'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Github, Shield, Award, Users } from 'lucide-react';

interface GitHubRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'publish' | 'bounty' | 'fork';
}

const actionMessages = {
  publish: {
    title: 'GitHub Required to Publish',
    description: 'Link your GitHub account to publish contracts to the Community Hub',
  },
  bounty: {
    title: 'GitHub Required for Bounties',
    description: 'Link your GitHub account to participate in bounties and earn rewards',
  },
  fork: {
    title: 'GitHub Required to Fork',
    description: 'Link your GitHub account to fork and save contracts to your profile',
  },
};

export function GitHubRequiredModal({ open, onOpenChange, action }: GitHubRequiredModalProps) {
  const message = actionMessages[action];

  const handleConnect = () => {
    // TODO: Implementar OAuth de GitHub
    console.log('Connecting to GitHub...');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">{message.title}</DialogTitle>
          <DialogDescription>{message.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <h3 className="font-semibold">Why we require GitHub:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span>Verify you're a real developer</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                <span>Maintain high-quality community standards</span>
              </li>
              <li className="flex items-start gap-2">
                <Award className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                <span>Build your developer reputation</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> You can still use the AI Studio and explore the Hub without GitHub. 
              It's only required for publishing and earning.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleConnect}
              className="w-full bg-black text-white hover:bg-black/90"
              size="lg"
            >
              <Github className="mr-2 h-5 w-5" />
              Connect GitHub Account
            </Button>

            <Button 
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
