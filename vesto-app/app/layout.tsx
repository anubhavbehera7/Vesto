import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Sparkles, BookOpen, LineChart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vesto - Financial Literacy Platform",
  description: "Learn financial analysis through interactive modules and AI-powered feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {/* Sidebar - Desktop */}
          <nav className="hidden w-64 border-r bg-[#fafaf8] p-4 dark:border-[#3a3a38] dark:bg-[#1a1a18] md:block">
            <Link href="/" className="flex items-center gap-2 pb-4 mb-4 border-b border-[#e0ddd8] dark:border-[#3a3a38]">
              <Sparkles className="h-6 w-6 text-[#b4d4b4] dark:text-[#8fb48f]" />
              <h1 className="text-xl font-bold text-[#2d2d2d] dark:text-[#e8e6e3]">Vesto</h1>
            </Link>
            <div className="space-y-2">
              <Link href="/learn">
                <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-[#f5f4f2] dark:hover:bg-[#222220] text-[#2d2d2d] dark:text-[#e8e6e3]">
                  <BookOpen className="h-4 w-4" />
                  Learn
                </Button>
              </Link>
              <Link href="/simulator">
                <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-[#f5f4f2] dark:hover:bg-[#222220] text-[#2d2d2d] dark:text-[#e8e6e3]">
                  <LineChart className="h-4 w-4" />
                  Simulator
                </Button>
              </Link>
              <Link href="/account">
                <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-[#f5f4f2] dark:hover:bg-[#222220] text-[#2d2d2d] dark:text-[#e8e6e3]">
                  <User className="h-4 w-4" />
                  Account
                </Button>
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-10 pb-24 md:pb-6">
            {children}
          </main>

          {/* Bottom Nav - Mobile */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t bg-white p-2 dark:border-[#3a3a38] dark:bg-[#1a1a18]">
            <Link href="/learn" className="flex-1">
              <Button variant="ghost" className="w-full flex-col h-16 hover:bg-[#f5f4f2] dark:hover:bg-[#222220] text-[#2d2d2d] dark:text-[#e8e6e3]">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs">Learn</span>
              </Button>
            </Link>
            <Link href="/simulator" className="flex-1">
              <Button variant="ghost" className="w-full flex-col h-16 hover:bg-[#f5f4f2] dark:hover:bg-[#222220] text-[#2d2d2d] dark:text-[#e8e6e3]">
                <LineChart className="h-5 w-5" />
                <span className="text-xs">Simulator</span>
              </Button>
            </Link>
            <Link href="/account" className="flex-1">
              <Button variant="ghost" className="w-full flex-col h-16 hover:bg-[#f5f4f2] dark:hover:bg-[#222220] text-[#2d2d2d] dark:text-[#e8e6e3]">
                <User className="h-5 w-5" />
                <span className="text-xs">Account</span>
              </Button>
            </Link>
          </nav>
        </div>
      </body>
    </html>
  );
}
