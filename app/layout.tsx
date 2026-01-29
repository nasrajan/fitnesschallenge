import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitness Challenge",
  description: "Track your progress and stay healthy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "min-h-screen bg-background text-foreground"
        )}
      >
        <AuthProvider>
          <main className="mx-auto max-w-md w-full min-h-screen relative overflow-hidden bg-background sm:border-x sm:border-border/50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
