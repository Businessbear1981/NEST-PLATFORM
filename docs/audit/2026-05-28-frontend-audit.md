# NEST V4 Frontend Audit — 2026-05-28

**Scope:** `frontend-v2/src/` running on `http://localhost:8101/`
**Method:** read every major page and component head-to-tail, flag anything off-brand, off-voice, or dead UX.

Format per item: `file:line — [category]: quote/desc. Severity: H/M/L. Action.`

Categories: `[copy]` placeholder / SaaS language · `[name]` mismatched desk/section name · `[voice]` banking-domain or Jimmy-Lee voice violation · `[ux]` dead button/modal/empty state · `[demo]` fake data presented as real · `[style]` off-brand color/font · `[orphan]` dead route / broken link.

---

## Executive summary — five worst patterns

1. **Bernard is still in the old "bruv/mate/muppet" Jax Teller voice.** `BernardConcierge.tsx` is mounted globally; its system prompt and error fallbacks tell the model to be "a bit rude," call the user "bruv," and refer to Sean as "the gaffer." Per the 2026-05-21 memory the tone was explicitly changed to professional institutional. Investors talking to Bernard today get a Cockney geezer. Highest-severity finding (`frontend-v2/src/components/BernardConcierge.tsx:45, 85-94, 96-97, 250-273`).

2. **Demo data is everywhere and reuses the same fake people across roles.** "Sarah Chen" is simultaneously a NEST employee (AdminPlatform), a Moody's analyst (CounterpartySandbox), a deposit approver (depositDemo), and a doc uploader (rootsDemo). "Apex Capital Partners" is a PE sponsor placeholder, a surety carrier, a KYC entity, and a deposit deal name. At least 14 pages render hardcoded mock numbers as if live (TreasuryPage's $850K Moody's fee, ConstructionPage's $12.5M milestone, DealPulseTicker's `Fed Funds 5.33%`, RiskCommandCenter's `Math.random()` widths, HawkeyePlacementScout's named institutional allocations).

3. **Desk names are not Bible-aligned and shift page-to-page.** Sidebar uses `Enhancement / Rating Submission / Credit & Rating / Risk / Sentinel / AI Tools / HFT Fund / Doc Upload`. Page titles, route names, and component names disagree (sidebar `Enhancement` → route `/surety` → component `InsuranceSuretyPage`; sidebar `Doc Upload` → `/upload` vs a separate `/roots`). Eleven different stage labels appear across DealInputPage's chip strip, DealsPage's pipeline list, and the success modal. A banker reading the platform cannot map menu items to desks consistently.

4. **Off-brand palette leaks (purple / violet / orange / cyan dominance, default gray, white 404).** EMMAPage uses purple hero + purple buttons; SurveillancePage uses violet; ConstructionPage uses orange. Multiple pages default to `bg-slate-700` / `text-slate-400` rather than NEST forest/sage tokens. `NotFound.tsx` renders a white card with a blue "Go Home" button — entirely off brand. Cyan dominates over the spec's gold accent across DealPulseTicker, EagleEyeV2 chrome, NightVision, and the Operations workbench.

5. **"Coming soon" stubs and meta-language in production copy.** Explicit `"Coming soon"` strings in TrusteePage (fees + performance), plus disguised coming-soons in EMMAPage Comps tab and Surveillance Re-rating tab. Meta-language that breaks the fourth wall — `"$173M demo"`, `"working demo console"`, `"working control plane"`, `"frontend-demo simulated"`, `"The dashboard proves the redesign is not deleting systems"`, `"A precise black interface with cyan, gold, red, green, and fuchsia signal color..."`. Combined with engineering metaphors (`"power strip"`, `"Central Nervous System"`, `"FBI/DOJ-standard analysis"`, project codename `"Life Star Pointe Loop"` in a button label), the platform currently reads like a half-shipped product describing itself rather than an institutional bond bank.

---

## 1. App shell, sidebar & routing

### `frontend-v2/src/components/AppShell.tsx`

