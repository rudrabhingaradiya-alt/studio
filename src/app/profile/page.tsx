
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GameHistoryItem, PuzzleHistoryItem } from '@/lib/types';
import { getPuzzleRecommendations } from '@/app/actions';
import { BrainCircuit, Loader2, Star, History, TrendingUp, Trophy, ShieldAlert, User, Bell, Palette, Check, Cpu, Puzzle, Target, Award, Flame, Users, BookOpen, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/context/theme-context';
import { boardThemes } from '@/lib/board-themes';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Pie, PieChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Progress } from '@/components/ui/progress';

const mockPuzzleHistory: PuzzleHistoryItem[] = [
  { puzzleId: 'pz301', attempts: 1, solved: true },
  { puzzleId: 'pz482', attempts: 3, solved: false },
  { puzzleId: 'pz109', attempts: 2, solved: true },
];

const mockGameHistory: GameHistoryItem[] = [
    { opponent: 'Bot (Beginner)', result: 'Win', date: '2024-07-28', ratingChange: 8, rating: 1180 },
    { opponent: 'Bot (Intermediate)', result: 'Loss', date: '2024-07-27', ratingChange: -7, rating: 1172 },
    { opponent: 'Bot (Adept)', result: 'Draw', date: '2024-07-26', ratingChange: 0, rating: 1179 },
    { opponent: 'Bot (Intermediate)', result: 'Win', date: '2024-07-25', ratingChange: 9, rating: 1179 },
    { opponent: 'Bot (Expert)', result: 'Loss', date: '2024-07-24', ratingChange: -5, rating: 1170 },
];

const achievements = [
  {
    icon: Trophy,
    title: "First Win",
    description: "Win your first game against a bot or player.",
    progress: 100,
  },
  {
    icon: Puzzle,
    title: "Puzzle Enthusiast",
    description: "Solve 10 chess puzzles.",
    progress: 30,
  },
  {
    icon: Cpu,
    title: "Bot Conqueror",
    description: "Defeat 5 different bots.",
    progress: 60,
  },
  {
    icon: Target,
    title: "Sharpshooter",
    description: "Win a game with over 90% accuracy.",
    progress: 0,
  },
  {
    icon: Star,
    title: "Perfect Puzzle",
    description: "Solve a puzzle on the first try.",
    progress: 100,
  },
  {
    icon: Award,
    title: "Comeback King",
    description: "Win a game from a losing position.",
    progress: 0,
  },
  {
    icon: Flame,
    title: "Winning Streak",
    description: "Win 3 games in a row.",
    progress: 66,
  },
  {
    icon: Puzzle,
    title: "Puzzle Solver",
    description: "Solve 25 puzzles.",
    progress: 12,
  },
  {
    icon: Users,
    title: "Friendly Rivalry",
    description: "Play a game with a friend.",
    progress: 0,
  },
  {
    icon: BrainCircuit,
    title: "Tactical Wizard",
    description: "Solve 5 puzzles in a row.",
    progress: 80,
  },
  {
    icon: BookOpen,
    title: "Endgame Pro",
    description: "Win a game after move 40.",
    progress: 25,
  },
   {
    icon: TrendingUp,
    title: "On the Rise",
    description: "Increase your rating by 100 points.",
    progress: 20,
  },
];

const AchievementCard = ({ icon: Icon, title, description, progress }: { icon: React.ElementType, title: string, description: string, progress: number }) => (
  <Card className={cn("flex flex-col items-center text-center", progress < 100 && "opacity-60 bg-muted/50")}>
    <CardHeader className="items-center pb-4">
      <div className={cn("p-3 rounded-full", progress === 100 ? "bg-primary/20 text-primary" : "bg-muted-foreground/20 text-muted-foreground")}>
        <Icon className="h-8 w-8" />
      </div>
    </CardHeader>
    <CardContent className="flex-grow space-y-1">
       <p className="font-semibold">{title}</p>
       <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
    <CardFooter>
       <Progress value={progress} className="h-2" />
    </CardFooter>
  </Card>
);

