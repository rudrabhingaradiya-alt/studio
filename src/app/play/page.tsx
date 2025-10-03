'use client';

import { useState } from 'react';
import { Swords } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Chessboard from '@/components/puzzles/chessboard';

export default function PlayPage() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Play vs AI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Challenge our AI to a game of chess. Can you outsmart the machine?
        </p>
        {!gameStarted && (
          <Button onClick={() => setGameStarted(true)} size="lg" className="mt-8 bg-primary hover:bg-primary/90">
            <Swords className="mr-2 h-5 w-5" />
            Start New Game
          </Button>
        )}
      </div>

      {gameStarted && (
        <div className="mt-12 flex justify-center">
          <Card className="w-full max-w-lg animate-in fade-in-50 zoom-in-95">
            <CardHeader className="text-center">
              <CardTitle>Game in Progress</CardTitle>
              <CardDescription>
                It's your move. Good luck!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chessboard />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