- **`AppShell.tsx:13`** — [name]: EagleEye in ORIGINATION routes to `/eagleeye-v2`, but `App.tsx:74-75` also routes `/eagleeye` to a *different* `EagleEyeScoutDashboard`. Two EagleEye products, one hidden by URL. Severity: H.
- **`AppShell.tsx:15`** — [name]: `"New Deal"` (sidebar) vs `"New Deal Intake"` (page title) vs `DealInputPage` (file) vs `Deal Intake & Modeling` (separate `/deal-intake` route). Four names, one stage. Severity: H.
- **`AppShell.tsx:19-25`** — [name]: OVERVIEW groups Dashboard, Active Deals, Bernard. Bernard is system-wide orchestrator, not an overview tile. Severity: M.
- **`AppShell.tsx:27-35`** — [name]: STRUCTURING mixes `Bond Desk`, `Bond Intel`, `Modeling`, `Credit & Rating`, `Rating Submission`, `Enhancement`. Per the Bible the canonical desks are Bond Desk, Credit Underwriting, Rating, Structuring. "Bond Intel / Modeling / Enhancement" are not Bible-aligned. Severity: H.
- **`AppShell.tsx:32-33`** — [name]: adjacent items `Credit & Rating` → `/credit` and `Rating Submission` → `/rating`. Banker reads two rating tabs side by side and asks: which one. Severity: H.
- **`AppShell.tsx:34`** — [name]: sidebar `Enhancement`, route `/surety`, component `InsuranceSuretyPage` — three names for one desk. Severity: H.
- **`AppShell.tsx:42`** — [name]: `Doc Upload` lives under EXECUTION but the pipeline diagram (`DealInputPage`) puts Documents at stage 2, between Intake and Credit (i.e. ORIGINATION). Severity: M.
- **`AppShell.tsx:48-57`** — [name]: ADMINISTRATION lumps Covenants, Risk/Sentinel, Forensic, Surveillance, Compliance, Trustee. Surveillance and Compliance are separate desks. Severity: H.
- **`AppShell.tsx:51`** — [name]: `Risk / Sentinel` mixes desk name with agent codename. Strip agent from label. Severity: M.
- **`AppShell.tsx:53-54`** — [name]: `Compliance` → `/nightvision`. Codename leaks into URL. Severity: M.
- **`AppShell.tsx:59-67`** — [name]: SYSTEM is a junk drawer: HFT Fund, Marketing, AI Tools, EMMA, Agents, Admin. HFT Fund and Marketing are real desks; EMMA is intelligence layer. Severity: H.
- **`AppShell.tsx:61`** — [name]: `HFT Fund` → `/institutional`. Label/route mismatch. Severity: L.
- **`AppShell.tsx:63`** — [name]: `AI Tools` is consumer-SaaS language for what the page (`CentralNervousSystem`) calls "Central Nervous System." Pick one. Severity: M.
- **`AppShell.tsx:83`** — [copy]: subtitle `"Command Platform"` — generic. Brand line is "Private Bond Structuring · PE Fund · M&A Intelligence · Capital Markets." Severity: L.
- **`AppShell.tsx:124`** — [name]: `"Arden Edge × Sparrow Capital"`. CLAUDE.md says `Soparrow`. AboutNest.tsx also uses `Sparrow`. Pick one spelling and grep-replace. Severity: M.

### `frontend-v2/src/App.tsx`

- **`App.tsx:56`** — [demo]: hardcoded fallback `dealId="dec80007-947f-4310-9aef-7313d0945cf8"` for `/command-center` — any visitor sees a deal that doesn't exist for them. Severity: H.
- **`App.tsx:74-75`** — [orphan]: both `/eagleeye` (V1) and `/eagleeye-v2` (V2) wired; sidebar only shows V2. V1 reachable by URL only. Severity: M.
- **`App.tsx:77, 101`** — [name]: `/roots` (RootsPage→RootsWorkspace) and `/upload` (RootsUploadPage) are two doc-upload pages. Severity: H.
- **`App.tsx:87`** — [orphan]: `/deal-intake` exists as a 2nd intake; sidebar links only `/deal-input-v4`. Severity: M.
- **`App.tsx:100` vs `App.tsx:70`** — [name]: `/deals` (DealsPage V4) and `/operations/deals` (OperationsDealsPage legacy) — two deal lists. Severity: H.
- **`App.tsx:128`** — [ux]: `<BernardConcierge />` mounted globally — floats on every page. Combined with `/bernard` page and the per-deal Bernard.tsx chat there can be 3 Bernards on screen at once. Severity: H.

---

## 2. Home / Landing (`/`)

### `pages/Home.tsx`

- **`Home.tsx:37-40`** — [demo]: HERO/BOND_DESK/NERVOUS/RATING images are placeholder SVG data-URIs literally labeled "NEST Bond Desk", "NEST Neural Network", "Rating & Surety Room." Severity: H.
- **`Home.tsx:104-111`** — [demo]: deskStatus shows invented status chips: `ACTIVE`, `GOVERNED`, `WATCH`, `PORTFOLIO`, `OPS CORE`. Banker would not say "OPS CORE." Severity: M.
- **`Home.tsx:119-126`** — [demo]: marketTape fake rows (`["NEST TREE", "ONLINE", "governed routing"]`...). Investors expect real numbers on a market ribbon. Severity: H.
- **`Home.tsx:188-189`** — [copy]: `"Backend desks 7"` — Bible says 14 desks; sidebar shows ~25 routes. Severity: H.
- **`Home.tsx:215`** — [copy]: `<h1>Command OS</h1>`. Brand is NEST Advisors. "Command OS" reads like a Notion clone. Severity: M.
- **`Home.tsx:237`** — [voice]: passive `"AI prepares institutional work product. Humans approve submissions, outreach..."`. Jimmy Lee: "AI builds. Human approves." Severity: M.
- **`Home.tsx:247`** — [copy]: `"Checking command credentials..."` — overwrought. Severity: L.
- **`Home.tsx:298-303`** — [copy]: self-describing chrome ("A precise black interface with cyan, gold, red, green, and fuchsia signal color frames..."). Breaks fourth wall. Severity: H.
- **`Home.tsx:351`** — [demo]: `<span>22 tests passing</span>` displayed to user. CI status doesn't belong on an investor dashboard. Severity: H.
- **`Home.tsx:373`** — [demo]: approval placeholder leaks debug fields `type: "rating-package", itemId: 0`. Severity: M.
- **`Home.tsx:397`** — [demo]: hardcoded `[["Senior lane","$118M"],["B sleeve","$31M"],["DSCR target","1.41x"],["Spread watch","+94bp"]]` shown as live deal metrics. Severity: H.
- **`Home.tsx:443`** — [copy]: empty-state confuses pre-close and post-close. Severity: M.
- **`Home.tsx:449`** — [copy]: 35-word run-on sentence. Severity: L.
- **`Home.tsx:465`** — [demo]: empty-state row `{name:"No live deal loaded", issuer:"NEST intake", amount:"0", status:"ready"}` renders as if a real deal at $0. Severity: H.
- **`Home.tsx:482`** — [copy]: "SuretyScout" referenced; agent fleet in CLAUDE.md doesn't include SuretyScout. "central tree brain" not in spec. Severity: M.
- **`Home.tsx:502`** — [copy]: meta-language "vivid command-room visual language." Severity: M.

