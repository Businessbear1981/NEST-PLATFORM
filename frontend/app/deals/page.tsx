import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Active Deals" silo="Deal Pipeline" api="/api/deals" status="active" />;
}