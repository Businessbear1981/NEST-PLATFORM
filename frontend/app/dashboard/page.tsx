import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Dashboard" silo="Admin & Agents" api="/api/deals" status="active" />;
}