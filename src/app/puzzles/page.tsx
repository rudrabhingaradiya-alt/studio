
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Info, Star } from 'lucide-react';
import { puzzles, type Puzzle } from '@/lib/puzzles';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Status = 'all' | 'solved' | 'unsolved';
type Difficulty = 'all' | 'easy' | 'medium' | 'hard';
type SortBy = 'rating-asc' | 'rating-desc' | 'default';

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

export default function PuzzlesPage() {
  const router = useRouter();
  // In a real app, solved status would come from user data
  const [solvedPuzzles] = useState(['pz001']);
  const [filters, setFilters] = useState({
    status: 'all' as Status,
    difficulty: 'all' as Difficulty,
    sortBy: 'default' as SortBy,
  });

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getFilteredPuzzles = () => {
    let filtered = [...puzzles];

    if (filters.status !== 'all') {
      filtered = filtered.filter((p) =>
        filters.status === 'solved'
          ? solvedPuzzles.includes(p.id)
          : !solvedPuzzles.includes(p.id)
      );
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter((p) => p.difficulty === filters.difficulty);
    }

    switch (filters.sortBy) {
      case 'rating-asc':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  };

  const filteredPuzzles = getFilteredPuzzles();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Chess Puzzles
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sharpen your tactical vision and calculation skills.
        </p>
      </header>

      <Card className="mb-8">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            <Select
              value={filters.status}
              onValueChange={(v: Status) => handleFilterChange('status', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Puzzles</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
                <SelectItem value="unsolved">Unsolved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.difficulty}
              onValueChange={(v: Difficulty) =>
                handleFilterChange('difficulty', v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(v: SortBy) => handleFilterChange('sortBy', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="rating-asc">Rating (Low to High)</SelectItem>
                <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPuzzles.map((puzzle) => (
          <Card
            key={puzzle.id}
            className="flex flex-col transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{puzzle.id.toUpperCase()}</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {solvedPuzzles.includes(puzzle.id) && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Solved!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>Rating: {puzzle.rating}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-3 w-3 rounded-full',
                    difficultyColors[puzzle.difficulty]
                  )}
                />
                <span className="text-sm font-medium capitalize">
                  {puzzle.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground capitalize">
                  {puzzle.theme}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => router.push(`/puzzles/${puzzle.id}`)}
              >
                Solve Puzzle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

    
