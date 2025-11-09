'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MODULES } from "@/types";
import type { UserProgress } from "@/types";
import { createClient } from '@/lib/supabase/client';
import Link from "next/link";

export default function LearnPage() {
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchProgress = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      
      // Use client-side Supabase to fetch progress directly
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not logged in - show 0% for all modules
        setProgressMap({});
        if (isInitialLoad) {
          setLoading(false);
        }
        return;
      }
      
      // Fetch progress directly from Supabase
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching progress:', error);
        setProgressMap({});
      } else {
        // Convert array to map for easy lookup
        const map: Record<string, UserProgress> = {};
        (data || []).forEach((progress: UserProgress) => {
          if (progress && progress.module_id) {
            map[progress.module_id] = progress;
            console.log(`Loaded progress for ${progress.module_id}: ${progress.completion_percentage}%`);
          }
        });
        
        console.log('Progress map updated:', map);
        setProgressMap(map);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setProgressMap({});
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProgress(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch progress when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProgress(false);
      }
    };

    const handleFocus = () => {
      fetchProgress(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchProgress]);

  // Refetch when pathname changes (user navigates back to this page)
  useEffect(() => {
    if (pathname === '/learn') {
      // Add a delay to ensure any saves from previous page have completed
      const timer = setTimeout(() => {
        console.log('Refetching progress after navigation...');
        fetchProgress(false);
      }, 800); // Increased delay to ensure database commits are complete
      
      return () => clearTimeout(timer);
    }
  }, [pathname, fetchProgress]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#2d2d2d] dark:text-[#e8e6e3]">Learning Modules</h1>
        <p className="text-[#6a6a6a] dark:text-[#9a9a98] mt-2">
          From basic definitions to expert-level comparative analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((module) => {
          const progressData = progressMap[module.id];
          const progress = progressData?.completion_percentage || 0;
          const levelColors = {
            easy: "bg-[#d4e4d8] text-[#2d2d2d] border-[#b4d4b4]",
            intermediate: "bg-[#f4d5c6] text-[#2d2d2d] border-[#e4c5b6]",
            advanced: "bg-[#e6dfe6] text-[#2d2d2d] border-[#d6cfd6]",
            expert: "bg-[#f4d5c6] text-[#2d2d2d] border-[#e4c5b6]"
          };

          return (
            <Card key={module.id} className="flex flex-col hover:shadow-md transition-shadow border-[#e0ddd8] dark:border-[#3a3a38] bg-white dark:bg-[#242422]">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl text-[#2d2d2d] dark:text-[#e8e6e3]">{module.title}</CardTitle>
                  <Badge className={`${levelColors[module.level]} capitalize shrink-0`}>
                    {module.level}
                  </Badge>
                </div>
                <CardDescription className="mt-2 text-[#6a6a6a] dark:text-[#9a9a98] leading-relaxed">{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <Progress value={progress} className="bg-[#f5f4f2] dark:bg-[#222220]" />
                <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98]">
                  {loading ? 'Loading...' : `${progress}% complete`}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/learn/${module.id}`} className="w-full">
                  <Button className="w-full bg-[#b4d4b4] hover:bg-[#a0c5a0] text-[#2d2d2d] font-medium border border-[#9cc09c] dark:bg-[#8fb48f] dark:hover:bg-[#a0c5a0] dark:text-[#1a1a18]">
                    {progress === 0 ? 'Start Module' : 'Continue Module'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

    </div>
  );
}

