Payload Orchestration Platform — Design

Specification & Claude Code Build

Reference

Version: 6.0 (Current Build) Product: Payload Orchestration Platform / Payload Situation

Room  Owner:  AE  Labs  (Ardan  Edge)  Document  Purpose:  Full  handoff  reference  for

Claude Code — covers design system, architecture, component inventory, data structures,

interaction model, and next-build priorities.

1. Product Identity

The  Payload  Orchestration  Platform  is  a  military  Command  &  Control  (C2)  front-end

interface  —  a  war  room  /  situation  room  UI  that  orchestrates  AI  tools,  social  media

platforms,  finance  data,  and  business  operations  through  a  single  cinematic  workspace.

The aesthetic fuses 1960s industrial steel furniture with 2026 AI command technology,

rendered as a phosphor terminal on near-black.

The  platform  is  not  a  generic  SaaS  dashboard.  Every  visual  and  interaction  decision

must  reinforce  the  feeling  of  a  high-stakes  command  center.  The  user  is  a  CEO-level

operator issuing directives, not a consumer clicking through menus.

2. Design System

2.1 Color Palette

Token

Hex

Usage

Background (primary)

#030805

Main app background — near-black with

faint green tint

Background

(secondary)

#0a0a0a

CSS variable  --background

Phosphor Green

#00ff88

Primary accent, active states, headings

Phosphor Green (CSS

var)

Amber

Cyan

Red

#00ff41

Tailwind token  --color-payload-green

#ffbf00

#00d4ff

#ff3366

Bernard OSD, warnings, secondary accent

Data feeds, Manus, informational states

Launch control, classified, destructive

Red (CSS var)

#ff3333

Tailwind token  --color-payload-red

Magenta

Orange

Yellow

#ff00ff

#ff6600

#ffff00

INTEL group, O-SINT, ideas

Higgsfield, social group, outreach

Finance group label

White (dimmed)

rgba(255,255,255,0.7)

Body text on dark backgrounds

White (ghost)

rgba(255,255,255,0.3)

Labels, metadata, secondary text

Color philosophy: Each platform group and system module owns a color. Active/selected

states  use  the  platform’s  own  color  at  full  opacity;  inactive  states  use  the  same  color  at

~20–33% opacity ( color + "33"  or  color + "44"  hex suffix). Borders follow the same

rule. Glow shadows use  color + "44"  at 8px blur.

2.2 Typography

Font: IBM Plex Mono — loaded via Google Fonts CDN in  client/index.html .

<link href="https://fonts.googleapis.com/css2?

family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

All  text  is  monospace  throughout.  No  serif  or  sans-serif  fonts  are  used  anywhere.  The

body element sets  font-family: 'IBM Plex Mono', monospace  globally.

Type scale (approximate, all in  px  via inline styles):

Role

Size

Letter-spacing

Weight

Section headers

14px

4px

Sub-headers / labels

9–11px

2–4px

Body / list items

9–10px

1px

Metadata / timestamps

7–8px

1–2px

Micro-labels

6–7px

2–3px

2.3 Spacing & Radius

bold

bold

normal

normal

normal

Border  radius  is  kept  minimal  —  2px   to  6px   —  to  reinforce  the  industrial  aesthetic.

Rounded corners are used sparingly. The CSS variable  --radius: 4px  is the default.

Padding follows a tight grid:  p-2  (8px),  p-3  (12px),  p-4  (16px). Gaps between elements

are  gap-1  (4px) to  gap-3  (12px).

2.4 Cinematic Effects

All cinematic effects are implemented as CSS overlays with  pointer-events: none  and

high  z-index  values so they sit above all content without blocking interaction.

Film  grain  —  implemented  twice:  once  in  index.css   as  a  body::before   pseudo-

element  (z-index  9998,  opacity  0.3,  animated  via  @keyframes  grain   at  8s  steps),  and

once  as  an  inline  div   in  Home.tsx   (z-index  50,  opacity  0.4)  using  an  SVG

feTurbulence  filter encoded as a data URI.

Vignette  —  body::after   in  index.css   (z-index  9997)  and  a  second  inline  div   in

Home.tsx   (z-index  40):  radial-gradient(ellipse  at  center,  transparent  50%,

rgba(0,0,0,0.7) 100%) .

CRT  scanlines  —  available  as  .scanlines   utility  class  in  index.css .  Applies  a

