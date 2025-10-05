
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { puzzles } from '@/lib/puzzles';
import Chessboard from '@/components/puzzles/chessboard';
import { useTheme } from '@/context/theme-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, ArrowLeft, RotateCw, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PuzzlePage() {
  const { id } = useParams();
  const router = useRouter();
  const { boardTheme } = useTheme();
  const { toast } = useToast();

  const puzzle = puzzles.find((p) => p.id === id);

  const [puzzleState, setPuzzleState] = useState<'solving' | 'correct' | 'incorrect'>('solving');
  const [key, setKey] = useState(0); // to reset the board
  const [showSolution, setShowSolution] = useState(false);

  const handleCorrect = () => {
    setPuzzleState('correct');
    toast({
      title: 'Puzzle Solved!',
      description: 'Great move! You found the solution.',
    });
  };

  const handleIncorrect = () => {
    setPuzzleState('incorrect');
     toast({
      variant: 'destructive',
      title: 'Incorrect Move',
      description: "That's not the right move. Try again!",
    });
    setTimeout(() => setPuzzleState('solving'), 2000);
  };
  
  const resetPuzzle = () => {
    setPuzzleState('solving');
    setKey(prev => prev + 1);
    setShowSolution(false);
  }

  if (!puzzle) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h1 className="text-2xl font-bold">Puzzle not found</h1>
        <Button onClick={() => router.push('/puzzles')} className="mt-4">
          Back to Puzzles
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
       <Button variant="ghost" onClick={() => router.push('/puzzles')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Puzzles
        </Button>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
           <Chessboard
            key={key}
            puzzle={puzzle}
            boardTheme={boardTheme}
            onPuzzleCorrect={handleCorrect}
            onPuzzleIncorrect={handleIncorrect}
          />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{puzzle.id.toUpperCase()}</CardTitle>
              <CardDescription>
                Rating: {puzzle.rating} | Theme: {puzzle.theme}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-sm text-muted-foreground">
                {puzzle.difficulty === 'easy' && 'A beginner-friendly puzzle to practice basic tactics.'}
                {puzzle.difficulty === 'medium' && 'A moderately challenging puzzle to test your skills.'}
                {puzzle.difficulty === 'hard' && 'An advanced puzzle for experienced players.'}
               </p>

              {puzzleState === 'correct' && (
                <Alert variant="default" className="bg-green-100 dark:bg-green-900/50 border-green-500">
                  <CheckCircle className="h-4 w-4" color="green" />
                  <AlertTitle>Correct!</AlertTitle>
                  <AlertDescription>
                    You found the best move. Well done!
                  </AlertDescription>
                </Alert>
              )}

              {puzzleState === 'incorrect' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Incorrect Move</AlertTitle>
                  <AlertDescription>
                    That's not it. Give it another try.
                  </AlertDescription>
                </Alert>
              )}

              {puzzleState === 'solving' && (
                 <Alert>
                  <AlertTitle>
                    {puzzle.fen.includes(' w ') ? 'White to move' : 'Black to move'}
                  </AlertTitle>
                  <AlertDescription>
                    Find the best move to gain an advantage.
                  </AlertDescription>
                </Alert>
              )}
               <div className="flex gap-2">
                <Button onClick={resetPuzzle} variant="outline" className="w-full">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Reset Puzzle
                  </Button>
                  <Button onClick={() => setShowSolution(true)} variant="secondary" className="w-full">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Show Solution
                  </Button>
               </div>
               {showSolution && (
                  <Alert variant="default" className="border-blue-500 bg-blue-50 dark:bg-blue-900/50">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    <AlertTitle>Solution</AlertTitle>
                    <AlertDescription>
                      The correct move is: <strong>{puzzle.solution[0]}</strong>
                    </AlertDescription>
                  </Alert>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
