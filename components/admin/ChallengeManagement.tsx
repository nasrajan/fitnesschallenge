"use client";

import { useState, useEffect } from "react";
import { Challenge, MetricV2, ScoringRuleV2, FrequencyV2, AggregationMethodV2 } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2, Trash2, CalendarPlus, Trophy,
    Calendar as CalendarIcon, Target, Plus, X,
    ListChecks, Settings, ShieldCheck, ChevronRight, Layers
} from "lucide-react";

const V2_API_BASE = process.env.NEXT_PUBLIC_V2_API_BASE || "http://localhost:8080/api/v2";

export default function ChallengeManagement() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // V2 Form state
    const [newChallenge, setNewChallenge] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        loggingFrequency: "DAILY" as FrequencyV2,
        scoringFrequency: "WEEKLY" as FrequencyV2,
    });

    const [metrics, setMetrics] = useState<MetricV2[]>([
        {
            name: "Steps",
            unit: "steps",
            aggregationMethod: "SUM",
            scoringRules: [
                { thresholdMin: 0, thresholdMax: 4999, points: 1, priority: 1 },
                { thresholdMin: 5000, thresholdMax: null, points: 2, priority: 2 }
            ]
        }
    ]);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${V2_API_BASE}/challenges`);
            if (res.ok) {
                const data = await res.json();
                setChallenges(data);
            }
        } catch (error) {
            console.error("Failed to fetch v2 challenges:", error);
        }
        setIsLoading(false);
    };

    const handleAddMetric = () => {
        setMetrics([...metrics, {
            name: "",
            unit: "",
            aggregationMethod: "SUM",
            scoringRules: [{ thresholdMin: 0, thresholdMax: null, points: 1, priority: 1 }]
        }]);
    };

    const handleRemoveMetric = (index: number) => {
        setMetrics(metrics.filter((_, i) => i !== index));
    };

    const handleMetricChange = (index: number, field: keyof MetricV2, value: any) => {
        const updated = [...metrics];
        // @ts-ignore
        updated[index][field] = value;
        setMetrics(updated);
    };

    const handleAddRule = (metricIndex: number) => {
        const updated = [...metrics];
        updated[metricIndex].scoringRules.push({
            thresholdMin: 0,
            thresholdMax: null,
            points: 1,
            priority: updated[metricIndex].scoringRules.length + 1
        });
        setMetrics(updated);
    };

    const handleRemoveRule = (metricIndex: number, ruleIndex: number) => {
        const updated = [...metrics];
        updated[metricIndex].scoringRules = updated[metricIndex].scoringRules.filter((_, i) => i !== ruleIndex);
        setMetrics(updated);
    };

    const handleRuleChange = (metricIndex: number, ruleIndex: number, field: keyof ScoringRuleV2, value: any) => {
        const updated = [...metrics];
        const rule = updated[metricIndex].scoringRules[ruleIndex];
        // @ts-ignore
        rule[field] = field === 'points' || field === 'priority' || field === 'thresholdMin' ? parseFloat(value) || 0 : (value === "" ? null : parseFloat(value));
        setMetrics(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);

        const payload = {
            ...newChallenge,
            metrics: metrics
        };

        try {
            const res = await fetch(`${V2_API_BASE}/challenges`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchChallenges();
                setShowAddModal(false);
                // Reset form
                setNewChallenge({
                    name: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    loggingFrequency: "DAILY",
                    scoringFrequency: "WEEKLY",
                });
                setMetrics([{
                    name: "Steps",
                    unit: "steps",
                    aggregationMethod: "SUM",
                    scoringRules: [{ thresholdMin: 0, thresholdMax: null, points: 1, priority: 1 }]
                }]);
            } else {
                alert("Failed to create V2 challenge");
            }
        } catch (error) {
            console.error("Error creating challenge:", error);
            alert("Network error connecting to backend engine");
        }
        setIsAdding(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Syncing with Challenge Engine...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-full overflow-x-hidden">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-card/20 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-primary/20">System V2</span>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic">Challenge <span className="text-primary not-italic lowercase font-sans font-bold tracking-normal">Architect</span></h2>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-xl">Design multi-metric challenges with rule-based scoring. Data is isolated from core system.</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 h-14 px-8 rounded-2xl group transition-all">
                    <CalendarPlus className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    <span className="font-bold tracking-tight">Deploy New Challenge</span>
                </Button>
            </div>

            {/* Challenges List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="group relative bg-[#111111]/60 hover:bg-[#161616]/80 border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-70">Challenge ID: {challenge.id.substring(0, 8)}...</p>
                                <h3 className="text-2xl font-black tracking-tight leading-none uppercase italic">{challenge.name}</h3>
                            </div>
                            <div className="bg-primary/10 p-4 rounded-3xl text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                                <Trophy className="w-6 h-6" />
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3 mb-8 min-h-[4.5rem] leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                            {challenge.description || "Experimental configuration without detailed documentation."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Logging</p>
                                <p className="text-xs font-black text-primary uppercase">{challenge.loggingFrequency}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Scoring</p>
                                <p className="text-xs font-black text-primary uppercase">{challenge.scoringFrequency}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center text-xs font-bold text-muted-foreground truncate uppercase tracking-tighter">
                                <CalendarIcon className="w-4 h-4 mr-3 text-primary/60 shrink-0" />
                                {challenge.startDate} <span className="mx-2 opacity-30">—</span> {challenge.endDate}
                            </div>
                            <div className="flex items-center text-xs font-bold text-muted-foreground truncate uppercase tracking-tighter">
                                <Target className="w-4 h-4 mr-3 text-primary/60 shrink-0" />
                                {challenge.metrics?.length || 0} Dynamic Metrics Instrumented
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 flex flex-wrap gap-2">
                            {challenge.metrics?.map((metric: MetricV2, i: number) => (
                                <div key={i} className="px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase text-primary/80">{metric.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {challenges.length === 0 && (
                    <div className="col-span-full py-24 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] animate-pulse">
                        <ShieldCheck className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
                        <h4 className="text-2xl font-black text-foreground/40 uppercase italic">No V2 Configurations Detected</h4>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto font-medium">The challenge engine is waiting for your blueprint. Start by creating a logic-aware challenge.</p>
                    </div>
                )}
            </div>

            {/* V2 Add Challenge Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto">
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(var(--primary),0.1)] w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-500">
                        {/* Modal Header */}
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <Settings className="w-5 h-5 text-primary animate-spin-slow" />
                                    <h3 className="text-3xl font-black tracking-tight uppercase italic">Configuration <span className="not-italic lowercase text-primary font-sans font-bold">Terminal</span></h3>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest pl-8">V2 Rule-Engine Infrastructure</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="rounded-2xl h-12 w-12 hover:bg-destructive/10 hover:text-destructive group border border-white/5">
                                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-12 overflow-y-auto custom-scrollbar flex-1">
                            {/* Section: Core Metadata */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-1 bg-primary rounded-full" />
                                    <h4 className="text-sm font-black uppercase tracking-widest text-white/50">Core Parameters</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Challenge Name</label>
                                        <Input
                                            placeholder="REDESIGN_2026_MARATHON"
                                            required
                                            value={newChallenge.name}
                                            onChange={e => setNewChallenge({ ...newChallenge, name: e.target.value })}
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl text-xl font-black uppercase placeholder:opacity-20 focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Operational Objectives</label>
                                        <textarea
                                            placeholder="Define the scope and rules of this engagement..."
                                            value={newChallenge.description}
                                            onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium resize-none focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Deployment Date</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <Input
                                                type="date"
                                                required
                                                value={newChallenge.startDate}
                                                onChange={e => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                                                className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Termination Date</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <Input
                                                type="date"
                                                required
                                                value={newChallenge.endDate}
                                                onChange={e => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                                                className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Logging Frequency</label>
                                        <select
                                            value={newChallenge.loggingFrequency}
                                            onChange={e => setNewChallenge({ ...newChallenge, loggingFrequency: e.target.value as FrequencyV2 })}
                                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="DAILY">Daily Logging</option>
                                            <option value="WEEKLY">Weekly Logging</option>
                                            <option value="MONTHLY">Monthly Logging</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Scoring Frequency</label>
                                        <select
                                            value={newChallenge.scoringFrequency}
                                            onChange={e => setNewChallenge({ ...newChallenge, scoringFrequency: e.target.value as FrequencyV2 })}
                                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="DAILY">Daily Scoring</option>
                                            <option value="WEEKLY">Weekly Scoring</option>
                                            <option value="MONTHLY">Monthly Scoring</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Metrics & Rules Engine */}
                            <div className="space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-1 bg-primary rounded-full" />
                                        <h4 className="text-sm font-black uppercase tracking-widest text-white/50">Metric & Logic Instrumentation</h4>
                                    </div>
                                    <Button type="button" variant="outline" onClick={handleAddMetric} className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Inject Metric
                                    </Button>
                                </div>

                                <div className="space-y-12">
                                    {metrics.map((metric, metricIndex) => (
                                        <div key={metricIndex} className="p-10 border border-white/5 bg-white/[0.01] rounded-[2.5rem] relative group animate-in slide-in-from-bottom-2 duration-500">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveMetric(metricIndex)}
                                                className="absolute top-6 right-6 h-10 w-10 bg-destructive/5 text-destructive border border-destructive/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Component Label</label>
                                                    <Input
                                                        placeholder="e.g. HYDRATION"
                                                        required
                                                        value={metric.name}
                                                        onChange={e => handleMetricChange(metricIndex, 'name', e.target.value)}
                                                        className="h-10 bg-white/5 border-white/5 font-bold text-xs rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Standard Unit</label>
                                                    <Input
                                                        placeholder="e.g. MILLILITERS"
                                                        required
                                                        value={metric.unit}
                                                        onChange={e => handleMetricChange(metricIndex, 'unit', e.target.value)}
                                                        className="h-10 bg-white/5 border-white/5 font-bold text-xs rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Aggregation Method</label>
                                                    <select
                                                        value={metric.aggregationMethod}
                                                        onChange={e => handleMetricChange(metricIndex, 'aggregationMethod', e.target.value as AggregationMethodV2)}
                                                        className="w-full h-10 bg-white/5 border border-white/5 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest focus:outline-none"
                                                    >
                                                        <option value="SUM">Summation</option>
                                                        <option value="COUNT">Frequency Count</option>
                                                        <option value="MAX">Peak Value</option>
                                                        <option value="LAST">Terminal Value</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Sub-section: Scoring Rules */}
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-3">
                                                        <Layers className="w-4 h-4 text-primary" />
                                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Scoring Brackets</h5>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleAddRule(metricIndex)} className="h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                                                        <Plus className="w-3 h-3 mr-2" />
                                                        Apply New Rule
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    {metric.scoringRules.map((rule, ruleIndex) => (
                                                        <div key={ruleIndex} className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/[0.03] group/rule">
                                                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-bold text-muted-foreground uppercase pl-1">Min Threshold</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={rule.thresholdMin}
                                                                        onChange={e => handleRuleChange(metricIndex, ruleIndex, 'thresholdMin', e.target.value)}
                                                                        className="h-8 bg-white/5 border-white/5 text-[10px] font-bold rounded-lg"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-bold text-muted-foreground uppercase pl-1">Max Threshold</label>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Infinity"
                                                                        value={rule.thresholdMax === null ? "" : rule.thresholdMax}
                                                                        onChange={e => handleRuleChange(metricIndex, ruleIndex, 'thresholdMax', e.target.value)}
                                                                        className="h-8 bg-white/5 border-white/5 text-[10px] font-bold rounded-lg"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-bold text-primary/70 uppercase pl-1">Points Awarded</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={rule.points}
                                                                        onChange={e => handleRuleChange(metricIndex, ruleIndex, 'points', e.target.value)}
                                                                        className="h-8 bg-primary/5 border-primary/10 text-[10px] font-black text-primary rounded-lg"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-bold text-muted-foreground uppercase pl-1">Prio</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={rule.priority}
                                                                        onChange={e => handleRuleChange(metricIndex, ruleIndex, 'priority', e.target.value)}
                                                                        className="h-8 bg-white/5 border-white/5 text-[10px] font-bold rounded-lg"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveRule(metricIndex, ruleIndex)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-rule/hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer (Internal to scroll) */}
                            <div className="pt-12 flex flex-col sm:flex-row gap-6 border-t border-white/5">
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="h-16 flex-1 rounded-2xl text-muted-foreground font-black uppercase tracking-widest border border-white/5 hover:bg-white/5">
                                    Abort Operation
                                </Button>
                                <Button type="submit" disabled={isAdding} className="h-16 flex-1 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 rounded-2xl text-xl font-black italic uppercase tracking-tighter group">
                                    {isAdding ? <Loader2 className="animate-spin mr-3 w-6 h-6" /> : <ShieldCheck className="w-6 h-6 mr-3 group-hover:scale-125 transition-transform" />}
                                    Commit Configuration
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
