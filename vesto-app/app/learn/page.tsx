'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MODULES } from "@/types";
import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Modules</h1>
        <p className="text-muted-foreground">
          From basic definitions to expert-level comparative analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((module, index) => {
          const progress = index === 0 ? 60 : index === 1 ? 20 : 0; // Mock progress
          const levelColors = {
            easy: "secondary",
            intermediate: "default",
            advanced: "default",
            expert: "destructive"
          };

          return (
            <Card key={module.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <Badge variant={levelColors[module.level] as any} className="capitalize shrink-0">
                    {module.level}
                  </Badge>
                </div>
                <CardDescription className="mt-2">{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">{progress}% complete</p>
              </CardContent>
              <CardFooter>
                <Link href={`/learn/${module.id}`} className="w-full">
                  <Button className="w-full">
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

