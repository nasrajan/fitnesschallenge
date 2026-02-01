"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Challenge } from "@/lib/types";
import { getChallenges } from "@/app/actions";
import ChallengeView from "@/components/ChallengeView";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ChallengePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getChallenges().then(res => {
                if (res.success) {
                    const found = res.challenges.find(c => c.id === Number(id));
                    setChallenge(found || null);
                }
                setIsLoading(false);
            });
        }
    }, [id]);

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!challenge || !user) return <div className="p-8 text-center">Challenge not found.</div>;

    return <ChallengeView challenge={challenge} userEmail={user.email} />;
}
