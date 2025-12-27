'use client';

import { use, useState, useEffect } from 'react';
import { CodeEditor } from '@/components/studio/code-editor';
import { AIChat } from '@/components/studio/ai-chat';
import { StudioToolbar } from '@/components/studio/studio-toolbar';
import { DeploymentModal } from '@/components/studio/deployment-modal';
import { RefreshCw, Replace, Loader2 } from 'lucide-react';
import { getProject } from '@/app/actions/projects';
import { prepareDeployTransaction, submitDeployment } from '@/app/actions/deployments';
import { Project } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useStellarWallet } from '@/lib/hooks/use-stellar-wallet';

export default function StudioProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const wallet = useStellarWallet();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [code, setCode] = useState('');
  const [replaceMode, setReplaceMode] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    const result = await getProject(projectId);

    if (result.success && result.data) {
      setProject(result.data);
      setCode(result.data.code);
    } else {
      toast.error(result.error || 'Failed to load project');
      router.push('/studio');
    }
    setLoading(false);
  };

  const handleCodeUpdate = (newCode: string) => {
    if (replaceMode) {
      setCode(newCode);
    } else {
      setCode(prev => prev + '\n\n' + newCode);
    }
  };

  const handleDeploy = async () => {
    try {
      // Check wallet connection
      if (!wallet.publicKey) {
        await wallet.connect();
      }

      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Step 1: Prepare deployment transaction
      const prepareResult = await prepareDeployTransaction(projectId);

      if (!prepareResult.success || !prepareResult.data) {
        throw new Error(prepareResult.error || 'Failed to prepare deployment');
      }

      const { deploymentId, transactionXDR } = prepareResult.data;

      // Step 2: Sign with Freighter
      // In production, you would sign the actual XDR transaction
      // const signedXDR = await wallet.signTransaction(transactionXDR);

      // For now, we'll simulate signing
      toast.info('Signing transaction with wallet...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate signing delay
      const signedXDR = `SIGNED_${transactionXDR}`;

      // Step 3: Submit signed transaction
      toast.info('Submitting to Stellar testnet...');
      const submitResult = await submitDeployment(deploymentId, signedXDR);

      if (!submitResult.success || !submitResult.data) {
        throw new Error(submitResult.error || 'Failed to submit deployment');
      }

      // Success!
      setDeploymentResult(submitResult.data);
      toast.success('Contract deployed successfully!');

    } catch (error) {
      console.error('Deployment error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <StudioToolbar
        projectId={projectId}
        projectName={project.name}
        code={code}
        onSaveSuccess={() => setProject(prev => prev ? { ...prev, code } : null)}
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* AI Chat - Left Panel */}
        <div className="w-[400px] flex-shrink-0 h-full overflow-hidden">
          <AIChat onCodeUpdate={handleCodeUpdate} />
        </div>

        {/* Code Editor - Main Panel */}
        <div className="flex-1 bg-background flex flex-col">
          {/* Control de modo de código */}
          <div className="border-b p-2 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Code insertion mode:
              </span>
              <button
                onClick={() => setReplaceMode(!replaceMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${replaceMode
                  ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                  : 'bg-green-500/10 text-green-600 border border-green-500/20'
                  }`}
              >
                {replaceMode ? (
                  <>
                    <Replace className="h-3 w-3" />
                    Replace
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Append
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {replaceMode ? 'AI code will replace editor content' : 'AI code will be added to the end'}
            </p>
          </div>

          <div className="flex-1">
            <CodeEditor
              value={code}
              onChange={(value) => setCode(value || '')}
              language={project.language}
            />
          </div>
        </div>
      </div>

      <DeploymentModal
        open={showDeployModal}
        onOpenChange={setShowDeployModal}
        onDeploy={handleDeploy}
        deploymentResult={deploymentResult}
      />
    </div>
  );
}
