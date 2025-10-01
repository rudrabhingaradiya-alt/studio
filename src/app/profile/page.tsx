'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PuzzleHistoryItem } from '@/lib/types';
import { getPuzzleRecommendations } from '@/app/actions';
import { BrainCircuit, CheckCircle, Loader2, Star, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const mockHistory: PuzzleHistoryItem[] = [
  { puzzleId: 'pz301', attempts: 1, solved: true },
  { puzzleId: 'pz482', attempts: 3, solved: false },
  { puzzleId: 'pz109', attempts: 2, solved: true },
];

export default function ProfilePage() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState('https://picsum.photos/seed/user/200/200');
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    const { recommendations: recs, error } = await getPuzzleRecommendations({
      puzzleHistory: mockHistory,
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

      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Puzzle History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Puzzle ID</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHistory.map((item) => (
                    <TableRow key={item.puzzleId}>
                      <TableCell>{item.puzzleId}</TableCell>
                      <TableCell>{item.attempts}</TableCell>
                      <TableCell>
                        {item.solved ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Puzzle Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-muted-foreground">
                Get puzzles recommended by our AI to improve your skills.
              </p>
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
