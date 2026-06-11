import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Market Rates" silo="Market Intelligence" api="/api/market" status="shell" />;
}