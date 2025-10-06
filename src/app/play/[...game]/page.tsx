
'use client';

import { useState, useEffect } from 'react';
import { BrainCircuit, User, Users, ChevronLeft, Link as LinkIcon, Clipboard, Settings, Lock, CheckCircle } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/context/theme-context';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type GameMode = 'bot' | 'online' | 'friend';
type PlayerColor = 'white' | 'black' | 'random';

const botLevels: { rating: number; name: string }[] = [
    { rating: 250, name: "Newcomer" },
    { rating: 300, name: "Rookie" },
    { rating: 350, name: "Apprentice" },
    { rating: 400, name: "Beginner" },
    { rating: 450, name: "Novice" },
    { rating: 500, name: "Learner" },
    { rating: 550, name: "Aspirant" },
    { rating: 600, name: "Hobbyist" },
    { rating: 650, name: "Enthusiast" },
    { rating: 700, name: "Player" },
    { rating: 750, name: "Regular" },
    { rating: 800, name: "Intermediate" },
    { rating: 850, name: "Club Player" },
    { rating: 900, name: "Steady" },
    { rating: 950, name: "Experienced" },
    { rating: 1000, name: "Adept" },
    { rating: 1050, name: "Strategist" },
    { rating: 1100, name: "Tactician" },
    { rating: 1150, name: "Advanced" },
    { rating: 1200, name: "Skilled" },
    { rating: 1250, name: "Proficient" },
    { rating: 1300, name: "Challenger" },
    { rating: 1350, name: "Veteran" },
    { rating: 1400, name: "Sharp" },
    { rating: 1450, name: "Seasoned" },
    { rating: 1500, name: "Expert" },
    { rating: 1550, name: "Specialist" },
    { rating: 1600, name: "Candidate" },
    { rating: 1650, name: "Strong" },
    { rating: 1700, name: "Elite" },
    { rating: 1750, name: "Dominant" },
    { rating: 1800, name: "Formidable" },
    { rating: 1850, name: "Mighty" },
    { rating: 1900, name: "Fierce" },
    { rating: 1950, name: "Tournament Pro" },
    { rating: 2000, name: "Master" },
    { rating: 2050, name: "Senior Master" },
    { rating: 2100, name: "National Master" },
    { rating: 2150, name: "FIDE Master" },
    { rating: 2200, name: "International Master" },
    { rating: 2250, name: "Grandmaster Candidate" },
    { rating: 2300, name: "Grandmaster" },
    { rating: 2350, name: "Super Grandmaster" },
    { rating: 2400, name: "Champion" },
    { rating: 2450, name: "World Class" },
    { rating: 2500, name: "Legend" },
    { rating: 2550, name: "Titan" },
    { rating: 2600, name: "Virtuoso" },
    { rating: 2650, name: "Genius" },
    { rating: 2700, name: "Prodigy" },
    { rating: 2750, name: "Phenom" },
    { rating: 2800, name: "Maestro" },
    { rating: 2850, name: "The Oracle" },
    { rating: 2900, name: "The Thinker" },
    { rating: 2950, name: "The Engine" },
    { rating: 3000, name: "The Centaur" },
    { rating: 3050, name: "Deep Thought" },
    { rating: 3100, name: "Alpha" },
    { rating: 3150, name: "Stockfish Level" },
    { rating: 3200, name: "Ultimate AI" }
];


interface BotGameConfig {
  rating: number;
  color: PlayerColor;
  timeControl: string;
}

