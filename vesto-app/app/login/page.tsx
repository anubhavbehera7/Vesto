'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create or update user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Error updating user profile:', profileError);
        }

        router.push('/account');
        router.refresh();
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md border-[#e0ddd8] dark:border-[#3a3a38] bg-white dark:bg-[#242422]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-[#2d2d2d] dark:text-[#e8e6e3]">Login</CardTitle>
          <CardDescription className="text-[#6a6a6a] dark:text-[#9a9a98]">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#2d2d2d] dark:text-[#e8e6e3]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={errors.email ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2d2d2d] dark:text-[#e8e6e3]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={errors.password ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#b4d4b4] hover:bg-[#a0c5a0] text-[#2d2d2d] font-medium border border-[#9cc09c] dark:bg-[#8fb48f] dark:hover:bg-[#a0c5a0] dark:text-[#1a1a18]"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center text-sm text-[#6a6a6a] dark:text-[#9a9a98]">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#5a7a5e] dark:text-[#8fb48f] hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

