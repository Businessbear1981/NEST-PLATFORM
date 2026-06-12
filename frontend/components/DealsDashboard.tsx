"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Landmark } from "lucide-react";

export function DealsDashboard() {
  const [newDeal, setNewDeal] = useState({
    name: "",
    issuer: "",
    amount: "",
  });

  const dealsQuery = trpc.deals.list.useQuery();
  const createDealMutation = trpc.deals.create.useMutation({
    onSuccess: () => {
      dealsQuery.refetch();
      setNewDeal({ name: "", issuer: "", amount: "" });
    },
  });

  const handleCreateDeal = () => {
    if (!newDeal.name || !newDeal.issuer || !newDeal.amount) {
      alert("All fields are required");
      return;
    }

    createDealMutation.mutate({
      name: newDeal.name,
      issuer: newDeal.issuer,
      amount: newDeal.amount,
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-[#C4A048]/50 border-[#C4A048]/50 text-[#C4A048]";
    if (status === "closed") return "bg-green-950/50 border-green-900/50 text-green-400";
    if (status === "pipeline") return "bg-amber-950/50 border-amber-900/50 text-amber-400";
    return "bg-gray-950/50 border-gray-900/50 text-gray-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Landmark className="text-[#C4A048]" />
          Deals Dashboard
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Institutional bond deals and project tracking
        </p>
      </div>

      {dealsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {/* Existing Deals */}
          {dealsQuery.data && dealsQuery.data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dealsQuery.data.map((deal) => (
                <Card key={deal.id} className="p-4 border-[#C4A048]/50 bg-[#C4A048]/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{deal.name}</h3>
                      <p className="text-sm text-gray-400">{deal.issuer}</p>
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${getStatusColor(deal.status)}`}>
                      {deal.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Amount</span>
                    <p className="font-mono text-[#C4A048] font-bold">
                      ${parseFloat(deal.amount).toLocaleString()}M
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Created {new Date(deal.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* Create New Deal */}
          <Card className="p-6 border-[#C4A048]/50 bg-[#C4A048]/20">
            <h3 className="font-bold mb-4">Create New Deal</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Deal Name</label>
                <input
                  type="text"
                  value={newDeal.name}
                  onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                  placeholder="e.g., Municipal Bond Series A"
                  className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-400">Issuer</label>
                <input
                  type="text"
                  value={newDeal.issuer}
                  onChange={(e) => setNewDeal({ ...newDeal, issuer: e.target.value })}
                  placeholder="e.g., City of Springfield"
                  className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-400">Amount ($M)</label>
                <input
                  type="number"
                  value={newDeal.amount}
                  onChange={(e) => setNewDeal({ ...newDeal, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                />
              </div>
            </div>

            <Button
              onClick={handleCreateDeal}
              disabled={createDealMutation.isPending}
              className="w-full bg-[#C4A048] hover:bg-[#C4A048]"
            >
              {createDealMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Create Deal"
              )}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
