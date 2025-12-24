import { Code2, Coins, TrendingUp } from 'lucide-react';
import { mockUser } from '@/lib/mock-data';

const stats = [
  {
    label: 'Projects',
    value: '12',
    icon: Code2,
    change: '+2 this week',
  },
  {
    label: 'AI Credits',
    value: mockUser.credits.toFixed(2),
    icon: Coins,
    change: 'for Gemini usage',
  },
  {
    label: 'Reputation',
    value: mockUser.reputation.toString(),
    icon: TrendingUp,
    change: 'Top 15%',
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-background rounded-lg border p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
