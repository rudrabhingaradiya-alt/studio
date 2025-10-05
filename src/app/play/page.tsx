
'use client';

import { useState, useEffect } from 'react';
import { BrainCircuit, User, Users, ChevronLeft, Link as LinkIcon, Clipboard } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Chessboard, { GameResult } from '@/components/puzzles/chessboard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type GameMode = 'bot' | 'online' | 'friend';
type BotLevel = {
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
    id: 'bot',
    title: 'Play vs Bot',
    description: 'Test your skills against our AI challenger.',
    icon: BrainCircuit,
    isAvailable: true,
  },
  {
    id: 'friend',
    title: 'Play with a Friend',
    description: 'Invite a friend to a game using a private link.',
    icon: User,
    isAvailable: true,
  },
];

const botLevels: BotLevel[] = [
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

const BotSelection = ({ onSelect, onBack }: { onSelect: (level: BotLevel) => void, onBack: () => void }) => (
  <div className="container mx-auto px-4 py-8 md:py-12 animate-in fade-in-50">
    <div className="relative mx-auto max-w-3xl text-center">
      <Button variant="ghost" onClick={onBack} className="absolute top-0 left-0 -translate-y-1/2">
        <ChevronLeft className="h-5 w-5 mr-2" />
        Back
      </Button>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        Choose Your Opponent
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Select a bot to match your skill level.
      </p>
    </div>
    <ScrollArea className="mt-12 mx-auto max-w-4xl h-[calc(100vh-22rem)]">
      <div className="grid gap-4 p-1">
        {botLevels.map((level) => (
          <Card
            key={level.rating}
            onClick={() => onSelect(level)}
            className="flex items-center justify-between p-4 transition-all cursor-pointer hover:border-primary hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
               <div className="rounded-full bg-primary/10 p-3 text-primary">
                <BrainCircuit className="h-6 w-6" />
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

const FriendLobby = ({ onBack }: { onBack: () => void }) => {
  const [gameLink, setGameLink] = useState('');
  const { toast } = useToast();

  const handleCreateGame = () => {
    // In a real app, this would call a backend to create a game and get a unique ID
    const gameId = `game_${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}/play/${gameId}`;
    setGameLink(link);
  };
  
  const handleCopyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(gameLink);
      toast({
        title: 'Copied to clipboard!',
        description: 'The game link is ready to be shared.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-in fade-in-50">
      <div className="relative mx-auto max-w-2xl text-center">
        <Button variant="ghost" onClick={onBack} className="absolute top-0 left-0 -translate-y-1/2">
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Play with a Friend
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Create a private game and share the link with your friend to start.
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Game</CardTitle>
            <CardDescription>
              {gameLink ? 'Share this link with your friend.' : 'Click the button to generate a unique game link.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gameLink ? (
              <div className="flex items-center space-x-2">
                <Input value={gameLink} readOnly className="flex-grow" />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button className="w-full" onClick={handleCreateGame}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Create Game Link
              </Button>
            )}
            {gameLink && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Waiting for friend to join...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const GameOverDialog = ({
  result,
  onPlayAgain,
  onBackToMenu,
}: {
  result: GameResult | null;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}) => {
  if (!result) return null;

  const title =
    result === 'checkmate-white'
      ? 'Checkmate! You Won!'
      : result === 'checkmate-black'
      ? 'Checkmate! You Lost.'
      : 'Stalemate! It\'s a Draw.';
  const description =
    result === 'checkmate-white'
      ? 'Congratulations on your victory!'
      : result === 'checkmate-black'
      ? 'Better luck next time. Keep practicing!'
      : 'The game is a draw as no legal moves can be made.';

  return (
    <AlertDialog open={!!result}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onBackToMenu}>
            Back to Menu
          </Button>
          <Button onClick={onPlayAgain}>
            Play Again
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const LeaveGameDialog = ({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <AlertDialog open={isOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
        <AlertDialogDescription>
          Your current game progress will be lost if you exit the match.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Yes, Leave</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);


export default function PlayPage() {
  const [gameState, setGameState] = useState<{
    mode: GameMode | null;
    botLevel: BotLevel | null;
    gameResult: GameResult | null;
    rematchCounter: number;
    showLeaveConfirm: boolean;
  }>({
    mode: null,
    botLevel: null,
    gameResult: null,
    rematchCounter: 0,
    showLeaveConfirm: false,
  });

  const handleModeSelect = (mode: GameMode) => {
    const gameMode = gameModes.find((m) => m.id === mode);
    if (gameMode && gameMode.isAvailable) {
      setGameState(prev => ({ ...prev, mode }));
    }
  };
  
  const handleBotSelect = (level: BotLevel) => {
    setGameState(prev => ({ ...prev, botLevel: level, gameResult: null, rematchCounter: 0 }));
  }

  const handleGameOver = (result: GameResult) => {
    setGameState(prev => ({ ...prev, gameResult: result }));
  };

  const handlePlayAgain = () => {
    setGameState(prev => ({
      ...prev,
      gameResult: null,
      rematchCounter: prev.rematchCounter + 1,
    }));
  };
  
  const handleBackToMenu = () => {
    setGameState({
      mode: null,
      botLevel: null,
      gameResult: null,
      rematchCounter: 0,
      showLeaveConfirm: false,
    });
  }
  
  const handleBackToBotSelection = () => {
    setGameState(prev => ({ ...prev, botLevel: null, gameResult: null }));
  }
  
  const handleBackToModeSelection = () => {
    setGameState(prev => ({ ...prev, mode: null, botLevel: null, gameResult: null }));
  }

  const handleRequestLeave = () => {
    setGameState(prev => ({ ...prev, showLeaveConfirm: true }));
  }

  const handleCancelLeave = () => {
    setGameState(prev => ({ ...prev, showLeaveConfirm: false }));
  }
  
  const handleConfirmLeave = () => {
    setGameState(prev => ({ ...prev, botLevel: null, gameResult: null, showLeaveConfirm: false }));
  }

  if (gameState.mode === 'bot') {
    if (gameState.botLevel) {
      return (
        <div className="container mx-auto px-4 py-8 md:py-12">
           <Button variant="ghost" onClick={handleRequestLeave} className="mb-4">
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to bot selection
          </Button>
          <div className="flex justify-center">
            <Card className="w-full max-w-lg animate-in fade-in-50 zoom-in-95">
              <CardHeader className="text-center">
                <CardTitle>vs. {gameState.botLevel.name} ({gameState.botLevel.rating})</CardTitle>
                <CardDescription>
                  You are playing against the AI. It's your move.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Chessboard
                  key={gameState.rematchCounter}
                  aiLevel={gameState.botLevel.rating}
                  onGameOver={handleGameOver}
                />
              </CardContent>
            </Card>
          </div>
          <GameOverDialog
            result={gameState.gameResult}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
          <LeaveGameDialog
            isOpen={gameState.showLeaveConfirm}
            onCancel={handleCancelLeave}
            onConfirm={handleConfirmLeave}
          />
        </div>
      );
    }
    return <BotSelection onSelect={handleBotSelect} onBack={handleBackToModeSelection} />;
  }
  
  if (gameState.mode === 'friend') {
    return <FriendLobby onBack={handleBackToModeSelection} />;
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
