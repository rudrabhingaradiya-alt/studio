
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleLogo from '@/components/icons/google-logo';
import AppleLogo from '@/components/icons/apple-logo';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


interface AuthCardProps {
  mode: 'login' | 'signup';
}

export function AuthCard({ mode }: AuthCardProps) {
  const { loginWithGoogle, loginAsGuest, loginWithEmail, signupWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const title = mode === 'login' ? 'Welcome Back' : 'Create an Account';
  const description =
    mode === 'login'
      ? 'Sign in to continue your journey.'
      : 'Join the arena and start playing.';
  const buttonText = mode === 'login' ? 'Log In' : 'Sign Up';
  const footerText =
    mode === 'login' ? "Don't have an account?" : 'Already have an account?';
  const footerLink = mode === 'login' ? '/signup' : '/login';
  const footerLinkText = mode === 'login' ? 'Sign up' : 'Log in';

  const handleAuthAction = async () => {
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleGuest = () => {
    loginAsGuest();
    router.push('/');
  }
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      // Redirect is handled by Firebase
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: "Authentication Failed",
        description: error.message || "Could not log in with Google. Please try again."
      })
    }
  };


  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                <GoogleLogo className="mr-2 h-4 w-4" />
                Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => toast({ title: 'Coming Soon!', description: 'Apple sign-in will be available in a future update.'})} disabled={isLoading}>
                <AppleLogo className="mr-2 h-4 w-4" />
                Apple
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
          </div>
          <Button
            onClick={handleAuthAction}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <div className="text-sm text-muted-foreground">
          {footerText}{' '}
          <Link
            href={footerLink}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {footerLinkText}
          </Link>
        </div>
        <Button variant="link" className="text-accent" onClick={handleGuest} disabled={isLoading}>
            Continue as Guest
        </Button>
      </CardFooter>
    </Card>
  );
}
