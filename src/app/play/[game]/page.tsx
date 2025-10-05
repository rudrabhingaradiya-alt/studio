
'use client';

import { useState, useEffect } from 'react';
import { BrainCircuit, User, Users, ChevronLeft, Link as LinkIcon, Clipboard, Settings } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Chessboard, { GameResult } from '@/components/puzzles/chessboard';
import { Button } from '@/components/ui/button';
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
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/context/theme-context';

type GameMode = 'bot' | 'online' | 'friend';
type PlayerColor = 'white' | 'black' | 'random';

const botRatingMap: { [key: number]: string } = {
  200: "Newcomer", 400: "Beginner", 600: "Novice", 800: "Intermediate", 1000: "Adept",
  1200: "Skilled", 1500: "Expert", 2000: "Master", 2500: "Grandmaster", 2800: "Super Grandmaster",
  3200: "Stockfish"
};

interface BotGameConfig {
  rating: number;
  color: PlayerColor;
  timeControl: string;
}

const BotGameSetup = ({ onStart, onBack }: { onStart: (config: BotGameConfig) => void; onBack: () => void }) => {
  const [config, setConfig] = useState<BotGameConfig>({
    rating: 800,
    color: 'random',
    timeControl: 'unlimited',
  });

  const handleRatingChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, rating: value[0] }));
  };

  const getBotName = (rating: number) => {
    const ratings = Object.keys(botRatingMap).map(Number);
    const closestRating = ratings.reduce((prev, curr) => 
      (Math.abs(curr - rating) < Math.abs(prev - rating) ? curr : prev)
    );
    return botRatingMap[closestRating];
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-in fade-in-50">
      <div className="relative mx-auto max-w-2xl text-center">
        <Button variant="ghost" onClick={onBack} className="absolute top-0 left-0 -translate-y-1/2">
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Customize Your Game
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Set up the rules and challenge the bot.
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-6 w-6"/> Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label>Bot Strength: <span className="font-bold">{getBotName(config.rating)} ({config.rating})</span></Label>
              <Slider
                min={200}
                max={3200}
                step={50}
                value={[config.rating]}
                onValueChange={handleRatingChange}
              />
            </div>
            
            <div className="space-y-4">
              <Label>Your Piece Color</Label>
              <RadioGroup
                value={config.color}
                onValueChange={(value: PlayerColor) => setConfig(prev => ({ ...prev, color: value }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="white" />
                  <Label htmlFor="white">White</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="black" id="black" />
                  <Label htmlFor="black">Black</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random">Random</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Time Control</Label>
              <Select 
                value={config.timeControl}
                onValueChange={(value: string) => setConfig(prev => ({...prev, timeControl: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time control" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full" size="lg" onClick={() => onStart(config)}>Start Game</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const FriendLobby = ({ onBack }: { onBack: () => void }) => {
  const [gameLink, setGameLink] = useState('');
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.game && typeof params.game === 'string' && params.game.startsWith('game_')) {
      // Logic to join a game would go here
    } else {
      // Creating a new game
    }
  }, [params.game]);

  const handleCreateGame = () => {
    const gameId = `game_${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}/play/${gameId}`;
    setGameLink(link);
    // In a real app, you'd navigate to this link or update state
    // For now, just showing the link
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

const BotGameScreen = ({ config, onExit, onRematch, gameResult, onGameOver }: { config: BotGameConfig, onExit: () => void, onRematch: () => void, gameResult: GameResult | null, onGameOver: (result: GameResult) => void }) => {
    const { boardTheme } = useTheme();
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [rematchCounter, setRematchCounter] = useState(0);

    const getBotName = (rating: number) => {
        const ratings = Object.keys(botRatingMap).map(Number);
        const closestRating = ratings.reduce((prev, curr) => 
          (Math.abs(curr - rating) < Math.abs(prev - rating) ? curr : prev)
        );
        return botRatingMap[closestRating];
    }

    const handlePlayAgain = () => {
        onRematch();
        setRematchCounter(prev => prev + 1);
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
            <Button variant="ghost" onClick={() => setShowLeaveConfirm(true)} className="absolute top-4 left-4">
                <ChevronLeft className="h-5 w-5 mr-2" />
                Exit Game
            </Button>
            <div className="flex justify-center">
                <Card className="w-full max-w-lg animate-in fade-in-50 zoom-in-95">
                    <CardHeader className="text-center">
                        <CardTitle>vs. {getBotName(config.rating)} ({config.rating})</CardTitle>
                        <CardDescription>
                            You are playing against the AI. It's your move.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Chessboard
                            key={rematchCounter}
                            aiLevel={config.rating}
                            onGameOver={onGameOver}
                            playerColor={config.color}
                            boardTheme={boardTheme}
                        />
                    </CardContent>
                </Card>
            </div>
            <GameOverDialog
                result={gameResult}
                onPlayAgain={handlePlayAgain}
                onBackToMenu={onExit}
            />
            <LeaveGameDialog
                isOpen={showLeaveConfirm}
                onCancel={() => setShowLeaveConfirm(false)}
                onConfirm={onExit}
            />
        </div>
    );
}

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const gameMode = params.game as GameMode;

  const [view, setView] = useState<'setup' | 'playing'>('setup');
  const [botGameConfig, setBotGameConfig] = useState<BotGameConfig | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const handleBackToPlayMenu = () => {
    router.push('/play');
  };

  const handleBotGameStart = (config: BotGameConfig) => {
    setBotGameConfig(config);
    setGameResult(null);
    setView('playing');
  };

  const handleRematch = () => {
    setGameResult(null);
    // The key on the Chessboard component handles the actual board reset
  };

  const handleExitGame = () => {
    setView('setup');
    setBotGameConfig(null);
    setGameResult(null);
  };

  if (gameMode === 'bot') {
    if (view === 'playing' && botGameConfig) {
      return (
        <BotGameScreen
          config={botGameConfig}
          onExit={handleExitGame}
          gameResult={gameResult}
          onGameOver={setGameResult}
          onRematch={handleRematch}
        />
      );
    }
    return <BotGameSetup onStart={handleBotGameStart} onBack={handleBackToPlayMenu} />;
  }

  if (gameMode === 'friend' || (typeof params.game === 'string' && params.game.startsWith('game_'))) {
    return <FriendLobby onBack={handleBackToPlayMenu} />;
  }
  
  // Fallback for online (coming soon) or invalid modes
  if (gameMode === 'online') {
      return (
          <div className="container mx-auto px-4 py-8 md:py-12 text-center">
              <h1 className="text-4xl font-bold mb-4">Online Play</h1>
              <p className="text-xl text-muted-foreground mb-8">This feature is coming soon!</p>
              <Button onClick={handleBackToPlayMenu}>Back to Play Menu</Button>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Invalid Game Mode</h1>
        <p className="text-xl text-muted-foreground mb-8">The game mode you selected does not exist.</p>
        <Button onClick={handleBackToPlayMenu}>Back to Play Menu</Button>
    </div>
  );
}