---

## 3. V4 module pages (`pages/v4/`)

### `BernardPage.tsx` (`/bernard`)

- **`BernardPage.tsx:13-20`** — [copy]: prompt "How do the Mirror Agents predict ratings?" leaks internal architecture jargon. Banker says "your rating model." Severity: M.
- **`BernardPage.tsx:47`** — [name]: eyebrow `"Orca C-Suite · CEO Agent"`. Orca is a separate platform (per memory). NEST should not brand itself as Orca-first. Severity: H.
- **`BernardPage.tsx:54`** — [voice]: `"Ask anything about NEST operations..."`. Institutional voice: "Brief on operations." Severity: M.
- **`BernardPage.tsx:62-64`** — [name]: tabs `Ask Bernard / Route Task / Tutorial / Gate`. "Tutorial / Gate" reads like a help center. Severity: M.
- **`BernardPage.tsx:81`** — [voice]: loading `"Thinking..."`. Use "Working" or "Routing." Severity: L.

### `CreditUWPage.tsx` (`/credit`)

- **`CreditUWPage.tsx:12-19`** — [voice]: Universal Credit Policy thresholds (DSCR floor 1.20x, Debt Yield 8%, 80% LTC, 20% equity) do not match the CLAUDE.md JP Morgan benchmarks (A-grade DSCR > 2.0, BBB+ > 1.75, etc.). Conflicting authorities on the platform. Severity: H.
- **`CreditUWPage.tsx:21-25`** — [name]: tiers handled by `"Senior Credit Underwriter Agent / CCO + Founders / Founders explicit approval"`. Mixes agent identity with role title. Severity: M.
- **`CreditUWPage.tsx:54`** — [name]: eyebrow `"Credit Underwriting Desk · Maxwell Agent"`. Strip agent codename from banker-facing chrome. Severity: M.
- **`CreditUWPage.tsx:88-103`** — [ux]: four free-text number inputs (DSCR / leverage / equity / experience). Equity prompt = `"0.30"` — banker types `"30%"`. No formatting hints. Severity: H.
- **`CreditUWPage.tsx:112`** — [style]: dynamic Tailwind class string `border-${...}-500/30` — Tailwind purge strips these; borders won't render. Severity: M.

### `DealInputPage.tsx` (`/deal-input-v4`)

- **`DealInputPage.tsx:14-26`** — [name]: 11 deal types include `Equity Raise` and `General Advisory`. NEST is a bond banker. Mixed track confuses the credit pipeline. Severity: M.
- **`DealInputPage.tsx:35-40`** — [name]: SECTOR mixes M&A targets (SaaS, Industrial Mfg) with muni issuers (Senior Living/CCRC, Charter Schools). One field doing two jobs. Severity: M.
- **`DealInputPage.tsx:178`** — [name]: eyebrow `"Stage 0 · Intake"`. RootsUploadPage says `"Stage 1"`. DealsPage uses 11 stages. Success modal uses 9. Stage numbering not aligned. Severity: H.
- **`DealInputPage.tsx:194, 213, 231, 235`** — [demo]: placeholders `"Project Sunrise Acquisition"`, `"28000000"`, `"Sunrise Senior Living LLC"`, `"Apex Capital Partners"`. Three matching fake names suggest a real deal. Severity: M.
- **`DealInputPage.tsx:144`** — [name]: chip strip uses verb `"Enhance"` where everywhere else uses noun `"Enhancement"`. Severity: L.
- **`DealInputPage.tsx:152`** — [voice]: `"...so the intelligence engine can analyze financials, generate the credit memo, and prepare the structuring recommendation."` "Intelligence engine" is meta-language. Severity: M.
- **`DealInputPage.tsx:263`** — [name]: stage `"Structure — Bernard brainstorm"`. Bernard *brainstorms* the bond? Undersells the engine and reads casual. Severity: M.
- **`DealInputPage.tsx:267`** — [name]: stage `"Admin — 30yr lifecycle"`. Per Bible, lifecycle is Surveillance, not Admin. Conflicts with sidebar ADMINISTRATION group. Severity: M.

### `DealsPage.tsx` (`/deals`)

- **`DealsPage.tsx:12-24`** — [name]: PIPELINE_STAGES lists `desk: "BD"` (jargon), `"Bond Desk"` appears twice (Intake AND Closing), `"Operations"` desk with label `"Admin"`. Severity: H.
- **`DealsPage.tsx:39`** — [demo]: data source `/api/deal-flow/seed-deals` — "seed-deals" leaks demo intent into the URL surface. Severity: M.
- **`DealsPage.tsx:107`** — [voice]: raw `deal.status` rendered ("funded", "intake"). Banker expects "Funded", "In Intake", "At Rating." Severity: L.

### `RootsUploadPage.tsx` (`/upload`)

