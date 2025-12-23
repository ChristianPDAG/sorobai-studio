'use client';

import { use, useState } from 'react';
import { CodeEditor } from '@/components/studio/code-editor';
import { AIChat } from '@/components/studio/ai-chat';
import { StudioToolbar } from '@/components/studio/studio-toolbar';
import { ResourcePanel } from '@/components/studio/resource-panel';
import { mockProjects } from '@/lib/mock-data';

export default function StudioProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const project = mockProjects.find((p) => p.id === projectId) || mockProjects[0];
  const [showCostModal, setShowCostModal] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <StudioToolbar 
        projectName={project.name}
        onEstimateCost={() => setShowCostModal(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* AI Chat - Left Panel */}
        <div className="w-[400px] flex-shrink-0">
          <AIChat />
        </div>

        {/* Code Editor - Main Panel */}
        <div className="flex-1 bg-background">
          <CodeEditor
            value={project.code}
            language={project.language}
          />
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
