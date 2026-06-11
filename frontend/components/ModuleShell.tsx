import clsx from "clsx";

interface Props {
  title: string;
  silo: string;
  api: string;
  status: "active"|"stub"|"shell"|"missing";
  children?: React.ReactNode;
}

const CFG = {
  active:  { label:"Active",                    dot:"bg-emerald-400", txt:"text-emerald-400" },
  stub:    { label:"Stub — real logic pending",  dot:"bg-yellow-400",  txt:"text-yellow-400"  },
  shell:   { label:"Shell — wiring in progress", dot:"bg-gray-500",    txt:"text-gray-400"    },
  missing: { label:"Backend not yet built",      dot:"bg-red-500",     txt:"text-red-400"     },
};

export default function ModuleShell({ title, silo, api, status, children }: Props) {
  const c = CFG[status];
  return (
    <div className="min-h-screen bg-[#030A06] px-8 py-10">
      <div className="mb-8 pb-6 border-b border-[#1E4A2E]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-[10px] text-[#7A9A82] uppercase tracking-widest mb-1">{silo}</p>
            <h1 className="font-display text-5xl text-[#C4A048] leading-none">{title}</h1>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-shrink-0">
            <span className={clsx("w-2 h-2 rounded-full",c.dot)}/>
            <span className={clsx("font-mono text-xs",c.txt)}>{c.label}</span>
          </div>
        </div>
        <p className="font-mono text-xs text-[#2D6B3D] mt-4">{api}</p>
      </div>
      {children ?? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0,1,2].map(i=>(
            <div key={i} className="bg-[#0D2218] rounded-lg border border-[#1E4A2E] h-28 animate-pulse"/>
          ))}
          <div className="md:col-span-3 bg-[#0D2218] rounded-lg border border-[#1E4A2E] h-64 animate-pulse"/>
        </div>
      )}
    </div>
  );
}