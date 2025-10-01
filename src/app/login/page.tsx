import { AuthCard } from '@/components/auth/auth-card';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <AuthCard mode="login" />
    </div>
  );
}
