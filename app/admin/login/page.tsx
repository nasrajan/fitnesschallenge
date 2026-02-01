"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || "Login failed. Please check your credentials.");
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
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Lock className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold">Admin Portal</h1>
                    <p className="text-muted-foreground">Sign in to manage the system.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <Input
                            placeholder="Admin Email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-card/50"
                        />
                        <Input
                            placeholder="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-card/50"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                        Sign In
                    </Button>
                </form>
            </div>
        </div>
    );
}
