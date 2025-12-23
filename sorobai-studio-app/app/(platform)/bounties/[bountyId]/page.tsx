'use client';

import { use } from 'react';
import { Calendar, DollarSign, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { mockBounties } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  open: { label: 'Open', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
};

export default function BountyDetailPage({
  params,
}: {
  params: Promise<{ bountyId: string }>;
}) {
  const { bountyId } = use(params);
  const bounty = mockBounties.find((b) => b.id === bountyId) || mockBounties[0];
  const config = statusConfig[bounty.status];

  const mockProposals = [
    {
      id: '1',
      developer: 'stellar_builder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev1',
      proposal: 'I have 3 years of experience building on Stellar. I\'ve worked with the native DEX, AMMs, and path payments. I can deliver this aggregator in 2 weeks with full testing on Testnet.',
      estimatedDays: 14,
      submittedAt: new Date('2024-12-20'),
    },
    {
      id: '2',
      developer: 'soroban_expert',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev2',
      proposal: 'Experienced Soroban developer with multiple deployed contracts on Mainnet. I\'ve built similar aggregators using Rust and the Soroban SDK. Can complete in 10 days.',
      estimatedDays: 10,
      submittedAt: new Date('2024-12-19'),
    },
  ];

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-serif font-bold">{bounty.title}</h1>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-muted-foreground">Posted by {bounty.clientName}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-lg">{bounty.budget.toLocaleString()} XLM</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {formatDistanceToNow(bounty.deadline, { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{bounty.proposalsCount} proposals</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {bounty.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-background border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Description</h2>
        <p className="text-muted-foreground leading-relaxed">
          {bounty.description}
        </p>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Requirements</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Soroban contract must be written in Rust and compiled to WASM</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Include comprehensive unit tests using Soroban SDK</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Provide documentation and deployment guide for Testnet/Mainnet</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Code must follow Stellar best practices and security guidelines</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Submit Proposal */}
      {bounty.status === 'open' && (
        <div className="bg-background border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Submit Your Proposal</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Proposal Details
              </label>
              <Textarea
                placeholder="Describe your approach, experience, and timeline..."
                className="min-h-[120px]"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Estimated Days
                </label>
                <input
                  type="number"
                  placeholder="14"
                  className="w-full h-10 px-3 rounded-md border bg-background"
                />
              </div>
              <Button className="bg-yellow-400 text-black hover:bg-yellow-500 mt-6">
                Submit Proposal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Proposals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Proposals ({mockProposals.length})</h2>
        {mockProposals.map((proposal) => (
          <div key={proposal.id} className="bg-background border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={proposal.avatar}
                  alt={proposal.developer}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{proposal.developer}</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted {formatDistanceToNow(proposal.submittedAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{proposal.estimatedDays} days</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{proposal.proposal}</p>
            {bounty.status === 'open' && (
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
