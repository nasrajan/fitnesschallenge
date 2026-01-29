"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ActivityType } from "@/lib/types";
import { logActivity } from "@/app/actions"; // Server Action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function LogActivityPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<ActivityType>('WALK');
    const [done, setDone] = useState(true);
    const [note, setNote] = useState("");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        setSuccessMessage("");

        const result = await logActivity({
            id: crypto.randomUUID(),
            userEmail: user.email,
            date,
            type,
            completed: done,
            note,
            value: amount ? parseFloat(amount) : undefined,
            timestamp: new Date().toISOString()
        });

        if (result.success) {
            setSuccessMessage(`Successfully logged ${type.replace('_', ' ').toLowerCase()}!`);
            // Reset form for next entry
            setNote("");
            setAmount("");
            // Keeping date and done status as they might be likely to repeat

            // Clear message after some time
            setTimeout(() => setSuccessMessage(""), 3000);
            setIsSubmitting(false);
        } else {
            alert("Failed to log activity");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-10">
            {/* Header */}
            <header className="px-4 py-4 flex items-center gap-4 border-b border-border/50">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-bold">Log Activity</h1>
            </header>

            <main className="px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Activity Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Activity Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['WALK', 'WATER', 'WORKOUT', 'RAMADAN_PREP'] as ActivityType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`p-4 rounded-xl border text-sm font-medium transition-all ${type === t
                                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                        : "border-input bg-card hover:bg-accent"
                                        }`}
                                >
                                    {t.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {type === 'WALK' ? "Miles (Optional)" :
                                type === 'WATER' ? "Liters (Optional)" :
                                    type === 'WORKOUT' ? "Minutes (Optional)" : "Amount (Optional)"}
                        </label>
                        <Input
                            type="number"
                            step="0.1"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-card/50"
                        />
                    </div>

                    {/* Done Checkbox */}
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-input bg-card/50">
                        <input
                            type="checkbox"
                            checked={done}
                            onChange={(e) => setDone(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                            id="done-check"
                        />
                        <label htmlFor="done-check" className="font-medium">Mark as Done</label>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Note</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="How did it go?"
                            className="flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {successMessage && (
                        <p className="text-center text-emerald-600 font-medium animate-in fade-in slide-in-from-bottom-2">
                            {successMessage}
                        </p>
                    )}

                    <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-2xl shadow-lg shadow-primary/20" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                        Save Activity
                    </Button>

                </form>
            </main>
        </div>
    );
}
