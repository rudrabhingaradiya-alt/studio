
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AuthCard } from '@/components/auth/auth-card';
import { BrainCircuit, User, Users, Calendar, Puzzle as PuzzleIcon, Timer } from 'lucide-react';
import { puzzles, type Puzzle } from '@/lib/puzzles';
import { DashboardCard } from '@/components/ui/dashboard-card';

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

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle | null>(null);

  useEffect(() => {
    const getDayOfYear = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      return Math.floor(diff / oneDay);
    };
    const dayOfYear = getDayOfYear();
    const puzzleIndex = dayOfYear % puzzles.length;
    setDailyPuzzle(puzzles[puzzleIndex]);
  }, []);

  if (!isLoggedIn) {
      return (
        <div className="container mx-auto px-4 py-8 md:py-16">
          <section className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
            <div className="flex flex-col items-center text-center max-w-lg">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                Join Chess Arena
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Play, Challenge, and Conquer. Your next move is waiting.
              </p>
              <div className="mt-8 w-full">
                <AuthCard mode="signup" />
              </div>
            </div>
          </section>
        </div>
      )
  }

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
                 <DashboardCard
                    key={'online'}
                    title={'Play Online'}
                    description={'Challenge a random opponent from around the world.'}
                    icon={Users}
                    onClick={() => router.push('/play/online')}
                    isAvailable={false}
                    badgeText={'Coming Soon'}
                />
            )}
             {gameModes.find(mode => mode.id === 'bot') && (
                <DashboardCard
                    key={'bot'}
                    title={'Play vs Bot'}
                    description={'Test your skills against our AI challenger.'}
                    icon={BrainCircuit}
                    onClick={() => router.push('/play/bot')}
                    isAvailable={true}
                />
            )}
            {dailyPuzzle && (
                <DashboardCard 
                    title="Daily Puzzle"
                    description={`Rating: ${dailyPuzzle.rating} | Theme: ${dailyPuzzle.theme}`}
                    icon={Calendar}
                    onClick={() => router.push(`/puzzles/${dailyPuzzle.id}`)}
                    isAvailable={true}
                    className="lg:col-span-1 bg-gradient-to-br from-primary/80 to-primary text-primary-foreground"
                    badgeText="New Challenge"
                />
            )}
            <DashboardCard 
                title="Puzzle Rush"
                description="Solve as many puzzles as you can in 3 minutes."
                icon={Timer}
                onClick={() => router.push('/puzzle-rush')}
                isAvailable={true}
            />
             <DashboardCard 
                title="View All Puzzles"
                description="Browse our full collection of puzzles."
                icon={PuzzleIcon}
                onClick={() => router.push('/puzzles')}
                isAvailable={true}
            />
            {gameModes.find(mode => mode.id === 'friend') && (
                <DashboardCard
                    key={'friend'}
                    title={'Friendly Match'}
                    description={'Invite a friend to a game using a private link.'}
                    icon={User}
                    onClick={() => router.push('/play/friend')}
                    isAvailable={true}
                />
            )}
        </div>
     </div>
  );
}
