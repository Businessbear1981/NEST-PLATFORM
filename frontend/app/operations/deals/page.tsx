import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Operations" silo="Deal Pipeline" api="/api/deals" status="active" />;
}