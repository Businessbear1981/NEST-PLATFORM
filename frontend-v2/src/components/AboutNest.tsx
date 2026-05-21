import { Shield, Users, Zap, Eye, Target, Layers, Clock, Lock, ArrowRight } from "lucide-react";

export default function AboutNest() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="font-serif text-4xl text-amber-100 tracking-wide">It's Time To Fly</h1>
        <p className="font-serif text-lg text-slate-400 italic">Like a bird from a NEST.</p>
        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="font-mono text-sm font-semibold text-white">Sean Gilmore</p>
            <p className="font-mono text-[0.62rem] text-amber-200">Founder</p>
            <p className="font-mono text-[0.52rem] text-slate-500 mt-0.5">Arden Edge Capital</p>
          </div>
          <div className="font-mono text-[0.56rem] text-slate-600">×</div>
          <div className="text-center">
            <p className="font-mono text-sm font-semibold text-white">Josh Edwards</p>
            <p className="font-mono text-[0.62rem] text-amber-200">Founder</p>
            <p className="font-mono text-[0.52rem] text-slate-500 mt-0.5">Sparrow Capital</p>
          </div>
        </div>
      </div>

      {/* The Problem */}
      <Section title="THE PROBLEM WE SAW">
        <p>
          Banks won't talk to you unless you have $20 million in EBITDA. That's the floor. Below that line,
          thousands of companies — generating $30M, $50M, $100M+ in revenue — are locked out of the capital
          markets. No banker picks up the phone. No one structures their deal. No one helps them fly.
        </p>
        <p>
          On the real estate side, entire asset classes sit in what we call the <span className="text-red-300">dark zone</span> —
          properties where cap rates and NOI don't pencil for equity investors. Dead deals, everywhere.
          But they're not dead. They just need a different instrument. They need bonds.
        </p>
        <p>
          We spent combined decades in institutional finance — JPMorgan, private equity, capital markets —
          watching this gap grow wider every year. The tools existed. The math existed. The market existed.
          Nobody built the bridge.
        </p>
        <p className="text-amber-100 font-semibold">We built the bridge.</p>
      </Section>

      {/* How NEST Was Born */}
      <Section title="HOW NEST WAS BORN">
        <p>
          A NEST is where chicks grow and become birds of prey. <span className="text-slate-300">Arden Edge</span> — a bird.{" "}
          <span className="text-slate-300">Sparrow Capital</span> — a bird. We built a platform where deals hatch,
          are nurtured through every stage of structuring and compliance, and take flight as fully placed,
          performing instruments.
        </p>
        <p>
          Every module is named for what it does. <span className="text-cyan-200">EagleEye</span> sees
          deals forming before anyone else. <span className="text-amber-200">GENIE</span> structures
          bonds in ways that weren't possible without automation. <span className="text-emerald-200">Hawkeye</span> places
          them with surgical precision. <span className="text-slate-300">NightVision</span> watches
          compliance around the clock. And <span className="text-amber-100">Bernard</span> — our AI — explains
          every move in plain English so every partner, every investor, every regulator can see exactly
          what's happening, in real time.
        </p>
      </Section>

      {/* Our Principles */}
      <Section title="WHAT WE BELIEVE">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Principle
            icon={Lock}
            title="Fully Compliant — No Exceptions"
            body="SEC. FINRA. State securities. AML. KYC. NightVision monitors every transaction against every regulation in real time. Compliance isn't a department — it's the architecture."
          />
          <Principle
            icon={Eye}
            title="Fee Transparency"
            body="Every fee is visible. Arrangement fees, unused fees, coupon spreads, NEST revenue — it's all on the screen, all the time. Our clients and partners see exactly what we earn and why. No hidden economics."
          />
          <Principle
            icon={Users}
            title="Interactive Partners"
            body="Our rating partners, insurance partners, and investors don't get memos. They get logins. Moody's can log in and say 'tweak this — layer a BBB on tranche 2, add a draw term with principal paydown.' In real time. Drag and drop. Or just tell Bernard."
          />
          <Principle
            icon={Zap}
            title="Bernard Changes Everything"
            body="Bernard is our AI engine. He doesn't just answer questions — he acts. Upload a document, Bernard parses it. Ask for a structure, Bernard builds it. Want to restructure at 2am? Bernard is there. Every partner, every investor can talk to Bernard and get real-time modifications to any deal, any bond, any tranche. That's the game changer."
          />
          <Principle
            icon={Clock}
            title="45-Day Close"
            body="Banks take 6-9 months to structure a bond. We do it in 45 days. Not because we cut corners — because we automated what 15 analysts do manually. Cash flow modeling, tranche optimization, rate arbitrage, investor matching, compliance monitoring. The math is the same. The speed is not."
          />
          <Principle
            icon={Layers}
            title="Modular Structuring"
            body="A $100M commitment doesn't have to be a single bullet bond. We break it into modular pieces — each with its own term, coupon, call option, put option, draw schedule. Retire pieces independently. Refinance one without touching the others. Rate arbitrage across tenors. Every piece breathes on its own."
          />
          <Principle
            icon={Target}
            title="Offensive Origination"
            body="We don't wait for deals to come to us. EagleEye scans M&A signals, CRE development patterns, PE fund raises, founder exit signals, and distressed assets. Bullseye packages the pitch. Boxing Out runs the 10-touch outreach cadence. We show up with the target, the thesis, and the capital structure already designed."
          />
          <Principle
            icon={Shield}
            title="Integrated Process"
            body="Every step feeds the next. EagleEye finds the deal → Roots collects documents → GENIE structures the bond → Hawkeye places it → NightVision monitors compliance. No handoffs. No lost context. No waiting for emails. One platform, one pipeline, one truth."
          />
        </div>
      </Section>

      {/* The Vision */}
      <Section title="THE VISION">
        <p>
          The bond market is a $130 trillion market. The middle market — companies between $30M and $150M
          in revenue — is the fastest-growing segment of the economy, and the most underserved by capital
          markets infrastructure.
        </p>
        <p>
          NEST Advisors exists to give these companies access to the same structured finance tools that
          Fortune 500 companies take for granted. The same bond structuring. The same capital markets
          execution. The same institutional-grade compliance. At a speed and price point that didn't exist before.
        </p>
        <p className="text-amber-100 font-semibold text-lg mt-4">
          A NEST where chicks grow and become birds of prey.
        </p>
        <p className="text-amber-100 font-semibold text-lg">
          It's Time To Fly.
        </p>
      </Section>

      {/* Footer */}
      <div className="border-t border-white/10 pt-8 pb-12 text-center">
        <div className="flex items-center justify-center gap-8">
          <div>
            <p className="font-mono text-sm font-semibold text-white">Sean Gilmore</p>
            <p className="font-mono text-[0.62rem] text-slate-400">18 years JPMorgan · Top Banker 11× Nationally</p>
            <p className="font-mono text-[0.56rem] text-amber-200 mt-0.5">Arden Edge Capital</p>
          </div>
          <div className="font-serif text-2xl text-amber-100/30">×</div>
          <div>
            <p className="font-mono text-sm font-semibold text-white">Josh Edwards</p>
            <p className="font-mono text-[0.62rem] text-slate-400">Private Equity · Capital Markets</p>
            <p className="font-mono text-[0.56rem] text-amber-200 mt-0.5">Sparrow Capital</p>
          </div>
        </div>
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-slate-600 mt-6">
          NEST Advisors · Pacific Northwest · nestadvisors.com
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-amber-200 mb-4">
        {title}
      </h2>
      <div className="space-y-3 font-serif text-base leading-7 text-slate-300">
        {children}
      </div>
    </div>
  );
}

function Principle({ icon: Icon, title, body }: { icon: typeof Shield; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-amber-200" />
        <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white">{title}</h3>
      </div>
      <p className="font-serif text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}