- **`RootsUploadPage.tsx:140`** — [name]: eyebrow `"Roots · Document Ingestion · Stage 1"` — Stage numbering inconsistent with DealInputPage. Severity: M.
- **`RootsUploadPage.tsx:158`** — [copy]: `"No deals yet — create one in Deal Input"`. "Deal Input" doesn't match sidebar label "New Deal." Severity: L.
- **`RootsUploadPage.tsx:210`** — [voice]: `"Bernard is analyzing..."` — use "Bernard is filing." Severity: L.
- **`RootsUploadPage.tsx:332`** — [voice]: button `"Documents Complete — Advance to Credit Analysis →"` — three concepts in one button. Severity: L.

### `EMMAPage.tsx` (`/emma`)

- **`EMMAPage.tsx:54, 93`** — [style]: purple hero border + `bg-purple-600` buttons. Violates gold/forest palette. Severity: H.
- **`EMMAPage.tsx:60`** — [voice]: `"Every muni bond ever issued, structured, rated, insured, and funded."` Overclaim — EMMA covers muni disclosure since 2009-ish. A banker will notice. Severity: H.
- **`EMMAPage.tsx:97, 116, 132`** — [ux]: search/template/parse results are raw `<pre>{JSON.stringify(...)}</pre>` dumped to the page. No banker-readable view. Severity: H.
- **`EMMAPage.tsx:113`** — [copy]: badge `"Operating Framework defaults"` — what framework? Leaks internal naming. Severity: M.
- **`EMMAPage.tsx:123, 127`** — [voice]: copy + button name "Claude AI" out loud. Banker doesn't need the model name. Severity: M.
- **`EMMAPage.tsx:140`** — [copy]: Comps tab body is a coming-soon stub disguised as a description ("Populated as Official Statements are parsed..."). Severity: H.

### `SurveillancePage.tsx` (`/surveillance`)

- **`SurveillancePage.tsx:10-15, 17-21`** — [demo]: hardcoded refunding candidates (`"Sunrise Senior Living"`, `"Harbor View CCRC"`, fake CUSIPs `867945AA1`) and alerts (`"DSCR declined to 1.25x from 1.42x"`). Rendered as live portfolio. Severity: H.
- **`SurveillancePage.tsx:27`** — [style]: violet hero. Off palette. Severity: H.
- **`SurveillancePage.tsx:32, 82`** — [voice]: "Mirror Agents" jargon, Re-rating tab is a coming-soon stub. Severity: M / H.

### `ConstructionPage.tsx` (`/construction`)

- **`ConstructionPage.tsx:14-37`** — [demo]: SAMPLE_MILESTONES, DRAW_SCHEDULE, CHANGE_ORDERS hardcoded with specific dates, amounts, and prose like `"Soil remediation — unexpected contamination at NE corner"`. Severity: H.
- **`ConstructionPage.tsx:48`** — [style]: orange hero. Off palette. Severity: H.
- **`ConstructionPage.tsx:155-156`** — [demo]: hardcoded insurance/lien strings rendered as live verifications. Severity: H.

### `TreasuryPage.tsx` (`/treasury`)

- **`TreasuryPage.tsx:17-19`** — [demo]: all three fetches use literal `deal-1`. Severity: H.
- **`TreasuryPage.tsx:28, 30`** — [name/voice]: eyebrow names a vendor (`Ramp Commercial Card Program`); description reads like vendor pitch. Severity: M.
- **`TreasuryPage.tsx:89-96`** — [demo]: Soft Costs list specific vendor names AND specific dollar amounts (`Moody's $850K, S&P $720K, Greenberg Traurig $480K, Orrick $340K, Deloitte $290K, McKinsey $380K, AWS $48K`). Banker reads as actual engagements. Severity: H.
- **`TreasuryPage.tsx:112`** — [demo]: T&E breakdown fake amounts. Severity: H.

### `TrusteePage.tsx` (`/trustee`)

- **`TrusteePage.tsx:63`** — [copy]: explicit `"Coming soon: live fee quotes from trustee bank APIs."` in production. Severity: H.
- **`TrusteePage.tsx:68`** — [copy]: Performance tab is another disguised coming-soon. Severity: H.
- **`TrusteePage.tsx:25, 28`** — [style/name]: cyan hero (probably should be gold), eyebrow "5 Agents" — strip the count. Severity: L.

### `ClientDashboardPage.tsx` (`/client`)

- **`ClientDashboardPage.tsx:20`** — [demo]: hardcoded `dealId = "jacaranda-2026"`. Every client sees Jacaranda. Severity: H.
- **`ClientDashboardPage.tsx:25`** — [voice]: greeting `"Welcome to your NEST Advisors deal portal. I'm Bernard — ... Ask me anything."` Consumer SaaS. Severity: H.
- **`ClientDashboardPage.tsx:32-51`** — [demo]: full `readiness` object hardcoded (score 68, BBB-→A, named blockers, dollar amounts). Severity: H.
- **`ClientDashboardPage.tsx:43`** — [voice]: blocker action `"Increase NOI or reduce debt service"` is unhelpful to a client. Severity: M.
- **`ClientDashboardPage.tsx:47-49`** — [voice]: impact phrases include banned hedge `~80bps`, `~$1.2M`, `potential 1 notch upgrade`. Severity: H.
- **`ClientDashboardPage.tsx:108`** — [demo]: fake-real org `"Convivial Jacaranda Trace, LLC · Venice, FL · 501(c)(3) CCRC"`. Severity: H.
- **`ClientDashboardPage.tsx:272`** — [copy]: dead empty-state `"Documents pending your review will appear here."` with no actual e-sign flow. Severity: M.

---

## 4. Workbench / V3 legacy pages

