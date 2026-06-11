import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="About NEST" silo="Research" api="/api/health" status="active" />;
}