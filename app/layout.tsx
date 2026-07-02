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
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
        <ScrollToTop />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
          Skip to content
        </a>
        <ThemeProvider>
          <nav className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 transition-colors" aria-label="Main navigation">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">TechJobs</Link>
              <div className="flex gap-4 items-center">
                <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Browse jobs">Browse Jobs</Link>
                <Link href="/post" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" aria-label="Post a new job">
                  Post a Job
                </Link>
                <NavClient />
              </div>
            </div>
          </nav>
          <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 animate-fade-in">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
