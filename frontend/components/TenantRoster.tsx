"use client";
import { useState } from "react";
import { Building2, Loader2, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

const inputClass = "rounded-xl border border-[#C4A048]/20 bg-black/45 px-3 py-2 text-sm text-[#EDE8DC] outline-none placeholder:text-[#7A9A82] focus:border-[#C4A048]/55 focus:ring-2 focus:ring-cyan-300/10";

function money(value?: string | number | null) {
  if (value === undefined || value === null) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function statusClass(status: string) {
  if (status === "active") return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  if (status === "expiring") return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  if (status === "default") return "border-red-300/30 bg-red-400/10 text-red-100";
  return "border-[#7A9A82]/20 bg-white/[0.04] text-[#EDE8DC]";
}

export default function TenantRoster({ dealId }: { dealId: number }) {
  const [newTenant, setNewTenant] = useState({ name: "", leaseAmount: "", rentAmount: "", creditScore: "" });
  const tenantsQuery = trpc.tenants.listByDeal.useQuery({ dealId });
  const createTenantMutation = trpc.tenants.create.useMutation({
    onSuccess: () => {
      tenantsQuery.refetch();
      setNewTenant({ name: "", leaseAmount: "", rentAmount: "", creditScore: "" });
    },
  });
  const updateTenantMutation = trpc.tenants.update.useMutation({ onSuccess: () => tenantsQuery.refetch() });

  const tenants = tenantsQuery.data ?? [];
  const activeTenants = tenants.filter((tenant) => tenant.status === "active").length;
  const monthlyRent = tenants.reduce((sum, tenant) => sum + Number(tenant.rentAmount ?? 0), 0);
  const averageCredit = tenants.length ? Math.round(tenants.reduce((sum, tenant) => sum + Number(tenant.creditScore ?? 0), 0) / tenants.length) : 0;

  const handleCreateTenant = () => {
    if (!newTenant.name || !newTenant.leaseAmount || !newTenant.rentAmount) return;
    createTenantMutation.mutate({
      dealId,
      name: newTenant.name,
      leaseAmount: newTenant.leaseAmount,
      rentAmount: newTenant.rentAmount,
      creditScore: newTenant.creditScore ? Number(newTenant.creditScore) : undefined,
    });
  };

  return (
    <div className="space-y-5 text-[#EDE8DC]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#E8C87A]"><Users size={17} /> Tenant portfolio</div>
          <p className="mt-1 text-sm leading-6 text-[#7A9A82]">Backend-connected tenant records, lease exposure, monthly rent, and credit status.</p>
        </div>
        <span className="w-fit rounded-full border border-[#C4A048]/30 bg-[#C4A048]/10 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#EDE8DC]">{tenants.length} tenant records</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[#C4A048]/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(196,160,72,0.08)]"><span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7A9A82]">Active tenants</span><p className="mt-2 font-mono text-2xl font-semibold text-[#EDE8DC]">{activeTenants}</p></div>
        <div className="rounded-2xl border border-amber-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(251,191,36,0.08)]"><span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7A9A82]">Monthly rent</span><p className="mt-2 font-mono text-2xl font-semibold text-amber-100">{money(monthlyRent)}</p></div>
        <div className="rounded-2xl border border-emerald-300/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(52,211,153,0.08)]"><span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7A9A82]">Avg. credit</span><p className="mt-2 font-mono text-2xl font-semibold text-emerald-100">{averageCredit || "—"}</p></div>
      </div>

      {tenantsQuery.isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-[#C4A048]/20 bg-black/30 p-8 text-sm text-[#7A9A82]"><Loader2 className="mr-2 animate-spin text-[#E8C87A]" size={16} /> Loading tenants...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="overflow-hidden rounded-2xl border border-[#C4A048]/20 bg-black/30 shadow-[0_0_32px_rgba(196,160,72,0.08)]">
            {tenants.length === 0 ? (
              <div className="p-6 text-sm text-[#7A9A82]">No tenant records yet. Add a tenant to begin lease monitoring.</div>
            ) : (
              <div className="divide-y divide-white/10">
                {tenants.map((tenant) => (
                  <article key={tenant.id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1.4fr)_8rem_8rem_8rem_7rem] lg:items-center">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C4A048]/25 bg-[#C4A048]/10 text-[#EDE8DC]"><Building2 size={17} /></div><div><h3 className="font-mono font-semibold uppercase tracking-[0.05em] text-white">{tenant.name}</h3><p className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-[#7A9A82]">Tenant #{tenant.id}</p></div></div>
                    <span className="text-sm text-[#7A9A82]">Lease {money(tenant.leaseAmount)}</span>
                    <span className="font-mono text-sm font-semibold text-amber-100">{money(tenant.rentAmount)}/mo</span>
                    <span className="text-sm text-[#7A9A82]">Credit {tenant.creditScore ?? "—"}</span>
                    <div className="flex items-center gap-2 lg:justify-end"><span className={`rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.13em] ${statusClass(tenant.status)}`}>{tenant.status}</span><button onClick={() => updateTenantMutation.mutate({ tenantId: tenant.id, status: tenant.status === "active" ? "expiring" : "active" })} disabled={updateTenantMutation.isPending} className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#EDE8DC] disabled:opacity-60">Toggle</button></div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-[#C4A048]/25 bg-black/35 p-4 shadow-[0_0_32px_rgba(196,160,72,0.08)]">
            <h3 className="font-mono font-semibold uppercase tracking-[0.08em] text-white">Add tenant</h3>
            <div className="mt-4 grid gap-3">
              <input type="text" value={newTenant.name} onChange={(event) => setNewTenant({ ...newTenant, name: event.target.value })} placeholder="Tenant name" className={inputClass} />
              <input type="number" value={newTenant.leaseAmount} onChange={(event) => setNewTenant({ ...newTenant, leaseAmount: event.target.value })} placeholder="Lease amount" className={inputClass} />
              <input type="number" value={newTenant.rentAmount} onChange={(event) => setNewTenant({ ...newTenant, rentAmount: event.target.value })} placeholder="Monthly rent" className={inputClass} />
              <input type="number" value={newTenant.creditScore} onChange={(event) => setNewTenant({ ...newTenant, creditScore: event.target.value })} placeholder="Credit score" className={inputClass} />
              <button onClick={handleCreateTenant} disabled={createTenantMutation.isPending} className="rounded-xl border border-[#C4A048]/35 bg-[#C4A048]/12 px-4 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#EDE8DC] shadow-[0_0_24px_rgba(196,160,72,0.13)] transition hover:bg-[#C4A048]/20 disabled:opacity-60">{createTenantMutation.isPending ? "Adding..." : "Add tenant"}</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
