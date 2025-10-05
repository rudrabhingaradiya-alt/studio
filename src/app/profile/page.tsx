
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { BrainCircuit, Loader2, Star, History, TrendingUp, Trophy, ShieldAlert, User, Bell, Palette } from 'lucide-react';
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

const mockPuzzleHistory: PuzzleHistoryItem[] = [
  { puzzleId: 'pz301', attempts: 1, solved: true },
  { puzzleId: 'pz482', attempts: 3, solved: false },
  { puzzleId: 'pz109', attempts: 2, solved: true },
];

const mockGameHistory: GameHistoryItem[] = [
    { opponent: 'Bot (Beginner)', result: 'Win', date: '2024-07-28' },
    { opponent: 'Bot (Intermediate)', result: 'Loss', date: '2024-07-27' },
    { opponent: 'Bot (Adept)', result: 'Draw', date: '2024-07-26' },
];

export default function ProfilePage() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState('https://picsum.photos/seed/user/200/200');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const userStats = {
    rating: 1200,
    wins: mockGameHistory.filter(g => g.result === 'Win').length,
    losses: mockGameHistory.filter(g => g.result === 'Loss').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
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

      <div className="mb-8 grid gap-4 md:grid-cols-3">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGameHistory.map((game, index) => (
                  <TableRow key={index}>
                    <TableCell>{game.opponent}</TableCell>
                    <TableCell>{getResultBadge(game.result)}</TableCell>
                    <TableCell>{new Date(game.date).toLocaleDateString()}</TableCell>
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
                  Theme
                </h3>
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
  );
}