### `WorkbenchPages.tsx`

- **`WorkbenchPages.tsx:33`** — [demo]: `const TREE_LOGO = ""` — used as `<img src="">`. Broken image icon in the sidebar. Severity: H.
- **`WorkbenchPages.tsx:35-40`** — [name]: layer rows include `"Universal Connector Power Strip"`, `"NEST Agent / Tool Power Strip"`, `"Curated AI Brain"`, `"Deterministic Execution Backend"`. Engineering language. Severity: M.
- **`WorkbenchPages.tsx:43-47`** — [demo]: dashboardCards hard-code `"18 lanes"`, `"74% ready"`, `"A path"`, `"$173M demo"`. Literal word **"demo"** in production. Severity: H.
- **`WorkbenchPages.tsx:46, 50, 51, 54`** — [orphan]: hrefs `/rating-intelligence`, `/admin-platform`, `/client-deposit`, `/compliance-portal` — actual routes are `/rating`, `/admin`, `/deposits`, `/compliance`. Four broken links in one card grid. Severity: H.
- **`WorkbenchPages.tsx:180-181`** — [copy]: hero `"The dashboard proves the redesign is not deleting systems..."` — release-note meta-commentary, not user-facing. Severity: H.
- **`WorkbenchPages.tsx:228`** — [copy]: internal product principle ("Every feature must state what it ingests...") rendered as on-page section. Severity: M.
- **`WorkbenchPages.tsx:266, 285`** — [voice]: "power-strip backend"; `"output remains frontend-demo simulated until a human committee approves..."` — phrase **"frontend-demo simulated"** in production. Severity: H.

### `OperationsPages.tsx`

- **`OperationsPages.tsx:38`** — [demo]: HERO placeholder SVG data-URI. Severity: M.
- **`OperationsPages.tsx:54`** — [style]: cyan terminal inputs; brand accent should be gold. Severity: L.

---

## 5. EagleEye V2 (`/eagleeye-v2`)

### `EagleEyeV2.tsx`

- **`EagleEyeV2.tsx:858`** — [name]: panel `"EAGLEEYE × BERNARD · LIVE PIPELINE"`. Reads like a Marvel crossover. Use "Deal Pipeline." Severity: M.
- **`EagleEyeV2.tsx:870`** — [demo]: `"Aggregate pipeline"` $ is computed by regex over description text. Brittle and likely wrong. Severity: H.
- **`EagleEyeV2.tsx:895-900`** — [voice]: sector dropdown raw snake_case values. Severity: L.
- **`EagleEyeV2.tsx:1003`** — [copy]: empty state `"No active signals match yet — run a scout to populate."` Severity: M.
- **`EagleEyeV2.tsx:1224`** — [name]: header literally `"EagleEye V2"` — banker doesn't care about version number. Severity: M.
- **`EagleEyeV2.tsx:1245`** — [name]: status pill `"VectorAgent: 78"` exposes agent identity. Severity: M.
- **`EagleEyeV2.tsx:1276, 1285`** — [voice]: buttons `"Poll EDGAR"` / `"Poll FRED"`. Engineering verbs. Use "Refresh." Severity: M.

---

## 6. Bond Desk (`/bond-desk`) — GENIE

### `BondDeskPage.tsx`

- **`BondDeskPage.tsx:26`** — [name]: page title `"GENIE"`, sidebar `"Bond Desk"`. CTO sees discontinuity. Severity: M.
- **`BondDeskPage.tsx:29`** — [voice]: subtitle `"Bond Arrangement Engine — Structure any debt vehicle"` — "any debt vehicle" overclaims. Severity: L.

### `bond-desk/BondStructuringEngine.tsx`

- **`BondStructuringEngine.tsx:166-170`** — [demo]: placeholders `"Jacaranda Trace"`, `"Soparrow Capital"`, `200000000`, `16000000`. Severity: M.
- **`BondStructuringEngine.tsx:282-287`** — [name]: tranche labels include `"Series C Junior"` and `"Subordinate/Equity"`. NEST canonical structure (CLAUDE.md) is A + B only. Severity: M.

### `bond-desk/CounterpartySandbox.tsx`

