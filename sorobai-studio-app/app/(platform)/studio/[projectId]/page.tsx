'use client';

import { use, useState } from 'react';
import { CodeEditor } from '@/components/studio/code-editor';
import { AIChat } from '@/components/studio/ai-chat';
import { StudioToolbar } from '@/components/studio/studio-toolbar';
import { ResourcePanel } from '@/components/studio/resource-panel';
import { mockProjects } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { RefreshCw, Replace } from 'lucide-react';

export default function StudioProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const project = mockProjects.find((p) => p.id === projectId) || mockProjects[0];
  const [showCostModal, setShowCostModal] = useState(false);
  const [code, setCode] = useState(project.code);
  const [replaceMode, setReplaceMode] = useState(true); // true = replace, false = append

  // Función para actualizar código desde el chat
  const handleCodeUpdate = (newCode: string) => {
    if (replaceMode) {
      setCode(newCode);
    } else {
      setCode(prev => prev + '\n\n' + newCode);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <StudioToolbar
        projectName={project.name}
        onEstimateCost={() => setShowCostModal(true)}
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

      {/* Cost Estimate Modal */}
      <ResourcePanel
        open={showCostModal}
        onOpenChange={setShowCostModal}
      />
    </div>
  );
}
