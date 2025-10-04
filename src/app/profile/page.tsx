'use client';

import { useState } from 'react';
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
import { BrainCircuit, Loader2, Star, History } from 'lucide-react';
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

const mockPuzzleHistory: PuzzleHistoryItem[] = [
  { puzzleId: 'pz301', attempts: 1, solved: true },
  { puzzleId: 'pz482', attempts: 3, solved: false },
  { puzzleId: 'pz109', attempts: 2, solved: true },
];

const mockGameHistory: GameHistoryItem[] = [
    { opponent: 'Robot (Beginner)', result: 'Win', date: '2024-07-28' },
    { opponent: 'Robot (Intermediate)', result: 'Loss', date: '2024-07-27' },
    { opponent: 'Robot (Adept)', result: 'Draw', date: '2024-07-26' },
];

export default function ProfilePage() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState('https://picsum.photos/seed/user/200/200');
  const { toast } = useToast();

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
            Rating: 1200
          </p>
        </div>
      </header>

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
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold">Customize Your Logo</h3>
              <p className="text-muted-foreground">
                Use AI to generate a unique logo for your profile.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4" variant="outline">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