const BotGameSetup = ({ onStart, onBack }: { onStart: (config: BotGameConfig) => void; onBack: () => void }) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(botLevels[0].rating);
  const [config, setConfig] = useState<BotGameConfig>({
    rating: botLevels[0].rating,
    color: 'random',
    timeControl: 'unlimited',
  });
  const [unlockedLevel, setUnlockedLevel] = useState(botLevels[0].rating);

  useEffect(() => {
    const storedUnlockedLevel = localStorage.getItem('unlockedBotLevel');
    if (storedUnlockedLevel) {
      setUnlockedLevel(parseInt(storedUnlockedLevel, 10));
    }
  }, []);

  const handleLevelSelect = (rating: number) => {
    setSelectedLevel(rating);
    setConfig(prev => ({ ...prev, rating }));
  };
  
  const getBotName = (rating: number) => {
    return botLevels.find(l => l.rating === rating)?.name || "Bot";
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-in fade-in-50">
      <div className="relative mx-auto max-w-2xl text-center">
        <Button variant="ghost" onClick={onBack} className="absolute top-0 left-0 -translate-y-1/2">
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Challenge a Bot
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Defeat each level to unlock the next.
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-3xl grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
                <CardTitle>Select a Level</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                  <div className="space-y-2">
                    {botLevels.map(level => {
                      const isUnlocked = level.rating <= unlockedLevel;
                      const isSelected = selectedLevel === level.rating;
                      return (
                        <Card 
                          key={level.rating}
                          onClick={() => isUnlocked && handleLevelSelect(level.rating)}
                          className={cn(
                            "flex items-center justify-between p-4 transition-all",
                            isUnlocked ? "cursor-pointer hover:border-primary" : "cursor-not-allowed bg-muted/50 opacity-70",
                            isSelected && isUnlocked && "border-primary ring-2 ring-primary"
                          )}
                        >
                          <div>
                              <h3 className="font-semibold">{level.name}</h3>
                              <p className="text-sm text-muted-foreground">Rating: {level.rating}</p>
                          </div>
                          {isUnlocked ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div>
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-6 w-6"/> Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                <Label>Bot Strength: <span className="font-bold">{getBotName(config.rating)} ({config.rating})</span></Label>
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
    </div>
  )
}

const FriendLobby = ({ onBack }: { onBack: () => void }) => {
  const [gameLink, setGameLink] = useState('');
  const { toast } = useToast();

  const handleCreateGame = () => {
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


const BotGameScreen = ({ config, onExit, onRematch, gameResult, onGameOver }: { config: BotGameConfig, onExit: () => void, onRematch: () => void, gameResult: GameResult | null, onGameOver: (result: GameResult) => void }) => {
    const { boardTheme } = useTheme();
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [rematchCounter, setRematchCounter] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        if (gameResult === 'checkmate-white') {
            const currentLevelIndex = botLevels.findIndex(l => l.rating === config.rating);
            if (currentLevelIndex !== -1 && currentLevelIndex < botLevels.length - 1) {
                const nextLevel = botLevels[currentLevelIndex + 1];
                const storedUnlockedLevel = parseInt(localStorage.getItem('unlockedBotLevel') || '0', 10);
                if (nextLevel.rating > storedUnlockedLevel) {
                    localStorage.setItem('unlockedBotLevel', nextLevel.rating.toString());
                    toast({
                      title: 'Level Unlocked!',
                      description: `You've unlocked the ${nextLevel.name} bot.`,
                    });
                }
            }
        }
    }, [gameResult, config.rating, toast]);


    const getBotName = (rating: number) => {
        return botLevels.find(l => l.rating === rating)?.name || "Bot";
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

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  
  // 'select', 'setup-bot', 'play-bot', 'lobby-friend'
  const [view, setView] = useState<'select' | 'setup-bot' | 'play-bot' | 'lobby-friend'>('select');
  const [botGameConfig, setBotGameConfig] = useState<BotGameConfig | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  
  useEffect(() => {
    const gameParam = params.game?.[0];
    if (gameParam === 'bot') {
      setView('setup-bot');
    } else if (gameParam === 'friend') {
      setView('lobby-friend');
    } else if (gameParam && gameParam.startsWith('game_')) {
      setView('lobby-friend');
    } else {
      setView('select');
      setBotGameConfig(null);
      setGameResult(null);
    }
  }, [params.game]);

  const handleModeSelect = (selectedMode: GameMode) => {
    router.push(`/play/${selectedMode}`, { scroll: false });
  };
  
  const handleBotGameStart = (config: BotGameConfig) => {
    setBotGameConfig(config);
    setGameResult(null);
    setView('play-bot');
  }

  const handleBackToModeSelection = () => {
    setView('select');
    setBotGameConfig(null);
    setGameResult(null);
    router.push('/play', { scroll: false });
  }

  const handleRematch = () => {
    setGameResult(null);
    // The key on the Chessboard component handles the reset
  }
  
  if (view === 'play-bot' && botGameConfig) {
    return (
      <BotGameScreen 
        config={botGameConfig}
        onExit={handleBackToModeSelection}
        gameResult={gameResult}
        onGameOver={setGameResult}
        onRematch={handleRematch}
      />
    );
  }
  
  if (view === 'setup-bot') {
    return <BotGameSetup onStart={handleBotGameStart} onBack={handleBackToModeSelection} />;
  }
  
  if (view === 'lobby-friend') {
    return <FriendLobby onBack={handleBackToModeSelection} />;
  }

  // Fallback for invalid routes under /play/
  if (params.game && params.game.length > 0 && !['bot', 'friend'].includes(params.game[0]) && !params.game[0].startsWith('game_')) {
     return (
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Invalid Game Mode</h1>
            <p className="text-xl text-muted-foreground mb-8">The game mode you selected does not exist.</p>
            <Button onClick={handleBackToModeSelection}>Back to Play Menu</Button>
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
            onClick={() => mode.isAvailable && handleModeSelect(mode.id)}
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

    