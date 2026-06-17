"use client";
import dynamic from "next/dynamic";

const RiskCommandCenter = dynamic(
  () => import("@/components/RiskCommandCenter"),
  { ssr: false }
);

export default function Page() { return <RiskCommandCenter />; }