::after   pseudo-element  with  repeating-linear-gradient   of  1px  dark  bands  every

2px.

Glow animations:

@keyframes glow-pulse  — phosphor green drop-shadow oscillating 8px → 16px,

2s ease-in-out infinite

@keyframes red-pulse  — red drop-shadow oscillating 8px → 20px, 1.5s ease-in-

out infinite

@keyframes bulb-glow  — amber drop-shadow oscillating 12px → 24px, 3s ease-

in-out infinite

@keyframes key-rotate  — 0° → 90° rotation, 0.6s ease-out forwards (used for

launch key)

2.5 Animation Library

Framer Motion ( framer-motion ) is used for all component-level transitions:

Workspace transitions:  AnimatePresence mode="wait"  wraps the center

workspace. Each workspace animates  opacity: 0, y: 10  →  opacity: 1, y: 0

on enter and  opacity: 0, y: -10  on exit,  duration: 0.15 .

Bernard chat panel:  initial={{ opacity: 0, y: 20, scale: 0.95 }}  →

animate={{ opacity: 1, y: 0, scale: 1 }} ,  duration: 0.2 .

Mission brief overlay: Full-screen  opacity: 0  →  opacity: 1 . Contains a child

red screen-flash div that animates  opacity: 1  →  opacity: 0  in 0.3s. Mission

steps animate in one by one with  initial={{ opacity: 0, x: -20 }} .

3. Layout Architecture

The application is a single fixed-position screen ( fixed inset-0 overflow-hidden ).

There is no scrolling at the page level. The layout is divided into five zones:

┌─────────────────────────────────────────────────────────────────┐

│  TOP BAR (32px)  — Logo, status indicators, CHAT button         │

├─────────────────────────────────────────────────────────────────┤

│  PLATFORM TABS (36px)  — Grouped tabs across full width         │

├──────────────┬──────────────────────────────┬───────────────────┤

│              │                              │                   │

│  LEFT        │   CENTER WORKSPACE           │  RIGHT            │

│  SIDEBAR     │   (flex-1)                   │  SIDEBAR          │

│  (140px)     │                              │  (220px)          │

│              │                              │                   │

│              ├──────────────────────────────┤                   │

│              │  FEED LOG (40px)             │                   │

└──────────────┴──────────────────────────────┴───────────────────┘

│  BOTTOM STATUS BAR (28px)                                        │

└─────────────────────────────────────────────────────────────────┘

The  main  content  area  height  is  calc(100vh  -  68px  -  28px)   (subtracting  top  bar  +

tabs + bottom bar).

3.1 Top Bar

Height: 32px. Background:  rgba(0,0,0,0.6) , bottom border  rgba(0,255,136,0.15) .

Contains:  PAYLOAD  wordmark,  version  string,  three  status  indicators  (CONNECTED  /

Q:E6 READY / BERNARD ONLINE), and the CHAT toggle button (amber, opens Bernard

floating chat panel).

3.2 Platform Tabs

Height: 36px. Background:  rgba(0,0,0,0.4) , bottom border  rgba(0,255,136,0.1) .

Five platform groups render horizontally with a 1px vertical divider between groups. Each

group shows its label (7px, 60% opacity) followed by its platform buttons. Active tab shows
full color, glow shadow, and a  ⚡  indicator. Inactive tabs show color at 33% opacity.

3.3 Left Sidebar

Width: 140px. Background:  rgba(0,0,0,0.3) , right border  rgba(0,255,136,0.1) .

Contains (top to bottom):

1. INTELLIGENCE label

2. Search input (non-functional placeholder)

3. Ecosystem Radar — animated canvas with rotating sweep and colored blips

4. Helix Architecture — three-layer visualization (HIGH/MID/LOW) with color-coded

chip badges

5. Agent Roster — six agents (ALPHA–FOXTROT) with role and live status badge

6. Strategic Operations / AE LABS COMMAND label block

7. SAFE indicator dot

3.4 Center Workspace

Flex-1, background  #030805 . Contains:

Plug indicator bar (shown when a platform is active): “⚡ PLUGGED IN:
[PLATFORM NAME] ● LINKED”

Classified file bar (shown when a file is open): shows file name and TOP SECRET

badge

Workspace area — animated with  AnimatePresence , renders the active

workspace component

Feed Log — 40px strip at bottom, shows last 3 log entries with timestamps

