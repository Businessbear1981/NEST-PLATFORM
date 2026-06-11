import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Deal Detail" silo="Deal Pipeline" api="/api/deals" status="active" />;
}