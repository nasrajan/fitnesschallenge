"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user && user.role === 'ADMIN') {
                router.push("/admin/dashboard");
            } else {
                router.push("/admin/login");
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );
}
