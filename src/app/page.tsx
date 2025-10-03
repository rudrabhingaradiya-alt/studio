import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import Chessboard from '@/components/puzzles/chessboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            Join Chess Arena
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-xl">
            Play, Challenge, and Conquer. Your next move is waiting.
          </p>
          <div className="mt-8 w-full max-w-md">
            <AuthCard mode="signup" />
          </div>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-lg shadow-2xl bg-card">
            <CardHeader>
              <CardTitle className="text-center text-3xl font-bold">
                Join Challenge of the Day
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Chessboard isStatic={true} />
              <p className="font-semibold text-accent">White to move and win.</p>
              <Button asChild className="w-full bg-accent hover:bg-accent/90">
                <Link href="/puzzles">Solve Puzzle</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
