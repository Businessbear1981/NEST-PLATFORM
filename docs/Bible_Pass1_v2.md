**NEST ADVISORS**

**THE BIBLE**

*An Operator's Manual for the Digital Investment Bank*

Bond Operations — Pass 1

**Nest Advisors**

Internal Operating Document — Confidential

Sean Gilmore, Co-Founder

Josh Edwards, Co-Founder

# **PREFACE**

This document is the operating manual for Nest Advisors — a digital investment bank. Pass 1 covers bond operations: the anatomy of a bond, the cast of counterparties that bring one into existence, the workflow that runs from inbound inquiry through closing and the decades of administration that follow, and the structural, analytical, and operational craft that defines the firm's edge.

The Bible is written as if to a competent senior banker — operator depth throughout, no hand-holding on basics. It is also written so that the platform's engineers can read the same document and understand what the firm does, why it does it, and where the platform must support the operator. Business and engineering share one source of truth.

The eighteen silos cover the field end to end: bond anatomy, players, workflow, documents, fees, optionality, covenants, reserves and waterfalls, credit enhancement, tranching, pricing, administration, refundings and workouts, risk rating, the modeling engine, the rule library, agent specifications by workflow stage, and tech stack wire-up. Each silo treats its subject in operator depth and ends with a quick-reference section for fast retrieval.

What this Bible does not cover: M&A advisory, sell-side execution, equity capital markets, debt-equity hybrid products beyond bond-adjacent structures, and the firm's broader strategic operations beyond the bond engine. Future passes will address those. Pass 1 is intentionally bond-only because the bond engine is the firm's foundation and the area where the operating leverage is most defensible.

The document is internal and confidential. It contains the firm's accumulated operator judgment, structural patterns, fee architecture, and competitive positioning. It is not for external distribution.

*— Sean Gilmore*

*Co-Founder, Nest Advisors*

# **CONTENTS**

**SILO 1** The Anatomy of a Bond

**SILO 2** The Players

**SILO 3** The End-to-End Workflow

**SILO 4** The Documents

**SILO 5** The Fee Architecture

**SILO 6** Calls, Puts, and Optionality

**SILO 7** Covenants and Compliance

**SILO 8** Reserves and Waterfalls

**SILO 9** Credit Enhancement

**SILO 10** Tranching and Layering

**SILO 11** Pricing and Spread Mechanics

**SILO 12** Post-Closing Administration

**SILO 13** Refundings, Restructurings, and Workouts

**SILO 14** Risk Rating, LGD, and Loss Management

**SILO 15** The Modeling Engine

**SILO 16** Rule Library Architecture

**SILO 17** Agent Specifications by Workflow Stage

**SILO 18** Tech Stack Wire-Up

# **SILO 1 — ANATOMY OF A BOND**

Every bond in the market — whether a $5 million school district issuance or a $500 million corporate project bond — is built from the same set of mechanical parts. A banker who can name every part and explain what each one does is operating at a fundamentally different level than one who can only describe the bond at the headline level (par, coupon, maturity). The mechanical parts are what get structured, negotiated, priced, monitored, and ultimately what generate the spread Nest captures. This silo walks every part.

## **1.1 The Six Things a Bond Is**

A bond, mechanically, is six things bundled together: (1) a promise to repay principal at a date, (2) a promise to pay periodic interest, (3) a set of conditions under which the borrower can or must accelerate or modify either payment, (4) a set of covenants the borrower must observe, (5) a set of remedies the bondholders have if the borrower breaches, and (6) a set of structural protections (reserves, security, enhancement) that sit between the bondholders and the borrower's general credit. Every structural decision Nest makes is a decision about one of these six things. The headline numbers — par, coupon, maturity, rating — are the consequences of the six decisions, not the bond itself.

**THE FRAME —** Don't think of a bond as a number with a coupon attached. Think of it as a six-part legal and economic structure. Every fee Nest earns and every basis point of spread captured comes from the six-part structure being designed and presented optimally.

## **1.2 Principal — The Repayment Architecture**

### **Par Amount**

The face amount of each bond and the aggregate face amount of the issue. Bondholders are entitled to receive par at maturity (subject to redemption provisions). Standard denomination for a public muni or corporate bond is $1,000 or $5,000 face per bond. Aggregate par is what the issuer borrows; the difference between aggregate par and what the issuer actually receives in proceeds is the underwriter's discount plus the original issue discount or premium plus the upfront costs paid from proceeds.

### **Issue Price vs. Par**

A bond can be issued at par (par = price = 100), at a premium (price > 100), or at a discount (price < 100). The decision is not cosmetic — it changes the tax treatment for tax-exempt bonds, changes the yield-to-call math, changes the optics for institutional buyers, and changes the original issue discount accretion or amortization for the bondholder. Premium bonds are more callable-resistant in low-rate environments because the call price compresses to par as the call date approaches. Discount bonds carry the OID accretion issue under tax-exempt rules.

### **Maturity Structure**

The most basic question: when does principal come back? Three patterns dominate. A bullet bond (also called a term bond) repays 100% of principal in a single lump at maturity. A serial bond repays principal in scheduled portions across multiple maturity dates (typical of municipal bonds — a single issuance may have 20 different maturity dates, each priced separately). A sinking fund bond repays principal in periodic mandatory redemptions before stated maturity, retiring portions of the issue on a schedule.

The maturity pattern is not just a borrower preference. Different buyers want different maturity profiles. Insurance companies match assets to liabilities and want long bullets with predictable cash flow. Bond funds buy across the curve and value liquidity. Bank portfolios want shorter maturities and amortization. Choosing the right maturity structure is the first major buyer-pool matching decision. A serial structure with one bullet term bond at the long end can serve multiple buyer pools from a single issuance — banks and retail buy the front-end serials, lifecos buy the long term bond. That's a structuring move that broadens the buyer pool and tightens pricing.

### **Amortization Within Maturity**

Even within a single tranche, principal can repay in patterns. Level debt service amortizes principal so that total annual payment (principal + interest) is roughly constant across the bond's life — front-loaded principal, back-loaded interest mathematically. Level principal amortizes the same principal amount each year, producing declining total debt service. Capital appreciation bonds (CABs) accrue interest into principal rather than paying it periodically, with both principal and accrued interest paid at maturity — used when the project has no cash flow during construction. Step-up amortization defers principal in early years and accelerates later, useful when the project has a ramp period.

**WHY THIS MATTERS:** The amortization pattern is one of the most overlooked structural levers in middle-market bond work. Most regional bankers default to level debt service because that's what their template produces. A thoughtful banker matches the amortization to the project's cash flow profile — and in doing so, gives the project a wider DSCR cushion in the years where cash flow is naturally weakest, which in turn supports a tighter pricing on the bonds because the credit looks stronger.

## **1.3 Interest — The Coupon Architecture**

### **Coupon Rate Mechanics**

The coupon is the periodic interest rate the bond pays on its outstanding par. Stated as an annualized percentage, paid semi-annually for most US bonds (monthly for some structured products, quarterly for certain variable-rate instruments). Coupon × par × payment period = dollar coupon payment. Coupon rate is fixed at pricing for fixed-rate bonds; variable-rate bonds reset against a reference rate plus a spread.

### **Fixed Rate**

The classic structure. Coupon is locked at pricing and stays the same for the bond's life. Buyers know exactly what cash flow they'll receive. Borrower knows exactly what debt service they'll pay. This certainty has a cost — the borrower pays a premium for the lender's interest-rate risk over the bond's life. Fixed-rate bonds dominate the long end of the curve and dominate institutional buyer demand.

### **Variable Rate**

Coupon resets periodically against a benchmark. The two dominant variable structures are (a) variable rate demand obligations (VRDOs), which reset weekly or daily and carry a tender right for the bondholder, and (b) floating rate notes, which reset against a benchmark like SOFR or the SIFMA index without a tender right. Variable-rate bonds are cheaper for the borrower when rates are stable or declining and become very expensive when rates spike. They typically require credit enhancement (LOC or liquidity facility) because the bondholder's right to tender at par creates a liquidity risk the issuer cannot bear unsupported.

### **Capped, Collared, Stepped Coupon Structures**

More exotic but legitimately useful. A capped floater is a floating-rate bond with an upper limit on coupon — the borrower buys protection against rate spikes. A collared floater has both a cap and a floor. A stepped coupon increases (or decreases) at scheduled dates regardless of market — used to back-load interest expense behind a project's ramp period or to compensate buyers for accepting weaker covenants in the early years.

### **Inverse Floater**

The coupon moves opposite to the reference rate — when SOFR rises, the coupon falls, and vice versa. Used by buyers who want to hedge a portfolio of regular floaters or who have a strong rate view. Rarely structured by middle-market issuers but worth knowing because they appear in CMO-style structured deals.

### **Zero Coupon**

The bond pays no periodic interest. It is issued at deep discount to par and accretes to par at maturity. The buyer's entire return is the accretion. Useful when the issuer has no current cash flow to support debt service (construction-period CABs, deferred-payment structures). Tax-exempt zeros have special treatment for OID accretion that requires careful disclosure.

### **Discount Bonds, Premium Bonds, and Buyer Optics**

Most institutional buyers prefer premium bonds — bonds issued above par with above-market coupons. The reason is technical: premium bonds have lower effective duration, are more defensive in rising-rate environments, and the call protection embedded in a premium bond is mathematically stronger because the call price (which is par or close to it) is a discount to the issuance price. Lifeco portfolio managers explicitly screen for premium pricing. A banker who issues at par in a market where premium structures are available has cost the issuer 5-15 basis points of spread that could have been captured by structuring to buyer preference.

**THE PREMIUM TRADE:** On a $50M tax-exempt issuance, structuring with a 5% coupon at a 103.5 premium price vs. a 4.6% coupon at par often produces 8-15 basis points of tighter all-in yield to the issuer because institutional buyers pay up for the premium structure. Same economics for the issuer, better optics for the buyer, captured by the banker who knows to structure that way.

## **1.4 Redemption — When and How Principal Can Be Returned Early**

Redemption provisions are the most powerful and most under-used structural lever in middle-market bond work. They control when principal can be paid back early — at the borrower's option, at the bondholder's option, or by mandatory operation of the indenture. Every redemption provision is an option, and every option has value that gets priced into the bond at issuance. A banker who designs redemption provisions thoughtfully can capture 10-50 basis points of spread on a deal compared to a banker who pulls a template.

Redemption gets its own dedicated silo (Silo 6 — Calls, Puts, and Optionality) where the full treatment lives. What follows here is the mechanical inventory at the anatomy level.

### **Optional Redemption (Borrower's Call)**

The borrower has the right (not the obligation) to redeem some or all of the bonds before maturity at a defined call price on or after a defined call date. The classic call structure is non-call-X then callable at par — for example, non-call-10 with par call thereafter, meaning the borrower cannot call until year 10, then can call any time at par. Variations include callable at a premium (e.g., 102 declining to 100 over five years), callable on specific dates (one-time call windows), and make-whole call (callable any time at a price that compensates the bondholder for the present value of remaining cash flows at a reference rate).

### **Mandatory Redemption**

The borrower must redeem bonds when defined conditions occur. Sinking fund redemption (scheduled in advance) retires portions of the issue periodically. Extraordinary mandatory redemption is triggered by events like loss of tax-exempt status, condemnation of the financed project, casualty loss, or default. The trigger is in the indenture; the obligation to call is not optional.

### **Bondholder Put**

The bondholder has the right to require the borrower to redeem at par (or a defined price) at the bondholder's option. Hard puts are unconditional and on specific dates. Soft puts are conditional on events (rating change, change of control, certain covenant breaches). VRDOs and tender option bonds have effectively continuous puts supported by liquidity facilities.

### **Refunding**

Not technically a redemption provision in the bond itself, but the operational mechanism by which a borrower uses new bonds (the refunding bonds) to retire old bonds (the refunded bonds). Advance refunding (issuing new bonds more than 90 days before the old bonds' call date) and current refunding (within 90 days) have different tax-exempt implications. The Tax Cuts and Jobs Act of 2017 eliminated advance refunding of tax-exempt bonds with tax-exempt bonds, which radically changed the refunding playbook for municipal issuers.

## **1.5 Security — What Backs the Bond**

Bonds vary enormously in what stands behind them. The security structure determines the rating, the buyer pool, the pricing, and what happens in default. A bond's security is the second-most-important structural decision after the redemption design.

### **Unsecured Corporate**

The bond is a general claim on the borrower's assets and cash flow, ranking pari passu with other unsecured creditors. No specific collateral. Pricing reflects the borrower's general credit. Most large-cap investment-grade corporate bonds are unsecured. Middle-market corporate bonds are rarely unsecured — at this size, buyers want collateral.

### **Senior Secured**

The bond has a first-priority security interest in specified collateral. The collateral can be specific assets (a mortgaged property, equipment, inventory) or substantially all of the borrower's assets ('all-asset lien'). In default, secured bondholders are paid from collateral proceeds before unsecured creditors. Rating uplift for senior secured vs. unsecured can be one to three notches depending on collateral quality and coverage.

### **Revenue Bonds**

Common in muni and project finance. The bond is secured by specified revenues — toll revenues, water and sewer charges, hospital patient revenues, hotel room receipts. Bondholders look only to the pledged revenue stream; they have no claim on the issuer's general fund or other assets. The strength of the pledged revenue determines the rating. Many of Nest's target deals will be revenue bonds because the structure isolates bondholder risk to the project's own cash flow.

### **General Obligation (GO)**

Municipal-specific. Backed by the full faith and credit and taxing power of the issuer. The strongest muni credit because the bondholders have a claim on the entire taxable resource of the issuing entity. Nest will rarely originate GO bonds (those are typically self-issued by municipalities) but will encounter them in market context.

### **Conduit Revenue Bonds**

The structural workhorse for middle-market private-purpose financings. A municipal conduit issuer issues bonds whose proceeds are loaned to a private borrower (the obligor). The conduit issuer is not on the credit — the bond is secured by the obligor's loan payment obligation and any collateral the obligor pledges. The conduit's role is to provide the tax-exempt issuance mechanism (where eligible) and the administrative platform. The conduit is paid an issuance fee and an annual administration fee but takes no credit risk.

### **Securitization Bonds**

The bond is secured by a defined pool of assets (loans, receivables, leases) and the cash flows those assets generate. Bondholders' recourse is to the pool, not to the originator. Used in mortgage-backed, asset-backed, CLO, and other structured finance. Outside Nest's core focus but worth knowing when adjacent.

## **1.6 Covenants — What the Borrower Promises**

Covenants are the operating restrictions and reporting obligations that bind the borrower for the life of the bond. They get their own full silo treatment (Silo 7 — Covenants and Compliance). At the anatomy level, the inventory is:

Financial covenants — quantitative tests the borrower must meet (DSCR, leverage, debt yield, additional bonds tests, rate covenants)

Affirmative covenants — things the borrower must do (maintain insurance, pay taxes, deliver financials, maintain corporate existence)

Negative covenants — things the borrower cannot do without consent (additional debt, liens, asset sales, dividends, related-party transactions, fundamental changes)

Reporting covenants — what gets delivered to whom and when (annual audits, quarterly statements, monthly compliance certificates, continuing disclosure filings)

Operational covenants — sector-specific obligations (occupancy minimums for housing, enrollment minimums for charter schools, licensure maintenance for healthcare)

Anti-dilution covenants — protect bondholders from structural subordination by limiting additional debt at the borrower or affiliated levels

Covenant design is one of the most under-appreciated craft areas in middle-market bond work. Too loose and the bond can't be sold or gets a punishing pricing penalty. Too tight and the borrower trips the covenants in normal operating fluctuations, triggering events of default for no real reason and creating headaches that consume banker time and erode the relationship. The art is in the cushions — setting covenant thresholds with enough margin above expected operating performance that normal volatility doesn't trip them, while tight enough that real deterioration is captured early enough to act.

## **1.7 Remedies — What Bondholders Can Do If the Borrower Breaches**

Every indenture contains a remedies section that defines what counts as an Event of Default, who has standing to declare it, what the consequences are, and how bondholders can collect. The remedies architecture is what makes the covenants real — covenants without remedies are aspirations. Remedies are typically:

Acceleration — declaring all principal immediately due and payable upon default

Trustee action — the trustee, acting on instructions from a defined majority of bondholders, can sue, foreclose on collateral, take possession of pledged assets, or pursue other contractual remedies

Receivership — in extreme cases, a court-appointed receiver takes operational control of the obligor or the pledged project

Specific performance — court order requiring the borrower to perform a specific obligation

Cumulative remedies — bondholders can pursue any or all available remedies in parallel

Cure periods and grace periods are negotiated heavily. A 30-day cure period for a payment default vs. a 60-day cure period changes the effective bondholder protection materially. Material adverse change clauses, cross-default provisions (default under another debt triggers default here), and bankruptcy provisions are the most consequential. Nest's structuring agents will treat the remedies section with the same care as the covenants section — they are two halves of the same protection.

## **1.8 Reserves — The Cash Buffer Architecture**

Reserves are pools of cash held by the trustee for defined purposes, sourced either from bond proceeds at issuance, from operating cash flow over time, or from a combination. Reserves are the most concrete form of bondholder protection — covenants signal problems, but reserves actually pay the bonds when operating cash flow can't. Every reserve gets defined in the indenture with: (a) initial funding amount and source, (b) minimum balance requirement, (c) replenishment mechanism if drawn, (d) permitted uses, (e) release mechanism at maturity or under defined conditions, (f) investment restrictions on how the reserve cash is held.

The major reserve types in middle-market bond work are:

Debt Service Reserve Fund (DSRF) — typically sized at maximum annual debt service (MADS); first call if operating cash flow falls short of debt service

Capitalized Interest (Cap-I) — funds interest payments during the construction or ramp-up period before the project generates cash flow

Replacement and Repair Reserve (R&R) — funds long-term capital maintenance; typical sizing is $200-$500 per unit per year for multifamily, varies by asset class

Operating Reserve — funds the project's working capital cushion; typically 3-6 months of operating expenses

Insurance and Tax Escrow — funds collected from operating cash flow to pay insurance premiums and property taxes when due

Rebate Fund — for tax-exempt bonds, holds the IRS arbitrage rebate liability

Surplus Fund — receives excess cash flow after all senior obligations met; available for defined uses (additional reserves, redemption, equity distribution per the waterfall)

Construction Fund — holds bond proceeds during construction, released to the borrower against draw requests

Costs of Issuance Fund — pays the upfront fees from bond proceeds at closing

The full waterfall design — the order in which cash flows from the obligor get applied to each reserve, debt service, operating expenses, and surplus — is the elegant heart of every well-structured bond. The waterfall is what makes a 7%-yielding revenue stream into a 4.5%-yielding investment-grade bond, because the waterfall ensures that even when revenue falls 30%, bondholders get paid before equity, before operators, before any party except contractually senior claims.

## **1.9 Credit Enhancement — Outside Support**

When the underlying credit is not strong enough to achieve the target rating or pricing, the structure can be enhanced by an outside party. The bond effectively borrows the credit of the enhancement provider. Enhancement is a separate full silo (Silo 9 — Credit Enhancement) and is covered there in depth. At the anatomy level, the inventory is:

Letter of Credit (LOC) — a bank guarantees debt service; bond rating links to the bank's rating; fee paid annually to the bank

Financial Guaranty Insurance (Bond Insurance / Surety Wrap) — a monoline insurer guarantees debt service; bond rating links to the insurer's rating; premium paid upfront or annually

Moral Obligation Pledge — a government entity (typically a state HFA) pledges to seek appropriation to support the bonds if the obligor defaults; not legally binding but practically supportive of rating

State Intercept — a state agency commits to intercept state aid otherwise payable to the obligor and redirect it to debt service if needed (common in school district financings)

Parent or Corporate Guarantee — a parent company guarantees the obligor's payments

Sponsor Personal Guarantee — the individual sponsor personally guarantees; rare in bond context, common in adjacent loan products

USDA / HUD / Other Federal Guarantee — federal program-specific credit support

Cash Collateral — segregated cash held by the trustee that is available to pay debt service if needed (this is the 'cash secured' structure that came up earlier in conversation — rare but real)

## **1.10 Tax Treatment — Tax-Exempt vs. Taxable**

US municipal bonds carry a federal income tax exemption on interest paid to bondholders, provided the bonds meet IRS qualification rules. The exemption is the entire reason muni bonds exist as a separate market with separate dynamics. A tax-exempt bond can pay a coupon 100-300 basis points lower than an economically identical taxable bond and still produce a higher after-tax yield to the buyer. That subsidy is real money to the borrower — on a $50 million 30-year bond, the savings vs. a taxable equivalent can be $15-$30 million over the bond's life.

Tax exemption is not automatic. The bonds must be issued by or on behalf of a state or local government for a public purpose. Conduit issuance lets private borrowers access the exemption for qualifying purposes (501(c)(3) charitable, certain qualified small issue manufacturing, multifamily housing meeting affordability requirements, certain student loan and mortgage revenue bonds, certain exempt facility purposes). Each category has its own rules — Nest's structuring agents need to know all of them.

Maintaining the exemption over the bond's life requires ongoing compliance — limits on private use of bond-financed assets, arbitrage yield restrictions, rebate calculations, restrictions on refunding mechanics. Loss of exemption is catastrophic — the bonds become taxable retroactively and the borrower faces massive penalties. This is why the Tax Regulatory Agreement is one of the most heavily negotiated documents at issuance and why tax compliance is a recurring administration responsibility for the life of the bond.

Taxable bonds are simpler in tax terms. They're just bonds. Interest is taxable income to the bondholder, deductible to the borrower (subject to interest deductibility limits under IRC §163(j)). Taxable bonds also avoid the conduit issuance and qualified-purpose restrictions, so they're available for any borrower for any purpose. Nest will originate both tax-exempt and taxable bonds depending on what the deal qualifies for and what the borrower's economics support.

## **1.11 The Six Things, Visualized as a Bond's Life Cycle**

Putting the anatomy together: a bond at any moment in its life is the intersection of all six structural decisions, expressed as cash flows and rights. From issuance to maturity, the bondholder receives coupon payments on schedule, supported by the borrower's operating cash flow and protected by the reserves, covenants, and remedies. If the credit deteriorates, the covenants signal it; if the credit fails, the reserves and remedies kick in. If interest rates move, the redemption provisions create optionality for the borrower or the bondholder. If the borrower wants to grow, the additional bonds test and lien restrictions govern what new debt is possible. At maturity, principal returns — unless redemption provisions have already returned it earlier.

Every Nest structuring engagement is a series of decisions about each of the six things, calibrated to the specific deal's cash flow profile, the sponsor's strategy, the rating target, the buyer pool, and the market window. The decisions are not independent — they interact. A weaker covenant package can be offset by a larger DSRF. A more aggressive amortization schedule can be supported by stronger credit enhancement. Tighter call protection can produce wider coupon, which can be partially offset by premium pricing structure. The interaction effects are the art.

## **1.12 Quick Reference — Silo 1**

### **Key Terms**

**Par** — face amount of the bond; what the borrower owes at maturity

**Coupon** — periodic interest rate paid on par

**Maturity** — date principal is due

**Bullet bond** — 100% of principal repays at maturity

**Serial bond** — principal repays in scheduled portions across multiple maturity dates

**Sinking fund** — mandatory periodic principal redemption before stated maturity

**CAB (Capital Appreciation Bond)** — interest accrues into principal; both paid at maturity

**VRDO (Variable Rate Demand Obligation)** — variable rate bond with bondholder tender right

**Optional redemption / call** — borrower's right to redeem early

**Mandatory redemption** — required redemption upon defined trigger

**Make-whole call** — call at a price that compensates bondholder for remaining cash flow at a reference rate

**Par call** — call at face value (100)

**Bondholder put** — bondholder's right to require redemption at defined price

**Refunding** — issuing new bonds to retire old bonds

**DSRF (Debt Service Reserve Fund)** — trustee-held reserve covering shortfalls in debt service

**Capitalized Interest (Cap-I)** — bond-proceed reserve funding interest during construction/ramp

**Conduit issuer** — government entity that issues bonds on behalf of private obligor; not on credit

**Revenue bond** — secured by specified revenue stream, not general obligation

**Tax-exempt** — interest exempt from federal income tax under IRS rules

### **Core Formulas**

**Coupon payment —** Coupon Rate × Par × Period Fraction (e.g., 5% × $1,000 × 0.5 = $25 semi-annual)

**Aggregate par —** Sum of all individual bond face amounts in the issue

**Net proceeds to borrower —** Aggregate Par − Underwriter Discount − Original Issue Discount (or + Original Issue Premium) − Costs of Issuance

### **Documents Referenced**

Indenture (or Trust Indenture) — the master document defining every structural feature

Loan Agreement — conduit-issuer-to-borrower document mirroring indenture obligations

Tax Regulatory Agreement — for tax-exempt bonds, locks in qualification requirements

Bond Purchase Agreement — issuer-to-underwriter document governing the placement

# **SILO 2 — THE PLAYERS**

Every bond transaction is a coordinated effort across a dozen or more distinct counterparties, each with a specific role, a specific fee, a specific approval authority, and a specific set of incentives. A banker who cannot name every player and explain each one's job is operating blind. This silo walks the entire cast — issuer, obligor, underwriter, trustee, bond counsel, disclosure counsel, rating agency, financial advisor, conduit issuer, paying agent, registrar, verification agent, escrow agent, construction monitor, feasibility consultant, market study consultant, auditor, insurance broker, surety, BD partner, sponsor's counsel — and for each player explains what they do, what they cost, how they're selected, and how Nest interacts with them.

The players are not interchangeable. Choosing the right bond counsel for a healthcare conduit deal is a different decision than choosing one for a corporate 144A. Choosing US Bank as trustee for a complex VRDO is a different decision than choosing Wilmington Trust for a vanilla revenue bond. Choosing Moody's vs. S&P as the primary rating is a different decision based on the sector. Player selection is structural — it shapes the deal's execution, its rating outcome, and its pricing.

## **2.1 The Issuer**

The legal entity that issues the bonds and is named on the bond itself as the obligor of payment. The issuer signs the bond, signs the indenture, and signs the bond purchase agreement. The issuer is the borrower of record in market terms.

In a corporate bond, the issuer is the corporation borrowing the money. In a municipal bond, the issuer is the state, city, county, school district, or authority. In a conduit bond (the structural workhorse for Nest's private-purpose financings), the issuer is a government entity (conduit issuer) that issues the bonds and loans the proceeds to the private obligor — the conduit is on the bond, the obligor is on the loan.

From a Nest engagement perspective, the issuer is usually the client (for direct corporate or government deals) or one step removed from the client (for conduit deals where the obligor is the client and the conduit is engaged separately). Either way, the issuer's signature is what makes the bond legal. The issuer's authority to issue must be verified, the issuer's resolutions authorizing the bond must be passed, and the issuer's officers must sign the closing documents.

## **2.2 The Obligor (Conduit Deals Only)**

In a conduit transaction, the obligor is the private entity that actually owes the debt. The conduit issuer issues the bonds and loans the proceeds to the obligor via a Loan Agreement. The obligor's payment obligation under the Loan Agreement is what backs the bonds — the conduit is not on the credit.

For Nest's purposes, when working a conduit deal, the obligor is the substantive client. The obligor is who pays Nest's fees, who provides the project information, who signs the borrower documents, who pledges collateral, and who is responsible for performance. The conduit is engaged to provide the issuance vehicle and the administrative platform — important, but procedural.

The obligor structure also defines the legal hierarchy. The bondholder's contractual claim runs through the indenture to the conduit issuer (their direct counterparty) and then through the Loan Agreement and any pledged collateral to the obligor (the source of cash flow). When the obligor defaults, the trustee acts on behalf of bondholders to enforce both the Loan Agreement and the security documents.

## **2.3 The Underwriter**

The investment bank (or syndicate of investment banks) that purchases the bonds from the issuer and resells them to investors. The underwriter is the placement engine. In a negotiated underwriting (typical for Nest's deal types), the underwriter is engaged early in the process, helps with structuring, runs the marketing, books the orders, prices the deal, and takes the bonds onto its balance sheet at pricing for resale to investors over the following days. In a competitive underwriting (more common for municipal GO bonds), the issuer publishes the terms and accepts the lowest-yield bid.

The underwriter is compensated by the underwriter's discount — the difference between the price at which the underwriter buys from the issuer and the price at which it resells to investors. On a $50M middle-market bond, the discount typically runs 1.0% to 2.5% of par, or $500K to $1.25M. The discount is split among the underwriter's components: the management fee (compensates the lead bank for structuring and running the deal), the underwriting fee (compensates the syndicate for the underwriting commitment), and the selling concession (compensates the banks that actually place bonds with investors). The split is typically 20/20/60 — most of the money goes to the people actually selling.

For Nest, the underwriter relationship is mediated through the BD partner. Nest does the structuring, the document drafting, the project management, the rating work. The BD partner is the underwriter of record, takes the bonds onto its books, places them with its institutional buyer relationships, and pays Nest a share of the underwriter discount based on the negotiated partnership split. The economics matter: a 60/40 split favoring Nest on a $1M underwriter discount means $600K to Nest and $400K to the BD partner, with each party doing roughly their share of the work the split implies.

### **Underwriter Selection**

In most negotiated middle-market bond engagements, the issuer (or obligor) selects an underwriter via a short RFP process. Three to five firms submit proposals describing their team, their distribution capability, their pricing view, and their fees. The issuer selects based on fit. For Nest's deals, the selection should always include Nest's BD partner — if the issuer doesn't initially include the partner, Nest brings them into the process. Where Nest is the financial advisor on the deal (a separate role from underwriter — see below), the FA helps the issuer run the RFP.

### **Co-Managers and Syndicate**

On deals above approximately $25M, the underwriting is typically syndicated — one lead bank (the senior or book-running manager) plus one or more co-managers. The co-managers participate in the underwriting commitment, add their distribution capability, and earn a share of the discount. On Nest deals, the BD partner can serve as the senior manager or as a co-manager depending on relative distribution strength. Smaller co-manager roles can be filled by regional firms that bring specific buyer relationships (e.g., a Texas-based regional firm on a Texas housing deal).

## **2.4 The Trustee**

The corporate trust bank that holds the indenture, administers payments, and enforces the bondholders' rights. The trustee is the bondholders' contractual representative. The trustee receives debt service from the obligor (or from the conduit issuer's collection of obligor payments), holds the reserves, processes draw requests from construction funds, receives covenant compliance certificates, monitors for defaults, and acts on bondholders' instructions in the event of default.

The trustee does not make credit decisions. The trustee does not negotiate amendments without bondholder direction. The trustee is mechanical and procedural — a fiduciary who follows the indenture's instructions and the bondholders' direction. Trustees protect themselves with extensive indemnification and exculpation language because they are constantly at risk of being sued by bondholders or borrowers for actions taken under the indenture.

### **Trustee Selection**

Trustees are corporate trust departments of banks. The major players in US municipal and corporate bond trustee work are US Bank, BNY Mellon, Wilmington Trust, UMB Bank, Zions Bank, Computershare, and Regions Bank. Each has sector specializations and regional strengths. US Bank dominates muni; BNY Mellon dominates corporate; Wilmington has a strong specialty book; UMB and Zions have strong middle-market positions.

Trustees are selected via RFP. The trustee market is competitive on fee. Trustee fees on a $50M deal are typically $5K to $15K acceptance fee plus $5K to $12K annual administration plus various per-transaction fees (draw processing, redemption processing, registration of bonds, etc.). The Nest platform should bid trustees on a per-deal basis and capture the bids in the rule library — over time, the database knows which trustees bid which fees for which deal types, which streamlines future selection.

### **The Trustee's Operational Role During the Bond's Life**

Once the bond is issued, the trustee runs the operational mechanics. They hold the DSRF in defined permitted investments. They receive monthly or semi-annual debt service payments from the obligor and remit to bondholders on the payment date through the paying agent. They receive draw requests from the construction fund, verify the request meets indenture conditions, and release funds. They receive covenant compliance certificates and file them. They receive material event notices and forward to bondholders. They sit through the bond's entire life as the operational center of the structure.

This is the part of the bond life that Nest's administration platform increasingly automates. The trustee remains the legal fiduciary, but the operational workload of draw processing, compliance certification, and continuing disclosure can be substantially run through Nest's platform with the trustee doing the official sign-off rather than the mechanical work. That arrangement reduces trustee fees for the obligor and increases Nest's administration fees — both parties benefit.

## **2.5 Bond Counsel**

The law firm that issues the legal opinion on the bonds. For tax-exempt bonds, bond counsel's opinion that the interest is exempt from federal income tax is what makes the bonds saleable at tax-exempt yields. For all bonds, bond counsel's opinion that the bonds are validly issued, binding obligations of the issuer is what gives bondholders contractual certainty.

Bond counsel drafts the indenture, drafts the loan agreement (for conduit deals), drafts the tax regulatory agreement (for tax-exempt), reviews the official statement, negotiates with the issuer's counsel and the obligor's counsel, and signs the legal opinion at closing. The bond counsel opinion is the single most important legal document at closing — without it, the bonds cannot be issued.

### **Major Bond Counsel Firms**

The municipal bond counsel market is dominated by a defined set of specialist firms. The major firms include Orrick, Hawkins, Squire Patton Boggs, Norton Rose, Mintz, Kutak Rock, Chapman, Greenberg Traurig, Locke Lord, and Holland & Knight. Many regional and state-specific specialist firms also serve their local markets. Sirote (Alabama), Lewis Roca (Arizona), Stradling (California), and others have strong state-specific practices. The corporate bond market draws on broader law firm practices — the big law firms (Skadden, Wachtell, Latham, Davis Polk, Sullivan & Cromwell, Cravath) handle large corporate bond issuances.

### **Bond Counsel Fees and Selection**

Fees on a middle-market bond range from $75K to $250K depending on complexity, with conduit deals at the higher end. Selection is typically by the issuer or obligor, often with influence from the underwriter and the conduit issuer (which usually has a list of approved bond counsel firms). For Nest, building relationships with three to five bond counsel firms that cover the firm's expected sector mix is foundational — those firms become the standing relationships that get the work consistently.

Nest's leverage with bond counsel is twofold. First, Nest delivers cleaner first drafts than any banker the bond counsel has worked with, because Nest's platform produces indenture drafts from a precedent library calibrated to deal type. This cuts bond counsel's review hours dramatically. Second, Nest brings consistent volume — once a bond counsel relationship is established, Nest sends them five to ten deals a year instead of one. Both of these dynamics make Nest a preferred client for the bond counsel firm, which translates into faster turnaround and more flexibility on fees.

## **2.6 Disclosure Counsel**

On larger deals (typically $50M+) and especially on public registered offerings, disclosure counsel is a separate firm from bond counsel. Disclosure counsel's job is to ensure the official statement (the offering document) is accurate, complete, and not misleading — preventing claims under federal securities laws. Disclosure counsel reviews the financial information, the risk factors, the project description, and the offering structure for completeness. They sign a separate legal opinion at closing covering disclosure compliance.

On smaller deals, bond counsel often plays both roles (sometimes called 'dual counsel' or 'combined counsel'). On larger deals, the issuer or obligor benefits from separation because it provides independent verification of disclosure. Disclosure counsel fees on a middle-market deal are typically $40K to $125K when engaged separately.

## **2.7 The Rating Agency / Agencies**

The nationally recognized statistical rating organizations (NRSROs) that assign credit ratings to bonds. The dominant US NRSROs are Moody's Investors Service, S&P Global Ratings, Fitch Ratings, Kroll Bond Rating Agency, and DBRS Morningstar. Each agency has its own methodology, its own analytical approach, and its own credit committee. The ratings they assign are the single most important pricing input — the difference between an A rating and a BBB rating on a 30-year bond can be 75-150 basis points of coupon.

On most middle-market deals, the issuer obtains one or two ratings. One rating may be sufficient for placement to certain buyer pools (especially insurance company portfolios that have internal credit work). Two ratings broaden the buyer pool and tighten pricing. Three ratings are typical only for large, complex, or high-profile transactions.

### **Rating Agency Selection**

Selection by sector preference. Moody's tends to dominate municipal essential service revenue bonds and public finance generally. S&P has strong corporate bond and project finance practices. Fitch has strong infrastructure and structured finance positions. Kroll has built a meaningful position in middle-market and structured finance over the last fifteen years, often providing more responsive service to smaller issuers than the older big two. DBRS has strong Canadian and certain US niches.

The agencies each publish methodology papers for each sector they rate. The methodology is the rule book — every rating decision must be traceable to methodology application. For Nest, the rating agency engagement is where the platform's continuous learning shows its value most clearly. The platform reads every published methodology, ingests every rating report the agency has issued in the sector, identifies the patterns of what moves ratings up and down, and produces rating presentations calibrated to maximize the achievable rating for the deal. This is not gaming — it's understanding what the agency's methodology actually rewards and structuring accordingly.

### **Rating Agency Fees**

Initial rating fees on a middle-market deal typically run $75K to $200K per agency, plus annual surveillance fees of $15K to $50K per agency over the bond's life. The fees are paid by the obligor as part of the costs of issuance. On a two-rated deal, total rating costs over the life of a 30-year bond can be $1M+, which is significant. Selecting the right agencies — and minimizing to one rating where the buyer pool supports it — is a meaningful cost optimization.

### **The Rating Process**

Standard rating process: (1) engagement letter signed, fee paid; (2) issuer/obligor delivers diligence package — financial statements, projections, market study, project documents, sponsor track record, management bios; (3) pre-rating call between the analyst and the obligor's management to walk the deal; (4) formal rating presentation, typically a two-hour management meeting where management presents the project and answers analyst questions; (5) analyst drafts the rating recommendation memo; (6) rating committee meets, votes, assigns the indicative rating; (7) indicative rating letter issued, subject to final documentation; (8) post-issuance surveillance — annual review, periodic update calls, response to material events.

The rating committee is the decision-making body. Composition varies by agency and by sector — typically four to eight senior analysts. The committee dynamics are real — different analysts on the committee have different sector views, different risk tolerances, different worldview signatures. A senior banker who knows the committee composition for the relevant sector adjusts the presentation accordingly. Nest's platform makes this systematic by maintaining a database of committee composition and historical rating patterns by sector and by analyst.

## **2.8 Financial Advisor (Municipal Advisor)**

On municipal and conduit deals, the issuer (or in some cases the obligor) engages a financial advisor — also called a municipal advisor when MSRB-registered. The FA's job is to represent the issuer's interest in structuring decisions, evaluating underwriter proposals, negotiating with the underwriter on pricing and structure, reviewing the official statement, and providing general capital markets advice. The FA is the issuer's fiduciary, distinct from the underwriter (who is the issuer's counterparty in the bond sale).

Dodd-Frank established the municipal advisor regulatory regime, requiring MSRB registration and imposing fiduciary duties. The advisor must be registered if they provide advice to a municipal entity regarding the issuance of municipal securities. This regime created a distinction between 'underwriter as advisor' and 'independent municipal advisor' — the IRMA exception allows the underwriter to provide advice to an issuer who has retained an independent FA, without the underwriter itself becoming a regulated advisor.

### **Where Nest Sits**

This is the key positioning question for Nest's regulatory architecture. Nest can play the financial advisor role on conduit deals where the obligor is the client — the FA role does not require a broker-dealer license but does require MSRB municipal advisor registration if the advice relates to municipal securities issuance. Acquiring MA registration is the lighter-weight regulatory path than becoming a registered broker-dealer. With MA registration, Nest can charge structuring and advisory fees directly to the obligor without going through a BD partner. The BD partner then handles the actual placement (a separate engagement) for the underwriter spread.

This is exactly the bifurcated structure that lets Nest operate at scale without bearing the full broker-dealer compliance burden. Nest is the municipal advisor and structurer; the BD partner is the underwriter and placer; the BD partner's compliance infrastructure covers the regulated placement activity; Nest's MA registration covers the advisory activity.

**REGULATORY STRUCTURE:** Nest = MSRB-registered Municipal Advisor for muni / conduit deals + BD Partner = FINRA-registered broker-dealer for placement. This bifurcation lets Nest capture structuring and advisory fees directly without bearing the full BD compliance load, while still accessing institutional placement through the partner's licensed platform.

On taxable corporate deals (non-municipal), the FA role is less regulated but the same dynamics apply. Nest can act as financial advisor to the issuer, with the BD partner serving as placement agent.

### **Financial Advisor Fees**

FA fees on middle-market deals typically run $50K to $250K, structured as a flat fee, a basis points fee on par, or a combination. Nest's positioning is to charge a structuring fee that compensates for the full work of structuring, document production, rating coordination, and execution management — typically the largest single fee Nest captures per deal at issuance.

## **2.9 Conduit Issuer**

The government entity that issues bonds on behalf of a private obligor for a qualifying public purpose. The conduit takes no credit risk, provides the issuance vehicle and the tax-exempt access (where applicable), and is paid an issuance fee and annual administration fee.

### **Major Conduit Issuer Categories**

State Housing Finance Agencies (HFAs) — multifamily affordable housing, single-family mortgage, occasionally healthcare adjacent

State Health and Educational Facilities Authorities — hospitals, senior living, charter schools, colleges

State Higher Education Facilities Authorities — colleges and universities

State Industrial Development Authorities — manufacturing, certain qualified small issue

State Public Power Authorities — utility and energy infrastructure

County and Local Industrial Development Bonds — local economic development

State Bond Banks — pooled financing for smaller municipal borrowers

Special-Purpose Public Authorities — specific project authorities (airport, port, transit, water)

### **Conduit Selection**

Three considerations: (1) eligibility — does the conduit issuer have authority and willingness to issue for this specific project; (2) speed and reliability — some conduits are run by professional staff with consistent approval processes, others are politically driven and unpredictable; (3) cost — fees vary substantially. The Nest platform maintains a database of every meaningful conduit issuer in the US with eligibility criteria, approval process, fee schedule, and historical responsiveness.

### **Conduit Fees**

Issuance fees typically 25-100 bps of par, paid at closing. Annual administration fees of $5K-$50K depending on the conduit and the deal size. Some conduits also have application fees, public hearing fees, and various transaction fees. Total conduit cost on a $50M deal is typically $150K-$500K over the life of the bond.

## **2.10 Paying Agent and Registrar**

The bank that actually processes payments to bondholders and maintains the bond registry. On most US deals, the paying agent and registrar role is held by the trustee — the trustee bank uses its existing settlement infrastructure to make payments to bondholders through DTC. On some larger or more complex deals, a separate paying agent (often Computershare or Equiniti) handles payments while a different bank serves as trustee. Bonds held through DTC are paid through the DTC system to the underlying institutional accounts; physical bonds (rare) are paid directly to the registered holder.

Paying agent fees are typically bundled into the trustee fee for most deals. When separately engaged, fees run $5K-$15K annually plus per-payment processing fees.

## **2.11 Verification Agent**

Engaged on refunding transactions and on transactions involving escrow defeasance. The verification agent — typically a CPA firm — verifies that the escrow established to defease the refunded bonds contains sufficient government securities to pay the debt service on those bonds through their call or maturity dates. The verification is a precondition to tax-exempt treatment of the refunding bonds and provides bondholders with assurance that the refunded bonds will be paid as scheduled.

Verification agent fees are typically $15K-$40K per refunding. Major firms include Robert Thomas CPA, Causey Demgen Moore, and Bingham Arbitrage Rebate Services. Selection is straightforward — the universe is small and specialized.

## **2.12 Escrow Agent**

In refunding transactions, an escrow agent (typically the trustee or another corporate trust bank) holds the escrow government securities until they are used to pay the refunded bonds. The escrow agent's job is mechanical — hold the securities, collect their interest and principal, and use those amounts to pay the refunded bonds' debt service as scheduled. Fees are typically bundled into the trustee role or charged at $5K-$15K per escrow.

## **2.13 Construction Monitor / Independent Engineer**

On construction bonds (where bond proceeds fund construction of the financed asset), a construction monitor verifies that each draw request reflects work actually performed and that the project remains within budget and on schedule. The construction monitor is typically an engineering firm (for infrastructure) or a construction consulting firm (for buildings). They visit the site monthly, review the contractor's pay applications (AIA G702/G703 forms), confirm completed work, and certify the draw to the trustee. Without the monitor's certification, the trustee will not release construction funds.

Construction monitor fees are typically $25K-$100K per project, depending on size and duration. The monitor is engaged at the start of construction and remains through completion.

Nest's platform handles the administrative side of the draw process — receiving the contractor's documents, validating the math, checking lien waivers, reconciling to the budget, and preparing the certified draw package — while the engineering monitor handles the physical site verification. The two roles are complementary. The platform reduces the monitor's administrative burden and gives the obligor faster draw turnaround.

## **2.14 Feasibility Consultant**

On project bonds where the project is new (greenfield construction, new market entry, new business model), a feasibility consultant produces a feasibility study analyzing the project's expected revenue, expenses, market position, and credit characteristics. The feasibility study is included in the offering document and is heavily relied upon by the rating agencies and by buyers.

Different sectors have specialist feasibility consultants. Healthcare uses firms like Kaufman Hall, Ponder & Co., and ECG Management Consultants. Senior living uses firms like Dixon Hughes Goodman, PMD Advisors, and CliftonLarsonAllen. Charter schools use Public Impact, Bellwether Education, or sector-specific advisors. Multifamily housing uses firms like Novogradac for affordable housing or specialty market study firms for market-rate.

Feasibility study fees range from $50K to $250K depending on complexity and sector. The study is one of the most expensive line items in the cost of issuance but is often essential to achieving the target rating. A high-quality feasibility study can support a rating uplift of one to two notches, worth substantially more in pricing than the study cost.

## **2.15 Market Study Consultant**

Distinct from a feasibility study but often paired with it. A market study analyzes the specific market the project will operate in — competing supply, demographic demand, pricing benchmarks, market growth. For real estate deals (multifamily, office, retail, industrial, hospitality, senior living), the market study is foundational. CBRE, JLL, Cushman & Wakefield, and Newmark have institutional market study practices. Specialty firms serve specific sectors. Costs typically $25K-$75K.

## **2.16 Auditor**

Independent CPA firm that audits the obligor's financial statements. The auditor's role at issuance is twofold: (1) the audited financials are included in the offering document as the obligor's financial disclosure, and (2) the auditor signs a consent letter and a comfort letter providing comfort on the financial information presented.

The consent letter is the auditor's consent to inclusion of their audit report in the offering document. The comfort letter is broader — it provides negative assurance on selected financial information (subsequent events, interim financial data, statistical and operating data) that is included in the offering document but is not part of the audited financials. Comfort letter procedures are defined in AICPA standards (SAS 72).

For Nest's deal types, the obligor's existing audit firm typically continues. Audit fees are not directly related to the bond transaction — they're the obligor's standing audit cost. Consent and comfort letter fees are typically $15K-$50K incremental to the standing audit relationship.

## **2.17 Insurance Broker**

The obligor's insurance broker is engaged to confirm that all required insurance is in place at closing — builder's risk, property and casualty, general liability, business interruption where applicable, environmental where applicable, flood and earthquake where applicable. The broker also coordinates additional insured endorsements naming the trustee and the bondholders as required by the indenture. At closing, the broker provides certificates of insurance evidencing coverage.

On construction bonds, the broker also coordinates the performance and payment bonds from the contractor's surety. The broker doesn't underwrite the surety bonds — the contractor's surety company does — but the broker is the procurement coordinator.

Major specialty brokers in this space include Marsh, Aon, Willis Towers Watson, Lockton, USI, Brown & Brown, and Hub International. Regional and specialty brokers handle smaller and sector-specific deals. Broker fees are typically embedded in insurance premiums (commission-based) but can be fee-based on larger accounts.

## **2.18 Surety Companies**

Distinct from financial guaranty insurers (which wrap the bond itself) — surety companies provide performance and payment bonds for the construction contractor. The surety guarantees that the contractor will finish the job and pay subcontractors. Performance and payment bonds are required by virtually every indenture financing a construction project.

Major US surety companies include Travelers, Liberty Mutual, Zurich, CNA, Chubb, Hartford, Arch, and specialty markets including AmTrust and Old Republic Surety. The contractor's surety underwrites the contractor's bonding capacity based on the contractor's financials, track record, and the specific project. Surety bond cost is typically 0.5%-3% of contract value depending on contractor credit.

Nest's role with surety: confirming the contractor's bonding capacity is adequate to support the project, verifying the surety's rating (typically A.M. Best A- or better required by the indenture), capturing the surety bond forms in the closing binder, and monitoring renewal during construction.

## **2.19 BD Partner**

Nest's registered broker-dealer partner. The BD partner provides the FINRA-registered placement infrastructure that Nest itself does not hold. The partnership economics: Nest does the structuring, document production, rating work, and project management; the BD partner provides the placement license, supervisory infrastructure, principal review, and buyer relationships; both parties share the underwriter discount and the structuring fee per the negotiated split.

Selecting the right BD partner is one of the most consequential strategic decisions Nest makes. The wrong partner — too small, too distracted, lacking the right buyer relationships, lacking the right sector expertise — kneecaps the firm's execution. The right partner — hungry for deal flow, with senior bankers who actually move bonds, with a clean regulatory record, with willingness to integrate operationally with Nest's platform — multiplies the firm's capability.

### **BD Partner Target Profile**

Mid-tier broker-dealer with active municipal and / or corporate bond practice

FINRA membership in good standing, clean regulatory history

MSRB membership for muni capability

Senior bankers with 15+ years of direct placement experience

Active institutional buyer relationships across lifecos, bond funds, bank portfolios

Annual placement volume of $500M-$3B (large enough to be credible, small enough to want Nest's deal flow as meaningful)

Willingness to integrate with Nest's platform technically and operationally

Cultural alignment on execution quality and client experience

Compensation structure that aligns senior bankers' interest with the partnership

The Nest platform should maintain a target list of 15-25 candidate BD partners with detailed profiles of each, refreshed continuously based on market intelligence. The partnership conversation is one of the highest-priority strategic conversations Nest has in its first year of build.

## **2.20 Sponsor's Counsel**

The obligor's general corporate counsel — distinct from bond counsel, which represents the issuer or the bond transaction itself. Sponsor's counsel negotiates the loan agreement and security documents on the obligor's behalf, reviews the indenture for obligor protection, and handles any obligor-specific issues. On real estate deals, sponsor's counsel handles title, survey, mortgage documents, and any specific transfer or zoning issues. On corporate deals, sponsor's counsel handles entity authorization, capital structure issues, and obligor-side representation.

Sponsor's counsel fees typically run $50K-$150K on middle-market bonds, depending on complexity. Nest engages with sponsor's counsel as a working group member but does not select or direct them.

## **2.21 The Cast Visualized — Roles and Loyalties**

Putting the cast together: in any bond transaction, the players cluster into three loyalty groups.

Issuer/obligor side: the issuer, the obligor (on conduit deals), the financial advisor / municipal advisor (Nest in this role on most deals), sponsor's counsel, the auditor, the feasibility consultant, the market study consultant, the insurance broker. These parties work for the borrower.

Bondholder side: the trustee (after issuance — at issuance the trustee is appointed by the issuer but acts on behalf of bondholders), bond counsel (acting for the bond transaction itself, sometimes considered neutral but most often issuer-aligned), the rating agencies (paid by the issuer but loyal to their own analytical integrity).

Marketplace side: the underwriter / BD partner (intermediates between issuer and bondholders, owes duties to both but is functionally the seller), the paying agent and registrar (mechanical), the verification agent (technical).

A senior banker keeps the loyalties straight, treats each player according to their role, and never tries to extract from one party what should come from another. Nest's platform encodes the player relationships into the workflow so that document distribution, communication routing, and review cycles respect the loyalty structure.

## **2.22 Quick Reference — Silo 2**

### **Key Players Inventory**

**Issuer** — legal entity on the bonds

**Obligor** — substantive debtor in conduit deals

**Underwriter** — purchases bonds from issuer, resells to investors

**Trustee** — corporate trust bank; bondholder representative

**Bond Counsel** — law firm issuing legal opinion on validity and tax exemption

**Disclosure Counsel** — separate counsel on disclosure compliance (larger deals)

**Rating Agency** — Moody's, S&P, Fitch, Kroll, DBRS

**Financial Advisor / Municipal Advisor** — issuer's fiduciary; Nest in this role on most deals

**Conduit Issuer** — government entity issuing on behalf of private obligor

**Paying Agent / Registrar** — processes payments to bondholders

**Verification Agent** — CPA verifying escrow on refundings

**Construction Monitor** — engineering / construction firm certifying draws

**Feasibility Consultant** — sector specialist producing feasibility study

**Market Study Consultant** — analyzes market for the financed project

**Auditor** — independent CPA on financial statements

**Insurance Broker** — confirms required insurance in place

**Surety** — provides contractor's performance and payment bonds

**BD Partner** — Nest's registered broker-dealer placement partner

**Sponsor's Counsel** — obligor's general corporate counsel

### **Typical Fee Ranges on a $50M Middle-Market Deal**

**Underwriter Discount —** 1.0%-2.5% of par ($500K-$1.25M)

**Bond Counsel —** $75K-$250K

**Disclosure Counsel (when separate) —** $40K-$125K

**Rating Agency (per agency) —** $75K-$200K initial + $15K-$50K annual surveillance

**Trustee —** $5K-$15K acceptance + $5K-$12K annual + per-transaction fees

**Conduit Issuer —** 25-100 bps issuance fee + $5K-$50K annual

**Financial Advisor (when separate from Nest) —** $50K-$250K

**Verification Agent (refundings) —** $15K-$40K

**Construction Monitor —** $25K-$100K per project

**Feasibility Consultant —** $50K-$250K

**Market Study Consultant —** $25K-$75K

**Auditor Consent / Comfort Letter —** $15K-$50K incremental to standing audit

**Sponsor's Counsel —** $50K-$150K

### **Documents Each Player Signs at Closing**

Issuer / Obligor — Indenture, Loan Agreement (conduit), Tax Regulatory Agreement, Bond Purchase Agreement, Officer's Certificate, all security documents

Underwriter — Bond Purchase Agreement, Comfort Letter Reliance, DTC Letter of Representations

Trustee — Indenture acceptance, Trustee's Certificate of Authentication

Bond Counsel — Legal Opinion (validity, enforceability, tax exemption)

Disclosure Counsel — Disclosure Opinion (when separate)

Rating Agency — Indicative rating letter (delivered at closing as confirmation of rating)

Auditor — Consent Letter, Comfort Letter

Verification Agent — Verification Report (refundings only)

Sponsor's Counsel — Borrower's Counsel Opinion (entity authorization, no conflicts)

# **SILO 3 — THE END-TO-END WORKFLOW**

This silo is the operational rails. It walks the bond issuance lifecycle from a sponsor's first inquiry through the post-closing administration that runs for the bond's full life. Every stage has inputs, work product, counterparties engaged, deliverables produced, gateway decisions for human review, time required, and fees earned or paid. This is the firm's playbook, expressed as a process map.

The workflow is divided into thirteen stages. Stages zero through twelve cover the issuance lifecycle. Stage thirteen covers post-closing administration, which never ends as long as the bond is outstanding. Every Nest engagement runs through this workflow, modified for deal type, but anchored to the structure described here.

**THE WORKFLOW PRINCIPLE —** Every stage either gets automated by the platform, or it has a defined human gateway. There is no third category. Manual ad-hoc work is the enemy of scale. If something is not automated or gated, the platform has a gap to close.

## **3.1 Stage 0 — Inbound and Triage**

### **Inputs**

Sponsor reaches out through one of three channels: (1) direct inquiry via the Nest website or platform portal; (2) referral from an existing relationship — a BD partner, a bond counsel, a real estate broker, an accountant, a prior closed client; (3) outbound by Nest's business development effort. Sponsor provides a brief project description: asset class, location, project size, capital stack, timing, sponsor identity.

### **Work**

Triage agent runs the inquiry against hard disqualifiers: project size below minimum economic threshold (target $5M par minimum, sometimes flexible); asset class outside platform scope; sponsor regulatory issues (OFAC screen, SDN list, PEP screen, prior fraud or material litigation); jurisdiction issues (unauthorized states, sanctioned counterparties). The triage is fast — same-day for clean inquiries, flagged for human review on edge cases.

### **Counterparties Engaged**

Sponsor only at this stage. No external counterparties activated until the deal moves past triage.

### **Deliverables**

Sponsor either receives a portal invitation and onboarding package, or receives a courteous decline with the reason and any referral suggestions. Nothing in between — Nest does not lead sponsors along on deals that won't qualify.

### **Gateway**

Pass triage and sponsor moves to Stage 1. Fail triage and sponsor receives the decline. Edge cases (one disqualifier flag, otherwise clean) go to human review — Sean or Josh review and decide.

### **Time**

Same day for clean inquiries. 24-48 hours for flagged inquiries requiring human review.

### **Fees**

None. Stage 0 is unpaid intake.

## **3.2 Stage 1 — Document Ingestion**

### **Inputs**

Sponsor accesses the portal and begins uploading the diligence package. The platform requests an initial document list: project pro forma, market study or feasibility study (if available), sources and uses, organizational documents for the borrowing entity, sponsor PFS and tax returns, sponsor track record, prior project performance, project plan, contract documents (GMP for construction deals, leases for stabilized deals, offtake or revenue contracts where applicable), preliminary capital stack, target timing, target rating goal.

### **Work**

Ingestion agent classifies every uploaded document by type, OCRs scanned documents, parses structured documents (financial statements, rent rolls, leases), indexes everything in the deal database, and produces a Document Completeness Report identifying what's been received, what's missing, what's stale (older than acceptable thresholds for the document type), and what needs to be requested.

The platform builds an organized document index that maps every uploaded item to where it will be used downstream — feasibility study to rating presentation and offering document, audited financials to disclosure section, pro forma to underwriting agent, organizational documents to bond counsel package, etc. By the end of Stage 1, every document has a defined destination.

### **Counterparties Engaged**

Sponsor only. No external counterparties yet.

### **Deliverables**

Document Completeness Report delivered to sponsor with a specific list of missing documents and a target completion date. Initial document index built in the platform.

### **Gateway**

Once the document set is approximately 80% complete and the critical documents are received, the deal advances to Stage 2. The 20% gap is documented as follow-ups but does not block underwriting work from beginning.

### **Time**

Typically 1-2 weeks for the sponsor to upload an initial set. Continuous engagement as follow-up documents arrive.

### **Fees**

None. Stage 1 is unpaid setup.

## **3.3 Stage 2 — Sponsor Diligence**

### **Inputs**

Sponsor identity, principal identities, entity documents. Information runs in parallel with Stage 1 — sponsor diligence doesn't wait for documents to fully arrive.

### **Work**

Diligence agent runs: (1) background checks on every principal (criminal, civil, regulatory); (2) litigation searches across federal and state courts where principals or entities have operated; (3) prior project performance review — for every prior project, pull public records on debt service performance, sale or refinance outcomes, current operating status; (4) credit reports on principals; (5) PFS verification — bank statement reconciliation, REO schedule cross-check against tax returns and county records; (6) OFAC, SDN, PEP, foreign-political-exposure screens; (7) media and reputational search; (8) for sponsors with prior bond issuances, pull every prior bond's history from EMMA — operating performance, covenant compliance, material event filings.

### **Counterparties Engaged**

None — diligence runs against public records and platform-licensed databases.

### **Deliverables**

Sponsor Profile with green/yellow/red risk summary. Detailed findings on every diligence item. Specific flags for further investigation if any item shows concerns.

### **Gateway**

Green profile advances to Stage 3 automatically. Yellow profile triggers Sean/Josh human review — decision is whether to proceed with mitigants (e.g., enhanced reporting covenants, larger reserves, personal guarantees), to require additional sponsor documentation, or to decline. Red profile triggers automatic decline with explanation.

### **Time**

1 week, running in parallel with Stage 1 ingestion.

### **Fees**

None. Stage 2 is unpaid diligence.

## **3.4 Stage 3 — Project Underwriting**

This is the first major work stage and the first place Nest captures a fee.

### **Inputs**

Complete document set (or substantially complete with follow-ups in flight). Sponsor pro forma, market study or feasibility, financial statements, project documents, capital stack, and rating goal.

### **Work**

Underwriting agent rebuilds the project pro forma from scratch using the platform's house standards. The agent does not accept the sponsor's numbers at face value — it re-underwrites every line. Revenue assumptions are stress-tested against market benchmarks pulled from CoStar, REIS, STR, HUD Fair Market Rents, IBISWorld, or sector-specific data services depending on asset class. Expense ratios are benchmarked against asset-type peer set drawn from the platform's database of comparable transactions. NOI is normalized to trailing actuals plus only defensible adjustments. Capex and reserves are sized to platform minimums. Stabilization timelines are reviewed against absorption benchmarks. Working capital and financing assumptions are recomputed.

Output is a Re-Underwritten Pro Forma alongside the sponsor's submitted version, with a line-by-line delta analysis. Every variance is documented with rationale. The agent does not simply impose haircuts — it identifies the specific assumptions that diverge and explains the basis for each.

From the re-underwritten pro forma, the agent runs initial sizing calculations: par amount that can be supported at target DSCR; debt service implied; max loan from various sizing tests (LTV, LTC, debt yield, DSCR); break-even occupancy; sensitivity to rate moves and revenue stress.

If the deal as sponsor-proposed does not work at the platform's house standards, the structuring agent kicks in with restructuring options: par reduction, capital stack changes, subordinate financing layers, conduit issuance with credit enhancement, deferred-payment structures, reserve increases — whatever combination might make the deal work at defensible standards.

### **Counterparties Engaged**

None at this stage. The work is internal to Nest and the sponsor.

### **Deliverables**

Re-Underwritten Pro Forma. Sizing analysis. Structuring Gap Memo identifying differences from sponsor's proposal and proposed restructuring options if applicable. Indicative term sheet showing what Nest believes the deal can be.

### **Gateway**

Sean and Josh review at Gateway 1. The decision: does this deal make sense, is the sponsor real, are the assumptions sane, is the proposed structure financeable, and is Nest going to engage formally. Pass Gateway 1 and the deal moves to Stage 4 with a fee event. Fail Gateway 1 and the sponsor receives a declination memo with the reasoning.

### **Time**

2-3 weeks, overlapping with completion of Stage 1 and 2.

### **Fees**

Pre-screen fee: $15K-$25K paid by sponsor when the Structuring Gap Memo is delivered. This is Nest's first revenue event on the deal. The fee compensates for the underwriting work even if the deal does not proceed to issuance.

**PRE-SCREEN FEE STRATEGY:** Charging $15K-$25K at this stage does two things: it generates revenue regardless of whether the deal closes, and it ensures sponsors who pay are serious. Sponsors who balk at this fee are not the sponsors Nest wants. The fee is a filter and a revenue floor.

## **3.5 Stage 4 — Structuring Memorandum**

### **Inputs**

Re-underwritten pro forma. Sponsor agreement to proceed past pre-screen. Initial rating goal.

### **Work**

Structuring agent locks in the full deal structure. Decision variables include bond type (taxable corporate, 144A, muni conduit, project revenue bond); conduit issuer selection if applicable (the agent screens which conduits the deal qualifies for and which to pursue); par amount sized from the re-underwritten cash flows; tenor and amortization profile; coupon structure (fixed, variable, capitalized appreciation, blended); series structure (senior only, senior plus subordinate, multiple series); credit enhancement (DSRF, capitalized interest reserve, LOC, surety wrap if applicable, parent guarantee, conduit moral obligation); covenant package indexed to rating target; call provisions optimized for the rate environment and buyer pool; use of proceeds schedule; sources and uses balanced.

The structuring agent's output is the Structuring Memorandum — a comprehensive document that explains every decision and the rationale for each. The memo includes: deal summary, capital stack, bond terms, security structure, reserves, covenants, redemption provisions, use of proceeds, sources and uses, indicative pricing range, indicative rating, target timeline, fee estimates, and a list of counterparties to be engaged.

### **Counterparties Engaged**

Preliminary outreach begins to the proposed conduit issuer (for conduit deals) — initial conversations about volume cap availability and willingness to issue. Preliminary outreach to bond counsel candidates. No engagement letters yet.

### **Deliverables**

Structuring Memorandum, typically 25-40 pages with full schedules. This is the document the sponsor reviews and approves before the firm moves into formal execution.

### **Gateway**

Sponsor reviews the Structuring Memorandum and approves the proposed structure, or requests modifications, or declines to proceed. Sean and Josh also review at Gateway 2 to confirm Nest is comfortable with the structure before formal execution. Pass both gateways and the deal moves to Stage 5.

### **Time**

1-2 weeks.

### **Fees**

None at this stage. The Structuring Memorandum is delivered under the engagement letter to be signed at start of Stage 5, against the structuring fee earned at closing.

## **3.6 Stage 5 — Engagement and Rating Strategy**

### **Inputs**

Approved Structuring Memorandum. Sponsor's commitment to proceed.

### **Work**

Formal engagement letter executed with sponsor (or with obligor on conduit deals) defining Nest's role as financial advisor / municipal advisor, scope of services, fee structure (typically a flat structuring fee plus a success fee at closing), termination provisions, and confidentiality.

Rating strategy work begins. The rating agent reviews the methodology papers from each candidate rating agency for the relevant sector. For each agency, the agent populates the methodology framework with the deal's data — quantitative factors, qualitative factors, peer comparison, sensitivity analysis. The output is an Indicative Rating Memorandum for each candidate agency, projecting the rating each agency would likely assign and identifying the structural features that defend that rating.

Based on the indicative rating memoranda, the agent makes a recommendation on which agency or agencies to engage. Single rating vs. dual rating decision is made considering buyer pool requirements, cost, and rating uplift potential. Recommendation is presented to Sean and Josh for approval.

Once agency selection is approved, formal engagement letters are signed with the rating agencies and rating fees are paid. Agency assigns analyst, who begins reviewing the diligence package.

In parallel, the Rating Agency Presentation is produced — a comprehensive deck plus supporting schedules that will be presented to the rating analyst at the formal rating meeting. The presentation is built from a template indexed to the agency, the sector, and the target rating.

### **Counterparties Engaged**

Rating agencies (formal engagement). Conduit issuer (initial application or letter of intent submitted). Preliminary outreach to bond counsel candidates and trustee candidates.

### **Deliverables**

Executed engagement letter with sponsor. Indicative Rating Memorandum for each candidate agency. Rating Agency Presentation deck. Rating engagement letters. Conduit application or LOI.

### **Gateway**

Sean reviews the rating strategy and agency selection. Sponsor confirms commitment to proceed at this stage — the rating fees are real money ($75K-$200K per agency) and the sponsor must commit before they're paid.

### **Time**

2-3 weeks.

### **Fees**

Engagement letter executed. Structuring fee earned at closing as a fixed amount (typically $125K-$500K depending on deal size and complexity). No payment yet.

## **3.7 Stage 6 — Document Drafting**

### **Inputs**

Approved structure. Engagement letters in place with sponsor, rating agencies, and (in process) other counterparties.

### **Work**

The platform produces first drafts of every transaction document the deal requires. For a typical conduit revenue bond, the document set includes:

Trust Indenture — the master legal document

Loan Agreement — conduit-issuer-to-obligor agreement (conduit deals only)

Mortgage and Security Agreement — collateral pledge (where applicable)

Assignment of Rents / UCC Financing Statements — perfecting security interests

Regulatory Agreement — for affordable housing, locks in affordability restrictions

Tax Regulatory Agreement — for tax-exempt deals, locks in qualification requirements

Continuing Disclosure Agreement — borrower's ongoing disclosure undertaking

Bond Purchase Agreement — issuer-to-underwriter terms

Construction Disbursement Agreement — draw procedures for construction bonds

Subordination Agreements — for subordinate debt holders and LIHTC investors if applicable

Officer's Certificates — closing certificates from each party

Forms of Bond Counsel Opinion, Borrower's Counsel Opinion, Underwriter's Opinion, Disclosure Opinion — opinion forms attached to indenture as exhibits

The platform produces drafts from a precedent library indexed to deal type, sector, conduit issuer, structure, and rating target. Drafts are typically 75-90% of the way to final at first delivery — bond counsel reviews, marks up, finalizes, and signs. Without the platform's pre-built drafts, bond counsel would charge $150K-$250K for full document production. With the platform's drafts as a starting point, bond counsel typically charges $80K-$150K — a savings of $50K-$100K passed through to the sponsor (or captured in Nest's structuring fee depending on engagement structure).

### **Counterparties Engaged**

Bond counsel (formal engagement). Disclosure counsel if separate. Sponsor's counsel. Trustee (engagement letter being negotiated).

### **Deliverables**

Full draft document set. Draft of preliminary official statement (begun in this stage, finalized in Stage 7).

### **Gateway**

Bond counsel completes initial review and confirms the drafts are workable. Working group call kicks off.

### **Time**

2-3 weeks.

### **Fees**

Bond counsel fees begin accruing. Other counterparty engagement fees paid as engaged.

## **3.8 Stage 7 — Marketing Materials and POS Production**

### **Inputs**

Substantially complete document drafts. Rating engagement underway. Conduit application advanced.

### **Work**

The platform produces the Preliminary Official Statement (POS) — the offering document that goes to investors. The POS includes: cover page with key terms summary; bond descriptions with maturities, rates, redemption provisions; security and source of payment description; risk factors (sector-specific, structure-specific, sponsor-specific); the issuer / conduit issuer description; the obligor description; the project description with financials; the LIHTC structure if applicable; reserve and waterfall description; construction contract and contractor information for construction bonds; legal matters; tax matters; continuing disclosure undertaking; underwriting; appendices including bond counsel opinion form, audited financials, feasibility study summary, market study summary, appraisal summary, and form of continuing disclosure agreement.

The POS is the largest single document Nest produces — typically 150-250 pages including appendices. It is also the most legally sensitive — every material statement must be accurate and complete to satisfy federal securities laws. The platform produces the POS in coordination with bond counsel (and disclosure counsel where separate), with bond counsel finalizing legal review.

In parallel, the platform produces the investor pitch book — a shorter marketing document used by the BD partner's placement team to walk institutional buyers through the deal. The pitch book highlights the key credit story, the structural features, the rating, the comparable transactions, and the pricing thesis.

### **Counterparties Engaged**

Disclosure counsel. Auditor (for consent letter coordination). BD partner (engaged for placement, working with the marketing materials).

### **Deliverables**

Preliminary Official Statement. Investor Pitch Book. Roadshow materials if applicable.

### **Gateway**

Sean, Josh, sponsor, bond counsel, disclosure counsel, and BD partner all sign off on the POS before it is released to investors. This is one of the most important gateways in the workflow — once the POS is in the market, statements in it are subject to securities law liability.

### **Time**

2-3 weeks.

### **Fees**

Continuing accrual of legal fees, rating fees, conduit fees, trustee fees, etc.

## **3.9 Stage 8 — Working Group Coordination**

### **Inputs**

Active working group of all counterparties. Documents in advanced draft. POS in draft.

### **Work**

The platform runs the deal as a structured project management exercise. Standing weekly working group calls. Agenda generated by the platform. Action items tracked. Document version control. Comment consolidation across counsel comments — every redline from bond counsel, issuer's counsel, sponsor's counsel, trustee's counsel, disclosure counsel flows into the platform, the platform proposes resolution for each comment, working group reviews on call and approves.

This is where the platform's project management advantage shows up most concretely. Traditional middle-market bond deals lose 30-60 days at this stage due to scattered emails, lost comments, redundant review cycles, and uncoordinated working group calls. The platform compresses this to 15-30 days because every comment is captured, prioritized, and tracked through resolution.

### **Counterparties Engaged**

All working group members — issuer, conduit issuer, obligor, bond counsel, disclosure counsel, sponsor's counsel, trustee, underwriter / BD partner, rating agency analysts, auditor, feasibility consultant, market study consultant, construction monitor, sponsor.

### **Deliverables**

Working group call agendas and minutes. Updated document drafts. Resolved comment logs. Conditions precedent checklist.

### **Gateway**

Documents approach final. POS is approaching POS-in-final form. All conditions precedent are identified and being tracked to satisfaction.

### **Time**

3-6 weeks, overlapping with rating committee process in Stage 10.

### **Fees**

Continuing accrual.

## **3.10 Stage 9 — Conduit and Public Approvals**

### **Inputs**

For conduit deals, the conduit issuer's internal approval process. For deals requiring public hearings (TEFRA hearings for tax-exempt bonds, certain conduit deals), the public hearing process.

### **Work**

Conduit credit committee review — the platform produces the conduit's credit submission package, the conduit's underwriting team reviews, conditions are negotiated, the conduit's board or finance committee approves. Some conduits move fast (state HFAs with monthly board meetings); others move slowly (county IDA boards with quarterly meetings). The platform tracks the conduit's approval calendar and works backward from the closing target.

TEFRA hearing — for tax-exempt private activity bonds, a public hearing under Internal Revenue Code §147(f) must be held with public notice and an opportunity for community comment. The platform coordinates the hearing notice publication, the hearing logistics, and the post-hearing approval by the elected official with jurisdiction.

### **Counterparties Engaged**

Conduit issuer credit committee. Conduit's board or finance committee. Elected official with TEFRA jurisdiction. Public notice services.

### **Deliverables**

Conduit credit approval. TEFRA hearing notice. Hearing minutes and elected official approval certificate.

### **Gateway**

Conduit approval secured. TEFRA approval secured. These are hard conditions to closing — without them, no bond.

### **Time**

4-8 weeks, often the longest single stage in the workflow because conduit approval calendars are slow.

### **Fees**

Conduit fees due.

## **3.11 Stage 10 — Rating Committee Process**

### **Inputs**

Engaged rating agencies. Rating presentation delivered. Analyst's questions in process.

### **Work**

Each rating agency has its formal committee process. Pre-committee: analyst conducts diligence, asks questions, requests additional information, conducts site visits if applicable, and develops a rating recommendation. The platform supports this end-to-end — every analyst question is logged, routed to the right responder (sponsor, counsel, Nest), drafted as a response, reviewed at gateway, sent back. The platform tracks the dialogue, identifies patterns of where the analyst is pushing on specific risks, and proposes structural responses (additional reserve, tighter covenant, additional disclosure) where defensible.

Formal rating meeting: typically a 90-120 minute video conference with the obligor's management team presenting the project. The agent prepares management for the meeting with a list of expected questions and proposed responses based on the analyst's diligence pattern. The platform's database of prior similar transactions provides comparison points for the analyst's questions.

Rating committee: the analyst presents the recommendation to a committee of 4-8 senior analysts. The committee votes. The indicative rating is communicated to the issuer. Sometimes the committee imposes conditions (e.g., 'rating is BBB+ subject to increasing the DSRF to 1.5x MADS' or 'rating is A- subject to addition of a rate covenant'). The platform tracks committee conditions, drafts the structural responses, and confirms back to the agency.

### **Counterparties Engaged**

Rating agencies. Obligor management. Bond counsel (for documentation of any committee conditions).

### **Deliverables**

Indicative rating letter from each rated agency. Committee condition responses. Final agreed rating.

### **Gateway**

Indicative rating achieved at or above the target. If the rating misses the target, Sean and Josh review with sponsor whether to proceed at the lower rating (with consequent pricing impact) or to restructure to achieve the target rating.

### **Time**

6-10 weeks total from initial engagement, often running in parallel with other stages.

### **Fees**

Rating fees fully accrued.

## **3.12 Stage 11 — Pricing**

### **Inputs**

Documents in near-final form. Indicative rating in hand. POS finalized as POS or moved to final OS draft. Marketing materials complete. Investor interest preliminarily gauged.

### **Work**

BD partner takes the deal to market. For most middle-market deals, the marketing period is 7-14 days. Activities during marketing: investor calls, one-on-one meetings with key buyer accounts (institutional one-on-ones), distribution of POS to qualified institutional buyers, gathering of indications of interest at indicative pricing levels.

Book-building: BD partner's syndicate desk receives orders from institutional buyers and from the syndicate co-managers. Orders are tracked by maturity, by amount, by buyer type. Oversubscription levels by maturity inform pricing — strong oversubscription at a given maturity allows the underwriter to tighten pricing in that maturity; weak demand allows pricing to be widened or the maturity to be repriced.

Pricing: the lead underwriter and the issuer's representatives (Nest as FA, sponsor as obligor) negotiate final pricing the night before or morning of pricing. Coupon rates and prices are set, maturity-by-maturity for serial bonds, in a single rate for term bonds. The Bond Purchase Agreement is executed. Bonds are formally sold to the underwriter.

### **Counterparties Engaged**

BD partner / underwriter. Co-managers if syndicated. Institutional buyers (lifecos, bond funds, bank portfolios, hedge funds). DTC for clearance setup.

### **Deliverables**

Executed Bond Purchase Agreement. Final pricing schedule with maturities, par, coupons, prices, yields. Order allocations.

### **Gateway**

Sponsor approves final pricing. Sean reviews final pricing relative to indicative range. Pricing within range or better and the deal advances; pricing materially worse than indicative range triggers reconsideration.

### **Time**

1-2 weeks, with the pricing itself happening in a single morning.

### **Fees**

Underwriter discount earned at pricing (paid at closing). Nest's share of underwriter discount accrued per BD partnership terms.

## **3.13 Stage 12 — Closing**

### **Inputs**

Executed Bond Purchase Agreement. All transaction documents in execution form. All conditions precedent identified and being satisfied.

### **Work**

Closing checklist runs through the platform. Typical closing checklist runs 60-120 items including every executed document, every legal opinion, every certificate, wire confirmations, UCC filings, mortgage recordings (for secured deals), title insurance policies, DTC eligibility confirmations, CUSIP assignments, comfort letter reliance, IRS Form 8038-G or 8038 filing (for tax-exempt deals), publication of notices, and any sector-specific filings (e.g., LIHTC compliance for affordable housing).

On closing day, all signed documents are released from escrow. The underwriter wires the purchase price to the trustee. The trustee disburses to: construction fund (for construction deals); capitalized interest reserve; debt service reserve fund; costs of issuance fund (which pays bond counsel, disclosure counsel, financial advisor / Nest, rating fees, trustee acceptance, printing, miscellaneous closing costs); underwriter discount (which the underwriter takes from the proceeds and which is then split with Nest per the BD partnership). Bonds are formally issued, registered with DTC, CUSIPs activated, and the deal is closed.

### **Counterparties Engaged**

All. Closing day is a coordinated effort across the entire working group.

### **Deliverables**

Closing Binder (organized record of all closing documents). Closing Memorandum (post-closing summary). Bonds issued.

### **Gateway**

Closing completed and funds flowed.

### **Time**

Closing day itself. Closing binder finalized in the week following.

### **Fees**

All issuance fees paid at closing. Nest's structuring fee paid from costs of issuance. Nest's share of underwriter discount paid per BD partnership terms. Total Nest revenue at closing typically $250K-$1.5M+ depending on deal size.

## **3.14 Stage 13 — Post-Closing Administration**

Stage 13 begins the day after closing and continues for the bond's full life. This is the recurring revenue engine of Nest, the part of the business with the greatest compounding advantage, and the part most regional and middle-market bankers underinvest in. Stage 13 deserves substantial detail because it's where the business compounds, and because it is the operating reality that the issuance work supports.

### **Construction Period Administration (for construction bonds)**

During construction, the platform runs the draw process. Each monthly draw request: (1) sponsor's contractor submits AIA G702/G703 pay application; (2) sponsor's project team validates against budget and schedule; (3) sponsor submits draw request to platform; (4) platform validates math, checks against budget, confirms lien waivers from contractor and major subs, runs the draw against the approved disbursement schedule; (5) platform generates the certified draw package for the construction monitor; (6) construction monitor performs site verification (handled outside the platform — this is the physical inspection); (7) construction monitor signs the draw certification; (8) platform delivers the certified package to the trustee; (9) trustee releases funds from the construction fund to the obligor or directly to contractors per the disbursement instructions.

Draw administration fee earned per draw: typically $1,000-$3,000 per draw plus an annualized administration retainer. On a 24-month construction project with monthly draws, this is $24K-$72K plus the retainer over the construction period.

### **Debt Service Administration**

Each scheduled debt service payment: platform calculates the payment amount (interest + scheduled principal); confirms the obligor has funded the trustee's collection account; trustee processes the payment to bondholders through the paying agent; platform generates the payment notification and records the payment. For monthly-pay structures, this happens 12 times a year. For semi-annual structures, twice a year.

Where the obligor cannot fund the payment from operating cash flow, the platform's covenant monitoring layer detects the shortfall in advance, alerts the obligor and Sean/Josh, and triggers the contingency response (drawing on DSRF, requesting waiver, or initiating workout procedures).

### **Covenant Monitoring**

Each reporting period (quarterly for most bonds), the platform receives the obligor's financial reporting, computes every covenant test, compares to the covenant thresholds, and produces the covenant compliance certificate. Any covenant near or below threshold triggers an alert to the obligor and to Sean/Josh.

Covenant testing is automated. The platform pulls financial data directly from the obligor's reporting system (where integration exists) or from uploaded financial statements (parsed by the ingestion agent), runs the covenant calculations using the formulas defined in the indenture, and produces the certificate. The obligor's CFO reviews and signs; the certificate is filed with the trustee and (for muni deals) published to EMMA.

### **Continuing Disclosure**

Annual reports (audited financials, operating data) and material event filings (rating changes, defaults, draws on credit enhancement, certain other defined events) must be filed to EMMA under SEC Rule 15c2-12. The platform automates the annual filing — pulling the audit when issued, formatting per EMMA requirements, filing on time. Material event filings are triggered by the event detection layer — when a rating change or other material event occurs, the platform identifies it (often from public sources), drafts the filing, presents to obligor for review, and files.

### **Material Event Response**

Beyond filing, material events sometimes require operational response. A draw on a debt service reserve requires replenishment plans. A rating downgrade may trigger pricing or covenant implications. A change of control or change of obligor may require bondholder consent. The platform tracks the implications and routes the operational response.

### **Amendment, Waiver, and Consent Processes**

When the obligor wants to take an action restricted by covenants (acquisition, additional debt, distribution, fundamental change), an amendment or waiver is required. The platform manages the consent process — drafting the supplemental indenture or waiver request, identifying the consenting bondholders (majority, supermajority, or unanimous depending on the indenture provision), soliciting consents, paying consent fees if applicable, and executing the amendment. Fee event: typically $25K-$100K per amendment for the structuring/legal work.

### **Refunding Coordination**

When the obligor's economic situation warrants refinancing — typically rate decline, credit upgrade, or capital structure optimization — the platform runs the refunding analysis. NPV savings calculation, breakeven rate analysis, refunding economics versus restructure-in-place options. If the refunding makes sense and the obligor proceeds, the deal effectively becomes a new issuance — Stage 0 begins again with the same workflow.

**THE REFUNDING ANNUITY:** Every Nest deal contains a future Nest deal. The typical bond issued today gets refunded in years 7-10 when call protection expires or when economics warrant. The refunding is a fresh issuance with a fresh fee event. Building the post-closing administration platform means owning the refunding pipeline — Nest's first cohort of bonds becomes the firm's second wave of issuance revenue.

### **Restructuring and Workout**

When the obligor's credit deteriorates to the point where covenants are tripping or payments are at risk, the structuring engagement reactivates as a workout. Forbearance, debt service deferrals, principal reductions, exchange offers, distressed exchanges. Heavily skilled work, valuable fee event (typically 1-3% of par being restructured). The platform supports the workout but the senior banker leads.

### **Surveillance Support**

Each rating agency conducts annual surveillance reviews on outstanding rated bonds. The platform produces the surveillance update package — operating performance, covenant compliance, material developments, peer comparison — and delivers to the agency. This keeps the rating current and the relationship warm.

### **Fees in Stage 13**

**Draw administration** — $1K-$3K per draw + $3K-$6K monthly retainer during construction

**Annual administration** — 15-30 bps annual on outstanding par

**Amendment / consent fees** — $25K-$100K per event

**Refunding structuring** — full new-issuance fee event at refunding

**Restructuring / workout fees** — 1-3% of par restructured

**Call / put execution fees** — $5K-$25K per event

**Rate mode conversion fees** — $15K-$50K per conversion (VRDOs)

**Trustee transition fees** — $10K-$30K per transition

**Tender / exchange fees** — substantial event fees

On a single $50M bond over its 30-year life, Stage 13 fees can total $500K-$1.5M cumulative, with significant front-loading during construction and refunding events. Stage 13 is the compounding annuity that turns Nest into a recurring revenue business rather than a transactional one.

## **3.15 Quick Reference — Silo 3**

### **Stage Summary**

**Stage 0 —** Inbound & triage — same day to 48 hours, no fee

**Stage 1 —** Document ingestion — 1-2 weeks, no fee

**Stage 2 —** Sponsor diligence — 1 week parallel, no fee

**Stage 3 —** Project underwriting — 2-3 weeks, $15K-$25K pre-screen fee

**Stage 4 —** Structuring memorandum — 1-2 weeks, no incremental fee

**Stage 5 —** Engagement and rating strategy — 2-3 weeks, engagement letter signed

**Stage 6 —** Document drafting — 2-3 weeks

**Stage 7 —** POS production — 2-3 weeks

**Stage 8 —** Working group coordination — 3-6 weeks overlapping

**Stage 9 —** Conduit and public approvals — 4-8 weeks

**Stage 10 —** Rating committee — 6-10 weeks overlapping

**Stage 11 —** Pricing — 1-2 weeks

**Stage 12 —** Closing — closing day plus 1 week, $125K-$500K structuring fee + share of underwriter discount

**Stage 13 —** Post-closing administration — full bond life, $500K-$1.5M+ cumulative per deal

### **Total Issuance Timeline**

From Stage 0 inbound to Stage 12 closing: typical 90-150 days for a clean middle-market conduit deal. Comparable traditional execution: 180-270 days. Nest's compression: 50-60 days, driven by platform automation of documents and project management discipline.

### **Total Nest Revenue Per Deal Lifecycle**

On a $50M middle-market bond: $15K pre-screen + $125K-$400K structuring + $150K-$500K share of underwriter discount at closing = $290K-$915K closing revenue. Plus $500K-$1.5M+ cumulative Stage 13 administration revenue over the bond's life. Total deal lifecycle revenue: $800K-$2.4M per bond.

# **SILO 4 — THE DOCUMENTS**

A bond is a stack of documents. Every legal right the bondholder has, every covenant the obligor is bound by, every cash flow that moves between parties, every signature that closes the deal — all of it lives in documents. A banker who cannot name every document, explain what it establishes, identify who signs it, and know when it gets produced is operating without the most basic tool of the trade. This silo walks the full document inventory.

The documents cluster into seven groups: (1) the master transaction documents that define the bond itself; (2) the security documents that perfect bondholder claims on collateral; (3) the marketing documents that describe the bond to investors; (4) the opinion documents that close the legal certainty; (5) the operational documents that govern the bond's life; (6) the closing certificates that evidence the conditions to closing were met; (7) the public filings that satisfy regulatory requirements. Each group is treated in turn.

## **4.1 The Master Transaction Documents**

### **Trust Indenture**

The single most important document in a bond transaction. The indenture is the contract between the issuer and the trustee, executed for the benefit of bondholders, that defines every feature of the bonds — par amount, maturity, interest rate, payment dates, security, redemption provisions, events of default, remedies, reserves, covenants, amendment procedures, defeasance provisions, and the rights and duties of every party. Every other transaction document is subordinate to or implementing of the indenture.

Indentures range from 100 to 400+ pages depending on complexity. A simple municipal GO bond indenture might be 80-120 pages. A complex project finance bond with multiple series, tiered reserves, conditional redemptions, and detailed remedies can run 350+ pages. The Nest platform produces indenture drafts from a precedent library indexed to deal type, sector, structure, and rating target — getting the first draft 75-85% complete saves bond counsel substantial review hours.

**Established by —** Issuer (signing as the bond issuer) and Trustee (accepting the trust)

**Drafted by —** Bond counsel, working from Nest platform's first draft

**Signed at —** Closing

**Establishes —** The bonds themselves; bondholder rights; all structural features

### **Loan Agreement (Conduit Deals)**

In a conduit transaction, the bond proceeds flow from the bondholders to the conduit issuer (at issuance) and then from the conduit issuer to the obligor (the substantive borrower). The Loan Agreement is the contract between the conduit issuer and the obligor that governs the obligor's payment obligation. It mirrors the indenture's payment terms — the obligor must pay the conduit issuer in amounts and at times sufficient to enable the conduit issuer to pay the bondholders. The Loan Agreement also typically contains the obligor's covenants (which are then incorporated by reference into the indenture's covenants).

The Loan Agreement is what makes a conduit deal a real conduit deal — the conduit issuer is the bond obligor on paper, but the substantive credit is the obligor's payment obligation under the Loan Agreement. Bondholders look through the conduit to the obligor.

**Established by —** Conduit issuer and obligor

**Drafted by —** Bond counsel

**Signed at —** Closing

**Establishes —** Obligor's payment obligation; obligor's covenants and reps

### **Supplemental Indenture (When Used)**

Where an indenture is structured to permit multiple series of bonds over time, the first series is issued under the master indenture, and each subsequent series is issued under a supplemental indenture. The supplemental indenture incorporates the master indenture and adds the series-specific terms (maturity, coupons, redemption, use of proceeds for that series). This master-supplemental structure is common for issuers that expect to return to the market repeatedly — state HFAs, certain corporate issuers, project finance entities with phased capital needs.

Supplemental indentures are also used for amendments. A supplement to an existing indenture amends, adds to, or modifies the existing terms with bondholder consent (or under no-consent amendment provisions in the original indenture).

**Established by —** Issuer and Trustee

**Drafted by —** Bond counsel

**Signed at —** New series issuance or amendment closing

**Establishes —** Series-specific terms or amendments to existing indenture

### **Tax Regulatory Agreement (Tax-Exempt Deals)**

For tax-exempt bonds, the Tax Regulatory Agreement locks in the conditions on which the tax exemption depends. It binds the obligor (and sometimes the issuer) to maintain compliance with Internal Revenue Code requirements for the bond's life — restrictions on private use of bond-financed assets, arbitrage yield restrictions, rebate calculations and payments, limitations on refunding mechanics, and other tax-exempt qualification rules.

Loss of tax exemption is catastrophic — bonds become retroactively taxable, interest is recharacterized as taxable income to bondholders going back to issuance, and the obligor typically owes substantial penalties. The Tax Regulatory Agreement establishes the procedures and standards for maintaining exemption and the responsibilities for ongoing compliance.

**Established by —** Obligor (and issuer in some cases)

**Drafted by —** Bond counsel

**Signed at —** Closing

**Establishes —** Tax-exempt compliance obligations; arbitrage rebate procedures; private use restrictions

### **Bond Purchase Agreement**

The contract between the issuer (and obligor on conduit deals) and the underwriter, governing the sale of the bonds. The BPA defines the purchase price (par minus underwriter discount), the underwriter's commitment to purchase, the issuer's representations and warranties about the offering, the conditions precedent to closing, the indemnification of the underwriter by the issuer, and the termination rights. The BPA also incorporates the closing checklist by which all conditions are tracked.

The underwriter does not commit to purchase until the BPA is signed — typically the night before closing or morning of closing. Until that moment, the underwriter has marketed the bonds based on the POS but has no firm purchase obligation. At BPA execution, the bonds are sold; the underwriter then has its own obligation to its allocated investors to deliver bonds at closing.

**Established by —** Issuer (and obligor on conduit deals) and underwriter

**Drafted by —** Underwriter's counsel, reviewed by bond counsel

**Signed at —** Pricing (typically night before closing or morning of closing)

**Establishes —** Underwriter's purchase commitment; issuer reps and warranties; closing conditions

### **Regulatory Agreement (Sector-Specific)**

For affordable housing deals (LIHTC, tax-exempt housing bonds), a Regulatory Agreement binds the obligor to maintain affordability restrictions — income limits, rent limits, set-asides for low-income tenants — for a defined regulatory period (typically 15-30 years). The Regulatory Agreement is recorded against the property and binds successor owners. Compliance is monitored by the state HFA throughout the regulatory period.

Similar sector-specific agreements appear in other contexts. Charter school bonds may have authorizer regulatory agreements binding the school to academic and operational standards. Healthcare bonds may have specific licensure compliance covenants. The Nest platform's structuring agents must know the sector-specific regulatory framework for each deal type.

**Established by —** Obligor and regulator (state HFA, charter authorizer, etc.)

**Drafted by —** Regulator's counsel or specialty counsel

**Signed at —** Closing

**Establishes —** Sector-specific compliance obligations

## **4.2 The Security Documents**

### **Mortgage and Security Agreement**

On secured bonds with real estate collateral, the obligor grants the trustee (on behalf of bondholders) a first-priority mortgage on the financed property. The mortgage is recorded with the county recorder where the property is located. It includes the legal description of the property, the security interest granted, and the remedies available to the trustee in default — foreclosure, appointment of receiver, assignment of rents.

On project finance and revenue bonds, the security package often extends beyond real estate to include: all-asset lien on the obligor's tangible and intangible property; assignment of contracts (construction contracts, offtake agreements, leases); assignment of permits and licenses (where assignable); pledge of equity in subsidiary entities; pledge of project accounts at the trustee.

**Established by —** Obligor (as grantor) to Trustee (as grantee, for benefit of bondholders)

**Drafted by —** Bond counsel and obligor's real estate counsel

**Signed at —** Closing; recorded immediately post-closing

**Establishes —** First-priority lien on collateral; remedies in default

### **UCC Financing Statements**

For security interests in personal property (equipment, accounts, inventory, contract rights), Uniform Commercial Code financing statements are filed with the appropriate state filing office to perfect the security interest. UCC-1 filings are required at closing; UCC-3 amendments or continuations track changes over the bond's life.

**Established by —** Obligor (as debtor), filed by Trustee or bond counsel (as secured party)

**Drafted by —** Bond counsel

**Signed at —** Closing; filed immediately

**Establishes —** Perfection of personal property security interest

### **Assignment of Rents and Leases**

On real estate-backed bonds, the obligor assigns all rents and leases to the trustee, with the obligor's right to collect rents continuing until default. Upon default, the trustee can enforce the assignment and collect rents directly from tenants. The Assignment of Rents is typically a separate document or section of the mortgage, recorded against the property.

**Established by —** Obligor to Trustee

**Drafted by —** Bond counsel

**Signed at —** Closing; recorded with mortgage

**Establishes —** Trustee's right to collect rents directly on default

### **Subordination Agreements**

When the obligor has subordinate debt (mezzanine debt, soft loans, LIHTC investor pay-in obligations, parent advances), each subordinate creditor signs a subordination agreement acknowledging the senior bondholders' priority. The subordination governs payment priority during normal operations and in default. Standard provisions: no payments to subordinate creditors when senior debt is in default; turnover of subordinate payments received in violation; subordination in bankruptcy.

**Established by —** Subordinate creditor and trustee (for benefit of bondholders)

**Drafted by —** Bond counsel

**Signed at —** Closing

**Establishes —** Payment priority of senior over subordinate

## **4.3 The Marketing Documents**

### **Preliminary Official Statement (POS)**

The offering document distributed to investors during the marketing period. The POS describes the bonds, the issuer, the obligor (on conduit deals), the project, the security, the risk factors, the financial information, the legal matters, the tax matters, and the underwriting. The POS is preliminary because it does not yet contain the final pricing — coupons, yields, and prices are determined at pricing.

The POS is the most legally consequential document in the transaction from a securities law perspective. Federal securities laws (Rule 10b-5 under the Securities Exchange Act of 1934 for corporate bonds; Rule 15c2-12 and antifraud provisions for municipal bonds) require that the POS be accurate and complete and not misleading. The issuer and the underwriter (and Nest as financial advisor) all have potential liability for material misstatements or omissions. Disclosure counsel's job is to ensure the POS meets the disclosure standard.

POS length on a middle-market deal: 150-250 pages including appendices. Major sections: cover page with terms summary; introduction; the bonds; security and source of payment; risk factors; the issuer; the obligor; the project; the financing structure; financial information; legal matters; tax matters; underwriting; continuing disclosure; ratings; miscellaneous; appendices (audited financials, feasibility study, market study, appraisal, form of indenture, form of legal opinion, form of continuing disclosure agreement).

**Established by —** Issuer (and obligor on conduit deals) with input from all working group

**Drafted by —** Nest platform first draft, finalized by disclosure counsel

**Signed at —** Released as POS at start of marketing period

**Establishes —** The disclosure foundation for the offering; the marketing description of the bonds

### **Official Statement (OS)**

The final version of the POS, updated with final pricing and any other final-form changes. The OS is delivered to investors at closing as the definitive offering document. Investors receive the OS shortly after pricing (typically within 7 business days of pricing per market practice and SEC requirements).

**Established by —** Same as POS

**Drafted by —** Same as POS, updated for final pricing

**Signed at —** Finalized at closing

**Establishes —** Final offering disclosure

### **Investor Pitch Book / Roadshow Deck**

Shorter marketing document used by the BD partner's placement team to walk institutional buyers through the deal. Typically 20-40 slides covering the credit story, the project highlights, the structural features, the rating, comparable transactions, the pricing thesis, and the management team. The pitch book is not a legal document — it's a marketing piece. Material information in the pitch book must also be in the POS to avoid disclosure asymmetry.

**Established by —** Nest platform

**Drafted by —** Nest, reviewed by BD partner

**Used in —** Marketing period

**Establishes —** Marketing narrative for institutional buyers

## **4.4 The Opinion Documents**

### **Bond Counsel Opinion**

The bond counsel's legal opinion delivered at closing. Standard sections: (1) due authorization, execution, and delivery of the bonds and the transaction documents; (2) enforceability of the bonds against the issuer; (3) for tax-exempt bonds, exemption of interest from federal income tax (and state tax exemption where applicable); (4) compliance with state law requirements for the issuance; (5) for conduit deals, validity of the Loan Agreement and the security documents.

The bond counsel opinion is the single most important opinion at closing because it makes the bonds saleable as the security they purport to be. Without the opinion, the bonds cannot be issued. Bond counsel will not deliver the opinion if any condition fails — unresolved litigation, defective authorization, tax compliance issue, structural defect.

**Established by —** Bond counsel

**Drafted by —** Bond counsel from firm's standard form, customized for deal

**Signed at —** Closing

**Establishes —** Legal validity and (for tax-exempt) tax exemption of the bonds

### **Disclosure Counsel Opinion**

On deals where disclosure counsel is separately engaged, a separate disclosure opinion covers disclosure compliance. Standard form: in the course of disclosure counsel's review of the POS, nothing came to disclosure counsel's attention that caused them to believe the POS contained an untrue statement of material fact or omitted a material fact necessary to make the statements not misleading. This is a 'negative assurance' opinion — it does not affirmatively state the POS is correct but states that disclosure counsel did not find it wrong.

**Established by —** Disclosure counsel

**Signed at —** Closing

**Establishes —** Disclosure compliance comfort

### **Borrower's Counsel Opinion**

The obligor's general corporate counsel provides an opinion covering: (1) due organization and good standing of the obligor; (2) authorization of the obligor to enter into the transaction documents; (3) no conflict with the obligor's organizational documents or material contracts; (4) no pending litigation that would materially affect the bonds; (5) the binding nature of the obligor's obligations under the transaction documents.

**Established by —** Sponsor's counsel

**Signed at —** Closing

**Establishes —** Obligor's authority and enforceability of obligor obligations

### **Trustee's Counsel Opinion**

The trustee's outside counsel (or in-house counsel on standard transactions) provides an opinion that the trustee is duly authorized to enter into the indenture and that the indenture is a valid and binding obligation of the trustee. Usually a short opinion.

**Established by —** Trustee's counsel

**Signed at —** Closing

**Establishes —** Trustee's authority

### **Underwriter's Counsel Opinion**

The underwriter's counsel provides an opinion covering disclosure compliance from the underwriter's perspective. Often combined with the disclosure counsel opinion or omitted on deals where the underwriter relies on bond counsel and disclosure counsel.

**Established by —** Underwriter's counsel

**Signed at —** Closing

**Establishes —** Underwriter's disclosure due diligence comfort

### **Comfort Letter**

The auditor provides comfort to the underwriter on selected financial information in the POS. Procedures defined under AICPA SAS 72. The auditor performs limited procedures on financial data in the POS and reports the procedures and results to the underwriter. Comfort covers: agreement of audited financial information in the POS to underlying audit work papers; agreement of unaudited interim financial information to the obligor's records; agreement of statistical and operating data to records; reading of subsequent minutes for events that might affect the audited financials.

Comfort letters are short — typically 6-15 pages — but procedurally intensive. The auditor must perform the procedures described in the letter to be able to deliver it. Engagement of the auditor for comfort letter procedures must happen early enough to allow the work to be completed before the BPA is signed.

**Established by —** Auditor

**Signed at —** Pricing

**Establishes —** Auditor's negative-assurance comfort on selected POS financial data

### **Auditor's Consent Letter**

Separate from the comfort letter — the auditor's written consent to inclusion of their audit report and the audited financials in the POS. Required for any offering document that includes audited financials. Short document, standard form.

**Established by —** Auditor

**Signed at —** Closing

**Establishes —** Consent to use of audit in POS

### **Tax Opinion (Separate from Bond Counsel Opinion)**

On complex tax-exempt deals or on deals with novel tax issues, a separate tax opinion from specialized tax counsel may be obtained. Most middle-market deals use the bond counsel's tax opinion as integrated into the bond counsel opinion.

## **4.5 The Operational Documents**

### **Continuing Disclosure Agreement (CDA)**

Required under SEC Rule 15c2-12 for almost all municipal bond offerings. The CDA is the obligor's contractual commitment to provide ongoing disclosure for the life of the bonds — annual financial information, operating data, and material event filings (rating changes, defaults, draws on credit enhancement, certain other defined events). The CDA defines what gets disclosed, when, and how (through EMMA for municipal bonds).

Continuing disclosure obligations don't end at closing — they run for the bond's life. Nest's administration platform automates the production and filing of continuing disclosure on behalf of the obligor.

**Established by —** Obligor (and dissemination agent if separately engaged)

**Drafted by —** Bond counsel or disclosure counsel

**Signed at —** Closing

**Establishes —** Ongoing disclosure obligations and procedures

### **Construction Disbursement Agreement (Construction Bonds)**

Defines the procedures by which bond proceeds in the construction fund are disbursed to the obligor or directly to contractors. Specifies: who can request a draw (obligor's authorized officer); what documents must accompany the request (AIA G702/G703, lien waivers, contractor's certificate, architect's certificate, updated budget); who certifies the draw (construction monitor, sometimes architect, sometimes engineer); how the trustee processes the request; how often draws can be made (monthly is standard); what conditions must be met before each draw.

**Established by —** Obligor, trustee, construction monitor, sometimes conduit issuer

**Drafted by —** Bond counsel

**Signed at —** Closing

**Establishes —** Draw procedures during construction

### **Paying Agent / Registrar Agreement**

On deals where a separate paying agent or registrar is engaged (i.e., where the trustee doesn't serve both roles), this agreement governs the paying agent's duties — processing payments to bondholders, maintaining the bond registry, handling transfers of registered bonds. On most middle-market deals, these functions are incorporated into the trustee's role and a separate agreement is not needed.

### **Bondholder Representative or Servicer Agreement (When Used)**

On some structured or private bond transactions, a bondholder representative or special servicer is engaged to act for the bondholders in specific circumstances (default, restructuring, complex consent processes). This agreement defines their authority and compensation. Less common in middle-market public-style bond work; more common in private placements and structured deals.

## **4.6 The Closing Certificates**

At closing, every party signs certificates evidencing that the conditions to closing have been met. The closing certificates are not glamorous but they are legally essential — they create the contractual record that all conditions precedent were satisfied. Failure to deliver any required certificate prevents closing.

### **Officer's Certificate (Issuer and Obligor)**

Signed by an authorized officer of the issuer (and the obligor on conduit deals) certifying: due organization and good standing; due authorization of the transaction; absence of any defaults under the transaction documents at closing; truth and accuracy of all representations and warranties; absence of any event that would constitute a material adverse change; specimen signatures of officers signing closing documents; resolutions authorizing the transaction; certification that no event has occurred that would entitle a party to terminate the BPA.

### **Incumbency Certificate**

Certifies the identities and signatures of the officers signing the closing documents. Standard form, signed by the secretary or corporate officer of each entity.

### **Tax Certificate (Tax-Exempt Deals)**

Signed by the obligor (and sometimes the issuer) certifying the tax-exempt qualification of the bonds — that the bonds satisfy the IRS requirements for tax exemption, that arbitrage rebate procedures are in place, that private use restrictions are understood, and that the obligor will comply with ongoing tax compliance obligations. The tax certificate is the substantive foundation for the bond counsel's tax opinion.

### **Conditions Precedent Certificate**

Certifies that all conditions precedent to closing (as defined in the BPA and the indenture) have been satisfied. This certificate consolidates the satisfaction of every condition into a single closing certification.

### **Receipt and Cross-Receipt**

The trustee certifies receipt of bond proceeds from the underwriter. The underwriter certifies delivery of bonds (typically through DTC). The obligor certifies receipt of net loan proceeds (after costs of issuance and discount). The cross-receipts evidence that the closing flow of funds and bonds occurred.

### **Trustee's Certificate of Authentication**

On each bond, the trustee signs a certificate of authentication confirming the bond is the genuine instrument issued under the indenture. Authentication is the legal act that makes a bond a bond — a bond without authentication is not yet outstanding.

### **DTC Letter of Representations**

If the bonds will be DTC-eligible (almost always for institutional bonds), the issuer and the trustee sign DTC's standard letter representing that the bonds meet DTC eligibility requirements and committing to DTC's procedures for payments, transfers, and notices.

## **4.7 The Public Filings**

### **IRS Form 8038 / 8038-G (Tax-Exempt Bonds)**

Required filing with the IRS for tax-exempt bond issuances. Form 8038-G is used for governmental bonds. Form 8038 is used for private activity bonds and other categories. The form reports the bond issue, the issuer, the obligor, the use of proceeds, the bond structure, and other information the IRS uses to track tax-exempt issuances. Filed within a defined period after closing (typically 15-45 days depending on circumstances). Failure to file timely can affect tax-exempt status.

**Established by —** Issuer (with obligor information)

**Filed with —** IRS

**Filed at —** Post-closing, within defined IRS timeline

**Establishes —** IRS notification of tax-exempt issuance

### **Form 8038-CP (Build America Bonds / Direct-Pay Bonds)**

Used for direct-pay tax credit bonds where the issuer claims a federal credit against interest payments. Historical mostly — Build America Bonds program ended in 2010 — but the form is still used for certain residual programs.

### **EMMA Filings (Municipal Bonds)**

The Municipal Securities Rulemaking Board's Electronic Municipal Market Access (EMMA) system is the SEC-designated repository for municipal bond disclosure. Required filings include the official statement (filed shortly after closing), continuing disclosure annual reports and material event notices (filed throughout the bond's life), advance refunding documents, and certain other categories. Every Nest-administered municipal bond requires ongoing EMMA filing capability.

**Established by —** Obligor or dissemination agent acting for obligor

**Filed with —** MSRB EMMA

**Filed at —** OS post-closing; annual reports and material events as required

**Establishes —** Public disclosure record for the bonds

### **Mortgage Recordation**

On secured real estate bonds, the mortgage is recorded with the county recorder where the property is located. Recordation establishes the public notice of the lien and is required for first-priority perfection. Recording fees vary by jurisdiction; recording is typically completed within days of closing.

### **UCC Filings**

Personal property security interests are perfected by filing UCC-1 financing statements with the appropriate state filing office. Most states maintain a centralized UCC filing office. Filing is electronic for most states. Continuation statements (UCC-3) are required to maintain perfection beyond the original 5-year term.

### **State Securities Filings (Blue Sky)**

Although most middle-market bonds are sold to qualified institutional buyers and are typically exempt from state securities registration, some deal structures or buyer pools require state-level filings. Blue sky exemption analysis is part of bond counsel's work.

### **DTC Eligibility and CUSIP**

CUSIP Global Services assigns the bond's CUSIP — the nine-character identifier used in trading and settlement. CUSIP application is submitted before closing; CUSIP is assigned and activated at closing. DTC eligibility requires the bonds to meet DTC's eligibility criteria and the issuer to comply with DTC's procedures.

## **4.8 The Closing Binder**

After closing, all executed transaction documents, opinions, certificates, and filings are compiled into the closing binder — the official record of the transaction. The closing binder is typically organized into tabs corresponding to the document categories above, with a cover index. Historically physical (multi-volume binders); today electronic (a structured PDF or digital folder system).

The closing binder serves three purposes: (1) the legal record of the transaction, retained by every party; (2) the reference document for ongoing administration — every covenant, every procedure, every right is in the binder; (3) the basis for any future amendment, refunding, or restructuring.

The Nest platform produces the closing binder automatically from the executed document set. The binder is organized to match the platform's document classification, indexed for searching, and accessible to all relevant parties (sponsor, obligor, Nest, trustee, conduit, counsel) per their need-to-know.

## **4.9 Quick Reference — Silo 4**

### **Document Inventory by Category**

**Master Transaction Documents**: Trust Indenture, Loan Agreement (conduit), Supplemental Indenture, Tax Regulatory Agreement, Bond Purchase Agreement, Regulatory Agreement (sector-specific)

**Security Documents**: Mortgage and Security Agreement, UCC Financing Statements, Assignment of Rents and Leases, Subordination Agreements

**Marketing Documents**: Preliminary Official Statement (POS), Official Statement (OS), Investor Pitch Book / Roadshow Deck

**Opinion Documents**: Bond Counsel Opinion, Disclosure Counsel Opinion, Borrower's Counsel Opinion, Trustee's Counsel Opinion, Underwriter's Counsel Opinion, Comfort Letter, Auditor's Consent Letter, Tax Opinion

**Operational Documents**: Continuing Disclosure Agreement, Construction Disbursement Agreement, Paying Agent / Registrar Agreement, Bondholder Representative Agreement

**Closing Certificates**: Officer's Certificate, Incumbency Certificate, Tax Certificate, Conditions Precedent Certificate, Receipt and Cross-Receipt, Trustee's Certificate of Authentication, DTC Letter of Representations

**Public Filings**: IRS Form 8038 / 8038-G, EMMA Filings, Mortgage Recordation, UCC Filings, State Securities Filings (Blue Sky), DTC Eligibility and CUSIP Assignment

### **Document Volume and Cost**

A typical middle-market bond closing produces 80-150 executed documents. Counting indenture pages, POS pages, all certificates and opinions and security documents, the closing binder runs 1,500-3,500 pages of legal and operational material. Producing this volume manually is what costs traditional middle-market bond execution $500K-$1.5M in legal and advisory fees per deal. The Nest platform's automation of document drafting, version control, comment consolidation, and binder assembly is what compresses this cost stack — and a meaningful portion of the savings stays with Nest as captured spread.

# **SILO 5 — THE FEE ARCHITECTURE**

This silo lays out every fee event in the bond's lifecycle, who pays whom, when, why, and how Nest captures spread at each event. Understanding the fee architecture is what separates the firm that runs as a business from the firm that just executes transactions. Every dollar in the deal moves through a defined channel; the firm that understands the channels captures more of the dollars.

**THE PRINCIPLE —** Fee discipline is captured margin. The platform's automation creates cost savings versus traditional middle-market execution. Those savings do not flow to the sponsor as discounted fees. They flow into Nest's spread, captured as recurring margin on every deal. The sponsor pays market or near-market fees; Nest pays itself well by being more efficient than its competitors.

## **5.1 The Three Buckets of Fees**

All fees in a bond transaction fall into three buckets, and a banker keeps them straight in their head at all times. (1) Upfront fees paid from bond proceeds at closing — the costs of issuance, paid once. (2) Underwriter discount — the difference between what the underwriter pays the issuer and what investors pay the underwriter, paid once at closing. (3) Ongoing fees paid from operating cash flow over the bond's life — annual administration, trustee, rating surveillance, and Nest's recurring administration fees.

Each bucket has different economics. Upfront fees are big numbers at closing — Nest gets paid well at closing and the sponsor sees the full cost in one transaction. Underwriter discount is the placement compensation — Nest's share comes through the BD partner. Ongoing fees are small per period but compound across the bond's life and across the portfolio — this is where Nest's recurring revenue lives.

## **5.2 The Cost of Issuance Stack**

Costs of issuance (COI) are the upfront expenses of getting the bond done, paid from bond proceeds at closing. On a typical middle-market conduit bond ($50M par), the COI stack runs $750K-$1.5M, roughly 1.5%-3.0% of par. Below is each line item with typical ranges. Note that the ranges depend heavily on deal complexity, sector, geography, and counterparty selection — these are illustrative not normative.

### **Legal Fees**

**Bond Counsel —** $75K-$250K (median $125K-$150K for middle-market conduit)

**Disclosure Counsel (when separate) —** $40K-$125K

**Sponsor's Counsel (borrower's counsel) —** $50K-$150K

**Trustee's Counsel —** $10K-$30K (often bundled with trustee acceptance fee)

**Underwriter's Counsel —** $50K-$150K (sometimes bundled in underwriter discount)

**Conduit Issuer's Counsel —** $15K-$50K (sometimes covered by conduit fee)

### **Rating Agency Fees**

**Per agency, initial rating —** $75K-$200K (typically $100K-$150K for middle-market deals)

Most middle-market deals are rated by one or two agencies. Single rating: $75K-$200K total. Dual rating: $150K-$400K total. Three ratings (rare at this size): $225K-$600K.

### **Trustee Fees**

**Acceptance fee at closing —** $5K-$15K

**First year annual fee (paid at closing) —** $5K-$12K

### **Conduit Issuer Fees**

**Issuance fee at closing —** 25-100 bps of par (e.g., $125K-$500K on a $50M deal)

**First year administration —** $5K-$50K (paid at closing for first year)

Conduit fees vary substantially by issuer. State HFAs typically charge 25-50 bps; county IDAs often charge 50-100 bps; some specialty conduits charge less. Some conduits also have one-time application fees ($5K-$25K) and public hearing fees ($2K-$10K).

### **Verification, Construction Monitor, Feasibility, and Market Study**

**Verification Agent (refundings) —** $15K-$40K

**Construction Monitor (construction bonds) —** $25K-$100K

**Feasibility Consultant —** $50K-$250K (largest single specialty fee on healthcare and senior living)

**Market Study Consultant —** $25K-$75K

### **Auditor**

**Consent and Comfort Letter Procedures —** $15K-$50K incremental to standing audit

### **Insurance**

**Title Insurance (real estate-backed) —** Premium varies by jurisdiction; typically 0.10%-0.50% of insured amount

**Insurance Broker / Risk Advisor —** Embedded in insurance premiums via commission

### **Printing and DTC**

**Printing and POS Distribution —** $10K-$25K

**DTC Eligibility Fee —** $2K-$5K

**CUSIP Assignment —** $200-$500 per CUSIP

### **Nest's Structuring Fee**

**Structuring Fee (Nest) —** $125K-$500K depending on deal size and complexity

Nest's structuring fee is a defined line item in the COI stack, paid from bond proceeds at closing. The fee compensates Nest for all of the work described in Silos 1-4 up through closing — re-underwriting, structuring memorandum, document drafting, rating coordination, counterparty engagement, working group management, POS production, closing management.

### **Reserves Funded at Closing**

Although technically not 'fees,' the cash flowing into reserves at closing comes from bond proceeds and is part of the use-of-proceeds calculation alongside fees:

Debt Service Reserve Fund — typically MADS or 12 months of debt service

Capitalized Interest Reserve — funds construction-period interest (varies with construction period)

Operating Reserve at Closing (sometimes) — 3-6 months of operating expenses

Insurance and Tax Escrow (sometimes funded at closing)

### **Total COI Stack — Illustrative $50M Middle-Market Conduit Bond**

A realistic total COI on a $50M middle-market conduit deal, fully aggregated:

Legal (bond counsel + sponsor's + trustee's + underwriter's): $200K-$450K

Rating agencies (one or two): $75K-$300K

Trustee (acceptance + first year): $10K-$25K

Conduit issuer (issuance + first year): $130K-$525K

Specialty consultants (feasibility, market, monitor): $50K-$300K

Auditor consent/comfort: $15K-$50K

Insurance and title: $25K-$150K

Printing, DTC, CUSIP: $15K-$30K

Nest structuring fee: $200K-$400K

Contingency: $25K-$75K

Total COI stack: $750K-$2.3M, typical $900K-$1.5M

On a $50M par bond, $1.2M of COI is 2.4% of par. That is real money to the sponsor and substantial fee income across the working group. Of that $1.2M, Nest captures $200K-$400K as the structuring fee — a meaningful share of the total fee pool for the work the platform actually does, comparable to or greater than what bond counsel earns for the legal work.

## **5.3 The Underwriter Discount**

The underwriter's compensation is the discount — the spread between the price at which the underwriter purchases the bonds from the issuer and the price at which the underwriter resells to investors. The discount is paid economically at closing (the issuer receives bond proceeds net of the discount; the underwriter resells at par or above and pockets the difference).

### **Underwriter Discount Components**

**Management Fee —** Compensates the lead bank for structuring and running the deal. Typically 20% of total discount.

**Underwriting Fee —** Compensates the syndicate for the underwriting commitment (taking the bonds onto the balance sheet). Typically 20% of total discount.

**Selling Concession —** Compensates the banks that actually place bonds with investors. Typically 60% of total discount.

This 20/20/60 split is the historical convention. Modern deals often vary it — some deals are priced with no real syndicate commitment and the management/underwriting components compress. Some highly competitive deals have steeper management fees and lower concessions.

### **Discount by Deal Size and Type**

Discount as a percentage of par narrows as par grows (fee compression on large deals) and varies by deal type:

**$5M-$20M middle-market conduit**: 1.5%-3.0% of par

**$20M-$50M middle-market conduit**: 1.0%-2.0% of par

**$50M-$100M middle-market conduit**: 0.75%-1.5% of par

**$100M-$300M middle-market 144A or revenue bond**: 0.6%-1.25% of par

**Public registered offerings (larger deals)**: 0.5%-1.0% of par

**Traditional private placements**: 0.4%-0.75% paid as placement fee

**Muni GO bonds (competitive)**: 0.5%-1.25% as winning bid spread

### **On a $50M Deal — Discount Dollars**

Discount typically 1.0%-2.0% on $50M = $500K-$1M. Nest's share of the discount (via BD partner partnership) at a 60/40 split favoring Nest = $300K-$600K. Plus the structuring fee = $200K-$400K. Total Nest revenue at closing on a $50M deal: $500K-$1M (excluding any pre-screen fee earned at Stage 3, which added $15K-$25K).

## **5.4 The Nest / BD Partner Split**

The economic relationship between Nest and the BD partner is the single most important commercial arrangement Nest negotiates. The split governs how the underwriter discount divides between the two firms, and the split must reflect who does which work.

### **What Nest Brings**

Sponsor relationship and deal origination

Re-underwriting and structuring

Document drafting and production

Rating agency coordination and presentation

Working group management

Counterparty engagement

Marketing material production

Closing management

Post-closing administration capability

### **What the BD Partner Brings**

FINRA registered broker-dealer license

MSRB membership (for muni)

Net capital and regulatory capital infrastructure

Supervisory and compliance infrastructure

Principal review of offerings

Institutional buyer relationships

Distribution capability

Bond placement and book-building

Underwriting commitment / balance sheet

### **Indicative Split Structures**

The split should reflect the relative contribution. Typical structures:

**60/40 favoring Nest** on deals where Nest does the structuring and the BD partner provides the license and placement. Common starting point.

**65/35 or 70/30 favoring Nest** on highly Nest-originated deals with limited additional work from the BD partner.

**50/50** on deals where the BD partner brings the sponsor relationship or substantial additional work.

**40/60 or 30/70 favoring BD partner** on deals the BD partner originates or where placement is exceptionally complex.

Negotiating these splits well is one of the most consequential ongoing business activities for Nest. The right framing: each split is per-deal based on who did what, not a fixed corporate split. Both parties win when the split reflects contribution; both lose when it doesn't and the dissatisfied party walks.

## **5.5 The Refunding Annuity**

Every bond Nest closes today is a potential bond Nest closes again in years 7-10. The refunding pipeline is the second wave of issuance revenue from the same client base, and it is one of the most economically powerful features of the bond business that's invisible to people who don't know the business.

### **Refunding Economics**

When the obligor's call window opens (typically 7-10 years after issuance) and market conditions warrant refinancing — lower rates, credit upgrade, structural optimization — a refunding generates a full new issuance fee event. New structuring fee, new underwriter discount, new BD partner split. The refunding economics are typically 80-100% of an equivalent new issuance because the same work goes into the refunding.

### **Refunding Pipeline Math**

If Nest closes 10 bonds per year and the average refunding cycle is 8 years, the firm's refunding pipeline reaches steady state at 80 outstanding deals refunding on a rolling basis. At a typical refunding rate of 60-70% (some bonds run to maturity, some are early-redeemed, some are refunded), that's roughly 5-7 refundings per year by year 8 in addition to the 10 new issuances. By year 15 the firm has 150+ outstanding deals refunding on a rolling basis — refunding revenue alone can equal or exceed new issuance revenue.

### **Capturing the Refunding**

The platform owns the refunding by virtue of being the post-closing administrator. The platform knows the call windows, knows the rate environment, knows when refunding economics work for the obligor. The platform proactively runs refunding analyses and presents them to obligors when economics favor action. This is one of the most defensible features of Nest's business model — the administration relationship locks in the refunding work.

## **5.6 The Post-Closing Annuity**

Stage 13 — post-closing administration — is the recurring revenue layer that builds compounding value across the portfolio. Each closed bond contributes to a growing book of administration revenue that continues for the bond's life.

### **Construction Period Fees**

During construction (typically 18-30 months for project bonds):

Per-draw processing fee: $1K-$3K per draw

Monthly admin retainer: $3K-$8K per month

Total construction-period revenue: $50K-$200K per deal

### **Ongoing Administration Fees**

After construction (operating bond life, typically 25-35 years remaining):

Annual administration fee: 15-30 bps on outstanding par

On a $50M average outstanding balance: $75K-$150K per year

Over 28-year operating life: $2.1M-$4.2M cumulative undiscounted

Present value at 10% discount: $700K-$1.4M

### **Optional Event Fees**

Across the bond's life, optional event fees accrue periodically:

Amendment and consent fees: $25K-$100K per event

Call execution: $5K-$25K per event

Rate mode conversions (VRDOs): $15K-$50K per conversion

Trustee transitions: $10K-$30K per transition

Tender offers: substantial event fees

Restructuring / workout: 1%-3% of restructured par

Aggregate optional event fees over a typical 30-year bond life: $100K-$500K cumulative, varying widely by deal type and obligor activity.

### **Total Per-Deal Lifecycle Revenue**

**Pre-screen fee (Stage 3) —** $15K-$25K

**Structuring fee (Stage 12) —** $200K-$500K

**Underwriter discount share (Stage 12) —** $300K-$600K

**Construction admin (Stage 13) —** $50K-$200K

**Annual admin over bond life (Stage 13) —** $2M-$4M undiscounted; $700K-$1.4M PV

**Optional event fees (Stage 13) —** $100K-$500K cumulative

**Refunding (around years 7-10) —** Full new-issuance fee event, $500K-$1M+

**Total per-deal lifecycle revenue —** $3M-$7M undiscounted; $1.5M-$3M PV

This is the core economics of the firm. A single deal generates roughly $1.5M-$3M in PV terms across its life. Run 10 deals a year and the firm's annual revenue trajectory is on a steep growth path because each year adds to the recurring book.

## **5.7 Portfolio Economics — Year by Year**

Modeling the firm's revenue at the portfolio level shows the compounding effect of building the administration book.

### **Year 1**

Closings: 5 deals (ramping up)

Closing revenue: ~$2.5M-$5M

Recurring revenue (administration): $50K-$150K (initial construction admin only)

Total year 1: $2.5M-$5M

### **Year 2**

Closings: 8 deals

Closing revenue: ~$5M-$8M

Recurring revenue: $300K-$700K (year 1 cohort's admin + year 2 closings construction admin)

Total year 2: $5.5M-$8.7M

### **Year 3**

Closings: 12 deals

Closing revenue: ~$8M-$12M

Recurring revenue: $700K-$1.5M (two-year cohort)

Total year 3: $8.7M-$13.5M

### **Year 5**

Closings: 18-25 deals

Closing revenue: ~$13M-$22M

Recurring revenue: $2M-$4M (four-year cohort plus first refundings beginning)

Total year 5: $15M-$26M

### **Year 10**

Closings: 25-40 new deals plus 5-12 refundings

Closing revenue: ~$25M-$45M (new + refundings)

Recurring revenue: $7M-$15M

Total year 10: $32M-$60M

By year 10, the firm has a substantial outstanding administration book, a meaningful refunding pipeline, and a closing run rate of 35-50 deals per year. The recurring revenue alone is what justifies the platform investment — the closings are the entry point but the annuity is the moat.

## **5.8 Fee Discipline — The Cultural Issue**

Building the firm with fee discipline is a cultural question as much as a commercial one. Every middle-market financial services firm gets pressured to discount fees. Sponsors will ask. Brokers will push. BD partners will pressure. The discipline to hold fees at the level the work justifies — and to walk away when the price doesn't reflect the value — is what compounds margin over time.

The defense of fee discipline is the value the firm delivers. If Nest's execution genuinely is faster, cleaner, more sophisticated, and lower-risk than the competitive alternatives, the fees are defensible at market. If the execution is not differentiated, no fee discipline holds. The fee discipline and the execution quality reinforce each other — and both require continuous investment in the platform, the team, and the rule library.

**THE FEE DISCIPLINE PRINCIPLE:** The platform's automation creates cost savings versus traditional execution. Those savings do not get returned to the sponsor in discounted fees. The savings become Nest's captured margin. The sponsor pays market or near-market fees and receives a better execution. Nest pays itself well by being better, not by being cheaper.

## **5.9 Quick Reference — Silo 5**

### **Per-Deal Fee Summary — $50M Middle-Market Conduit Bond**

**Pre-screen fee (Stage 3) —** $15K-$25K

**COI structuring fee (Stage 12) —** $200K-$400K

**Underwriter discount share at 60/40 split (Stage 12) —** $300K-$600K

**Total at closing —** $515K-$1.025M

**Construction admin (over 24 months) —** $50K-$200K

**Annual admin (annual, on $50M outstanding) —** $75K-$150K

**Cumulative over bond life (undiscounted) —** $3M-$7M total

**Cumulative present value —** $1.5M-$3M total

### **Counterparty Fee Inventory (Total COI on $50M Deal)**

Bond Counsel: $125K-$200K (after Nest draft savings)

Sponsor's Counsel: $75K-$125K

Underwriter's Counsel: $50K-$100K (often in discount)

Rating Agency (one): $100K-$150K

Trustee: $10K-$25K

Conduit Issuer: $200K-$400K

Feasibility / Market Consultants: $75K-$300K

Auditor: $15K-$50K

Verification (refundings): $15K-$40K

Title and Insurance: $25K-$150K

Printing / DTC / CUSIP: $15K-$30K

Nest Structuring Fee: $200K-$400K

Underwriter Discount (paid from proceeds): $500K-$1M

Total COI Stack: ~$1.4M-$3M on a $50M deal

# **SILO 6 — CALLS, PUTS, AND OPTIONALITY**

This is the elegance section. Calls and puts and the redemption architecture more generally are the most powerful structural levers in bond work, and the place where the difference between a thoughtful banker and a template-runner is most visible. A bond without thoughtfully designed optionality is a bond that has cost the issuer money and reduced the structural value of the issuance. A bond with elegant optionality is one that flexes with the rate environment, gives the issuer the right to refinance when it's economic to do so, protects bondholders against the optionality risks they actually price for, and produces pricing 10-50 basis points tighter than a template-driven structure would.

This silo walks every type of call, every type of put, the math behind each, the deployment rules, and the rule library entries that govern when each variant is appropriate.

**THE OPTIONALITY PRINCIPLE —** Every option in a bond — whether the issuer's call right, the bondholder's put right, or a mandatory redemption trigger — has economic value. That value is priced into the bond at issuance. The structuring decision is whether to include the option and at what terms. The wrong call structure costs the issuer 20-50 bps of coupon. The right structure preserves the refinancing flexibility the issuer needs and the protection the bondholder requires, at minimal cost.

## **6.1 What an Option in a Bond Is, Economically**

Every redemption provision in a bond is a contractual option held by one party against the other. The issuer's call right is a long call on the bond's value held by the issuer — when interest rates fall and the bond's value rises above par, the issuer's call right has positive value (the issuer can buy back the bonds at the call price below their market value). The bondholder's put right is a long put held by the bondholder — when interest rates rise or credit deteriorates and the bond's value falls below par, the put gives the bondholder the right to sell back at the put price.

These options have value calculable through standard option pricing methodologies (Black-Scholes for European options, binomial or lattice models for American options, Monte Carlo for complex path-dependent options). In practice, bond market option pricing relies on lattice-based models because interest rate dynamics are mean-reverting (Vasicek, CIR, Hull-White, and Heath-Jarrow-Morton frameworks dominate). For Nest's structuring purposes, the platform doesn't need to compute exact Black-Scholes values — it needs to apply rule-based heuristics that capture the economic intuition.

The simpler intuition: every option costs the party who grants it. An issuer who grants a call right to bondholders pays for it through a higher coupon. A bondholder who grants a put right to the issuer (rare, but possible) receives a lower coupon in compensation. Bond pricing accounts for option value continuously through option-adjusted spread (OAS) — the spread on the bond adjusted for the value of embedded options. A bond's stated yield and its OAS differ by the value of the embedded options.

## **6.2 The Issuer's Call Right — Optional Redemption**

The most common and most economically important option in middle-market bonds. The issuer has the right (not the obligation) to redeem some or all of the outstanding bonds before maturity at a defined call price on or after a defined call date. The issuer exercises when economic — typically when rates have fallen enough that refinancing produces NPV savings exceeding the call premium plus transaction costs.

### **6.2.1 Non-Call Period and Call Date**

The non-call period is the time between issuance and the first date the issuer can call. Standard structures by deal type:

**Tax-exempt municipal bonds**: non-call-10 (cannot call until year 10 from issuance) is the historical standard. The Tax Cuts and Jobs Act of 2017 eliminated advance refunding of tax-exempt bonds with tax-exempt bonds, making non-call-10 less consequential than it was pre-2017 (when issuers would advance-refund inside the non-call period using taxable bonds, then re-refund with tax-exempt bonds after the call). Today, non-call-10 is still common but non-call-7 and even non-call-5 are seen on certain shorter-call structures.

**Corporate 144A bonds**: typically non-call-life with make-whole call (callable any time at make-whole price). Sometimes structured with a par call window opening 6 months before maturity.

**Project finance bonds**: varies widely. Investment-grade infrastructure project bonds often have make-whole call only. Sub-investment-grade project bonds sometimes have hybrid structures (non-call-3 or 5 with subsequent call at premium).

**High-yield bonds (corporate)**: typically non-call-3 or non-call-5 with subsequent call at premium declining to par over time. Sometimes with equity claw (right to redeem up to 35% with equity proceeds at premium during non-call period).

### **6.2.2 Call Price**

The price at which the issuer can call. Standard structures:

**Par call** (call price = 100): the simplest structure. After the non-call period, the issuer can call at face value. Common for municipal bonds; less common for corporate or project bonds.

**Premium call** (call price > 100, declining over time): a stepdown structure where the call premium declines toward par as the bond seasons. For example, a 10-year non-call period followed by call at 105 in year 11, 104 in year 12, 103 in year 13, 102 in year 14, 101 in year 15, and par thereafter. Common in high-yield corporate bonds.

**Make-whole call** (call price = present value of remaining cash flows at a reference rate plus spread): the issuer can call any time at a price that fully compensates the bondholder for the present value of remaining coupon and principal. Used for corporate investment-grade and project bonds where call flexibility is needed but bondholders demand protection. The make-whole spread (typically 25-50 bps over the reference Treasury rate) determines how generous the call price is to bondholders.

**Doubling option**: the issuer can call up to a defined multiple of the scheduled sinking fund payment in a given year. Allows the issuer to retire bonds faster than the sinking fund schedule when cash is available.

### **6.2.3 Call Mechanics**

Once the call window opens, the issuer must follow the indenture's procedures to exercise. Standard procedures: (1) issuer delivers written call notice to the trustee at least 30 (sometimes 60) days before the call date; (2) trustee notifies bondholders through DTC and the registrar; (3) on the call date, the issuer wires the call price plus accrued interest to the trustee; (4) the trustee distributes to bondholders; (5) the bonds are retired and cancelled. The mechanical execution is straightforward but the lead time matters — issuers cannot call instantly.

### **6.2.4 Partial Call vs. Full Call**

Calls can be full (redeeming the entire outstanding issue) or partial (redeeming a portion). Partial calls are allocated among bondholders by lot, by pro-rata allocation, or by maturity (in a serial bond, the issuer can choose to call a specific maturity).

### **6.2.5 The Make-Whole Call — The Most Important Variant for Corporate Work**

The make-whole call deserves its own treatment because it's the dominant call structure in middle-market corporate and project finance bond work.

**Make-Whole Call Price Formula —** Max(par, PV of remaining payments at Treasury yield + make-whole spread)

Mechanically: at the call date, compute the present value of all remaining coupon payments and the final principal payment, discounted at a reference rate (typically the Treasury yield matching the bond's remaining life) plus the make-whole spread (typically 25-50 bps, sometimes higher for sub-investment grade). The call price is the higher of par or this present value.

Economic interpretation: when rates have risen above the bond's coupon since issuance, the PV calculation produces a number below par, so the call price = par. The issuer can call at par any time. When rates have fallen below the bond's coupon, the PV calculation produces a number above par, so the call price > par. The issuer pays the higher price to call, which compensates the bondholder for the lost coupon at the reference rate.

The make-whole spread determines how generous the structure is to the bondholder. A tight make-whole (10-20 bps) gives the issuer cheap call flexibility — bondholders are only modestly compensated. A wide make-whole (50-100 bps) makes the call expensive to exercise — bondholders are well-protected and the issuer rarely calls. Most investment-grade make-wholes are at 25-40 bps; sub-investment-grade are at 50-75 bps.

**WHY THIS MATTERS:** The make-whole spread is the most overlooked structural lever in middle-market corporate bond work. A 10 bps tighter make-whole spread (e.g., 25 bps instead of 35 bps) gives the issuer better call optionality value worth real money at refinancing time. A 10 bps wider make-whole gives the bondholder better protection, which can be exchanged for 5-15 bps of tighter pricing at issuance. The choice between the two is a thoughtful structural decision, not a default.

### **6.2.6 Par Call Window**

A hybrid structure increasingly common on corporate make-whole bonds: callable at make-whole price for most of the bond's life, then callable at par for a defined window (typically 3-6 months) before maturity. The par call window solves a specific problem: as a bond approaches maturity, the make-whole price collapses toward par anyway (very few cash flows left to discount), but the legal and administrative complexity of a make-whole call remains. The par call window lets the issuer call cleanly at par when the make-whole price would be at or near par anyway.

Par call windows of 3-6 months before maturity are now standard on investment-grade corporate make-whole bonds. The pricing impact is minimal because the window is short.

### **6.2.7 Call Optimization — When the Issuer Exercises**

The decision rule for calling: call when refinancing economics produce positive NPV savings. The math:

**Refinancing NPV Savings —** PV of (Old Debt Service − New Debt Service) − Call Premium − Refunding COI

Where: Old Debt Service is the remaining payment stream on the existing bonds; New Debt Service is the payment stream on the refunding bonds at current rates; Call Premium is the call price minus par; Refunding COI is the upfront cost of the refunding bonds.

Positive NPV savings means refinancing is economic. The rule of thumb in muni markets: refunding makes sense when NPV savings exceed 3-5% of par being refunded. Below that threshold, the gains are too small to justify the complexity and risk.

Nest's platform runs this analysis continuously across the administered portfolio. Every quarter, the platform recomputes refunding NPV savings for every administered bond under current rate conditions. When a bond crosses the economic threshold, the platform flags for review and presents the refunding opportunity to the obligor. This is one of the highest-leverage uses of the administration platform — the obligor benefits from proactive identification, and Nest captures the refunding fee event.

## **6.3 Mandatory Redemption**

Distinct from optional call, mandatory redemption is required by the indenture when defined conditions occur. Major mandatory redemption categories:

### **Sinking Fund Redemption**

Scheduled in advance. The bond's principal is retired in defined installments before stated maturity, with the trustee selecting bonds for redemption by lot or pro-rata. Sinking fund redemption is fundamentally the same economic structure as serial amortization — both result in principal being retired before stated maturity — but the sinking fund mechanism is used for term bonds (where all bonds have the same stated maturity) to achieve the same gradual paydown.

Sinking fund schedules are defined in the indenture and are non-negotiable post-issuance. The borrower must fund the trustee's sinking fund account by the redemption date or be in default.

### **Extraordinary Mandatory Redemption**

Triggered by defined events. Common triggers in tax-exempt bonds:

Loss of tax-exempt status — if the IRS rules the bonds taxable, the indenture typically requires immediate redemption at par

Condemnation of the financed project — eminent domain proceedings against the financed asset

Substantial casualty loss — major damage to the financed project (fire, flood, etc.) that prevents repair or repurposing

Unused bond proceeds — if construction is completed under budget, unused proceeds may be required to redeem bonds rather than be released to the borrower

Excess investment earnings — for some tax-exempt structures, investment earnings on bond proceeds above defined thresholds must be used to redeem bonds

### **Special Optional Redemption**

A hybrid — optional at the issuer's discretion but triggered by specific events. Common provisions: redemption right if the borrower experiences a change of control; redemption right on certain regulatory or legal changes affecting the issuer's tax status; redemption right on certain rating actions. Special optional redemption gives the issuer flexibility without bondholders fully bearing the call risk.

## **6.4 The Bondholder's Put Right**

The mirror of the issuer's call right. The bondholder has the right (not the obligation) to require the issuer to redeem the bondholder's bonds at a defined put price on or after a defined put date. The bondholder exercises when economic — typically when rates have risen above the bond's coupon and the bondholder wants to recycle capital at higher current rates, or when credit has deteriorated and the bondholder wants out.

### **Hard Put**

Unconditional. On the put date, the bondholder can require redemption at par regardless of any other circumstance. Common in variable-rate demand obligations (VRDOs) — the bondholder has a put right on each rate reset date, supported by a liquidity facility that ensures redemption funds are available. Hard puts are expensive for the issuer because the issuer must maintain liquidity to honor any put exercise.

### **Soft Put**

Conditional on defined triggers. Standard triggers: change of control of the obligor; rating downgrade below a threshold; defined fundamental changes in the obligor's business or structure. Soft puts protect bondholders against discrete material adverse events without giving them general put rights.

### **Tender Option**

Similar to a put but with different mechanics. The bondholder can offer to sell the bonds back to a tender option provider (a bank or other liquidity provider) at a defined price. Used in tender option bonds (TOBs) — a structured tax-exempt product where the underlying bond is held in a trust and short-term floating-rate certificates are issued against it with a tender option supported by the bank.

### **Mandatory Tender**

Required tender on defined dates. The bondholder must surrender bonds for repurchase at the mandatory tender date; the issuer or remarketing agent must purchase. Mandatory tender allows VRDOs to be remarketed at new rates periodically — the existing bondholders are tendered out, new bondholders buy at the new rate. The mandatory tender keeps the bond liquid and allows rate resets.

## **6.5 Sinking Fund vs. Serial Maturity — Optionality Implications**

Term bonds with sinking funds and serial bonds achieve similar principal paydown patterns but with different optionality implications:

Sinking fund bonds: the issuer can typically satisfy the sinking fund obligation by either (a) calling bonds at par per the scheduled amount, or (b) buying bonds in the open market for cancellation. If the bond is trading below par, the issuer can buy in the market at a discount, retiring the same par for less cash — captured optionality value.

Serial bonds: each maturity is its own bond. The issuer cannot buy in the open market and apply against a future serial maturity. Less optionality flexibility.

## **6.6 Optionality Combinations — The Architectural Section**

The above are the building blocks. Real bonds combine them. Below are the standard combinations and the deployment rules.

### **Combination 1: Standard Muni — Non-Call-10 with Par Call**

The historical workhorse of municipal bond structures. Non-call for 10 years from issuance, then callable at par any time thereafter. Pricing impact: the bondholder accepts a defined call risk (the bond can be called at par if rates fall), priced into the bond as a higher coupon than a non-callable equivalent.

**Use —** Tax-exempt municipal revenue bonds, conduit revenue bonds, project bonds where a clean refinancing path is needed.

**Pricing impact vs. non-callable —** +20 to +50 bps coupon depending on rate environment and bond's premium/discount status

**Rate environment optimization —** Most valuable in declining rate environments where issuer plans to refinance. Less valuable in stable or rising rate environments.

### **Combination 2: Corporate Make-Whole Plus Par Call Window**

Investment-grade corporate standard. Callable any time at make-whole price (issuer Treasury + 25-50 bps), with a par call window in the final 3-6 months before maturity.

**Use —** Investment-grade corporate bonds, project finance bonds with strong credit, infrastructure bonds.

**Pricing impact vs. non-callable —** +5 to +15 bps for a tight make-whole (e.g., +25 bps spread). +15 to +30 bps for a wider make-whole.

**Strategic rationale —** Gives issuer clean refinancing path without bondholders priced for hard call risk. Make-whole price is typically uneconomic to exercise except in unusual circumstances, so bondholders rarely lose capital to the call.

### **Combination 3: High-Yield Step-Down Premium Call**

Standard high-yield corporate structure. Non-call-3 or non-call-5, then callable at a premium that declines toward par over time.

**Use —** Sub-investment-grade corporate bonds, leveraged finance, high-yield middle-market issuances.

**Example schedule —** Non-call-5; callable at 105 in year 6, 104 in year 7, 103 in year 8, 102 in year 9, 101 in year 10, 100 thereafter.

**Pricing impact —** Substantial — high-yield bonds price for the call risk. The call structure trades the issuer's expected refinancing path against the bondholder's pricing demands.

### **Combination 4: VRDO Structure**

Variable-rate demand obligation. Continuous tender option supported by a bank LOC. Rate resets weekly or daily. Bondholders can tender any week. Most municipal weekly VRDOs use this structure.

**Use —** Municipal short-term funding, project financings with construction-period uncertainty about long-term needs.

**Pricing impact —** Very low coupons (typically 50-200 bps spread to SIFMA index) because of the put and liquidity support.

**Cost —** Annual LOC fees of 50-150 bps. Liquidity facility fees. Remarketing agent fees.

**Risk —** If the LOC bank's credit deteriorates, the bond's effective rating drops. If the LOC expires and is not replaced, the bond is in default. Significant active management required.

### **Combination 5: Project Bond with Conditional Call**

Sometimes used in project finance. Callable on standard make-whole terms throughout life, plus a special optional call triggered by project events (early stabilization beating projections, sale of the project, equity infusion enabling refinancing). The conditional call allows the issuer to capture upside scenarios without burdening every-day economics.

### **Combination 6: Equity Claw**

Allows the issuer to redeem up to a defined portion (typically 35%) of the bonds with proceeds from equity issuance at a defined premium during the non-call period. Common in high-yield corporate bonds. Gives the issuer a path to delever using new equity even before the standard call window opens. Used heavily by private equity-owned companies that expect IPO or strategic exit in the medium term.

## **6.7 The Issuer's Decision Rules — When to Deploy Each Structure**

These are the structural decision rules Nest's platform applies. Each rule has the form 'when X conditions exist, deploy Y structure.'

### **Rule O-01: Tax-Exempt Long-Dated Muni**

**Conditions —** Tax-exempt municipal or conduit revenue bond, 20-35 year maturity, fixed rate

**Recommended structure —** Non-call-10 with par call thereafter

**Rationale —** Standard municipal structure. Bondholders expect it; pricing reflects it; refinancing flexibility preserved.

### **Rule O-02: Investment-Grade Corporate**

**Conditions —** Investment-grade corporate or project bond, taxable, 7-30 year maturity

**Recommended structure —** Make-whole call at Treasury + 25-40 bps with par call window 3-6 months before maturity

**Rationale —** Standard IG corporate structure. Modest coupon impact, clean refinancing path, bondholders fully compensated if call exercised.

### **Rule O-03: Sub-Investment-Grade Corporate**

**Conditions —** BB or B-rated corporate bond, taxable, 5-10 year maturity

**Recommended structure —** Non-call-3 or non-call-5 with subsequent step-down premium call to par

**Rationale —** High-yield standard. Bondholders demand protection against early refinancing; step-down protects them while giving issuer eventual flexibility.

### **Rule O-04: Variable Rate Construction or Bridge**

**Conditions —** Construction-period financing or other short-term need with later refinance, tax-exempt eligible

**Recommended structure —** Weekly VRDO with bank LOC enhancement, mandatory tender at LOC expiration

**Rationale —** Captures short-term rate environment. Allows refinancing to long-term fixed when construction completes. Active management required.

### **Rule O-05: Rate Environment Adjusted Optionality**

**Conditions —** Rates have risen 75+ bps from initial deal kickoff to pricing

**Recommended action —** Tighten the call protection — shorter non-call period, lower premium call, or more aggressive make-whole spread

**Rationale —** In rising-rate environments, the optionality value to the issuer is reduced (refinancing is less likely to be economic). Trade away some of the option for tighter coupon.

### **Rule O-06: Rate Environment Adjusted Optionality (Falling)**

**Conditions —** Rates have fallen 75+ bps from initial deal kickoff to pricing

**Recommended action —** Preserve call optionality even at modestly higher coupon cost

**Rationale —** In falling-rate environments, the option value to the issuer is high. Preserve refinancing flexibility for the medium-term future.

### **Rule O-07: Project Bond with Construction Risk**

**Conditions —** Project bond with greenfield construction

**Recommended structure —** Special optional redemption tied to project events (stabilization, sale, equity-out), in addition to standard call structure

**Rationale —** Project events may produce refinancing opportunities that wouldn't be available under standard call timing. Build in the optionality.

### **Rule O-08: Sponsor with Likely Sale or IPO**

**Conditions —** Private equity-backed obligor, high-yield rating, 5-7 year expected hold

**Recommended structure —** Step-down premium call plus equity claw

**Rationale —** Sponsor will refinance or retire bonds when sale or IPO occurs. Equity claw gives partial paydown using exit proceeds before full call window opens.

### **Rule O-09: First-Time Issuer Discount**

**Conditions —** Obligor is first-time bond issuer with no prior market history

**Recommended action —** Slightly more conservative call structure (longer non-call, wider make-whole) to compensate for higher uncertainty

**Rationale —** First-time issuers face higher pricing already. Adding some bondholder protection through call structure can help offset some of the pricing impact and broaden the buyer pool.

### **Rule O-10: Putable Structures for Specific Buyer Demand**

**Conditions —** Buyer pool includes bond funds or money market funds with specific duration mandates

**Recommended action —** Consider a soft put structure tied to specific triggers, expanding buyer pool

**Rationale —** Putable bonds broaden buyer pool at modest pricing cost. Use selectively when the buyer pool expansion justifies the cost.

## **6.8 Roll-Up and Roll-Down — Tactical Structuring**

Beyond the core call/put architecture, roll structures are tactical maneuvers that capture value at specific moments in the bond's life. The term 'roll' refers to the rollover from one structure or rate environment to another.

### **Roll-Up**

Extending a bond's maturity by issuing new bonds that effectively refinance and extend. The bondholder receives the new bond in exchange for the old. Used when the obligor needs longer-dated financing than the original bond contemplated. Tax-exempt roll-ups have specific IRS implications under the refunding rules.

### **Roll-Down**

The opposite. Issuing shorter-dated bonds to refinance longer-dated bonds. Used when the obligor's strategy has shifted to expect earlier monetization or when current rates are dramatically favorable to lock in shorter-term rates. Less common than roll-up.

### **Coupon Rolls**

Refinancing to capture coupon savings while maintaining maturity. Standard refinancing. The bond's NPV savings analysis governs whether the roll makes sense.

### **Tranche Rolls**

On multi-tranche issuances, rolling one tranche while leaving others outstanding. For example, refinancing the Series A senior while leaving the Series B subordinate in place. Captures rate environment changes asymmetrically across the capital stack.

## **6.9 The Mathematics of Call Decisions**

Three formulas drive call decisions, run continuously by the platform on the administered portfolio.

### **Formula CALL-01: Refunding NPV Savings**

**Formula —** NPV Savings = Σ [PV of Old DS\_t − PV of New DS\_t] − Call Premium − Refunding COI

**Variables —** Old DS\_t = remaining debt service on existing bonds at period t. New DS\_t = debt service on refunding bonds at period t. Call Premium = call price − par × bonds being called. Refunding COI = upfront costs of the refunding issuance.

**Decision rule —** NPV Savings > 3% of par being refunded → refunding is economic. NPV Savings > 5% → strong refunding signal.

### **Formula CALL-02: Make-Whole Call Price**

**Formula —** Make-Whole Price = Max(Par, Σ [Remaining CF\_t / (1 + Reference Rate + Make-Whole Spread)^t])

**Variables —** Remaining CF\_t = remaining coupon and principal at period t. Reference Rate = Treasury yield matching bond's remaining maturity. Make-Whole Spread = the spread defined in the indenture (typically 25-50 bps).

**Use —** Computed at the time of potential call to determine whether call is economic for the issuer.

### **Formula CALL-03: Breakeven Rate**

**Formula —** Solve for r such that PV(Old DS at r) = PV(New DS at r) + Call Premium + COI

**Variables —** r = breakeven refunding rate. Old DS = existing bond debt service. New DS = refunding bond debt service at rate r.

**Decision rule —** If current market rate < breakeven rate, refunding is economic. The gap between current rate and breakeven is the cushion.

## **6.10 Quick Reference — Silo 6**

### **Key Terms**

**Optional redemption / call** — issuer's right to redeem before maturity

**Mandatory redemption** — required redemption upon defined trigger

**Non-call period** — period during which the issuer cannot call

**Par call** — call at face value (100)

**Premium call** — call at price above par, often declining over time

**Make-whole call** — call at PV of remaining payments at reference rate + spread

**Make-whole spread** — the bps added to reference rate to compute make-whole price

**Par call window** — defined period before maturity when issuer can call at par

**Doubling option** — right to redeem multiple of sinking fund payment

**Hard put** — unconditional bondholder put right

**Soft put** — conditional bondholder put right

**Mandatory tender** — required bondholder tender on defined dates

**Tender option** — bondholder right to tender to liquidity provider

**Sinking fund** — mandatory periodic principal redemption

**Equity claw** — right to redeem portion with equity proceeds at premium

**Roll-up** — extension of maturity through refinancing

**OAS (Option-Adjusted Spread)** — spread on bond adjusted for embedded option value

### **Core Formulas**

**Refunding NPV Savings —** Σ [PV Old DS − PV New DS] − Call Premium − Refunding COI

**Make-Whole Call Price —** Max(Par, Σ [Remaining CF / (1 + Treasury + MW Spread)^t])

**Breakeven Refunding Rate —** Solve r such that PV(Old DS) = PV(New DS) + Call Premium + COI

**Refunding Economic Threshold —** NPV Savings > 3-5% of par being refunded

### **Decision Rule Inventory**

O-01: Tax-exempt long-dated muni → non-call-10 with par call

O-02: IG corporate → make-whole at Treasury+25-40 bps with par call window

O-03: Sub-IG corporate → non-call-3 or 5 with step-down premium

O-04: Variable rate / construction → VRDO with LOC and mandatory tender

O-05: Rising rate environment → tighter call protection

O-06: Falling rate environment → preserve call optionality

O-07: Project bond with construction risk → special optional redemption tied to project events

O-08: PE-backed sponsor with exit horizon → step-down premium plus equity claw

O-09: First-time issuer → conservative call structure for buyer comfort

O-10: Specific buyer demand → soft put for buyer pool expansion

# **SILO 7 — COVENANTS AND COMPLIANCE**

Covenants are the operating restrictions and reporting obligations the borrower accepts for the life of the bond. They are the bondholders' early-warning system, their constraint on borrower behavior between issuance and maturity, and their basis for declaring default when the borrower deviates from agreed conduct. A well-designed covenant package gets the bond rated, gets it priced, and protects the bondholders without strangling the borrower's normal operations. A poorly designed covenant package either fails to sell the bond or trips constantly on normal operating fluctuations, eroding the relationship and creating expensive amendment work.

Covenant design is one of the most underappreciated craft areas in middle-market bond work. Regional bankers default to template covenants because that's what their precedent contains. Nest's platform brings systematic discipline — every covenant is calibrated to the deal's expected operating pattern, the rating target, the buyer pool's expectations, and the structural cushions built elsewhere in the deal.

**THE COVENANT PRINCIPLE —** Covenants must be tight enough to give bondholders real protection and loose enough that normal operating volatility does not trip them. The cushion between expected operating performance and covenant threshold is the design variable. Too thin and the covenant trips often, generating waiver requests, amendment fees, and relationship damage. Too wide and the covenant gives no protection, which the rating agency and buyers will price for.

## **7.1 The Five Categories of Covenants**

Every covenant in a bond falls into one of five categories: (1) financial covenants — quantitative tests the borrower must meet; (2) affirmative covenants — things the borrower must do; (3) negative covenants — things the borrower cannot do without consent; (4) reporting covenants — what gets delivered to whom and when; (5) operational covenants — sector-specific operating obligations. This silo walks each category and the variants within.

## **7.2 Financial Covenants**

The quantitative tests. These are the covenants that show up in monthly or quarterly compliance certificates and trigger most events of default in practice.

### **Debt Service Coverage Ratio (DSCR)**

**Definition —** Net Operating Income / Total Debt Service for the period

**Typical threshold —** 1.10x to 1.40x depending on asset class and rating

**Tested —** Quarterly or semi-annually on a trailing 12-month basis (TTM); sometimes also on a forward 12-month basis

The most common financial covenant in revenue bond and project bond work. The borrower's NOI (or, for some asset classes, net cash flow available for debt service) must exceed the period's debt service by a defined multiple. Below the threshold is a default event, possibly subject to cure provisions.

Design considerations: (1) the test period — TTM smooths short-term volatility, current-period testing catches deterioration faster; (2) the definition of NOI — what gets included, what gets excluded, how non-recurring items are treated; (3) the definition of debt service — actual debt service on the bonds plus any other senior debt, or all consolidated debt; (4) cure provisions — equity infusion to cure shortfall, conversion of shortfall to subordinate, suspension during construction; (5) the threshold itself — how much cushion above expected operations.

**THE DSCR DESIGN:** For a stabilized multifamily revenue bond with expected DSCR of 1.45x, a 1.20x covenant threshold gives the borrower a 0.25x cushion — roughly 17% revenue decline before trip. That's enough cushion to absorb normal vacancy and rent volatility without tripping. A 1.15x covenant gives only 0.30x cushion — adequate but tighter. A 1.30x covenant gives 0.15x cushion — too tight, will trip often. The platform calibrates the covenant to the asset class's volatility profile.

### **Maximum Annual Debt Service (MADS) Coverage**

**Definition —** Net Operating Income / Maximum Annual Debt Service over the bond's remaining life

**Typical threshold —** 1.10x to 1.30x depending on context

Variant of DSCR that uses the peak year's debt service rather than the current year. Important for serial bonds and amortizing bonds where debt service varies significantly across the life. MADS coverage protects against the borrower passing tests in low debt service years but being structurally unable to support peak years. Required by some rating agencies as a basis for revenue bond ratings.

### **Additional Bonds Test (ABT)**

**Definition —** Coverage ratio test applied prospectively when borrower wants to issue additional bonds secured by the same revenue stream

**Typical threshold —** 1.20x to 1.50x DSCR including the new bonds, calculated on either historical or projected revenues

Critical anti-dilution protection. Without an ABT, the borrower could keep issuing more bonds against the same revenue stream, diluting the existing bondholders' protection. The ABT requires that, after giving effect to the new bonds, coverage on the existing and new bonds combined remains above a defined threshold. Stronger ABTs use TTM actuals; weaker ABTs use forward projections (which the borrower controls).

**ABT design variants —** (a) Historical test only — most protective; (b) Forward test only — least protective; (c) Either historical or forward — borrower's choice, common compromise; (d) Higher threshold for forward than historical — discourages reliance on projections

### **Rate Covenant**

**Definition —** Borrower commitment to set rates or charges at levels that produce coverage above a threshold

**Use —** Utility revenue bonds, water and sewer bonds, healthcare bonds with rate-setting authority

Specific to revenue bonds where the borrower has authority to set the rates that generate the revenues — utilities, healthcare providers, transportation authorities. The rate covenant requires the borrower to set rates each year at levels projected to produce coverage above the threshold. Failure to set adequate rates is a covenant violation, even before actual coverage fails.

The rate covenant is the bondholders' protection against the borrower deliberately under-raising rates. Without it, a politically-motivated municipal utility could keep rates low to please customers while bondholders bear the consequences. The rate covenant makes the rate-setting a contractual obligation.

### **Leverage Covenants**

**Maximum leverage ratio —** Debt / EBITDA, typically capped at 4.0x to 7.0x for middle-market corporate

**Maximum total debt to capitalization —** Typically 65%-85%

**Net debt to EBITDA —** Often used in conjunction with above

Standard corporate bond covenants. Caps total debt relative to earnings or balance sheet, preventing the borrower from over-leveraging during the bond's life. Step-down provisions sometimes apply — leverage cap declines over time as the borrower is expected to deleverage.

### **Debt Yield**

**Definition —** Net Operating Income / Total Debt

**Typical threshold —** 8%-12% depending on asset class

Increasingly common in real estate bond work. Debt yield measures NOI as a percentage of debt — analogous to a return-on-debt ratio. Unlike LTV (which depends on valuation that can fluctuate) or DSCR (which depends on rate environment), debt yield is purely a function of cash flow and debt amount. Some buyers prefer debt yield as a covenant because it is harder to manipulate.

### **Liquidity Covenants**

**Minimum unrestricted cash —** Defined dollar amount or months of operating expenses

**Minimum days cash on hand —** Common in healthcare: 60 to 200+ days depending on rating

**Minimum operating reserve —** Defined fund balance maintained in reserve

Cash and liquidity protection. Protects against the borrower running operations close to the edge. Particularly important in healthcare (where minimum days cash on hand is a primary covenant), senior living, and other operating-intensive sectors.

### **Fixed Charge Coverage Ratio (FCCR)**

**Definition —** (EBITDA + Rent) / (Interest + Rent + Required Principal Payments)

**Typical threshold —** 1.10x to 1.30x

Standard in corporate bond work. Includes rent and lease obligations alongside debt service to capture the borrower's full fixed obligations. Particularly relevant for asset-light operating companies with significant lease obligations.

### **Net Worth and Tangible Net Worth**

**Minimum net worth —** Dollar amount, sometimes with step-up provisions

**Minimum tangible net worth —** Net worth excluding goodwill and intangibles

Balance sheet protection. Less commonly used as a primary covenant but appears in corporate bonds, particularly for asset-light businesses where balance sheet strength matters.

## **7.3 Affirmative Covenants**

Things the borrower must do. Standard inventory below — the platform produces these from templates indexed to deal type.

### **Maintain Existence**

Borrower must maintain its legal existence and good standing in its jurisdiction of organization and every jurisdiction where qualified to do business. Standard.

### **Maintain Properties and Insurance**

Borrower must maintain the financed asset and all material business assets in good condition. Maintain insurance coverages defined in the indenture — property, casualty, liability, business interruption, environmental where applicable, flood where applicable. Insurance covers must be at defined minimum amounts and from carriers rated above defined thresholds (typically A.M. Best A- or S&P A or better). Trustee must be named as additional insured or loss payee on relevant policies.

### **Pay Taxes and Other Material Obligations**

Borrower must pay all taxes when due, all material trade obligations when due, all employment-related obligations. Allows protest in good faith subject to maintenance of reserves.

### **Comply with Laws**

Borrower must comply with all applicable laws, regulations, licenses, and material contracts. For regulated industries (healthcare, education, financial services), this is sector-specific and substantial.

### **Maintain Books and Records**

Borrower must maintain books and records in accordance with GAAP or other applicable accounting standards. Make books available for inspection by the trustee or bondholders' representatives upon request.

### **Use of Proceeds**

Borrower must use bond proceeds for the purposes described in the offering document and the loan agreement. Restrictions on diversion to other purposes.

### **Tax-Exempt Compliance (Tax-Exempt Bonds)**

Borrower must comply with all tax-exempt requirements — restrictions on private use of bond-financed assets, arbitrage yield restrictions, rebate calculations and payments, restrictions on refundings. This is one of the most important affirmative covenants for tax-exempt bonds and the basis for ongoing tax compliance work.

### **Maintain Reserves and Make Deposits**

Borrower must maintain all required reserves (DSRF, R&R, operating reserve, etc.) at the defined minimum levels. Make deposits per the indenture schedule. Replenish reserves drawn down within defined timeframes.

### **Conduct Business in Ordinary Course**

Borrower must conduct its business in the ordinary course consistent with past practice. Restricts fundamental shifts in business model without consent.

### **Maintain Permits and Licenses**

Borrower must maintain all material permits, licenses, and authorizations required for its business. Renew as needed. Notify trustee of any material adverse permit action.

## **7.4 Negative Covenants**

Things the borrower cannot do without bondholder consent. These are typically more heavily negotiated than affirmative covenants because they directly constrain the borrower's strategic flexibility.

### **Limitations on Additional Indebtedness**

The borrower cannot incur additional debt beyond defined exceptions. Standard exception categories:

Permitted refinancing — refinancing existing debt with debt of equal or lesser amount

Permitted working capital — short-term operating debt up to a defined cap

Permitted purchase money debt — debt to finance specific asset acquisitions, secured only by the acquired asset

Permitted subordinate debt — junior debt that meets defined criteria (subordination, maturity, payment standstill)

Permitted additional bonds — additional issuance under the indenture meeting the Additional Bonds Test

Permitted incidental debt — leases, hedging obligations, ordinary course trade payables

The boundary between permitted and prohibited debt is one of the most heavily negotiated areas in the indenture. The platform's default position is moderately tight — allow refinancing and ordinary course needs, restrict significant new senior debt without consent.

### **Limitations on Liens**

The borrower cannot grant liens on its assets except for defined permitted liens. Standard permitted liens:

Liens securing the bond itself (the trustee's lien)

Liens securing permitted additional bonds

Liens for taxes, assessments, statutory obligations not yet delinquent

Mechanic's, materialman's, and similar liens in the ordinary course

Liens securing permitted purchase money debt, on the specifically financed asset only

Easements, rights of way, zoning restrictions not materially impairing use

The lien covenant works in tandem with the additional indebtedness covenant to protect the bondholders' security position. Without a lien covenant, the borrower could grant a senior lien on the same collateral to a new lender, structurally subordinating the existing bondholders.

### **Limitations on Asset Sales**

The borrower cannot sell, dispose of, or transfer material assets except in defined permitted categories. Standard permitted asset sales:

Sale of obsolete or worn-out assets in the ordinary course

Sale of inventory in the ordinary course

Sale of assets up to a defined annual or cumulative dollar threshold

Sale with mandatory reinvestment in similar productive assets within a defined period

Sale with mandatory paydown of the bonds with net proceeds

Asset sale covenants are particularly important on real estate-backed or project-specific bonds where the financed asset itself is the primary collateral. On more diversified credits, the asset sale covenant is more lenient.

### **Limitations on Investments**

The borrower cannot make investments outside defined permitted categories. Standard permitted investments:

Cash and cash equivalents

Government securities

Investments in subsidiaries that are guarantors of the bonds

Investments in joint ventures up to a defined cap

Trade receivables in the ordinary course

Hedging arrangements approved under the indenture

Investment covenants prevent the borrower from diverting cash from operations into speculative or unrelated activities. Particularly important when the bondholders are relying on the borrower's specific business cash flow.

### **Limitations on Restricted Payments**

The borrower cannot make distributions to equity holders, repurchase equity, prepay subordinate debt, or make other 'restricted payments' except under defined conditions. Standard conditions:

No event of default at the time of payment

Pro forma compliance with all financial covenants after giving effect to the payment

Payment falls within a defined annual or cumulative cap

Source of payment is from defined permitted sources (excess cash flow after debt service and reserves)

Restricted payment covenants are the bondholders' protection against the equity sponsor extracting cash from the borrower when the borrower has insufficient cushion. Particularly relevant for private equity-backed borrowers where the sponsor's incentive structure may favor distributions over balance sheet strength.

### **Limitations on Related-Party Transactions**

The borrower cannot enter into transactions with affiliates except on arm's-length terms and with defined approvals. Standard requirements:

Transactions must be on terms no less favorable to the borrower than would be obtained in arm's-length transactions

Transactions above a defined dollar threshold require independent director approval

Transactions above a higher threshold require fairness opinion from a third-party advisor

Related-party covenants are particularly important when the borrower has significant affiliate operations (parent company services, sister entity transactions, principal-related contracts).

### **Limitations on Fundamental Changes**

The borrower cannot undergo defined fundamental changes without bondholder consent. Standard categories:

Mergers and consolidations (except mergers into the borrower with the borrower as survivor)

Sale of substantially all assets

Change of business in a material way

Change of control (subject to defined exceptions)

Voluntary dissolution or liquidation

These restrictions can be combined with a change-of-control put right — the borrower can undergo certain fundamental changes, but bondholders have the right to put bonds back at par if the change occurs.

## **7.5 Reporting Covenants**

What gets delivered to whom and when. Standard reporting requirements:

### **Annual Audited Financial Statements**

**Delivered to —** Trustee, with copies to rating agencies and posted to EMMA for municipal bonds

**Timing —** Within 120-150 days of fiscal year end

**Form —** Audited by independent CPA in accordance with GAAP or other applicable standards

### **Quarterly Financial Statements**

**Delivered to —** Trustee and rating agencies

**Timing —** Within 45-60 days of quarter end

**Form —** Unaudited but management-certified, including statement of compliance with covenants

### **Compliance Certificate**

**Delivered with —** Each quarterly statement

**Content —** Certification by borrower's CFO or chief executive that no event of default exists and the borrower is in compliance with all financial covenants, with detailed calculations of each financial covenant

### **Operating Statistics**

**Delivered —** Quarterly or annually depending on asset class

**Content —** Sector-specific operating data — occupancy, rent roll, patient census, enrollment, throughput, whatever is relevant to the cash flow generating the bonds

### **Budget and Forecasts**

**Delivered —** Annually before fiscal year start

**Content —** Borrower's annual operating budget, capital expenditure plan, and multi-year forecast

### **Material Event Notices**

**Delivered —** Within defined timeframe after the event

**Triggers —** Rating changes, defaults under other debt, draws on credit enhancement, certain bankruptcy events, change of control, defeasance of any bonds, certain other defined material events under SEC Rule 15c2-12

**Filed —** Both to the trustee and (for municipal bonds) to EMMA

### **Specific Sector Reports**

Healthcare bonds may require quarterly utilization reports, payer mix reports, and licensure status reports. Charter school bonds typically require academic performance data, enrollment data, and authorizer reports. Multifamily housing bonds require rent rolls, occupancy reports, and (for LIHTC) compliance reports. Senior living bonds require occupancy by care type, levels of care, and regulatory licensure status. The platform tracks the sector-specific reporting calendar and produces all required reports on schedule.

## **7.6 Operational Covenants**

Sector-specific operating obligations beyond the standard categories above. Each major sector has its own operational covenant pattern.

### **Multifamily Housing (Conventional and Affordable)**

Maintain physical condition of property at defined standards

Maintain occupancy above defined minimums (typically 90%-93%)

Maintain affordability restrictions per the Regulatory Agreement (for affordable housing)

Submit to annual physical inspections

Maintain on-site management or comparable arrangement

### **Healthcare (Hospitals, Senior Living)**

Maintain licensure and accreditation (Joint Commission, CMS, state licensure)

Maintain Medicare and Medicaid participation

Maintain medical staff and key personnel

Comply with applicable HIPAA, EMTALA, Stark, anti-kickback, false claims act, and other healthcare regulations

Minimum days cash on hand

Maintain professional liability and other healthcare-specific insurance at defined levels

### **Charter Schools**

Maintain charter authorization

Meet academic performance benchmarks defined in the charter and the indenture

Maintain enrollment above defined minimums

Maintain regulatory compliance with state department of education

Submit to annual independent academic and financial review

### **Higher Education**

Maintain accreditation

Maintain enrollment above defined minimums

Maintain endowment investment policies

Comply with federal financial aid eligibility requirements

### **Utility / Public Power**

Maintain operational reliability standards

Comply with environmental permits and regulations

Maintain rate-setting authority

Submit annual rate studies

## **7.7 Anti-Dilution Covenants**

Anti-dilution covenants protect bondholders from structural subordination caused by future actions at the borrower or its affiliates.

### **Structural Subordination Protection**

If the borrower has subsidiaries that generate cash flow but are not guarantors of the bonds, those subsidiaries' creditors have priority on the subsidiary's assets and cash flow. The bondholders' claim is structurally subordinate. Anti-dilution covenants protect against this by either (a) requiring all material subsidiaries to be guarantors, (b) capping the borrower's investment in non-guarantor subsidiaries, (c) requiring upstream of cash from non-guarantor subsidiaries to the borrower, or (d) requiring debt issued at the parent level to be no senior to the bonds at the parent.

### **Parent-Level Debt Limitations**

On deals where the borrower is a subsidiary of a parent holding company, restrictions on debt at the parent level prevent the parent from issuing senior debt that structurally subordinates the subsidiary-level bondholders. Standard restriction: no parent debt unless either subordinated to or pari passu with the bonds, or unless the parent debt is supported by a downstream guarantee from the borrower (which would be a cross-default trigger).

## **7.8 Events of Default and Cure**

The remedies side of covenants. What constitutes a breach, what counts as an Event of Default, and what cure provisions apply.

### **Categories of Events of Default**

Payment default — failure to pay scheduled debt service when due (no grace period for principal at maturity; typically 5-30 days grace for interest and scheduled principal)

Financial covenant default — failure to meet a financial covenant test (often with a 30-60 day cure period to remedy)

Affirmative covenant default — failure to perform an affirmative obligation (typically 30 day cure after notice)

Negative covenant default — taking an action prohibited without consent (often immediate default with no cure)

Misrepresentation — material breach of representation or warranty in the indenture or related documents

Bankruptcy or insolvency — voluntary or involuntary bankruptcy filing, assignment for benefit of creditors, etc.

Cross-default — default under other material debt of the borrower above a defined threshold

Material adverse change — defined event materially impairing the borrower's ability to perform

Loss of tax-exempt status (for tax-exempt bonds) — IRS ruling or other event causing loss of exemption

Failure to maintain credit enhancement — for credit-enhanced bonds, expiration or termination of the LOC or insurance without replacement

### **Cure Provisions**

Most covenant defaults have defined cure periods that allow the borrower to remedy before the default becomes a true Event of Default. Standard cure mechanics:

Equity cure for financial covenants — borrower can cure a missed financial covenant through cash equity infusion (sometimes treated as included in EBITDA, sometimes as a reduction of debt). Often capped (no more than 4 cures in any 5-year period, no more than 2 consecutive).

Cure of payment defaults — extended grace periods on interest (often 5-30 days); none on principal at maturity

Reasonable cure for affirmative defaults — opportunity to remedy within defined period after notice

Forbearance and waiver — bondholders can choose to forbear from acceleration even after default; waivers require defined bondholder approval (typically majority or supermajority)

## **7.9 Amendment Provisions**

How the indenture and covenants can be amended over the bond's life. Three categories of amendments:

### **No-Consent Amendments**

Amendments the issuer and trustee can make without bondholder consent — typically clarifications, corrections of obvious errors, additional security or guarantees, adjustments not adversely affecting bondholders. The indenture defines the scope.

### **Majority Consent Amendments**

Most amendments require consent of a majority of outstanding par. Standard threshold for amendments that don't affect payment terms.

### **Supermajority or Unanimous Consent**

Amendments affecting payment terms (principal amount, interest rate, maturity, payment dates) typically require supermajority (often two-thirds) or unanimous consent. Some indentures require unanimous consent of holders affected by the amendment for payment-term changes.

### **The Practical Reality of Amendments**

Soliciting bondholder consents is expensive and time-consuming. Even majority amendments often take 30-90 days to solicit. Consent fees are typically paid (5-25 bps of consenting par). Nest's platform manages the consent solicitation process — drafting the supplemental indenture or consent solicitation, distributing to bondholders through DTC, tracking returns, calculating consent thresholds, and confirming the amendment when threshold is met.

## **7.10 Covenant Monitoring — The Stage 13 Function**

The platform's covenant monitoring layer is one of its highest-value features. Continuous, automated covenant testing replaces the historical practice of quarterly manual review and reactive default identification.

### **Monitoring Components**

Direct integration with obligor's accounting system where available, with automated pull of monthly financial data

Document ingestion of submitted financial statements where direct integration is not possible

Automated covenant calculation using indenture-defined formulas

Trend analysis — covenant levels over rolling periods, identification of declining trends before they become defaults

Early warning alerts when any covenant approaches threshold (typically 10% cushion remaining)

Compliance certificate generation for obligor's CFO sign-off and trustee filing

Material event detection for SEC Rule 15c2-12 filings

### **Early Warning and Workout Activation**

When the platform detects deteriorating covenant trends, it alerts Sean and Josh in addition to the obligor. The early warning is actionable — at the time the platform detects the problem, several months of cushion typically still exist before actual default. Early intervention (waiver, amendment, restructuring, operational change) is dramatically more cost-effective than reactive workout after default.

## **7.11 Quick Reference — Silo 7**

### **Financial Covenant Inventory**

Debt Service Coverage Ratio (DSCR)

Maximum Annual Debt Service Coverage (MADS Coverage)

Additional Bonds Test (ABT)

Rate Covenant (revenue bonds with rate-setting authority)

Leverage Ratio (Debt / EBITDA)

Debt to Capitalization

Debt Yield

Liquidity (minimum cash, days cash on hand, minimum operating reserve)

Fixed Charge Coverage Ratio (FCCR)

Net Worth and Tangible Net Worth

### **Affirmative Covenant Inventory**

Maintain existence and good standing

Maintain properties and insurance

Pay taxes and material obligations

Comply with laws

Maintain books and records

Use of proceeds restrictions

Tax-exempt compliance (tax-exempt bonds)

Maintain reserves and make deposits

Conduct business in ordinary course

Maintain permits and licenses

### **Negative Covenant Inventory**

Limitations on additional indebtedness

Limitations on liens

Limitations on asset sales

Limitations on investments

Limitations on restricted payments

Limitations on related-party transactions

Limitations on fundamental changes

### **Reporting Covenant Inventory**

Annual audited financials

Quarterly unaudited financials

Compliance certificate

Operating statistics (sector-specific)

Budget and forecasts

Material event notices (Rule 15c2-12 for muni)

### **Design Heuristics**

**Financial covenant cushion —** Set thresholds 15-25% below expected operating performance, calibrated to asset class volatility

**Additional Bonds Test —** Historical TTM test is most protective; require both historical and forward where possible

**Cure provisions —** Equity cure allowed but capped (no more than 4 in 5 years); payment cure with defined grace

**Amendment thresholds —** Majority for most amendments; supermajority/unanimous for payment-term changes

# **SILO 8 — RESERVES AND WATERFALLS**

The waterfall is the elegant heart of every well-structured bond. It is the contractual sequence by which cash flowing from the obligor's operations gets applied to debt service, reserves, operating costs, and surplus. Reserves are the cash pools held by the trustee at defined levels for defined purposes. Together, the reserves and the waterfall create the structural protection that converts a 7% revenue stream into a 4.5%-yielding investment-grade bond — bondholders get paid first, with cushions sized to protect them through downturns, and equity gets what remains.

Reserve sizing and waterfall design are where the difference between sophisticated and template-driven structuring shows up most concretely. A thoughtful banker calibrates each reserve to the specific risk it protects against, sizes the waterfall steps to the asset class's cash flow volatility, and produces a structure that gets the bond rated and priced without over-locking cash that the borrower could productively deploy. This silo walks every reserve type, the sizing rules, and the waterfall architecture.

**THE RESERVE PRINCIPLE —** A reserve protects against a specific risk. The amount of the reserve should match the magnitude and duration of the risk. Over-sizing reserves locks cash that the obligor could deploy productively. Under-sizing reserves fails to give the rating agency or the buyers the protection they want. The art is in matching reserve size to risk with sector-specific calibration.

## **8.1 The Major Reserve Types**

Every bond's reserve structure is assembled from a defined set of reserve types. The platform's structuring agent selects which reserves are appropriate for the deal type and sizes each per the design rules below.

### **Debt Service Reserve Fund (DSRF)**

**Purpose —** Pay debt service when operating cash flow falls short

**Standard sizing —** Maximum Annual Debt Service (MADS) over the bond's life; sometimes 12 months of debt service or average annual debt service

**Funding source —** Bond proceeds at closing, or built up from operating cash flow over a defined period, or a surety bond / LOC in lieu of cash

**Permitted investments —** Defined in indenture — typically US Treasuries, government agency obligations, money market funds rated AAA, certain bank deposits

**Release —** Released at bond maturity, applied to final debt service or returned to obligor depending on indenture

The single most important reserve in revenue bond and project finance bond structuring. The DSRF is the first call when operating cash flow is insufficient for scheduled debt service. The trustee draws from the DSRF to make the payment, then the indenture requires the obligor to replenish the DSRF within a defined period (typically 12 months) from future cash flow.

Sizing variants by asset class:

Multifamily housing: MADS or 12 months — strong revenue stability supports lighter sizing

Healthcare hospital: MADS, sometimes 1.25x MADS — high revenue volatility supports heavier sizing

Senior living: MADS, sometimes with seasonality overlay

Charter schools: MADS, often with replenishment requirements within 6 months

Higher education: 12 months — typically stable revenues support lighter sizing

Utility / public power: 12 months or average annual debt service — very stable revenues

Project finance: MADS or higher; sometimes funded from operating cash flow rather than bond proceeds to manage upfront cost

DSRF funded from bond proceeds is structurally cleaner but increases the par amount needed (because the bond size includes the reserve). DSRF funded from operating cash flow over time (build-up DSRF) reduces upfront par but the reserve isn't fully sized until the build-up period completes — typically 3-5 years. Build-up DSRFs are common on projects with predictable cash flow ramp.

Surety bond or LOC in lieu of cash DSRF: rather than holding cash, the indenture can accept a surety bond from a qualified surety provider or a letter of credit from a qualified bank as substitute for cash DSRF. The surety / LOC promises to pay debt service if the obligor cannot. The obligor pays an annual fee (typically 75-200 bps on the face amount) but does not have to fund the cash. Useful when cash is constrained but rating impact must be considered — many rating agencies prefer cash DSRFs.

### **Capitalized Interest Reserve (Cap-I)**

**Purpose —** Pay interest during construction or operating ramp-up before project cash flow is available

**Standard sizing —** Estimated interest cost from issuance through stabilization, plus 3-6 months of additional cushion

**Funding source —** Bond proceeds at closing

**Release —** Drawn down monthly through construction; remaining balance released to obligor or applied to early redemption at stabilization

On construction bonds and project bonds where the project doesn't generate cash flow during construction or ramp-up, the Cap-I reserve funds the interest payments during that period. Without Cap-I, the obligor would have to fund construction-period interest from other sources — equity contributions, sponsor advances, or interest-only loans — which adds capital stack complexity.

Sizing the Cap-I requires accurate estimation of (a) the construction or ramp-up period duration, (b) the average outstanding bond balance during that period (full par for term bonds, less for amortizing series bonds), (c) the applicable interest rate, and (d) a cushion for unexpected delays. Standard cushion is 3-6 months of additional interest beyond expected completion.

Cap-I is one of the most carefully scrutinized reserves at rating. Rating agencies want to see that the Cap-I will fully cover construction-period interest with comfortable cushion. Inadequate Cap-I sizing is a common cause of construction-period default risk and is heavily weighted in rating committee decisions.

### **Replacement and Repair Reserve (R&R)**

**Purpose —** Fund long-term capital maintenance of the financed asset

**Standard sizing —** Per-unit or per-square-foot annual deposit, accumulating to a target balance

**Funding source —** Monthly deposits from operating cash flow

**Permitted use —** Capital expenditures defined in the indenture — major repairs, replacements, capital improvements; not ordinary maintenance

On real estate-backed bonds and other asset-intensive bonds, the R&R reserve funds the periodic major repairs and replacements that maintain the asset over the bond's life. Standard deposit rates by asset class:

Multifamily housing: $200-$500 per unit per year (newer assets less, older assets more)

Senior living: $300-$800 per unit per year

Hotels: $750-$1,500 per room per year (4-5% of revenue typical)

Healthcare facilities: 2-4% of revenue annually

Charter schools: $50-$150 per student per year, sometimes calculated on square footage

Office and retail: $0.20-$0.50 per square foot per year

The R&R reserve typically caps at a target balance (often 3-5 years of normal deposits) so the reserve doesn't grow unbounded. Once the cap is reached, deposits suspend until the reserve draws down. Some indentures require the obligor to spend R&R only after submission of a capital expenditure plan approved by the trustee or by a project engineer.

### **Operating Reserve**

**Purpose —** Working capital cushion for operating volatility

**Standard sizing —** 3-6 months of operating expenses, sometimes sized as a defined dollar amount

**Funding source —** Bond proceeds at closing or build-up from operating cash flow

**Use —** Available for operating shortfalls without trustee approval (in some indentures) or with notification (in others)

Particularly important for new projects or projects with seasonal revenue. The operating reserve gives the obligor working capital cushion for normal volatility without requiring covenant relief or external support. Healthcare and senior living bonds typically have larger operating reserves (6-12 months); stabilized multifamily and utilities have smaller operating reserves or none at all.

### **Insurance and Tax Escrow**

**Purpose —** Hold cash collected from operating cash flow to pay insurance premiums and property taxes when due

**Standard sizing —** Monthly accrual of estimated annual premium and tax obligations

**Funding source —** Monthly deposits from operating cash flow

**Use —** Direct payment of insurance premiums and property taxes by trustee when due

Standard on real estate-backed bonds. Removes the risk that the obligor fails to pay insurance or taxes — which would impair the collateral and the trustee's lien. The trustee collects monthly and pays the obligations directly when due.

### **Rebate Fund**

**Purpose —** Hold the obligor's arbitrage rebate liability to the IRS for tax-exempt bonds

**Standard sizing —** Calculated by rebate calculation per IRS regulations; due at defined intervals

**Funding source —** Calculation-based; obligor deposits as calculations indicate

**Release —** Paid to IRS at defined intervals (every five years and at bond retirement)

Tax-exempt bond arbitrage rebate rules require the obligor to pay to the IRS any investment earnings on bond proceeds above the bond yield (with some safe harbors and exceptions). The Rebate Fund holds these calculated amounts pending payment to the IRS. Rebate calculations are highly technical and typically performed by specialty arbitrage rebate calculation firms. Common firms include Bingham Arbitrage Rebate Services and BLX Group.

### **Surplus Fund**

**Purpose —** Receive excess cash flow after all senior obligations met

**Use —** Per the indenture — sometimes redemption of bonds, sometimes additional reserves, sometimes release to obligor for equity distribution

The Surplus Fund sits at the bottom of the waterfall. After all higher-priority claims (operating expenses, debt service, reserves, etc.) are satisfied, excess cash flows into the Surplus Fund. The indenture defines what happens to surplus — common provisions: (a) trapped in surplus until released by trustee certification, (b) used for redemption of bonds at defined intervals, (c) used to fund additional reserves up to defined caps, (d) released to obligor for equity distribution per the restricted payment covenant.

### **Construction Fund**

**Purpose —** Hold bond proceeds during construction, released against draw requests

**Standard sizing —** Total construction costs as funded by bonds

**Funding source —** Bond proceeds at closing

**Release —** Per the Construction Disbursement Agreement against certified draw requests

On construction bonds, the bond proceeds intended for construction are held in the Construction Fund. The trustee releases against monthly draws (certified by the construction monitor) and a defined drawdown schedule. The Construction Fund earns investment income during the drawdown period — for tax-exempt bonds, this income is subject to arbitrage yield restriction.

### **Costs of Issuance Fund**

**Purpose —** Pay upfront issuance costs at closing

**Standard sizing —** Total costs of issuance estimated and funded from proceeds

**Release —** All released at closing to pay the COI counterparties

Mechanical fund. Holds the COI portion of bond proceeds at closing and disburses to the counterparties (bond counsel, sponsor's counsel, trustee, rating agencies, conduit, Nest, etc.) at closing. The COI fund is fully drawn at closing and not used thereafter.

### **Special Purpose Reserves (Sector-Specific)**

Beyond the standard reserves above, sector-specific reserves appear in particular deal types:

Initial Operating Deficit Reserve (multifamily affordable, certain new projects) — funds projected operating deficits during initial stabilization

Lease-Up Reserve (multifamily new construction) — funds operating costs during the lease-up period

Marketing Reserve (senior living, new healthcare) — funds marketing and absorption activities during ramp-up

Working Capital Reserve (manufacturing, certain commercial) — supplements operating reserve for working-capital-intensive businesses

Major Maintenance Reserve (infrastructure) — separately tracked from standard R&R for very large periodic maintenance

Renewal Reserve (concession-based infrastructure) — funds long-cycle replacement obligations

Reserve for Compulsory Compliance Items — sector-specific (e.g., student loan servicing transitions, healthcare compliance gaps)

## **8.2 The Cash Flow Waterfall**

The waterfall is the contractual ordering of how operating cash flow gets applied. It is defined in the indenture (and the loan agreement for conduit deals) and is the structural mechanism that protects bondholders. The trustee receives operating cash flow into a defined Revenue Fund and disburses to each tier of the waterfall in priority order.

**THE WATERFALL IS THE CONTRACT —** Every dollar of revenue moves through the waterfall in the same order, every period, for the bond's life. Equity sees only what remains after the senior claims are paid. This contractual ordering is what makes bondholders the senior class even when the obligor has economic motivation to prioritize equity.

### **Standard Waterfall Structure**

A typical waterfall for a revenue bond on an operating asset:

Step 1 — Operating Expenses. Cash flows from operations to the trustee's Revenue Fund first. The trustee then releases to the obligor (or the operating account) the funds needed to pay normal operating expenses for the period. The amount is typically a budgeted operating expense figure with reconciliation for actuals. This step ensures the asset can continue operating — without operating cash, no revenue.

Step 2 — Trustee and Administration Fees. Trustee's monthly or annual fees, paying agent fees, dissemination agent fees, and other ongoing administrative costs of the bond. Small amounts but contractually senior to debt service to keep the administration current.

Step 3 — Senior Bond Debt Service. The current period's senior bond interest and scheduled principal. This is the core payment to bondholders. The Revenue Fund must contain at least this amount before any further waterfall step proceeds.

Step 4 — Senior DSRF Replenishment. If the Senior DSRF has been drawn upon, restore the DSRF to its required level over a defined replenishment period (typically 12 months from the draw event).

Step 5 — Subordinate Bond Debt Service. If subordinate bonds exist, their current period interest and scheduled principal — junior to senior debt service but senior to the rest of the waterfall.

Step 6 — Subordinate DSRF Replenishment. If subordinate DSRF has been drawn upon, restore.

Step 7 — Capital Reserves (R&R, Operating Reserve). Required monthly or annual deposits to the R&R reserve and operating reserve up to their target levels.

Step 8 — Rebate Fund. For tax-exempt bonds, the calculated rebate obligation.

Step 9 — Insurance and Tax Escrow. Required monthly deposits to cover scheduled insurance premiums and property tax obligations.

Step 10 — Permitted Distributions. After all senior claims satisfied, the remaining cash may be available for distribution to equity, subject to the restricted payment covenant. The waterfall typically allows distribution only if (a) all reserves are at required levels, (b) all financial covenants are in compliance, (c) no event of default exists, (d) the distribution is within any defined cap.

Step 11 — Surplus Fund. Remaining cash beyond permitted distributions flows to the Surplus Fund for the indenture-defined use.

### **Waterfall Variations by Deal Type**

The standard waterfall above is for a single-series revenue bond. Real waterfalls vary by deal structure:

Sweeping waterfalls — where excess cash above defined levels is automatically swept to early redemption rather than released to equity. Used in project finance where bondholders want to capture upside cash flow

Trapping waterfalls — where distributions are trapped if covenants are tight, even before actual default. Used when bondholders want preventive cash retention

Multi-series waterfalls — where senior, mezzanine, and subordinate tranches each have their own debt service and reserves, with junior tranches structurally subordinated

Operating-cash-flow-only waterfalls — where only cash flow from operating revenue moves through the waterfall, with insurance proceeds, condemnation awards, etc., flowing through separate processes

LIHTC waterfalls (affordable housing) — incorporate the LIHTC investor's preferred return, deferred development fees, and other equity-tier claims at defined waterfall positions

### **The Waterfall as a Pricing Lever**

Bondholders pay attention to the waterfall structure. A tight waterfall with strong cash trapping and senior protection commands tighter pricing than a loose waterfall that allows distributions readily. Specific design moves that improve pricing:

Cash flow sweep at defined coverage levels — bondholders prefer capture of upside

Distribution traps tied to forward covenant pro forma — bondholders prefer preventive retention

Reserve replenishment ahead of equity distributions — bondholders prefer cushions before equity

Defined waterfall ordering documented in detail — clearer is better, reduces interpretation risk

**THE WATERFALL IS WHERE PRICING COMES FROM:** On a stabilized multifamily bond, the difference between a generic waterfall (debt service then equity, simple) and an elegantly designed waterfall (full reserve sequencing, sweep mechanics, distribution traps, surplus management) can translate to 10-25 bps of tighter pricing. The structure is paying for itself in basis points captured at issuance.

## **8.3 Reserve Sizing — The Quantitative Frame**

Reserve sizing decisions are made at structuring and locked at closing. The platform's structuring agent applies the following rules.

### **DSRF Sizing**

**Default sizing —** Lesser of (i) MADS, (ii) 10% of original principal amount, (iii) 125% of average annual debt service

**Source —** IRC §148(d) safe harbor for tax-exempt bonds; same heuristic used for taxable

**Alternative sizing —** Higher than safe harbor for credits with higher revenue volatility; surety substitution for credits where cash funding is uneconomic

### **Cap-I Sizing**

**Calculation —** Estimated interest expense from issuance through stabilization × 1.15 to 1.30 cushion factor

**Stabilization definition —** Sector-specific — typically the date at which the project achieves stabilized operating cash flow at projected levels

### **R&R Sizing**

**Multifamily —** $200-$500 per unit per year, capped at 3-5 years of annual deposits

**Senior living —** $300-$800 per unit per year

**Hotels —** 4-5% of revenue annually

**Healthcare —** 2-4% of revenue annually

**Charter schools —** $50-$150 per student per year

**Higher education —** Per asset analysis; typically lower

### **Operating Reserve Sizing**

**Multifamily stabilized —** Optional; if included, 3 months operating expenses

**Multifamily new construction —** 6 months operating expenses through stabilization

**Healthcare —** 6-12 months operating expenses depending on rating target

**Senior living —** 6-12 months operating expenses

**Charter schools —** 6 months operating expenses

**Project finance —** 6-12 months operating expenses through ramp

### **Combined Reserve Burden as % of Par**

Putting all reserves together, the typical reserve burden on a middle-market bond runs:

Stabilized multifamily revenue bond: DSRF (12% of par) + Operating Reserve (1-2% of par) + R&R built up over time = ~13-14% of par funded at closing

New construction multifamily bond: DSRF (12%) + Cap-I (8-12% depending on construction period) + Operating Reserve (3-5%) + R&R (build-up) = ~25-30% of par funded at closing

Healthcare hospital bond: DSRF (12-15%) + Days Cash on Hand requirement (separately maintained, not in bond reserves) + R&R = ~12-15% of par funded at closing

Senior living new construction: DSRF (12%) + Cap-I (10-14%) + Operating Reserve (5-8%) + Marketing Reserve (2-4%) + R&R (build-up) = ~30-35% of par funded at closing

Project finance infrastructure: DSRF (12%) + Cap-I (varies by construction period) + Major Maintenance Reserve (build-up) + Operating Reserve = 15-25% of par at closing

These reserve percentages are above what would otherwise be the loan amount sized to the asset. The borrower must either accept a smaller usable loan (after funding reserves from proceeds) or fund the reserves from external sources (equity, sponsor cash, etc.). Reserve sizing is one of the key tradeoffs in the structuring decision.

## **8.4 Reserve Investment Restrictions**

Cash held in reserves is invested by the trustee. The indenture defines permitted investments. Standard permitted investments include:

US Treasuries and government agency obligations

Money market funds rated AAAm by S&P or equivalent

Certificates of deposit at banks rated above defined thresholds

Investment agreements with rated providers (specific to muni bond reserves)

Repurchase agreements collateralized by Treasuries

Tax-exempt bonds rated above defined thresholds (for muni reserves)

For tax-exempt bond reserves, additional restrictions apply under IRC §148 arbitrage yield restrictions. Reserve investments cannot earn materially more than the bond yield (subject to safe harbors and exceptions). This is the source of the arbitrage rebate calculation discussed in Silo 7.

Investment income on reserves typically flows back into the Revenue Fund and through the waterfall, with the trustee crediting the income to the appropriate fund.

## **8.5 Reserve Release and Replenishment**

Reserves are dynamic — they get drawn, they get replenished. The mechanics:

### **DSRF Draw and Replenishment**

DSRF is drawn when the Revenue Fund has insufficient cash to pay scheduled debt service. The trustee draws from the DSRF to make up the shortfall. The indenture then requires the obligor to replenish the DSRF to its required level over a defined period (typically 12 months from the draw event). Replenishment is a high-priority waterfall item — typically positioned ahead of subordinate debt service in the waterfall.

A draw on the DSRF is a material event for SEC Rule 15c2-12 disclosure purposes and must be filed to EMMA promptly.

### **R&R Reserve Draw and Replenishment**

R&R reserve is drawn for permitted capital expenditures per the indenture. Typically requires submission of a capital expenditure plan to the trustee, with documentation of the expenditure. Some indentures require approval by a project engineer. Replenishment is through scheduled monthly or annual deposits from operating cash flow.

### **Cap-I Reserve Draw**

Cap-I is drawn monthly through construction to pay interest. Mechanical — typically the trustee draws on a defined schedule rather than against specific requests. At stabilization, any remaining Cap-I balance is released to the obligor or applied to early bond redemption per the indenture.

### **Operating Reserve**

Drawn for operating shortfalls. Mechanics vary — some indentures allow obligor to draw without trustee approval; others require notice and certification. Replenishment per indenture-defined timeline from future operating cash flow.

## **8.6 Reserves at Maturity and Defeasance**

As the bond approaches maturity, reserves are released back. Standard mechanics:

### **DSRF at Maturity**

Final debt service payment is funded from the Revenue Fund plus any DSRF balance. The DSRF effectively pays the final principal and interest, with any residual returned to the obligor.

### **R&R at Maturity**

R&R reserve balance at maturity is released to the obligor, typically subject to documentation that all scheduled capital maintenance has been performed or that the borrower has alternative plans for remaining capital needs.

### **Defeasance**

When the obligor defeases the bonds (by depositing in escrow government securities sufficient to pay debt service through maturity or call date), the reserves are released early. The obligor no longer needs the reserves because the escrow funds the remaining debt service. Defeasance is typically performed in connection with refunding — old bonds are defeased, new bonds are issued, reserves on old bonds are released.

## **8.7 Quick Reference — Silo 8**

### **Reserve Type Inventory**

Debt Service Reserve Fund (DSRF) — covers debt service shortfalls

Capitalized Interest Reserve (Cap-I) — funds construction-period interest

Replacement and Repair Reserve (R&R) — funds long-term capital maintenance

Operating Reserve — working capital cushion

Insurance and Tax Escrow — collects monthly for these obligations

Rebate Fund — holds IRS arbitrage rebate liability

Surplus Fund — receives excess cash after all senior obligations

Construction Fund — holds bond proceeds during construction

Costs of Issuance Fund — pays COI at closing

Special purpose reserves — sector-specific (lease-up, marketing, working capital, major maintenance, renewal)

### **Standard Waterfall Order**

1. Operating expenses

2. Trustee and administration fees

3. Senior bond debt service

4. Senior DSRF replenishment

5. Subordinate bond debt service

6. Subordinate DSRF replenishment

7. Capital reserves (R&R, Operating Reserve)

8. Rebate Fund deposit

9. Insurance and Tax Escrow

10. Permitted distributions (subject to restricted payment covenant)

11. Surplus Fund

### **Sizing Quick Reference**

**DSRF —** MADS or 10% of par or 125% of average annual DS (lesser of)

**Cap-I —** Estimated interest through stabilization × 1.15-1.30 cushion

**R&R (multifamily) —** $200-$500 per unit per year

**R&R (senior living) —** $300-$800 per unit per year

**R&R (hotels) —** 4-5% of revenue annually

**R&R (healthcare) —** 2-4% of revenue annually

**R&R (charter schools) —** $50-$150 per student per year

**Operating Reserve (stabilized) —** 3-6 months operating expenses

**Operating Reserve (new construction) —** 6-12 months operating expenses

**Total reserve burden —** 12-35% of par funded at closing depending on deal type

# **SILO 9 — CREDIT ENHANCEMENT**

Credit enhancement is the structural mechanism by which a bond borrows credit quality from an outside party — a bank, an insurance company, a government agency, a parent company, or a pool of pledged collateral. The bond's effective rating, pricing, and buyer pool depend partly on the underlying obligor's credit and partly on the enhancement's credit. When properly deployed, enhancement converts a mid-investment-grade or sub-investment-grade obligor into an investment-grade or even AAA bond, dramatically widening the buyer pool and tightening pricing.

Credit enhancement is not magic. It is paid for. The obligor pays an upfront premium or annual fee to the enhancement provider, and the enhancement provider takes the credit risk for that compensation. The structural decision is whether the pricing improvement (from the enhanced rating) exceeds the enhancement cost. On many deals, the answer is yes by a material margin — enhancement creates value. On other deals, the answer is no and the deal is better issued on its native credit.

**THE ENHANCEMENT PRINCIPLE —** Enhancement is a tool, not a default. Use it when the math favors it — when the rating uplift produces pricing improvement exceeding the enhancement cost. The platform's structuring agent runs the math systematically rather than deploying enhancement habitually.

## **9.1 The Major Categories of Credit Enhancement**

Credit enhancement comes in seven major categories: (1) Letter of Credit (LOC); (2) Bond Insurance / Financial Guaranty (Surety Wrap); (3) Moral Obligation Pledge; (4) State Intercept; (5) Parent or Corporate Guarantee; (6) Federal Guarantee Programs (USDA, HUD, etc.); (7) Cash or Securities Collateral. Each is treated below.

## **9.2 Letter of Credit (LOC)**

A bank issues a letter of credit committing to pay debt service on the bonds if the obligor fails to pay. The LOC bank effectively becomes the bond's credit. Bond rating links to the LOC bank's rating (the bond is rated to the LOC bank's short-term rating for variable-rate bonds, or the LOC bank's long-term rating for fixed-rate enhanced bonds).

### **How LOCs Work**

Mechanically: at closing, the bank issues a LOC to the trustee covering the bond's principal plus a specified interest cushion (typically 35-50 days of interest, sometimes more). The LOC is irrevocable for its stated term (typically 1-5 years, sometimes longer). If the obligor fails to pay debt service when due, the trustee draws on the LOC. The bank pays the trustee, which pays bondholders. The obligor then has a contractual obligation to reimburse the bank under the LOC reimbursement agreement.

### **LOC Pricing**

**Upfront issuance fee —** 0.10%-0.50% of LOC amount

**Annual LOC fee —** 0.50%-2.50% of LOC outstanding amount per year

**Reimbursement obligation interest rate —** If LOC is drawn, the bank's reimbursement claim typically bears interest at prime plus 2-5% — very expensive

LOC fees vary widely by the obligor's credit quality, the LOC term, and the bank market. On a $50M bond with annual LOC fee of 1.0%, the obligor pays $500K per year for the enhancement. Over a 30-year bond, that's $15M in fees — substantial. The enhancement only makes sense if the rating uplift produces pricing improvement worth more than the fees.

### **When LOCs Are Used**

Variable-rate bonds (VRDOs) — almost always LOC-enhanced; the LOC supports the bondholder's put right plus the bond rating

Short-tenor construction or bridge financings

Issuers with strong bank relationships but mediocre native credit ratings

Sectors with high volatility but bondable underlying assets

Smaller deals where the bond cost of capital is dominated by execution friction and LOC fees can offset

### **LOC Bank Selection**

LOC banks must be rated above defined thresholds (typically A1/A+ short-term and A/A long-term for VRDOs). Major US LOC bank players in middle-market work include JPMorgan Chase, Bank of America, Wells Fargo, US Bank, Bank of New York Mellon, PNC, BMO, Fifth Third, Regions, and a handful of regional banks with active LOC books. International banks (HSBC, RBC, Barclays, etc.) are active in certain market segments.

Nest's platform maintains a database of LOC bank capacity by sector, by obligor type, by deal size, with current pricing benchmarks. Soliciting LOC bids on a deal becomes a systematic process rather than ad-hoc.

### **LOC Reimbursement Agreement**

The contract between the obligor and the LOC bank governing the obligor's reimbursement obligation if the LOC is drawn. The reimbursement agreement is the heavy negotiation — it contains all the bank's covenants on the obligor (often more restrictive than the bond covenants), the events of default for the bank (which can trigger LOC termination), and the reimbursement terms. A draw on the LOC effectively creates a bank loan to the obligor at the reimbursement rate, with full bank covenants.

## **9.3 Bond Insurance / Financial Guaranty (Surety Wrap)**

A financial guaranty insurer issues an unconditional, irrevocable insurance policy guaranteeing payment of principal and interest on the bonds. The bond is rated to the insurer's rating — historically AAA for the major monoline insurers (until the 2008 crisis). Today the market is smaller but functioning.

### **How Bond Insurance Works**

At issuance, the obligor pays an upfront premium to the insurer (sometimes financed from bond proceeds). The insurer issues a policy committing to pay debt service if the obligor fails to. The insurance policy is unconditional — unlike a LOC, there's no requirement to draw on a specific schedule, the insurer simply pays when debt service is missed.

If the insurer pays under the policy, the insurer is subrogated to the bondholders' claims against the obligor — the insurer steps into the bondholders' shoes for purposes of pursuing remedies. The obligor's economic obligation to repay shifts from the bondholders to the insurer.

### **Bond Insurance Pricing**

**Premium —** Typically 50-200 bps upfront on the par insured, with variance by credit and tenor

**Paid —** Upfront from bond proceeds (becomes COI) or sometimes spread over time

### **The Bond Insurance Market**

Pre-2008, the bond insurance market was dominated by AAA-rated monolines: MBIA, Ambac, FGIC, FSA, Assured Guaranty, XL Capital, CIFG. The 2008 financial crisis devastated most of these firms due to their structured finance and CDO exposures. The market is now smaller — primarily Assured Guaranty Municipal (AGM), Build America Mutual (BAM), and a handful of others. The remaining insurers are rated AA or AA-, not AAA, so the rating uplift from insurance is less than it was historically.

Bond insurance is most active in municipal markets — essential service revenue bonds, GO bonds, certain conduit deals. Less common in corporate finance, where investment-grade obligors prefer to issue on native credit.

### **When Bond Insurance Makes Sense**

The math: compare (a) the insurance premium plus the obligor's native-credit pricing to (b) the pricing the insured bond would achieve at the insurer's rating. If (b) is significantly tighter than (a), the insurance creates value.

Example: obligor with a BBB+ native credit might price at Treasury + 175 bps. With AA bond insurance at 100 bps premium, the insured bond might price at Treasury + 90 bps. The 85 bps of tighter pricing across the bond's life produces NPV substantially greater than the 100 bps upfront premium — insurance creates value.

On A-rated and above obligors, insurance often doesn't make sense — the rating uplift is too modest to justify the premium. On lower-rated obligors (BBB or below), insurance can be very economic but the insurance market is selective about which obligors it will insure.

## **9.4 Moral Obligation Pledge**

A state or government entity commits to seek appropriation from its legislature to support the bonds if the obligor defaults. The pledge is not legally binding — the legislature is not contractually obligated to appropriate — but it is morally binding, and the historical track record of states honoring moral obligation pledges supports a meaningful rating uplift.

### **How Moral Obligation Works**

Typical structure: a state HFA or similar agency issues bonds. The state has a statutory or constitutional moral obligation pledge — language committing the state to consider appropriating funds to replenish a defined reserve fund if the reserve is drawn. The state's commitment is to consider, not to actually appropriate. But the political and reputational consequences of failing to honor a moral obligation pledge are severe enough that historically, states have almost always honored them.

### **Rating Impact of Moral Obligation**

Rating agencies give meaningful credit to moral obligation pledges from states with strong fiscal positions, stable political institutions, and history of honoring such pledges. The rating uplift varies — moral obligation alone may produce 1-2 notch uplift over the underlying obligor's credit; combined with other structural features, the bonds may approach the state's own GO rating.

### **When Moral Obligation Applies**

Limited to specific entity types — state HFAs, state agencies with appropriate authority, certain quasi-governmental issuers. Not available to private corporate or commercial obligors. Where available, it's nearly free enhancement (no premium, no annual fee) and worth pursuing.

## **9.5 State Intercept**

A state agency commits to intercept state aid otherwise payable to the obligor and redirect to debt service if the obligor fails to pay. Common in school district financings — the state department of education intercepts state aid that would go to the district and redirects to the trustee.

### **How Intercept Works**

Mechanically: in the indenture, the trustee notifies the state's intercept agency when scheduled debt service is missed. The agency, pursuant to its statutory authority, redirects the state aid that would otherwise flow to the obligor and instead pays the trustee. The trustee uses the funds to make debt service. The obligor's relationship with the state is altered — the state's aid is being used to pay the obligor's debt rather than the obligor's operations — but the bondholders are paid.

### **Where Intercept Is Available**

School district financings in states with statutory intercept programs (varies state by state)

Charter school financings in some states

Certain higher education financings where state aid is a meaningful revenue source

Some healthcare financings where Medicaid payments can be intercepted

State transportation or infrastructure financings where federal or state revenue can be redirected

### **Rating Impact**

Strong state intercept programs produce meaningful rating uplift — often 2-3 notches above the underlying obligor's credit. For school district financings in states with strong intercept programs (e.g., Texas, Pennsylvania), the bonds often achieve ratings close to the state's GO rating despite the underlying district being lower-rated. Intercept is essentially free enhancement (no premium, no annual fee) where available.

## **9.6 Parent or Corporate Guarantee**

A parent company guarantees the subsidiary's bond payments. The bond's effective credit becomes the parent's credit. Standard in corporate structures where a strong parent holding company has weaker subsidiary credits.

### **Structuring the Guarantee**

Standard provisions: (1) unconditional and irrevocable guarantee of timely payment of principal and interest; (2) waivers of typical guarantor defenses (no requirement that bondholders first pursue the borrower); (3) survival through bankruptcy or insolvency of the borrower; (4) defined trigger for guarantor's payment obligation; (5) subrogation provisions (guarantor's rights against borrower after paying).

Parent guarantees can be structured at various levels of guarantor obligation:

Full and unconditional guarantee — strongest, treats the parent's credit as the bond's credit

Limited guarantee — capped at a defined amount or for a defined period

Bad-boy guarantee — guarantor liable only for specific bad acts (fraud, environmental violations, voluntary bankruptcy)

Springing guarantee — guarantee springs into effect on defined triggers (default, change of control, breach of negative covenant)

### **Bankruptcy and Fraudulent Conveyance**

Parent guarantees face potential challenges in the guarantor's bankruptcy if the guarantee can be characterized as a fraudulent conveyance — guarantee given without adequate consideration. Carefully structured guarantees include language confirming reasonable consideration (typically the guarantor's interest in the subsidiary's success, intercompany cash flows, or specific economic benefits). Bond counsel structures the guarantee to minimize fraudulent conveyance risk.

### **Rating Impact**

Where the parent is significantly stronger than the borrower, the guarantee produces rating uplift equivalent to the parent's rating (subject to structural considerations). On corporate bonds where a parent guarantees a subsidiary's bond, the bond is rated to the parent's credit. On real estate deals where a wealthy individual sponsor guarantees a project-level bond, the rating uplift depends on the sponsor's financial capacity and the guarantee's strength.

## **9.7 Federal Guarantee Programs**

Various federal programs provide guarantee of bond payments for qualifying purposes. Each program has its own eligibility criteria, application process, fees, and conditions.

### **USDA Rural Development**

USDA provides guarantees on certain rural infrastructure, agricultural, and rural business financings. Rural Utilities Service guarantees on rural electric and telecommunications cooperatives. Rural Housing Service guarantees on rural multifamily. Eligibility requires defined rural geography and qualifying purpose. Where available, USDA guarantees produce AAA effective ratings.

### **HUD / Ginnie Mae**

HUD insurance (Section 220, 221(d)(4), 223(f), and others) on FHA-insured multifamily and healthcare facilities. The HUD-insured loan can be packaged with bond financing to create AAA-rated structures (Ginnie Mae securitized HUD loans are AAA). HUD financing is the workhorse of affordable multifamily construction and stabilized refinance — well-known in the market with established processes.

### **Department of Education**

Federal loan guarantee programs for higher education infrastructure. More limited in scope than housing or rural programs but available for qualifying purposes.

### **Department of Transportation**

TIFIA (Transportation Infrastructure Finance and Innovation Act) provides federal credit assistance for major transportation projects. Not strictly a guarantee but functions similarly — federal credit support enables financing of projects that wouldn't otherwise be financeable.

### **Department of Energy**

Loan guarantees for innovative energy projects. Highly application-driven, limited capacity, but valuable when available.

### **Rating Impact of Federal Guarantees**

Federal guarantee programs produce AAA or near-AAA effective ratings on the guaranteed portion. This is the strongest possible enhancement. The trade-off is the complexity and timeline of the federal application process — federal guarantees typically take 6-18 months to obtain, vs. months for bank LOCs or insurance.

## **9.8 Cash or Securities Collateral**

Cash or government securities held by the trustee as collateral for the bond. Functions as effectively a self-collateralized bond — the bondholders' protection is the collateral itself. The 'cash-secured' or 'collateralized' structure that came up in earlier strategic conversations.

### **How Cash Collateralized Bonds Work**

Variants:

Fully cash-secured: cash equal to par held by trustee. Bond is risk-free — bondholders are paid from the collateral. Used where the issuer needs the bond's tax-exempt status or specific buyer pool access but doesn't need the cash itself. Sometimes used by corporate treasurers to access tax-exempt markets while parking corporate cash.

Partially cash-secured: cash collateral covers a defined portion of debt service (e.g., the next 5 years' interest plus principal at risk). Reduces but doesn't eliminate credit risk.

Securities-collateralized: government securities held by trustee. Provides cash-like protection but allows the obligor to earn investment income.

Defeasance escrow: structured similarly but typically used for refundings where old bonds are defeased by an escrow until call or maturity.

### **When Cash Collateral Makes Sense**

Limited use cases. Most obligors don't have the cash to fully collateralize a bond and would prefer to put the cash to productive use. Cash collateral structures make sense when:

Obligor has specific cash management needs that match the bond structure

Tax-exempt arbitrage opportunity (specific to certain corporate or institutional contexts)

Bridge financing where cash is available but needs the bond structure for tax or buyer-pool reasons

Refunding escrow (defeasance) — old bonds collateralized by escrow until call or maturity

## **9.9 Combining Enhancement with Other Structural Features**

Enhancement is often combined with other structural features to achieve specific rating outcomes:

### **LOC + Variable Rate Mode**

VRDOs typically pair LOC with weekly or daily rate reset and bondholder put. The combination is structurally elegant — the LOC supports both the bond rating and the put right, while the variable rate captures the lowest available short-term funding cost. Standard for muni VRDOs.

### **Bond Insurance + Senior Bonds**

Senior bonds insured by a monoline insurer with subordinate uninsured bonds. The insurance optimizes the senior pricing; the subordinate bonds price on the underlying credit. The combination is used when the obligor wants to maximize senior bond pricing but has subordinate financing needs that the insurer won't cover.

### **Federal Guarantee + Conduit Issuance**

HUD-insured loans accessed through municipal conduit issuance produce AAA tax-exempt bonds. Combines the federal guarantee's strong credit with the tax-exempt benefit. Standard in affordable multifamily construction and refinance.

### **Parent Guarantee + Project Bond**

Project-level bond with parent corporate guarantee. The bond benefits from the parent's investment-grade credit while the project structure isolates the parent's exposure. Common in infrastructure and energy.

### **Moral Obligation + State Conduit**

State HFA or similar agency issues bonds with moral obligation pledge. The agency's credit plus the moral obligation produces strong rating on bonds that wouldn't otherwise rate well on the underlying obligor alone.

## **9.10 The Enhancement Decision Framework**

How the platform's structuring agent decides whether to enhance and which enhancement to use.

### **Step 1 — Native Credit Analysis**

Determine the obligor's native credit rating. Run the platform's rating model with no enhancement. Identify the indicative rating without enhancement.

### **Step 2 — Native Pricing**

Determine the expected pricing at the native rating. Use the platform's pricing model with current market spread data and rating-specific buyer pool.

### **Step 3 — Enhancement Options**

Identify all enhancement options the deal qualifies for. Different obligor types qualify for different enhancements. The platform's database knows which enhancements are available for each obligor and deal type.

### **Step 4 — Enhanced Rating and Pricing**

For each enhancement option, determine the resulting enhanced rating and the expected pricing at that rating.

### **Step 5 — Enhancement Cost**

For each enhancement option, calculate the cost — upfront premiums plus annual fees plus any incremental complexity cost.

### **Step 6 — NPV Analysis**

For each enhancement option, calculate the NPV of (a) pricing savings × bond life, minus (b) enhancement costs × bond life. Pick the enhancement (or no-enhancement) option with the highest positive NPV. If all options produce negative NPV, issue on native credit.

**THE ENHANCEMENT NPV:** On a $50M bond with native pricing at Treasury + 175 bps and AA-insured pricing at Treasury + 95 bps, the 80 bps of pricing savings × 30-year duration produces NPV savings of approximately $5-7 million. If the insurance premium is 100 bps upfront ($500K), the enhancement creates $4.5-6.5M of NPV value to the obligor. This is the math the platform runs systematically.

## **9.11 Quick Reference — Silo 9**

### **Enhancement Type Inventory**

**Letter of Credit (LOC)** — bank LOC, fee 50-250 bps annually, typical for VRDOs

**Bond Insurance / Surety Wrap** — monoline insurer, premium 50-200 bps upfront, common in muni

**Moral Obligation Pledge** — state pledge to seek appropriation, free, limited to specific entity types

**State Intercept** — state redirects aid to debt service, free, available in some sectors

**Parent / Corporate Guarantee** — parent guarantees subsidiary's bond, common in corporate

**Federal Guarantee Programs** — USDA, HUD, DOT, DOE, etc., produce AAA effective rating

**Cash or Securities Collateral** — bonds backed by escrowed cash or government securities

### **Enhancement Pricing Reference**

**LOC fee —** 50-250 bps annually + 10-50 bps upfront

**Bond Insurance premium —** 50-200 bps upfront

**Moral Obligation —** Free where available

**State Intercept —** Free where available

**Parent Guarantee —** Free (parent's economic risk)

**Federal Guarantee (HUD, USDA) —** Application fees + ongoing program fees, varies by program

**Cash Collateral —** Opportunity cost of the collateralized cash

### **Enhancement Rating Uplift Reference**

**LOC —** Bond rated to LOC bank's rating (often AA short-term for VRDOs)

**Bond Insurance (current market) —** AA or AA- depending on insurer (Assured Guaranty Municipal, Build America Mutual)

**Moral Obligation —** 1-2 notches above native credit

**State Intercept —** 2-3 notches above native credit

**Parent Guarantee —** Bond rated to parent's credit, subject to structural considerations

**Federal Guarantee —** AAA or near-AAA effective rating

**Cash Collateral —** Effectively risk-free if fully collateralized

### **Decision Framework**

Determine native credit and native pricing

Identify available enhancement options

Compute enhanced rating and pricing for each option

Compute enhancement cost (premiums + fees) for each option

Run NPV: pricing savings vs. enhancement cost

Select the highest positive NPV option, or no enhancement if all are negative

# **SILO 10 — TRANCHING AND LAYERING**

Tranching is the art of dividing a bond issuance into multiple series with different risk profiles, payment priorities, maturities, or tax treatments — each series sold to its optimal buyer pool. A well-tranched issuance broadens the buyer pool, captures pricing efficiency across the rating spectrum, and produces a lower weighted-average cost of capital than a single-tranche structure. A poorly tranched issuance overcomplicates the deal and produces no economic benefit. This silo walks the tranching toolkit.

Tranching connects directly to the firm's broader thesis. the founders have emphasized layered bonds with multiple tranches, all graded — the structural sophistication that captures buyer-pool-specific value while paying partners well through the spread. This silo is the structural toolkit that makes that thesis operational.

**THE TRANCHING PRINCIPLE —** Different buyers pay different prices for different risk profiles. A bond sold as a single homogeneous instrument is sold to the lowest-paying buyer pool that can absorb the full size. A bond tranched into senior, mezzanine, and subordinate, each sized to its optimal buyer pool, captures the highest price each pool will pay for its specific risk profile. Tranching is value capture, not complexity for its own sake.

## **10.1 The Logic of Tranching**

A simple bond is a single instrument. Every bondholder owns identical risk and gets identical treatment. The bond is rated to its overall credit profile. The buyer pool is whoever wants exposure at that rating and yield.

Tranching creates multiple instruments from the same underlying project or credit. The senior tranche has first call on cash flow and first claim on collateral; the subordinate tranche has second call and second claim. Senior is lower risk → higher rating → lower yield. Subordinate is higher risk → lower rating → higher yield. The blended cost of capital across both tranches is typically lower than what a single tranche of the entire amount would cost, because the buyer pool for the lower-rated tranche pays for the additional risk premium voluntarily.

Tranching also creates buyer-pool specific products. Lifecos pay up for long-dated investment-grade fixed income. Bond funds pay up for medium-duration BBB-rated paper. Bank portfolios pay up for shorter-tenor amortizing structures. By creating tranches calibrated to each pool, the issuance captures the best price each pool will pay rather than averaging across pools.

## **10.2 Senior / Subordinate Tranching**

The most common tranching structure. The senior tranche has priority claim on cash flow and collateral; the subordinate tranche is structurally junior.

### **Senior Tranche Characteristics**

First call on cash flow per the waterfall — debt service paid before subordinate

First claim on collateral in default — sale proceeds applied to senior first

Higher rating than the subordinate tranche, often by 2-4 notches

Lower coupon (lower yield)

Larger size — typically 70-90% of total issuance

Standard call protection — typical non-call period and call structure for the asset class

### **Subordinate Tranche Characteristics**

Junior call on cash flow — paid only after senior debt service is current and senior reserves replenished

Junior claim on collateral in default

Lower rating than senior, often 2-4 notches

Higher coupon (higher yield)

Smaller size — typically 10-30% of total issuance

Often with longer non-call period or stricter call protection (because the senior gets refinanced first and the subordinate becomes more concentrated)

### **Sizing the Tranches**

Sizing decisions are driven by (a) what the cash flow can support at each rating level, (b) the available buyer pools at each rating, (c) the optimal blended cost of capital. The platform's structuring agent runs this optimization systematically.

Example sizing for a multifamily project bond with $50M total need:

Senior Series A: $40M (80%), A-rated, 1.40x DSCR coverage on senior debt service, priced at Treasury + 90 bps

Subordinate Series B: $10M (20%), BBB-rated, 1.20x DSCR coverage on senior + sub debt service combined, priced at Treasury + 175 bps

Blended cost of capital: (80% × 0.90% + 20% × 1.75%) + Treasury = 1.07% + Treasury

Compare to single $50M tranche at BBB+ → would price at Treasury + 145 bps

Tranching savings: 38 bps × $50M × ~25 year duration = significant NPV

### **Waterfall Implications**

The senior/subordinate structure requires careful waterfall design. Standard ordering:

1. Operating expenses (paid before any debt service)

2. Trustee and administration fees

3. Senior debt service

4. Senior DSRF replenishment

5. Subordinate debt service

6. Subordinate DSRF replenishment

7. Capital reserves and other operational reserves

8. Permitted distributions and Surplus Fund

The subordinate tranche's risk is concentrated in steps 5-6 — if senior debt service plus senior reserve replenishment fully consume available cash, subordinate may not be paid. This is the structural risk subordinate bondholders accept.

## **10.3 Mezzanine Tranching**

A third layer between senior and subordinate. Three-tier structures are common in larger or more complex deals.

### **Mezzanine Characteristics**

Senior to subordinate but junior to senior

Rated between senior and subordinate (typically BBB+ to BBB-)

Priced between senior and subordinate spreads

Often with covenant protection structurally between senior and subordinate

Sometimes secured differently from senior — e.g., senior has first lien on operating cash flow, mezzanine has second lien on cash flow plus equity pledge

### **When Mezzanine Tranches Make Sense**

Three-tier structures make sense when:

Deal size is large enough to justify multiple tranches ($75M+ typical minimum)

The asset class supports multiple rating outcomes from the same project

Buyer pools exist at each rating level — single-A, mid-BBB, and BB or B

The marginal pricing benefit of the third tranche exceeds the marginal complexity cost

Below $75M total, two-tier (senior/subordinate) typically captures most of the available pricing benefit without the additional complexity. Above $100M, three-tier or even four-tier structures become economic.

## **10.4 Sequential Pay vs. Pro Rata Tranching**

Within a multi-tranche structure, how principal is repaid across tranches matters. Two dominant patterns:

### **Sequential Pay**

Principal is repaid sequentially — senior tranche fully retired before subordinate begins amortizing. Used in CMOs (collateralized mortgage obligations) and certain project finance structures.

Mechanics: in each period, all principal payments are applied to senior until senior is fully repaid, then to subordinate. Subordinate receives only interest until senior is gone.

Implications: senior has shorter expected duration; subordinate has longer expected duration. Senior is less exposed to back-end credit risk; subordinate bears all back-end risk.

### **Pro Rata Pay**

Principal is repaid pro rata — senior and subordinate amortize in proportion to their original par. Each tranche has roughly the same weighted-average life.

Mechanics: in each period, principal is allocated pro rata across the tranches. Both tranches amortize together.

Implications: tranches have similar duration. Subordinate is paid down at the same rate as senior — gradual deleveraging of subordinate over the bond's life.

### **Hybrid Pay**

Variations exist. Some deals use sequential pay during construction and pro rata thereafter. Some use turbo amortization where excess cash sweeps to senior. Some use lockout amortization where subordinate doesn't amortize for a defined period.

## **10.5 Capital Appreciation Bonds (CABs)**

A specific tranche type used when the project has no cash flow during a portion of the bond's life. CABs accrue interest into principal rather than paying it periodically — both the original principal and the accrued interest are paid at maturity.

### **How CABs Work**

Issued at deep discount to maturity value. Example: a CAB with $1,000 maturity value, 5% accretion, 20-year maturity, would be issued at approximately $377 (today's value of $1,000 in 20 years at 5%). The bondholder pays $377 today and receives $1,000 at maturity — total return is the accretion.

### **When CABs Are Used**

Construction-period financing where the project has no cash flow during construction

Highly back-loaded amortization profiles for projects with ramp-up periods

School district financings in states with tax limitation rules that make current interest expensive

Deals where current interest expense would exceed available cash flow

### **CAB Risks**

CABs are higher-risk than current-interest bonds because the bondholder is exposed to the credit for longer (no periodic cash flow reduces exposure). Rating agencies typically rate CABs one notch lower than equivalent current-interest bonds. CABs also have substantial sticker shock at maturity — the maturity value is multiples of the issuance amount, which sometimes creates political and public pressure on the obligor at maturity.

## **10.6 Taxable / Tax-Exempt Blended Structures**

Many obligors have purposes that qualify for tax-exempt issuance and other purposes that don't. Blended structures issue separate series in each category.

### **Common Blends**

Multifamily housing: tax-exempt for the qualifying affordable housing portion plus taxable for the market-rate portion. The two series are issued under the same indenture with different security and tax treatment.

Healthcare: tax-exempt for qualifying 501(c)(3) hospital purposes plus taxable for ineligible purposes (parking structures, certain ancillary facilities, certain joint ventures with private parties).

Higher education: tax-exempt for academic facilities plus taxable for athletic facilities (in some states), commercial enterprises (bookstores, hotels on campus), and certain housing arrangements.

Project finance: tax-exempt where the project qualifies as a 501(c)(3) charity-related project, qualifying small issue manufacturing, or exempt facility; taxable for any non-qualifying components.

### **Why Blends Make Sense**

Blending captures the tax exemption value for the qualifying portion (typically 200-300 bps of pricing benefit) while still financing the non-qualifying portion through bonds rather than requiring separate financing channels. The two series share the indenture, the trustee, the working group, and the offering document — substantially lower marginal cost than separate financings.

### **Allocation Rules**

IRS rules govern which costs can be financed with tax-exempt proceeds and which require taxable. The allocation is documented in the Tax Regulatory Agreement and the Loan Agreement. Misallocation can cause loss of tax exemption, so the allocation work is carefully reviewed by bond counsel.

## **10.7 Multi-Series Structures with Different Maturities**

Beyond senior/subordinate stratification, tranching can produce multiple series with different maturities targeted at different buyer pools by duration.

### **Serial + Term Combinations**

Standard municipal structure: a serial bond covering years 1-15 (with principal maturing each year) plus a term bond at year 30 (with the long-end principal in a single bullet). The serial portion sells to short-duration buyers — banks, retail, money funds. The term bond sells to long-duration buyers — lifecos, pension funds, long-bond funds.

Each component is priced separately at pricing. Banks and retail will pay up for the front-end serials (short duration, predictable). Lifecos will pay up for the long-dated term bond (matches their long liability profile). The combined pricing is typically tighter than a single-tranche structure of the same total par.

### **Multiple Term Bonds**

Larger issuances may have multiple term bonds at different maturities — for example, a 10-year term, a 20-year term, and a 30-year term. Each term targets a different buyer pool. The 10-year buyer pool is different from the 30-year pool, and pricing each tranche to its pool captures value.

### **Tax-Exempt and Taxable Tranches Combined**

Some deals have tax-exempt serial bonds (years 1-10), tax-exempt term bonds (years 11-30), and a separate taxable tranche for purposes that don't qualify for tax exemption. Three different products in a single offering, sold through coordinated marketing.

## **10.8 LIHTC Layering (Affordable Housing Specific)**

Low Income Housing Tax Credit (LIHTC) deals have a specific layering pattern that's worth understanding because they represent a major segment of middle-market bond work.

### **The LIHTC Capital Stack**

A typical LIHTC affordable multifamily project:

Tax-exempt bonds (~50-60% of total project cost) — the senior debt; required for 4% LIHTC eligibility

LIHTC equity (~25-35% of total project cost) — sponsor sells the LIHTC credits to an investor (usually a corporate or institutional LIHTC syndicator), who pays cash to the project. Investor receives the credits over 10 years.

Soft sources (~10-20% of total project cost) — local, state, or federal soft loans (HOME, CDBG, AHP, state HFA gap funds, etc.); often deferred or contingent payment

Deferred developer fee — sponsor's fee partly deferred, paid over time from project cash flow

Sometimes a small market-rate or seller financing tranche

### **Structural Implications**

The LIHTC structure creates a multi-party waterfall with:

Bond debt service paid first (senior, as in any structured bond)

LIHTC investor preferred return paid at defined waterfall position

Soft loan debt service at lower priority

Deferred developer fee paid from available cash

Distribution to general partner / sponsor last

The LIHTC investor's role is unique. They take the credits and have specific compliance requirements (15-year compliance period plus 15-year extended use), but they don't take operating risk — once the project stabilizes and the credits are delivered, they're typically passive.

### **Bond Sizing in LIHTC**

Tax-exempt bond sizing in LIHTC deals is constrained by:

50% test — at least 50% of aggregate basis must be financed by tax-exempt bonds to qualify for 4% LIHTC. Bond sizing typically targets just above 50%.

Operating cash flow DSCR — typically 1.15-1.25x for the bond debt service

Volume cap — tax-exempt bonds for multifamily are subject to state-level volume cap allocation; the state HFA approves and allocates

## **10.9 Combining Multiple Layering Approaches**

Real complex deals layer multiple approaches simultaneously. Example: a $100M senior living deal might have:

Tax-exempt series A senior bonds (sequential pay, 30-year, $60M, A-rated)

Tax-exempt series B subordinate bonds (pro rata pay, 30-year, $20M, BBB-rated)

Taxable series C mezzanine bonds for non-qualifying purposes (5-year, $10M, BB-rated)

Tax-exempt series D CABs for entrance fee receipts (10-year accretion, $10M, structured around expected entrance fee absorption)

Each series is sized to its purpose, rated to its risk, priced to its buyer pool. The combined offering produces a substantially lower blended cost of capital than any single-tranche alternative, captures tax exemption where qualifying, and supports the specific cash flow profile of a senior living facility with both bond debt and entrance fee receipts.

## **10.10 Tranching Decision Framework**

How the platform's structuring agent decides whether and how to tranche.

### **Step 1 — Identify Single-Tranche Baseline**

Run the deal as a single tranche. Determine the rating, pricing, and total cost of capital. This is the comparison baseline.

### **Step 2 — Identify Tranching Candidates**

Based on deal type, size, and purpose, identify candidate tranching structures:

Two-tier senior/subordinate

Three-tier senior/mezz/subordinate

Sequential vs. pro rata pay variants

Tax-exempt + taxable blends

Multiple maturity tranches

CAB inclusion where appropriate

LIHTC layering (for affordable housing)

### **Step 3 — Size Each Tranche**

For each candidate structure, determine the optimal sizing of each tranche based on cash flow support, rating outcomes, and buyer pool depth at each rating level.

### **Step 4 — Compute Blended Cost of Capital**

For each candidate structure, compute the weighted-average all-in cost. Compare to single-tranche baseline.

### **Step 5 — Adjust for Execution Complexity**

Multi-tranche structures cost more to execute — more documentation, more rating work, more marketing complexity. Add execution cost premium to each multi-tranche option.

### **Step 6 — Optimize and Recommend**

Select the structure with the lowest fully-loaded cost. Document the rationale in the Structuring Memorandum.

**THE TRANCHING NPV:** Tranching's economic benefit on a $50M deal is typically 25-75 bps of weighted-average cost savings vs. single-tranche. That's $125K-$375K of annual interest savings, worth $2M-$5M NPV across a 25-year bond life. Net of execution complexity premium, the captured value to the obligor is typically $1M-$4M — substantial. Some of that captured value supports Nest's structuring fee.

## **10.11 Quick Reference — Silo 10**

### **Tranching Variants Inventory**

Senior / subordinate (two-tier)

Senior / mezzanine / subordinate (three-tier)

Sequential pay vs. pro rata pay

Turbo amortization

Capital Appreciation Bonds (CABs)

Current interest + CAB combinations

Tax-exempt + taxable blends

Multiple maturity tranches (serials + terms)

LIHTC layered structures

### **Typical Sizing Splits**

**Senior tranche —** 70-90% of total

**Mezzanine tranche —** 10-20% of total (when used)

**Subordinate tranche —** 10-25% of total

### **Typical Rating Splits**

**Senior —** A or A+ on revenue bonds, BBB+ to AA on structured project

**Mezzanine —** BBB-/BBB

**Subordinate —** BB to BBB-

### **Typical Pricing Splits (bps over Treasury, illustrative)**

**Senior (A-rated) —** +80 to +130 bps

**Mezzanine (BBB) —** +130 to +200 bps

**Subordinate (BB to BBB-) —** +200 to +400 bps

### **Decision Framework**

Run single-tranche baseline

Identify tranching candidates

Size tranches to optimal buyer pool

Compute blended cost of capital

Add execution complexity premium

Select lowest fully-loaded cost structure

# **SILO 11 — PRICING AND SPREAD MECHANICS**

Pricing is where structure meets the market. Every structural decision Nest makes — the rating, the covenants, the reserves, the optionality, the tranching, the enhancement — gets translated into a yield at pricing. The yield is the number that the obligor pays for the next 10, 20, or 30 years. Tightening pricing by 10 bps on a $50M bond saves the obligor $50K per year — material money. Tightening by 50 bps saves $250K per year, $5M+ across the bond's life. Pricing is where the structural craft pays off in cash.

This silo walks the math of bond pricing — yields, spreads, duration, convexity, option-adjusted spread, key rate duration, DV01 — and the framework Nest uses to evaluate pricing outcomes and capture pricing efficiency.

**THE PRICING PRINCIPLE —** Pricing is not luck. It is a function of structure, market conditions, buyer pool, and execution. Every basis point of pricing improvement at issuance is captured value to the obligor — and indirectly, to Nest through structuring fees and ongoing relationships. The platform's job is to engineer the bond for the tightest defensible pricing the market will support.

## **11.1 The Core Yield Concepts**

### **Coupon Rate**

**Definition —** The stated annual interest rate on the bond, as a percentage of par

**Use —** Determines the dollar amount of periodic interest payments

**Formula —** Periodic interest payment = Par × Coupon Rate × Period Fraction

Example: $1,000 par, 5% coupon, semi-annual payments → $25 every six months. Coupon is set at pricing and stays fixed for the bond's life (for fixed-rate bonds).

### **Current Yield**

**Definition —** Annual coupon income divided by current bond price

**Formula —** Current Yield = Annual Coupon / Current Price

**Use —** Quick measure of income return; ignores capital gains/losses from price changes

Example: $1,000 par, 5% coupon, trading at $950 → Current Yield = $50 / $950 = 5.26%.

### **Yield to Maturity (YTM)**

**Definition —** The internal rate of return earned by holding the bond from purchase to maturity, assuming all coupons reinvested at the same YTM

**Formula —** Solve for r: Price = Σ [CF\_t / (1 + r/n)^(n×t)]

**Use —** Standard measure of bond yield; what the bondholder earns if held to maturity

YTM accounts for both coupon income and any capital gain or loss from the purchase price vs. par at maturity. A premium bond (price > par) has YTM < coupon (because the bondholder loses the premium at maturity). A discount bond (price < par) has YTM > coupon (because the bondholder gains the discount at maturity).

YTM is the most-quoted bond yield measure. When the market says 'this bond is yielding 4.50%,' it typically means YTM.

### **Yield to Call (YTC)**

**Definition —** YTM calculation assuming the bond is called at the earliest call date at the call price

**Use —** Worst-case yield for callable bonds when rates are falling and call is likely

On callable bonds with calls in the money (call price below current market price), YTC is the relevant yield because the issuer will likely call. YTC is typically lower than YTM (the bondholder loses the premium at the earlier call date).

### **Yield to Worst (YTW)**

**Definition —** The lowest of YTM, YTC, and YTC at every call date

**Use —** Conservative yield measure used by buyers to evaluate the worst-case outcome

Standard quote for callable bonds. Buyers compute YTW across all possible call dates and use the worst case as their evaluation yield. This is why callable bonds with steep call protection structures price differently than non-callable bonds — buyers are evaluating the bond as if the call will be exercised at the worst-case date.

### **Yield to Average Life (YTAL)**

**Definition —** YTM calculation using the weighted average life rather than maturity

**Use —** For sinking fund or amortizing bonds, captures the actual cash flow pattern

Sinking fund bonds and amortizing bonds repay principal over time. The 'maturity' for yield calculation purposes is the weighted average of the principal payments, not the final maturity. YTAL produces a more accurate yield measure for these structures.

## **11.2 Spread Concepts**

Yield is the absolute return. Spread is the yield relative to a benchmark. Spreads are the more useful comparison tool because they isolate the bond's specific characteristics from general interest rate movements.

### **Treasury Spread (G-Spread)**

**Definition —** Bond yield minus the yield on a Treasury security of comparable maturity

**Formula —** G-Spread = Bond Yield − Treasury Yield (matched maturity)

**Use —** Standard spread measure for corporate and taxable bonds; isolates credit and structural premium

Example: 10-year corporate bond yielding 5.50%, 10-year Treasury yielding 4.25% → G-Spread = 125 bps. The corporate bond pays 125 bps over the comparable Treasury. This 125 bps reflects credit risk, liquidity premium, and any structural premium relative to the Treasury.

### **Zero-Volatility Spread (Z-Spread)**

**Definition —** The spread that, when added to each point on the Treasury spot curve, produces a present value equal to the bond's market price

**Use —** More precise spread measure than G-spread; accounts for the entire Treasury curve shape

Mathematically more rigorous than G-spread. The G-spread uses a single Treasury yield (typically the par yield at the bond's maturity). Z-spread uses the entire Treasury spot curve, producing a more accurate measure. For most purposes, G-spread is the working measure; Z-spread matters in detailed credit analytics and option-adjusted spread calculations.

### **Option-Adjusted Spread (OAS)**

**Definition —** The Z-spread adjusted for the value of embedded options (calls, puts, etc.)

**Formula —** OAS = Z-Spread − Option Value

**Use —** Pure credit spread on bonds with embedded options; isolates the credit premium from the option premium

Critical concept for callable bonds and putable bonds. The bond's stated spread includes both credit premium and option premium. OAS strips out the option value, leaving the pure credit spread. Two bonds with the same Z-spread but different option structures have different OAS — the more option-burdened bond has a lower OAS at the same Z-spread, reflecting that the higher Z-spread compensates for the option.

OAS calculation requires a lattice or Monte Carlo model of interest rate dynamics — the option value depends on the volatility and drift assumptions for future rates. For Nest's pricing analysis, OAS calculations rely on the platform's lattice model. For buyer analysis, the major institutional buyers all run their own OAS calculations.

### **SIFMA / MMD Spread (Municipal Bonds)**

**Definition —** Municipal bond yield minus the comparable AAA Municipal Market Data (MMD) yield

**Use —** Standard spread measure for tax-exempt municipal bonds

Municipal bond market uses the MMD AAA scale as its benchmark rather than Treasuries (because of the tax exemption). MMD publishes daily AAA muni yield curves by maturity. A bond's MMD spread is its yield minus the MMD AAA yield at the same maturity. Tighter MMD spread = better pricing relative to the muni AAA benchmark.

### **Asset Swap Spread**

**Definition —** The spread over LIBOR or SOFR that an investor would receive in an asset swap of the bond

**Use —** Standard spread measure for floating-rate buyers and for cross-currency or cross-product comparisons

Asset swap mechanics: a buyer purchases a fixed-rate bond and enters a swap exchanging the fixed coupon for floating payments based on a reference rate plus a spread. The spread received is the asset swap spread. For floating-rate buyer pools, asset swap spread is the most relevant measure.

## **11.3 Duration**

Duration measures a bond's price sensitivity to interest rate changes. The fundamental tool of interest rate risk management. Multiple duration concepts; each with its specific use.

### **Macaulay Duration**

**Definition —** Weighted average time to receipt of cash flows, weighted by the present value of each cash flow

**Formula —** MacDur = Σ [t × PV(CF\_t)] / Bond Price

**Use —** Conceptual measure; rarely used directly in practice

Original duration concept. Measures the bond's 'effective life' in time. For a zero-coupon bond, Macaulay duration equals maturity. For a coupon bond, Macaulay duration is less than maturity (because some cash flow is received earlier than maturity).

### **Modified Duration**

**Definition —** Macaulay Duration / (1 + Yield/n)

**Use —** Approximate percentage price change for a 100 bps yield change

**Formula —** ΔPrice/Price ≈ −ModDur × ΔYield

The working duration measure. A bond with modified duration of 7.0 will lose approximately 7% of its price for a 100 bps yield increase, or gain approximately 7% for a 100 bps decrease. The approximation is exact for small yield changes and increasingly inexact for larger changes (convexity correction needed).

### **Effective Duration**

**Definition —** Numerical approximation of duration that accounts for embedded options

**Formula —** EffDur = (P\_down − P\_up) / (2 × P\_0 × Δr)

**Use —** Duration measure for callable, putable, and option-embedded bonds

Modified duration assumes cash flows are fixed. For callable bonds, cash flows change when rates change (the bond may be called). Effective duration accounts for this by numerically computing the bond's price at slightly higher and slightly lower yield levels, capturing the price sensitivity including the option effects.

### **Key Rate Duration**

**Definition —** Duration measured against changes at specific points on the yield curve

**Use —** For complex bonds and portfolio analysis; isolates sensitivity to specific maturities

Standard duration assumes parallel shifts in the yield curve (all rates move together). Key rate duration measures sensitivity to specific maturities — 2-year duration, 5-year duration, 10-year duration, 30-year duration. Used by sophisticated portfolio managers and increasingly by sophisticated borrowers.

## **11.4 DV01 (Dollar Value of 01)**

**Definition —** Dollar price change of a bond for a 1 bp change in yield

**Formula —** DV01 = Modified Duration × Price × 0.0001

**Use —** Working measure of dollar-denominated interest rate risk

On a $50M bond with modified duration of 8.0 and trading near par: DV01 = 8.0 × $50M × 0.0001 = $40,000. A 1 bp increase in yield reduces the bond's value by $40,000. A 1 bp decrease increases it by $40,000.

DV01 is how traders and portfolio managers think about interest rate exposure in dollar terms. For Nest's pricing analysis, DV01 quantifies the dollar value of pricing improvements — a 5 bp tightening on the example above is $200K of value captured.

## **11.5 Convexity**

**Definition —** Second-derivative price sensitivity to yield changes; how duration changes as yield changes

**Formula —** Convexity = (1 / Price) × ∂²Price/∂Yield²

**Use —** Correction to duration approximation for large yield changes

Duration assumes a linear relationship between price and yield. Real bonds have convex price-yield relationships (price falls less than duration predicts when yields rise; rises more than duration predicts when yields fall). Convexity is the curvature.

Positive convexity: when yields fall, the bond's price rises faster than duration alone predicts. Standard for non-callable bonds. Bondholders like positive convexity — they get extra upside in falling rate environments.

Negative convexity: when yields fall, the bond's price rises less than duration alone predicts. Standard for callable bonds in the money — the call caps the upside. Bondholders don't like negative convexity and price for it (lower price, higher yield).

Convexity matters most for large yield moves. For small moves (10-25 bps), duration alone is a good approximation. For large moves (75+ bps), convexity correction is needed for accurate price prediction.

## **11.6 The Pricing Process — Step by Step**

How pricing actually happens at Stage 11 of the workflow.

### **Step 1 — Indicative Pricing Range**

Two weeks before pricing, the BD partner provides an indicative pricing range based on current market conditions, the bond's rating, and comparable transactions. Indicative pricing is a range, not a point — typical: 'we think this prices at Treasury + 110-130 bps in current market.' This range becomes the starting point for marketing.

### **Step 2 — Marketing and Order Building**

During the 7-14 day marketing period, the BD partner's distribution team and the syndicate co-managers contact institutional buyers. Initial conversations are at the indicative pricing levels. Buyers indicate interest (size and pricing). The book builds as orders come in.

Order patterns inform pricing:

Strong oversubscription (10x covered or better at indicative pricing) suggests room to tighten

Reasonable subscription (2-5x covered) suggests pricing is appropriately set

Light subscription (1.5x or less) suggests pricing needs to widen or the deal needs to be reduced

Differential demand by maturity (strong demand at front, weak at back) suggests retranching

### **Step 3 — Pre-Pricing Calls**

The night before pricing, the BD partner conducts pre-pricing calls with the issuer's representatives (Nest as FA, sponsor as obligor). The BD partner presents the book of orders, the pricing recommendations by maturity, and any retranching suggestions. The issuer's representatives review and provide direction — accept, push for tighter pricing, push for restructuring, or decline if pricing is materially worse than indicative.

### **Step 4 — Pricing Morning**

On pricing morning, the BD partner finalizes the deal terms: coupons by maturity, prices by maturity, allocations by buyer. The Bond Purchase Agreement is executed. The deal is sold to the underwriter. The underwriter has its commitments to allocated buyers.

### **Step 5 — Settlement**

Pricing is settled at closing (typically 7-10 days after pricing). Bonds are issued, allocations are delivered through DTC, payments flow per the closing flow of funds.

## **11.7 Buyer Pool Differential Pricing**

Different buyers pay different prices for the same bond. Understanding the buyer pool by maturity and rating is critical for capturing pricing efficiency.

### **Lifecos (Life Insurance Companies)**

Buy long-dated investment-grade fixed income matching their long-tail liabilities

Pay up for high-quality, long-duration, predictable cash flow

Particularly valuable for muni bonds at the long end (20-30 years)

Many lifecos have specific allowed/disallowed sectors and rating requirements

### **Bond Funds (Mutual Funds, ETFs)**

Buy across the credit spectrum and maturity spectrum

Value liquidity highly because they face redemptions

Particularly active in BBB to A range, 5-15 year maturities

Sensitivity to flow patterns — heavy bond fund redemptions widen spreads, inflows tighten

### **Bank Portfolios**

Buy high-quality, shorter-tenor bonds (typically 1-10 year)

Tax-exempt bonds attractive for community reinvestment and tax planning

Value serial structures and amortization

Particularly active in regional muni bonds where the bank has community presence

### **Money Market Funds and Tender Option Trusts**

Buy very short-dated (typically 1-7 day) variable rate bonds

Require high credit quality (AAA or AA short-term)

Highly sensitive to credit enhancement quality

Active in VRDOs and certain TOB structures

### **Hedge Funds and Specialty Buyers**

Buy higher-yielding paper — BB-rated and below, distressed, structured

Often opportunistic — buy at attractive spreads, sell when spreads tighten

Less stable demand than long-only buyers

Higher risk tolerance enables them to buy what other pools cannot

### **Retail and SMA (Separately Managed Account) Buyers**

Buy across the muni market for tax-exempt income

Tend to value high-coupon premium bonds for tax management

Often buy through wealth management platforms with allocation models

Particularly active in 5-15 year tax-exempt

## **11.8 Spread Optimization Strategies**

How structural decisions affect spread, beyond rating and credit:

### **Premium Structure**

Institutional buyers prefer premium-priced bonds (above par, with above-market coupons). The premium structure is more defensive in rising-rate environments and provides better yield optics. Structuring to 5%+ coupons at premium pricing typically tightens execution by 5-15 bps vs. par-priced bonds with lower coupons.

### **Block Size**

Larger blocks (single maturities of $25M+) attract more institutional interest and price tighter. Fragmented serial structures with $1-2M maturities per year may not get institutional attention and price wider. Optimal structuring concentrates par in block sizes that match buyer demand.

### **Call Protection**

Longer non-call periods produce wider buyer pools and tighter pricing for the same nominal yield. The trade-off is reduced refinancing optionality for the issuer. Nest's structuring agent runs the NPV comparison at structuring.

### **Covenant Quality**

Tighter covenants improve pricing by 5-25 bps depending on the specific covenants and the buyer pool. The trade-off is reduced operational flexibility. Calibrated covenant design captures the pricing benefit without unduly burdening the borrower.

### **Disclosure Quality**

Comprehensive, well-organized POS attracts more buyer attention and produces tighter pricing. Sparse or poorly-organized disclosure can cost 10-25 bps because buyers either skip the deal or demand a premium for the additional analytical work.

### **Rating Strategy**

Dual ratings broaden the buyer pool meaningfully. The marginal cost of a second rating ($75-200K) is often recouped many times over in tighter pricing. The platform runs this NPV at the rating selection decision in Stage 5.

### **Marketing Quality**

Investor presentations, one-on-one meetings with key buyers, and roadshows can tighten pricing meaningfully. The BD partner's effort and capability matters. This is where Nest's BD partner relationship pays off — a strong BD partner with active buyer relationships captures pricing efficiency the firm couldn't capture on its own.

## **11.9 The DV01 Calculus for Pricing Decisions**

Pricing decisions on the margin are best evaluated in dollar terms using DV01.

### **Example: Should We Push Back on Pricing?**

BD partner indicates pricing at Treasury + 130 bps. Sponsor and Nest believe Treasury + 115 bps is achievable based on book oversubscription and market read. Should they push?

Calculation: 15 bps of pricing improvement on $50M with modified duration 8.0:

DV01 = 8.0 × $50M × 0.0001 = $40K per bp

Total value of 15 bps tightening: 15 × $40K = $600K

This is the dollar value of pushing for tighter pricing. It's worth a hard conversation.

### **Example: Should We Add a Second Rating?**

Single rating produces expected Treasury + 145 bps. Dual rating produces expected Treasury + 125 bps (20 bps tighter due to broader buyer pool).

Cost of second rating: $125K

Value of 20 bps tightening: 20 × $40K = $800K

Net benefit: $675K — strongly favors dual rating.

## **11.10 Quick Reference — Silo 11**

### **Yield Concepts**

**Coupon —** Stated annual interest rate × par

**Current Yield —** Annual coupon / current price

**Yield to Maturity (YTM) —** IRR assuming hold to maturity

**Yield to Call (YTC) —** IRR assuming call at earliest call date

**Yield to Worst (YTW) —** Lowest of YTM, YTC, and YTC at every call date

**Yield to Average Life (YTAL) —** YTM using weighted average life

### **Spread Concepts**

**G-Spread (Treasury Spread) —** Bond yield − Treasury yield (matched maturity)

**Z-Spread —** Spread over Treasury spot curve producing market price

**OAS —** Z-Spread − Option Value

**MMD Spread —** Yield − AAA MMD curve yield (muni)

**Asset Swap Spread —** Spread received in fixed-to-floating asset swap

### **Duration Concepts**

**Macaulay Duration —** Weighted average time to cash flows

**Modified Duration —** Macaulay / (1 + YTM/n); approximate % price change per 100 bps

**Effective Duration —** Numerical duration accounting for embedded options

**Key Rate Duration —** Duration sensitivity to specific points on yield curve

**DV01 —** Modified Duration × Price × 0.0001; dollar value per bp

**Convexity —** Second-derivative price sensitivity; correction to duration for large moves

### **Buyer Pool Map**

Lifecos: long-dated IG; pay up for high quality

Bond funds: full spectrum; value liquidity

Bank portfolios: short-tenor IG; tax-exempt attractive

Money market funds: ultra-short variable rate AAA

Hedge funds: BB and below; opportunistic

Retail / SMA: tax-exempt across maturities; premium structures

### **Pricing Optimization Levers**

Premium pricing structure (5-15 bps benefit)

Block-size concentration (5-15 bps benefit on serials)

Call protection design (5-25 bps trade-off)

Covenant quality (5-25 bps benefit for tighter covenants)

Disclosure quality (10-25 bps benefit)

Dual ratings (10-30 bps benefit)

BD partner distribution quality (5-25 bps benefit)

# **SILO 12 — POST-CLOSING ADMINISTRATION**

This silo is Stage 13 unpacked. Post-closing administration is the operating reality that runs from closing day to bond maturity — typically 25-35 years. It is the largest single source of cumulative revenue per deal, the most defensible part of the business model, and the part of bond work that traditional middle-market bankers most underinvest in. The firm that owns post-closing administration owns the refunding pipeline, owns the deep relationship with the obligor, and owns a recurring revenue base that compounds with each new deal closed.

The platform's administration capability is the single most differentiated feature of the Nest business model. Most middle-market bond bankers close deals and hand them off to the trustee for administration. The trustee performs the mechanical functions but does not run analytical surveillance, does not proactively manage covenant compliance, does not identify refunding opportunities, and does not coordinate amendments or restructurings. Those are precisely the functions the obligor needs — and that Nest's platform provides as the administration engine.

**THE ADMINISTRATION PRINCIPLE —** Closing the deal is the entry point. Administering the deal is the relationship. The obligor doesn't think about Nest much between closings — but every quarter, when the financial report arrives, every covenant test, every draw, every disclosure filing, every material event, Nest is in the obligor's operations. That continuous presence is the moat — when the obligor needs a refunding, an amendment, a workout, or a new financing, Nest is the firm in the room.

## **12.1 The Administration Layer's Components**

The administration layer is built on six functional components: (1) construction draw processing; (2) debt service administration; (3) covenant monitoring; (4) continuing disclosure; (5) material event response; (6) amendment and waiver processing. Each is treated below with operational depth.

## **12.2 Construction Draw Processing**

On bonds where proceeds fund construction (typical for project finance, multifamily new construction, healthcare facility construction, senior living development), the construction period runs 12-36 months. During that period, bond proceeds held in the Construction Fund are drawn monthly to pay contractors, subcontractors, vendors, soft costs, and capitalized interest. The draw process is operationally intensive — each draw involves documentation review, math validation, lien waiver tracking, monitor coordination, and trustee disbursement.

### **The Draw Workflow**

***Step 1: Sponsor Initiates Draw***

The sponsor's project team (project manager, controller, or development principal) initiates the monthly draw based on contractor pay applications. The sponsor's input typically includes: contractor's AIA G702 (Application for Payment) showing total contract value, work completed to date, and amount requested this period; AIA G703 (Continuation Sheet) showing line-by-line breakdown; lien waivers from contractor and any major subcontractors covering prior period; any change orders affecting the contract sum; updated project budget showing actuals vs. budget; updated project schedule; soft cost invoices for the period (architect fees, legal fees, permit fees, etc.); capitalized interest calculation for the period.

***Step 2: Platform Validates***

The platform ingests the draw package and runs validation: arithmetic correctness; consistency with prior draws (no double-billing on same line items); consistency with overall budget (cumulative draws + retainage + remaining contract should equal original contract plus approved change orders); lien waiver completeness; soft cost documentation; capitalized interest calculation against indenture formula. Discrepancies are flagged for sponsor correction. Clean drafts move forward.

***Step 3: Construction Monitor Site Verification***

The construction monitor (independent engineer or construction consulting firm) visits the site and verifies that work claimed in the draw has actually been performed. The monitor's site visit is the physical verification — looking at the actual structure, measuring completion percentages, confirming materials on site. The monitor signs a draw certification confirming the requested amount reflects work performed.

This is the one step in the draw process that requires physical, off-platform work. The monitor is engaged as part of the closing and conducts inspections on the monthly draw cycle. The platform tracks the monitor's certifications and integrates them with the draw package.

***Step 4: Conduit Issuer Review (When Required)***

Some conduit issuers require their own review of draws above defined thresholds. The platform routes the draw package to the conduit when required and tracks the conduit's response.

***Step 5: Trustee Disbursement***

The certified draw package is delivered to the trustee. The trustee performs final administrative review (verification that all required documents are present, signatures are in order, draw is within budget limits). The trustee disburses funds to the obligor or directly to contractors per the disbursement schedule in the Construction Disbursement Agreement.

***Step 6: Platform Records and Reports***

The platform records the draw in the deal database — actual amount disbursed, allocation across budget categories, cumulative draws to date, remaining construction fund balance. Generates the monthly construction report for the sponsor, the trustee, and Nest. Updates the project tracking dashboard.

### **Draw Frequency and Timing**

Standard pattern: monthly draws on the 15th or 30th of each month. Some indentures allow bi-weekly or even weekly draws for fast-moving projects. The draw cycle is typically:

Day 1-5: contractor submits pay application to sponsor

Day 5-10: sponsor prepares full draw package and submits to platform

Day 10-15: platform validates; flags any issues; construction monitor schedules site visit

Day 15-18: site visit and monitor certification

Day 18-22: trustee review and disbursement

Day 22-30: contractor receives payment and pays subcontractors

Repeat next month

### **Common Draw Issues**

Issues that arise during draw processing:

Budget overruns — line items exceeding budget require change orders or budget reallocation

Lien waiver gaps — missing waivers from major subs hold up the draw

Construction monitor disputes — monitor disagrees with claimed completion percentages

Stalled progress — construction not progressing at the rate that would justify continued draws

Change orders — formal contract modifications requiring lender/bondholder review

Soft cost questions — capitalization of certain soft costs disputed under indenture

The platform tracks each issue and routes resolution. Most issues are resolved within the draw cycle without delay; some require negotiation between sponsor, contractor, monitor, and trustee.

### **Construction Period Fees**

**Per-draw processing fee —** $1,000 to $3,000 per draw

**Monthly administration retainer —** $3,000 to $8,000 per month

**Total construction-period revenue per deal —** $50K to $200K depending on project duration

## **12.3 Debt Service Administration**

Once the bond is operating (post-construction), the platform administers the periodic debt service payments. Standard pattern: semi-annual interest payments on May 1 and November 1 (or sometimes February 1 and August 1), with principal payments annually on one of the interest dates. Monthly-pay structures (less common) have payments on the same date each month.

### **The Debt Service Workflow**

***Step 1: Calculation***

30-45 days before each payment date, the platform calculates the payment amount based on the bond's terms. For fixed-rate bonds, the calculation is mechanical. For variable-rate bonds, the calculation uses the current interest rate per the reset mechanism. For amortizing bonds, principal due is per the amortization schedule. For sinking fund bonds, the platform identifies the bonds to be retired and processes the sinking fund call.

***Step 2: Obligor Funding***

The obligor must fund the trustee's collection account with the debt service amount before the payment date. Standard mechanic: monthly accruals are deposited by the obligor into the collection account from operating cash flow, so that by payment date the full debt service is on deposit. Some indentures require 5-10 days advance funding; others allow same-day funding.

***Step 3: Payment Processing***

On the payment date, the trustee processes the payment to bondholders through DTC and the paying agent. Bondholders receive their proportional share based on holdings. Settlement is typically same-day.

***Step 4: Reconciliation and Reporting***

The platform reconciles the payment — confirming the amount disbursed matches the calculated amount, confirming all bondholders were paid (no failed settlements), confirming proper allocation to interest vs. principal. Generates the payment report for the sponsor, the trustee, and Nest.

### **Shortfall Detection**

If the obligor cannot fund the trustee's collection account by the funding date, the platform's covenant monitoring layer should have detected the impending shortfall well in advance (more on this in Section 12.4). At funding date, if shortfall occurs, the platform alerts Nest senior bankers and the obligor immediately, and initiates the contingency response: drawing on the DSRF, requesting a waiver or forbearance, or initiating workout procedures.

Pre-payment shortfalls — detected with sufficient lead time — are usually manageable through DSRF draws or short-term liquidity arrangements. Surprise shortfalls — detected only at payment date — are operational failures of the administration layer. The platform's purpose is to prevent surprise shortfalls.

## **12.4 Covenant Monitoring**

The most operationally substantive part of administration. Each financial covenant in the indenture has defined formulas, defined test periods, defined cure provisions, and defined consequences for breach. The platform's covenant monitoring layer automates the testing, surfaces trends, and provides early warning of impending breaches.

### **Components of Covenant Monitoring**

***Data Pull***

Where the obligor's accounting system supports direct integration (modern cloud-based systems like NetSuite, QuickBooks Online, Sage Intacct, Workday), the platform pulls financial data directly via API. The platform receives monthly trial balance, income statement, balance sheet, and key operating metrics on a defined cycle (typically within 10 days of month-end).

Where direct integration is not available, the platform ingests financial statements submitted by the obligor in PDF, Excel, or other format. The platform's ingestion agent classifies the document, parses the line items, maps to the chart of accounts, and reconciles to prior periods. Manual review handles edge cases.

***Covenant Calculation***

The platform applies the covenant formulas defined in the indenture. Each covenant has its specific formula — DSCR is one calculation, MADS coverage is another, days cash on hand is another. The formulas are coded into the platform at closing based on the indenture language. Tests run on the defined frequency (monthly, quarterly, semi-annually, annually).

***Trend Analysis***

Beyond point-in-time tests, the platform tracks covenant trends over time. A DSCR that's slowly declining from 1.40x at issuance to 1.25x over three years is a warning even though the current level is well above the 1.15x threshold. The trend is the actionable signal. The platform's analytics layer identifies trends, projects forward, and produces early warnings before actual covenant breaches occur.

***Compliance Certificate Generation***

Each quarter, the platform generates the compliance certificate based on the calculated tests. The certificate includes: covenant-by-covenant calculation showing the formula, the inputs, the result, the threshold, and pass/fail; certification by the obligor's CFO that no event of default exists; certification that all reserves are at required levels; any other certifications required by the indenture. The obligor's CFO reviews the platform-generated certificate, signs (literally or electronically), and the certificate is filed with the trustee. For municipal bonds, it's also posted to EMMA.

***Early Warning System***

The platform's alerting layer triggers warnings at multiple thresholds:

Yellow alert: covenant ratio within 15% of threshold

Orange alert: covenant ratio within 5% of threshold

Red alert: covenant ratio at or below threshold

Forward red: projected covenant breach in next 1-3 quarters based on trends

Alerts route to Sean and Josh in addition to the obligor. The early warning enables proactive intervention — covenant amendment, equity infusion, operating adjustment, restructuring discussion — before actual breach. By the time the platform red-alerts, several months of cushion typically still exist.

### **Covenant Compliance Failure Response**

When a covenant actually breaches, the platform initiates the response protocol:

Document the breach with full calculation showing the failure

Notify the trustee per indenture requirements

Determine cure period (if applicable) per indenture

Determine whether the breach is curable through equity infusion or other defined cure

Determine whether to seek waiver, forbearance, or amendment from bondholders

Engage bond counsel and disclosure counsel for any required disclosure or remediation

Initiate workout procedures if breach is structural

## **12.5 Continuing Disclosure**

Required by SEC Rule 15c2-12 for almost all municipal bonds. The obligor's contractual undertaking is in the Continuing Disclosure Agreement signed at closing. Required filings:

### **Annual Financial Information**

**Content —** Audited financial statements; operating data (sector-specific); compliance certificate

**Timing —** Within defined period after fiscal year end (typically 9 months for municipal)

**Filing destination —** MSRB EMMA for municipal bonds

### **Material Event Notices**

**Triggers (per Rule 15c2-12) —** Principal and interest payment delinquencies; non-payment related defaults; unscheduled draws on debt service reserves; unscheduled draws on credit enhancements; substitution of credit or liquidity providers; adverse tax opinions or other tax-related events; modifications to rights of holders; bond calls (other than mandatory sinking fund); defeasances; release/substitution/sale of property securing the bonds; rating changes; bankruptcy/insolvency/receivership; merger, consolidation, or sale of substantially all assets; appointment of successor trustee; incurrence of financial obligation or modification of financial obligation if material

**Timing —** Within 10 business days of event (extended in some cases)

**Filing destination —** MSRB EMMA

### **Filing Mechanics**

The platform produces continuing disclosure filings automatically. The annual filing pulls the audited financials (from upload or direct integration), formats per EMMA requirements, packages with the compliance certificate and operating data, and files. The platform tracks filing deadlines and alerts when due dates approach.

Material event detection is partly automatic (the platform watches for events visible in public data — rating changes, certain corporate transactions, certain financial events) and partly obligor-initiated (the obligor notifies the platform of internal events that trigger filings). Event filings are produced from templates within hours of identification and filed promptly.

### **Failure to File Consequences**

Failure to file required continuing disclosure is itself a material event that must be disclosed. Persistent disclosure failures can affect the bond's secondary market liquidity, may be reported in rating actions, and can affect the obligor's access to future capital markets. The platform's automation of disclosure essentially eliminates this risk — filings happen on time because the platform makes them.

## **12.6 Material Event Response**

Beyond filing, material events sometimes require operational response. The platform tracks events and routes the response.

### **Rating Downgrades**

If a rating agency downgrades the bonds, the platform: (1) detects the downgrade (typically from the agency's published report); (2) files the material event notice; (3) reviews indenture for any rating-triggered consequences (covenant tightening, additional collateral, accelerated reserves, change in counterparty obligations); (4) communicates with the obligor about the downgrade's implications; (5) coordinates response with rating agency analyst (often a follow-up call to discuss the rationale and any actions that could affect future surveillance).

### **Draw on Credit Enhancement**

If a draw on LOC or bond insurance occurs (because the obligor failed to make a debt service payment): file the material event notice; coordinate with the enhancement provider on reimbursement; determine the obligor's plan to repay the enhancement provider; review consequences under the LOC reimbursement agreement (which typically has its own covenants that are now triggered); coordinate any required additional protective measures.

### **Change of Control**

If the obligor undergoes a change of control: review the indenture for change-of-control triggers (some indentures require bondholder consent; some give bondholders put rights; some have no consequences); coordinate any required bondholder notification or consent solicitation; for change-of-control puts, manage the put exercise process and coordinate funding.

### **Bankruptcy or Material Litigation**

The most serious material events. Bankruptcy of the obligor triggers automatic stay, requires immediate trustee engagement and bond counsel coordination, and typically initiates a workout or restructuring process. Material litigation that threatens the obligor's operations or ability to perform requires careful tracking and disclosure.

## **12.7 Amendment and Waiver Processing**

Over the bond's life, the obligor sometimes needs to take actions that require modification of the indenture or covenants. Standard categories:

### **Permitted Action Modifications**

Modifications to the definition of permitted actions (e.g., expanding the permitted indebtedness baskets, adjusting the additional bonds test, modifying lien restrictions). Usually require majority bondholder consent.

### **Covenant Modifications**

Loosening or tightening of covenants. Loosening (e.g., reducing minimum DSCR threshold) is the more controversial direction and typically requires significant consent percentage. Tightening (e.g., adding new reporting requirements) is easier to pass.

### **Payment Term Modifications**

Changes to coupons, maturities, payment dates, or principal amounts. These are the most consequential modifications and typically require supermajority (two-thirds) or unanimous bondholder consent. The high bar reflects the fundamental nature of payment terms — bondholders bought the bonds expecting specific payment terms and cannot be forced into modifications.

### **Mechanical Modifications**

Routine modifications like correcting typographical errors, adding clarifying language, or accommodating new counterparties (trustee transitions, paying agent changes). Usually no-consent or minimal-consent.

### **Amendment Process Workflow**

***Step 1: Identifying the Need***

The obligor identifies the desired modification. Common triggers: planned acquisition requiring additional debt beyond permitted thresholds; refinancing of subordinate debt requiring waiver of consent rights; strategic change of business requiring covenant adjustment; trustee transition or other counterparty change.

***Step 2: Drafting the Modification***

Bond counsel drafts the supplemental indenture or consent solicitation. The platform supports the drafting with precedent and indenture-specific language.

***Step 3: Identifying Required Consent***

Determine the consent threshold from the indenture (majority, supermajority, unanimous). Identify the bondholders entitled to consent (typically holders of record at a defined date). For deals with many small holders, calculate the consent fee economics — often necessary to pay a fee to incentivize consent.

***Step 4: Consent Solicitation***

Distribute the consent solicitation to bondholders. For DTC-held bonds, this happens through DTC's procedures. The solicitation includes the proposed modification, the rationale, the consent fee (if any), and the response deadline (typically 30-60 days).

***Step 5: Tabulation***

Track consents as they arrive. The platform tracks responses by bondholder, calculates consent percentages, and reports progress. Once the threshold is met, the modification is approved.

***Step 6: Execution***

Execute the supplemental indenture between issuer and trustee. Pay consent fees to consenting bondholders. File the supplemental indenture with appropriate authorities (county recorder for any recorded modifications, EMMA for muni).

### **Amendment Fees**

**Structuring fee for amendment work —** $25K-$100K per amendment depending on complexity

**Consent fees to bondholders —** 5-25 bps of consenting par

**Bond counsel fees —** $25K-$75K

**Trustee fees —** $5K-$15K

**Total amendment cost to obligor —** $75K-$250K typical

## **12.8 Refunding Coordination**

The refunding pipeline is one of the most economically powerful features of the post-closing administration layer. Every Nest deal closed today is a potential refunding deal in years 7-10 when call protection expires.

### **Refunding Trigger Identification**

The platform runs the refunding analysis continuously across the administered portfolio. Each quarter, it recomputes refunding economics for every administered bond based on current rate conditions. The analysis includes:

Current call eligibility (is the bond past the non-call period or approaching it)

Call price at next eligible call date

Current refinancing rate available (based on bond rating, sector, market conditions)

Projected refunding NPV savings

Breakeven rate (how much rates would need to move to make refunding economic if not already)

Strategic considerations (covenant relief desired, structure changes desired, balance sheet optimization)

When refunding economics cross the threshold (typically 3-5% NPV savings of par being refunded), the platform flags the opportunity. Sean and Josh review and present to the obligor.

### **Refunding Execution**

Once the obligor decides to proceed with refunding, the deal effectively runs as a new issuance — Stage 0 of the workflow begins again, with the same set of structural decisions, counterparty engagements, and execution steps. The platform's automation makes refunding execution much faster than a first-time issuance because the obligor's diligence is largely already in the platform.

Refunding revenue is a full new-issuance fee event. Pre-screen fee, structuring fee, BD partner share of new underwriter discount, etc. The refunding is economically equivalent to a new $50M issuance even though the obligor has been a client for 7-10 years.

## **12.9 Restructuring and Workout**

When the obligor's credit deteriorates significantly, the bond moves into workout. This is heavy work — relationship-intensive, structurally complex, often requiring negotiation across multiple bondholder groups, equity holders, and other stakeholders.

### **Workout Triggers**

Multiple consecutive financial covenant breaches with no clear remediation path

Payment default (failure to make scheduled debt service)

Draw on DSRF (signaling that operating cash flow has been insufficient for debt service)

Material adverse change in the obligor's business or assets

Bankruptcy filing or imminent bankruptcy filing

### **Workout Options**

Forbearance — bondholders agree to forbear from exercising remedies for a defined period, giving the obligor time to remediate

Debt service deferral — interest or principal payments deferred to a later date

Principal reduction — partial forgiveness of principal in exchange for restructured terms

Coupon reduction — reduction of coupon rate, with possible later step-up

Maturity extension — extension of maturity to give more time to repay

Exchange offer — existing bonds exchanged for new bonds with modified terms

Distressed exchange — exchange at a discount to par; recognized as a default by rating agencies

Debt-to-equity conversion — bonds converted to equity in the reorganized obligor

Sale of assets to repay bonds — obligor sells assets to generate proceeds for bond repayment

Chapter 11 reorganization — formal bankruptcy with court-supervised restructuring

Chapter 7 liquidation — last resort; obligor's assets sold and proceeds distributed

### **Workout Fees**

**Structuring fee for workout —** 1-3% of par being restructured

**Success fee if workout completes —** Additional 50-200 bps of par

**Bond counsel and specialist fees —** Substantial; often $300K-$1M+ on complex workouts

Workouts are operationally heavy but commercially valuable. The fees are substantial, and successful workouts preserve client relationships and protect Nest's reputation in adjacent markets. The senior banker (Sean or Josh) leads the workout; the platform supports but does not drive.

## **12.10 Annual Surveillance Support**

Each rating agency conducts annual surveillance reviews on outstanding rated bonds. The surveillance review evaluates whether the bond's rating remains appropriate based on current operating performance, market position, and credit metrics.

### **Surveillance Package Production**

The platform produces the surveillance package on a defined annual cycle. The package includes:

Updated operating performance vs. projections

Covenant compliance history over the past year

Material developments (good and bad) since last surveillance

Updated peer comparison

Forward outlook

Sponsor or management changes

Updated capital structure

Any other material information

### **Surveillance Meeting**

On larger or more material credits, the rating analyst conducts a surveillance call or meeting with the obligor's management. The platform coordinates the scheduling and prepares management for the call. Common topics: performance vs. expectations, near-term outlook, capital plans, leadership stability, sector dynamics.

### **Surveillance Outcomes**

Possible outcomes: affirmation of current rating (most common); upgrade (when performance has exceeded expectations); downgrade (when performance has deteriorated); CreditWatch or Outlook change (signal of potential future rating change); no action with commentary.

Rating actions are material events requiring filing under Rule 15c2-12. Upgrades produce pricing benefits to the obligor (and refunding opportunities). Downgrades may trigger covenant adjustments or other indenture-defined consequences.

## **12.11 The Ongoing Revenue Math**

Across all of Stage 13 components, the fee accumulation per deal:

### **Construction Period (Years 1-2 typical)**

**Per-draw processing —** $1K-$3K × 12-30 draws = $12K-$90K

**Monthly retainer —** $3K-$8K × 12-30 months = $36K-$240K

**Construction-period total —** $50K-$330K typical

### **Operating Period Annual Recurring (Years 2-30+)**

**Annual admin fee —** 15-30 bps on outstanding par

**On $50M outstanding —** $75K-$150K per year

**Over 28 years operating —** $2.1M-$4.2M cumulative undiscounted

### **Event Fees (Periodic)**

**Amendments —** $25K-$100K per event (typical 1-3 per bond life)

**Call execution —** $5K-$25K

**Rate mode conversions (VRDOs) —** $15K-$50K

**Trustee transitions —** $10K-$30K

**Cumulative event fees per bond —** $100K-$500K typical

### **Refunding (Years 7-10)**

**Full new-issuance fee event —** $500K-$1M+ at refunding

### **Restructuring (Conditional)**

**Workout fees if needed —** 1-3% of par being restructured = $500K-$1.5M+ on a $50M restructure

### **Total Lifecycle Stage 13 Revenue Per Deal**

**Stable, no refunding —** $2.5M-$4M cumulative undiscounted; $800K-$1.5M PV

**With refunding —** $3.5M-$5.5M cumulative; $1.5M-$2.5M PV

**With restructuring —** Additional $1M-$3M event revenue

## **12.12 Quick Reference — Silo 12**

### **Administration Components**

Construction draw processing

Debt service administration

Covenant monitoring

Continuing disclosure

Material event response

Amendment and waiver processing

Refunding coordination

Restructuring and workout

Annual surveillance support

### **Draw Processing Cycle**

Day 1-5: Contractor submits pay app to sponsor

Day 5-10: Sponsor prepares package, submits to platform

Day 10-15: Platform validates; monitor schedules site visit

Day 15-18: Site visit and certification

Day 18-22: Trustee disbursement

Day 22-30: Contractor receives payment

### **Covenant Alert Thresholds**

**Yellow alert —** Covenant ratio within 15% of threshold

**Orange alert —** Covenant ratio within 5% of threshold

**Red alert —** Covenant ratio at or below threshold

**Forward red —** Projected breach in next 1-3 quarters

### **Stage 13 Fee Summary Per Deal**

**Construction period —** $50K-$330K

**Annual admin (per year on $50M) —** $75K-$150K

**Cumulative annual admin (28 years) —** $2.1M-$4.2M undiscounted

**Event fees cumulative —** $100K-$500K

**Refunding revenue (if exercised) —** $500K-$1M+

**Total Stage 13 revenue (typical) —** $3.5M-$5.5M cumulative undiscounted

# **SILO 13 — REFUNDINGS, RESTRUCTURINGS, AND WORKOUTS**

A bond's life is not static. Rates move, credits change, sponsor strategies evolve, projects perform above or below expectations, and the structures issued at year zero often become suboptimal by year five or seven. The mechanisms by which bonds are modified across their life — refunding, restructuring, workout — are where some of the most valuable banker work happens, and where Nest's administration platform creates the most defensible competitive position. This silo walks the full lifecycle of bond modification.

Three distinct activity types are covered here, and the boundaries matter: refunding is voluntary economic refinancing typically initiated by the obligor for rate, term, or structural reasons; restructuring is consensual modification of terms when current structure no longer works, typically initiated under credit stress but before default; workout is the active management of defaulted or near-defaulted bonds, often involving formal forbearance, exchange, or bankruptcy proceedings. The skill sets, the fees, the legal frameworks, and the relationship dynamics differ across the three.

**THE MODIFICATION PRINCIPLE —** Every bond in the administered portfolio is either heading toward refunding (good outcome), restructuring (manageable outcome), or workout (stressed outcome). The platform's job is to identify each bond's trajectory early enough to maximize value capture. A bond identified as a refunding candidate at year 7 captures the full refunding economics. A bond identified as a workout candidate three quarters after default is a much harder fee event and a much harder client relationship to preserve.

## **13.1 Refundings — The Voluntary Economic Refinance**

Refunding is the issuance of new bonds whose proceeds are used to retire existing bonds. The obligor's economic motivation: capture lower current rates, restructure the amortization or maturity, change the tax structure, modify covenants, or address sponsor-level capital structure changes. Refundings are typically positive events — the obligor's credit is stable or improving, market conditions favor refinancing, and the transaction creates value for the obligor while generating a full new-issuance fee event for Nest.

### **13.1.1 The Refunding Categories**

***Current Refunding***

New bonds issued within 90 days of the existing bonds' call date or maturity. The refunding proceeds pay off the existing bonds when they become callable or matured. Standard mechanic for tax-exempt bonds — current refunding has always been permitted under IRS rules.

Mechanics: refunding bonds price, refunding bonds close, refunding proceeds held in escrow for the brief intervening period, on the call date the trustee pays off the existing bonds at the call price. Existing bondholders receive their call price; new bondholders own the refunding bonds going forward.

Current refunding is the workhorse of refunding activity post-2017. Most tax-exempt bonds with year 7-10 non-call periods become current refunding candidates when rates fall sufficiently to make refinancing economic.

***Advance Refunding***

New bonds issued more than 90 days before the existing bonds' call date or maturity. The refunding proceeds are deposited into an escrow that invests in government securities sufficient to pay debt service on the existing bonds through their call or maturity date. The existing bonds remain outstanding but are 'defeased' — economically retired — because the escrow funds future payments.

Historic mechanic for tax-exempt bonds. Until 2017, an issuer could advance-refund a tax-exempt bond with new tax-exempt bonds once during the bond's life. The Tax Cuts and Jobs Act of 2017 eliminated advance refunding of tax-exempt bonds with tax-exempt bonds. This was a major change to muni market dynamics and refunding playbooks.

Advance refunding with taxable bonds is still permitted. So is advance refunding for taxable bonds generally. So tax-exempt issuers can still advance-refund their tax-exempt bonds, but only using taxable refunding bonds — which gives up the tax exemption benefit on the new debt.

***Forward Refunding***

Lock in current rates for a future refunding that will close at a defined later date. The obligor commits today to issue refunding bonds at a future date at rates determined now. Used when the obligor expects to refund in the near future but wants protection against rates rising in the interim.

Mechanically complex. The forward rate is locked through a forward bond purchase commitment, sometimes supported by underwriter forward delivery agreements, sometimes through swap overlays. Carries counterparty risk — if rates fall further by the forward closing date, the obligor is locked into the higher locked-in rate. Used selectively in specific market conditions.

***Crossover Refunding***

Specific structure used when the obligor wants to refund but the existing bonds are not yet callable and advance refunding rules don't apply favorably. The refunding bonds are issued; proceeds are placed in an escrow that pays debt service on the refunding bonds (not the existing bonds) until the existing bonds become callable; at that point the escrow flips and pays off the existing bonds. The two bond series cross over at the call date.

Used historically when advance refunding wasn't available or wasn't economic. Now relatively rare given the simpler mechanics of current refunding.

### **13.1.2 The Refunding NPV Analysis**

The platform's structuring agent runs the refunding analysis continuously across the administered portfolio. The analysis answers: does refunding produce sufficient NPV savings to justify execution?

***Inputs to the Analysis***

Existing bonds' remaining debt service schedule (principal and interest by period). Existing bonds' call date and call price. Current market rate at which refunding bonds could be issued. Costs of issuance for the refunding (bond counsel, underwriter, trustee, conduit, etc.). Any escrow yield restriction for tax-exempt advance refunding (the escrow's earning rate is restricted to the bond yield).

***The NPV Calculation***

**NPV Savings —** PV(Existing DS Remaining) − PV(Refunding DS) − Call Premium − Refunding COI − Escrow Cost (if defeasance)

PV calculations use the refunding rate as the discount rate. Existing DS Remaining is the cash flow that the obligor would have paid on the existing bonds going forward. Refunding DS is the cash flow on the new bonds. The difference, less the call premium, costs of issuance, and any escrow cost, is the refunding NPV savings.

***Decision Threshold***

Industry rule of thumb: refunding makes sense when NPV savings exceed 3-5% of par being refunded. Below 3%, the savings are too small to justify the execution risk and complexity. Above 5%, refunding is strongly economic. Between 3% and 5% is a judgment call based on the obligor's situation, market direction expectations, and strategic considerations.

More aggressive thresholds (1-2% NPV savings) sometimes drive refunding when combined with strategic motivations — covenant relief, capital structure optimization, sponsor-level changes. The pure economic threshold of 3-5% is the floor for purely rate-driven refunding.

### **13.1.3 The Refunding Decision Tree**

Beyond NPV, several factors influence the refunding decision:

Call status — is the bond past its non-call date, or does advance refunding apply?

Market direction expectations — if rates are expected to fall further, waiting may produce better savings

Credit improvement — if the obligor's credit has improved since issuance, refunding can capture both rate improvement and credit improvement simultaneously

Strategic needs — does the obligor need covenant relief, additional debt capacity, structural changes that go beyond pure rate refinancing?

Tax status changes — was the original bond tax-exempt and the refunding can preserve or modify the tax structure?

Timing — is there a window before some other event (rating action, sponsor transaction, regulatory change) that affects the deal?

### **13.1.4 The Refunding Execution Workflow**

Once the obligor decides to refund, the deal effectively reruns the full Stage 1-12 workflow:

Stage 1: Document ingestion (largely already in platform from administration)

Stage 2: Sponsor diligence (typically light refresh given existing relationship)

Stage 3: Project underwriting refresh (update pro forma to current conditions)

Stage 4: Refunding structuring memorandum (the key decisions are different from a new issuance — escrow design, call mechanics, defeasance vs. current refunding, etc.)

Stage 5: Engagement and rating strategy (typically simpler — existing rating relationships continue)

Stage 6: Document drafting (much faster than first issuance — most documents are similar to existing with modifications)

Stage 7: POS production (existing POS provides substantial starting point)

Stages 8-12: Working group, approvals, rating committee, pricing, closing (largely as new issuance but compressed)

Total refunding execution timeline: typically 60-90 days from start to close, vs. 90-150 days for a new issuance. The compression is the platform's advantage — the existing administration relationship contains substantially all of the diligence and structural understanding needed for the refunding.

### **13.1.5 Special Refunding Mechanics**

***Escrow Defeasance for Advance Refunding***

When advance refunding (or crossover refunding) is used, an escrow account is established at the trustee bank, holding government securities (Treasuries or agencies) sufficient to pay debt service on the bonds being refunded through their call date or maturity. The escrow is structured to produce exact cash flow matching — the securities mature on dates that fund each scheduled debt service payment.

The verification agent (typically a CPA firm) verifies that the escrow contains sufficient securities to make all scheduled payments. The verification report is required for the bond counsel to deliver the tax opinion on the refunding bonds.

Common verification agents: Robert Thomas CPA, Causey Demgen Moore, Bingham Arbitrage Rebate Services. Verification fees typically $15K-$40K. The verification agent is engaged early in the refunding process; the verification work happens in parallel with the rest of the refunding execution.

***Escrow Yield Restriction***

For tax-exempt bonds defeased with tax-exempt refunding bonds, the escrow's investment yield is restricted to the bond yield (this is the arbitrage rule). The escrow can earn the bond yield but no more. This 'yield restriction' produces less escrow income than an unrestricted escrow would earn — increasing the escrow's cash funding requirement.

Some sophisticated escrow structures use yield-restricted securities (special Treasuries called SLGS — State and Local Government Series — issued by the Treasury specifically for tax-exempt bond escrows). SLGS can be tailored to any yield up to the bond yield, providing perfect yield matching.

***Negative Arbitrage***

If market Treasury rates are below the bond yield, the obligor effectively pays a cost for the escrow (because the escrow earns less than the bond's interest cost). This is 'negative arbitrage' — the escrow's economic cost beyond the call premium. In low-rate environments, negative arbitrage can be substantial and is a real consideration in refunding economics.

In rising-rate environments, negative arbitrage is small or non-existent because Treasuries earn close to the bond yield. The refunding economics improve in rising-rate environments for this reason — even when refunding savings on the underlying coupon are modest, the escrow's negative arbitrage is also modest.

### **13.1.6 Refunding Fee Architecture**

Refundings are full new-issuance fee events. The fee structure parallels Stage 12 but with adjustments reflecting that significant work product carries over from the original issuance.

**Pre-screen fee —** Typically waived or reduced for existing clients ($0-$10K)

**Refunding structuring fee —** $125K-$400K (slightly below comparable new issuance due to leverage from existing work)

**Underwriter discount share at BD partnership split —** Full new-issuance share ($300K-$600K on typical refunding)

**Verification agent (advance refunding only) —** $15K-$40K paid by obligor as COI

**Other COI —** Bond counsel, trustee, rating agencies, conduit at standard rates

**Total Nest revenue per refunding —** $450K-$1M typical

### **13.1.7 The Refunding Pipeline Dynamic**

As discussed earlier, the refunding pipeline is one of the most powerful features of the firm's economics. Every closing today is a potential refunding 7-10 years out. Mathematically:

If Nest closes 12 deals per year, by year 8 the firm has 96 outstanding deals in the administered portfolio. At a 60-70% refunding rate (some bonds run to maturity, some are early-redeemed for other reasons), the firm has 7-10 refunding events per year by year 8 in addition to the 12 new issuances. By year 15, the portfolio is 150+ outstanding deals and refunding events run 10-15 per year alongside new issuance.

The refunding pipeline produces revenue that compounds with the firm's history. The firm's year 8 revenue includes new issuances plus refundings of years 1 cohort; year 9 includes refundings of years 1-2 cohorts; year 10 includes refundings of years 1-3 cohorts. By year 12-15, the refunding revenue alone can match or exceed new-issuance revenue.

### **13.1.8 The Refunding Capture Strategy**

Owning the refunding requires owning the administration relationship. Three mechanics protect refunding capture:

Continuous relationship — the platform's administration creates monthly touchpoints with the obligor; the obligor doesn't shop refundings to other bankers because Nest is already deeply embedded

Proactive identification — the platform identifies refunding opportunities before the obligor does; when the obligor receives the analysis, Nest is already two steps ahead of any competitor

Execution speed — refunding execution from Nest's platform is meaningfully faster than from a new-relationship banker; the obligor values the speed and chooses Nest for it

**THE REFUNDING MOAT:** The post-closing administration relationship is the moat that captures the refunding. Without active administration, refundings get shopped — the obligor runs a competitive process and the original banker often loses to a competitor with better current pricing. With active administration, refundings are nearly automatic — the platform identifies them, presents them, and executes them with the existing relationship.

## **13.2 Restructurings — The Consensual Modification Under Stress**

Restructuring is consensual modification of bond terms when the current structure no longer works for the obligor — typically due to credit deterioration, market change, or sponsor situation. Restructuring is distinct from refunding (which is economically driven) and from workout (which involves default). Restructuring happens when the obligor and bondholders agree to modify terms before formal default.

### **13.2.1 Restructuring Triggers**

Common reasons restructuring becomes necessary:

Sustained operational underperformance — DSCR has eroded from 1.40x at issuance to 1.10x, hovering at the covenant threshold

Market shift — the project's market has weakened beyond original projections; rents have declined, occupancy has fallen, demand has shifted

Sponsor-level distress — the sponsor entity faces broader financial issues that affect the obligor

Capital structure issues — subordinate debt or equity capital has issues that affect the bonds

Regulatory or legal changes — new regulations affecting the project; tax law changes; legal rulings affecting the asset class

Sponsor strategy change — the obligor wants to fundamentally change strategy in a way that requires modified covenants

Combined factors — usually it's multiple factors combining to push the structure toward modification

### **13.2.2 Restructuring Options**

Available modifications fall along a spectrum from light to heavy:

***Light Modifications***

Covenant relief — temporary loosening of financial covenants for defined periods; sponsor commits to remediate

Reporting modifications — additional reporting in exchange for covenant relief; bondholders accept information for forbearance

Reserve adjustments — temporary reduction in reserve requirements; reserves restored later

Permitted action expansions — expansion of permitted indebtedness or lien baskets to give sponsor more strategic flexibility

***Medium Modifications***

Coupon adjustments — temporary or permanent coupon reduction in exchange for other concessions

Amortization adjustments — back-loading principal payments; converting amortization to bullet structures; deferring scheduled principal

Maturity extension — pushing the maturity out 5-10 years to align with revised business plans

Additional collateral — sponsor adds collateral (additional real estate, parent guarantee, cash collateral) in exchange for modifications

Equity contribution — sponsor injects equity into the borrower entity to support credit

***Heavy Modifications***

Principal reduction — partial forgiveness of principal in exchange for other concessions

Exchange offer — existing bonds exchanged for new bonds with materially different terms

Tranche resubordination — senior bonds and subordinate bonds resubordinated to reflect changed credit dynamics

Debt-to-equity conversion — bonds converted partially or fully to equity in the borrower entity

### **13.2.3 Bondholder Engagement in Restructuring**

Restructuring requires bondholder consent. The relevant threshold depends on what's being modified:

Majority consent — sufficient for most covenant and operational modifications

Supermajority consent (typically two-thirds) — required for material modifications affecting bondholder rights

Unanimous consent — required for modifications to payment terms (coupon, principal, maturity, payment dates) under most indentures

The unanimous consent requirement for payment-term modifications is the highest practical barrier in restructuring. With unanimous required, a single holdout bondholder can block the restructuring. Strategies to address holdouts:

Consent fees — paying bondholders a fee for consent (typically 25-100 bps of consenting par)

Exit consents — modifications that materially reduce protection for non-consenting holders, incentivizing consent

Bond exchange — offering bondholders new bonds in exchange for existing; non-exchanging holders are left with the existing bonds in a less liquid market

Buybacks — purchasing holdout bonds in the secondary market

### **13.2.4 The Restructuring Working Group**

Restructuring requires expanded counterparty engagement beyond typical issuance:

Existing bond counsel and disclosure counsel — handle modification documents

Workout-specialist legal counsel — sometimes engaged for complex restructurings; firms like Kirkland, Weil, Skadden, Latham, Jones Day, Paul Weiss have dedicated restructuring practices

Financial restructuring advisor — independent restructuring advisor representing either the bondholders or the obligor; firms like Houlihan Lokey, PJT Partners, Lazard, Evercore, Moelis, Centerview have specialized restructuring practices

Bondholder advisor / representative — sometimes appointed by major bondholders to coordinate bondholder response

Existing trustee — continues to administer; may step up engagement for restructuring votes

Rating agencies — track the restructuring; restructuring often produces rating downgrade even if successful

### **13.2.5 Restructuring Fee Structure**

Restructuring fees are substantial but variable based on complexity:

**Restructuring structuring fee —** 1.0%-2.5% of par being restructured ($500K-$1.25M on $50M)

**Success fee (paid on completion) —** Additional 50-150 bps of restructured par

**Bond counsel and restructuring counsel —** $300K-$1M+ depending on complexity

**Financial restructuring advisor —** $500K-$2M for complex restructurings

**Trustee fees —** $25K-$100K for restructuring administration

**Rating agency fees —** $50K-$150K if rating action involved

The total cost of restructuring on a $50M bond runs $1M-$3M aggregate across all working group members. Nest captures meaningful share through structuring and success fees — typically $750K-$2M on a successful restructuring.

### **13.2.6 The Restructuring Workflow**

Phase 1: Identification and Diagnosis (1-3 months). The platform detects credit deterioration through covenant monitoring. Sean and Josh review with the sponsor. Diagnosis of the underlying problem — is it sustainable underperformance, recoverable temporary stress, or structural insolvency? Decision on path forward.

Phase 2: Restructuring Plan Development (2-4 months). Nest, in coordination with the obligor and any engaged financial advisors, develops a restructuring proposal. The proposal is tested against feasibility — can the modified structure produce sustainable debt service capacity? Is the proposed plan acceptable to bondholders likely to receive it?

Phase 3: Bondholder Outreach (1-3 months). The proposal is shared with major bondholders. Often coordinated through the BD partner who has relationships with the institutional holders. Bondholders provide feedback; the proposal is refined based on their input.

Phase 4: Formal Solicitation (2-4 months). Formal consent solicitation or exchange offer is launched. Bondholders vote / tender. Consent threshold tracked. Modifications negotiated with holdouts.

Phase 5: Execution (1-2 months). Documentation executed. Supplemental indenture filed. Modifications take effect. Disclosure filed. Operations adjusted to the new structure.

Phase 6: Monitoring (ongoing). Restructured bonds remain under administration. Performance against the restructured plan is monitored. Future modifications (further restructuring or eventual refunding) coordinated.

Total restructuring timeline: typically 8-15 months from initial diagnosis to executed modifications. Heavy work; substantial fees; high-leverage relationship for Nest if the restructuring succeeds.

## **13.3 Workouts — Active Management of Defaulted Bonds**

Workout is the management of bonds in default or near-default. Distinguished from restructuring by the existence of formal default — payment default, covenant default that's matured into an event of default, or other formal breach of the indenture. Workout often involves formal forbearance, exchange offers, or bankruptcy proceedings.

### **13.3.1 Default Categories**

Different default categories trigger different workout approaches:

Payment default — failure to pay scheduled debt service; typically the most consequential default; triggers immediate acceleration rights for bondholders subject to cure periods

Financial covenant default — failure to meet financial covenant; typically has defined cure period or equity cure availability

Affirmative covenant default — failure to perform required action; typically has notice and cure period

Negative covenant default — taking a prohibited action; typically immediate event of default with no cure

Material adverse change — defined event materially impairing performance; broad and discretionary

Cross-default — default under other material debt triggers default under the bonds

Bankruptcy — voluntary or involuntary bankruptcy filing; automatic stay applies

### **13.3.2 Pre-Default Workout (Imminent Default)**

When the platform's covenant monitoring detects impending default — the obligor is on track to miss a payment, breach a covenant, or face another defined default event — preemptive workout begins. Goals:

Identify the cause of impending default — is it cash flow, operational, market, or structural?

Determine if the cause is temporary or structural

Identify possible remediation options — equity infusion, asset sale, operational change, covenant waiver

If remediation can prevent default, execute remediation and remain in non-default status

If default is unavoidable, prepare for managed default — engage workout counsel, develop forbearance proposal, coordinate with major bondholders

### **13.3.3 Post-Default Workout**

Once a default actually occurs, the workout proceeds through defined phases:

***Phase 1: Acceleration Decision***

Bondholders, acting through the trustee, decide whether to accelerate the bonds (declare all principal immediately due). Acceleration is the strongest remedy but also the most disruptive — it converts a defaulted bond into an immediate cash demand that the obligor almost certainly cannot meet. Bondholders typically prefer not to accelerate unless the obligor's situation is clearly unrecoverable. Acceleration requires defined bondholder vote (typically majority or supermajority).

***Phase 2: Forbearance***

Bondholders agree to forbear from exercising default remedies for a defined period in exchange for the obligor's commitment to a workout plan. Forbearance is the workout's normal first stage — it stabilizes the situation while a plan is developed.

Standard forbearance terms: defined forbearance period (typically 90-180 days); obligor commitment to deliver a restructuring plan within the period; obligor commitment to enhanced reporting and transparency; forbearance fee paid to bondholders (typically 25-100 bps of par); waiver of specific known defaults during forbearance period; reservation of remedies if plan is not delivered or accepted.

***Phase 3: Plan Development***

Restructuring plan developed during forbearance period. The plan addresses the underlying cause of default and provides a sustainable path forward. Plan components may include: principal reduction or extension; coupon reduction; additional collateral; equity infusion; operational changes; sponsor-level changes.

***Phase 4: Plan Vote***

Bondholders vote on the plan. Consent thresholds depend on the modifications proposed (majority, supermajority, or unanimous). Holdout strategies become particularly important in workout scenarios because the alternative for non-consenting holders is often worse than the workout plan.

***Phase 5: Implementation***

Approved plan is implemented. Supplemental indenture executed. Modifications take effect. Operations restructured. Reporting protocols updated. Trustee continues administration under modified terms.

### **13.3.4 Exchange Offers**

A common workout mechanism. Existing bondholders are offered new bonds with modified terms in exchange for their existing bonds. Bondholders accept the exchange and receive the new bonds; non-tendering bondholders remain with the existing bonds (which are typically left in a less attractive position by the exchange).

Exchange offers can be structured in various ways:

Par-for-par exchange — new bonds at par equal to existing bonds; modifications are to coupon, maturity, or other terms but not principal

Discounted exchange — new bonds at less than par; effectively a principal haircut

Cash plus paper — partial cash payment plus new bonds; sometimes used to clear accrued interest plus restructure remaining principal

Combination — different exchange options offered to different bondholder categories

The exchange offer must meet defined securities law requirements — registration, disclosure, fairness considerations. Rating agencies typically treat distressed exchanges (exchanges at material discount to existing bonds' face value) as defaults for rating purposes, regardless of whether technical default has occurred.

### **13.3.5 Bankruptcy**

When workout cannot achieve consensual resolution, formal bankruptcy may follow. Two main paths:

***Chapter 11 Reorganization***

Court-supervised restructuring. The obligor (or sometimes bondholders) files for Chapter 11. The automatic stay halts collection actions. The obligor operates as debtor-in-possession. A reorganization plan is developed, voted on by creditor classes (including bondholders), and confirmed by the court. The plan modifies the obligor's debt structure and operations.

Chapter 11 is expensive and lengthy — typically 12-24 months for middle-market cases. Bondholders may receive modified bonds, cash, equity in the reorganized obligor, or some combination. The court process protects bondholders' procedural rights but often produces outcomes that are economically inferior to consensual workout outside of bankruptcy.

***Chapter 7 Liquidation***

Last resort. The obligor's assets are sold and proceeds distributed to creditors in priority order. Bondholders receive proceeds to the extent of their priority position and the available proceeds. Equity and subordinate creditors typically receive nothing. Senior secured bondholders may receive substantial recovery; senior unsecured bondholders typically receive partial recovery; subordinate or junior bondholders typically receive minimal or no recovery.

### **13.3.6 Workout Fee Architecture**

Workout fees are heavy but earned. The work is operationally intensive, legally complex, and high-stakes for the client relationship.

**Workout structuring fee —** 1.5%-3.0% of par being workout-restructured ($750K-$1.5M on $50M)

**Success fee on workout completion —** 1.0%-2.0% of restructured par (additional $500K-$1M)

**Workout counsel (specialized restructuring legal counsel) —** $500K-$2M typical

**Financial restructuring advisor (if engaged) —** $750K-$3M for complex workouts

**Trustee fees for workout administration —** $50K-$200K

On a $50M bond moving through workout, the total cost across the working group can run $2.5M-$6M. Nest's share through structuring and success fees can be $1.25M-$2.5M on a successful workout. Less if the workout fails or leads to liquidation.

### **13.3.7 Workout Relationship Considerations**

Workouts are heavy on relationship. The obligor is in crisis. The bondholders are at risk. The market is watching. The execution and the outcome shape how the firm is perceived going forward. Three principles:

Honesty — workouts depend on credibility; understating the problem or overstating the solution destroys trust

Decisiveness — workouts get worse with delay; the platform's job is to identify problems early and force decisions

Preserved relationships — even failed workouts (workouts that lead to bankruptcy or liquidation) can preserve relationships when the firm has acted in good faith and competently throughout

## **13.4 Tender Offers**

A separate workout-adjacent mechanism. The obligor (or a third party, sometimes a parent or affiliated party) makes a tender offer to repurchase bonds from holders at a defined price. Used in various contexts:

Voluntary delevering — the obligor has excess cash and wants to retire debt; tender offer at a modest premium to market price

Distressed buyback — the obligor's bonds are trading at deep discount; obligor buys back at a discount, capturing the spread

Cleanup tender — at maturity or near maturity, tender offer to retire remaining bonds and simplify capital structure

Strategic tender — in connection with M&A, sponsor change, or other strategic event

Tender offers must comply with applicable securities law disclosure and procedural requirements. The mechanics involve setting a tender price, defining the tender period, registering the offer, processing tendered bonds, and settling the tender. Nest's platform administers the tender on the obligor's behalf.

## **13.5 The Modification Lifecycle Summary**

Bringing all of Section 13 together: across a bond's life, multiple modification events typically occur. A typical timeline for a 30-year bond:

Years 0-3: Construction or initial ramp; potential early covenant work or first amendments

Years 3-7: Operating period; routine amendments for sponsor-level changes; potential first covenant relief

Years 7-12: First refunding window opens; major refunding event likely

Years 12-20: Second-cycle administration; potential mid-life restructurings if credit has deteriorated

Years 20-28: Second refunding window or amortization to retirement

Years 28-30: Final payments and bond retirement

Each modification event is a fee event. The platform's continuous administration captures these events because the platform identifies them, prepares the analysis, and presents the recommendation to the obligor. The compounding fee revenue across the modification lifecycle is what makes the administration relationship economically dominant.

## **13.6 Quick Reference — Silo 13**

### **Refunding Categories**

Current refunding — within 90 days of call/maturity; standard mechanism

Advance refunding — more than 90 days before call; restricted for tax-exempt since 2017

Forward refunding — lock in future refunding rates today

Crossover refunding — escrow flips at call date; specialized use

### **Refunding Decision Framework**

**NPV savings threshold —** 3-5% of par being refunded as baseline; lower thresholds for strategic refundings

**Inputs —** Remaining DS; current refunding rate; call premium; COI; escrow yield restriction (tax-exempt)

**Calculation —** PV(Existing DS) − PV(Refunding DS) − Call Premium − COI − Escrow Cost

**Decision —** Proceed when savings exceed threshold; document analysis even when not proceeding

### **Restructuring Options Spectrum**

Light: covenant relief, reporting modifications, reserve adjustments, permitted action expansions

Medium: coupon adjustments, amortization changes, maturity extension, additional collateral, equity contribution

Heavy: principal reduction, exchange offers, tranche resubordination, debt-to-equity conversion

### **Workout Phases**

Phase 1: Acceleration decision

Phase 2: Forbearance

Phase 3: Plan development

Phase 4: Plan vote

Phase 5: Implementation

Phase 6: Monitoring

### **Fee Reference**

**Refunding structuring fee —** $125K-$400K

**Restructuring structuring fee —** 1.0%-2.5% of restructured par

**Workout structuring fee —** 1.5%-3.0% of workout par

**Success fees on completion —** Additional 50-200 bps

### **Lifecycle Modification Events**

First amendments and minor restructurings: years 0-7

First refunding: years 7-12

Mid-life modifications: years 12-20

Second refunding or amortization: years 20-28

Final retirement: years 28-30

# **SILO 14 — RISK RATING, LGD, AND LOSS MANAGEMENT**

Every bond carries credit risk. Even AAA bonds default occasionally; even AA bonds have material default histories over long horizons. Quantifying credit risk — probability of default (PD), loss given default (LGD), expected loss (EL), and the dispersion around expected loss — is the analytical foundation of bond structuring and pricing. This silo walks the quantitative framework, the rating agency methodologies that operationalize it, and the loss management techniques bankers use to optimize each component.

The platform's structuring agents will run this framework systematically. Every structuring decision can be evaluated through its effect on PD, on LGD, or on both. A reserve increase reduces LGD by adding cushion. A covenant tightening reduces PD by catching deterioration earlier. A senior/subordinate tranche shifts loss exposure from one bondholder group to another. Understanding the framework lets the platform optimize the structure's loss profile for any given economic capital constraint.

**THE LOSS MANAGEMENT PRINCIPLE —** Total expected loss is PD × LGD. Cut either one in half and expected loss halves. The structuring craft is identifying which component to reduce most efficiently for the deal at hand — sometimes lowering PD is cheaper (better covenants, better monitoring), sometimes lowering LGD is cheaper (more collateral, tighter tranching, stronger reserves). The platform runs the comparison.

## **14.1 The Credit Loss Framework**

Three concepts define credit loss:

### **Probability of Default (PD)**

**Definition —** Probability that a bond defaults over a defined time horizon (typically 1 year, or cumulative over the bond's remaining life)

**Measurement —** Historical default rates by rating, sector, and structure

**Use —** Pricing input; capital calculation under bank regulatory regimes; structural decision input

PD is most often reported as the 1-year default rate for the relevant rating category, or as the cumulative default rate over a defined horizon. S&P, Moody's, and Fitch all publish default studies showing historical default rates by initial rating and tenor. Approximate ranges:

AAA: 0.00%-0.02% annual default rate; very rare

AA: 0.02%-0.05% annual default rate

A: 0.05%-0.15% annual default rate

BBB: 0.15%-0.35% annual default rate

BB: 0.75%-1.50% annual default rate

B: 4.0%-7.0% annual default rate

CCC and below: 25%-40% annual default rate

These are approximate corporate bond default rates. Municipal bond default rates have historically been substantially lower — even BBB-rated munis have had cumulative 10-year default rates well below 1% in many sectors. The municipal market's historical default experience reflects the strength of underlying revenue streams and the political economy supporting muni issuers.

### **Loss Given Default (LGD)**

**Definition —** Loss as a percentage of par, conditional on default having occurred

**Formula —** LGD = 1 − Recovery Rate

**Use —** Pricing input; structural decision input; key driver of expected loss

Recovery rates vary substantially by security position, sector, structure, and bankruptcy regime. Approximate recovery rates by bond class:

Senior secured corporate: 60%-80% recovery

Senior unsecured corporate: 35%-50% recovery

Subordinated corporate: 15%-30% recovery

Senior secured project finance: 70%-90% recovery

Senior unsecured project finance: 40%-60% recovery

Municipal essential service revenue bonds: 80%-100% recovery (historical)

General obligation municipal: 95%-100% recovery (historical)

Conduit revenue bonds: highly variable, 30%-80% depending on sector and structure

LGD is highly sensitive to structural decisions. Strong collateral, well-designed reserves, and elegant waterfalls support high recovery rates. Weak collateral, undersized reserves, or structurally subordinated positions can produce recovery rates well below 20%.

### **Expected Loss (EL)**

**Definition —** Probability-weighted average loss; PD × LGD

**Use —** Pricing input — bondholders price for expected loss; capital allocation input

Expected loss is the analytical bridge between credit risk and pricing. A bond with 1% PD and 50% LGD has EL of 0.5% — the bondholder expects to lose 0.5% of par annually in expected value terms. The bondholder requires compensation for that EL plus a premium for unexpected loss (the variance around EL) plus a premium for illiquidity, complexity, and other factors.

Implied EL spread vs. risk-free Treasury can be computed: a BBB-rated bond with 0.25% annual PD and 50% LGD has 12.5 bps of EL. At an EL multiple of 4-7x for the unexpected loss premium, the credit spread might be 50-90 bps over Treasury. Real spreads vary by market conditions, sector, and structure, but the EL framework anchors the analysis.

## **14.2 Rating Agency Methodologies**

Each major rating agency has its specific methodology for each sector. Methodologies are published — every rating decision should be traceable to methodology application. For Nest's structuring purposes, the platform's rating agent reads the methodologies, populates the framework with deal data, and predicts the rating outcome.

### **Moody's Approach**

Moody's uses a 'scorecard' approach in most sectors. The scorecard identifies key factors (typically 6-15 factors) that drive the rating, with defined weights and defined ranges for each factor. Each factor is scored based on the deal's characteristics; the scores are weighted and aggregated; the aggregated score maps to a rating range. The committee then exercises judgment within the range based on qualitative factors.

Moody's published scorecards exist for most major sectors — public utilities, healthcare, higher education, multifamily housing, charter schools, hotels, healthcare RE, senior living, water and sewer, GO, and others. The platform reads each scorecard and maintains rating prediction calibrated to it.

### **S&P Approach**

S&P uses a more analytical narrative approach in most sectors, supported by specific quantitative factors. S&P's published methodology papers identify the analytical drivers and the typical rating outcomes for various combinations. Quantitative factors are explicit (DSCR, leverage, occupancy, etc.) and qualitative factors are also explicit (management quality, market position, sponsor strength, etc.).

S&P tends to assign slightly different rating outcomes than Moody's for the same deal, partly because the methodologies emphasize different factors. The platform's structuring agent runs both methodologies in parallel and predicts both ratings.

### **Fitch Approach**

Fitch's methodologies are also published and methodologically structured. Fitch is particularly strong in structured finance and infrastructure. For middle-market deals, Fitch's ratings are typically similar to Moody's and S&P with sector-specific variations.

### **Kroll Approach**

Kroll Bond Rating Agency (KBRA) has built a position in middle-market structured finance and corporate. Its methodologies are published. Kroll's ratings have generally been more responsive and faster than the big three agencies, with sometimes slightly different rating outcomes. For middle-market deals, Kroll is often a competitive alternative or supplement to one of the big three.

### **Methodology Selection in Practice**

Which methodology applies depends on the sector and the agency. The platform maintains a database of methodology papers by agency and sector, indexed for the specific deal type being structured. Before any rating engagement, the structuring agent identifies the relevant methodology and runs the deal through it. The Indicative Rating Memorandum captures the methodology application.

## **14.3 Rating Factors Across Sectors**

Despite sector variations, most rating methodologies emphasize similar factor categories:

### **Operating Performance**

Historical revenue and operating income

Operating margin

Variability over time

Peer comparison

### **Coverage Ratios**

DSCR at issuance and projected forward

MADS coverage

Coverage cushion vs. covenant threshold

Coverage trajectory

### **Leverage and Capital Structure**

Total debt / EBITDA or appropriate denominator

Debt / capitalization

Senior debt position and any structurally subordinated debt

Refinancing risk

### **Liquidity**

Cash and liquid assets

Days cash on hand

Reserve coverage

Working capital adequacy

### **Sector and Market Position**

Sector dynamics — growing, stable, declining

Market position — leader, mid-pack, laggard

Competitive moat

Regulatory environment

### **Asset Quality (where applicable)**

Physical condition

Market value vs. debt

Operational readiness

Specific risk factors

### **Management and Governance**

Management experience and track record

Governance structure

Strategic clarity

Operational discipline

### **Structural Features**

Security — first lien, second lien, unsecured

Covenant package — quality and tightness

Reserves — sizing and trigger mechanisms

Credit enhancement — if any

### **Sponsor / Owner Strength**

Financial capacity of sponsor

Strategic alignment with project

Track record on prior deals

Quality of relationships with stakeholders

## **14.4 Rating Migration**

Bond ratings change over time. A bond issued at A may migrate to AA (upgrade) or to BBB (downgrade) over its life. Understanding migration patterns matters for structuring decisions and for portfolio risk management.

### **Historical Migration Statistics**

Rating migration rates over 1-year horizons (corporate bonds, approximate historical averages):

AAA to AA: 7-10% annual probability

AA to AAA: 1-2%

AA to A: 5-8%

A to BBB: 3-5%

BBB to BB: 5-7%

BBB to A: 2-4%

BB to BBB: 5-8%

BB to B: 8-12%

Migration is highly correlated with sector and economic environment. In recessions, downgrade rates accelerate. In expansions, upgrade rates accelerate. The relevant 'through-the-cycle' migration rates are roughly the averages above, but actual experience varies cyclically.

### **Implications for Structuring**

Rating migration matters for several structuring decisions:

Call structure design — if the obligor's credit is expected to improve, the call provisions should capture the upgrade benefit through refunding optionality; if expected to stay flat or decline, call provisions can be more aggressive without hurting bondholders

Covenant rachet provisions — sometimes covenants are structured to tighten as credit improves (encouraging the obligor to maintain credit quality) or to loosen as credit deteriorates (giving the obligor flexibility before default)

Rating triggers in operational documents — LOC reimbursement agreements, hedging arrangements, and other obligations sometimes have rating triggers; the structuring agent considers whether these are appropriate or whether they create undue downgrade risk

## **14.5 Sector-Specific Loss Patterns**

Each major sector has characteristic loss patterns shaped by its economics, regulatory environment, and structural conventions.

### **Multifamily Housing**

Multifamily housing has the strongest historical default experience among middle-market bond sectors. Loss patterns:

Default rates: substantially lower than corporate equivalents at the same rating

Recovery rates: typically 70-90% in default due to underlying real estate value

Common default triggers: occupancy collapse, market shifts, sponsor distress

Cycle sensitivity: moderate; multifamily holds up better than commercial RE in downturns

### **Healthcare (Hospitals and Senior Living)**

Healthcare bonds have more variable default experience. Hospitals tend to be more resilient than senior living. Loss patterns:

Hospital default rates: low historically but accelerating with payer mix shifts and rural hospital stress

Hospital recovery rates: 50-70% typically; volatile based on facility specifics

Senior living default rates: meaningful — entry fee structures have specific risks, market sensitivity is high

Senior living recovery rates: 40-65% typically, with substantial variation

Common default triggers: payer reimbursement changes, occupancy collapse, regulatory action, sponsor distress

### **Charter Schools**

Charter schools have higher default rates than other muni sectors due to charter non-renewal risk and enrollment volatility.

Default rates: 1-3% cumulative over 10 years (substantially higher than other muni sectors)

Recovery rates: highly variable; sometimes 30-50% (school real estate has limited alternative use)

Common default triggers: charter non-renewal, enrollment decline, academic underperformance

Mitigation: state intercept where available; strong sponsor track record; multiple-school portfolios

### **Higher Education**

Higher education has bifurcated experience. Elite institutions have negligible default rates. Smaller, less-selective institutions have meaningful default risk that has been accelerating.

Top tier default rates: minimal

Mid-tier default rates: low

Lower-tier default rates: meaningful and rising

Recovery rates: typically high for institutions with substantial physical campus

### **Project Finance Infrastructure**

Project finance has structured loss patterns shaped by specific project characteristics.

Operational risk during construction: meaningful but manageable through monitoring

Demand risk during operations: substantial for some project types (toll roads, certain ports)

Counterparty risk: substantial for offtake-dependent projects

Recovery rates: typically high for assets with alternative use; lower for highly specialized assets

### **Utility / Public Power**

Public power and water/sewer utility revenue bonds have very low default experience.

Default rates: minimal historically

Recovery rates: typically 90%+ given the essential service nature

Common stress factors: regulatory rate denials, capital intensive requirements, environmental compliance costs

## **14.6 Loss Management Techniques**

Structural and operational techniques to reduce PD or LGD.

### **Reducing PD**

Tighter covenants with appropriate cushions — catch deterioration earlier; provide bondholder protection without crushing operations

Continuous monitoring and early warning — the platform's covenant monitoring layer reduces effective PD by catching problems early enough to remediate

Operating reserves — provide cushion against operational volatility before debt service is at risk

Working capital provisions — fund the obligor's working capital requirements with appropriate facilities

Sponsor support obligations — completion guarantees, operating deficit guarantees, recourse provisions

Diversification — for portfolio-financed deals, geographic and sector diversification reduces concentration default risk

Credit enhancement — LOC, bond insurance, parent guarantee effectively transfer PD from underlying obligor to enhancement provider

### **Reducing LGD**

Senior secured position — first lien on collateral maximizes recovery

Tranche structures — senior tranches have first claim, reducing senior LGD

Strong reserves — DSRF, R&R reserve, operating reserve all reduce LGD by providing cash cushions

Collateral quality — high-quality collateral with active markets supports recovery

Cash management — strong cash management with controlled accounts reduces leakage in default

Geographic diversification (for portfolio deals) — reduces correlated losses

Waterfall design — senior position in waterfall reduces senior LGD

Cure provisions — flexibility to cure defaults reduces ultimate LGD by avoiding forced bankruptcy

### **Optimizing the Trade-Off**

Sometimes structural choices trade off PD and LGD. Tighter covenants reduce PD but, if they're too tight, increase the risk of technical default that produces lower LGD outcomes through inappropriate workout. Strong reserves reduce both PD and LGD but increase the deal's COI cost. The platform's structuring agent runs the optimization explicitly.

**THE LOSS OPTIMIZATION:** On a $50M deal, reducing PD by 50 bps (from 100 bps to 50 bps annually) and reducing LGD by 10 percentage points (from 50% to 40%) saves expected loss substantially. Going further requires real cost — heavier reserves, tighter covenants, more credit enhancement. The platform identifies the marginal cost of the next improvement and stops when marginal cost equals marginal benefit.

## **14.7 Portfolio Loss Management**

Beyond individual bond loss management, the firm's portfolio has loss management implications.

### **Concentration Limits**

Single-name limits (no more than X% of administered portfolio to any single obligor), sector limits (no more than Y% to any single sector), geographic limits, sponsor limits. These limits don't apply to bond issuance directly (Nest is not holding the bonds) but they apply to the firm's relationship concentration. Too much concentration on a single client or sector creates business risk if that client or sector deteriorates.

### **Diversification Across Sectors**

Building a portfolio of administered bonds across multiple sectors — multifamily, healthcare, charter schools, higher ed, project finance, utility, etc. — reduces the firm's exposure to any single sector's downturn. A firm 100% concentrated in senior living is highly exposed to senior living-specific issues. A firm with 15-20% in each of 5-6 sectors is more stable.

### **Correlation Patterns**

Some sectors and geographies are correlated. A regional economic downturn affects all bond types in that region. A regulatory change in healthcare reimbursement affects hospital and senior living bonds together. The platform tracks correlations and informs portfolio diversification decisions.

## **14.8 The Platform's Loss Analytics Layer**

The platform supports loss management at three levels:

### **Pre-Issuance**

During structuring, the platform predicts PD and LGD for the proposed structure. Compares to alternative structures. Identifies the structure with the lowest expected loss subject to the obligor's economic constraints.

### **During Operations**

Continuous monitoring updates PD and LGD estimates based on actual operating performance. Identifies bonds whose loss profile is deteriorating. Triggers early intervention before default.

### **Portfolio-Wide**

Aggregates loss profiles across the administered portfolio. Identifies concentrations. Stress-tests the portfolio under various scenarios (recession, sector-specific stress, rate environment shifts). Reports the portfolio's expected loss trajectory.

## **14.9 Quick Reference — Silo 14**

### **Core Credit Loss Concepts**

**Probability of Default (PD) —** Likelihood of default over defined horizon

**Loss Given Default (LGD) —** Loss as % of par conditional on default; LGD = 1 − Recovery Rate

**Expected Loss (EL) —** PD × LGD; pricing anchor

**Unexpected Loss —** Variance around EL; drives capital requirements

### **Approximate PD by Rating (Annual, Corporate)**

AAA: ~0.01%

AA: ~0.05%

A: ~0.10%

BBB: ~0.30%

BB: ~1.00%

B: ~5.50%

CCC and below: ~30%+

### **Approximate Recovery Rates**

Senior secured corporate: 60-80%

Senior unsecured corporate: 35-50%

Subordinated corporate: 15-30%

Senior secured project: 70-90%

Senior secured municipal essential service: 80-100%

Subordinate municipal: 30-60%

### **Rating Factor Categories**

Operating performance

Coverage ratios

Leverage and capital structure

Liquidity

Sector and market position

Asset quality

Management and governance

Structural features

Sponsor / owner strength

### **PD Reduction Techniques**

Tighter covenants with appropriate cushions

Continuous monitoring

Operating reserves

Sponsor support obligations

Credit enhancement

### **LGD Reduction Techniques**

Senior secured position

Strong reserves

High-quality collateral

Tight cash management

Waterfall design

Geographic diversification (portfolio)

# **SILO 15 — THE MODELING ENGINE**

Every bond decision is ultimately a calculation. This silo is the calculation reference — every formula used in bond structuring, sizing, pricing, monitoring, and modification, with variables defined and use cases identified. The engineer building the platform needs this silo to wire the right calculations to the right workflow stages and the right agent decisions.

The formulas are organized by use case: pro forma and underwriting; sizing; pricing and yield; duration and risk; covenants; reserves and waterfall; refunding and modification; credit risk.

**THE MODELING PRINCIPLE —** Every formula has a name, a definition, defined variables, and a defined use case. No formula floats free. When the platform makes a decision involving a calculation, the calculation is named, its variables are sourced from defined inputs, and the result feeds defined downstream decisions. The discipline of named formulas is what makes the modeling engine auditable and improvable.

## **15.1 Pro Forma and Underwriting Formulas**

### **Net Operating Income (NOI)**

**Formula —** NOI = Effective Gross Income − Operating Expenses

**Variables —** Effective Gross Income = Gross Potential Revenue − Vacancy and Credit Loss − Concessions + Other Income

**Variables (cont.) —** Operating Expenses = Property Taxes + Insurance + Utilities + Maintenance + Management Fees + Administrative + Other

**Use —** Core cash flow metric for revenue bonds; input to DSCR calculation and sizing

### **Effective Gross Income (EGI)**

**Formula —** EGI = (Gross Potential Rent × (1 − Vacancy %)) − Concessions + Other Income

**Variables —** Gross Potential Rent = Rent × Number of Units (or equivalent); Vacancy % = expected vacancy rate; Concessions = rent reductions, free months, etc.; Other Income = laundry, parking, service fees, etc.

**Use —** Revenue calculation for multifamily, hotel, and certain other asset classes

### **EBITDA**

**Formula —** EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization

**Use —** Operating cash flow proxy for corporate bonds; input to leverage and coverage ratios

### **EBITDAR**

**Formula —** EBITDAR = EBITDA + Rent

**Use —** For asset-light operating companies with significant lease obligations; better reflects fixed obligations

### **Capitalization Rate (Cap Rate)**

**Formula —** Cap Rate = NOI / Asset Value

**Use —** Standard real estate valuation metric; informs LTV and debt yield calculations

### **Cash-on-Cash Return**

**Formula —** Cash-on-Cash = Annual Cash Flow / Equity Invested

**Use —** Sponsor's return metric; informs equity participation in capital stack

### **Internal Rate of Return (IRR)**

**Formula —** Solve for r: 0 = Σ [CF\_t / (1+r)^t]

**Variables —** CF\_t = cash flow at time t (negative for invest, positive for receive)

**Use —** Sponsor's return metric across investment lifecycle

## **15.2 Sizing Formulas**

### **Loan-to-Value (LTV)**

**Formula —** LTV = Loan Amount / Asset Value

**Sizing use —** Solve for Loan Amount = Asset Value × LTV ceiling

**Typical thresholds —** 60-75% for stabilized multifamily; 65-75% for hotels; 55-70% for healthcare

### **Loan-to-Cost (LTC)**

**Formula —** LTC = Loan Amount / Total Project Cost

**Sizing use —** Solve for Loan Amount = Total Project Cost × LTC ceiling

**Typical thresholds —** 70-85% for construction multifamily; varies by sector

### **Debt Service Coverage Ratio Sizing**

**Formula —** Loan Amount = NOI / (DSCR × Debt Service per $ of Loan)

**Sizing use —** Solve for max loan that supports target DSCR at target rate and amortization

**Typical DSCR target —** 1.15x-1.40x at issuance depending on rating target

### **Debt Yield Sizing**

**Formula —** Debt Yield = NOI / Loan Amount

**Sizing use —** Solve for Loan Amount = NOI / Target Debt Yield

**Typical thresholds —** 8%-12% depending on asset class

### **Combined Sizing (Multiple Tests)**

In practice, the loan amount is the minimum of the various sizing tests. The structuring agent runs all applicable tests and selects the binding constraint. Sometimes that's LTV, sometimes DSCR, sometimes debt yield, sometimes leverage. The binding constraint is the one to focus on for any structural negotiation — moving the others doesn't help unless the binding constraint is moved.

## **15.3 Pricing and Yield Formulas**

### **Bond Price (Present Value of Cash Flows)**

**Formula —** Price = Σ [CF\_t / (1 + y/n)^(nt)]

**Variables —** CF\_t = cash flow at time t (coupon, principal); y = yield to maturity; n = periods per year

**Use —** Convert yield to price or vice versa

### **Yield to Maturity (YTM)**

**Formula —** Solve for y: Price = Σ [CF\_t / (1 + y/n)^(nt)]

**Use —** Standard yield measure; bondholder's IRR if held to maturity

### **Yield to Call (YTC)**

**Formula —** Solve for y: Price = Σ [CF\_t / (1+y/n)^(nt)] through call date + Call Price / (1+y/n)^(n×T\_call)

**Use —** Yield assuming call at earliest call date

### **Yield to Worst (YTW)**

**Formula —** YTW = min(YTM, YTC at each call date)

**Use —** Conservative yield measure for callable bonds

### **Treasury Spread (G-Spread)**

**Formula —** G-Spread = Bond Yield − Treasury Yield (matched maturity)

**Use —** Standard spread measure for taxable bonds

### **Z-Spread**

**Formula —** Solve for s: Price = Σ [CF\_t / (1 + (Treasury\_t + s)/n)^(nt)]

**Variables —** Treasury\_t = Treasury spot rate at time t; s = Z-spread (constant across maturities)

**Use —** More precise spread measure; accounts for full Treasury curve

### **Option-Adjusted Spread (OAS)**

**Formula —** OAS = Z-Spread − Option Value (computed via lattice or Monte Carlo)

**Use —** Pure credit spread on bonds with embedded options

### **MMD Spread (Muni)**

**Formula —** MMD Spread = Muni Yield − AAA MMD Yield (matched maturity)

**Use —** Standard spread measure for tax-exempt municipal bonds

## **15.4 Duration and Risk Formulas**

### **Macaulay Duration**

**Formula —** MacDur = Σ [t × CF\_t / (1+y/n)^(nt)] / Price

**Use —** Weighted average time to cash flows; conceptual measure

### **Modified Duration**

**Formula —** ModDur = MacDur / (1 + y/n)

**Use —** Approximate % price change per 100 bps yield change

### **Effective Duration**

**Formula —** EffDur = (P\_down − P\_up) / (2 × P\_0 × Δr)

**Variables —** P\_down = price at yield − Δr; P\_up = price at yield + Δr; P\_0 = current price; Δr = small yield change (typically 25 bps)

**Use —** Duration for callable, putable, and option-embedded bonds

### **Key Rate Duration**

**Formula —** KRD\_τ = (P\_down,τ − P\_up,τ) / (2 × P\_0 × Δr\_τ)

**Variables —** P\_up,τ and P\_down,τ = prices with curve shift only at maturity τ

**Use —** Sensitivity to specific points on the yield curve

### **DV01**

**Formula —** DV01 = ModDur × Price × 0.0001

**Use —** Dollar price change per 1 bp yield change; working measure of dollar interest rate risk

### **Convexity**

**Formula —** Convexity = Σ [t × (t+1) × CF\_t / (1+y/n)^(nt)] / (Price × (1+y/n)^2 × n^2)

**Use —** Second-derivative price sensitivity; correction to duration for large yield moves

### **Price Change Approximation**

**Formula —** ΔPrice/Price ≈ −ModDur × Δy + ½ × Convexity × Δy^2

**Use —** Predict price change for a defined yield change including convexity correction

## **15.5 Covenant Formulas**

### **Debt Service Coverage Ratio (DSCR)**

**Formula —** DSCR = NOI (or Cash Flow Available for Debt Service) / Debt Service

**Variants —** Trailing 12-month, forward 12-month, MADS-based, period-specific

**Use —** Most common financial covenant

### **Fixed Charge Coverage Ratio (FCCR)**

**Formula —** FCCR = (EBITDAR) / (Interest + Rent + Required Principal Payments)

**Use —** Corporate covenant including lease obligations

### **Leverage Ratio**

**Formula —** Leverage = Total Debt / EBITDA

**Use —** Standard corporate covenant

### **Net Debt to EBITDA**

**Formula —** Net Debt / EBITDA = (Total Debt − Cash and Equivalents) / EBITDA

**Use —** Sometimes used alongside gross leverage

### **Debt to Capitalization**

**Formula —** D/Cap = Total Debt / (Total Debt + Equity)

**Use —** Balance sheet covenant

### **Debt Yield**

**Formula —** Debt Yield = NOI / Total Debt

**Use —** Real estate covenant

### **Days Cash on Hand**

**Formula —** Days Cash = (Unrestricted Cash + Liquid Investments) / (Annual Operating Expenses / 365)

**Use —** Healthcare and senior living covenant

### **Additional Bonds Test**

**Formula (historical variant) —** (Historical NOI × Stress Factor) / (Existing DS + Proposed New DS) ≥ Threshold

**Formula (forward variant) —** (Projected NOI × Conservatism Factor) / (Existing DS + Proposed New DS) ≥ Threshold

**Use —** Anti-dilution covenant; tests coverage with new debt

## **15.6 Reserve and Waterfall Formulas**

### **DSRF Sizing (Tax-Exempt Safe Harbor)**

**Formula —** DSRF = min(MADS, 10% × Original Par, 125% × Average Annual DS)

**Use —** IRC §148(d) safe harbor for tax-exempt

### **Cap-I Sizing**

**Formula —** Cap-I = (Estimated Construction Period × Average Outstanding Bond Balance × Interest Rate) × Cushion Factor

**Typical cushion —** 1.15x to 1.30x to absorb delays

### **R&R Reserve Deposit (Multifamily)**

**Formula —** Annual R&R Deposit = Number of Units × Per-Unit Reserve ($200-$500)

**Cap —** Typically capped at 3-5 years of annual deposits

### **Operating Reserve Sizing**

**Formula —** Operating Reserve = Months × Monthly Operating Expenses

**Typical months —** 3-6 months stabilized; 6-12 months new construction; 6-12 months healthcare

### **Waterfall Cash Flow Allocation**

The waterfall is not a single formula but a sequence of allocations. At each step:

**Allocation\_step\_i —** min(Available Cash, Required at Step i)

**Available Cash for next step —** Available Cash − Allocation at Step i

Cash flows down the sequence until either exhausted or all steps satisfied. Excess flows to the bottom (typically Surplus Fund).

## **15.7 Refunding and Modification Formulas**

### **Refunding NPV Savings**

**Formula —** NPV Savings = PV(Existing DS Remaining) − PV(Refunding DS) − Call Premium − Refunding COI − Escrow Cost

**Variables —** PV calculations at the refunding rate; Existing DS = remaining payments on existing bonds; Refunding DS = payments on new bonds; Call Premium = (Call Price − Par) × Bonds Called; Escrow Cost = negative arbitrage if tax-exempt advance refunding

**Decision threshold —** NPV Savings > 3-5% of par being refunded

### **Make-Whole Call Price**

**Formula —** MW Price = max(Par, Σ [Remaining CF\_t / (1 + Treasury + MW Spread)^t])

**Variables —** Treasury = Treasury yield at bond's remaining maturity; MW Spread = make-whole spread (typically 25-50 bps)

### **Refunding Breakeven Rate**

**Formula —** Solve for r: PV\_r(Existing DS) = PV\_r(Refunding DS) + Call Premium + COI

**Use —** The current rate at which refunding produces zero NPV savings

### **Escrow Sizing (Defeasance)**

**Formula —** Required Escrow = Σ [DS Payment\_t × Discount Factor\_t]

**Variables —** DS Payment\_t = scheduled debt service on bonds being defeased; Discount Factor\_t = inverse of escrow security yield (typically Treasury or SLGS yield)

## **15.8 Credit Risk Formulas**

### **Expected Loss (EL)**

**Formula —** EL = PD × LGD

**Variables —** PD = probability of default over horizon; LGD = loss given default

**Use —** Pricing anchor; capital allocation input

### **Cumulative Default Probability**

**Formula —** Cumulative PD over T years = 1 − (1 − Annual PD)^T

**Use —** Convert annual PD to multi-year horizon

### **Expected Recovery**

**Formula —** Recovery Rate = 1 − LGD

**Variables —** LGD = loss given default

### **Credit-Adjusted Yield**

**Formula —** Credit-Adjusted Yield = Risk-Free Yield + EL Spread + Risk Premium + Liquidity Premium

**Use —** Decomposition of total yield into components

### **Default Distance (KMV / Merton Model)**

**Formula —** Distance to Default = (Asset Value − Default Point) / (Asset Volatility × √T)

**Use —** Quantitative credit risk model; relates equity volatility to default probability

## **15.9 Sector-Specific Formulas**

### **Multifamily — Effective Gross Income**

**Formula —** EGI = (Number of Units × Average Rent × 12 × (1 − Vacancy %)) − Concessions + Other Income

**Use —** Core revenue calculation for multifamily

### **Healthcare — Operating Margin**

**Formula —** Operating Margin = (Operating Revenue − Operating Expenses) / Operating Revenue

**Use —** Healthcare profitability measure

### **Hotel — RevPAR**

**Formula —** RevPAR = Average Daily Rate × Occupancy Rate

**Use —** Hotel revenue performance measure

### **Senior Living — Penetration Rate**

**Formula —** Penetration Rate = (Existing Units / Eligible Population)

**Use —** Senior living market analysis

### **Charter School — Per-Pupil Funding**

**Formula —** Total Funding = Per-Pupil Allocation × Enrollment + Federal and State Grants + Local Sources

**Use —** Charter school revenue

### **Project Finance — Levelized Cost of Energy**

**Formula —** LCOE = PV of (Capital + O&M + Fuel) / PV of Energy Production

**Use —** Energy project economics

## **15.10 Tax-Exempt Bond Specific Formulas**

### **Bond Yield (for Arbitrage)**

**Formula —** Bond Yield = IRR that makes PV(Bond Cash Flows) = Issue Price

**Use —** Reference yield for arbitrage compliance

### **Arbitrage Rebate Calculation**

**Formula —** Rebate = Actual Investment Earnings − (Bond Yield × Average Invested Balance)

**Use —** Determine IRS rebate obligation

### **Yield Restriction Calculation**

**Formula —** Permitted Investment Yield = Bond Yield + Safe Harbor (varies by category)

**Use —** Determine maximum yield on bond proceeds investments

## **15.11 The Modeling Engine Architecture**

The platform's modeling engine is organized as a library of named functions, each implementing one of the formulas above. Functions are pure (deterministic; same inputs produce same outputs), composable (functions call other functions), and auditable (every calculation produces an audit trail showing inputs, the function called, and outputs).

### **Function Naming Convention**

Each function in the platform has a name that maps to its formula. Examples:

calc\_dscr(noi, debt\_service) → DSCR

calc\_npv\_refunding\_savings(existing\_ds, new\_ds, call\_premium, coi, escrow\_cost, refunding\_rate) → NPV

calc\_make\_whole\_call\_price(remaining\_cf, treasury\_yield, mw\_spread) → call price

calc\_effective\_duration(price\_down, price\_up, price\_current, delta\_r) → duration

### **Audit Trail**

Every calculation logs: function name, inputs, intermediate values, output, timestamp, calling workflow context. This creates the complete audit trail that allows the platform to explain every number it produces. When the platform recommends a loan amount, the recommendation traces back through DSCR calculation, NOI calculation, all source data, and the rules applied.

### **Rule Library Integration**

Formulas in the modeling engine are called by the rule library (Silo 16). A rule like 'Set DSRF to safe harbor amount' calls the calc\_dsrf\_safe\_harbor function with deal-specific inputs. The rule and the formula are separate — the rule decides what to do; the formula computes how much.

## **15.12 Quick Reference — Silo 15**

### **Formula Index by Use Case**

***Pro Forma / Underwriting***

NOI = EGI − Operating Expenses

EGI = (Gross Potential Rent × (1−Vacancy %)) − Concessions + Other Income

EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization

Cap Rate = NOI / Asset Value

***Sizing***

LTV = Loan / Value (sizing: Loan = Value × LTV ceiling)

DSCR = NOI / Debt Service (sizing: solve for max loan at target DSCR)

Debt Yield = NOI / Debt (sizing: Loan = NOI / Target DY)

***Pricing / Yield***

Price = Σ CF\_t / (1+y/n)^(nt)

YTM, YTC, YTW: solve for y given price

G-Spread = Bond Yield − Treasury Yield

Z-Spread = spread over spot curve

OAS = Z-Spread − Option Value

***Duration / Risk***

ModDur = MacDur / (1+y/n)

EffDur = (P\_down−P\_up)/(2 × P\_0 × Δr)

DV01 = ModDur × Price × 0.0001

Convexity correction: ΔP/P ≈ −ModDur × Δy + ½ Conv × Δy^2

***Refunding***

NPV Savings = PV(Old DS) − PV(New DS) − Call Premium − COI − Escrow Cost

Make-Whole Price = max(Par, PV at Treasury + MW Spread)

Breakeven Rate: solve for r where NPV = 0

***Credit Risk***

EL = PD × LGD

LGD = 1 − Recovery Rate

Cumulative PD = 1 − (1 − Annual PD)^T

***Reserves***

DSRF Safe Harbor = min(MADS, 10% × Par, 125% × Avg Annual DS)

Cap-I = (Construction Period × Avg Outstanding × Rate) × Cushion

R&R = Units × Per-Unit Reserve × Years

# **SILO 16 — RULE LIBRARY ARCHITECTURE**

The rule library is the platform's brain. Everything the platform knows about bond structuring, every pattern it has learned from EMMA and EDGAR, every interpretive judgment from Sean that converts publicly available data into operator-useful insight — all of it lives in the rule library. The platform's analytical agents call rules in the library; the library's rules call formulas in the modeling engine; the modeling engine produces outputs that feed agent decisions. This silo is the architecture of the library.

The rule library is also the firm's most defensible competitive position. Anyone can read methodology papers from rating agencies. Anyone can pull bond data from EMMA. What no one else has is the combination of (a) continuous large-scale ingestion of public data, (b) systematic pattern extraction from that data, and (c) Sean's eighteen-year operator judgment encoded as interpretive rules layered on top. The combination is the moat. This silo specifies how that combination gets built and maintained.

**THE RULE LIBRARY PRINCIPLE —** Knowledge is leverage. Every deal Nest does adds to the library. Every methodology paper adds to the library. Every founder interpretation adds to the library. Over time, the library becomes the firm's most valuable asset — a continuously growing repository of structured knowledge that compounds with every new input. A competing firm starting from scratch in year 5 cannot replicate what Nest has accumulated.

## **16.1 The Three Layers of the Rule Library**

The rule library is organized in three layers, each serving a distinct function:

### **Layer 1: Public Data Extraction**

The bottom layer. This layer continuously ingests publicly available data and converts it into structured, queryable form. Source data includes:

EMMA (Electronic Municipal Market Access) — every municipal bond offering document, every continuing disclosure filing, every material event notice

EDGAR (SEC's electronic filing system) — every corporate bond offering document, every periodic report, every material event filing

DAC Bond / DPC Data / Bloomberg / Refinitiv — bond pricing and secondary market data

Rating agency publications — methodology papers, rating reports, default studies, special reports

MSRB rule filings — regulatory updates affecting muni market

IRS publications — tax-exempt bond guidance, revenue procedures, private letter rulings

Federal regulatory publications — bank capital rules, insurance regulatory guidance affecting bond buyers

Sector-specific public sources — HUD multifamily data, CMS healthcare data, state HFA data, state department of education charter data

The layer's job is mechanical: pull the data, parse it into structured form, classify the documents, extract the structured fields, index everything for retrieval. No interpretation — just structured data.

### **Layer 2: Behavioral Pattern Extraction**

The middle layer. This layer reads the structured data from Layer 1 and identifies patterns. Patterns include:

Default patterns — which sectors, which structures, which obligors default; what default looked like in the months and quarters before

Rating migration patterns — which factors precede upgrades, which precede downgrades

Covenant compliance patterns — which covenants get tripped, in what conditions, with what recovery patterns

Pricing patterns — which structural features correlate with tighter pricing, which with wider

Counterparty patterns — which bond counsel firms get assigned which deal types, which trustees bid which fees, which rating agencies rate which sectors

Sector trend patterns — which sectors are growing, which are stressed, which are showing structural shifts

Refunding patterns — when refundings occur, at what NPV savings thresholds, with what frequency

The layer's output is structured pattern descriptions — 'in healthcare hospital bonds, the average days cash on hand at default is X; the time from first covenant trip to default averages Y; the recovery rate in workout averages Z.' These patterns are quantitative descriptions of how the bond market actually behaves, derived from public data.

### **Layer 3: the founders' Interpretive Judgment**

The top layer. This is where eighteen years of operator experience gets layered onto the patterns from Layer 2. Sean's judgment converts statistical patterns into actionable structural decisions. Interpretive rules look like:

'Pattern X in the public data typically means Y in the deal at hand; therefore structure Z'

'When rating committee composition includes analysts A, B, and C, the typical response to factor F is X; therefore present F by emphasizing G'

'In market environment E, buyer pool P typically pays additional bps for structure S; therefore include S even at modest fee cost'

'Sponsor type T has historical default pattern P; therefore include protective covenant C and reserve R even when not technically required by the rating'

'Sector S is showing structural change C; therefore re-underwrite assumption A with adjustment X'

Layer 3 is where the difference between a smart computer and a smart banker becomes apparent. Layer 1 and Layer 2 can be built by competent engineers and data scientists. Layer 3 requires the operator judgment that Sean brings. The interpretation rules are encoded explicitly — they're not invisible to the platform, they're documented and applied systematically. This is what makes the platform reproducible and improvable.

**THE LAYER 3 MOAT:** Layer 1 data is publicly available. Layer 2 patterns can be extracted by anyone with the data and the analytical capability. Layer 3 interpretations require eighteen years of operator experience. The firm that combines the three is the firm that has the moat. Sean's eighteen years are not duplicable. They get encoded into the library so they're not lost when Sean is in a meeting or on vacation, but the source — Sean's actual experience — is what produces the layer 3 rules that the platform encodes.

## **16.2 Rule Categories — What Layer 3 Rules Look Like**

Layer 3 rules fall into several categories, each addressing a specific decision point in the workflow.

### **Sponsor Diligence Rules**

Rules that interpret patterns in sponsor diligence findings. Examples:

'Sponsor with 3+ prior projects in administered portfolio with clean covenant history → enhanced trust profile; lighter ongoing reporting acceptable'

'Sponsor with 1-2 prior projects with workout history → enhanced ongoing reporting required, larger DSRF cushion'

'First-time sponsor in middle-market bond space → require personal guarantee on construction completion, larger operating reserve'

'Sponsor where principal has been named in litigation involving prior project investors → automatic decline regardless of other factors'

### **Project Underwriting Rules**

Rules that govern how the platform re-underwrites the sponsor's pro forma. Examples:

'Multifamily project in market with vacancy rising 2+ years → use trailing 12-month actual vacancy, not market projection'

'Healthcare project with concentration of Medicaid revenue above 60% → stress-test revenue assumption by 5%+ for reimbursement risk'

'Senior living entry-fee project → require absorption schedule supporting cap-I sizing assumption'

'Project in market with measurable seasonal revenue pattern → require operating reserve sized to seasonal trough'

### **Structuring Rules**

Rules that guide structural design. Examples (the rules from earlier silos formalized):

'Investment-grade target rating, taxable corporate, 10-30 year maturity → default to make-whole call at Treasury + 30 bps with par call window 90 days before maturity'

'Tax-exempt long-dated muni → default to non-call-10 with par call thereafter'

'BB or B-rated corporate, 5-7 year maturity → default to non-call-3 with subsequent step-down premium call to par over 4 years'

'Multifamily new construction → default to senior 80% / subordinate 20% structure with construction-period sweep mechanic'

'Healthcare with strong native credit → consider single rating; if subscale buyer pool, consider dual rating with cost / benefit analysis'

### **Rating Strategy Rules**

Rules that govern rating agency selection and presentation. Examples:

'For sector S, agency A's analyst committee has historically focused on factor F; emphasize F in the rating presentation; weak F → consider competing agency'

'When the rating committee includes analyst X (known for conservatism on factor Y), pre-structure to anticipate Y-related questions'

'For deal type D, agency A typically rates one notch above agency B; if single rating, consider A; if dual rating, both'

'New methodology paper from agency C published — re-run all administered deals in affected sector to identify rating action risk'

### **Pricing Rules**

Rules that guide pricing strategy. Examples:

'For taxable corporate at A rating, current Treasury + 90-130 bps range; press for tight end on book oversubscription'

'For 30-year tax-exempt at A-/A rating, lifeco pool absorbs 5%+ coupon at premium pricing; structure accordingly'

'For VRDO deals with strong LOC bank, target SIFMA + 50-100 bps; widen for weaker LOC or smaller deals'

'In falling rate environment, push for longer call protection at modest coupon cost; lock in pricing optimization'

'In rising rate environment, accept tighter call protection for tighter coupon; reduce premium for refinancing optionality'

### **Covenant Design Rules**

Rules that calibrate covenant thresholds. Examples:

'Stabilized multifamily DSCR covenant: target 1.20x with NOI cushion 15-25% above expected'

'New construction multifamily DSCR covenant: deferred until 12 months post-stabilization; thereafter 1.15x'

'Healthcare hospital DSCR covenant: 1.20x with quarterly testing; days cash on hand at 200+ days'

'Charter school DSCR covenant: 1.10x; thereafter requires charter renewal as separate covenant'

### **Reserve Sizing Rules**

Rules that govern reserve sizing decisions. Examples:

'DSRF default: MADS unless rating agency requires more for specific sector; healthcare 1.25× MADS standard'

'Cap-I sizing: estimated construction interest × 1.20 cushion; reduce cushion to 1.15 for highly predictable construction (e.g., LIHTC standard product)'

'R&R Reserve sizing: per-unit reserve at sector-standard rate; reduce for newer asset (under 5 years old) by 25%'

'Operating Reserve: 6 months for new construction; 3 months for stabilized; healthcare requires 12 months days cash separately'

### **Credit Enhancement Rules**

Rules that govern enhancement selection. Examples:

'Where rating uplift from enhancement > 30 bps tightening and enhancement cost is < tightening NPV, deploy enhancement'

'For BBB native credit with AA-insured pricing improvement of 80+ bps, bond insurance creates substantial NPV value; consider'

'For VRDO deals, LOC is structural requirement, not optional enhancement'

'For affordable multifamily, evaluate HUD-insured option vs. tax-exempt conduit structure; HUD often dominates at AAA effective rating'

### **Documentation Rules**

Rules that govern document drafting choices. Examples:

'For sector S, use template T1 unless special structure variants apply'

'For deal size above $50M, include separate disclosure counsel; below $50M, dual counsel typical'

'Continuing disclosure undertaking: include sector-specific operating data per Rule 15c2-12 sector best practice'

'Trustee transition provisions: include lighter transition triggers than market standard to preserve flexibility'

### **Administration Rules**

Rules that govern ongoing administration. Examples:

'Covenant ratio trending toward threshold over 3 consecutive quarters → trigger orange alert and obligor engagement'

'DSRF balance dropping below required level → automatic notice; trigger replenishment plan within 30 days'

'Material event detected from public source → file event notice within 5 business days; coordinate with obligor on operational response'

'Refunding economics crossing 4% NPV savings threshold → flag for obligor presentation'

## **16.3 How Rules Get Created and Updated**

The rule library is not static. Rules get created when patterns are identified or interpretations are formalized; rules get updated when patterns shift or interpretations evolve.

### **Rule Creation Sources**

Methodology papers — when rating agencies publish updated methodologies, new rules are added to capture the changes

Default studies — when default studies update default rates or recovery rates, the relevant rules are recalibrated

Deal completions — every deal completed adds data to the library; some deals produce specific new rules from the lessons learned

Rating committee feedback — when a rating committee provides feedback on a deal, the feedback gets encoded as a rule for future deals

Workout / restructuring experience — when a workout produces specific lessons, those lessons become rules

founder interpretation sessions — periodic structured sessions where Sean reviews recent deals, identifies patterns, and articulates new interpretive rules

Market shifts — when market conditions shift materially, relevant rules are reviewed and updated

Regulatory changes — when SEC, MSRB, IRS, or other regulators issue new rules, the library captures them

### **Rule Update Mechanism**

Rules in the library carry metadata: when they were created, who created them, what evidence supported them, when they were last reviewed, what their performance has been (if testable). The platform periodically reviews rules — especially Layer 3 rules — against actual deal experience. Rules that systematically produce poor outcomes get re-examined. Rules that systematically produce strong outcomes get reinforced and applied more aggressively.

### **Rule Versioning**

Rules are versioned. When a rule changes, the prior version is retained with the deals it applied to. New deals use the new version. This creates an auditable history — every deal's structural decisions can be traced back to the specific rules that applied at the time.

## **16.4 The Library's Integration with Workflow Stages**

Each workflow stage calls specific rule categories from the library.

**Stage 0 — Triage —** Hard disqualifier rules; sponsor diligence rules

**Stage 1 — Document ingestion —** Document classification rules; data parsing rules

**Stage 2 — Sponsor diligence —** Sponsor diligence rules; sponsor profile rules

**Stage 3 — Project underwriting —** Project underwriting rules; pro forma re-underwriting rules; structuring gap rules

**Stage 4 — Structuring memorandum —** Structuring rules; sector-specific rules; rating target rules

**Stage 5 — Engagement and rating strategy —** Rating strategy rules; agency selection rules; rating presentation rules

**Stage 6 — Document drafting —** Documentation rules; indenture precedent rules; sector-specific document rules

**Stage 7 — POS production —** Disclosure rules; POS template rules; risk factor rules

**Stage 8 — Working group coordination —** Working group rules; comment resolution rules

**Stage 9 — Conduit approvals —** Conduit-specific rules; TEFRA process rules

**Stage 10 — Rating committee —** Rating committee rules; analyst response rules

**Stage 11 — Pricing —** Pricing rules; buyer pool rules; market timing rules

**Stage 12 — Closing —** Closing checklist rules; counterparty coordination rules

**Stage 13 — Post-closing —** Administration rules; covenant monitoring rules; refunding identification rules

## **16.5 The Library's Technical Implementation**

From the engineer's perspective, the library is a structured database of rules, each rule encoded with:

Rule ID — unique identifier for the rule

Rule category — sponsor diligence, structuring, rating strategy, etc.

Rule layer — Layer 1, 2, or 3

Rule trigger — the conditions under which the rule applies

Rule action — what the rule does when triggered (recommend a value, set a default, flag for human review, decline the deal, etc.)

Rule evidence — citations to the source data, methodology paper, or experience that supports the rule

Rule status — active, deprecated, under review

Rule version — current version number; prior versions archived

Rule author — who created the rule (typically Sean for Layer 3; the data layer for Layer 1 and Layer 2)

Rule history — when applied, with what outcomes

The platform's workflow agents query the library by category, trigger, and context. The library returns the applicable rules, the agent applies them, and the result feeds the agent's downstream decision.

### **Rule Conflict Resolution**

When multiple rules apply and conflict, the library has defined precedence:

Layer 3 rules supersede Layer 2 rules (operator judgment overrides pattern observation when explicitly differing)

More specific rules supersede more general rules (sector-specific overrides general)

More recent rules supersede older rules of the same specificity

Hard rules (disqualifiers, regulatory requirements) supersede soft rules (preferences, defaults)

When the precedence doesn't fully resolve a conflict, the rule application is flagged for human review (Sean or Josh) to make the call. The human resolution then becomes a new rule for future cases.

## **16.6 The Library's Continuous Growth**

Critical operating principle: every deal grows the library.

### **Per-Deal Growth Cycle**

For every deal:

During structuring, every rule applied is logged

At closing, the structural decisions are captured with the rules that produced them

During administration, every covenant test, every event, every modification adds to the library

At refunding, the refunding decision and the rules that produced it are added

At restructuring or workout, the lessons learned are captured

Post-deal review identifies any rules that should be revised based on the experience

### **The Long-Term Compounding**

In year 1, the library is small and the platform's recommendations rely heavily on Sean's direct judgment. By year 5, the library has captured the patterns from ~50 deals plus continuous public data ingestion. By year 10, the library has 200+ deals worth of pattern data plus a decade of public data ingestion. By year 15, the library is more comprehensive than any individual human's experience, including the founders' — at that point, the platform's recommendations are routinely better than what any individual banker could produce, because the library has access to more pattern data than any individual can hold.

### **The Inverted-Pyramid Future**

The path of the library is from 'the founders inform the platform' (year 1-3) to 'the platform informs the founders' (year 10+). In the early years, Sean's interpretations are the most important input. As the library grows, the patterns and accumulated lessons become more important than any individual's judgment. The platform's recommendations become more authoritative; the founders' role evolves from primary source to quality reviewer.

This is the long-term vision: the platform becomes the operator's primary tool, with continuously growing capability, while the human operators (Sean, Josh, and the team) provide quality oversight, novel-situation judgment, and strategic direction. The library is what makes that vision viable.

## **16.7 Quick Reference — Silo 16**

### **Three-Layer Architecture**

**Layer 1 — Public Data Extraction —** EMMA, EDGAR, rating publications, IRS, MSRB, sector-specific public sources — converted to structured queryable form

**Layer 2 — Behavioral Pattern Extraction —** Statistical patterns from Layer 1 data — default patterns, rating migrations, pricing patterns, sector trends

**Layer 3 — the founders' Interpretive Judgment —** Operator judgment converting patterns into actionable rules — eighteen years of experience encoded

### **Rule Categories**

Sponsor diligence

Project underwriting

Structuring

Rating strategy

Pricing

Covenant design

Reserve sizing

Credit enhancement

Documentation

Administration

### **Rule Metadata**

Rule ID, Category, Layer

Trigger, Action, Evidence

Status (active/deprecated)

Version, Author, History

### **Rule Sources**

Methodology papers

Default studies

Deal completions

Rating committee feedback

Workout / restructuring experience

founder interpretation sessions

Market shifts

Regulatory changes

### **Conflict Resolution Precedence**

Layer 3 supersedes Layer 2

Specific supersedes general

Recent supersedes older

Hard rules supersede soft preferences

Unresolved conflicts → human review → new rule

# **SILO 17 — AGENT SPECIFICATIONS BY WORKFLOW STAGE**

The platform's analytical work happens through agents — specialized AI workers, each scoped to a defined function, each calling defined tools, each producing defined outputs. This silo specifies every agent the platform requires, what each does, what inputs it consumes, what outputs it produces, what rule library categories it queries, and what human gateways it interacts with. The engineer building the platform reads this silo to understand the agent inventory and the integration points.

**THE AGENT PRINCIPLE —** Each agent is narrow and accountable. An agent that tries to do everything ends up doing nothing well. The platform's agents are specialists — each scoped to a defined workflow stage and a defined output, each with clear inputs and outputs, each with traceable decision logic. Narrow agents compose into the full workflow.

## **17.1 The Agent Inventory**

The platform requires the following agents, organized by workflow stage:

### **Stage 0 Agents**

Triage Agent — inbound qualification

Sponsor Onboarding Agent — portal setup and initial outreach

### **Stage 1 Agents**

Document Ingestion Agent — file classification, OCR, parsing

Data Validation Agent — completeness checks, freshness checks

### **Stage 2 Agents**

Sponsor Diligence Agent — background, litigation, regulatory, prior project review

Sponsor Profile Agent — synthesis of diligence into go/no-go profile

### **Stage 3 Agents**

Re-Underwriting Agent — independent pro forma rebuild

Sizing Agent — multi-test sizing analysis

Structuring Gap Agent — diff sponsor vs. Nest, propose restructure options

### **Stage 4 Agents**

Structuring Agent — full deal structure decision

Conduit Selection Agent — identify and evaluate conduit options

Memorandum Generation Agent — produce Structuring Memorandum

### **Stage 5 Agents**

Rating Strategy Agent — methodology analysis and agency selection

Rating Presentation Agent — produce rating presentation deck

Engagement Letter Agent — produce engagement letters with all relevant counterparties

### **Stage 6 Agents**

Document Drafting Agent — produce first drafts of all transaction documents

Document Version Control Agent — manage redlines, track comments, consolidate revisions

### **Stage 7 Agents**

POS Production Agent — produce Preliminary Official Statement

Pitch Book Agent — produce investor pitch book and roadshow materials

Disclosure Validation Agent — disclosure completeness and risk factor coverage

### **Stage 8 Agents**

Working Group Coordinator Agent — agenda, action items, status tracking

Comment Consolidation Agent — process redlines from all counsels

Conditions Precedent Tracker — monitor satisfaction of closing conditions

### **Stage 9 Agents**

Conduit Approval Agent — manage conduit application and approval process

TEFRA Coordination Agent — handle TEFRA hearing logistics

### **Stage 10 Agents**

Rating Question Response Agent — log analyst questions, draft responses

Rating Committee Prep Agent — prepare management for rating meetings

Rating Tracking Agent — monitor committee process, flag concerns

### **Stage 11 Agents**

Pricing Analysis Agent — track marketing, book oversubscription, recommend pricing positions

Buyer Pool Agent — identify and engage relevant institutional buyers via BD partner

### **Stage 12 Agents**

Closing Checklist Agent — manage 80-150 item closing checklist

Funds Flow Agent — coordinate flow of funds at closing

Closing Binder Agent — assemble post-closing record

### **Stage 13 Agents — Post-Closing Administration**

Draw Processing Agent — validate construction draw requests

Debt Service Administration Agent — calculate and coordinate periodic payments

Covenant Monitoring Agent — automated covenant testing

Compliance Certificate Agent — generate periodic compliance certificates

Continuing Disclosure Agent — produce EMMA filings

Material Event Detection Agent — monitor for events triggering disclosure

Amendment and Waiver Agent — manage consent solicitation processes

Refunding Identification Agent — continuous refunding NPV analysis

Surveillance Support Agent — produce annual surveillance packages

Workout Support Agent — provide structural support during workouts

## **17.2 Agent Specifications — Stage 0 (Triage)**

### **Triage Agent**

**Purpose —** Initial qualification of inbound deal inquiries against hard disqualifiers

**Inputs —** Inbound inquiry data: project description, asset class, location, size, sponsor identity, timing

**Tools used —** Sanctions screening API, public records search, project size validator, asset class classifier

**Rule library calls —** Sponsor diligence hard disqualifier rules, sector eligibility rules, geographic eligibility rules, project size minimums

**Outputs —** Triage decision: Pass / Conditional Pass / Fail; if Fail, the specific reason; if Conditional, the flag requiring human review

**Human gateway —** Edge cases requiring Sean or Josh review

**Time —** Same day for clean inquiries; 24-48 hours for edge cases

### **Sponsor Onboarding Agent**

**Purpose —** Bring qualified sponsors into the portal and begin diligence collection

**Inputs —** Sponsor identity and contact information; project preliminary description; signed NDA

**Tools used —** Portal provisioning, document request templates, automated outreach email/text/portal communication

**Rule library calls —** Onboarding template rules; document collection sequence rules

**Outputs —** Portal access for sponsor; initial document request list; onboarding kit including engagement framework

**Time —** Same day

## **17.3 Agent Specifications — Stage 1 (Document Ingestion)**

### **Document Ingestion Agent**

**Purpose —** Classify, OCR, and parse uploaded documents into structured data

**Inputs —** Raw documents uploaded by sponsor (PDF, Excel, Word, image)

**Tools used —** OCR services, document classifiers, field extractors, NLP parsers

**Rule library calls —** Document classification rules; field extraction rules; sector-specific document parsing rules

**Outputs —** Each document indexed in the deal database; structured data extracted; document classification assigned

**Time —** Within minutes of upload

### **Data Validation Agent**

**Purpose —** Validate completeness, freshness, and consistency of ingested data

**Inputs —** Parsed data from ingestion agent; sector-specific document requirements; document type freshness thresholds

**Tools used —** Comparison engines, freshness validators, completeness checkers

**Rule library calls —** Document completeness rules by deal type; freshness threshold rules

**Outputs —** Document Completeness Report; list of missing documents; list of stale documents requiring refresh

**Time —** Within hours of document set being substantially complete

## **17.4 Agent Specifications — Stage 2 (Sponsor Diligence)**

### **Sponsor Diligence Agent**

**Purpose —** Comprehensive sponsor background and prior project review

**Inputs —** Sponsor identity; principal identities; entity documents

**Tools used —** Background check services; PACER federal court search; state court searches; OFAC/SDN screening; credit bureau; news searches; EMMA continuing disclosure for prior projects; specialty real estate / industry databases

**Rule library calls —** Sponsor diligence rules; sponsor pattern recognition rules; sector-specific sponsor rules

**Outputs —** Diligence findings categorized green / yellow / red; specific flags requiring follow-up

**Time —** 1 week parallel with Stage 1

### **Sponsor Profile Agent**

**Purpose —** Synthesize diligence into actionable sponsor profile

**Inputs —** Diligence findings from Sponsor Diligence Agent; sponsor's prior project performance data

**Tools used —** Pattern matching against sponsor archetypes in library; structured profile templates

**Rule library calls —** Sponsor profile rules; sponsor track record patterns

**Outputs —** Sponsor profile with overall risk rating; recommended additional protections (if any); recommended terms and structure modifications

**Human gateway —** Yellow-flagged profiles → Sean/Josh review; red profiles → automatic decline with explanation

**Time —** After Sponsor Diligence Agent completes

## **17.5 Agent Specifications — Stage 3 (Project Underwriting)**

### **Re-Underwriting Agent**

**Purpose —** Rebuild the project pro forma independently from scratch using house standards

**Inputs —** Sponsor pro forma; market study; feasibility study; financial statements; project documents; capital stack

**Tools used —** Pro forma templates by asset class; benchmark databases (CoStar, REIS, STR, HUD FMR, IBISWorld, sector-specific); peer transaction database; expense ratio benchmarks; absorption schedule benchmarks

**Rule library calls —** Pro forma re-underwriting rules; sector-specific underwriting rules; market stress test rules; assumption boundary rules

**Outputs —** Re-Underwritten Pro Forma alongside sponsor pro forma; line-by-line delta analysis with rationale for each variance

**Time —** 2-3 weeks

### **Sizing Agent**

**Purpose —** Run multi-test sizing analysis to determine financeable loan amount

**Inputs —** Re-Underwritten Pro Forma; target rating; sector-specific sizing benchmarks; current market rate environment

**Tools used —** Sizing formulas from modeling engine (LTV, LTC, DSCR, debt yield, leverage); market rate data

**Rule library calls —** Sizing rules by asset class and rating; sizing precedence rules

**Outputs —** Maximum loan amount per each sizing test; binding sizing constraint; sizing sensitivity analysis

**Time —** Within Stage 3

### **Structuring Gap Agent**

**Purpose —** Identify where the sponsor's proposed deal differs from the Re-Underwritten Pro Forma; propose restructure options to close gaps

**Inputs —** Sponsor proposal; Re-Underwritten Pro Forma; Sizing Agent results

**Tools used —** Gap analysis algorithms; restructuring option databases; sensitivity calculators

**Rule library calls —** Gap analysis rules; restructuring options rules; structural alternatives by asset class

**Outputs —** Structuring Gap Memo with specific gaps identified; proposed restructure options; expected outcome of each option

**Human gateway —** Sean/Josh review at Gateway 1 — does the deal make sense, do we engage formally

**Time —** 2-3 weeks

## **17.6 Agent Specifications — Stage 4 (Structuring Memorandum)**

### **Structuring Agent**

**Purpose —** Lock in the full deal structure: bond type, conduit, par, tenor, amortization, coupon structure, security, covenants, reserves, redemption, use of proceeds

**Inputs —** Re-Underwritten Pro Forma; Sizing Agent results; sponsor's strategic preferences; rating target; market conditions

**Tools used —** Full modeling engine; structural decision frameworks; conduit databases; rating prediction models; pricing predictors

**Rule library calls —** All structuring rules across categories; sector-specific structuring rules; market environment rules

**Outputs —** Locked deal structure with all major decisions made; indicative pricing range; indicative rating; structural sensitivity

**Time —** 1-2 weeks

### **Conduit Selection Agent**

**Purpose —** Identify and evaluate available conduit issuers for the deal

**Inputs —** Deal characteristics (asset class, location, project description, tax structure); volume cap status by state HFA

**Tools used —** Conduit database with eligibility criteria, approval processes, fee schedules, historical responsiveness

**Rule library calls —** Conduit selection rules; conduit performance patterns; state-specific conduit rules

**Outputs —** Conduit recommendation with rationale; backup options; timeline and process for the recommended conduit

**Time —** Within Stage 4

### **Memorandum Generation Agent**

**Purpose —** Produce the Structuring Memorandum document for sponsor approval

**Inputs —** All outputs from structuring agents; sponsor's preferences; market context

**Tools used —** Document templating engine; sector-specific memorandum templates

**Rule library calls —** Documentation rules for structuring memoranda

**Outputs —** Structuring Memorandum — typically 25-40 pages with full schedules

**Human gateway —** Sponsor and Sean/Josh review at Gateway 2

**Time —** Within Stage 4

## **17.7 Agent Specifications — Stage 5 (Engagement and Rating Strategy)**

### **Rating Strategy Agent**

**Purpose —** Determine optimal rating agency selection; predict rating outcomes; produce rating presentation strategy

**Inputs —** Approved structure; deal characteristics; methodology papers from candidate agencies; historical rating data from peer transactions

**Tools used —** Methodology application engines for each agency; rating prediction models; peer transaction database; rating committee composition database

**Rule library calls —** Rating strategy rules; agency selection rules; sector-specific agency rules; methodology-driven rules

**Outputs —** Indicative Rating Memoranda for each candidate agency; recommended agency selection; rationale

**Time —** Within Stage 5

### **Rating Presentation Agent**

**Purpose —** Produce rating presentation materials calibrated to selected agency and target rating

**Inputs —** Approved structure; sponsor information; project information; financial data; market context

**Tools used —** Rating presentation templates; data visualization tools; sector-specific presentation templates

**Rule library calls —** Rating presentation rules; sector-specific presentation patterns; agency-specific emphasis rules

**Outputs —** Rating Presentation deck; supporting schedules; data appendices

**Time —** Within Stage 5

### **Engagement Letter Agent**

**Purpose —** Produce engagement letters with all relevant counterparties

**Inputs —** Approved structure; counterparty contact information; standard engagement terms by counterparty type

**Tools used —** Engagement letter templates; standard terms libraries

**Rule library calls —** Engagement letter rules; standard terms by counterparty type

**Outputs —** Customized engagement letters for sponsor, BD partner, bond counsel, trustee, rating agencies, conduit issuer (or initial application/LOI)

**Time —** Within Stage 5

## **17.8 Agent Specifications — Stage 6 (Document Drafting)**

### **Document Drafting Agent**

**Purpose —** Produce first drafts of all transaction documents

**Inputs —** Approved structure; sponsor information; project documents; sector-specific document precedent

**Tools used —** Document templating engine indexed by deal type, sector, conduit, structure; precedent library; structural element substitution rules

**Rule library calls —** Documentation rules across categories; sector-specific document rules; conduit-specific document rules; tax structure rules

**Outputs —** Full draft document set: Indenture, Loan Agreement (conduit), Mortgage and Security Agreement (where applicable), UCC Financing Statements, Regulatory Agreement (sector-specific), Tax Regulatory Agreement (tax-exempt), Continuing Disclosure Agreement, Bond Purchase Agreement, Construction Disbursement Agreement, Subordination Agreements (where applicable), Officer's Certificates, Opinion forms

**Time —** 2-3 weeks

### **Document Version Control Agent**

**Purpose —** Manage redlines from all counsels; consolidate revisions; track version history

**Inputs —** Redlines from bond counsel, sponsor's counsel, trustee's counsel, disclosure counsel, conduit's counsel, underwriter's counsel

**Tools used —** Redline comparison engines; comment classification; revision proposers

**Rule library calls —** Document version control rules; comment classification rules; resolution proposal rules

**Outputs —** Consolidated comment logs; proposed resolutions; updated document versions; comment status tracking

**Time —** Throughout Stages 6-8

## **17.9 Agent Specifications — Stage 7 (POS Production)**

### **POS Production Agent**

**Purpose —** Produce the Preliminary Official Statement

**Inputs —** Approved structure; project information; financial data; sector-specific disclosure requirements; rating agency requirements

**Tools used —** POS templates by deal type and sector; risk factor libraries; data visualization for tables and charts

**Rule library calls —** Disclosure rules; POS section requirements by deal type; risk factor selection rules

**Outputs —** Preliminary Official Statement — typically 150-250 pages including appendices

**Time —** 2-3 weeks

### **Pitch Book Agent**

**Purpose —** Produce investor pitch book and roadshow materials

**Inputs —** Deal summary; key credit story; comparable transactions; rating support; financial highlights

**Tools used —** Presentation templates; market data integration; comparable bond databases

**Rule library calls —** Pitch book rules; buyer pool-specific presentation rules

**Outputs —** Investor pitch book; roadshow deck; one-on-one meeting materials

**Time —** Within Stage 7

### **Disclosure Validation Agent**

**Purpose —** Ensure disclosure completeness and risk factor coverage

**Inputs —** Draft POS; sector-specific disclosure standards; recent SEC enforcement patterns; rating agency disclosure expectations

**Tools used —** Disclosure completeness checkers; risk factor pattern matchers; precedent comparison

**Rule library calls —** Disclosure validation rules; risk factor coverage rules; SEC enforcement pattern rules

**Outputs —** Disclosure validation report; specific gaps identified; recommended additional disclosure

**Time —** Concurrent with POS production

## **17.10 Agent Specifications — Stages 8-10 (Working Group, Approvals, Rating)**

### **Working Group Coordinator Agent**

**Purpose —** Run the working group meetings as a structured project management exercise

**Inputs —** All open deal items; counterparty status; scheduling availability

**Tools used —** Calendar integration; agenda generation; action item tracking; status dashboard

**Outputs —** Weekly working group call agendas; minutes; action item lists with owners; status dashboard updates

**Time —** Throughout Stages 8-12

### **Comment Consolidation Agent**

**Purpose —** Process redlines from all counsels into unified resolution proposals

**Inputs —** All redlines

**Tools used —** Redline parsers; comment classification; resolution proposal engines

**Rule library calls —** Comment resolution rules; precedent for similar issues

**Outputs —** Unified comment log; proposed resolutions for working group consideration

**Time —** Continuous

### **Conditions Precedent Tracker**

**Purpose —** Monitor satisfaction of all closing conditions

**Inputs —** BPA conditions; closing checklist items; counterparty deliveries

**Tools used —** Conditions database; deliverable tracker; status alerts

**Outputs —** Conditions satisfaction status; open items list; alerts on impending deadlines

**Time —** Continuous

### **Conduit Approval Agent**

**Purpose —** Manage conduit application and approval process

**Inputs —** Deal information; conduit requirements; application forms

**Tools used —** Conduit application forms; submission tracking; conduit calendar integration

**Outputs —** Submitted applications; approval status tracking; required additional information requests

**Time —** Stage 9

### **TEFRA Coordination Agent**

**Purpose —** Handle TEFRA hearing logistics

**Inputs —** Bond information; TEFRA jurisdiction requirements

**Tools used —** TEFRA hearing scheduler; notice publication services; TEFRA approval form generators

**Outputs —** TEFRA hearing notice; hearing logistics; post-hearing approval certificate

**Time —** Stage 9

### **Rating Question Response Agent**

**Purpose —** Log analyst questions; draft responses; route through approval

**Inputs —** Analyst questions; deal information; precedent responses

**Tools used —** Question routing; response drafters; precedent matching

**Rule library calls —** Rating committee question patterns; effective response patterns by agency and sector

**Outputs —** Drafted responses for review by Sean/Josh; sent responses logged; question status tracked

**Time —** Continuous during rating engagement

### **Rating Committee Prep Agent**

**Purpose —** Prepare obligor management for rating committee meeting

**Inputs —** Rating presentation deck; analyst questions pattern; committee composition data

**Tools used —** Question anticipation engines; presentation prep materials

**Outputs —** Management briefing package; anticipated questions and proposed responses; presentation walkthrough

**Time —** 1-2 weeks before rating meeting

### **Rating Tracking Agent**

**Purpose —** Monitor rating committee progress; flag concerns

**Inputs —** Rating committee process status; analyst feedback signals

**Tools used —** Status tracking; sentiment analysis; pattern matching

**Outputs —** Rating process status updates; concerns flagged for human attention

**Time —** Continuous

## **17.11 Agent Specifications — Stages 11-12 (Pricing and Closing)**

### **Pricing Analysis Agent**

**Purpose —** Track marketing progress; analyze book; recommend pricing positions

**Inputs —** Marketing activity; book of orders; market data; comparable transactions; rating outcome

**Tools used —** Pricing model; market data integration; comparable transaction database

**Rule library calls —** Pricing rules; buyer pool patterns; market timing rules

**Outputs —** Pricing range analysis; recommended position; book strength assessment; sensitivity to alternative pricing

**Time —** Throughout marketing period

### **Buyer Pool Agent**

**Purpose —** Identify relevant institutional buyers; coordinate engagement via BD partner

**Inputs —** Deal characteristics; buyer pool database; BD partner's buyer relationships

**Tools used —** Buyer pool segmentation; buyer-specific deal qualification

**Rule library calls —** Buyer pool rules by sector and rating

**Outputs —** Target buyer list; buyer-specific outreach materials

**Time —** Pre-marketing through marketing

### **Closing Checklist Agent**

**Purpose —** Manage 80-150 item closing checklist

**Inputs —** Deal information; checklist template for deal type

**Tools used —** Checklist management; document collection; verification engines

**Outputs —** Closing checklist status; open items list; verification confirmations

**Time —** Last 30 days before closing

### **Funds Flow Agent**

**Purpose —** Coordinate flow of funds at closing

**Inputs —** Bond proceeds; cost of issuance breakdown; reserve funding requirements; underwriter discount; net proceeds to obligor

**Tools used —** Funds flow templates; wire instruction collection; verification

**Outputs —** Closing flow of funds document; wire instructions; verification of execution

**Time —** Day of closing

### **Closing Binder Agent**

**Purpose —** Assemble post-closing record

**Inputs —** All executed transaction documents, opinions, certificates, filings

**Tools used —** Document classification; binder assembly; indexing

**Outputs —** Closing binder organized by category; index for searching; accessible to authorized parties

**Time —** Within 1 week of closing

## **17.12 Agent Specifications — Stage 13 (Post-Closing Administration)**

### **Draw Processing Agent**

**Purpose —** Validate construction draw requests

**Inputs —** Contractor pay applications; lien waivers; updated budget; capitalized interest calculations

**Tools used —** Pay application validators; budget reconciliation; lien waiver verifiers

**Rule library calls —** Draw processing rules; sector-specific draw patterns

**Outputs —** Validated draw package for monitor certification; flags for sponsor correction; reports for trustee disbursement

**Time —** Monthly

### **Debt Service Administration Agent**

**Purpose —** Calculate and coordinate periodic debt service payments

**Inputs —** Bond terms; current interest rate (variable bonds); amortization schedule; sinking fund schedule

**Tools used —** Payment calculators; obligor funding verification; trustee coordination

**Outputs —** Payment calculations; funding confirmations; payment processing reports

**Time —** Semi-annual (typical) or monthly (variable rate)

### **Covenant Monitoring Agent**

**Purpose —** Automated covenant testing

**Inputs —** Obligor's financial data (via integration or upload); indenture-defined covenant formulas

**Tools used —** Covenant calculation engines; trend analysis; alerting system

**Rule library calls —** Covenant monitoring rules; alert threshold rules

**Outputs —** Covenant compliance status; trend analysis; alerts at yellow/orange/red thresholds; forward projections

**Time —** Continuous; monthly testing typically

### **Compliance Certificate Agent**

**Purpose —** Generate periodic compliance certificates

**Inputs —** Covenant test results; financial data; sector-specific compliance items

**Tools used —** Certificate templates; CFO sign-off coordination

**Outputs —** Compliance certificate ready for CFO sign-off; filed copy with trustee and (for muni) EMMA

**Time —** Quarterly (typical)

### **Continuing Disclosure Agent**

**Purpose —** Produce EMMA filings for ongoing disclosure obligations

**Inputs —** Annual audited financials; operating data; material event triggers

**Tools used —** EMMA filing interface; document formatting; deadline tracking

**Outputs —** Annual report filings; material event filings; filing receipts

**Time —** Annual filings + material event filings as required

### **Material Event Detection Agent**

**Purpose —** Monitor public sources for events triggering disclosure

**Inputs —** Public data sources (rating agency publications, news, regulatory filings, corporate filings)

**Tools used —** Web monitoring; news feed integration; rating action trackers

**Outputs —** Material event identification; alert to obligor and Nest; recommended filing draft

**Time —** Continuous monitoring

### **Amendment and Waiver Agent**

**Purpose —** Manage consent solicitation processes

**Inputs —** Proposed amendment; indenture consent provisions; bondholder identity (where ascertainable)

**Tools used —** Consent solicitation generators; DTC distribution; consent tabulation; consent fee calculation

**Outputs —** Consent solicitation materials; consent tracking; finalized amendment with supplemental indenture

**Time —** Per amendment cycle (typically 60-90 days)

### **Refunding Identification Agent**

**Purpose —** Continuous refunding NPV analysis across administered portfolio

**Inputs —** Each administered bond's remaining DS; current market rates; bond's call status; refunding costs

**Tools used —** Refunding NPV calculator; current rate data; alert system

**Rule library calls —** Refunding rules; refunding economic threshold rules

**Outputs —** Refunding opportunity alerts when NPV crosses thresholds; refunding analysis package for obligor review

**Time —** Quarterly recomputation; continuous monitoring

### **Surveillance Support Agent**

**Purpose —** Produce annual surveillance packages for rating agencies

**Inputs —** Operating performance data; covenant compliance history; material developments; peer comparison; forward outlook

**Tools used —** Surveillance package templates; data integration; rating agency-specific formatting

**Outputs —** Surveillance package for each rated bond; meeting prep when applicable

**Time —** Annual

### **Workout Support Agent**

**Purpose —** Provide structural support during workouts

**Inputs —** Workout situation; restructuring options; bondholder positions

**Tools used —** Restructuring scenario modeling; bondholder communication; consent solicitation

**Outputs —** Workout proposals; scenario analysis; consent process coordination

**Time —** Throughout workout

## **17.13 Cross-Cutting Agent Patterns**

Several patterns apply to all agents in the platform.

### **Audit Trail**

Every agent action is logged: agent name, timestamp, inputs received, tools called, rule library queries, decisions made, outputs produced. The audit trail allows any decision to be traced back to its source data and reasoning.

### **Human Gateway**

Each agent has defined conditions under which it routes to human review rather than acting autonomously. Edge cases, low-confidence outputs, conflicts with prior agent outputs, or high-stakes decisions all flag for human review. The platform never makes unilateral decisions on critical matters.

### **Continuous Learning**

Every agent's outputs are reviewed against actual outcomes. When an agent's recommendations consistently produce strong outcomes, the agent's confidence is increased. When recommendations underperform, the agent's rules are reviewed. This continuous learning loop is what improves the platform over time.

### **Sector Specialization**

Many agents have sector-specific variants. The Re-Underwriting Agent for multifamily housing is different from the Re-Underwriting Agent for healthcare. The platform routes deals to the sector-appropriate agent variant based on Stage 0 classification.

### **Documentation**

Every agent's specification — purpose, inputs, tools, rules, outputs, gateways, performance — is documented and maintained. New team members and engineers can understand the platform by reading the agent specs.

## **17.14 Quick Reference — Silo 17**

### **Agent Count by Stage**

Stage 0: 2 agents (Triage, Onboarding)

Stage 1: 2 agents (Ingestion, Validation)

Stage 2: 2 agents (Diligence, Profile)

Stage 3: 3 agents (Re-Underwriting, Sizing, Structuring Gap)

Stage 4: 3 agents (Structuring, Conduit Selection, Memorandum)

Stage 5: 3 agents (Rating Strategy, Rating Presentation, Engagement Letter)

Stage 6: 2 agents (Drafting, Version Control)

Stage 7: 3 agents (POS Production, Pitch Book, Disclosure Validation)

Stage 8: 3 agents (Working Group, Comment Consolidation, Conditions Precedent)

Stage 9: 2 agents (Conduit Approval, TEFRA)

Stage 10: 3 agents (Question Response, Committee Prep, Tracking)

Stage 11: 2 agents (Pricing Analysis, Buyer Pool)

Stage 12: 3 agents (Closing Checklist, Funds Flow, Binder)

Stage 13: 10 agents (Draw, Debt Service, Covenant Monitor, Compliance Cert, Continuing Disclosure, Material Event, Amendment, Refunding ID, Surveillance, Workout)

Total: ~43 distinct agents

### **Cross-Cutting Patterns**

Audit trail for every action

Human gateway for high-stakes / low-confidence decisions

Continuous learning loop

Sector-specific variants

Comprehensive documentation

# **SILO 18 — TECH STACK WIRE-UP**

This silo is the engineer's guide. It specifies the concrete architecture decisions, technology choices, integration points, and build sequence required to translate everything in Silos 1-17 into working software. Sean is not the engineer; this silo describes what the engineer needs to know about the business so they can make the technical decisions and what business-side decisions need to be locked before engineering can begin.

This silo also lays out a phased build sequence so that the platform delivers value at every milestone rather than requiring full completion before any value is generated. The phasing is critical — Nest must be operationally generating revenue with partial platform functionality long before the full platform is built.

**THE BUILD PRINCIPLE —** Build for value at each phase. Phase 1 delivers a working tool that captures meaningful operating leverage. Phase 2 adds capability. Phase 3 builds toward the full vision. Nest does not need the perfect platform on day one — it needs a useful platform that grows. The phasing makes the build economically realistic and operationally usable from early stages.

## **18.1 The Core Architecture**

The platform is structured as a multi-tier system. The tiers, from bottom to top:

### **Tier 1: Data Layer**

The data layer holds all structured data the platform operates on. Major data stores:

Deal database — all deals (active, closed, administered), with full structural details, document index, working group, status, history

Counterparty database — bond counsel, trustees, conduit issuers, rating agencies, BD partners, sponsors, etc., with profiles, fees, performance history

Document repository — all transaction documents indexed by deal, document type, version

Public data warehouse — EMMA filings, EDGAR filings, rating agency publications, IRS guidance — continuously ingested and structured

Modeling engine database — formulas, calculation logs, audit trail

Rule library database — all rules with metadata, version history, application history

Pattern data warehouse — behavioral patterns extracted from public data

Administration data — covenant test history, draw history, disclosure filings, refunding analyses

### **Tier 2: Application Layer**

The application layer contains the business logic and agent runtime:

Agent runtime — orchestration of agent calls, sequencing, dependency management

Workflow engine — manages deal progression through workflow stages

Document templating engine — generates draft documents from precedent and structural inputs

Modeling engine — runs financial calculations

Rule library query engine — finds applicable rules for a given context

Notification and alerting system — manages alerts to humans and counterparties

Reporting engine — generates dashboards, status reports, compliance reports

### **Tier 3: Integration Layer**

The integration layer connects the platform to external systems:

EMMA API integration — for filing and retrieving municipal bond disclosure

EDGAR API integration — for filing and retrieving corporate bond disclosure

Rating agency portals — secure document delivery

Document signing platform (DocuSign or equivalent) — for executed signatures on transaction documents

DTC integration — for bond issuance, payment processing, consent solicitation distribution

Accounting system integrations — APIs to NetSuite, QuickBooks, Sage Intacct, Workday for obligor financial data pull

Banking integrations — for trustee account integration, wire processing visibility

Public records search APIs — PACER, state court searches, sanctions screening, credit bureau

Market data integrations — Bloomberg, Refinitiv, DPC Data, MMD for benchmark rates and comparable transactions

### **Tier 4: User Interface Layer**

The UI layer is where humans interact with the platform:

Banker portal — for Nest team (Sean, Josh, and growing team) to manage deals, review agent outputs, make gateway decisions

Sponsor portal — for sponsors and obligors to upload documents, review structuring memoranda, approve decisions, monitor administered bonds

Counterparty portal — for bond counsel, trustees, conduits, rating analysts to access deal information and deliver documents

Reporting and analytics dashboard — across the firm's deal portfolio, financial performance, and forward pipeline

Administration dashboard — for active monitoring of administered bonds (Stage 13)

## **18.2 Technology Stack Decisions**

Concrete technology choices the engineer needs to make, with recommended approaches:

### **Programming Language**

Python is the recommended primary language. Reasons: dominant in financial modeling and analytics; strong ecosystem for AI/ML; broad library coverage for document handling, data parsing, API integration; relatively easy to find competent developers. Python 3.11+ for current features.

Some specific components may use TypeScript / JavaScript for UI work (React for web applications) or Go for high-performance services. The bulk of business logic remains in Python.

### **Database**

PostgreSQL as the primary relational database. Reasons: open-source, mature, supports JSON for semi-structured data, well-suited to the relational structure of deals, counterparties, and documents.

For unstructured document storage (the actual PDFs, Word documents, Excel models), use cloud object storage — AWS S3, GCP Cloud Storage, or equivalent. Object storage is cheap for the volumes involved and integrates well with document workflows.

For the modeling engine and rule library, the relational database with JSON columns handles most needs. For more complex pattern data, a graph database (Neo4j or AWS Neptune) may be valuable for relationships, but is not required for Phase 1.

For full-text search across documents, Elasticsearch or OpenSearch.

### **Agent Framework**

For the AI agent layer, several frameworks are viable: Claude Anthropic's tools and API directly with custom orchestration; LangChain for orchestration; AutoGen or CrewAI for multi-agent coordination. The engineer's choice depends on which framework best fits their experience and the specific patterns required.

Recommendation: start simple. Build agents as Python services that call Claude API directly, with custom orchestration. Add framework abstractions only when they solve specific pain points. Premature abstraction kills early progress.

### **Document Templating**

For document generation, recommended approach: Markdown or HTML templates with Jinja2 templating for variable substitution; convert to PDF/Word at output using Pandoc or python-docx; for complex Word documents, use python-docx directly with template manipulation.

For the highest-fidelity Word documents (the indenture and POS), Pandoc or python-docx with custom styles. Long-form Word documents are non-trivial — this is where the platform's first major engineering investment goes.

### **Cloud Infrastructure**

AWS, GCP, or Azure — any major cloud is workable. Recommendation: AWS for broadest service availability and pricing options, but the engineer's experience should drive the choice.

Containerization with Docker for service deployment. Kubernetes for orchestration as the platform scales beyond a small number of services. Initially, simple Docker Compose deployments are sufficient.

### **Observability**

Logging via structured logs (JSON formatted). Centralized logging via CloudWatch, GCP Cloud Logging, or equivalent. Metrics and tracing via OpenTelemetry. Alerting via PagerDuty or equivalent for operational issues.

Audit logging is distinct from operational logging and requires careful design. Every agent decision and every document operation needs an audit trail that is durable, queryable, and tamper-resistant.

### **Security**

The platform handles highly sensitive information. Required security measures:

Encryption in transit (TLS 1.3 for all network traffic)

Encryption at rest (database encryption, S3 encryption)

Role-based access control (RBAC) — different access levels for different team members and counterparties

SOC 2 Type II compliance over time (not required for early build but required as the firm scales)

Regular penetration testing

Secrets management (AWS Secrets Manager, HashiCorp Vault, or equivalent)

MFA on all human accounts

Audit logging on all sensitive operations

## **18.3 Integration Specifications**

### **EMMA Integration**

EMMA (Electronic Municipal Market Access) is operated by MSRB. API access requires registration as an Authorized Submitter. Functions needed: filing official statements; filing continuing disclosure annual reports; filing material event notices; retrieving historical data on bonds and obligors.

EMMA's API is documented but not modern; some operations may require manual interaction with the EMMA portal or third-party intermediation. Plan for both API integration and manual fallback workflows.

### **EDGAR Integration**

EDGAR (SEC's electronic filing system) is the federal repository for corporate bond and other securities filings. APIs are available for filing and retrieval. Integration is more straightforward than EMMA but with strict format requirements for each filing type.

### **Rating Agency Integration**

Rating agencies (Moody's, S&P, Fitch, Kroll, DBRS) provide secure portals for document delivery to assigned analysts. Each has its own portal mechanics. Integration with these portals is typically manual / portal-based rather than API-based. The platform's role: prepare the documents and submission packages; the human banker (or admin) handles the actual portal submission.

### **DTC Integration**

DTC (Depository Trust Company) manages bond settlement. For bond issuance, the deal must obtain DTC eligibility and CUSIP. For ongoing administration, DTC handles payment distribution to bondholders. DTC integration is mature with well-documented procedures and APIs.

### **Document Signing**

DocuSign is the market standard for electronic signature on transaction documents. Has APIs for envelope creation, signer routing, status tracking. Integration is straightforward.

For certain documents (notarized documents, recorded mortgages), wet signatures or jurisdiction-specific electronic notarization may be required. The platform must handle the mixed workflow.

### **Accounting System Integration**

For modern obligors using cloud accounting (NetSuite, QuickBooks Online, Sage Intacct, Workday), API integration enables direct pull of financial data. APIs are documented and integration is straightforward but requires the obligor's consent and IT cooperation.

For obligors using legacy systems or those who decline API integration, the platform falls back to document upload — the obligor's CFO uploads monthly financials in PDF or Excel, and the platform's ingestion agent parses them. The fallback is less efficient but functional.

### **Banking Integration**

Limited banking integration is needed in the early phases — payments and wires happen through the trustee and the obligor's bank, not through the platform. Over time, deeper integration with the trustee's systems can enable real-time visibility into reserve balances, payment processing, and account activity.

### **Public Records Search APIs**

PACER (federal court records) — paid API with documented procedures

State court records — varies by state; some have APIs, others require manual lookup

OFAC, SDN, PEP screening — commercial services like Refinitiv World-Check, Dow Jones Risk Center, LexisNexis Bridger

Credit bureaus — Experian, Equifax, TransUnion via commercial integration

Bankruptcy and litigation databases — Westlaw, LexisNexis

### **Market Data Integration**

Bloomberg Terminal API — for market data, comparable transactions, pricing

Refinitiv (Eikon) — alternative to Bloomberg

DPC Data — specialized municipal market data

MMD (Municipal Market Data) — AAA muni yield curves

Treasury data — direct from Treasury.gov API

Sector-specific data — varies by sector; some via specialized providers (CoStar for CRE, STR for hospitality, etc.)

## **18.4 The Phased Build Sequence**

The full platform vision in Silos 1-17 is too large to build in one phase. The build sequence is phased to deliver value at each stage.

### **Phase 1: Operational Tool — Months 1-6**

Phase 1's goal: build a working tool that captures meaningful operating leverage on the first set of deals. The tool doesn't need to be elegant; it needs to be useful.

Document storage and organization — central place for all deal documents, organized by deal and document type

Working group communication — managed email, document distribution, status tracking

Basic financial modeling — Python-based pro forma and sizing models for the most common deal types

Simple document templates for the first 5-10 standard transaction documents

Basic dashboard for Sean and Josh to see active deals and status

Counterparty database with contact information and basic fee profiles

Manual rule application — Sean and Josh apply the structural decisions; the platform helps with execution

Phase 1 is not the full platform vision. It's a meaningfully better tool than what most middle-market bankers use, and it captures real value while the rest is being built.

### **Phase 2: Agent Foundation — Months 7-18**

Phase 2 introduces the AI agent layer. The platform starts making structural recommendations rather than just executing decisions.

Document ingestion agent — automated classification and parsing of uploaded documents

Re-underwriting agent — independent pro forma rebuild for the most common deal types

Sizing agent — multi-test sizing for the most common deals

Document drafting agent — automated first drafts of standard transaction documents

Rule library foundation — Layer 1 (public data) and basic Layer 3 (founder rules) for the most common sectors

EMMA integration — basic filing capability for continuing disclosure

Better dashboards and reporting

By the end of Phase 2, the platform is materially more capable than Phase 1. Routine deal types are largely automated; complex deals still require heavy founder involvement.

### **Phase 3: Full Workflow — Months 19-36**

Phase 3 builds out the complete workflow agent set.

All agents in Silo 17, deployed across all workflow stages

Full modeling engine with all formulas in Silo 15

Full rule library across all sectors

EDGAR integration for corporate bonds

Full disclosure automation

Covenant monitoring across full administered portfolio

Refunding identification across portfolio

Strong sector specialization across multifamily, healthcare, charter schools, higher ed, project finance, utility

By the end of Phase 3, the platform operates as the firm's primary tool for deal execution. New deals enter, move through the workflow with limited human intervention except at gateways, and close through automated processes.

### **Phase 4: Continuous Learning and Expansion — Months 37+**

Phase 4 is ongoing. The platform continuously expands:

Layer 2 pattern extraction at scale across all public data sources

Layer 3 rule expansion as deals are completed and lessons learned

Sector expansion into adjacent areas as the firm grows

New product types — refinancing windows, secondary trading capabilities, structured products

Integration with new counterparties and data sources

Continuous improvement of every agent's performance

## **18.5 Team Structure**

Building the platform requires the right team. Recommended structure by phase:

### **Phase 1 Team (Months 1-6)**

Tech lead / architect — senior engineer responsible for architecture and major decisions

1-2 backend engineers — Python and database work

Frontend developer — React or equivalent for the UI

Designer / UX (part-time) — interface design for banker and sponsor portals

DevOps / infrastructure (part-time) — cloud setup and operations

### **Phase 2 Team (Months 7-18)**

Add: AI engineer with experience building agent systems with Claude or similar models

Add: data engineer focused on EMMA/EDGAR ingestion and pattern extraction

Add: full-time DevOps and observability engineer

Add: financial modeling specialist to translate Silo 15 formulas into the modeling engine

Possibly: dedicated security engineer or part-time security consultant

### **Phase 3 Team (Months 19-36)**

Expand engineering team to 8-12 people

Add: dedicated product manager or business analyst

Add: sector specialists who can train the platform on sector-specific patterns

Add: compliance / regulatory specialist

## **18.6 Risk Considerations**

Risks the engineer must address from day one:

### **Regulatory Risk**

The platform handles regulated activities (municipal advisory services, securities disclosure, bondholder communication). The platform itself doesn't need to be registered as a regulated entity, but the activities it supports are regulated. Architecture must support compliance:

Audit trails on all advisory decisions

Document retention per SEC and MSRB requirements

Disclosure compliance baked into workflows

No automated trading or placement (those activities flow through the BD partner's registered platform)

Conflict of interest protections built into the agent system

### **Data Privacy and Security**

The platform handles sensitive sponsor and obligor data. Required protections:

Access controls limiting who can see what

Encryption of all sensitive data

Audit logs on access to sensitive data

Compliance with applicable privacy laws (state laws, sector-specific laws like HIPAA where healthcare data is involved)

### **Agent Reliability**

AI agents can produce confident-sounding outputs that are wrong. The platform must protect against this:

Human gateways at every high-stakes decision

Confidence thresholds — low-confidence outputs flag for human review

Comparison to precedent — agent outputs that deviate substantially from precedent flag for review

Continuous quality monitoring of agent outputs against actual outcomes

### **Vendor Dependence**

The platform depends on vendors (Claude API, AWS, EMMA, etc.). Vendor outages or policy changes could disrupt operations. Architecture should:

Avoid single points of failure where possible

Maintain operational continuity when vendors have outages (queued operations, cached data)

Monitor vendor relationships and pricing

### **Cybersecurity Risk**

Financial services platforms are targets. Aggressive cybersecurity posture is required from day one, not added later.

## **18.7 Budget Considerations**

Approximate budgets by phase (highly variable based on team location, structure, and specific scope):

### **Phase 1 (Months 1-6)**

Team cost: $1.5M-$3M (4-6 person team for 6 months at SF/NYC rates; lower elsewhere)

Infrastructure: $25K-$75K (cloud, basic SaaS tools)

Total Phase 1: $1.5M-$3M

### **Phase 2 (Months 7-18)**

Team cost: $4M-$8M (8-10 person team for 12 months)

Infrastructure and data: $200K-$500K (Bloomberg, Refinitiv, DPC Data, etc.)

Total Phase 2: $4M-$8.5M

### **Phase 3 (Months 19-36)**

Team cost: $9M-$18M (12-15 person team for 18 months)

Infrastructure and data: $400K-$1M

Compliance and security: $200K-$500K

Total Phase 3: $9.5M-$19.5M

### **Cumulative Total (3 years)**

Total platform investment over 3 years: $15M-$30M depending on team size and scope

This is a meaningful investment but reasonable for the value being created. With closed deal revenue ramping from year 1 onward (Phase 1 deals close while platform is being built), the platform investment is offset by operating revenue starting in year 1.

## **18.8 The Tech-Business Interface**

Critical operating principle: the engineer's job is to enable the business's operating model, not to dictate it. The business model (described in Silos 1-17) is the requirement; the platform is built to serve it.

Where business model and technical capability conflict, the resolution depends on the specific issue. Sometimes the technical capability defines what's possible (computational constraints, integration limitations). Sometimes the business requirement forces specific technical investments (regulatory requirements, sector-specific compliance). The dialogue between business and engineering is continuous.

This silo is the engineer's interface to the business model. Read Silos 1-17 to understand the business. Read this silo to translate business requirements into technical decisions. Iterate with the business team on edge cases.

## **18.9 Quick Reference — Silo 18**

### **Core Architecture**

**Tier 1 — Data Layer —** Deal database, counterparty database, document repository, public data warehouse, modeling engine database, rule library database, pattern data warehouse, administration data

**Tier 2 — Application Layer —** Agent runtime, workflow engine, document templating engine, modeling engine, rule library query engine, notification system, reporting engine

**Tier 3 — Integration Layer —** EMMA, EDGAR, rating agency portals, document signing, DTC, accounting integrations, banking integrations, public records search, market data

**Tier 4 — User Interface —** Banker portal, sponsor portal, counterparty portal, reporting dashboards, administration dashboard

### **Technology Stack**

Python 3.11+ as primary language; TypeScript/React for UI

PostgreSQL relational DB; cloud object storage for documents; Elasticsearch for search

AWS, GCP, or Azure cloud; Docker; Kubernetes as scale demands

Claude API for AI agents; custom orchestration to start

Jinja2 + python-docx for document templating

DocuSign for electronic signatures

OpenTelemetry for observability

### **Phased Build**

Phase 1 (Months 1-6): Operational tool — document storage, workflow management, basic modeling, simple templates, basic dashboards

Phase 2 (Months 7-18): Agent foundation — ingestion, re-underwriting, sizing, drafting agents; rule library foundation; EMMA integration

Phase 3 (Months 19-36): Full workflow — all agents, all formulas, full rule library, EDGAR, disclosure automation, full sector coverage

Phase 4 (Months 37+): Continuous learning — Layer 2 pattern extraction, rule expansion, sector expansion, product expansion

### **Team Scaling**

Phase 1: 4-6 person team

Phase 2: 8-10 person team

Phase 3: 12-15 person team

### **Budget Scaling**

Phase 1: $1.5M-$3M

Phase 2: $4M-$8.5M

Phase 3: $9.5M-$19.5M

Total 3-year platform investment: $15M-$30M

### **Key Risks**

Regulatory compliance — audit trails, disclosure compliance

Data privacy and security — access controls, encryption, sector-specific laws

Agent reliability — human gateways, confidence thresholds, precedent comparison

Vendor dependence — redundancy where possible, continuity planning

Cybersecurity — aggressive posture from day one