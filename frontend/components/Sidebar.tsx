"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { silo:"Deal Pipeline", items:[
    { href:"/deals",            label:"Active Deals",        st:"active" },
    { href:"/deal-input",       label:"Deal Intake",         st:"active" },
    { href:"/preflight",        label:"Preflight Interview", st:"shell"  },
    { href:"/workflow",         label:"Pipeline Workflow",   st:"shell"  },
    { href:"/operations/deals", label:"Operations",          st:"active" },
  ]},
  { silo:"EagleEye Intelligence", items:[
    { href:"/eagleeye",    label:"M&A + CRE Heat Map",  st:"active" },
    { href:"/ma",          label:"M&A Analysis",        st:"shell"  },
    { href:"/convergence", label:"Convergence Engine",  st:"shell"  },
  ]},
  { silo:"Roots", items:[
    { href:"/roots",    label:"Deal Origination", st:"active" },
    { href:"/upload",   label:"Document Upload",  st:"active" },
    { href:"/forensic", label:"Forensic Audit",   st:"active" },
  ]},
  { silo:"Bond Desk / ALADDIN", items:[
    { href:"/bond-desk",        label:"CMBS Arrangement",    st:"active" },
    { href:"/bond-intel",       label:"Bond Intelligence",   st:"active" },
    { href:"/bond-structuring", label:"Structure Analysis",  st:"shell"  },
    { href:"/bond-tools",       label:"Grade / Audit",       st:"shell"  },
    { href:"/bond-workflow",    label:"Bond Workflow",       st:"shell"  },
    { href:"/command-center",   label:"Command Center",      st:"active" },
    { href:"/modeling",         label:"Modeling Studio",     st:"active" },
  ]},
  { silo:"Hawkeye Placement", items:[
    { href:"/hawkeye",       label:"Investor Placement",     st:"active" },
    { href:"/investors",     label:"Investor Management",    st:"shell"  },
    { href:"/institutional", label:"Institutional Dashboard",st:"active" },
  ]},
  { silo:"NightVision Compliance", items:[
    { href:"/nightvision", label:"Compliance Lair",   st:"active" },
    { href:"/kyc",         label:"KYC",               st:"active" },
    { href:"/compliance",  label:"Compliance Portal", st:"active" },
  ]},
  { silo:"Phoenix Distressed CRE", items:[
    { href:"/phoenix",       label:"Phoenix Desk",  st:"active" },
    { href:"/due-diligence", label:"Due Diligence", st:"shell"  },
  ]},
  { silo:"Treasury", items:[
    { href:"/treasury", label:"Treasury Operations", st:"active" },
    { href:"/fund",     label:"HFT Fund / Quantum",  st:"shell"  },
    { href:"/deposits", label:"Client Deposits",     st:"active" },
  ]},
  { silo:"Bernard / AI Engine", items:[
    { href:"/bernard",  label:"Bernard Concierge",     st:"active" },
    { href:"/ai-tools", label:"Central Nervous System",st:"active" },
  ]},
  { silo:"Credit Underwriting", items:[
    { href:"/credit", label:"Credit Analysis",     st:"active" },
    { href:"/rating", label:"Rating Intelligence", st:"active" },
    { href:"/surety", label:"Surety / Insurance",  st:"active" },
    { href:"/risk",   label:"Risk Command Center", st:"active" },
  ]},
  { silo:"EMMA", items:[
    { href:"/emma", label:"Municipal Bond Data", st:"active" },
  ]},
  { silo:"Market Intelligence", items:[
    { href:"/signals", label:"Signal Feed",  st:"active" },
    { href:"/market",  label:"Market Rates", st:"shell"  },
  ]},
  { silo:"Construction", items:[
    { href:"/construction", label:"Construction Monitoring", st:"active" },
  ]},
  { silo:"Surveillance", items:[
    { href:"/surveillance", label:"Deal Surveillance", st:"active" },
    { href:"/covenants",    label:"Covenants",         st:"active" },
    { href:"/perm",         label:"Perm Debt Monitor", st:"shell"  },
    { href:"/trustee",      label:"Trustee Management",st:"active" },
  ]},
  { silo:"Client Portal", items:[
    { href:"/client", label:"Client Dashboard", st:"active" },
  ]},
  { silo:"Business Development", items:[
    { href:"/bd",        label:"BD Engine",             st:"shell"  },
    { href:"/marketing", label:"Marketing Studio",      st:"active" },
    { href:"/lenders",   label:"Lender Command Center", st:"active" },
  ]},
  { silo:"Admin & Agents", items:[
    { href:"/admin",           label:"Admin Platform", st:"active" },
    { href:"/agents",          label:"Agent Fleet",    st:"active" },
    { href:"/agents/platform", label:"Agent Platform", st:"active" },
    { href:"/study",           label:"Study Portal",   st:"active" },
    { href:"/dashboard",       label:"Dashboard",      st:"active" },
  ]},
  { silo:"Research", items:[
    { href:"/deal-intake", label:"Intake Modeling", st:"active" },
    { href:"/about",       label:"About NEST",      st:"active" },
  ]},
];

const DOT: Record<string,string> = {
  active:"bg-[#C4A048]", stub:"bg-yellow-500", shell:"bg-[#2D6B3D]",
};

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string,boolean>>(
    Object.fromEntries(NAV.map((n,i)=>[n.silo, i < 2]))
  );
  const toggle = (s:string) => setOpen(p=>({...p,[s]:!p[s]}));
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#030A06] border-r border-[#1E4A2E] flex flex-col z-40 overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1E4A2E] flex-shrink-0">
        <div className="font-display text-2xl text-[#C4A048] tracking-widest">NEST</div>
        <div className="font-body text-[10px] text-[#7A9A82] tracking-wider mt-0.5 uppercase">Advisors · Arden Edge Capital</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map(group=>(
          <div key={group.silo}>
            <button
              onClick={()=>toggle(group.silo)}
              className="w-full flex items-center justify-between px-4 py-2 text-[#7A9A82] hover:text-[#C4A048] transition-colors text-[10px] font-body uppercase tracking-widest"
            >
              <span>{group.silo}</span>
              {open[group.silo]
                ? <ChevronDown className="w-3 h-3 flex-shrink-0"/>
                : <ChevronRight className="w-3 h-3 flex-shrink-0"/>}
            </button>
            {open[group.silo] && (
              <ul className="mb-1">
                {group.items.map(item=>(
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2.5 px-6 py-1.5 text-sm font-body transition-colors",
                        (pathname===item.href||pathname?.startsWith(item.href+"/"))
                          ?"text-[#C4A048] bg-[#0D2218]"
                          :"text-[#EDE8DC] hover:text-[#C4A048] hover:bg-[#0D2218]"
                      )}
                    >
                      <span className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0",DOT[item.st])}/>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
      <div className="px-5 py-3 border-t border-[#1E4A2E] flex-shrink-0">
        <p className="font-display text-xs text-[#7A9A82] italic">It&apos;s Time To Fly</p>
        <p className="font-mono text-[10px] text-[#2D6B3D] mt-0.5">v4.0 · 2026</p>
      </div>
    </aside>
  );
}