export default function ProfilePage() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState('https://picsum.photos/seed/user/200/200');
  const { isDarkMode, setIsDarkMode, boardTheme, setBoardTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    const { recommendations: recs, error } = await getPuzzleRecommendations({
      puzzleHistory: mockPuzzleHistory,
      numberOfPuzzles: 3,
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch recommendations. Please try again.',
      });
    } else {
      setRecommendations(recs);
    }
    setIsLoading(false);
  };
  
  const getResultBadge = (result: 'Win' | 'Loss' | 'Draw') => {
    switch (result) {
      case 'Win':
        return <Badge variant="default" className="bg-green-500">Win</Badge>;
      case 'Loss':
        return <Badge variant="destructive">Loss</Badge>;
      case 'Draw':
        return <Badge variant="secondary">Draw</Badge>;
    }
  }
  
  const wins = mockGameHistory.filter((g) => g.result === 'Win').length;
  const losses = mockGameHistory.filter((g) => g.result === 'Loss').length;
  const draws = mockGameHistory.filter((g) => g.result === 'Draw').length;
  const totalGames = mockGameHistory.length;

  const gameStatsData = [
    { stat: 'wins', value: wins, fill: 'hsl(var(--chart-2))' },
    { stat: 'losses', value: losses, fill: 'hsl(var(--destructive))' },
    { stat: 'draws', value: draws, fill: 'hsl(var(--muted-foreground))' },
  ];

  const chartConfig: ChartConfig = {
    wins: { label: 'Wins', color: 'hsl(var(--chart-2))' },
    losses: { label: 'Losses', color: 'hsl(var(--destructive))' },
    draws: { label: 'Draws', color: 'hsl(var(--muted-foreground))' },
  };

  const userStats = {
    rating: 1200,
    wins: wins,
    losses: losses,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <header className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={selectedLogo} alt="User Avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-center text-3xl font-bold sm:text-left">
            Guest User
          </h1>
          <p className="text-center text-muted-foreground sm:text-left">
            Joined July 2024
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.rating}</div>
                <p className="text-xs text-muted-foreground">+20.1 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Wins</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.wins}</div>
                <p className="text-xs text-muted-foreground">Total games won</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Losses</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.losses}</div>
                <p className="text-xs text-muted-foreground">Total games lost</p>
              </CardContent>
            </Card>
          </div>

           <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Game Statistics</CardTitle>
                <CardDescription>Your performance breakdown.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-[250px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={gameStatsData}
                        dataKey="value"
                        nameKey="stat"
                        innerRadius={60}
                      />
                    </PieChart>
                  </ChartContainer>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Rating History</CardTitle>
                    <CardDescription>Your rating progression over the last few games.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[250px] w-full">
                        <LineChart
                            data={mockGameHistory.slice().reverse()}
                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}/>
                            <YAxis domain={['dataMin - 20', 'dataMax + 20']} />
                            <Tooltip />
                            <Line type="monotone" dataKey="rating" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r:4}} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-6 w-6" />
                  Game History
                </CardTitle>
                <CardDescription>Your recent online matches.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opponent</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Rating Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockGameHistory.map((game, index) => (
                      <TableRow key={index}>
                        <TableCell>{game.opponent}</TableCell>
                        <TableCell>{getResultBadge(game.result)}</TableCell>
                        <TableCell>{new Date(game.date).toLocaleDateString()}</TableCell>
                        <TableCell className={cn(game.ratingChange > 0 ? 'text-green-500' : game.ratingChange < 0 ? 'text-red-500' : 'text-muted-foreground')}>
                            {game.ratingChange > 0 ? `+${game.ratingChange}`: game.ratingChange}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>


          <Tabs defaultValue="recommendations" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations">AI Tools</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Puzzle Recommendations</CardTitle>
                  <CardDescription>
                    Get puzzles recommended by our AI to improve your skills.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={handleGetRecommendations} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Get Recommendations'
                    )}
                  </Button>
                  {recommendations.length > 0 && (
                    <div className="mt-6 text-left">
                      <h3 className="font-semibold">Here are your puzzles:</h3>
                      <ul className="mt-2 list-inside list-disc space-y-2">
                        {recommendations.map((rec) => (
                          <li key={rec}>
                            <Button variant="link" asChild>
                              <a href="#">Solve Puzzle {rec}</a>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Manage your account and application settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <User className="h-5 w-5" />
                      Account
                    </h3>
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold">Customize Your Logo</h4>
                        <p className="text-muted-foreground text-sm">
                          Use AI to generate a unique logo for your profile.
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <BrainCircuit className="mr-2 h-4 w-4" />
                              Generate with AI
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Choose your AI-Generated Logo</DialogTitle>
                              <DialogDescription>
                                Select one of the logos below to update your profile avatar.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              {PlaceHolderImages.map((img) => (
                                <div key={img.id} className="group relative cursor-pointer" onClick={() => setSelectedLogo(img.imageUrl)}>
                                  <Image
                                    src={img.imageUrl}
                                    alt={img.description}
                                    width={200}
                                    height={200}
                                    className="rounded-lg transition-all group-hover:scale-105"
                                    data-ai-hint={img.imageHint}
                                  />
                                   <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Star className="h-8 w-8 text-yellow-400" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Palette className="h-5 w-5" />
                      Appearance
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Toggle between light and dark themes.
                          </p>
                        </div>
                        <Switch
                          id="dark-mode"
                          checked={isDarkMode}
                          onCheckedChange={setIsDarkMode}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base">Board Theme</Label>
                         <p className="text-sm text-muted-foreground">
                          Select your preferred chessboard color scheme.
                        </p>
                        <div className="grid grid-cols-5 gap-4">
                          {boardThemes.map((theme) => (
                            <div
                              key={theme.id}
                              className="flex flex-col items-center gap-2 cursor-pointer"
                              onClick={() => setBoardTheme(theme.id)}
                            >
                              <div className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-background",
                                boardTheme === theme.id ? "ring-primary" : "ring-transparent"
                              )}>
                                <div className="h-10 w-10 rounded-full overflow-hidden">
                                  <div className="h-full w-full flex">
                                    <div className={cn("w-1/2 h-full", theme.light)} />
                                    <div className={cn("w-1/2 h-full", theme.dark)} />
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-medium">{theme.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section>
                     <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor="game-updates" className="text-base">Game Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for game events.
                          </p>
                        </div>
                        <Switch id="game-updates" disabled />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <Label htmlFor="new-challenges" className="text-base">New Challenges</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when a friend challenges you.
                          </p>
                        </div>
                        <Switch id="new-challenges" disabled />
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>Milestones on your chess journey.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                        <AchievementCard key={index} {...achievement} />
                    ))}
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}

    