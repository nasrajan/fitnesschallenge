"use client";

import { Challenge, MetricV2 } from "@/lib/types";
import { Trophy, Calendar, ListChecks, ArrowRight, Activity, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
    challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
    const isV2 = !!challenge.metrics;

    return (
        <div className={cn(
            "group relative border rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1",
            isV2 ? "bg-primary/5 border-primary/20 hover:bg-primary/10" : "bg-card/40 hover:bg-card/60 border-border/50"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "p-3 rounded-2xl",
                    isV2 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                    {isV2 ? <Target className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                </div>
                {isV2 && (
                    <span className="text-[10px] font-black bg-primary/20 text-primary px-2 py-1 rounded-lg uppercase tracking-widest border border-primary/20">V2 Engine</span>
                )}
            </div>

            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">{challenge.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed italic opacity-80">
                {challenge.description || "No description provided."}
            </p>

            <div className="space-y-3 mb-6 font-medium">
                <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary/70" />
                    {challenge.startDate} — {challenge.endDate}
                </div>
                <div className="flex items-center text-xs text-muted-foreground uppercase tracking-wider">
                    <Activity className="w-4 h-4 mr-2 text-primary/70" />
                    {isV2 ? `${challenge.loggingFrequency} LOGS • ${challenge.scoringFrequency} POINTS` : `${challenge.milestoneType}LY MILESTONES`}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/20">
                <div className="flex -space-x-2">
                    {isV2 ? (
                        challenge.metrics?.slice(0, 3).map((metric: MetricV2, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-black text-primary uppercase" title={metric.name}>
                                {metric.name[0]}
                            </div>
                        ))
                    ) : (
                        challenge.activities?.slice(0, 3).map((activity, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold uppercase" title={activity.name}>
                                {activity.name[0]}
                            </div>
                        ))
                    )}
                </div>
                <Link href={isV2 ? `/challenge-v2/${challenge.id}` : `/challenge/${challenge.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 font-black uppercase text-xs group-hover:translate-x-1 transition-transform">
                        {isV2 ? "Enter Challenge" : "View Details"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
