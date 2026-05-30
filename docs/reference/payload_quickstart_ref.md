# Payload Orchestration Platform — Claude Code Quick-Start Reference

**Use this document alongside payload\_design\_spec.md.**
This file is optimized for pasting directly into a Claude Code session. It gives Claude the minimum context needed to work on any part of the codebase without re-reading the full spec.

## Project in One Sentence

A single-page military C2 interface (client/src/pages/Home.tsx, ~1,550 lines) built with React 19 + Vite + Tailwind CSS v4 + Framer Motion + IBM Plex Mono. Near-black background (#030805), phosphor green primary (#00ff88), amber secondary (#ffbf00), cyan info (#00d4ff), red danger (#ff3366). No backend. No database. All state is in-memory React.

## Critical Rules

1. **Font is always IBM Plex Mono.** Never use any other font. Apply via font-mono class or font-family: 'IBM Plex Mono', monospace inline.
2. **No rounded corners above 6px.** border-radius: 4px is the default. This is not a SaaS app.
3. **All colors are purposeful.** Green = active/safe. Amber = Bernard/warnings. Cyan = data/Manus. Red = launch/classified. Magenta = intel. Orange = Higgsfield/social. Do not introduce new colors without assigning them to a system.
4. **All text uses letter-spacing.** Labels: letterSpacing: 2–4. Body: letterSpacing: 1. Never zero.
5. **TypeScript must compile clean.** Run pnpm check after every change. The project uses tsc --noEmit.
6. **Do not split Home.tsx into separate files** unless explicitly asked. All components are intentionally inline.
7. **Do not add a backend or database** unless explicitly asked. This is a static frontend.

## How to Run

cd /home/ubuntu/payload-frontend

pnpm dev # Start dev server on port 3000

pnpm check # TypeScript check (must pass before committing)

pnpm build # Production build

## Layout at a Glance

fixed inset-0 overflow-hidden background: #030805

├── TOP BAR (32px) — Logo, status dots, CHAT button

├── PLATFORM TABS (36px) — 30 tabs in 5 groups (AI/SOCIAL/COMMS/FINANCE/INTEL)

└── MAIN (calc 100vh - 68px - 28px)

├── LEFT SIDEBAR (140px) — Radar, Helix, Agent Roster

├── CENTER (flex-1) — Workspace + Feed Log (40px)

└── RIGHT SIDEBAR (220px) — Launch, Intent, AI Models, File Cabinet

└── BOTTOM BAR (28px) — Status indicators

## Workspace Routing

// In renderWorkspace() inside Home component:

if (openFile) return <FileWorkspace file={openFile} onClose={...} />;

if (!activePlatform) return <DefaultWorkspace />;

switch (activePlatform) {

case "ns": return <NESTWorkspace />;

case "orc": return <ORCAWorkspace />;

case "os": return <OSINTWorkspace />;

case "q6": return <QE6Workspace />;

case "bn": return <BernardWorkspace />;

case "ae": return <AELabsDashboard />;

case "ig": case "yt": case "tt": case "x": case "li":

return <SocialWorkspace platform={...} />;

default: return <GenericWorkspace platform={...} />;

}

**To add a new workspace:** (1) Create the component function, (2) add a case "id": to the switch, (3) add the platform to PLATFORM\_GROUPS if it's a new tab.

## Adding a New Platform Tab

// In PLATFORM\_GROUPS array, add to the appropriate group:

{ id: "newid", label: "NW", name: "New Platform", color: "#hexcolor" }

// Then in renderWorkspace switch:

case "newid": return <NewPlatformWorkspace />;

// Add the PlatformLogo SVG case:

case "newid":

return <svg width={s} height={s} viewBox="0 0 24 24">...</svg>;

## Workspace Component Template

function MyWorkspace() {

return (

<div className="h-full flex flex-col p-4 font-mono overflow-auto">

{/\* Header \*/}

<div style={{ color: "#00ff88", fontSize: 11, letterSpacing: 4, fontWeight: "bold" }} className="mb-3">

◈ MY MODULE — TITLE

</div>

{/\* KPI row \*/}

<div className="grid grid-cols-3 gap-3 mb-3">

{[{ label: "METRIC", value: "42", color: "#00ff88" }].map((kpi) => (

<div key={kpi.label} className="p-3 rounded text-center"

style={{ border: `1px solid ${kpi.color}44`, background: `${kpi.color}08` }}>

<div style={{ color: kpi.color, fontSize: 22, fontWeight: "bold" }}>{kpi.value}</div>

<div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, letterSpacing: 1 }}>{kpi.label}</div>

</div>

))}

</div>

{/\* Content section \*/}

<div className="flex-1 p-3 rounded overflow-auto"

style={{ border: "1px solid rgba(0,255,136,0.15)", background: "rgba(0,0,0,0.3)" }}>

{/\* content \*/}

</div>

</div>

);

}

## Common Style Patterns

### Panel / Card

<div className="p-3 rounded" style={{

border: "1px solid rgba(0,255,136,0.15)",

background: "rgba(0,0,0,0.3)"

}}>

### Active / Selected Button

<button style={{

background: isActive ? `${color}20` : "rgba(0,0,0,0.3)",

border: `1px solid ${isActive ? color : color + "33"}`,

color: isActive ? color : color + "88",

boxShadow: isActive ? `0 0 8px ${color}44` : "none",

fontSize: 9, letterSpacing: 1, fontWeight: isActive ? "bold" : "normal",

}}>

### Section Label

<div style={{ color: "rgba(0,255,136,0.4)", fontSize: 7, letterSpacing: 3 }} className="mb-1">

SECTION LABEL

</div>

### Input Field

