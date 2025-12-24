import Link from 'next/link';
import { Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface BountyCardProps {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed';
  deadline: Date;
  tags: string[];
  clientName: string;
  proposalsCount: number;
}

const statusColors = {
  open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export function BountyCard({
  id,
  title,
  description,
  budget,
  status,
  deadline,
  tags,
  clientName,
  proposalsCount,
}: BountyCardProps) {
  return (
    <div className="bg-background rounded-lg border p-6 hover:shadow-lg transition-all hover:border-yellow-400/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}>
              {status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <Link href={`/bounties/${id}`} className="group">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-yellow-600 transition-colors">
              {title}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold text-foreground">{budget.toLocaleString()} XLM</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(deadline, { addSuffix: true })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{proposalsCount} proposals</span>
          </div>
          
          <Button size="sm" className="bg-black text-white hover:bg-black/90" asChild>
            <Link href={`/bounties/${id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
