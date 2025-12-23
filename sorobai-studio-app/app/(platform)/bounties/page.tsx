import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BountyCard } from '@/components/bounties/bounty-card';
import { mockBounties } from '@/lib/mock-data';

const filters = ['All', 'Open', 'In Progress', 'Completed'];

export default function BountiesPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Bounties</h1>
          <p className="text-muted-foreground">
            Find opportunities or post your project needs
          </p>
        </div>
        <Button className="bg-black text-white hover:bg-black/90 gap-2">
          <Plus className="h-4 w-4" />
          Post Bounty
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bounties..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={filter === 'All' ? 'default' : 'outline'}
              size="sm"
              className={filter === 'All' ? 'bg-black text-white hover:bg-black/90' : ''}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Bounties Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {mockBounties.map((bounty) => (
          <BountyCard key={bounty.id} {...bounty} />
        ))}
      </div>
    </div>
  );
}
