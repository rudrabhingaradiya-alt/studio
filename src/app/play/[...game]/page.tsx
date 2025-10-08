
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BrainCircuit, User, Users, ChevronLeft, Link as LinkIcon, Clipboard, Settings, Lock, CheckCircle, Wand2, Loader2 } from 'lucide-react';
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
import { botLevels as initialBotLevels, BotLevel } from '@/lib/bots';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getNewBot } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';


interface BotGameConfig {
  rating: number;
  color: PlayerColor;
  timeControl: string;
}

const BotGenerator = ({ onBotCreated }: { onBotCreated: (newBot: BotLevel) => void }) => {
    const [name, setName] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!name || !prompt) {
            toast({
                variant: 'destructive',
                title: 'Missing fields',
                description: 'Please provide a name and a prompt for your bot.',
            });
            return;
        }
        setIsGenerating(true);
        const { bot, error } = await getNewBot({ name, prompt });
        if (error || !bot) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: error || 'Could not create the bot. Please try again.',
            });
        } else {
            const newBot: BotLevel = {
                name,
                rating: bot.rating,
                personality: bot.personality,
                avatar: bot.avatar,
            };
            onBotCreated(newBot);
            toast({
                title: 'Bot Created!',
                description: `Say hello to ${name}.`,
            });
            setName('');
            setPrompt('');
        }
        setIsGenerating(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 />
                    Create a Bot
                </CardTitle>
                <CardDescription>Use AI to generate a new chess opponent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="bot-name">Bot Name</Label>
                    <Input id="bot-name" placeholder="e.g., 'Captain Blunder'" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bot-prompt">Bot Prompt</Label>
                    <Textarea id="bot-prompt" placeholder="e.g., 'A chaotic pirate who loves risky moves.'" value={prompt} onChange={e => setPrompt(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Generating...
                        </>
                    ) : 'Generate Bot'}
                </Button>
            </CardContent>
        </Card>
    )
}

const BotGameSetup = ({ onStart, onBack }: { onStart: (config: BotGameConfig) => void; onBack: () => void }) => {
  const [botLevels, setBotLevels] = useState<BotLevel[]>(initialBotLevels);
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
  
  const handleNewBot = (newBot: BotLevel) => {
    const updatedBots = [...botLevels, newBot].sort((a, b) => a.rating - b.rating);
    setBotLevels(updatedBots);
    handleLevelSelect(newBot.rating);
    // Also unlock this new bot immediately
    if (newBot.rating > unlockedLevel) {
        setUnlockedLevel(newBot.rating);
    }
  }

  const handleLevelSelect = (rating: number) => {
    setSelectedLevel(rating);
    setConfig(prev => ({ ...prev, rating }));
  };
  
  const getBot = (rating: number): BotLevel | undefined => {
    return botLevels.find(l => l.rating === rating);
  }

  const selectedBot = getBot(selectedLevel) ?? botLevels[0];

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
          Defeat each level to unlock the next opponent, or create your own.
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-7xl grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
                <CardTitle>Select an Opponent</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[70vh]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-1">
                    {botLevels.map(level => {
                      const isUnlocked = level.rating <= unlockedLevel || initialBotLevels.some(b => b.rating === level.rating);
                      const isSelected = selectedLevel === level.rating;
                      return (
                        <Card 
                          key={`${level.name}-${level.rating}`}
                          onClick={() => isUnlocked && handleLevelSelect(level.rating)}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 transition-all aspect-square relative",
                            isUnlocked ? "cursor-pointer hover:border-primary" : "cursor-not-allowed bg-muted/50 opacity-70",
                            isSelected && isUnlocked && "border-primary ring-2 ring-primary"
                          )}
                        >
                            {!isUnlocked && <Lock className="absolute top-2 right-2 h-4 w-4 text-muted-foreground z-10" />}
                            <Avatar className="h-16 w-16 mb-2 border-2 border-muted">
                                <AvatarImage src={level.avatar} alt={level.name} />
                                <AvatarFallback>{level.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-sm text-center">{level.name}</h3>
                            <p className="text-xs text-muted-foreground">Rating: {level.rating}</p>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
            <Card>
            <CardHeader className="items-center">
                 <Avatar className="h-24 w-24 mb-2 border-4 border-primary">
                    <AvatarImage src={selectedBot.avatar} alt={selectedBot.name} />
                    <AvatarFallback>{selectedBot.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="flex items-center gap-2">{selectedBot.name}</CardTitle>
                <CardDescription>{selectedBot.personality}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                
                <Button className="w-full" size="lg" onClick={() => onStart(config)}>Challenge {selectedBot.name}</Button>
            </CardContent>
            </Card>
            <BotGenerator onBotCreated={handleNewBot} />
        </div>
      </div>
    </div>
  )
}

const FriendLobby = ({ onBack }: { onBack: () => void }) => {
  const [gameLink, setGameLink] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const { toast } = useToast();
  const router = useRouter();

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

  const handleJoinGame = () => {
    if (joinLink && joinLink.includes('/play/game_')) {
      router.push(joinLink);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Link',
        description: 'Please paste a valid game link to join.',
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
          Friendly Match
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Create or join a private game to start.
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-md grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a Game</CardTitle>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Join a Game</CardTitle>
            <CardDescription>
              Paste a game link below to join your friend's match.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center space-x-2">
                <Input 
                    placeholder="Paste game link here..." 
                    value={joinLink}
                    onChange={(e) => setJoinLink(e.target.value)}
                />
                <Button onClick={handleJoinGame}>Join</Button>
              </div>
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
        if (gameResult === 'checkmate-white') { // Player wins
            const allBots = [...initialBotLevels].sort((a,b) => a.rating - b.rating);
            const currentLevelIndex = allBots.findIndex(l => l.rating === config.rating);
            
            if (currentLevelIndex !== -1 && currentLevelIndex < allBots.length - 1) {
                const nextLevel = allBots[currentLevelIndex + 1];
                const storedUnlockedLevel = parseInt(localStorage.getItem('unlockedBotLevel') || '0', 10);
                
                if (nextLevel.rating > storedUnlockedLevel) {
                    localStorage.setItem('unlockedBotLevel', nextLevel.rating.toString());
                    toast({
                      title: 'Level Unlocked!',
                      description: `You've unlocked ${nextLevel.name}.`,
                      className: 'bg-green-500 text-white',
                    });
                }
            }
        }
    }, [gameResult, config.rating, toast]);


    const getBotName = (rating: number) => {
        const bot = initialBotLevels.find(l => l.rating === rating);
        // Also check dynamically created bots
        if (bot) return bot.name;
        // This is a fallback, ideally we'd have the full list of bots available
        return "Custom Bot";
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
      // In a real app, this is where you would handle joining a friend's game.
      // For now, we'll just show the lobby.
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

type GameMode = 'bot' | 'online' | 'friend';
type PlayerColor = 'white' | 'black' | 'random';

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
    title: 'Friendly Match',
    description: 'Invite a friend to a game using a private link.',
    icon: User,
    isAvailable: true,
  },
];

    