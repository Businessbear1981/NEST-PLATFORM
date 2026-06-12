"use client";
/*
Rating/Grading Room: Credit scoring, rating assignment, approval workflow, rating history.
*/
import { TrendingUp, AlertCircle, CheckCircle2, Lock, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";

export interface RatingAssignment {
  id: string;
  issuerName: string;
  dealName: string;
  trancheName: string;
  proposedRating: string;
  currentRating: string | null;
  ratingRationale: string;
  scoringModel: {
    financialStrength: number;
    marketPosition: number;
    managementQuality: number;
    covenantStructure: number;
    marketConditions: number;
    compositeScore: number;
  };
  ratingHistory: { rating: string; date: string; analyst: string }[];
  status: "Draft" | "Pending Approval" | "Approved" | "Published" | "Under Review";
  analyst: string;
  reviewer: string | null;
  createdAt: string;
  approvedAt: string | null;
}

interface RatingGradingRoomProps {
  ratings: RatingAssignment[];
  onSubmitForApproval?: (ratingId: string) => void;
  onApprove?: (ratingId: string) => void;
  onReject?: (ratingId: string) => void;
}

function RatingBadge({ rating }: { rating: string }) {
  const colors: Record<string, string> = {
    "AAA": "bg-emerald-900 text-emerald-300",
    "AA": "bg-emerald-800 text-emerald-300",
    "A": "bg-[#0D2218] text-[#C4A048]",
    "BBB": "bg-yellow-900 text-yellow-300",
    "BB": "bg-orange-900 text-orange-300",
    "B": "bg-red-900 text-red-300",
    "CCC": "bg-red-950 text-red-300",
  };
  return (
    <span className={`px-3 py-1 rounded font-mono font-bold text-sm ${colors[rating] || "bg-[#1E4A2E] text-[#EDE8DC]"}`}>
      {rating}
    </span>
  );
}

export function RatingGradingRoom({ ratings, onSubmitForApproval, onApprove, onReject }: RatingGradingRoomProps) {
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [methodologySignal, setMethodologySignal] = useState("Moody's/S&P methodology feed idle; select a rating or pulse the feed to simulate a recon update.");

  const filteredRatings = ratings.filter((r) => filterStatus === "All" || r.status === filterStatus);
  const selected = ratings.find((r) => r.id === selectedRating);

  return (
    <div className="space-y-6" data-testid="rating-grading-room">
      <div className="rounded-2xl border border-[#C4A048]/25 bg-black/85 p-4 shadow-[0_0_40px_rgba(196,160,72,0.08)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#E8C87A]">
              <TrendingUp size={14} /> Rating live/demo surface
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-100">interactive cues active</span>
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-[#EDE8DC]">
              This room is a controlled frontend demo: rating rows can be selected, status filters change the visible queue, and the methodology feed pulse below creates a visible state change before human approval actions are triggered.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMethodologySignal("Methodology pulse routed: affected deals rescored, reviewer queue refreshed, and rating memo update flagged for human approval.")}
            className="rounded-xl border border-[#C4A048]/30 bg-[#C4A048]/10 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[#EDE8DC] hover:bg-[#C4A048]/20"
          >
            Pulse methodology feed
          </button>
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#EDE8DC]">
          {methodologySignal}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Total Ratings</p>
          <p className="text-2xl font-bold text-[#EDE8DC]">{ratings.length}</p>
        </div>
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Draft</p>
          <p className="text-2xl font-bold text-[#7A9A82]">{ratings.filter((r) => r.status === "Draft").length}</p>
        </div>
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{ratings.filter((r) => r.status === "Pending Approval").length}</p>
        </div>
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-400">{ratings.filter((r) => r.status === "Approved").length}</p>
        </div>
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Published</p>
          <p className="text-2xl font-bold text-[#C4A048]">{ratings.filter((r) => r.status === "Published").length}</p>
        </div>
      </div>

      {/* Filter */}
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="text-xs px-2 py-1 bg-[#0D2218] border border-[#1E4A2E] rounded text-[#EDE8DC]"
      >
        <option>All Status</option>
        <option>Draft</option>
        <option>Pending Approval</option>
        <option>Approved</option>
        <option>Published</option>
        <option>Under Review</option>
      </select>

      {/* Rating List */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-mono text-[#7A9A82] px-3 py-2 border-b border-[#1E4A2E]">
          <div className="col-span-3">Issuer / Deal</div>
          <div className="col-span-2">Tranche</div>
          <div className="col-span-2">Proposed</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Analyst</div>
        </div>

        {filteredRatings.map((rating) => (
          <div
            key={rating.id}
            onClick={() => setSelectedRating(rating.id)}
            className={`grid grid-cols-12 gap-2 text-xs px-3 py-2 border border-[#1E4A2E] rounded cursor-pointer transition ${
              selectedRating === rating.id ? "bg-[#0D2218] border-cyan-400" : "hover:bg-[#030A06]"
            }`}
          >
            <div className="col-span-3 font-mono text-[#EDE8DC]">
              <div>{rating.issuerName}</div>
              <div className="text-[#7A9A82]">{rating.dealName}</div>
            </div>
            <div className="col-span-2 text-[#7A9A82]">{rating.trancheName}</div>
            <div className="col-span-2">
              <RatingBadge rating={rating.proposedRating} />
            </div>
            <div className="col-span-2">
              <span
                className={`px-2 py-1 rounded text-xs font-mono ${
                  rating.status === "Approved"
                    ? "bg-emerald-900 text-emerald-300"
                    : rating.status === "Pending Approval"
                      ? "bg-yellow-900 text-yellow-300"
                      : rating.status === "Published"
                        ? "bg-cyan-900 text-[#C4A048]"
                        : "bg-[#1E4A2E] text-[#EDE8DC]"
                }`}
              >
                {rating.status}
              </span>
            </div>
            <div className="col-span-3 text-[#7A9A82]">{rating.analyst}</div>
          </div>
        ))}
      </div>

      {/* Rating Detail */}
      {selected && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-mono">{selected.issuerName}</CardTitle>
                <CardDescription>{selected.dealName} / {selected.trancheName}</CardDescription>
              </div>
              <RatingBadge rating={selected.proposedRating} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scoring Model */}
            <div className="border-t border-[#1E4A2E] pt-4">
              <p className="text-xs font-mono text-[#7A9A82] mb-3">Scoring Model</p>
              <div className="space-y-2">
                {[
                  { label: "Financial Strength", score: selected.scoringModel.financialStrength },
                  { label: "Market Position", score: selected.scoringModel.marketPosition },
                  { label: "Management Quality", score: selected.scoringModel.managementQuality },
                  { label: "Covenant Structure", score: selected.scoringModel.covenantStructure },
                  { label: "Market Conditions", score: selected.scoringModel.marketConditions },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-[#7A9A82]">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#1E4A2E] rounded overflow-hidden">
                        <div
                          className="h-full bg-cyan-500"
                          style={{ width: `${(item.score / 100) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[#EDE8DC] w-8 text-right">{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1E4A2E] mt-3 pt-3 flex items-center justify-between">
                <span className="text-sm font-mono text-[#EDE8DC]">Composite Score</span>
                <span className="text-lg font-bold text-[#C4A048]">{selected.scoringModel.compositeScore}</span>
              </div>
            </div>

            {/* Rationale */}
            <div className="border-t border-[#1E4A2E] pt-4">
              <p className="text-xs font-mono text-[#7A9A82] mb-2">Rating Rationale</p>
              <p className="text-xs text-[#EDE8DC] leading-relaxed">{selected.ratingRationale}</p>
            </div>

            {/* Rating History */}
            <div className="border-t border-[#1E4A2E] pt-4">
              <p className="text-xs font-mono text-[#7A9A82] mb-2">Rating History</p>
              <div className="space-y-1">
                {selected.ratingHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-[#7A9A82]">{entry.date}</span>
                    <RatingBadge rating={entry.rating} />
                    <span className="text-[#7A9A82]">{entry.analyst}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-[#1E4A2E] pt-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[#7A9A82]">Analyst</p>
                <p className="font-mono text-[#EDE8DC]">{selected.analyst}</p>
              </div>
              <div>
                <p className="text-[#7A9A82]">Reviewer</p>
                <p className="font-mono text-[#EDE8DC]">{selected.reviewer || "Pending"}</p>
              </div>
              <div>
                <p className="text-[#7A9A82]">Created</p>
                <p className="font-mono text-[#EDE8DC]">{selected.createdAt}</p>
              </div>
              <div>
                <p className="text-[#7A9A82]">Approved</p>
                <p className="font-mono text-[#EDE8DC]">{selected.approvedAt || "—"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-[#1E4A2E] pt-4 flex gap-2">
              {selected.status === "Draft" && (
                <button
                  onClick={() => onSubmitForApproval?.(selected.id)}
                  className="flex-1 px-3 py-2 bg-cyan-900 text-[#C4A048] rounded text-xs font-mono hover:bg-cyan-800 flex items-center justify-center gap-2"
                >
                  <Send size={12} /> Submit for Approval
                </button>
              )}
              {selected.status === "Pending Approval" && (
                <>
                  <button
                    onClick={() => onApprove?.(selected.id)}
                    className="flex-1 px-3 py-2 bg-emerald-900 text-emerald-300 rounded text-xs font-mono hover:bg-emerald-800 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={12} /> Approve & Publish
                  </button>
                  <button
                    onClick={() => onReject?.(selected.id)}
                    className="flex-1 px-3 py-2 bg-red-900 text-red-300 rounded text-xs font-mono hover:bg-red-800 flex items-center justify-center gap-2"
                  >
                    <AlertCircle size={12} /> Reject
                  </button>
                </>
              )}
              {selected.status === "Published" && (
                <div className="flex-1 px-3 py-2 bg-[#1E4A2E] text-[#EDE8DC] rounded text-xs font-mono flex items-center justify-center gap-2">
                  <Lock size={12} /> Published
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