3.5 Right Sidebar

Width: 220px. Background:  rgba(0,0,0,0.4) , left border  rgba(0,255,136,0.1) .

Contains (top to bottom):

1. CinematicLaunch — key turn + cover lift + FIRE button

2. Mission Intent — textarea for free-text objective

3. AI Models — 2-column grid of multi-select AI model buttons

4. AE Labs Universe File Cabinet — 9 classified files, clickable to open

FileWorkspace

3.6 Bottom Status Bar

Height: 28px. Contains: connection status, Q:E6 version, agent count, file count, AI active

count, copyright.

4. Platform Data

4.1 Platform Groups

const PLATFORM_GROUPS = [

  { label: "AI", color: "#00ff88", platforms: [

    { id: "cl",  label: "CL",  name: "Claude",    color: "#cc785c" },

    { id: "mn",  label: "MN",  name: "Manus",     color: "#00d4ff" },

    { id: "hf",  label: "HF",  name: "Higgsfield",color: "#ff6600" },

    { id: "ge",  label: "GE",  name: "Gemini",    color: "#4285f4" },

    { id: "sn",  label: "SN",  name: "Suno",      color: "#ff3366" },

    { id: "el",  label: "EL",  name: "11 Labs",   color: "#7c3aed" },

    { id: "gr",  label: "GR",  name: "Grammarly", color: "#15c39a" },

    { id: "gpt", label: "GPT", name: "ChatGPT",   color: "#10a37f" },

  ]},

  { label: "SOCIAL", color: "#ff6600", platforms: [

    { id: "ig", label: "IG", name: "Instagram", color: "#e1306c" },

    { id: "yt", label: "YT", name: "YouTube",   color: "#ff0000" },

    { id: "tt", label: "TT", name: "TikTok",    color: "#00f2ea" },

    { id: "x",  label: "X",  name: "X/Twitter", color: "#ffffff" },

    { id: "li", label: "LI", name: "LinkedIn",  color: "#0077b5" },

  ]},

  { label: "COMMS", color: "#00d4ff", platforms: [

    { id: "gm", label: "GM", name: "Gmail",   color: "#ea4335" },

    { id: "ol", label: "OL", name: "Outlook", color: "#0078d4" },

    { id: "cr", label: "CR", name: "Chrome",  color: "#fbbc04" },

  ]},

  { label: "FINANCE", color: "#ffff00", platforms: [

    { id: "bb",  label: "BB",  name: "Bloomberg", color: "#ff6600" },

    { id: "md",  label: "MD",  name: "Moody's",   color: "#cc0000" },

    { id: "cs",  label: "CS",  name: "CoStar",    color: "#005eb8" },

    { id: "alp", label: "ALP", name: "Alpaca",    color: "#ffcc00" },

    { id: "lev", label: "LEV", name: "LEV",       color: "#00ff88" },

  ]},

  { label: "INTEL", color: "#ff00ff", platforms: [

    { id: "os",  label: "OS",  name: "O-SINT",   color: "#ff00ff" },

    { id: "ex",  label: "EX",  name: "Expedia",  color: "#00355f" },

    { id: "sp",  label: "SP",  name: "Super.com",color: "#ff6b35" },

    { id: "gh",  label: "GH",  name: "GitHub",   color: "#ffffff" },

    { id: "orc", label: "ORC", name: "ORCA",     color: "#00d4ff" },

    { id: "ns",  label: "NS",  name: "NEST",     color: "#00ff88" },

    { id: "bn",  label: "BN",  name: "BERNARD",  color: "#ffbf00" },

    { id: "q6",  label: "Q6",  name: "Q:E6",     color: "#ff3366" },

    { id: "ae",  label: "AE",  name: "AE Labs",  color: "#00ff88" },

  ]},

];

4.2 AI Models (Multi-Select Panel)

const AI_MODELS = [

  { id: "claude",     name: "Claude",    color: "#cc785c", symbol: "CL"  },

  { id: "manus",      name: "Manus",     color: "#00d4ff", symbol: "MN"  },

  { id: "higgsfield", name: "Higgsfield",color: "#ff6600", symbol: "HF"  },

  { id: "gemini",     name: "Gemini",    color: "#4285f4", symbol: "GE"  },

  { id: "suno",       name: "Suno",      color: "#ff3366", symbol: "SN"  },

  { id: "elevenlabs", name: "11 Labs",   color: "#7c3aed", symbol: "EL"  },

  { id: "grammarly",  name: "Grammarly", color: "#15c39a", symbol: "GR"  },

  { id: "chatgpt",    name: "ChatGPT",   color: "#10a37f", symbol: "GPT" },

];

