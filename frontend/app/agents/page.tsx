import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Agent Fleet" silo="Admin & Agents" api="/api/agents" status="active" />;
}