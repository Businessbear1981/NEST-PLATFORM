import ModuleShell from "@/components/ModuleShell";
export default function Page() {
  return <ModuleShell title="Client Deposits" silo="Treasury" api="/api/client" status="active" />;
}