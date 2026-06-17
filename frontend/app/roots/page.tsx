"use client";
import dynamic from "next/dynamic";

const RootsPage = dynamic(
  () => import("@/components/OperationalModulesPages").then(m => ({ default: m.RootsPage })),
  { ssr: false }
);

export default function Page() { return <RootsPage />; }
