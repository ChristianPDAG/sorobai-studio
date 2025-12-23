import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContractCard } from '@/components/hub/contract-card';
import { mockHubContracts } from '@/lib/mock-data';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/marketing/footer';

const categories = ['All', 'DeFi', 'NFT', 'DAO', 'Token', 'Escrow'];

export default function HubPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Community Hub</h1>
            <p className="text-muted-foreground">
              Discover, fork, and learn from community-verified Soroban contracts
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === 'All' ? 'default' : 'outline'}
                  size="sm"
                  className={category === 'All' ? 'bg-black text-white hover:bg-black/90' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Contracts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockHubContracts.map((contract) => (
              <ContractCard key={contract.id} {...contract} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
