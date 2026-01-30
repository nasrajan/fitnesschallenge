"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleAction = async (formData: FormData) => {
        setIsSubmitting(true);
        setError("");
        const emailValue = formData.get("email") as string;

        try {
            const result = await login(emailValue);
            if (!result.success) {
                setError(result.error || "User not found. Please register first.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] flex-col justify-center px-4">
            <div className="mx-auto w-full max-w-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Welcome Back</h1>
                    <p className="text-muted-foreground">Enter your email to sign in to the challenge.</p>
                </div>

                <form action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="Email Address"
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-card/50"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                        Sign In
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}
