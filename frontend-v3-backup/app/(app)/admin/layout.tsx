"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && user.role !== "admin") router.replace("/fund");
  }, [loading, user, router]);

  if (loading || !user) return null;
  if (user.role !== "admin") {
    return (
      <main className="container">
        <p className="err">Admin only. Redirecting…</p>
      </main>
    );
  }
  return <>{children}</>;
}
