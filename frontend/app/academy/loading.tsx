export default function AcademyLoading() {
  return (
    <div className="min-h-screen bg-[#030A06] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#C4A048] border-t-transparent rounded-full animate-spin" />
        <div className="font-mono text-sm text-[#7A9A82]">Loading NEST Academy…</div>
      </div>
    </div>
  );
}
