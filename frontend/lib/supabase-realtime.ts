// lib/supabase-realtime.ts
"use client";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client: ReturnType<typeof createClient> | null = null;

export function getRealtimeClient() {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return _client;
}

export function subscribeToDealUpdates(
  dealId: string,
  onUpdate: (deal: Record<string, unknown>) => void
): () => void {
  const client = getRealtimeClient();
  const channel = client
    .channel(`deal-${dealId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "deals", filter: `id=eq.${dealId}` }, payload => {
      onUpdate(payload.new as Record<string, unknown>);
    })
    .subscribe();
  return () => { client.removeChannel(channel); };
}

export function subscribeToAllDeals(
  onUpdate: (deal: Record<string, unknown>, event: string) => void
): () => void {
  const client = getRealtimeClient();
  const channel = client
    .channel("all-deals")
    .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, payload => {
      onUpdate(payload.new as Record<string, unknown>, payload.eventType);
    })
    .subscribe();
  return () => { client.removeChannel(channel); };
}

// React hook
import { useEffect, useState } from "react";

export function useLiveDeal(dealId: string | null, initialData: Record<string, unknown> | null = null) {
  const [deal, setDeal] = useState(initialData);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!dealId) return;
    setConnected(true);
    const unsubscribe = subscribeToDealUpdates(dealId, (updated) => setDeal(updated));
    return () => { unsubscribe(); setConnected(false); };
  }, [dealId]);

  return { deal, connected };
}
