import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeProvider from "./ThemeProvider";
import NavClient from "./components/NavClient";
import ScrollToTop from "./components/ScrollToTop";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechJobs - Find Your Next Role",
  description: "Job board for tech professionals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col transition-colors">
        <ScrollToTop />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
          Skip to content
        </a>
        <ThemeProvider>
          <nav className="sticky top-2 z-50 nav-floating mx-auto" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
              <Link href="/" className="text-lg font-bold gradient-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">TechJobs</Link>
              <div className="flex gap-3 items-center">
                <Link href="/" className="btn btn-secondary btn-sm" aria-label="Browse jobs">Browse Jobs</Link>
                <Link href="/post" className="btn btn-primary btn-sm" aria-label="Post a new job">
                  Post a Job
                </Link>
                <NavClient />
              </div>
            </div>
          </nav>
          <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 animate-fade-in">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
