'use client';

import { DollarSign, Zap, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface ResourcePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResourcePanel({ open, onOpenChange }: ResourcePanelProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const estimatedCostXLM = 0.0045; // XLM (Lumens)
  const estimatedCostUSD = 0.0012; // USD equivalent

  const handleSimulate = () => {
    setIsSimulating(true);
    // Simulate API call
    setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deploy Cost Estimate</DialogTitle>
          <DialogDescription>
            Estimated network fees for deploying to Stellar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cost Display */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/10 mb-2">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-4xl font-bold">{estimatedCostXLM.toFixed(4)} XLM</p>
              <p className="text-sm text-muted-foreground mt-1">
                ≈ ${estimatedCostUSD.toFixed(4)} USD
              </p>
            </div>
          </div>

          {/* Resource Breakdown */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Soroban Resources
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Instructions</span>
                <span className="font-medium">45k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Memory</span>
                <span className="font-medium">32 KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Persistent Storage</span>
                <span className="font-medium">128 bytes</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
              onClick={handleSimulate}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Simulate on Testnet
                </>
              )}
            </Button>
            <Button variant="outline" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Deploy to Stellar
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground">
            Fees paid in Lumens (XLM). Requires Freighter or compatible Stellar wallet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