4.3 AE Labs Universe Files

const AE_FILES = [

  { id: "mmy",   name: "MISS ME YET",  classified: true,  color: "#ff3366"

},

  { id: "ae",    name: "AE LABS",      classified: true,  color: "#00ff88"

},

  { id: "nest",  name: "NEST",         classified: false, color: "#00d4ff"

},

  { id: "clanos",name: "CLANOS",       classified: true,  color: "#ff6600"

},

  { id: "hf",    name: "HIGGSFIELD",   classified: false, color: "#ffbf00"

},

  { id: "manus", name: "MANUS",        classified: false, color: "#00d4ff"

},

  { id: "spec",  name: "SPEC?",        classified: true,  color: "#ff00ff"

},

  { id: "osp",   name: "OS PROJECT?",  classified: true,  color: "#ff3366"

},

  { id: "pipe",  name: "PIPELINE TOOL",classified: true,  color: "#00ff88"

},

];

4.4 NEST Agents

const AGENTS = [

  { id: "alpha",   name: "ALPHA",   role: "Content", status: "ACTIVE",

color: "#00ff88" },

  { id: "bravo",   name: "BRAVO",   role: "Data",    status: "ACTIVE",

color: "#00ff88" },

  { id: "charlie", name: "CHARLIE", role: "Scout",   status: "IDLE",

color: "#ffbf00" },

  { id: "delta",   name: "DELTA",   role: "Engage",  status: "DEPLOYED",

color: "#ff3366" },

  { id: "echo",    name: "ECHO",    role: "Research",status: "ACTIVE",

color: "#00ff88" },

  { id: "foxtrot", name: "FOXTROT", role: "Comply",  status: "IDLE",

color: "#ffbf00" },

];

5. Component Inventory

All  components  live  inline  in  client/src/pages/Home.tsx .  The  file  is  ~1,550  lines.

Below is the full component registry.

5.1 Utility Components

PlatformLogo({  id,  size  })   —  SVG  renderer.  Takes  a  platform  id   string  and

renders the brand’s SVG logo at the given size. Covers:  ig ,  yt ,  tt ,  x ,  li ,  gm ,  ol ,

cr ,  bb ,  md ,  cs ,  alp ,  gh ,  cl ,  mn ,  hf ,  ge ,  sn ,  el ,  gr ,  gpt ,  orc ,  ns ,  bn ,  q6 ,

ae ,  os ,  ex ,  sp ,  lev . Falls back to a generic colored circle with the platform’s initial.

EcosystemRadar()  — Canvas-based radar with rotating sweep line and 7 animated blips

representing: PPL (People, cyan), PROP (Property, yellow), SOC (Social, magenta), DEAL

(Deals,

red),  PROC

(Process,  green).  Uses

useRef   +

useEffect   with

requestAnimationFrame . Canvas is 120×120px.

5.2 Workspace Components

Each workspace fills the center panel ( h-full ) and is swapped via  AnimatePresence .

Component

Tab ID

Color

Description

NESTWorkspace

ns

#00ff88

6 agent cards with status, role, and

deploy controls

C-Suite KPI dashboard (6 metrics: Active

ORCAWorkspace

orc

#00d4ff

Deals, Pipeline, Team Status, Ecosystem

OSINTWorkspace

os

#ff00ff

Property, Social, Deals, Process) with

Health, Revenue, Burn Rate)

