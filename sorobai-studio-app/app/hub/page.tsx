'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContractCard } from '@/components/hub/contract-card';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/marketing/footer';
import { getHubProjects } from '@/app/actions/projects';
import { ProjectWithStats } from '@/types';
import { toast } from 'sonner';

const categories = ['All', 'DeFi', 'NFT', 'DAO', 'Token', 'Escrow', 'Oracle', 'Payments'];

export default function HubPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load projects when category or search changes
  useEffect(() => {
    loadProjects();
  }, [selectedCategory, debouncedSearch]);

  const loadProjects = async () => {
    setLoading(true);
    const result = await getHubProjects({
      tag: selectedCategory !== 'All' ? selectedCategory : undefined,
      search: debouncedSearch || undefined,
    });

    if (result.success && result.data) {
      setProjects(result.data);
    } else {
      toast.error(result.error || 'Failed to load projects');
    }
    setLoading(false);
  };

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? 'default' : 'outline'}
                  size="sm"
                  className={category === selectedCategory ? 'bg-black text-white hover:bg-black/90' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Contracts Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'All'
                  ? 'No projects found matching your criteria'
                  : 'No public projects yet'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ContractCard
                  key={project.id}
                  project={project}
                  onUpdate={loadProjects}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
