import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LineChart, TrendingUp, Award, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Login/Signup Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Link href="/login">
          <Button
            variant="outline"
            className="gap-2 border-[#e0ddd8] hover:bg-[#f5f4f2] text-[#2d2d2d] dark:border-[#3a3a38] dark:hover:bg-[#222220] dark:text-[#e8e6e3]"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            className="gap-2 bg-[#b4d4b4] hover:bg-[#a0c5a0] text-[#2d2d2d] font-medium border border-[#9cc09c] dark:bg-[#8fb48f] dark:hover:bg-[#a0c5a0] dark:text-[#1a1a18]"
          >
            <UserPlus className="h-4 w-4" />
            Sign Up
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-6 py-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#2d2d2d] dark:text-[#e8e6e3]">
          Master Financial Analysis
        </h1>
        <p className="text-xl text-[#6a6a6a] dark:text-[#9a9a98] max-w-2xl mx-auto leading-relaxed">
          Learn to analyze companies through interactive modules and practice with our AI-powered stock simulator
        </p>
        <div className="flex gap-4 justify-center pt-6">
          <Link href="/learn">
            <Button 
              size="lg" 
              className="gap-2 bg-[#b4d4b4] hover:bg-[#a0c5a0] text-[#2d2d2d] font-medium shadow-sm border border-[#9cc09c] dark:bg-[#8fb48f] dark:hover:bg-[#a0c5a0] dark:text-[#1a1a18]"
            >
              <BookOpen className="h-5 w-5" />
              Start Your Journey
            </Button>
          </Link>
          <Link href="/simulator">
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-[#e0ddd8] hover:bg-[#f5f4f2] text-[#2d2d2d] dark:border-[#3a3a38] dark:hover:bg-[#222220] dark:text-[#e8e6e3]"
            >
              <LineChart className="h-5 w-5" />
              Try Simulator
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 py-8">
        <Card className="border-[#e0ddd8] dark:border-[#3a3a38] bg-white dark:bg-[#242422] hover:shadow-md transition-shadow">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#d4e4d8] dark:bg-[#3a4a3e] flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-[#5a7a5e] dark:text-[#8fb48f]" />
            </div>
            <CardTitle className="text-[#2d2d2d] dark:text-[#e8e6e3]">Interactive Modules</CardTitle>
            <CardDescription className="text-[#6a6a6a] dark:text-[#9a9a98] leading-relaxed">
              Learn fundamentals, 10-K analysis, and competitive analysis through structured lessons
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-[#e0ddd8] dark:border-[#3a3a38] bg-white dark:bg-[#242422] hover:shadow-md transition-shadow">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f4d5c6] dark:bg-[#4a3a32] flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#8a6a5a] dark:text-[#d4a494]" />
            </div>
            <CardTitle className="text-[#2d2d2d] dark:text-[#e8e6e3]">AI-Powered Feedback</CardTitle>
            <CardDescription className="text-[#6a6a6a] dark:text-[#9a9a98] leading-relaxed">
              Get detailed, rubric-based feedback on your analysis from our AI grading system
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-[#e0ddd8] dark:border-[#3a3a38] bg-white dark:bg-[#242422] hover:shadow-md transition-shadow">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#e6dfe6] dark:bg-[#3a343a] flex items-center justify-center">
              <Award className="h-6 w-6 text-[#7a6a7a] dark:text-[#b6a6b6]" />
            </div>
            <CardTitle className="text-[#2d2d2d] dark:text-[#e8e6e3]">Stock Simulator</CardTitle>
            <CardDescription className="text-[#6a6a6a] dark:text-[#9a9a98] leading-relaxed">
              Pitch stocks to our AI Fund Manager and build a paper trading portfolio
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="border-[#e0ddd8] dark:border-[#3a3a38] bg-white dark:bg-[#242422] py-6">
        <CardHeader>
          <CardTitle className="text-[#2d2d2d] dark:text-[#e8e6e3]">How Vesto Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#d4e4d8] dark:bg-[#3a4a3e] text-[#2d2d2d] dark:text-[#e8e6e3] flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Learn the Fundamentals</h3>
              <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] leading-relaxed">
                Start with Module 1 to understand P/E ratios, EBITDA, ROE, and other key metrics
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f4d5c6] dark:bg-[#4a3a32] text-[#2d2d2d] dark:text-[#e8e6e3] flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Analyze Real Companies</h3>
              <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] leading-relaxed">
                Practice analyzing 20 major companies using real financial data and mock 10-K reports
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e6dfe6] dark:bg-[#3a343a] text-[#2d2d2d] dark:text-[#e8e6e3] flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Get AI Feedback</h3>
              <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] leading-relaxed">
                Receive detailed feedback on your analysis scored across 5 criteria worth 100 points
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#e8e6e3] dark:bg-[#2d2d2b] text-[#2d2d2d] dark:text-[#e8e6e3] flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-[#2d2d2d] dark:text-[#e8e6e3]">Test Your Skills</h3>
              <p className="text-sm text-[#6a6a6a] dark:text-[#9a9a98] leading-relaxed">
                Pitch stocks to our AI Fund Manager and build a paper trading portfolio with $10,000
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-[#d4e4d8] dark:bg-[#3a4a3e] border-[#b4d4b4] dark:border-[#5a7a5e]">
        <CardContent className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#2d2d2d] dark:text-[#e8e6e3]">Ready to Get Started?</h2>
          <p className="text-lg mb-8 text-[#4a4a4a] dark:text-[#b8b8b8]">
            Join Vesto and start mastering financial analysis today
          </p>
          <Link href="/learn">
            <Button 
              size="lg" 
              className="bg-[#b4d4b4] hover:bg-[#a0c5a0] text-[#2d2d2d] font-medium shadow-sm border border-[#9cc09c] dark:bg-[#8fb48f] dark:hover:bg-[#a0c5a0] dark:text-[#1a1a18]"
            >
              Begin Your Journey
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
