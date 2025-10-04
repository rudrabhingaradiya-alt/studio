'use client';

import { useState } from 'react';
import { Bot, User, Users, ChevronLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Chessboard from '@/components/puzzles/chessboard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type GameMode = 'robot' | 'online' | 'friend';
type RobotLevel = {
  name: string;
  rating: number;
  description: string;
};

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

const robotLevels: RobotLevel[] = [
  { name: "Newcomer", rating: 200, description: "Just learning the moves." },
  { name: "Rookie", rating: 250, description: "Knows how the pieces move." },
  { name: "Beginner", rating: 400, description: "Understands basic strategy." },
  { name: "Novice", rating: 600, description: "Starts to see simple tactics." },
  { name: "Intermediate", rating: 800, description: "Avoids basic blunders." },
  { name: "Adept", rating: 950, description: "Can execute simple combinations." },
  { name: "Experienced", rating: 1000, description: "A solid, casual player." },
  { name: "Talented", rating: 1100, description: "Developing tactical vision." },
  { name: "Skilled", rating: 1200, description: "Thinks a few moves ahead." },
  { name: "Advanced", rating: 1350, description: "Positional play awareness." },
  { name: "Expert", rating: 1500, description: "Strong tactical awareness." },
  { name: "Master", rating: 2000, description: "Deep strategic understanding." },
  { name: "Grandmaster", rating: 2500, description: "World-class performance." },
  { name: "Elite", rating: 2750, description: "Near-perfect tactical play." },
  { name: "Super Grandmaster", rating: 2800, description: "The pinnacle of chess skill." },
  { name: "Titan", rating: 2900, description: "Legendary-tier AI opponent." },
  { name: "Stockfish", rating: 3200, description: "The strongest chess engine." },
];

const RobotSelection = ({ onSelect, onBack }: { onSelect: (level: RobotLevel) => void, onBack: () => void }) => (
  <div className="container mx-auto px-4 py-8 md:py-12 animate-in fade-in-50">
    <div className="mx-auto max-w-3xl text-center">
      <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4 md:top-8 md:left-8">
        <ChevronLeft className="h-5 w-5 mr-2" />
        Back
      </Button>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        Choose Your Opponent
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Select a robot to match your skill level.
      </p>
    </div>
    <ScrollArea className="mt-12 mx-auto max-w-4xl h-[calc(100vh-22rem)]">
      <div className="grid gap-4 p-1">
        {robotLevels.map((level) => (
          <Card
            key={level.rating}
            onClick={() => onSelect(level)}
            className="flex items-center justify-between p-4 transition-all cursor-pointer hover:border-primary hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
               <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{level.name}</CardTitle>
                <CardDescription>{level.description}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{level.rating}</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  </div>
);


export default function PlayPage() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedRobotLevel, setSelectedRobotLevel] = useState<RobotLevel | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    const gameMode = gameModes.find((m) => m.id === mode);
    if (gameMode && gameMode.isAvailable) {
      setSelectedMode(mode);
    }
  };
  
  const handleRobotSelect = (level: RobotLevel) => {
    setSelectedRobotLevel(level);
  }

  const resetSelection = () => {
    setSelectedMode(null);
    setSelectedRobotLevel(null);
  }

  if (selectedMode === 'robot') {
    if (selectedRobotLevel) {
      return (
        <div className="container mx-auto px-4 py-8 md:py-12">
           <Button variant="ghost" onClick={resetSelection} className="mb-4">
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to menu
          </Button>
          <div className="flex justify-center">
            <Card className="w-full max-w-lg animate-in fade-in-50 zoom-in-95">
              <CardHeader className="text-center">
                <CardTitle>vs. {selectedRobotLevel.name} ({selectedRobotLevel.rating})</CardTitle>
                <CardDescription>
                  You are playing against the AI. It's your move.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Chessboard aiLevel={selectedRobotLevel.rating} />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return <RobotSelection onSelect={handleRobotSelect} onBack={() => setSelectedMode(null)} />;
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
