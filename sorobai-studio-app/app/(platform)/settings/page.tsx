import { Wallet, Github, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUser } from '@/lib/mock-data';

export default function SettingsPage() {
  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, wallet, and preferences
        </p>
      </div>

      {/* Wallet Section */}
      <div className="bg-background border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-yellow-400/10 p-2">
            <Wallet className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Stellar Wallet</h2>
            <p className="text-sm text-muted-foreground">Connected via Freighter</p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Address</span>
            <code className="text-xs bg-background px-2 py-1 rounded">
              {mockUser.stellarAddress.slice(0, 8)}...{mockUser.stellarAddress.slice(-8)}
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Network</span>
            <span className="text-sm font-medium">Testnet</span>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          Disconnect Wallet
        </Button>
      </div>

      {/* GitHub Section */}
      <div className="bg-background border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-muted p-2">
            <Github className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">GitHub Account</h2>
            <p className="text-sm text-muted-foreground">Connected for project sync</p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Username</span>
            <span className="text-sm font-medium">@{mockUser.githubUsername}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Repositories</span>
            <span className="text-sm font-medium">Auto-sync enabled</span>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          Disconnect GitHub
        </Button>
      </div>

      {/* AI Credits Section */}
      <div className="bg-background border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-blue-400/10 p-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Credits</h2>
            <p className="text-sm text-muted-foreground">For Gemini Flash usage</p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="text-2xl font-bold">{mockUser.credits.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Credits are used for AI-powered code generation and explanations
          </p>
        </div>

        <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
          Recharge Credits
        </Button>
      </div>

      {/* Preferences Section */}
      <div className="bg-background border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-muted p-2">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Preferences</h2>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates about your projects</p>
            </div>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Bounty Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified of new opportunities</p>
            </div>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-save Projects</p>
              <p className="text-xs text-muted-foreground">Automatically sync to GitHub</p>
            </div>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
