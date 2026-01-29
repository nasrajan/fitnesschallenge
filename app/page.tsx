import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          Ramadan Prep <br /> Challenge
        </h1>
        <p className="text-muted-foreground text-lg max-w-xs mx-auto">
          Track your walks, water drift, workouts, and spiritual preparation.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/login"
          className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/register"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Create an account
        </Link>
      </div>

      <div className="absolute bottom-10 left-0 w-full text-center">
        <p className="text-xs text-muted-foreground/50">
          Fitness Challenge App &copy; 2026
        </p>
      </div>
    </div>
  );
}
