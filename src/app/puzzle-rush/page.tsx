
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Play, Repeat } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPuzzleRush } from '@/app/actions';
import { puzzles as allPuzzles, Puzzle } from '@/lib/puzzles';
import Chessboard from '@/components/puzzles/chessboard';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const RUSH_DURATION = 180; // 3 minutes in seconds

export default function PuzzleRushPage() {
    const router = useRouter();
    const { boardTheme } = useTheme();
    const { toast } = useToast();

    const [gameState, setGameState] = useState<'idle' | 'loading' | 'playing' | 'finished'>('idle');
    const [puzzleSequence, setPuzzleSequence] = useState<Puzzle[]>([]);
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(RUSH_DURATION);
    const [timerActive, setTimerActive] = useState(false);
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            setGameState('finished');
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);


    const startRush = useCallback(async () => {
        setGameState('loading');
        const { puzzles: puzzleIds, error } = await getPuzzleRush({ difficulty: 'easy', numberOfPuzzles: 30 });
        if (error || !puzzleIds || puzzleIds.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Failed to start Puzzle Rush',
                description: 'Could not load puzzles. Please try again.',
            });
            setGameState('idle');
            return;
        }

        const sequence = puzzleIds.map(id => allPuzzles.find(p => p.id === id)).filter(Boolean) as Puzzle[];
        setPuzzleSequence(sequence);
        setCurrentPuzzleIndex(0);
        setScore(0);
        setTimeLeft(RUSH_DURATION);
        setGameState('playing');
        setTimerActive(true);

    }, [toast]);
    
    const handleCorrect = () => {
        setScore(prev => prev + 1);
        toast({
            title: 'Correct!',
            description: `You solved puzzle #${currentPuzzleIndex + 1}.`,
            className: 'bg-green-500 text-white'
        });
        
        if (currentPuzzleIndex < puzzleSequence.length - 1) {
            setCurrentPuzzleIndex(prev => prev + 1);
        } else {
            setTimerActive(false);
            setGameState('finished');
        }
    };
    
    const handleIncorrect = () => {
        toast({
            variant: 'destructive',
            title: 'Incorrect Move',
            description: "That's not it. On to the next one!",
        });
        if (currentPuzzleIndex < puzzleSequence.length - 1) {
             setCurrentPuzzleIndex(prev => prev + 1);
        } else {
            setTimerActive(false);
            setGameState('finished');
        }
    };

    const resetGame = () => {
        setGameState('idle');
        setPuzzleSequence([]);
        setCurrentPuzzleIndex(0);
        setScore(0);
        setTimeLeft(RUSH_DURATION);
        setTimerActive(false);
    }
    
    const currentPuzzle = puzzleSequence[currentPuzzleIndex];

    if (gameState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Preparing your puzzles...</h2>
            </div>
        );
    }
    
    if (gameState === 'idle' || gameState === 'finished') {
        return (
             <div className="container mx-auto px-4 py-8 md:py-12 text-center">
                 <Button variant="ghost" onClick={() => router.back()} className="absolute top-4 left-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-4xl font-extrabold tracking-tight">Puzzle Rush</CardTitle>
                        <CardDescription>Solve as many puzzles as you can in 3 minutes.</CardDescription>
                    </CardHeader>
                    {gameState === 'finished' && (
                        <CardContent className="space-y-4">
                            <h3 className="text-2xl font-bold">Time's Up!</h3>
                            <p className="text-5xl font-bold text-primary">{score}</p>
                            <p className="text-muted-foreground">Puzzles Solved</p>
                            <Button onClick={startRush} className="w-full">
                                <Repeat className="mr-2 h-4 w-4" />
                                Play Again
                            </Button>
                        </CardContent>
                    )}
                    {gameState === 'idle' && (
                        <CardContent>
                             <Button onClick={startRush} size="lg" className="w-full">
                                 <Play className="mr-2 h-5 w-5" />
                                 Start Puzzle Rush
                             </Button>
                        </CardContent>
                    )}
                </Card>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4 py-8">
             <div className="mb-4">
                 <div className="flex justify-between items-center mb-2">
                     <h2 className="text-2xl font-bold">Puzzle Rush</h2>
                     <div className="text-2xl font-bold">
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                 </div>
                 <Progress value={(timeLeft / RUSH_DURATION) * 100} />
             </div>
             <div className="grid gap-8 md:grid-cols-3">
                 <div className="md:col-span-2">
                     {currentPuzzle && (
                         <Chessboard
                             key={currentPuzzle.id}
                             puzzle={currentPuzzle}
                             boardTheme={boardTheme}
                             onPuzzleCorrect={handleCorrect}
                             onPuzzleIncorrect={handleIncorrect}
                         />
                     )}
                 </div>
                 <div className="space-y-4">
                     <Card>
                         <CardHeader>
                             <CardTitle>Score</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <p className="text-5xl font-bold text-center text-primary">{score}</p>
                         </CardContent>
                     </Card>
                     <Card>
                         <CardHeader>
                             <CardTitle>Puzzle #{currentPuzzleIndex + 1}</CardTitle>
                             <CardDescription>Rating: {currentPuzzle?.rating}</CardDescription>
                         </CardHeader>
                         <CardContent>
                             <p className="text-sm text-muted-foreground">Find the best move for {currentPuzzle.fen.includes(' w ') ? 'White' : 'Black'}.</p>
                         </CardContent>
                     </Card>
                      <Button onClick={() => setTimerActive(false)} variant="destructive" className="w-full">End Rush</Button>
                 </div>
             </div>
        </div>
    )
}
