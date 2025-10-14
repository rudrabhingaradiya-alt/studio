
'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import Image from 'next/image';
import { BrainCircuit, User, Users, ChevronLeft, Link as LinkIcon, Clipboard, Settings, Lock, CheckCircle, Wand2, Loader2, BookOpen, BarChart, Sparkles, AlertTriangle, XCircle, RotateCcw, Lightbulb, Trophy, Flag, TimerIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Chessboard, { GameResult, Move } from '@/components/puzzles/chessboard';
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
import { getNewBot, getGameAnalysis } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import type { GameAnalysisOutput } from '@/ai/flows/game-analysis-flow';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GameReview = dynamic(() => import('@/components/game/game-review').then(mod => mod.GameReview), {
    loading: () => <div className="flex h-screen w-screen items-center justify-center bg-background p-4 flex-col gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold text-muted-foreground">Loading Review...</h2>
    </div>,
    ssr: false
});

const FriendLobby = dynamic(() => import('@/components/game/friend-lobby').then(mod => mod.FriendLobby), {
    loading: () => <div className="flex h-screen w-screen items-center justify-center bg-background p-4 flex-col gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold text-muted-foreground">Loading Lobby...</h2>
    </div>,
    ssr: false
});

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

const GameOverDialog = ({
  result,
  onPlayAgain,
  onBackToMenu,
  onGameReview
}: {
  result: GameResult | null;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onGameReview: () => void;
}) => {
  if (!result) return null;

  const title =
    result === 'checkmate-white' || result === 'resign-black'
      ? 'Checkmate! You Won!'
      : result === 'checkmate-black' || result === 'resign-white'
      ? 'Checkmate! You Lost.'
      : 'Stalemate! It\'s a Draw.';
  const description =
    result === 'checkmate-white'
      ? 'Congratulations on your victory!'
      : result === 'resign-black'
      ? 'Your opponent has resigned. You win!'
      : result === 'checkmate-black'
      ? 'Better luck next time. Keep practicing!'
      : result === 'resign-white'
      ? 'You have resigned the game.'
      : 'The game is a draw as no legal moves can be made.';

  return (
    <AlertDialog open={!!result}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onBackToMenu}>Back to Menu</Button>
          <Button variant="outline" onClick={onPlayAgain}>Play Again</Button>
          <Button onClick={onGameReview}><BarChart className="mr-2 h-4 w-4" /> Game Review</Button>
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

const ResignDialog = ({
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
                <AlertDialogTitle>Resign Game?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to resign? This will result in a loss.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm} variant="destructive">
                    Resign
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);


const BotGameScreen = ({ config, onExit, onRematch, gameResult, onGameOver, onGameReview }: { config: BotGameConfig, onExit: () => void, onRematch: () => void, gameResult: GameResult | null, onGameOver: (result: GameResult, moveHistory: Move[]) => void, onGameReview: () => void }) => {
    const { boardTheme } = useTheme();
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showResignConfirm, setShowResignConfirm] = useState(false);
    const [rematchCounter, setRematchCounter] = useState(0);
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const { toast } = useToast();
    const [playerTime, setPlayerTime] = useState(config.timeControl !== 'unlimited' ? parseInt(config.timeControl) * 60 : Infinity);
    const [botTime, setBotTime] = useState(config.timeControl !== 'unlimited' ? parseInt(config.timeControl) * 60 : Infinity);
    const [activeTurn, setActiveTurn] = useState<'player' | 'bot' | null>(null);

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

    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (activeTurn && !gameResult && config.timeControl !== 'unlimited') {
        timer = setInterval(() => {
          if (activeTurn === 'player') {
            setPlayerTime(t => t > 0 ? t - 1 : 0);
          } else {
            setBotTime(t => t > 0 ? t - 1 : 0);
          }
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [activeTurn, gameResult, config.timeControl]);


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
        setMoveHistory([]);
        if (config.timeControl !== 'unlimited') {
            const initialTime = parseInt(config.timeControl) * 60;
            setPlayerTime(initialTime);
            setBotTime(initialTime);
        }
        setActiveTurn(null);
    }

    const handleGameOverWithHistory = (result: GameResult, history: Move[]) => {
        setMoveHistory(history);
        onGameOver(result, history);
    }
    
    const handleResign = () => {
        setShowResignConfirm(false);
        const playerColor = config.color === 'random' ? 'white' : config.color; // Simplified for now
        onGameOver(playerColor === 'white' ? 'resign-white' : 'resign-black', moveHistory);
    }
    
    const handleMove = (turn: 'white' | 'black') => {
        const playerIsWhite = (config.color === 'white') || (config.color === 'random' && true); // Simplified
        if (playerIsWhite) {
            setActiveTurn(turn === 'white' ? 'player' : 'bot');
        } else {
            setActiveTurn(turn === 'black' ? 'player' : 'bot');
        }
    }
    
    const formatTime = (seconds: number) => {
        if (seconds === Infinity) return '∞';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
            <Button variant="ghost" onClick={() => setShowLeaveConfirm(true)} className="absolute top-4 left-4">
                <ChevronLeft className="h-5 w-5 mr-2" />
                Exit Game
            </Button>
            <div className="grid w-full max-w-5xl lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col items-center justify-center">
                    <Card className="w-full max-w-lg animate-in fade-in-50 zoom-in-95">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={(initialBotLevels.find(b => b.rating === config.rating))?.avatar} />
                                    <AvatarFallback>{getBotName(config.rating).charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">vs. {getBotName(config.rating)}</CardTitle>
                                    <CardDescription>({config.rating})</CardDescription>
                                </div>
                            </div>
                            {config.timeControl !== 'unlimited' && (
                                <div className="flex items-center gap-2 text-lg font-bold p-2 rounded-md bg-muted">
                                    <TimerIcon className="h-5 w-5"/>
                                    {formatTime(botTime)}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Chessboard
                                key={rematchCounter}
                                aiLevel={config.rating}
                                onGameOver={handleGameOverWithHistory}
                                playerColor={config.color}
                                boardTheme={boardTheme}
                                onMove={handleMove}
                            />
                        </CardContent>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>Y</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">You</CardTitle>
                                    <CardDescription>(1200)</CardDescription>
                                </div>
                            </div>
                           {config.timeControl !== 'unlimited' && (
                                <div className="flex items-center gap-2 text-lg font-bold p-2 rounded-md bg-muted">
                                    <TimerIcon className="h-5 w-5"/>
                                    {formatTime(playerTime)}
                                </div>
                            )}
                        </CardHeader>
                    </Card>
                </div>
                 <div className="flex flex-col justify-center space-y-4">
                     <Button variant="destructive" onClick={() => setShowResignConfirm(true)} className="w-full">
                         <Flag className="mr-2 h-4 w-4" /> Resign
                     </Button>
                      <Button variant="secondary" onClick={handlePlayAgain} className="w-full">
                         <RotateCcw className="mr-2 h-4 w-4" /> Rematch
                     </Button>
                </div>
            </div>
            <GameOverDialog
                result={gameResult}
                onPlayAgain={handlePlayAgain}
                onBackToMenu={onExit}
                onGameReview={onGameReview}
            />
            <LeaveGameDialog
                isOpen={showLeaveConfirm}
                onCancel={() => setShowLeaveConfirm(false)}
                onConfirm={onExit}
            />
            <ResignDialog
                isOpen={showResignConfirm}
                onCancel={() => setShowResignConfirm(false)}
                onConfirm={handleResign}
            />
        </div>
    );
}

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  
  const [view, setView] = useState<'select' | 'setup-bot' | 'play-bot' | 'lobby-friend' | 'review'>('select');
  const [botGameConfig, setBotGameConfig] = useState<BotGameConfig | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [gameAnalysis, setGameAnalysis] = useState<GameAnalysisOutput | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
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
    setGameAnalysis(null);
    setMoveHistory([]);
    setView('play-bot');
  }

  const handleGameOver = (result: GameResult, history: Move[]) => {
      setGameResult(result);
      setMoveHistory(history);
  }

  const handleGameReview = async () => {
    setIsAnalyzing(true);
    const sanMoveHistory = moveHistory.map(m => m.san);
    const { analysis, error } = await getGameAnalysis({ moveHistory: sanMoveHistory });

    if (error || !analysis) {
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'Could not analyze the game at this time.'
        });
        setIsAnalyzing(false);
        return;
    }

    setGameAnalysis(analysis);
    setView('review');
    setIsAnalyzing(false);
  };

  const handleBackToModeSelection = () => {
    setView('select');
    setBotGameConfig(null);
    setGameResult(null);
    setGameAnalysis(null);
    setMoveHistory([]);
    router.push('/play', { scroll: false });
  }

  const handleRematch = () => {
    setGameResult(null);
    setGameAnalysis(null);
    setMoveHistory([]);
    // The key on the Chessboard component handles the reset
  }

  if (isAnalyzing) {
    return (
         <div className="flex h-screen w-screen items-center justify-center bg-background p-4 flex-col gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold text-muted-foreground">Analyzing your game...</h2>
            <p className="text-muted-foreground">The AI is reviewing your moves.</p>
        </div>
    )
  }

  if (view === 'review' && gameAnalysis) {
    return (
      <GameReview 
        analysis={gameAnalysis}
        moveHistory={moveHistory}
        onBack={handleBackToModeSelection}
      />
    );
  }
  
  if (view === 'play-bot' && botGameConfig) {
    return (
      <BotGameScreen 
        config={botGameConfig}
        onExit={handleBackToModeSelection}
        gameResult={gameResult}
        onGameOver={handleGameOver}
        onRematch={handleRematch}
        onGameReview={handleGameReview}
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
