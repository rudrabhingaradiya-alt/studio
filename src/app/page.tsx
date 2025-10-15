
'use client';
import { BrainCircuit, User, Users, Calendar, Puzzle as PuzzleIcon, Timer, Loader2, Swords } from 'lucide-react';
import { puzzles, type Puzzle } from '@/lib/puzzles';
import { DashboardCard } from '@/components/ui/dashboard-card';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { AdPlaceholder } from '@/components/ad-placeholder';
import { useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PresenceData {
  status: 'online' | 'offline';
  last_seen: {
    seconds: number;
    nanoseconds: number;
  };
  displayName: string;
  photoURL?: string;
}

const gameModes = [
  {
    id: 'online' as const,
    title: 'Play Online',
    description: 'Challenge a random opponent from around the world.',
    icon: Users,
    isAvailable: false,
    href: '/play/online'
  },
  {
    id: 'bot' as const,
    title: 'Play vs Bot',
    description: 'Test your skills against our AI challenger.',
    icon: BrainCircuit,
    isAvailable: true,
    href: '/play/bot'
  },
  {
    id: 'friend' as const,
    title: 'Friendly Match',
    description: 'Invite a friend to a game using a private link.',
    icon: User,
    isAvailable: true,
    href: '/play/friend'
  },
];

function getDailyPuzzle(): Puzzle {
    const getDayOfYear = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      return Math.floor(diff / oneDay);
    };
    const dayOfYear = getDayOfYear();
    const puzzleIndex = dayOfYear % puzzles.length;
    return puzzles[puzzleIndex];
}

const OnlinePlayers = () => {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const presenceQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'presence'),
      where('status', '==', 'online'),
      orderBy('displayName', 'asc')
    );
  }, [firestore, user]);

  const { data: onlineUsers, isLoading: isPresenceLoading } = useCollection<PresenceData>(presenceQuery);
  
  const otherOnlineUsers = onlineUsers?.filter(u => u.id !== user?.uid);
  const isLoading = isUserLoading || isPresenceLoading;

  const handleInvite = (userName: string) => {
    toast({
      title: 'Coming Soon!',
      description: `Game invites will be available in a future update.`,
    });
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Online Players</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${otherOnlineUsers?.length || 0} players currently online.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {otherOnlineUsers && otherOnlineUsers.length > 0 ? (
                  otherOnlineUsers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={player.photoURL} alt={player.displayName} />
                          <AvatarFallback>{player.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{player.displayName}</p>
                          <Badge variant="secondary" className="bg-green-500 text-white">Online</Badge>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleInvite(player.displayName)}>
                        <Swords className="mr-2 h-4 w-4" />
                        Invite to Play
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No other players are online right now.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
  )
}

export default function Home() {
  const dailyPuzzle = getDailyPuzzle();

  return (
     <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Welcome to the Arena
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
            Your next challenge awaits. What will you play today?
            </p>
        </div>

        <div className="mt-12 mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gameModes.find(mode => mode.id === 'online') && (
                 <Link href="/play/online">
                     <DashboardCard
                        key={'online'}
                        title={'Play Online'}
                        description={'Challenge a random opponent from around the world.'}
                        icon={Users}
                        onClick={() => {}}
                        isAvailable={false}
                        badgeText={'Coming Soon'}
                    />
                 </Link>
            )}
             {gameModes.find(mode => mode.id === 'bot') && (
                <Link href="/play/bot">
                    <DashboardCard
                        key={'bot'}
                        title={'Play vs Bot'}
                        description={'Test your skills against our AI challenger.'}
                        icon={BrainCircuit}
                        onClick={() => {}}
                        isAvailable={true}
                    />
                </Link>
            )}
            {dailyPuzzle && (
                <Link href={`/puzzles/${dailyPuzzle.id}`}>
                    <DashboardCard 
                        title="Daily Puzzle"
                        description={`Rating: ${dailyPuzzle.rating} | Theme: ${dailyPuzzle.theme}`}
                        icon={Calendar}
                        onClick={() => {}}
                        isAvailable={true}
                        className="lg:col-span-1 bg-gradient-to-br from-primary/80 to-primary text-primary-foreground"
                        badgeText="New Challenge"
                    />
                </Link>
            )}
            <Link href="/puzzle-rush">
                <DashboardCard 
                    title="Puzzle Rush"
                    description="Solve as many puzzles as you can in 3 minutes."
                    icon={Timer}
                    onClick={() => {}}
                    isAvailable={true}
                />
            </Link>
             <Link href="/puzzles">
                <DashboardCard 
                    title="View All Puzzles"
                    description="Browse our full collection of puzzles."
                    icon={PuzzleIcon}
                    onClick={() => {}}
                    isAvailable={true}
                />
            </Link>
            {gameModes.find(mode => mode.id === 'friend') && (
                 <Link href="/play/friend">
                    <DashboardCard
                        key={'friend'}
                        title={'Friendly Match'}
                        description={'Invite a friend to a game using a private link.'}
                        icon={User}
                        onClick={() => {}}
                        isAvailable={true}
                    />
                </Link>
            )}
             <OnlinePlayers />
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdPlaceholder />
            <AdPlaceholder />
            <AdPlaceholder />
            <AdPlaceholder />
        </div>
     </div>
  );
}
