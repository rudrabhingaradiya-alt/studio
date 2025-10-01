import { AuthCard } from '@/components/auth/auth-card';

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <AuthCard mode="signup" />
    </div>
  );
}
