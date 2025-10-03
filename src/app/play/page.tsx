'use client';

import { useState } from 'react';
import { Bot, User, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Chessboard from '@/components/puzzles/chessboard';

type GameMode = 'robot' | 'online' | 'friend';

const gameModes: {
  id: GameMode;
  title: string;
  description: string;
  icon: React.ElementType;
  isAvailable: boolean;
}[] = [
  {
    id: 'online',
    title: 'Play Online',
    description: 'Challenge a random opponent from around the world.',
    icon: Users,
    isAvailable: false,
  },
  {
    id: 'robot',
    title: 'Play vs Robot',
    description: 'Test your skills against our AI challenger.',
    icon: Bot,
    isAvailable: true,
  },
  {
    id: 'friend',
    title: 'Play with a Friend',
    description: 'Invite a friend to a game using a private link.',
    icon: User,
    isAvailable: false,
  },
];

export default function PlayPage() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    const gameMode = gameModes.find((m) => m.id === mode);
    if (gameMode && gameMode.isAvailable) {
      setSelectedMode(mode);
    }
  };

  if (selectedMode === 'robot') {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg animate-in fade-in-50 zoom-in-95">
            <CardHeader className="text-center">
              <CardTitle>Game in Progress</CardTitle>
              <CardDescription>
                You are playing against the AI. It's your move.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chessboard />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Play Chess
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose a game mode below to start your match.
        </p>
      </div>

      <div className="mt-12 mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
        {gameModes.map((mode) => (
          <Card
            key={mode.id}
            onClick={() => handleModeSelect(mode.id)}
            className={`flex flex-col text-center transition-all ${
              mode.isAvailable
                ? 'cursor-pointer hover:border-primary hover:shadow-lg'
                : 'cursor-not-allowed opacity-60'
            }`}
          >
            <CardHeader className="items-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                <mode.icon className="h-8 w-8" />
              </div>
              <CardTitle>{mode.title}</CardTitle>
              {!mode.isAvailable && (
                <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{mode.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
