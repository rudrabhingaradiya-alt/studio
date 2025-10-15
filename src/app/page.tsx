
'use client';
import { redirect } from 'next/navigation';
import { BrainCircuit, User, Users, Calendar, Puzzle as PuzzleIcon, Timer } from 'lucide-react';
import { puzzles, type Puzzle } from '@/lib/puzzles';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { AuthCard } from '@/components/auth/auth-card';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { AdPlaceholder } from '@/components/ad-placeholder';

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

export default function Home() {
  const { isLoggedIn } = useAuth();
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