Ecosystem entity tracker (People,

QE6Workspace

q6

#ff3366

entity counts and scan controls

Football play-calling UI with 4 formations

(EMAIL BLITZ, SOCIAL SWEEP, VIDEO

BLITZ, FULL ECOSYSTEM), parameter

inputs, and execution

CEO command center with scrollable

BernardWorkspace

bn

#ffbf00

history log, 8 preset commands, free-text

AELabsDashboard

ae

#00ff88

SocialWorkspace

ig/yt/tt/x/li

GenericWorkspace

all others

platform

color

platform

color

FileWorkspace

(file open)

file color

DefaultWorkspace

(none selected)

#00ff88

input, scheduled task queue

Business intelligence dashboard (see

Section 6)

Follower KPIs + content queue template

“PLUGGED IN” card + 4 action buttons

(CONFIGURE, DEPLOY, MONITOR,

ANALYZE)

Editable notes textarea + drag-drop zone

+ file metadata panel

Module selector grid (Q:E6, BERNARD,

O-SINT, ORCA) + welcome prompt

5.3 System Components

CinematicLaunch({ onFire })  — Three-stage launch sequence:

1. Key turn — circular button with SVG key icon, rotates 90° on click, toggles

keyTurned  state, shows ARMED/SAFE indicator

2. Cover lift — button labeled “▼ COVER” / “▲ COVER”, toggles  coverOpen  state

3. FIRE button — large red button, only active when  keyTurned && coverOpen ,

triggers  onFire()  callback, sets  firing  state for 3s

BernardChat({  isOpen,  onToggle  })   —  Floating  chat  panel  (fixed,  bottom-right,

320×380px).  Amber  color  scheme.  Renders  user  messages  right-aligned  and  Bernard

responses  left-aligned.  Bernard  responses  are  randomly  selected  from  8  pre-written

strings. Animated in/out with Framer Motion.

MissionBriefOverlay({ brief, onClose })  — Full-screen fixed overlay triggered by

FIRE button. Shows a red screen flash on mount. Renders 10 mission steps one by one at

400ms  intervals  (typewriter  effect).  Shows  “MISSION  DEPLOYED”  confirmation  and

ACKNOWLEDGE button when complete.

6. AE Labs Business Dashboard

The  AELabsDashboard  component is the business intelligence workspace for AE Labs. It

is  the  most  feature-complete  workspace  and  serves  as  the  user’s  actual  business

management tool.

6.1 State Structure

type DashItem = {

  id: number;

  name: string;

  status: string;

  value?: string;   // Revenue/deal value

  notes?: string;   // Short description

};

// Four independent lists:

const [projects, setProjects]   = useState<DashItem[]>([...]);

const [clients, setClients]     = useState<DashItem[]>([...]);

const [prospects, setProspects] = useState<DashItem[]>([...]);

const [ideas, setIdeas]         = useState<DashItem[]>([...]);

6.2 Sub-Tabs

Tab

Color

Status Cycle

METRICS

#00ff88

(read-only view)

PROJECTS

#00d4ff

PLANNING → BUILD → ACTIVE → DONE

CLIENTS

#ffbf00

PROSPECT → ACTIVE → PAUSED → CLOSED

PROSPECTS

#ff6600

DISCOVERY → QUALIFIED → OUTREACH → CLOSED

IDEAS

#ff00ff

IDEA → CONCEPT → BUILD → SHIPPED

6.3 Status Color Map

const statusColor: Record<string, string> = {

  ACTIVE: "#00ff88", PLANNING: "#ffbf00", BUILD: "#00d4ff",

  OUTREACH: "#ff6600", QUALIFIED: "#00ff88", DISCOVERY: "#ffbf00",

  IDEA: "#ff00ff", CONCEPT: "#00d4ff",

};

6.4 Interactions

Add item: Type in input field + press Enter, or click  + ADD  button. New items default

to the tab’s initial status.

Cycle status: Click the colored status badge to advance through the status cycle.

Inline edit name: Click the item name text to enter edit mode (input replaces span).

Confirm with Enter or blur.

Delete: Hover a row to reveal the  ✕  button (opacity-0 → opacity-100 on group

hover).

6.5 Metrics View

The METRICS tab shows:

4 KPI header cards (REVENUE  $740K , PIPELINE  $730K , CLIENTS count,

PROSPECTS count) — currently static except for the counts

4 summary panels (Active Projects, Top Clients, Hot Prospects, Pipeline Ideas) —

derived from live list state

Deal Pipeline Flow bar — counts prospects by status stage (DISCOVERY →

QUALIFIED → OUTREACH → CLOSED)

6.6 Pre-Populated Seed Data

Projects:  PAYLOAD  PLATFORM  (ACTIVE),  CLANOS  (ACTIVE),  NEST  (ACTIVE),  MISS

ME YET (PLANNING), PIPELINE TOOL (BUILD)

Clients: ABC  Inc.  (

240K, ACT IV E), XY ZCorp(

180K, ACTIVE), Ardan  Edge  ($320K,

ACTIVE)

Prospects:  Mike  —  New  Deal

(

150K, OU TREACH), RealEstateF und(

500K,

QUALIFIED), Tech Startup ($80K, DISCOVERY)

Ideas: Bitmoji Campaign, Higgsfield Video Series, ORCA Mobile App

7. Q:E6 Engine

The Q:E6 Engine is the “football play-calling” intelligence layer. It maps the user’s intent to

a multi-platform execution sequence.

Current implementation ( QE6Workspace ):

4 formation cards: EMAIL BLITZ, SOCIAL SWEEP, VIDEO BLITZ, FULL

ECOSYSTEM

Each formation has a description, platform list, and AI model assignment

Clicking a formation selects it (highlighted border)

Parameter inputs: Campaign Name, Target Audience, Budget, Timeline

EXECUTE PLAY button logs the play to the feed

FIRE button integration ( handleFire  in Home): When the FIRE button is triggered (key

turned  +  cover  open  +  button  pressed),  it  generates  a  10-step  MissionBriefOverlay

using the active platform, selected AI models, and mission intent text.

8. Bernard OSD

Bernard is the CEO-level orchestration layer — a natural language command interface that

routes instructions to the appropriate platforms and AI models.

Bernard Workspace ( BernardWorkspace ):

Scrollable command history log with timestamps and status codes (SYS / CMD /

EXEC)

8 preset command buttons (2-column grid)

Free-text input (Enter to execute)

Scheduled task queue (right panel, 3 pre-populated tasks)

Bernard Chat Panel ( BernardChat ):

Floating panel, bottom-right, toggled by CHAT button in top bar

Conversational UI with user messages (right, amber) and Bernard responses (left,

cyan)

8 pre-written response strings, randomly selected

Preset commands and their responses:

Command

Response

SEND EMAIL TO MIKE ON NEW

DEAL

Drafting email to Mike via Outlook…

DRAFT CREDIT MEMO FOR ABC

Initiating credit memo template for ABC Inc. Claude

INC

engaged…

RUN BITMOJI FOR 5 NEW USERS

Bitmoji workflow initiated for 5 new users…

RELEASE PAYMENT

Payment release requires 2FA confirmation…

MAKE DINNER RESERVATIONS AT

78

Searching availability at 78. Connecting to OpenTable…

GENERATE VIDEO FOR

Higgsfield engaged. Generating campaign video. ETA: 2

CAMPAIGN

minutes.

BOOK FLIGHT TO NYC

Searching flights via Expedia API…

FIND HOTEL IN MIAMI

Querying Super.com for Miami hotels…

9. Tech Stack

Layer

Technology

Version

Framework

Build tool

Language

Styling

Animation

Routing

React

Vite

TypeScript

Tailwind CSS

Framer Motion

Wouter

UI primitives

shadcn/ui (Radix)

Icons

Charts

Toast

Package manager

Lucide React

Recharts

Sonner

pnpm

19.x

7.x

5.6.3

4.x

latest

3.7.x

latest

latest

latest

latest

latest

Font

IBM Plex Mono

Google Fonts CDN

Key constraints:

Static frontend only — no backend, no database, no API calls

All state is in-memory React state (resets on page refresh)

Single route ( / ) renders  Home.tsx

Dark theme is hard-locked ( defaultTheme="dark" , non-switchable)

All components are inline in  Home.tsx  — no separate component files are used for

the main UI

10. File Structure

payload-frontend/

├── client/

│   ├── index.html                    ← IBM Plex Mono font, title "Payload -

Situation Room"

│   └── src/

│       ├── App.tsx                   ← ThemeProvider (dark, locked),

Router, TooltipProvider, Toaster

│       ├── index.css                 ← Design tokens, animations, cinematic

effects

│       ├── main.tsx                  ← React entry point

│       └── pages/

│           └── Home.tsx              ← ENTIRE APPLICATION (~1,550 lines)

│               ├── PLATFORM_GROUPS   ← All 30 platform definitions

│               ├── AI_MODELS         ← 8 AI model definitions

│               ├── AE_FILES          ← 9 classified file definitions

│               ├── AGENTS            ← 6 NEST agent definitions

│               ├── PlatformLogo      ← SVG renderer

│               ├── EcosystemRadar    ← Canvas radar component

│               ├── NESTWorkspace     ← Agent deployment workspace

│               ├── ORCAWorkspace     ← C-Suite KPI workspace

│               ├── OSINTWorkspace    ← Ecosystem tracker workspace

│               ├── QE6Workspace      ← Play-calling workspace

│               ├── BernardWorkspace  ← CEO command workspace

│               ├── AELabsDashboard   ← Business intelligence workspace

│               ├── FileWorkspace     ← Classified file viewer/editor

│               ├── SocialWorkspace   ← Social platform template

│               ├── GenericWorkspace  ← Default platform template

│               ├── DefaultWorkspace  ← No-selection landing state

│               ├── CinematicLaunch   ← Key + cover + FIRE button

│               ├── BernardChat       ← Floating chat panel

│               ├── MissionBriefOverlay ← Full-screen mission brief

│               └── Home              ← Root component, all state, layout

11. State Management (Home Component)

// Active platform tab

const [activePlatform, setActivePlatform] = useState<string | null>(null);

// Multi-selected AI models (default: ["claude"])

const [selectedAIs, setSelectedAIs] = useState<string[]>(["claude"]);

// Open classified file (mutually exclusive with activePlatform)

const [openFile, setOpenFile] = useState<typeof AE_FILES[0] | null>(null);

// Mission brief overlay data (null = hidden)

const [missionBrief, setMissionBrief] = useState<{

  steps: string[];

  platform: string;

  ai: string[];

} | null>(null);

// Bernard chat panel open state

const [bernardChatOpen, setBernardChatOpen] = useState(false);

// Feed log (last 20 entries, auto-trimmed)

const [feedLog, setFeedLog] = useState<string[]>([...]);

// Mission intent textarea

const [intent, setIntent] = useState("");

Key logic:

handlePlatformClick(id)  — sets  activePlatform , clears  openFile , logs to

feed

handleFileOpen(file)  — sets  openFile , clears  activePlatform , logs to feed

handleFire()  — builds 10-step mission brief from active platform + selected AIs +

intent, sets  missionBrief

renderWorkspace()  — switch on  activePlatform  to return the correct

workspace component;  openFile  takes priority

12. Interaction Model

12.1 Platform Selection

Clicking any tab in the platform tab bar calls  handlePlatformClick(id) . The workspace

animates  out  (opacity  0,  y  -10)  and  the  new  workspace  animates  in  (opacity  0,  y  10  →

opacity 1, y 0). The plug indicator bar appears above the workspace showing the platform

name and “● LINKED” status.

12.2 File Cabinet

Clicking a file in the AE Labs Universe cabinet calls  handleFileOpen(file) . This clears

the  active  platform  and  renders  FileWorkspace   in  the  center.  The  classified  file  bar

appears  showing

the

file  name  and  TOP  SECRET  badge  (if  applicable).  The

FileWorkspace   shows  an  editable  textarea  for  notes,  a  drag-drop  zone,  and  file

metadata.

12.3 Launch Sequence

The launch sequence is three-step and sequential:

1. Click the key button → rotates 90°, shows ARMED indicator

2. Click LIFT COVER → cover opens, FIRE button becomes active

3. Click FIRE → triggers  handleFire() , generates mission brief, shows

MissionBriefOverlay

The FIRE button is visually disabled (lower opacity, no glow) until both key is turned AND

cover is open.

12.4 AI Model Multi-Select

Clicking  any  AI  model  button  in  the  right  sidebar  toggles  it  in  the  selectedAIs   array.

Multiple models can be active simultaneously. Active models show full color, glow border,

and  a  ●   indicator.  The  selected  models  are  used  in  the  mission  brief  when  FIRE  is

triggered.

13. Next Build Priorities

The following features are partially implemented or pending, in priority order:

Priority 1 — AE Labs Dashboard Persistence

Currently  all  dashboard  data  (projects,  clients,  prospects,  ideas)  resets  on  page  refresh.

Implement

localStorage   persistence

for  all

four

lists.  Use  a  custom

useLocalStorage  hook or  useEffect  with  JSON.stringify/parse .

Priority 2 — AE Labs Revenue Auto-Calculation

The METRICS view shows static  $740K  revenue and  $730K  pipeline. Wire these to live

data:  revenue  =  sum  of  all  ACTIVE  client  values;  pipeline  =  sum  of  all  QUALIFIED  +

OUTREACH prospect values.

Priority 3 — Bernard ↔ AE Labs Integration

When a Bernard command references a client or prospect (e.g., “DRAFT CREDIT MEMO

FOR  ABC  INC”),  auto-update  the  AE  Labs  dashboard  —  flag  the  client  as  recently

touched, add a note, or create a new task entry. This requires lifting AE Labs state up to

the Home component and passing setters down.

Priority 4 — Notes/Detail Drawer

Each  item  in  the  AE  Labs  dashboard  (project,  client,  prospect,  idea)  should  have  an

expandable  detail  panel  showing:  full  notes  field,  contact  info,  linked  files,  activity  log,

and next action. Currently only a short  notes  string is stored.

Priority 5 — Q:E6 Full Play Execution

The  Q:E6  formations  currently  only  log  to  the  feed.  Build  out  full  play  execution:  each

formation should show a step-by-step execution plan (similar to the mission brief overlay),

with  platform-specific  actions  (e.g.,  EMAIL  BLITZ  →  draft  email  via  Claude  →  send  via

Gmail → log to ORCA).

Priority 6 — ORCA C-Suite Live Data

The  ORCA  workspace  shows  static  KPI  values.  Wire  to AE  Labs  state: Active  Deals  =

QUALIFIED + OUTREACH prospects; Pipeline = sum of prospect values; Team Status =

active agent count / total agents.

Priority 7 — Platform Workspaces Depth

Most  platforms  use  GenericWorkspace   (a  placeholder).  Build  unique  workspaces  for:

Bloomberg  (market  data  widget),  GitHub  (repo  list),  Gmail/Outlook  (email  compose),

Higgsfield (video generation prompt), Alpaca (portfolio tracker).

Priority 8 — Keyboard Shortcuts

Add a command palette ( Cmd+K ) that lets the user switch platforms, open files, or trigger

Bernard  commands  without  using  the  mouse.  This  fits  the  C2  aesthetic  and  improves

operator efficiency.

14. Known Constraints & Gotchas

Single-file  architecture:  All  components  are  in  Home.tsx .  This  is  intentional  for  the

current  build  phase.  When  splitting  into  separate  files,  be  careful  about  the  shared  data

constants  ( PLATFORM_GROUPS ,  AE_FILES ,  AGENTS ,  AI_MODELS )  —  move  them  to  a

lib/data.ts  file first.

TypeScript  setList   typing:  The  AELabsDashboard   uses  a  getList()   helper  that

returns

{

list,

setList

} .  The

setList

function

is

typed

as

React.Dispatch<React.SetStateAction<DashItem[]>> .  When  passing  these  through

the helper, explicit  DashItem[]  type annotations are required on the callback parameter

to avoid TypeScript inference errors.

Canvas cleanup: The  EcosystemRadar  uses  requestAnimationFrame  with a ref-based

animation loop. The  useEffect  cleanup function cancels the animation frame to prevent

memory leaks on unmount.

Z-index  layers:  Film  grain  (z-50  inline),  vignette  (z-40  inline),  body::before  grain  (z-9998

CSS), body::after vignette (z-9997 CSS), Bernard chat (z-50), Mission brief overlay (z-50).

The inline film grain and vignette in Home.tsx are redundant with the CSS versions — the

CSS versions can be removed if the inline ones are present.

No  scroll: The  entire  application  is  overflow-hidden   at  the  root.  Individual  panels  use

overflow-auto  internally. If content overflows a panel, it scrolls within that panel, not the

page.

Framer  Motion  AnimatePresence  mode="wait" :  The  workspace  switcher  uses

mode="wait"  which means the exit animation must complete before the enter animation

starts.  The  current  duration  is  0.15s  which  keeps  it  snappy.  Do  not  increase  this

significantly or the tab-switching will feel sluggish.

15. Design Principles (For All Future Work)

Every addition to this platform must pass these four tests:

1. Does it look like a war room, not a dashboard? If it has rounded cards, gradients,

or Inter font, it’s wrong.

2. Is every color purposeful? Each color maps to a system (green = active/safe,

amber = Bernard/warning, cyan = data/info, red = launch/classified, magenta =

intel/ideas). Don’t add new colors without assigning them to a system.

3. Is the typography IBM Plex Mono at the right size? Labels are 7–8px with letter-

spacing. Headers are 11–14px with letter-spacing 4. Nothing is large or decorative.

4. Does the interaction feel physical? The key turns. The cover lifts. The button fires.

Every action should feel like operating hardware, not clicking software.

