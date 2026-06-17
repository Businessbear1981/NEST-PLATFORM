"use client";
import dynamic from "next/dynamic";

const NightVisionComplianceLair = dynamic(
  () => import("@/components/NightVisionComplianceLair"),
  { ssr: false }
);

export default function Page() { return <NightVisionComplianceLair />; }
