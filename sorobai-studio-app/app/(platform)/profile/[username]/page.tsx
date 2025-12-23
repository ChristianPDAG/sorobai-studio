'use client';

import { use } from 'react';
import { Github, MapPin, Calendar, Award, Code2, Briefcase, Heart, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUser, mockProjects, mockHubContracts } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  
  // Mock: En producción, buscar usuario por username
  const user = mockUser;
  const isOwnProfile = username === 'me' || username === user.githubUsername;

  // Mock: Filtrar proyectos públicos del usuario
  const publicProjects = mockProjects.filter(p => p.isPublic);
  
  // Mock: Contratos del usuario en el Hub
  const userContracts = mockHubContracts.slice(0, 2);

  // Mock: Bounties completados
  const completedBounties = 3;
  const totalEarnings = 1200; // XLM

  return (
    <div className="container py-8 space-y-8 max-w-6xl">
      {/* Header Section */}
      <div className="bg-background border rounded-lg p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <img
            src={user.githubAvatarUrl}
            alt={user.githubUsername}
            className="h-32 w-32 rounded-full border-4 border-yellow-400"
          />

          {/* User Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">
                @{user.githubUsername}
              </h1>
              <p className="text-muted-foreground">{user.bio}</p>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold">{user.reputation}</span>
                <span className="text-muted-foreground">Reputation</span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">{publicProjects.length}</span>
                <span className="text-muted-foreground">Public Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-green-600" />
                <span className="font-semibold">{completedBounties}</span>
                <span className="text-muted-foreground">Bounties Completed</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-4 text-sm">
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined December 2024</span>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" asChild>
                  <Link href="/settings">Edit Profile</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Stellar Wallet Badge */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Stellar Wallet
            </p>
            <code className="text-xs bg-background px-2 py-1 rounded block">
              {user.stellarAddress.slice(0, 8)}...{user.stellarAddress.slice(-8)}
            </code>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-600"></div>
              <span>Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-background border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          Expertise Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className="bg-yellow-400/10 border border-yellow-400/50 rounded-lg px-4 py-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Soroban Expert</span>
          </div>
          <div className="bg-blue-400/10 border border-blue-400/50 rounded-lg px-4 py-2 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Rust Developer</span>
          </div>
          <div className="bg-green-400/10 border border-green-400/50 rounded-lg px-4 py-2 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Bounty Hunter</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-6">
        {/* Public Contracts */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Public Contracts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {userContracts.map((contract) => (
              <Link
                key={contract.id}
                href={`/hub/${contract.id}`}
                className="bg-background border rounded-lg p-6 hover:shadow-lg transition-all hover:border-yellow-400/50"
              >
                <h3 className="font-semibold text-lg mb-2">{contract.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {contract.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {contract.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {contract.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {contract.forks}
                  </span>
                  <span>•</span>
                  <span>Updated {formatDistanceToNow(contract.updatedAt, { addSuffix: true })}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bounty Activity */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Bounty Activity</h2>
          <div className="bg-background border rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{completedBounties}</p>
                <p className="text-sm text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{totalEarnings} XLM</p>
                <p className="text-sm text-muted-foreground mt-1">Total Earnings</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">100%</p>
                <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-background border rounded-lg divide-y">
            <div className="p-4 flex items-start gap-4">
              <div className="rounded-full bg-green-400/10 p-2">
                <Code2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Published <span className="font-semibold">Soroban Token Standard</span> to Community Hub
                </p>
                <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-4">
              <div className="rounded-full bg-blue-400/10 p-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Completed bounty <span className="font-semibold">Stellar DEX Aggregator</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-4">
              <div className="rounded-full bg-yellow-400/10 p-2">
                <Award className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Earned <span className="font-semibold">Soroban Expert</span> badge
                </p>
                <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
