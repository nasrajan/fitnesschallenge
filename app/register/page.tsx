"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: ""
    });
    const { register } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const success = await register({
                ...formData,
                createdAt: new Date().toISOString()
            });
            if (!success) {
                setError("User already registered. Please login.");
            }
        } catch {
            setError("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] flex-col justify-center px-4">
            <div className="mx-auto w-full max-w-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Join the Challenge</h1>
                    <p className="text-muted-foreground">Start your journey today.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="First Name"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="bg-card/50"
                        />
                        <Input
                            placeholder="Last Name"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="bg-card/50"
                        />
                    </div>
                    <Input
                        placeholder="Email Address"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-card/50"
                    />

                    {error && <p className="text-sm text-destructive text-center">{error}</p>}

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                        Create Account
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
