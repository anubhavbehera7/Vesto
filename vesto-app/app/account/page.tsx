'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string | null; email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pitches: 0, approved: 0, accuracy: 0 });

  useEffect(() => {
    async function fetchUserData() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      // Fetch user profile from users table
      let userProfile = null;
      const { data: profileData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile in account page:', createError);
        } else {
          userProfile = newProfile;
        }
      } else if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
      } else {
        userProfile = profileData;
      }

      setUser({
        name: userProfile?.full_name || authUser.user_metadata?.full_name || null,
        email: authUser.email || userProfile?.email || null
      });

      // Fetch pitch stats
      const { data: pitches } = await supabase
        .from('pitch_submissions')
        .select('status')
        .eq('user_id', authUser.id);

      if (pitches) {
        const total = pitches.length;
        const approved = pitches.filter(p => p.status === 'approved').length;
        const accuracy = total > 0 ? Math.round((approved / total) * 100) : 0;
        setStats({ pitches: total, approved, accuracy });
      }

      setLoading(false);
    }

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">
          Manage your profile and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how your profile appears</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-lg">{user.name || 'Not set'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{user.email || 'Not set'}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Edit Profile</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simulator Stats</CardTitle>
          <CardDescription>Your performance with the AI Fund Manager</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Pitches Made</p>
              <p className="text-2xl font-semibold">{stats.pitches}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pitches Approved</p>
              <p className="text-2xl font-semibold">{stats.approved}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approval Rate</p>
              <p className="text-2xl font-semibold">{stats.accuracy}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p>Appearance</p>
            <Button variant="outline">Toggle Dark Mode</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
        </CardFooter>
      </Card>

    </div>
  );
}

