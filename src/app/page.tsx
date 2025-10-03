import { AuthCard } from '@/components/auth/auth-card';

export default function Home() {
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
  );
}
