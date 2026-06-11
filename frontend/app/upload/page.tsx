import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Document Upload" silo="Roots" api="/api/docs/ingest" status="active" />;
}