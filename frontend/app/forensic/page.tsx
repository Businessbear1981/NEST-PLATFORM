import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Forensic Audit" silo="Roots" api="/api/audit" status="active" />;
}