'use client';

import { useState } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import type { PuzzleSelectionOutput } from '@/ai/flows/personalized-puzzle-difficulty';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Chessboard from '@/components/puzzles/chessboard';
import { getNextPuzzle } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockGameHistory = [
  { puzzleId: 'pz001', solved: true, attempts: 1 },
  { puzzleId: 'pz002', solved: true, attempts: 2 },
  { puzzleId: 'pz003', solved: false, attempts: 3 },
];
const mockAvailablePuzzles = ['pz004', 'pz005', 'pz006', 'pz007', 'pz008'];

export default function PuzzlesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PuzzleSelectionOutput | null>(null);
  const { toast } = useToast();

  const handleGetPuzzle = async () => {
    setIsLoading(true);
    setResult(null);
    const { data, error } = await getNextPuzzle({
      gameHistory: mockGameHistory,
      availablePuzzles: mockAvailablePuzzles,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch a personalized puzzle. Please try again.',
      });
    } else {
      setResult(data);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Personalized Puzzles
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Let our AI find the perfect challenge for you based on your history.
        </p>
        <Button onClick={handleGetPuzzle} disabled={isLoading} size="lg" className="mt-8 bg-accent hover:bg-accent/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Finding Your Next Puzzle...
            </>
          ) : (
            'Get Your Next Puzzle'
          )}
        </Button>
      </div>

      {result && (
        <div className="mt-12 flex justify-center">
          <Card className="w-full max-w-lg animate-in fade-in-50 zoom-in-95">
            <CardHeader>
              <CardTitle>Puzzle: {result.selectedPuzzleId}</CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <span>AI Recommendation</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="italic text-muted-foreground">"{result.reason}"</p>
              <div className="mt-4">
                <Chessboard isStatic={true} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Start Solving</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