<input className="w-full px-2 py-1 rounded text-xs font-mono" style={{

background: "rgba(0,0,0,0.5)",

border: "1px solid rgba(0,255,136,0.2)",

color: "#00ff88",

outline: "none"

}} />

### Status Badge

<span style={{

color: statusColor,

fontSize: 7, letterSpacing: 1,

padding: "1px 4px",

border: `1px solid ${statusColor}44`,

borderRadius: 2,

background: `${statusColor}12`

}}>

STATUS

</span>

### Divider Line

<div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />

## AE Labs Dashboard — Key Types

type DashItem = {

id: number;

name: string;

status: string;

value?: string;

notes?: string;

};

// Status cycles per tab:

projects: ["PLANNING", "BUILD", "ACTIVE", "DONE"]

clients: ["PROSPECT", "ACTIVE", "PAUSED", "CLOSED"]

prospects: ["DISCOVERY", "QUALIFIED", "OUTREACH", "CLOSED"]

ideas: ["IDEA", "CONCEPT", "BUILD", "SHIPPED"]

// Status → color map:

ACTIVE: "#00ff88"

PLANNING: "#ffbf00"

BUILD: "#00d4ff"

OUTREACH: "#ff6600"

QUALIFIED: "#00ff88"

DISCOVERY: "#ffbf00"

IDEA: "#ff00ff"

CONCEPT: "#00d4ff"

## Feed Log Pattern

// In Home component:

const addLog = (msg: string) => {

const now = new Date().toLocaleTimeString("en-US", { hour12: false });

setFeedLog((l) => [...l.slice(-20), `${now} > ${msg}`]);

};

// Usage anywhere that needs to log:

addLog("MODULE LOADED: BLOOMBERG");

addLog("CLASSIFIED FILE ACCESSED: NEST");

addLog("🚀 MISSION FIRED — Q:E6 ENGINE EXECUTING");

## Framer Motion Patterns

### Workspace transition (already in place)

<AnimatePresence mode="wait">

<motion.div

key={uniqueKey}

initial={{ opacity: 0, y: 10 }}

animate={{ opacity: 1, y: 0 }}

exit={{ opacity: 0, y: -10 }}

transition={{ duration: 0.15 }}

className="h-full"

>

{workspace}

</motion.div>

</AnimatePresence>

### Floating panel (Bernard chat pattern)

<AnimatePresence>

{isOpen && (

<motion.div

initial={{ opacity: 0, y: 20, scale: 0.95 }}

animate={{ opacity: 1, y: 0, scale: 1 }}

exit={{ opacity: 0, y: 20, scale: 0.95 }}

transition={{ duration: 0.2 }}

className="fixed bottom-16 right-4 w-80 rounded font-mono z-50"

style={{ background: "#050a05", border: "1px solid rgba(255,191,0,0.4)" }}

>

### List item stagger

{items.map((item, i) => (

<motion.div

key={item.id}

initial={{ opacity: 0, x: -20 }}

animate={{ opacity: 1, x: 0 }}

transition={{ delay: i \* 0.05, duration: 0.15 }}

>

## localStorage Persistence (Recommended Next Step)

// Custom hook for persisted state:

function useLocalStorage<T>(key: string, initial: T) {

const [value, setValue] = useState<T>(() => {

try {

const stored = localStorage.getItem(key);

return stored ? JSON.parse(stored) : initial;

} catch { return initial; }

});

useEffect(() => {

localStorage.setItem(key, JSON.stringify(value));

}, [key, value]);

return [value, setValue] as const;

}

// Usage in AELabsDashboard:

const [projects, setProjects] = useLocalStorage<DashItem[]>("ae-projects", [...defaultProjects]);

const [clients, setClients] = useLocalStorage<DashItem[]>("ae-clients", [...defaultClients]);

## TypeScript Gotchas

**The getList() helper in AELabsDashboard** returns a union type. When calling ctx.setList(...), always annotate the callback parameter explicitly:

ctx.setList((l: DashItem[]) => l.filter((i: DashItem) => i.id !== id));

// NOT: ctx.setList((l) => l.filter((i) => i.id !== id));

**typeof AE\_FILES[0]** is used as the type for file props. If you add new fields to AE\_FILES entries, the type updates automatically.

**Framer Motion AnimatePresence** requires each child to have a unique key prop. The workspace uses key={openFile?.id || activePlatform || "default"}.

## Platform Color Reference (Quick Lookup)

| Platform | ID | Color |
| --- | --- | --- |
| Claude | cl | #cc785c |
| Manus | mn | #00d4ff |
| Higgsfield | hf | #ff6600 |
| Gemini | ge | #4285f4 |
| Suno | sn | #ff3366 |
| 11 Labs | el | #7c3aed |
| Grammarly | gr | #15c39a |
| ChatGPT | gpt | #10a37f |
| Instagram | ig | #e1306c |
| YouTube | yt | #ff0000 |
| TikTok | tt | #00f2ea |
| X/Twitter | x | #ffffff |
| LinkedIn | li | #0077b5 |
| Gmail | gm | #ea4335 |
| Outlook | ol | #0078d4 |
| Chrome | cr | #fbbc04 |
| Bloomberg | bb | #ff6600 |
| Moody's | md | #cc0000 |
| CoStar | cs | #005eb8 |
| Alpaca | alp | #ffcc00 |
| LEV | lev | #00ff88 |
| O-SINT | os | #ff00ff |
| Expedia | ex | #00355f |
| Super.com | sp | #ff6b35 |
| GitHub | gh | #ffffff |
| ORCA | orc | #00d4ff |
| NEST | ns | #00ff88 |
| BERNARD | bn | #ffbf00 |
| Q:E6 | q6 | #ff3366 |
| AE Labs | ae | #00ff88 |