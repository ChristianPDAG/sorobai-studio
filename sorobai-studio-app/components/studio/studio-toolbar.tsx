'use client';

import { useState } from 'react';
import {
  Play,
  Save,
  Loader2,
  DollarSign,
  MoreVertical,
  Settings,
  Download,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { saveProjectCode, estimateCost } from '@/app/actions/deployments';
import { toast } from 'sonner';
import { CostEstimateModal } from './cost-estimate-modal';
import { ComingSoonModal } from './coming-soon-modal';

interface StudioToolbarProps {
  projectId: string;
  projectName: string;
  code: string;
  saving?: boolean;
  onSaveSuccess?: () => void;
}

export function StudioToolbar({
  projectId,
  projectName,
  code,
  saving = false,
  onSaveSuccess,
}: StudioToolbarProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [costEstimate, setCostEstimate] = useState<any>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveProjectCode(projectId, code);

      if (result.success) {
        toast.success('Code saved successfully!', {
          description: `${result.byteLength} bytes`,
        });
        onSaveSuccess?.();
      } else {
        toast.error(result.error || 'Failed to save code');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEstimateCost = async () => {
    setEstimating(true);
    setShowCostModal(true);

    try {
      const result = await estimateCost(projectId);

      if (result.success && result.data) {
        setCostEstimate(result.data);
      } else {
        toast.error(result.error || 'Failed to estimate cost');
        setShowCostModal(false);
      }
    } catch (error) {
      console.error('Estimate error:', error);
      toast.error('An unexpected error occurred');
      setShowCostModal(false);
    } finally {
      setEstimating(false);
    }
  };

  const handleDeployClick = () => {
    // Don't call any action, just show coming soon modal
    setShowComingSoonModal(true);
  };

  const handleDeployFromModal = () => {
    // Don't call any action, just show coming soon modal
    setShowCostModal(false);
    setShowComingSoonModal(true);
  };

  return (
    <>
      <div className="h-14 border-b bg-background flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg">{projectName}</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Testnet
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {saving || isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>All changes saved</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleSave}
            disabled={isSaving || saving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Save</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleEstimateCost}
            disabled={estimating}
          >
            {estimating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Estimate Cost</span>
          </Button>

          <Button
            size="sm"
            className="bg-yellow-400 text-black hover:bg-yellow-500 gap-2 opacity-50 cursor-not-allowed"
            onClick={handleDeployClick}
            disabled
            title="Coming soon"
          >
            <Play className="h-4 w-4" />
            Deploy
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Code
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CostEstimateModal
        open={showCostModal}
        onOpenChange={setShowCostModal}
        estimate={costEstimate}
        loading={estimating}
        onDeploy={handleDeployFromModal}
      />

      <ComingSoonModal
        open={showComingSoonModal}
        onOpenChange={setShowComingSoonModal}
      />
    </>
  );
}