- **`CounterpartySandbox.tsx:40, 49, 60`** — [demo]: hardcoded counterparty analysts: `"Sarah Chen, VP — Structured Finance"` (Moody's), `"Marcus Webb, Director — Surety & Specialty"` (Hylant), `"David Park, MD — Institutional Sales"` (Hawkeye). Severity: H.
- **`CounterpartySandbox.tsx:57`** — [name]: `"Hawkeye Capital Markets"` invented as external firm name. Hawkeye is the internal placement module. Severity: H.
- **`CounterpartySandbox.tsx:72-86, 90-100, 104-121`** — [demo]: proposal rationale text reads as if Moody's/Hylant/the placement desk actually said it. Includes hedging words (`could tighten`, `would significantly improve`, `estimated impact`) — banned per CLAUDE.md. Severity: H.

### `bond-desk/DealPulseTicker.tsx`

- **`DealPulseTicker.tsx:29-41`** — [demo]: DEFAULT_CURVE hard-codes the entire US yield curve. Renders authoritative if live fetch fails. Severity: M.
- **`DealPulseTicker.tsx:159-168`** — [demo]: rate cards hardcode `Fed Funds 5.33%`, `HY Spd 312bp`. Never update. Severity: H.
- **`DealPulseTicker.tsx:367-371`** — [demo]: attribution `"src: UST · SOFR · FRED"` next to hardcoded constants. Severity: H.

### `bond-desk/DealPipelineDashboard.tsx`

- **`DealPipelineDashboard.tsx:29-65`** — [demo]: 5 fake deals (Jacaranda Trace, Meridian Health Campus, Harbor Point Industrial, Oakwood Multifamily, Summit Office Tower) with full financials, sponsors, partners, last-activity timestamps. Severity: H.
- **`DealPipelineDashboard.tsx:35`** — [voice]: lastActivity `"Tranche B added — 2hr ago"` stale relative timestamps. Severity: M.

### `bond-desk/CMBSStackingDesk.tsx`

- **`CMBSStackingDesk.tsx:32`** — [style]: Equity tranche colored `#a855f7` purple. Severity: L.

---

## 7. Hawkeye Placement (`/hawkeye`)

### `HawkeyePlacementScout.tsx`

- **`HawkeyePlacementScout.tsx:31-77`** — [demo]: DEMO_OFFERINGS (`Jacaranda $231M`, `Harbor Point $89M`, `Oakwood $67M`) with subscribed amounts. Severity: H.
- **`HawkeyePlacementScout.tsx:94-126`** — [demo]: 19 real institutional firm names (MetLife, Prudential, AIG, US Bank, BMO, RBC, Brookfield, Oaktree, Angelo Gordon, PGIM, CalPERS, CalSTRS, NYCERS, WSIB, TRS, LPL, Raymond James, Hylant, Soparrow) with invented appetite/lastDeal fields like `"PGIM Anchor buyer — can take full A tranche"`. Banker will ask if PGIM has actually committed. Severity: H.
- **`HawkeyePlacementScout.tsx:130-138`** — [demo]: DEMO_ORDERS with real firm names and amounts. Screenshot-grade liability — looks like real allocations. Severity: H.
- **`HawkeyePlacementScout.tsx:141-146`** — [demo]: DEMO_ROADSHOW with named meetings, dates, and feedback quotes. Severity: H.

---

## 8. Surety / Insurance (`/surety`)

### `CompleteSuretyModule.tsx`

- **`CompleteSuretyModule.tsx:107, 116`** — [demo]: invented carriers `"Apex Surety Partners"`, `"Sterling Bond Group"`. Sterling is the NEST agent name, not a carrier. Severity: H.
- **`CompleteSuretyModule.tsx:91-95`** — [demo]: 3 Cs scores `Character 84/100`, `Capacity 79/100`, `Capital 81/100` rendered as real grading. Severity: H.
- **`CompleteSuretyModule.tsx:204`** — [name]: button `"Send cleared bond to offering desk"` — "offering desk" not a Bible-aligned desk. Severity: M.

---

## 9. NightVision Compliance (`/nightvision`)

### `NightVisionComplianceLair.tsx`

- **`NightVisionComplianceLair.tsx:8-52`** — [demo]: all regulatory checks hardcoded `status: "pass"` / `"warning"`. A FINRA/SEC examiner seeing green "PASS" on `Reg D 506(c)` with no evidence is a liability. Severity: H.
- **`NightVisionComplianceLair.tsx:84`** — [voice]: AI prompt hardcoded to `"NEST dual-tranche senior living bond offering"`. Severity: M.
- **`NightVisionComplianceLair.tsx:93`** — [name]: `"Compliance Lair"` reads juvenile to a CTO. Severity: L.

---

## 10. Rating Intelligence (`/rating`)

### `RatingIntelligence.tsx`

- **`RatingIntelligence.tsx:36-72`** — [demo]: DEMO_RATING_ACTIONS for `"NEST Mixed-Use Portfolio"`, `"NEST Hospitality Portfolio"`, `"NEST CCRC Portfolio"` rendered as Moody's/S&P actions. Banker will assume real portfolio. Severity: H.
- **`RatingIntelligence.tsx:75-97`** — [demo]: DEMO_CREDIT_MEMOS hardcoded. Severity: H.
- **`RatingIntelligence.tsx:85`** — [voice]: recommendation `"buy"` / `"hold"` / `"sell"`. NEST is structurer/underwriter, not sell-side analyst. Wrong vocabulary. Severity: H.

---

## 11. Bernard surfaces

### `BernardConcierge.tsx` (floating concierge, mounted globally) — **HIGHEST PRIORITY**

- **`BernardConcierge.tsx:45`** — [voice]: welcome `"75 agents across 14 desks, all reporting to me."` — conflicts with CLAUDE.md 15-agent fleet. Severity: H.
- **`BernardConcierge.tsx:85-94, 250-273`** — [voice]: **CRITICAL.** System prompt instructs the model: `"English bloke. Charlie Hunnam / Jax Teller energy ... Bit rude, calls people 'bruv' and 'mate,' backhanded compliments, treats them like they're thick ... 'puff' when they hesitate ... 'You muppet (affectionately)'"`. Per project memory the tone was **explicitly changed from Jax Teller to professional institutional on 2026-05-21**. This file did not get the memo. Severity: H (top-priority finding).
- **`BernardConcierge.tsx:96, 97`** — [voice]: error fallbacks `"Bollocks, something broke. Try again bruv."` / `"Right, the power strip's having a moment. Give it a sec and try again mate."` Severity: H.
- **`BernardConcierge.tsx:131`** — [voice]: error `"Mirror Agents are offline. Try again."` exposes agent name. Severity: M.
- **`BernardConcierge.tsx:165-176, 181, 194`** — [demo]: hardcoded request payloads — every "Run credit analysis" / "Match investors" / "Generate teaser" call analyzes the same fake deal (`NOI $12M`, `Senior Living CCRC`, `FL`, etc.). Severity: H.
- **`BernardConcierge.tsx:269`** — [voice]: prompt instructs Bernard to call Sean `"the gaffer"`. Severity: H.

### `Bernard.tsx` (third Bernard chat component)

- **`Bernard.tsx:197`** — [name]: a *third* Bernard chat input — duplicates `/bernard` page AND `BernardConcierge.tsx`. Pick one. Severity: M.

---

## 12. Admin Platform (`/admin`)

### `AdminPlatform.tsx`

- **`AdminPlatform.tsx:38-42`** — [demo]: hardcoded users `Sean Gilmore, Sarah Chen, Michael Rodriguez, Jennifer Park`. Sarah Chen appears here AND as Moody's analyst in CounterpartySandbox. Severity: H.
- **`AdminPlatform.tsx:53-55`** — [demo]: approval items use fake people and `"Apex Surety - Premium Quote Approval"`. Severity: H.
- **`AdminPlatform.tsx:125-131`** — [copy]: eyebrow `"Admin Platform · working control plane"`, hero `"User role changes, module health repair, and approval decisions now update visible state and route a traceable admin log."` — release-note copy in production. Severity: H.
- **`AdminPlatform.tsx:155-160`** — [demo]: system health metrics (`API 145/200ms`, `DB 8234/10K`, `Memory 62%`, `Disk 45%`) are static. Severity: H.

---

## 13. Marketing Studio (`/marketing`)

### `MarketingStudio.tsx`

- **`MarketingStudio.tsx:57-60`** — [demo]: defaults `dealId="JT-2025-42"`, `clientName="Jacaranda Trace Partners"`, slogan auto-paste `"NEST as a decision, not a service"`. Severity: M.

---

## 14. Risk / Forensic / Modeling / Lenders / CNS

### `RiskCommandCenter.tsx` (`/risk`)

- **`RiskCommandCenter.tsx:41`** — [voice]: eyebrow exposes "Sentinel Agent." Severity: M.
- **`RiskCommandCenter.tsx:82`** — [demo]: risk dimension bar widths use `Math.random() * 20`. Live randomness pretending to be risk. Severity: H.

### `ForensicAudit.tsx` (`/forensic`)

- **`ForensicAudit.tsx:39`** — [voice]: italic `"If it passes this, it passes the rating agencies."` — overclaim. Severity: H.
- **`ForensicAudit.tsx:82`** — [voice]: button `"Running FBI/DOJ-standard analysis..."` — FBI/DOJ is regulated language NEST cannot claim. Severity: H.

### `ModelingStudio.tsx` (`/modeling`)

- **`ModelingStudio.tsx:18`** — [demo]: every Grade call sends the same Life Star Pointe Loop payload. Severity: H.
- **`ModelingStudio.tsx:97`** — [voice]: button `"Run Bond Grading - Life Star Pointe Loop"` exposes a project codename. Severity: H.

### `LenderCommandCenter.tsx` (`/lenders`)

- **`LenderCommandCenter.tsx:40`** — [voice]: eyebrow exposes "LenderScout Agent." Severity: M.
- **`LenderCommandCenter.tsx:47-50`** — [demo]: KPIs hardcoded `Lenders 800+ / Pipelines 3 / Term Sheets YTD 7 / Fees YTD $1.2M`. Severity: H.

### `CentralNervousSystem.tsx` (`/ai-tools`)

- **`CentralNervousSystem.tsx:77`** — [name]: `<h1>Central Nervous System</h1>` but sidebar says "AI Tools." Severity: H.
- **`CentralNervousSystem.tsx:79, 228`** — [voice]: `"NEST Advisors is the power strip"` / button `"Send to Nervous System"` — engineering metaphor user-facing. Severity: M.

### `BondIntelligence.tsx` (`/bond-intel`)

- **`BondIntelligence.tsx:78`** — [voice]: name-drops `"Capital Trust Authority BAN + Jacaranda Trace PLOM"` in the eyebrow. Severity: M.

### `InstitutionalDashboard.tsx` (`/institutional` "HFT Fund")

- **`InstitutionalDashboard.tsx:62-66`** — [name]: lists all 15 agent codenames on what is supposed to be an HFT Fund view. Severity: M.

---

## 15. About (`/about`)

### `AboutNest.tsx`

- **`AboutNest.tsx:20`** — [name]: `"Sparrow Capital"` — but CLAUDE.md and BernardConcierge use `Soparrow Capital`. Pick spelling. Severity: M.
- **`AboutNest.tsx:84-86`** — [voice]: `"Want to restructure at 2am? Bernard is there"` / `"the game changer"` — consumer SaaS. Severity: M.
- **`AboutNest.tsx:90`** — [voice]: `"45-Day Close"` claim — assert with care. Severity: L.
- **`AboutNest.tsx:113`** — [demo]: `"$130 trillion market"` — verify. Severity: L.
- **`AboutNest.tsx:141`** — [name]: Josh listed as `"Private Equity · Capital Markets"` but elsewhere as "Soparrow Capital." Severity: L.

---

## 16. 404 page (`/404`, fallback)

### `NotFound.tsx`

- **`NotFound.tsx:14-15`** — [style]: `bg-gradient-to-br from-slate-50 to-slate-100` + `bg-white/80` card — **white background**, opposite of brand. Severity: H.
- **`NotFound.tsx:24`** — [style]: `text-slate-900` heading — dark text on white. Severity: H.
- **`NotFound.tsx:30-34`** — [voice]: `"Sorry, the page you are looking for doesn't exist. It may have been moved or deleted."` — apologetic; "may" is a banned hedge word. Severity: H.
- **`NotFound.tsx:42`** — [style]: `bg-blue-600` button — should be gold. Severity: H.

---

## 17. Other component leaks

### `KYCCompliance.tsx`

- **`KYCCompliance.tsx:47, 61, 76`** — [demo]: KYC profiles `"Apex Capital Partners"`, `"Horizon Funds LLC"`, `"Sterling Advisors Inc"`. **Apex Capital Partners** is also a sponsor placeholder (DealInputPage) AND a Surety carrier (CompleteSuretyModule). Same fake firm in 3+ inconsistent roles. Severity: H.

### `CompliancePortal.tsx`

- **`CompliancePortal.tsx:38`** — [demo]: email `from: "morgan@nest.com"` (Morgan is an agent, not a person). Severity: M.
- **`CompliancePortal.tsx:39`** — [demo]: recipient `"sec@gov.us"`. Severity: M.
- **`CompliancePortal.tsx:43-47`** — [demo]: SurveillanceAlerts hardcoded with specific impact values (`"-$2.3M"`). Severity: H.

### `DealIntakeModeling.tsx`

- **`DealIntakeModeling.tsx:24-25`** — [copy]: hero literally `"Deal Intake & Modeling · working demo console"`. **"working demo console"** in production. Severity: H.
- **`DealIntakeModeling.tsx:30-31`** — [copy]: release-note voice. Severity: M.

### `ClientDepositPlatform.tsx` (`/deposits`)

- **`ClientDepositPlatform.tsx:68` (called from OperationalModulesPages.tsx)** — [demo]: hardcoded default `dealName="Apex Capital Partners"`. Severity: H.

### Shared demo data files

- **`shared/depositDemo.ts:230, 234, 242, 246, 254, 264`** — [demo]: every Submission row uses `"John Smith (Sponsor)"` and `"Sarah Chen (Underwriter)"`. Severity: H.
- **`shared/rootsDemo.ts:77, 92, 250, 336, 344, 352`** — [demo]: documents uploaded by "John Smith" and "Sarah Chen." Severity: H.
- **`shared/suretyDemo.ts:180`** — [demo]: surety owner "John Smith." Severity: M.
- **`shared/eagleEyeDemo.ts:929, 971`** — [demo]: outreach log with quoted phone notes (`"CONNECTED. 8 min call. She's looked at this site before but couldn't make equity math work."`); leaks codename "Bullseye NexGen." Severity: H.

### `ComponentShowcase.tsx`

- **`pages/ComponentShowcase.tsx`** — [orphan]: not routed in App.tsx but in the build. Shadcn demo dump with literal placeholders like `"Search frameworks..."`, `"Try sending a message..."`. Severity: L.

---

## 18. Cross-cutting patterns

- **Bernard tone violation global** — `BernardConcierge.tsx` (mounted on every page) emits Jax-Teller-era "bruv/mate/muppet/puff/gaffer" copy in system prompt and error states. Per `project_bernard` memory, tone was changed to professional institutional on 2026-05-21. File did not get the memo.
- **"Sarah Chen" reused in 4 different roles** — NEST employee, Moody's counterparty, deposit approver, doc uploader.
- **"Apex Capital Partners" reused in 4 different roles** — PE sponsor placeholder, surety carrier, KYC entity, deposit deal name.
- **Purple/violet/orange leak across hero borders** — EMMA (purple), Surveillance (violet), Construction (orange) all violate gold/forest spec.
- **Cyan dominates over gold** — Most chrome and buttons cyan (`#22d3ee`) rather than the gold (`#C4A048`) brand accent.
- **"Coming soon" stubs disguised** — Trustee fees + performance, EMMA Comps, Surveillance Re-rating tab.
- **Stage numbering inconsistent** — DealInputPage Stage 0, RootsUploadPage Stage 1, DealsPage uses 11 stages, success modal uses 9.
- **Three Bernard surfaces simultaneously** — `/bernard` page, floating `BernardConcierge` on every page, per-deal `Bernard.tsx` chat. Different welcomes, different tools.
- **Agent codenames leak everywhere** — Maxwell, Sentinel, LenderScout, Prometheus, Mirror Agents, VectorAgent visible in banker-facing chrome.
- **Workbench pages mostly dead** — `/dashboard`, `/architecture`, `/portals`, `/agents` use V3 styling and link to broken hrefs (`/rating-intelligence`, `/admin-platform`, `/client-deposit`, `/compliance-portal`).
- **Default Tailwind grays liberally** — `bg-slate-700`, `text-slate-400`, `bg-slate-800` instead of NEST forest tokens.
- **Route↔label↔component mismatches** include: `Doc Upload`/`/upload`/`RootsUploadPage` vs `Roots`/`/roots`/`RootsWorkspace`; `Rating Submission`/`/rating`/`RatingIntelligence` (which is portfolio view, not submission); `AI Tools`/`/ai-tools`/`CentralNervousSystem`; `HFT Fund`/`/institutional`/`InstitutionalDashboard`; `Compliance`/`/nightvision`/`NightVisionComplianceLair`; `Enhancement`/`/surety`/`InsuranceSuretyPage`.
