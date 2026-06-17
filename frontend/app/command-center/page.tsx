"use client";
import dynamic from "next/dynamic";

const BondCommandCenter = dynamic(
  () => import("@/components/BondCommandCenter"),
  { ssr: false }
);

export default function Page() { return <BondCommandCenter dealId="demo" />; }
