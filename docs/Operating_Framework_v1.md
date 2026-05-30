**NEST ADVISORS**

**OPERATING FRAMEWORK**

Version 1

*A Digital Commercial Investment Bank*

Strategic Spine, Operating Manual, and Platform Blueprint

**Sean Gilmore, Co-Founder**

**Josh Edwards, Co-Founder**

*Internal Operating Document — Confidential*

# **PREFACE**

This document is the Nest Advisors Operating Framework v1. It establishes the firm's structural spine and operating manual. Nest Advisors is a boutique digital investment bank co-founded by Sean Gilmore and Josh Edwards. The firm's product is bond lending — origination, structuring, placement, and decades of administration of middle-market bonds. The firm operates as two principals plus an agent workforce, permanently: the AI agents perform the operational layer mirroring the institutional roles role-for-role; the two founders perform the relationship and judgment layer. The platform is the moat. Hiring additional principals or staff is the failure mode the firm is architecturally designed to avoid.

The document serves multiple readerships simultaneously. The human team reads it to absorb the firm's design, vocabulary, and operating manual. The AI agent workforce consumes it as the structured knowledge base for operational execution. The engineering team uses it as the platform blueprint. Two audiences, both served by the same document.

The document is organized in nine parts. Part 1 (Executive Summary) frames the firm's positioning, the AI workforce architectural principle, the hybrid operating model, and the phase roadmap. Part 2 (The Glossary) provides the bond market vocabulary in plain English with real-world examples, organized topically across seventeen sections. Part 3 (Bond Operations) is the existing eighteen-silo operational deep-dive on bond mechanics, lifecycle, documents, covenants, reserves, optionality, credit enhancement, tranching, pricing, refundings, and risk rating — the operator's field guide. Part 4 (The Organizational Structure) describes the firm's full organizational structure — the Orca digital C-suite plus fourteen operational desks, each mirroring an institutional counterpart with specified agent roles, handoffs, and platform component mappings.

Part 5 (The Sub-Industry Silo Framework) describes how vertical specialization emerges from deal flow — through platform overlay capability, not human specialist hires. Part 6 (The EMMA and Public Records Ingestion Strategy) describes the platform's intelligence layer. Part 7 (The Product Menu and Roadmap) describes the bond lending product and the capability-deepening roadmap. Part 8 (The Technical Stack) describes existing platform state and what this framework adds structurally, with technical buildout details deferred to a future iteration. Part 9 (Appendices) provides the decision tables, NAICS cross-reference, regulatory citation quick reference, counterparty reference, and the universal credit policy framework. The document closes with the structured prompt for Claude Code ingestion that converts this framework into engineering directives for platform buildout.

What this v1 explicitly defers to subsequent iterations: tech stack cost analysis, API call volume modeling, detailed financial modeling methodology, coding lift estimation, and the technical implementation specification for the commercial card construction draw platform (pending patent counsel review). Each deferral is about deepening the bond capability, not about adding new product lines. Nest's product is bond lending; the firm's identity is two principals plus the platform; the deferred items make the bond lending capability deeper, not the firm broader.

This document is internal and confidential. It contains the firm's accumulated structural and operating intelligence and is not for external distribution.

*— Sean Gilmore and Josh Edwards*

*Co-Founders, Nest Advisors*

# **CONTENTS**

**PART 1** Executive Summary

**PART 2** The Glossary — Bond Market Vocabulary

**§1** The People and Roles

**§2** Bond Anatomy

**§3** Tax Treatment

**§4** Tax-Exempt Categories

**§5** Tax-Exempt Mechanics

**§6** Bond Structure by Security

**§7** Amortization Patterns

**§8** Regulatory Pathways

**§9** The Documents

**§10** Calls, Puts, and Optionality

**§11** Reserves and Waterfall

**§12** Covenants and Defaults

**§13** Credit Enhancement

**§14** Tranching and Capital Stack

**§15** Pricing and Yield Concepts

**§16** Rating Categories

**§17** Refundings, Restructurings, Workouts

**PART 3** Bond Operations — The Operator's Field Guide

**Silo 1** The Anatomy of a Bond

**Silo 2** The Players

**Silo 3** The End-to-End Workflow

**Silo 4** The Documents

**Silo 5** The Fee Architecture

**Silo 6** Calls, Puts, and Optionality

**Silo 7** Covenants and Compliance

**Silo 8** Reserves and Waterfalls

**Silo 9** Credit Enhancement

**Silo 10** Tranching and Layering

**Silo 11** Pricing and Spread Mechanics

**Silo 12** Post-Closing Administration

**Silo 13** Refundings, Restructurings, and Workouts

**Silo 14** Risk Rating, LGD, and Loss Management

**Silo 15** The Modeling Engine

**Silo 16** Rule Library Architecture

**Silo 17** Agent Specifications by Workflow Stage

**Silo 18** Tech Stack Wire-Up

**PART 4** The Organizational Structure

**§4.1** The Leadership Layer — Founders and Orca

**§4.2** The Bond Desk

**§4.3** The Credit Underwriting Desk

**§4.4** The Structuring Desk

**§4.5** The Rating Desk (Moody's and S&P Mirror Agents)

**§4.6** The Documents Desk

**§4.7** The Legal and Compliance Desk

**§4.8** The Trustee Liaison Desk

**§4.9** The Construction Risk Management Desk

**§4.10** The Insurance, Surety, and Credit Enhancement Desk

**§4.11** The Placement Desk

**§4.12** The Operations Desk

**§4.13** The Surveillance Desk

**§4.14** The Business Development Organization (with Eagle Eye)

**§4.15** Where Humans Plug In

**PART 5** The Sub-Industry Silo Framework

**PART 6** The EMMA and Public Records Ingestion Strategy

**PART 7** The Product Menu and Roadmap

**PART 8** The Technical Stack

**PART 9** Appendices

**App. A** Bond Type Decision Table

**App. B** Rating Movement Table

**App. C** NAICS Cross-Reference

**App. D** Regulatory Citation Quick Reference

**App. E** Counterparty Reference

**App. F** Universal Credit Policy Framework

**PART 10** The Claude Code Ingestion Prompt

# **EXECUTIVE SUMMARY**

Nest Advisors is a digital commercial investment bank. The firm's lead financing product is bond lending — origination, structuring, placement, and 30-year administration of middle-market bonds across investment grade and select non-investment grade categories, in both tax-exempt and taxable formats, for borrowers across the sectors where institutional bond financing makes economic sense.

Nest is co-founded and led by Sean Gilmore and Josh Edwards. Sean spent eighteen years in middle-market and investment banking, including fourteen years at JPMorgan where he was promoted to Executive Director and trained in the firm's investment banking discipline at West Coast Banking School. Josh brings complementary expertise across business development, technology architecture, and strategic deal structuring. Together, the founders bring deep institutional banking experience plus the conviction that the operational model of the institutional bond market is solvable through deliberate AI workforce design.

## **What Nest Is — The Core Thesis**

The middle-market bond market is enormous, persistent, and chronically underserved at the institutional quality level. Several hundred billion dollars of annual issuance flows through the middle-market category, defined loosely as deals between approximately $5 million and $300 million in par. The elite institutional firms — JPMorgan, Morgan Stanley, Goldman Sachs, Bank of America, Wells Fargo — focus their middle-market coverage selectively. They participate where deal economics and relationship leverage support their cost structure. They leave significant volume on the table: deals below their minimum size, sectors outside their primary coverage, structures outside their conventional templates, and time windows when their bankers are deployed elsewhere.

Below the elite institutional firms, a layer of regional and specialty firms serves the bulk of middle-market issuance. These firms work hard. They produce real deals. They also operate with the same fundamental cost structure as the institutional firms — senior bankers, supporting bankers, analysts, operations staff — applied at smaller deal scales. Their margins are tighter. Their capacity is constrained by headcount. Their senior bankers are buried in operational grind, leaving limited time for the relationship and sourcing work that grows the franchise.

Nest is built on the observation that the operational layer of bond banking — credit memos, modeling, document drafting, working group coordination, post-closing administration, covenant monitoring, refunding identification, surveillance — is highly amenable to AI execution. The work is structured, rules-based, document-intensive, and pattern-rich. Current AI systems already perform many of these tasks at quality levels that rival human bankers, and the gap is closing rapidly. The work is not what makes a banker a banker. What makes a banker a banker is the relationship layer, the sourcing layer, the judgment under uncertainty, the negotiation, the board work, the actual selling of bonds. Those functions remain human. Everything else, properly designed, can run through AI.

**THE FIRM'S CORE THESIS —** Nest deploys AI agents into operational roles that mirror the structure of real investment banks, rating agencies, trustee banks, and credit enhancement providers. The agents execute the operational grind that consumes most of a traditional banker's time. The human founders and any senior team members hired over time provide the relationship, sourcing, judgment, and execution functions that AI cannot perform. The firm operates at institutional quality with a cost structure no traditional firm can match.

## **The Architectural Principle**

Investment banks, rating agencies, trustee banks, and credit enhancement providers have evolved their organizational structures over many decades. The roles, the handoffs, the workflow sequences, the counterparty interfaces — none of this is arbitrary. It reflects how the work actually decomposes. A credit underwriter at a major bank does specific work. A senior analyst at Moody's does specific work. An operations officer at U.S. Bank's trustee group does specific work. Each role has a defined scope, defined inputs, defined outputs, and defined interfaces with adjacent roles.

Nest's organizational structure mirrors these institutional structures role-for-role. The firm is not inventing new roles or new workflows. It is taking the organizational structures that the bond market has already evolved and deploying them with AI agents in operational positions and humans in leadership and judgment positions. The agent layer mirrors what humans do at JPMorgan's middle-market investment banking group. The credit underwriting layer mirrors what humans do at a bank's credit organization. The rating support layer mirrors how investment banks interface with Moody's and S&P methodologies. The documents layer mirrors how bond counsel firms organize. The placement layer mirrors how syndicate desks operate. The operations layer mirrors how trustee banks administer outstanding portfolios.

This mirroring approach produces three structural advantages. First, the agents fit naturally into existing industry workflow because the workflow is what they are designed around. Second, the agents interface cleanly with external counterparties because the counterparty interfaces are role-to-role rather than human-to-AI. Third, the regulatory positioning is clean because regulators recognize the organizational structure as the standard institutional model.

## **Bond Lending as the Lead Product**

Nest's lead financing product is bond lending. The firm originates, structures, places, and administers bonds across the middle-market spectrum. The product menu includes:

* Tax-exempt 501(c)(3) bonds for qualifying nonprofit borrowers (hospitals, senior living, charter schools, certain other nonprofits)
* Tax-exempt private activity bonds for qualifying private projects (affordable multifamily housing, exempt facilities under IRC §142)
* Governmental purpose bonds for state and local government issuers
* Investment grade taxable corporate bonds for middle-market corporate borrowers
* Select non-investment grade corporate bonds for sponsor-backed borrowers and special situations
* Senior secured project finance bonds for stand-alone projects (real estate-backed, infrastructure, data centers, specialty assets)
* Refundings of existing bond debt across all categories

Sector coverage is universal at launch. The firm does not pre-commit to specific verticals. As deal flow concentrates in particular sectors over time, the firm deploys silo-specialized capability for those sectors. Verticals emerge from volume, not from marketing decisions.

## **The Commercial Card Construction Draw Platform**

Within the firm's construction administration capability, Nest deploys a commercial card platform that handles construction draws on bond-financed projects. Rather than the traditional wire-based draw mechanism, construction proceeds flow through controlled commercial card spending. The platform provides operational advantages — real-time transaction visibility, automatic budget reconciliation, automated change order tracking, lien protection through merchant-level transaction data — and produces interchange rebate revenue as a secondary income stream alongside the firm's structuring and administration fees.

The construction card platform is a smart adjacent product, not a standalone business. It exists because Nest is already performing construction administration on every construction-period bond deal. The card platform monetizes work that traditional construction lenders perform but do not monetize. At portfolio scale, the rebate economics provide a non-fee-dependent revenue stream that supports firm bootstrap funding, regulatory capital, licensing costs, and operational reserve build-up during the firm's early growth phase.

**Strategic Note on the Construction Card Platform:** The specific technical implementation of the platform — transaction matching against indenture-defined budget categories, integration with trustee disbursement authorization, lien waiver tracking automation, sponsor equity verification logic — is treated as confidential and is not specified in this document. Implementation specification is pending review by patent counsel. References in this document are limited to the strategic and economic framing.

## **The Operating Model — Two Principals Plus the Agent Workforce**

Nest operates as a hybrid firm with two principals as the permanent human team. The agent workforce performs the operational layer: credit memos, modeling, structuring analysis, document drafting, working group coordination, regulatory compliance, ongoing administration, surveillance. Sean and Josh perform the relationship layer: client sourcing, sponsor relationship cultivation, board representation, judgment at exception thresholds, key counterparty relationships, the actual selling of bonds to institutional buyers, and strategic direction.

The two-principal structure is deliberate and permanent. The firm's economic identity depends on it. Adding more humans recreates the cost structure that traditional firms accept as the price of doing business. Nest exists to avoid that price. The agents perform the work that traditional firms hire teams to perform — credit underwriting, structuring, rating advisory, document production, placement coordination, operations, surveillance — at operational quality matching the institutional standard but at near-zero marginal cost per deal.

This produces an economic profile that traditional firms cannot match. Industry-standard middle-market firms spend 60-70% of revenue on personnel. Nest's cost structure substitutes platform compute, data feeds, and software development for personnel costs. The firm's projected cost structure runs 25-35% of revenue on operational expenses (essentially platform costs plus the two principals' compensation), producing net margins that no traditional firm operating at our scale can approach. Two principals generating institutional-quality deal volume produce principal-level economics that scale with deal flow rather than diluting across an expanding team.

## **What's Changed in the Firm's Strategic Thinking**

This document represents an evolution from earlier Nest planning materials. The earlier materials assumed a more conventional firm structure — a small senior banker team with technology tools supporting their work. The evolution to the current architecture happened through deliberate examination of how the bond market actually decomposes operationally and what AI is capable of executing at current capability levels.

The core shift is the recognition that AI is already performing much of the operational work that consumes traditional bankers' time. Credit memos that took skilled credit underwriters a full week to produce in years past are now produced in minutes by AI systems. Financial models that took analyst teams days to build are produced in hours. Document drafts that took associates and senior associates substantial blocks of time are produced rapidly with high accuracy. The trajectory of these capabilities is steeply improving and the gap between AI and human execution continues to narrow on operational tasks.

The implication is that the institutional model — large human teams executing operational work — is structurally inefficient relative to a model where AI executes operational work and a small number of humans focus exclusively on the relationship and judgment layer. Traditional firms cannot restructure to this model. Their senior bankers are the firm's relationship and revenue base; reducing that base loses the franchise. Their cost structure is locked into team headcount; cutting headcount triggers credit-stealing dynamics and political instability. Nest, building from a clean sheet with the architecture deliberate from the start, captures the economic advantage of the two-principal model without the legacy costs of the traditional firm.

The earlier materials also assumed a roadmap that scaled toward a multi-product, multi-team firm. The current architecture rejects this scaling path. The two-principal structure is the long-term identity, not the starting point. Growth comes from doing more bond deals more profitably within the two-principal structure, with the agent workforce absorbing operational scaling. Capability deepening replaces scope expansion as the firm's growth model. Capacity expands through platform investment, not through hiring.

The earlier materials also assumed Nest would specialize in specific verticals from launch. The current architecture defers vertical specialization. The firm goes where deal flow goes. Sub-industry silos emerge from actual deal volume rather than from upfront marketing decisions. When silos emerge, the response is platform capability deployment, not human specialist hiring. This empirical approach allocates platform investment based on actual market behavior rather than founder assumptions.

## **The Roadmap — Capability Deepening, Not Scope Expansion**

Nest's roadmap is about deepening the bond capability, not about adding new product lines. The current product is bond lending in the middle-market spectrum across the categories listed above. The roadmap deepens this product through platform learning from deal flow — Mirror Agents calibrated to more sectors, template libraries expanded with each new deal type, intelligence layer refined through each closed deal. The platform compounds in value as deal experience accumulates.

The firm is not building toward a multi-product platform that displaces full-service banks. The firm is building toward maximum operational leverage in bond lending — two principals doing what a 40-person regional firm does, generating principal-level economics that no traditional firm can match at the same headcount. Capacity expands through platform capability rather than headcount; revenue expands through deal volume and deal quality at constant two-principal cost structure.

This document focuses on operationalizing the bond capability against the firm's organizational structure. Subsequent documentation iterations will refine the bond capability as platform learning accumulates. The firm explicitly does not plan additional product lines, additional principal hires, or transition toward a traditional firm scale model. The two-principal permanent model with a deepening platform is the long-term identity.

## **This Document's Scope**

This document is the Nest Operating Framework v1. It serves several functions simultaneously: it is the firm's foundational ethos document; it is the training material for the two principals; it is the shared knowledge base for the AI agent workforce; and it is the operational blueprint that the platform implements against. Two readerships consume it — the principals absorbing the firm's design and AI agents consuming the structured specifications — and it is written to serve both.

The document includes the bond market glossary in plain English with real-world examples (Part 2), the existing eighteen-silo operational deep-dive on bond mechanics (Part 3 — the operator's field guide), the complete organizational structure of the firm (Part 4 — Orca digital C-suite plus fourteen operational desks each mirroring an institutional counterpart with specific agent roles), the sub-industry silo framework (Part 5), the EMMA and public records ingestion strategy for the platform's intelligence layer (Part 6), the product menu and capability-deepening roadmap (Part 7), the technical stack mapped to existing platform components (Part 8), and appendices with decision tables, NAICS cross-reference, regulatory citations, counterparty reference, and the universal credit policy framework (Part 9). The document ends with the structured prompt for Claude Code ingestion.

What this v1 explicitly defers to subsequent iterations: tech stack cost analysis, API call volume modeling, detailed financial modeling methodology, coding lift estimation, and the technical implementation specification for the commercial card construction draw platform (pending patent counsel review). These items are about deepening Phase 1 capability, not about new product lines — Nest's product line is and remains bond lending.

This Operating Framework v1 provides the firm's spine and operating manual. The existing Pass 1 Bible (Part 3 of this document) remains as the operational deep-dive on bond mechanics, lifecycle, documents, covenants, reserves, optionality, credit enhancement, tranching, pricing, refundings, and risk rating. The two work together — this Operating Framework provides the firm's structural identity; the Pass 1 silos provide the operational field guide.

# **THE GLOSSARY**

This section is the bond market vocabulary translated into plain English. Every term you'll encounter in the rest of this document — and in every bond deal Nest works on — is defined here with a real-world example. The organization is topical, not alphabetical. Terms that go together sit next to each other. When you read about Rule 144A, the next thing you read about is Rule 506, because they're siblings, not Auditor.

Two audiences read this section. The human team at Nest reads it cover to cover to absorb the vocabulary, and refers back to it any time a term feels fuzzy. The AI agents consume it as the shared knowledge base for what every term means. Same content. Two readerships. Both served by the same plain-English precision.

**THE GLOSSARY PRINCIPLE —** Plain English first. Technical detail second. Real-world example always. No jargon is ever used to explain other jargon. If a term needs another term to define it, that other term is defined first or cross-referenced clearly.

## **Section 1 — How Money Moves: The People and Roles**

Every bond deal involves a defined set of counterparties, each with a specific job. Before we get into the bond itself, you need to know who's in the room and what each one does.

### **The Borrower (also called the Obligor)**

The actual entity that needs the money and will pay it back. If a senior living developer is building a new project and wants to borrow $75 million, the developer is the borrower. The bond market often calls the borrower the 'obligor' because it's the one who 'owes' the obligation to repay. Same thing, different word. Throughout this document, when we say 'obligor,' we mean the actual borrower — the one whose cash flow services the bond.

Real example: Sunset Ridge Senior Living, LLC is the obligor. They borrowed $75 million through tax-exempt bonds to build a CCRC (continuing care retirement community). Their entry-fee receipts and monthly service fees pay back the bonds over 30 years.

### **The Issuer**

The legal entity whose name appears on the face of the bond. In a corporate deal, the issuer is the company itself — Coca-Cola issues Coca-Cola bonds. In a tax-exempt 'conduit' deal (most municipal bonds for private borrowers), the issuer is a government entity that issues the bonds on the borrower's behalf and immediately loans the proceeds to the actual borrower. The issuer doesn't take credit risk in a conduit deal — they're a legal pass-through that enables tax-exempt access.

Real example: For Sunset Ridge's bonds, the issuer is the Iowa Finance Authority (a state government entity). The IFA issues the bonds, loans the proceeds to Sunset Ridge, and the bondholders get tax-exempt interest because a government entity is technically the issuer.

### **The Conduit Issuer**

A specific type of issuer used in tax-exempt conduit financings. It's a government entity (a state housing finance agency, a county industrial development authority, a state health facility authority, etc.) that exists specifically to issue tax-exempt bonds for private borrowers under IRS rules. The conduit issuer doesn't pay the bonds back. The actual borrower does, through a loan agreement with the conduit. The conduit's role is legal access to tax exemption.

Real example: The Pennsylvania Higher Education Facilities Authority is a conduit issuer. A private nonprofit university in Pennsylvania can issue tax-exempt bonds through PHEFA. PHEFA issues the bonds; the university repays them. Bondholders get tax-free interest because PHEFA is a government entity.

### **The Trustee**

The bank that holds the bond paperwork and processes the payments for the bondholders' benefit. Think of the trustee as the operational middle-man between the borrower and the thousands of bondholders. The borrower sends debt service payments to the trustee; the trustee distributes the payments to the bondholders. The trustee also holds the bond reserves (the cash cushions the borrower has to maintain), processes construction draws, receives compliance certificates, and enforces the bond's terms if the borrower defaults.

Real example: U.S. Bank, BNY Mellon, Wilmington Trust, UMB Bank, and Zions Bank are the major trustee banks for middle-market deals. They charge an acceptance fee of $5,000-$15,000 at closing plus an annual administration fee of $5,000-$12,000 plus per-transaction fees.

### **The Paying Agent**

The function (usually performed by the trustee at the same bank) that actually makes the periodic interest and principal payments to bondholders. The paying agent receives the borrower's payment, looks at the bondholder registry, and disburses cash to each bondholder on the payment date. Most of the time, paying agent and trustee are the same entity — the bank just plays both roles.

### **The Registrar**

The function that maintains the list of who owns the bonds. When bonds transfer in the secondary market, the registrar updates the list. Like the paying agent, the registrar is usually the same entity as the trustee. In modern practice, most bonds are held in 'book-entry' form through DTC (see below), and the registrar tracks ownership at the institutional account level rather than the individual bondholder level.

### **The Bondholder (also called the Investor)**

The actual owner of the bond — the one who lent the money. For middle-market bond deals, bondholders are almost always institutional investors: life insurance companies, bond mutual funds, pension funds, bank portfolios, hedge funds, and specialty credit funds. Retail investors (individual people buying bonds through a brokerage) participate in some larger public offerings but rarely in middle-market private placements.

Real example: A typical $75 million senior living bond might be bought by 3-6 institutional buyers: two life insurance companies (taking $25-40 million combined), one or two bond funds, and possibly a bank portfolio. Each buyer takes a piece based on their investment mandate.

### **The Broker-Dealer (BD)**

The FINRA-registered firm with the regulatory authority to sell securities to investors. The BD is the salesperson. They buy bonds from the issuer at one price and resell them to institutional buyers at a slightly higher price. The difference between the two prices is the BD's compensation, called the 'underwriter discount.' Without a BD, the bonds can't legally be sold to investors. Selling securities is a regulated activity that requires the BD's license, supervisory infrastructure, and registered personnel.

Real example: For middle-market deals, the BD is typically a regional firm like Piper Sandler, Stifel, Hilltop Securities, Raymond James, BOK Financial, or a specialty firm focused on the relevant sector. The underwriter discount on a middle-market deal typically runs 1.0%-2.5% of the par amount.

### **The Underwriter**

The role the broker-dealer plays when they buy the bonds from the issuer onto their own balance sheet and then resell them to investors. The underwriter takes inventory risk — they own the bonds for a brief period between the issuer pricing the deal and the bonds reaching investors. If something goes wrong during that window, the underwriter eats the loss. Underwriter and broker-dealer are often used interchangeably, but technically 'underwriter' refers to the specific function of taking the bonds onto the balance sheet.

### **The Placement Agent**

The same broker-dealer playing a slightly different role: rather than buying the bonds onto their balance sheet and reselling, the placement agent matches buyers to issuers directly. The bonds go straight from issuer to bondholder; the placement agent gets a fee for arranging the match. Placement agent is the more common role in private placements (deals sold under Rule 144A or Regulation D). Underwriter is more common in public offerings.

### **The Syndicate**

A group of broker-dealers working together to sell a large bond issuance. The 'syndicate manager' is the lead BD, who coordinates the group and handles the bulk of the work. 'Co-managers' are the other BDs in the group, who help with placement but defer to the lead on strategy. Middle-market deals often have a single BD with no syndicate. Larger deals (typically $100M+ in middle-market terms) may use a syndicate of 2-4 firms.

### **The Financial Advisor / Municipal Advisor**

The firm that represents the issuer's interests in the deal. This is what Nest is. The FA (also called 'MA' when registered as a Municipal Advisor under SEC rules) does the structuring work, negotiates with counterparties, manages the working group, coordinates the rating engagement, and provides post-closing administration. The FA is a fiduciary to the issuer — they're legally required to act in the issuer's best interest. This is structurally different from the BD, which is the issuer's counterparty in the bond sale (not their fiduciary).

Real example: Nest is the FA on every deal it works. Nest registers with the SEC and MSRB as a Municipal Advisor. Nest's structuring fee is paid by the obligor from bond proceeds at closing, plus a share of the underwriter discount through the BD partnership.

### **Bond Counsel**

The law firm that drafts the bond documents and issues the legal opinion at closing. The opinion certifies that the bonds are validly issued, that bondholders' rights are enforceable, and (for tax-exempt bonds) that the interest is exempt from federal income tax. Without bond counsel's opinion, the bonds can't be sold.

Real example: Major bond counsel firms include Orrick Herrington & Sutcliffe, Hawkins Delafield & Wood, Squire Patton Boggs, Norton Rose Fulbright, Kutak Rock, Chapman and Cutler, and Mintz. Bond counsel fees on a middle-market deal typically run $75,000-$250,000.

### **Disclosure Counsel**

A separate law firm (on larger deals) that reviews the Official Statement — the disclosure document sent to bondholders — for completeness and accuracy. Disclosure counsel issues a separate legal opinion certifying that the OS doesn't contain material misstatements or omissions. On smaller deals, bond counsel often plays both roles.

### **Sponsor's Counsel**

The obligor's general corporate counsel. They handle the obligor-side documents: the loan agreement with the conduit issuer, the security documents (mortgage, security agreement), the regulatory agreement for tax-exempt compliance. Sponsor's counsel works for the obligor, not for the bond transaction.

### **Underwriter's Counsel**

The broker-dealer's law firm. They represent the BD's interests in the deal, particularly around securities law compliance (was the offering done properly? are the disclosures adequate?) and the Bond Purchase Agreement (the contract under which the BD buys the bonds from the issuer).

### **Trustee's Counsel**

The trustee bank's law firm. They review the indenture from the trustee's perspective (is the trustee's job clearly defined? are the trustee's fees and protections adequate?) and represent the trustee in any disputes.

### **The Rating Agency**

An independent firm that analyzes the bond's credit characteristics and assigns a letter-grade rating (AAA, AA, A, BBB, etc.) that tells investors how risky the bond is. The rating drives the bond's pricing — better rating means tighter spread to benchmark, means lower coupon, means lower cost of funds for the borrower. Rating agencies use published methodologies that determine ratings based on financial metrics, structural features, sector dynamics, and management quality.

Real example: The major rating agencies are Moody's Investors Service, S&P Global Ratings, Fitch Ratings, Kroll Bond Rating Agency (KBRA), and DBRS Morningstar. Rating fees on a middle-market deal typically run $75,000-$200,000 per agency for the initial rating, plus $15,000-$50,000 per agency for annual surveillance.

### **NRSRO (Nationally Recognized Statistical Rating Organization)**

The official SEC designation for a rating agency. To be used in regulatory contexts (bank capital requirements, insurance company portfolios, money market fund eligibility), a rating must come from an NRSRO-designated agency. The five NRSROs that dominate the US market are the rating agencies named above. There are several smaller NRSROs that operate in specific niches.

### **The Feasibility Consultant**

A sector specialist firm that produces the 'feasibility study' supporting the bond. The feasibility study analyzes whether the project will generate enough cash flow to service the debt — the demand for the service, the competitive landscape, the operating projections, the absorption schedule. The rating agencies require an independent feasibility study for most new construction deals.

Real example: For senior living, the major feasibility consultants are Kaufman Hall, Plante Moran, Ziegler, CliftonLarsonAllen, and SmithGroup. For affordable housing, Novogradac. For hospitals, Kaufman Hall again, plus Crowe and BDO. Feasibility study fees range from $50,000 to $250,000 depending on project complexity.

### **The Market Study Consultant**

Sometimes the same firm as the feasibility consultant, sometimes separate. The market study analyzes the project's local market — demographics, competition, demand, pricing trends — and supports the demand assumptions in the feasibility study.

### **The Construction Monitor / Independent Engineer**

On construction deals, an engineering or construction consulting firm that certifies construction progress before each draw is released. The construction monitor inspects the site, reviews the contractor's pay applications, verifies that the work claimed has actually been performed, and signs off on the draw request before the trustee releases funds. Without the construction monitor's certification, the construction draw doesn't happen.

### **The Verification Agent**

Only used in refundings (when new bonds replace old bonds). A CPA firm that verifies the refunding escrow — the account that holds government securities sufficient to pay off the old bonds. The verification agent confirms mathematically that the escrow's cash flows match the old bonds' debt service. Without verification, bond counsel can't issue the legal opinion that the refunding is properly defeased.

Real example: Common verification agents include Robert Thomas CPA, Causey Demgen & Moore, and Bingham Arbitrage Rebate Services. Fees typically $15,000-$40,000 per refunding.

### **The Escrow Agent**

In refundings, the trustee (or sometimes a separate bank) holds the refunding escrow account. The escrow agent is the bank holding the securities that will pay off the old bonds. Usually the same bank as the trustee.

### **The Auditor**

The obligor's regular CPA firm. For bond purposes, they provide a 'comfort letter' confirming the financial statements in the Official Statement, plus a 'consent letter' allowing their audit opinion to be referenced in the OS. Auditor fees for the bond-specific work are typically $15,000-$50,000 incremental to the standing audit relationship.

### **The Insurance Broker**

On real estate-backed deals (most senior living, multifamily, hospitality, real estate-collateralized C&I), the broker who places the property insurance, liability insurance, and (during construction) builder's risk insurance. The broker ensures that the obligor's insurance coverage meets the indenture's requirements throughout the bond's life.

### **The Surety**

An insurance company that issues 'surety bonds' — financial guarantees that back specific obligations within a bond transaction. Common surety bonds include performance bonds (backing the construction contractor's performance) and payment bonds (backing the contractor's payment of subcontractors). Some bond deals also use surety wraps as credit enhancement — see Section 13.

### **The Bond Insurer / Monoline Insurer**

An insurance company that specializes in financial guaranty insurance. They insure the bond's payment obligation — if the obligor defaults, the bond insurer pays the bondholders. In exchange, the bond insurer takes a fee (paid at closing as part of COI) and the bond gets the insurer's rating (typically AA or AAA) rather than the obligor's underlying rating.

Real example: Active bond insurers today include Assured Guaranty, Build America Mutual (BAM), and Berkshire Hathaway Assurance. The monoline insurance market shrank significantly after the 2008 financial crisis but remains a relevant credit enhancement option for some middle-market muni deals.

### **The Remarketing Agent**

Only used in variable-rate bond structures (VRDOs — see Section 7). The remarketing agent is a broker-dealer who resets the bond's interest rate on each reset date (typically weekly) and places the bonds with new buyers when existing bondholders 'put' the bonds back. The remarketing agent's fee is typically 10-25 basis points of par per year.

### **The Dissemination Agent**

A firm that handles the obligor's continuing disclosure filings with EMMA (see Section 8). Many trustee banks offer this service as part of their administration. Specialized firms (Digital Assurance Certification, Lumesis, BLX) also provide dissemination agent services. The dissemination agent ensures that annual reports, material event notices, and other required filings are filed on time and in the correct format.

## **Section 2 — The Bond Itself: Basic Anatomy**

Now that you know who's involved, let's get into what a bond actually is. A bond is a contract that says: 'I (the borrower) promise to pay you (the bondholder) a defined amount of money on a defined schedule, secured by defined collateral, with defined protections.' The terms below are the pieces of that contract.

### **Par (also called Face Value)**

The face value of the bond — the amount the borrower owes at maturity. A $50 million bond has $50 million of par. The principal payments over the bond's life (plus a final balloon payment if there is one) total to the par amount. Par is the number that everything else is measured against: covenants are expressed as percentages of par, fees are quoted as basis points of par, reserves are sized as percentages of par.

### **Coupon**

The interest the bond pays. Expressed as an annual percentage rate of par. A 5% coupon on a $1,000 par bond pays $50 per year in interest, typically split into two semi-annual payments of $25 each. The coupon is set at pricing (when the bond is sold to investors) and stays fixed for the bond's life on fixed-rate bonds. On variable-rate bonds, the coupon resets periodically.

### **Coupon Rate**

Same thing as coupon. The percentage rate the bond pays. When we say 'a 5% coupon' or 'a coupon rate of 5%,' we mean the same thing.

### **Interest**

The actual dollar amount paid to bondholders periodically. On a $50 million bond at 5% coupon paid semi-annually, the interest payment is $1.25 million every six months ($50M × 5% / 2). Interest is the bondholder's compensation for lending the money.

### **Principal**

The original amount of the loan — the par amount. When the bond 'amortizes' (pays down principal over time), each principal payment reduces the outstanding balance. By maturity, all principal has been repaid plus any final balloon.

### **Maturity**

The date the bond is fully paid off. A 30-year bond issued today matures 30 years from now. The maturity date is the latest date the borrower owes anything on this bond. Most bonds have call provisions that allow the borrower to retire the bond earlier (see Section 10 on optionality), but absent calls, maturity is the final repayment date.

### **Tenor**

Same idea as maturity but expressed as a duration rather than a date. 'A 30-year tenor' means the bond runs for 30 years from issuance. Tenor and maturity are used interchangeably most of the time.

### **Amortization (Overview)**

How the bond's principal gets paid down over its life. Different bond structures amortize differently. Some pay all principal at maturity in a single balloon ('bullet'). Some pay principal in equal annual installments ('serial'). Some make level total payments combining principal and interest like a mortgage ('level debt service'). Different patterns suit different deal types — see Section 7 for the full treatment of amortization patterns.

### **Premium Pricing**

When the bond sells for more than its par value. A bond with a $1,000 par that sells for $1,025 has 'priced at premium.' Premium pricing happens when the bond's coupon is higher than what the market currently demands for the credit. The bondholder pays more upfront and the bond's effective yield is lower than its stated coupon. Premium structures attract institutional buyers (especially life insurance companies) because of their book-yield accounting treatment.

Real example: A 5% coupon bond priced at $1,025 has an effective yield to maturity around 4.85%. The premium is the difference between $1,025 and $1,000 — $25 per bond. On a $50 million deal priced at the same premium, the issuer receives roughly $51.25 million from bondholders for the $50 million face amount.

### **Discount Pricing**

When the bond sells for less than its par value. A $1,000 par bond selling for $975 has 'priced at discount.' Discount pricing happens when the bond's coupon is lower than current market yield. Less common in modern middle-market practice because discount bonds have tax complications (Original Issue Discount, or OID, is taxed annually) and a narrower buyer pool.

### **Par Pricing**

When the bond sells for exactly its par value. A $1,000 par bond selling for $1,000. Par pricing happens when the coupon equals current market yield. Simpler than premium or discount but typically prices 5-15 basis points wider than premium structure on long-dated investment-grade bonds.

### **Accrued Interest**

Interest that has been earned but not yet paid. Between coupon payment dates, interest accrues daily. If a bond trades between coupon dates, the buyer pays the seller the accrued interest as part of the trade. Calculation conventions vary (30/360, actual/360, actual/actual) — the indenture specifies which convention applies.

### **CUSIP**

A unique 9-character identifier for each specific bond. CUSIP stands for Committee on Uniform Security Identification Procedures, the body that assigns the identifiers. Every distinct bond — meaning every distinct maturity within a deal — gets its own CUSIP. A deal with 15 different maturity dates has 15 CUSIPs.

### **Bond Certificate**

The physical or electronic record of bond ownership. In modern practice, most bonds are 'book-entry' (electronic) rather than physical certificates.

### **Registered Bond vs Bearer Bond**

Registered bonds have the owner's name on file with the registrar. When the bond pays interest, the paying agent looks up the owner and sends them the money. Bearer bonds were historical instruments where whoever physically held the bond was the owner. The US essentially eliminated new bearer bonds in 1982 for tax compliance reasons. All modern US bonds are registered.

### **Book-Entry**

The modern way bonds are held — electronically, through a central depository. Instead of paper certificates, the depository (DTC) maintains an electronic ledger of who owns each bond. Trades happen by ledger entries, not by transferring physical paper. This is how virtually all bonds work today.

### **DTC (Depository Trust Company)**

The central depository for US securities. Owned by the major banks and brokerage firms. DTC holds bonds in book-entry form for institutional investors and processes payments between issuers (through trustees) and the institutional investors. Every modern US bond deal closes 'through DTC' — meaning DTC holds the master record and disburses payments to its participant banks and brokerages.

## **Section 3 — Tax Treatment: The Fundamental Split**

Bonds in the US split into two big categories based on how the interest is taxed. This split drives almost everything else about the deal — who can issue, what the rate is, who buys, what the structuring rules are. Understand this split and you understand half of the bond market.

### **Taxable Bond**

Interest is taxed by the IRS as regular income. Corporate bonds are taxable. Most non-government bonds are taxable. Bondholders pay federal income tax on the interest at their ordinary income rate (up to 37% for high earners) plus any applicable state income tax.

### **Tax-Exempt Bond**

Interest is not subject to federal income tax. Sometimes also not subject to state income tax (for investors in the state where the bonds were issued). Tax-exempt bonds are issued by state and local governments or by certain qualifying entities through government conduit issuers.

### **The Tax Exemption Math — Why Tax-Exempt Bonds Have Lower Coupons**

Because bondholders don't pay federal income tax on tax-exempt interest, they accept a lower coupon. A taxable bond might pay 7% to give a bondholder a 5% after-tax return. A tax-exempt bond can pay 5% and the bondholder keeps all 5% — same after-tax return.

Real example: On a 30-year $50 million bond, the difference between paying 7% taxable and 5% tax-exempt is roughly $30 million in total interest expense over the bond's life. This is why everyone who can issue tax-exempt tries to — the savings are enormous.

### **Municipal Bond (Muni)**

A tax-exempt bond issued by a state, local government, or government-affiliated entity. The municipal bond market is the largest tax-exempt bond market in the US — about $400 billion of new issuance per year. Includes general obligation bonds, revenue bonds, conduit bonds, and special-purpose financings.

### **Government Bond**

A bond issued by a federal, state, or local government on its own credit. US Treasury bonds, state general obligation bonds, and city general obligation bonds are all government bonds. Distinct from conduit bonds, which are issued by government entities on behalf of private borrowers.

### **Corporate Bond**

A taxable bond issued by a corporation on its own credit. Could be investment grade (BBB- or above) or high yield (BB+ or below). The corporate bond market is the largest taxable bond market in the US.

### **Federal Income Tax Treatment of Bonds**

Taxable bonds: interest is taxed as ordinary income. Tax-exempt municipal bonds: interest is exempt from federal income tax. Treasury bonds: interest is taxed federally but exempt from state and local income tax.

### **State Income Tax Treatment of Bonds**

Varies by state. Most states tax interest on bonds issued by other states' issuers. Most states exempt interest on bonds issued by their own state's issuers (the 'home state' exemption). Some states (Florida, Texas, Washington, others) have no state income tax, so state tax treatment doesn't matter for residents of those states.

### **Alternative Minimum Tax (AMT) and AMT Bonds**

AMT is a parallel federal income tax that some bond interest counts toward, even though it's exempt from regular federal income tax. Specifically, interest on certain private activity bonds — see Section 4 — is subject to AMT. Bonds whose interest is AMT-eligible price slightly wider (typically 5-15 basis points) than non-AMT tax-exempt bonds because their buyer pool is narrower (AMT-sensitive buyers won't buy them at the same yield).

### **De Minimis Rule**

A tax rule that affects bonds trading at a discount. If a tax-exempt bond is bought in the secondary market at a discount of more than 0.25% per year remaining to maturity, the discount is taxed as ordinary income rather than capital gains. This rule causes some buyers to avoid bonds trading below a certain price threshold, narrowing the secondary market for deeply discounted tax-exempt bonds.

### **OID (Original Issue Discount)**

When a bond is issued at a discount (sold for less than par at original issuance), the discount is treated as interest income for tax purposes, accrued annually over the bond's life. The bondholder pays tax on the imputed interest each year even though they don't receive cash until the bond pays out. OID creates tax complexity that makes deeply discount-priced bonds less attractive to many buyers.

## **Section 4 — Tax-Exempt Categories: What Kinds of Tax-Exempt Bonds Exist**

Not every project can be financed with tax-exempt bonds. The IRS rules are strict and specific. Tax-exempt bonds break into several categories based on who's borrowing and what the money is used for. This section walks the categories.

### **Governmental Purpose Bond**

Tax-exempt bonds issued by a government entity for the government's own purposes. Examples: a city issues bonds to build public roads; a state issues bonds for general budgetary purposes; a school district issues bonds for public schools. Governmental purpose bonds have no volume cap (no annual issuance limit) and are not subject to AMT. The cleanest, most straightforward category of tax-exempt bonds.

### **Private Activity Bond (PAB)**

Tax-exempt bonds where more than 10% of proceeds benefit a private party (a private business, a private nonprofit, etc.). PABs are subject to additional IRS restrictions — they must qualify under specific permitted categories (qualified 501(c)(3) bonds, exempt facility bonds, qualified small issue bonds, qualified residential rental bonds, etc.). Most PABs are subject to AMT. Most PABs are also subject to annual volume cap allocations by state.

### **Qualified 501(c)(3) Bond**

A specific type of PAB used to finance projects owned and operated by 501(c)(3) nonprofit organizations. The most common conduit bond category. Used to finance nonprofit hospitals, nonprofit colleges and universities, charter schools, nonprofit cultural institutions, nonprofit senior living facilities, and other charitable purposes. Not subject to AMT. Not subject to volume cap (until 2017, when TCJA initially threatened the carve-out — current law preserves the AMT exemption and the volume cap exemption for 501(c)(3) bonds).

### **Exempt Facility Bond**

A PAB used to finance specific facility types listed in IRC §142. The permitted facility types include: airports, docks and wharves, mass commuting facilities, water furnishing facilities, sewage facilities, solid waste disposal facilities, qualified residential rental projects, local district heating and cooling facilities, qualified hazardous waste facilities, high-speed intercity rail facilities, environmental enhancements of hydroelectric generating facilities, qualified public educational facilities, qualified green building and sustainable design projects, and qualified highway and surface freight transfer facilities. Each type has specific IRS requirements.

### **Qualified Small Issue Manufacturing Bond**

A PAB used to finance manufacturing facilities, capped at $10 million per project. Used by smaller manufacturers to access tax-exempt financing for plant construction or equipment. Modest deal flow but real for the right manufacturer.

### **Qualified Mortgage Bond (Single-Family)**

Tax-exempt bonds issued by state housing finance agencies to fund first-time homebuyer mortgage programs. Bond proceeds are loaned to qualifying first-time homebuyers at below-market rates. Volume-capped category.

### **Qualified Veterans' Mortgage Bond**

Tax-exempt bonds issued by certain states (Alaska, California, Oregon, Texas, Wisconsin) to fund mortgages for military veterans. Volume-capped.

### **Qualified Residential Rental Project Bond**

Tax-exempt bonds for multifamily rental projects that meet specific affordability tests under IRC §142(d). The project must reserve either at least 20% of units for tenants at or below 50% of area median income, or at least 40% of units for tenants at or below 60% of area median income. This is the legal basis for tax-exempt affordable housing bonds.

### **Tribal Economic Development Bond**

Tax-exempt bonds issued by federally recognized Native American tribes for tribal economic development purposes. Authorized under IRC §7871 and the American Recovery and Reinvestment Act of 2009. Each tribe has an allocation.

### **Volume Cap**

The annual limit on private activity bond issuance per state. Set by IRC §146. Each state gets an allocation equal to the greater of $120 per resident or about $358 million (these numbers adjust for inflation; 2024 figures shown here). Within each state, the volume cap is allocated by the state housing finance agency or another designated allocating entity. PAB issuers compete for volume cap allocations annually. Without an allocation, the bonds can't be issued as tax-exempt PABs.

Real example: California's 2024 volume cap is roughly $4.6 billion. Demand from affordable housing developers alone consistently exceeds the entire state allocation. Texas, Florida, and New York face similar pressure. This means PAB-eligible deals must compete for allocation, and timing of the allocation often drives deal timing.

### **TEFRA (Tax Equity and Fiscal Responsibility Act) Hearing**

A required public hearing before a conduit issuer issues PAB bonds. The hearing gives the public an opportunity to comment on the proposed bonds. TEFRA is required by IRC §147(f). The hearing notice must be published in advance (typically 14 days) in a local newspaper or government website. After the hearing, the appropriate elected official (typically the mayor or county executive) signs a 'TEFRA approval' certifying the hearing occurred and approving the bond issuance.

### **TEFRA Approval**

The signed certification by the elected official that the TEFRA hearing occurred and that the official approves the bond issuance. The TEFRA approval is a closing condition — bond counsel can't issue the tax opinion without it.

## **Section 5 — Tax-Exempt Mechanics: How Compliance Works**

Issuing tax-exempt bonds is only half the work. Keeping them tax-exempt throughout their lives is the other half. The IRS has specific ongoing compliance requirements that, if violated, can retroactively destroy the tax exemption — turning the bonds into taxable bonds and creating tax liability for bondholders. This section covers the major compliance areas.

### **501(c)(3) Status**

Federal designation for tax-exempt nonprofit organizations under section 501(c)(3) of the Internal Revenue Code. To qualify, an organization must be organized and operated exclusively for charitable, religious, educational, scientific, or similar purposes; must not benefit private interests; and must not engage in substantial lobbying or political activity. 501(c)(3) status is required for qualified 501(c)(3) bonds. Maintained through annual Form 990 filings with the IRS.

### **Qualified Residential Rental Project Tests**

For multifamily housing PABs under IRC §142(d), the project must meet one of two affordability tests for at least 15 years (the 'qualified project period'):

* 20%/50% test: At least 20% of units occupied by tenants at or below 50% of area median income (AMI)
* 40%/60% test: At least 40% of units occupied by tenants at or below 60% of AMI

The chosen test must be met continuously throughout the qualified project period. Failure to meet the test can disqualify the bonds retroactively.

### **Private Use Rules**

For tax-exempt bonds, IRS rules limit how much of the financed facility can be used by private parties. For most tax-exempt bonds, no more than 10% of bond proceeds and no more than 10% of the financed facility's use can benefit private parties. Exceptions and special rules apply for different bond categories. Private use violations can disqualify the bonds.

Real example: A nonprofit hospital builds a building with tax-exempt 501(c)(3) bonds. If the hospital later leases 15% of the building to a for-profit dialysis company, the private use exceeds 10% — potentially disqualifying the bonds. The hospital needs to either restructure the lease, refinance with taxable bonds, or pay penalties to the IRS.

### **Public Use**

The opposite of private use — use by the general public or by governmental entities. For governmental purpose bonds, the facility must be primarily for public use. The definition varies by context but generally means use available to the public on terms similar to the general population (a public road, a public school, a city library).

### **Arbitrage**

In tax-exempt bond context, arbitrage means investing bond proceeds at a higher yield than the bond's own yield. IRS rules require issuers to rebate (pay back) any arbitrage profit to the federal government. The rule prevents issuers from making money by borrowing at tax-exempt rates and investing at higher taxable rates. See arbitrage rebate below.

### **Arbitrage Rebate**

The actual payment to the IRS of arbitrage profit. Required every 5 years during the bond's life and at final retirement. Calculated by comparing the bond's yield (computed under IRS rules) to the actual investment earnings on bond proceeds. If investment earnings exceed bond yield, the excess is rebated. If investment earnings are below bond yield, no rebate is owed.

### **Yield Restriction**

IRS rules that limit the yield at which bond proceeds can be invested. For most bond proceeds, investments are restricted to the bond yield plus a small spread. Reserves and refunding escrows often have specific yield restrictions. The yield restriction rules prevent issuers from earning arbitrage profit in the first place. See SLGS below.

### **SLGS (State and Local Government Series)**

Special Treasury securities issued by the US Treasury specifically for state and local government bond issuers to use in yield-restricted accounts. SLGS can be customized to any yield up to the bond yield, allowing issuers to perfectly match the yield restriction. Common in refunding escrows where the escrow must earn exactly the bond yield.

### **IRS Form 8038 Series**

Tax forms filed with the IRS at bond issuance. The form documents the bond's tax status and key terms. Different bonds use different forms:

* Form 8038 — Private Activity Bonds
* Form 8038-G — Governmental Purpose Bonds
* Form 8038-T — Arbitrage Rebate (filed every 5 years)
* Form 8038-CP — Direct Pay Bonds (Build America Bonds and similar)

Bond counsel prepares and files these forms. Late filing can create complications; non-filing can disqualify the bonds.

### **Current Refunding**

Issuing new bonds to retire old bonds within 90 days of the old bonds' call date or maturity. The new bonds pay off the old bonds when the old bonds become callable or mature. Standard refunding mechanic for tax-exempt bonds since the Tax Cuts and Jobs Act of 2017 eliminated advance refunding (see below).

### **Advance Refunding**

Issuing new bonds more than 90 days before the old bonds' call date or maturity. The new bond proceeds are placed in an escrow account that invests in government securities, with the escrow's cash flows covering the old bonds' debt service through the call date. Until the Tax Cuts and Jobs Act of 2017, tax-exempt issuers could advance refund tax-exempt bonds once during the bond's life. TCJA eliminated tax-exempt advance refunding (you can still advance refund with taxable bonds). This was a major change to tax-exempt market dynamics.

### **Defeasance**

Economically retiring bonds by depositing enough money in an escrow to pay them off. After defeasance, the bonds are still technically outstanding but treated as paid for accounting and credit purposes. Used in refundings (where the old bonds are defeased) and in some restructurings.

### **Escrow Defeasance**

Same as defeasance — the term emphasizes that the defeasance is accomplished through an escrow account holding securities sufficient to pay debt service.

### **Tax Certificate**

A document executed at bond issuance certifying the issuer's commitments regarding tax compliance — that private use will be limited, that arbitrage rules will be followed, that all IRS requirements will be met throughout the bond's life. The tax certificate is a closing document; failure to comply with its representations can disqualify the bonds.

### **Internal Revenue Code Sections That Govern Tax-Exempt Bonds**

The relevant IRC sections, in plain English:

**IRC §103 —** The basic section that exempts state and local government bond interest from federal income tax.

**IRC §141 —** Defines private activity bonds — the trigger for additional restrictions.

**IRC §142 —** Defines exempt facility bonds and the permitted facility categories (airports, residential rental, sewage, solid waste, etc.).

**IRC §145 —** Defines qualified 501(c)(3) bonds — the most common middle-market category.

**IRC §146 —** Establishes volume cap rules and state allocations.

**IRC §147 —** Establishes requirements applicable to private activity bonds (TEFRA hearings, public approval, maturity limits).

**IRC §148 —** The arbitrage rules — yield restriction, rebate, reserves.

**IRC §149 —** Miscellaneous restrictions (registration requirements, federally guaranteed bonds).

**IRC §150 —** Definitions and special rules.

## **Section 6 — Bond Structure by Security: Who Gets Paid From What**

Bonds differ in what backs them — what source of money pays them back. The 'security' of a bond is the legal claim that bondholders have on the obligor's cash flow and assets. Different security structures fit different deal types and produce different risk and pricing characteristics.

### **General Obligation Bond (GO)**

Backed by the full faith, credit, and taxing power of the issuing government. The government promises to use any available revenue, including raising taxes if necessary, to pay the bonds. GO bonds are typically the strongest security in the muni market. Available only to government issuers.

### **Revenue Bond**

Backed only by the revenue from a specific project or enterprise. If the revenue falls short, bondholders have no claim against the broader credit of the issuer. The most common security structure for conduit bonds and project finance. Examples: water and sewer revenue bonds (backed by water utility revenues), toll road bonds (backed by toll collections), hospital revenue bonds (backed by hospital operating revenues).

### **Special Tax Bond**

Backed by a specific tax revenue stream — a hotel occupancy tax, a sales tax, a parking tax, etc. Not as strong as GO (because the tax base is narrower) but stronger than a pure revenue bond (because the tax is governmentally collected).

### **Special Assessment Bond**

Backed by special assessments levied on benefited properties. Common in real estate development financings where infrastructure improvements (roads, utilities, drainage) benefit a defined district, and the property owners pay assessments to fund the bonds.

### **Lease Revenue Bond**

Backed by lease payments under a long-term lease, often where a government entity leases a facility from a nonprofit corporation that owns the facility. Common in essential government facility financings (court buildings, schools, prisons) where direct GO issuance is constrained.

### **Certificate of Participation (COP)**

A specific type of lease revenue financing where bondholders own 'certificates' representing fractional interests in the lease payments. Used by government entities to finance facilities without issuing formal debt that requires voter approval.

### **Moral Obligation Bond**

Bonds with a moral (but not legal) commitment from a government entity to backstop the bonds. The government typically commits to consider appropriating funds to replenish a depleted reserve, but isn't legally required to do so. Common in state HFA mortgage revenue bonds.

### **Double-Barreled Bond**

Bonds backed by two different security pledges — typically a specific revenue source plus a general obligation pledge. The bonds are paid first from the specific revenue; if that falls short, the GO pledge kicks in. Stronger than either security standing alone.

### **Full Faith and Credit**

The strongest possible governmental pledge — the issuer's full taxing power and resources backing the bond. Used in GO bonds and double-barreled bonds. Available only to government issuers.

### **Senior Bond**

A bond that has first claim on the obligor's cash flow and collateral, ahead of any subordinate bonds. Senior bonds typically have the best rating, the tightest pricing, and the strongest covenant protections. See Section 14 on tranching for more on senior/sub structures.

### **Subordinate Bond**

A bond that has a claim on the obligor's cash flow and collateral that ranks behind senior bonds. Subordinate bonds get paid only after senior debt service is current. Higher yield to compensate for the increased risk. Common in commercial real estate, multifamily housing, and certain corporate structures.

### **Mezzanine Bond**

A bond that ranks between senior and subordinate — sometimes also called 'mezz.' Mezzanine financing often combines debt features with equity features (warrants, conversion rights, profit participations) to compensate for the position between senior and subordinated debt.

### **First Lien**

The strongest possible security position — first claim on specific collateral. First lien holders get paid first from the proceeds if the collateral is sold.

### **Second Lien**

Security position behind a first lien. Second lien holders get paid from collateral proceeds only after first lien holders are paid in full.

### **Secured Bond**

A bond backed by specific pledged collateral — real estate, equipment, accounts receivable, securities. If the obligor defaults, bondholders can foreclose on the collateral.

### **Unsecured Bond**

A bond not backed by specific collateral. Backed only by the obligor's general credit and operating cash flow. In default, unsecured bondholders are general creditors with no specific claim on any asset.

## **Section 7 — Bond Structure by Payment Pattern (Amortization in Depth)**

Bonds repay principal in different ways. The amortization pattern affects everything: the borrower's cash flow profile, the bondholder's reinvestment risk, the rating agency's view of the structure, the buyer pool that will absorb the deal. This section covers the patterns and when each fits.

### **Fixed-Rate Bond**

Coupon is set at issuance and stays fixed for the bond's life. The bondholder knows exactly what they'll receive each period. Most middle-market bonds are fixed-rate. Predictability is the main advantage; the cost is that the borrower can't benefit if rates fall (without refinancing through a call).

### **Variable-Rate Bond**

Coupon resets periodically based on a defined formula (typically a market index plus a spread). The bondholder receives different payments at different periods. Used when the borrower wants exposure to current rates or when the bond's structure (like a VRDO) requires periodic remarketing.

### **VRDO (Variable-Rate Demand Obligation)**

A specific variable-rate tax-exempt bond structure where the rate resets weekly (most common) or daily, and bondholders have the right to put the bonds back at par on each reset date. Most VRDOs have a letter of credit from a bank that guarantees the put — if no buyer emerges at the reset rate, the bank takes the bonds. Used by issuers who want short-term tax-exempt rates plus the option to refinance.

Real example: A hospital issues $50 million of VRDOs. Weekly reset rate is set by the remarketing agent, usually SIFMA index plus 50-100 basis points. Plus a 75-150 basis point LOC fee from the bank backing the VRDO. Plus a 10-25 basis point remarketing agent fee. All-in cost typically SIFMA plus 135-275 basis points — cheaper than long-term fixed-rate in many environments, but the borrower carries rate risk and LOC renewal risk.

### **Floating-Rate Note (FRN)**

Taxable variable-rate bond. The corporate-bond analog to a VRDO. Coupon resets periodically based on a market index (LIBOR historically, now SOFR or other reference rates) plus a credit spread. Used when borrowers want variable-rate exposure or when buyers want floating-rate paper.

### **Serial Bond**

Bonds that mature in equal annual installments over the bond's life. A 15-year serial bond might have $1 million maturing every year for 15 years. Each maturity is technically its own bond with its own CUSIP, but the deal is structured and sold as a single offering. Common in muni bonds. Attractive to bank portfolio buyers who want defined principal returns each year.

### **Term Bond**

A single bond with a defined maturity date, repaying all principal at that date. The opposite of a serial. A 30-year term bond pays interest only for 30 years, then the full principal at year 30 (often through a sinking fund — see below). A deal can have a serial structure for early maturities (years 1-15) and a term bond for later maturities (years 15-30) — the most common middle-market structure.

### **Bullet Bond**

Same as a term bond — a single bond with all principal at maturity. The term emphasizes that there's no amortization over the bond's life; all principal is repaid as a single 'bullet' at the end.

### **Sinking Fund Bond**

A term bond with mandatory principal payments before final maturity. The bond contract requires the borrower to make defined principal payments each year (the 'sinking fund payments'), with the trustee using those payments to retire bonds (either by call or by purchase in the open market). By final maturity, most or all of the principal has been retired through the sinking fund.

Real example: A $20 million 30-year term bond with sinking fund payments of $500,000 per year starting in year 11. By year 30, $10 million has been retired through sinking fund payments and $10 million remains as the final balloon. Common structure for middle-market revenue bonds.

### **Mortgage-Style Amortization**

Equal periodic payments where each payment includes both principal and interest. Early payments are mostly interest; later payments are mostly principal. Like a residential mortgage. Common in commercial real estate bond financings.

### **Level Debt Service Amortization**

Same idea as mortgage-style — total debt service (principal + interest) is the same each period. Used because it produces predictable cash flow requirements for the borrower. Common in revenue bond structures where the underlying project generates relatively stable cash flow.

### **Level Principal Amortization**

Equal principal payments each period, with declining interest payments. Total debt service is highest at the beginning and lowest at the end. Used when the borrower wants to retire principal aggressively early, particularly when the underlying project's cash flow is expected to be highest early.

### **Custom Amortization Patterns**

Any pattern other than the standard ones above. Could be a wrapped structure (no principal in years 1-5 to match a property's stabilization), a back-loaded structure (more principal in later years to match expected revenue growth), or a step-up structure (escalating principal payments). Custom patterns require careful structuring to ensure they meet rating agency requirements and tax-exempt amortization rules (where applicable).

### **Capital Appreciation Bond (CAB)**

A bond that doesn't pay current interest. Instead, the interest accrues and compounds, and is paid at maturity along with the original principal. CABs are used when the borrower needs to defer cash debt service (during construction, ramp-up, or other cash-poor periods). The accrued amount can be very large by maturity due to compounding.

Real example: A $10 million CAB issued at 5% accreting yield with a 20-year maturity. The borrower receives $10 million at issuance but owes approximately $26.5 million at maturity (the original $10 million plus 20 years of compounded accretion). Common in senior living entry-fee structures and in deferred-revenue project finance.

### **Zero-Coupon Bond**

A bond that pays no interest currently and no coupon. Sold at a deep discount to par. The bondholder receives par at maturity; the entire return is the discount/par gap. Tax-exempt zero coupons are essentially the same as CABs. Taxable zero coupons exist but have OID tax complications.

### **Deferred Interest Bond**

A bond where interest payments are deferred for a defined period (during construction, for example), then commenced after the deferral period. Different from a CAB because interest doesn't compound — it's just deferred. Less common than CABs.

### **Current Interest Bond**

A standard bond that pays interest currently (semi-annually, typically). Default convention in most bond structures.

### **Convertible Bond**

A bond that can be converted into equity at the bondholder's option, typically at a defined conversion price. Common in corporate finance, rare in middle-market revenue bonds. We mention it for completeness.

### **Choosing an Amortization Pattern — Decision Framework**

Different amortization patterns fit different deal types. Here's a quick framework:

* Senior living new construction CCRC — Cap-I covering construction interest, deferred amortization during fill-up, level debt service after stabilization
* Stabilized multifamily refinancing — Mortgage-style or level debt service amortization, 30-year term
* Healthcare hospital — Level debt service amortization, typically combined with a sinking fund for long-dated bonds
* Data center lease-backed bond — Level principal amortization matched to the lease's expense recognition pattern
* Hospitality (hotel) — Level debt service with optional cash sweep provisions tied to operating performance
* Project finance with merchant tail — Mortgage-style during contracted period, balloon at the end of the contract
* Investment-grade corporate — Bullet at maturity is common; sinking fund optional
* High-yield corporate / LBO — Bullet at maturity, typically with call protection and step-down call schedule
* Government refunding — Match the original bonds' amortization to preserve coverage

## **Section 8 — How Bonds Get Sold: Regulatory Pathways**

Bonds reach investors through specific regulatory pathways. Each pathway has its own rules about who can buy, what disclosure is required, and what the BD's obligations are. The choice of pathway affects deal speed, cost, and the buyer pool.

### **Public Offering**

Full SEC-registered offering. The issuer files a registration statement with the SEC (hundreds of pages of disclosure, audited financials, risk factors, business descriptions). The SEC reviews the filing. After review, the bonds can be sold to anyone — retail investors, institutional investors, anyone. Public offerings have the broadest buyer pool but are the most expensive and time-consuming to execute. Used for very large deals where the buyer base needs to be maximal.

### **Private Placement (Overview)**

Sale of securities without full SEC registration, under one of several exemptions. The buyer pool is more limited but the regulatory burden is lighter, the execution faster, and the cost lower. Most middle-market bonds are private placements. Several specific rules govern private placements — see below.

### **Rule 144A**

An SEC rule that permits sales of securities to Qualified Institutional Buyers (QIBs) without full SEC registration. The most common middle-market bond pathway. Rule 144A says: if all the buyers are QIBs (large professional institutions), the issuer doesn't have to go through full public registration. Disclosure is still robust (typically through a comprehensive Offering Memorandum), but the regulatory burden is meaningfully lighter than a public offering.

Real example: A $75 million senior living bond sold under Rule 144A goes only to QIBs — life insurance companies, bond funds, bank portfolios. The deal closes in 90-120 days instead of 180-365 for a public offering. Disclosure runs 150-200 pages instead of 400-500.

### **Rule 144**

The broader SEC rule covering resale of restricted securities. When 144A bonds trade in the secondary market, the trades happen under Rule 144 and (typically) the 144A 'safe harbor' for resales to QIBs. Most secondary trading of middle-market bonds happens under Rule 144A.

### **Regulation D (Reg D)**

SEC regulation containing several rules for private placements. Reg D has multiple safe harbors (Rule 504, Rule 506(b), Rule 506(c)) that permit different types of private offerings. Reg D is the most common framework for non-144A private placements.

### **Rule 506(b)**

A Reg D rule permitting sales to an unlimited number of accredited investors plus up to 35 non-accredited investors who are sophisticated enough to evaluate the offering. No general solicitation or advertising allowed. Common for private debt placements to a known group of investors.

### **Rule 506(c)**

A Reg D rule (added in 2013 by the JOBS Act) permitting sales only to accredited investors, but allowing general solicitation and advertising. The trade-off is verification — the issuer must take reasonable steps to verify each buyer's accredited investor status. Used when the issuer wants to publicly market the offering.

### **Regulation S (Reg S)**

SEC regulation governing offshore offerings to non-US investors. Bonds sold under Reg S are sold to non-US persons in offshore transactions, with restrictions on resale into the US. Used for international tranches of large deals.

### **Rule 15c2-12**

MSRB rule governing continuing disclosure for municipal bonds. Issuers of muni bonds (and obligors on conduit bonds) must commit at closing to provide ongoing annual financial disclosure and material event notices through EMMA throughout the bond's life. Rule 15c2-12 is what makes muni continuing disclosure mandatory. The BD cannot underwrite the bonds unless the issuer signs a Continuing Disclosure Agreement.

### **Qualified Institutional Buyer (QIB)**

An institutional investor with at least $100 million of investable securities. QIBs are the buyer base for Rule 144A offerings. The category includes most life insurance companies, large bond funds, large pension funds, large bank portfolios, and large hedge funds. QIBs are presumed sophisticated and able to evaluate offerings without the protections of full SEC registration.

### **Accredited Investor**

An investor (individual or institutional) that meets specific net worth or income thresholds. For individuals: $1 million net worth excluding primary residence, or $200,000 annual income ($300,000 with spouse). For institutions: $5 million in assets, or certain regulated entity types. Accredited investors can buy Reg D offerings. The standard is lower than QIB.

### **Sophisticated Investor**

Less formal designation — an investor with sufficient knowledge and experience to evaluate the offering's merits and risks. The Rule 506(b) standard for the 35 non-accredited investors who can participate. Subjective and harder to verify than accredited investor status.

### **SEC (Securities and Exchange Commission)**

The US federal securities regulator. Oversees public offerings, broker-dealer regulation, investment advisor regulation, and corporate disclosure. The primary regulator for taxable corporate bonds.

### **MSRB (Municipal Securities Rulemaking Board)**

The self-regulatory organization for the municipal securities market. Writes rules governing muni BDs and muni advisors (which is what Nest is). MSRB rules cover muni-specific issues like continuing disclosure (Rule 15c2-12), pay-to-play (Rule G-37), professional qualifications, and fair dealing.

### **FINRA (Financial Industry Regulatory Authority)**

The self-regulatory organization for US broker-dealers. Licenses and supervises broker-dealer firms and registered representatives. Conducts exams and enforcement. The primary regulator for the broker-dealer side of the bond market.

### **EMMA (Electronic Municipal Market Access)**

The MSRB-operated public repository for municipal bond disclosure. Every muni bond's official statement is filed on EMMA. Every annual report and material event notice for outstanding muni bonds is filed on EMMA. EMMA is a public, free resource — anyone can search and view muni bond disclosures. For Nest, EMMA is critical: it's the primary public data source for reverse-engineering the muni bond market into the platform's intelligence layer.

### **EDGAR (SEC's Electronic Data Gathering, Analysis, and Retrieval System)**

The SEC's public repository for corporate disclosure. Every public company's annual report (10-K), quarterly report (10-Q), and material event filing (8-K) is on EDGAR. Every corporate bond offering's registration statement and prospectus is on EDGAR. The corporate-bond equivalent of EMMA. Same value to Nest as a public data source for reverse-engineering the corporate bond market.

### **Securities Act of 1933**

The federal law governing public offerings of securities. Established the registration requirement for public offerings and the disclosure framework. The legal foundation for SEC oversight of new securities issuance. Often called 'the 33 Act.'

### **Securities Exchange Act of 1934**

The federal law governing secondary trading of securities and the securities markets. Established the SEC as the federal securities regulator. Established the framework for ongoing public company disclosure. Often called 'the 34 Act.'

### **Tax Cuts and Jobs Act of 2017 (TCJA)**

Major federal tax legislation that included two significant changes to tax-exempt bonds: (1) eliminated tax-exempt advance refunding — tax-exempt bonds can no longer be advance-refunded with tax-exempt bonds (current refundings within 90 days are still permitted), and (2) eliminated certain Build America Bonds and similar direct-pay structures. TCJA materially changed muni bond market dynamics.

### **Dodd-Frank Act**

Major federal financial reform legislation from 2010. Among many other things, Dodd-Frank created the Municipal Advisor regulatory category that Nest operates under. MAs must register with the SEC and MSRB. MAs owe fiduciary duty to their municipal entity clients.

## **Section 9 — The Documents**

Every bond deal produces a stack of legal documents. Each document does a specific job. This section covers the major documents you'll see on every deal.

### **Indenture (also called Bond Indenture or Trust Indenture)**

The master contract that defines every term of the bond — payment terms, security, covenants, defaults, remedies. The most important legal document in the deal. Executed at closing between the issuer and the trustee for the benefit of bondholders. Without an indenture, the bond doesn't exist.

Real example: A typical middle-market bond indenture runs 150-300 pages. It defines: how interest is calculated and paid, what reserves must be maintained, what financial covenants the obligor must meet, what events trigger default, what remedies are available, how amendments can be made, how the bond can be defeased.

### **Supplemental Indenture**

An amendment or addition to an existing indenture. Used when an obligor issues additional bonds under an existing master indenture, or when an existing indenture needs to be modified (with required bondholder consents).

### **Master Indenture**

A foundational indenture that establishes the framework for multiple bond series. The obligor can issue bonds under the master indenture, each series with its own supplemental indenture. Used by obligors who expect to issue multiple bond series over time (large hospital systems, multifamily housing portfolios, etc.).

### **Loan Agreement (in Conduit Financings)**

The contract between the conduit issuer and the actual borrower. The conduit issues the bonds and loans the proceeds to the borrower; the loan agreement governs the borrower's obligation to repay the loan to the conduit. The loan agreement's terms mirror the indenture's payment terms — the borrower pays the conduit, the conduit passes the payments through to the trustee, the trustee pays the bondholders.

### **Mortgage (also called Deed of Trust in some states)**

In real estate-backed bond deals, the document that grants the trustee (on behalf of bondholders) a security interest in the real property. The mortgage is recorded in the local land records, putting the world on notice that the property secures the bond. Permits foreclosure if the borrower defaults.

### **Security Agreement**

A document granting bondholders a security interest in personal property of the borrower — equipment, inventory, accounts receivable, etc. Filed with the state UCC office for non-real-estate collateral. The personal-property equivalent of a mortgage.

### **UCC Financing Statement**

The form filed with the state under the Uniform Commercial Code to perfect a security interest in personal property. Filing the UCC-1 puts the public on notice of the security interest. Required for senior secured bonds with personal property collateral.

### **Regulatory Agreement**

For tax-exempt bonds with specific regulatory requirements (especially affordable housing bonds), the contract committing the borrower to the regulatory restrictions for the required period. For multifamily affordable housing, the regulatory agreement specifies the rent restrictions, the income limits, the reporting requirements, and the qualified project period.

### **Tax Regulatory Agreement**

The agreement covering tax-exempt compliance requirements — private use limits, arbitrage rebate, yield restriction, and other IRS requirements. Sometimes combined with the regulatory agreement, sometimes separate. Required for all tax-exempt bonds.

### **Official Statement (OS)**

The disclosure document delivered to investors at closing. The muni-bond equivalent of a corporate prospectus. Contains all the information investors need to evaluate the bond: the issuer, the obligor, the project, the structure, the security, the financial information, the risk factors. Typically 150-300 pages including appendices.

### **Preliminary Official Statement (POS)**

The OS delivered to investors during marketing, before pricing. The 'preliminary' version is missing some final terms (final coupons, final yields, final pricing) that get determined at pricing. The POS is what most investors actually read; the final OS is just the POS with the pricing information filled in.

### **Bond Purchase Agreement (BPA)**

The contract between the issuer and the broker-dealer/underwriter. Specifies the BD's commitment to buy the bonds at the agreed price and terms, the conditions precedent that must be satisfied at closing, the representations and warranties of each party, and the indemnification provisions. Executed at pricing, with closing 7-14 days later.

### **Continuing Disclosure Agreement (CDA)**

The borrower's commitment to provide ongoing financial and operating disclosure throughout the bond's life. Required by Rule 15c2-12 for muni bonds. Specifies what annual financial information will be filed, what operating data will be filed, what material events will trigger filings, and the timing requirements. The CDA is what makes the obligor accountable to the bondholders for ongoing disclosure.

### **Construction Disbursement Agreement**

On construction deals, the agreement governing how construction funds will be disbursed. Specifies the draw process, the documentation required for each draw, the construction monitor's role, and the conditions for disbursement. Coordinates between the borrower, the trustee, and the construction monitor.

### **Paying Agent Agreement**

The agreement governing the paying agent's role. Usually the trustee plays both roles, but if a separate paying agent is engaged, this agreement defines what they do.

### **Subordination Agreement**

In deals with multiple debt tranches, the agreement governing the relative priority of the tranches. The subordinate lender agrees that the senior lender gets paid first, with detailed provisions about cash flow priorities, default remedies, and amendments.

### **Intercreditor Agreement**

Similar to a subordination agreement but used when multiple lenders have complex relationships — multiple senior lenders, multiple subordinate lenders, equity participants, etc. Governs how the lenders interact with each other and with the borrower.

### **Opinion of Counsel**

Legal opinions delivered at closing. The most important are bond counsel's opinion (covering bond validity and tax exemption) and disclosure counsel's opinion (on the OS). Opinions of borrower's counsel, trustee's counsel, and other parties are also typically delivered.

### **Comfort Letter**

A letter from the obligor's auditor providing limited comfort on the financial information in the OS. Not a formal audit opinion but a confirmation that the auditor reviewed the financial information and isn't aware of any material misstatements.

### **Consent Letter**

From the obligor's auditor, consenting to the inclusion of the audited financial statements in the OS. A simple consent letter; legally required to include audited financials in the disclosure.

### **Certificate of Authentication**

Issued by the trustee, certifying that the bonds are the genuine bonds authorized under the indenture. The trustee's signature authenticates the bonds; without authentication, the bonds aren't valid.

### **Officer's Certificate**

Certifications by officers of the obligor or issuer confirming various facts at closing — that all representations remain accurate, that no defaults exist, that all conditions precedent have been satisfied. Multiple officer's certificates are typically delivered at closing.

### **No-Default Certificate**

A specific officer's certificate confirming that no event of default exists and no event has occurred that would trigger default with notice or lapse of time. Required at closing and often required to be re-delivered periodically thereafter.

### **Incumbency Certificate**

A certificate identifying the people authorized to sign on behalf of an entity, with their specimen signatures. Confirms that the signatories on the closing documents have authority to bind the entity.

### **Closing Memorandum**

A document prepared by bond counsel summarizing the closing — the parties involved, the closing date, the bond amount, the key terms, the documents delivered, the conditions satisfied. The closing memorandum is the historical record of how the closing happened.

## **Section 10 — Calls, Puts, and Other Optionality**

Bonds often include options that allow the borrower to repay early or the bondholders to demand repayment early. These options have economic value and affect the bond's pricing. This section covers the types of optionality you'll see in middle-market deals.

### **Optional Redemption (also called a Call)**

The borrower's right to retire the bonds before maturity at defined prices. The most common form of optionality. Used when the borrower wants the flexibility to refinance at lower rates, sell the underlying asset, or restructure the deal. The call provisions define when the borrower can call (the call date) and at what price (the call price).

### **Mandatory Redemption**

Required principal payments before maturity, mandated by the indenture rather than at the borrower's option. Common examples: sinking fund redemptions, extraordinary mandatory redemptions triggered by specific events (insurance proceeds, condemnation proceeds, sale of the underlying asset).

### **Sinking Fund Redemption**

Mandatory annual principal payments structured as redemptions of a portion of the outstanding bonds each year. The trustee uses the sinking fund payments to retire bonds either by calling them at par or by purchasing them in the open market at discount.

### **Extraordinary Mandatory Redemption (EMR)**

Mandatory redemption triggered by a specific defined event — insurance proceeds from a casualty loss, condemnation proceeds, sale of the financed asset, certain tax events. EMR is typically at par (no premium) since it's not the borrower's voluntary choice.

### **Special Optional Redemption**

An optional redemption at par triggered by specific defined events — typically related to the financed project's continued operation or the borrower's continued status. Common in tax-exempt deals where the borrower may need to redeem if tax exemption is threatened.

### **Par Call**

A call at par value — no premium paid to bondholders. The most borrower-favorable call structure. Typical structure: bonds are non-callable for a period (the 'non-call period'), then callable at par for the rest of the bond's life.

### **Premium Call**

A call at a price above par. Common in step-down structures: 105 in year 5, 103 in year 7, 101 in year 9, par in year 10 and after. The premium compensates bondholders for the loss of the bond. Premium call structures are common in high-yield corporate bonds.

### **Make-Whole Call**

A call at a price calculated to compensate bondholders for the present value of remaining payments, computed at a defined Treasury spread. The make-whole call essentially leaves bondholders economically indifferent to the call (they receive what their bonds would have been worth at the call date if held). Make-whole structures price tighter than par-call structures because bondholders aren't disadvantaged by the call.

Real example: A 30-year investment-grade corporate bond might have a make-whole call at Treasury plus 30 basis points for the life of the bond, with a par call window starting 90 days before maturity. The make-whole spread (30 basis points) is the key term — it determines how favorable the call is to the bondholder.

### **Make-Whole Spread**

The spread over Treasuries used in the make-whole call calculation. Typically 15-50 basis points for investment-grade corporate bonds. Lower spread is more bondholder-favorable; higher spread is more borrower-favorable.

### **Par Call Window**

A period before final maturity (typically the last 90 days or 6 months) during which the bond is callable at par regardless of the make-whole calculation. Allows the borrower to clean up the remaining principal before maturity.

### **Non-Call Period**

A period after issuance during which the bond cannot be called. Typical non-call periods: 10 years for long-dated tax-exempt bonds, 3-5 years for high-yield corporate bonds. Longer non-call provides bondholders with duration certainty and produces tighter pricing.

### **Call Date**

The first date the bond can be called. For a bond with a 10-year non-call period, the call date is 10 years after issuance.

### **Call Price**

The price at which the bond can be called. Could be par (100), a premium (105, 103, 101, etc.), or a make-whole calculation.

### **Call Notice**

The formal notice from the borrower (through the trustee) of intent to call bonds. Typical call notice is 30-60 days before the call date. After the notice, bondholders are committed to receive the call price on the call date.

### **Put Provision**

The bondholders' right to demand repayment before maturity. Less common than calls in middle-market deals. Two main types: hard puts (a fixed put date when bondholders can put the bonds back) and soft puts (puts triggered by specific events).

### **Hard Put**

A bondholder put right at a defined date. Bondholders can elect to put on the put date and receive the put price (typically par). Common in VRDOs (where bondholders can put on every reset date) and in some structured corporate bonds.

### **Soft Put**

A bondholder put right triggered by specific events — typically credit deterioration, change of control, or other defined triggers. Provides bondholders with a credit-deterioration exit but isn't a routine feature.

### **Mandatory Tender**

In VRDO and similar structures, a required tender of the bonds back to the remarketing agent on each reset date. The bonds are immediately remarketed at the new reset rate. Without mandatory tender, the rate reset mechanism doesn't work.

### **Tender Option**

Generic term for any provision that allows bondholders to tender bonds back to the borrower or remarketing agent. Hard puts, mandatory tenders, and certain restructuring tender offers all fall under this umbrella.

### **Remarketing**

The process by which bonds are sold to new buyers after being put back by existing bondholders. The remarketing agent finds new buyers at the new reset rate. If remarketing fails (no buyers at the rate), the LOC bank backing the VRDO takes the bonds.

### **Doubling Option**

Borrower's right to retire bonds at a higher rate than the standard sinking fund schedule — typically up to double the scheduled amount. Provides cash flow flexibility.

### **Equity Claw**

In high-yield bond structures, the borrower's right to retire a portion of the bonds (typically up to 35%) at a defined premium using proceeds from an equity offering during the non-call period. Allows borrowers who improve their credit through IPO or equity raise to retire some bonds early at a known cost.

## **Section 11 — Reserves and the Cash Flow Waterfall**

Bond deals include cash reserves and a defined sequence for how cash flows through the structure. Reserves provide safety cushions; the waterfall ensures priority. This section covers the major reserve types and the waterfall logic.

### **Debt Service Reserve Fund (DSRF)**

A reserve account holding cash sufficient to cover a defined amount of debt service — typically the Maximum Annual Debt Service (MADS) or some percentage of it. The DSRF exists to protect bondholders against temporary cash flow shortfalls. If the borrower can't make a debt service payment from current cash flow, the trustee draws on the DSRF to make the payment. The borrower then replenishes the DSRF from future cash flow.

Real example: A $50 million bond with $4.5 million in maximum annual debt service typically has a DSRF of $4.5 million — equal to MADS. The DSRF is funded at closing from bond proceeds (reducing the proceeds available for the actual project) and earns interest at restricted rates during the bond's life.

### **Capitalized Interest (Cap-I)**

A reserve account funded at closing to pay interest during a defined period before the project generates cash flow (construction, fill-up, ramp-up). Without Cap-I, the borrower would have to come out of pocket for interest during periods when there's no operating revenue. Cap-I is sized to cover estimated interest through the period plus a cushion (typically 15-25%).

### **Construction Fund**

The account holding bond proceeds intended for construction expenses. The trustee disburses funds from the construction fund based on approved construction draws. Once construction is complete and all costs paid, any remaining construction fund balance is either applied to debt service or returned to the borrower depending on the indenture terms.

### **Costs of Issuance Fund**

A small account holding funds for paying transaction costs (bond counsel, rating agencies, trustee, conduit, financial advisor, etc.). Funded at closing from bond proceeds. Disbursed shortly after closing as invoices come in. Usually closed within 60-90 days of closing.

### **Repair and Replacement Reserve (R&R)**

For real estate-backed deals (multifamily, senior living, hospitality, etc.), a reserve for major capital expenditures and replacements. The R&R reserve is funded from operating cash flow on an annual or monthly basis (e.g., $200-$500 per unit per year for multifamily). The reserve is drawn when the borrower needs to fund major repairs or replacements.

### **Operating Reserve**

A reserve covering general operating shortfalls. Sized in months of operating expenses (typically 3-12 months depending on sector and project stage). New construction deals often have larger operating reserves to cover ramp-up risk. Healthcare deals require larger reserves for payer mix volatility.

### **Working Capital Reserve**

A reserve for working capital needs — accounts receivable timing gaps, inventory needs, seasonal cash flow variations. Distinct from operating reserve, though sometimes combined.

### **Marketing Reserve**

In senior living and other lease-up deals, a reserve for marketing expenses during the lease-up period. Helps ensure that marketing investment continues even if early revenue is lower than projected.

### **Rebate Fund**

A reserve specifically for arbitrage rebate payments to the IRS. Funded from investment earnings on bond proceeds. Required for tax-exempt bonds; disbursed every 5 years and at final retirement.

### **Surplus Fund (also called Excess Cash Fund or Residual Fund)**

The account that receives excess cash after all other waterfall payments are made. The surplus fund balance may be released to the borrower for distributions, may be trapped if certain conditions aren't met (DSCR below threshold), or may be applied to additional debt service.

### **Revenue Fund**

The account where all project revenue is initially deposited before flowing through the waterfall. The borrower deposits all project revenue into the revenue fund; the trustee then distributes from the revenue fund per the waterfall priorities.

### **Project Fund**

The account holding bond proceeds intended for the actual project (construction, acquisition, refinancing of existing debt, etc.). Equivalent to the construction fund for construction deals; the project fund concept is broader and covers non-construction uses.

### **The Cash Flow Waterfall**

The defined sequence of payments out of the revenue fund. The standard waterfall, from top to bottom:

* 1. Operating expenses (paid from operating revenue; sometimes outside the waterfall)
* 2. Trustee and administration fees
* 3. Senior debt service (interest, then principal)
* 4. DSRF replenishment (if drawn)
* 5. Subordinate debt service (if applicable)
* 6. R&R reserve funding
* 7. Operating reserve funding
* 8. Other required reserves
* 9. Surplus fund (for distribution to borrower or further allocation)

The exact waterfall varies by deal but the general principle holds: bondholder payments and reserves come first, sponsor distributions come last.

### **Cash Flow Sweep**

A provision that diverts excess cash to debt service or reserves before the borrower can take distributions. Triggered when financial metrics fall below defined thresholds (DSCR below 1.20x, occupancy below 90%, etc.). Provides protection for bondholders during stress periods.

### **Distribution Trap**

Similar to cash flow sweep — a provision that prevents the borrower from taking distributions when defined conditions aren't met. Distributions are 'trapped' in the surplus fund and held for the borrower until the trigger conditions are resolved.

### **Permitted Investments**

The defined types of investments that bond reserves can be invested in. Typically limited to government securities, agency securities, certain bank deposits, and money market funds rated AAA. Permitted investments are restricted to low-risk securities to ensure reserves are available when needed. The indenture specifies the permitted investments list.

### **MADS (Maximum Annual Debt Service)**

The largest annual debt service payment over the bond's life. Used as the basis for DSRF sizing in many tax-exempt structures. If a bond's annual debt service is $4 million in most years but $4.5 million in the peak year, MADS is $4.5 million.

### **12 Months Coverage**

A DSRF sizing convention — the DSRF equals 12 months of debt service (annual debt service). Sometimes used as an alternative to MADS-based sizing.

### **10% of Par**

Another DSRF sizing convention — the DSRF equals 10% of the original bond par amount. The lowest sizing option in the IRC §148(d) safe harbor (see next term).

### **IRC §148(d) Safe Harbor**

The IRS rule that defines the maximum DSRF size for tax-exempt bonds without triggering arbitrage rebate complications. The DSRF cannot exceed the lesser of: (a) maximum annual debt service (MADS), (b) 125% of average annual debt service, or (c) 10% of bond proceeds. The smallest of these three is the maximum DSRF. Most bonds size the DSRF at MADS if MADS doesn't exceed the other two thresholds.

## **Section 12 — Covenants and Defaults**

Bond covenants are the promises the borrower makes to bondholders in the indenture. They define the borrower's ongoing obligations and the events that trigger default. This section covers the major covenant types and what happens when covenants are breached.

### **Covenant (Overview)**

A promise by the borrower in the indenture. Could be a promise to maintain a financial metric (DSCR above 1.20x), to deliver reports (annual audited financials), to take a specific action (maintain insurance), or to refrain from an action (no liens senior to the bondholders). Covenants protect bondholders by ensuring the borrower behaves in defined ways.

### **Financial Covenant**

Covenants based on financial metrics — DSCR, leverage, days cash on hand, debt yield, occupancy. The borrower must maintain the metric at or above (or at or below) a defined threshold. Financial covenants are tested periodically — typically quarterly with annual reporting required.

### **Affirmative Covenant**

A covenant requiring the borrower to do something — maintain insurance, deliver financial reports, comply with laws, pay taxes, maintain corporate existence. The borrower has an ongoing affirmative obligation to perform.

### **Negative Covenant**

A covenant prohibiting the borrower from doing something — no additional debt, no liens, no sale of assets, no fundamental changes, no transactions with affiliates. The borrower must refrain from the prohibited action.

### **Reporting Covenant**

Specific affirmative covenants requiring the borrower to deliver defined reports — annual audited financials, quarterly unaudited financials, compliance certificates, operating reports. Reporting covenants are what makes ongoing oversight possible.

### **Operational Covenant**

Covenants relating to the project's operations — minimum occupancy, minimum revenue per unit, minimum operating margins, specific business practices. Sector-specific and structurally important.

### **Debt Service Coverage Ratio (DSCR)**

The most common financial covenant. DSCR equals Net Operating Income (NOI) divided by Debt Service. A DSCR of 1.20x means cash flow is 120% of debt service — the borrower has 20% cushion above their debt service obligation. Higher DSCR is better; lower is worse. Typical DSCR covenant thresholds are 1.05x to 1.40x depending on sector and rating target.

Real example: A senior living facility with $5 million in net operating income and $4 million in annual debt service has a DSCR of 1.25x. If the indenture requires a 1.20x DSCR, the facility is in compliance. If NOI drops to $4.5 million (DSCR 1.125x), the facility breaches the covenant.

### **MADS Coverage**

A variant of DSCR that uses Maximum Annual Debt Service as the denominator rather than the current year's debt service. Used in tax-exempt structures where debt service varies year to year. MADS coverage is more conservative than current-year DSCR because MADS is always higher than (or equal to) current debt service.

### **Additional Bonds Test (ABT)**

A covenant restricting the borrower's ability to issue additional bonds. Typically requires the borrower to demonstrate that, after the new bonds, the DSCR (or MADS coverage) would still meet a defined threshold — often 1.20x or higher. The ABT prevents the borrower from layering on more debt that would undermine existing bondholders' coverage.

### **Rate Covenant**

In utility revenue bonds and similar structures, a covenant requiring the borrower to set rates sufficient to maintain a defined coverage ratio. Forces the utility to raise rates if necessary to maintain debt service capacity.

### **Leverage Ratio (Debt/EBITDA)**

A corporate covenant. Total debt divided by EBITDA (earnings before interest, taxes, depreciation, amortization). Lower is better. Typical thresholds: investment grade typically below 4.0x; high-yield typically 4.0-6.0x; distressed above 6.0x.

### **Fixed Charge Coverage Ratio (FCCR)**

Similar to DSCR but includes operating leases in the denominator. FCCR = EBITDAR (EBITDA plus rent) divided by (Interest + Rent + Required Principal Payments). Used for asset-light operating companies where leases are a major fixed obligation.

### **Debt Yield**

Net Operating Income divided by total debt. Expressed as a percentage. Common real estate covenant. A debt yield of 9% on a $50 million bond means the property generates $4.5 million in NOI. Higher is better. Typical thresholds: 8%-12% depending on asset class.

### **Days Cash on Hand**

The number of days of operating expenses the borrower has in cash and short-term investments. Common healthcare and senior living covenant. Calculated as (Cash + Short-Term Investments) / (Annual Operating Expenses / 365). Higher is better. Typical thresholds: 100-200+ days for healthcare and senior living.

### **Liquidity Covenant**

Generic term for any covenant requiring the borrower to maintain a defined level of liquidity — cash, working capital, available credit. Could be expressed in absolute dollars, days of operating expenses, or working capital ratio.

### **Net Worth Covenant**

A covenant requiring the borrower to maintain a defined level of net worth (equity, retained earnings, or some measure of capitalization). Less common in middle-market bond deals; more common in bank lending.

### **Restricted Payments**

A covenant restricting the borrower's ability to make distributions to owners — dividends, distributions, share buybacks, payments to affiliates. Typically permitted only when the borrower meets defined financial tests. Common in high-yield corporate bonds and in conduit deals where distributions to the sponsor could weaken the credit.

### **Restricted Subsidiaries**

In corporate bond structures with multiple subsidiaries, the defined group of subsidiaries that are subject to the bond's covenants. Subsidiaries outside the restricted group (the 'unrestricted subsidiaries') aren't bound by the covenants. The distinction matters because it defines the borrower's ability to operate other businesses outside the bond structure.

### **Change of Control**

A covenant or trigger event tied to a change in ownership of the borrower. Typically: if more than 50% of the borrower's equity changes hands, the bondholders have specific rights — often the right to put the bonds back at par or 101. Protects bondholders against changes that might affect the credit.

### **Material Adverse Change (MAC)**

A defined event constituting a material adverse change in the borrower's business, financial condition, or prospects. MAC clauses are intentionally broad — they're designed to catch significant deteriorations that aren't covered by other specific covenants. Often subjective and litigated.

### **Cross-Default**

A covenant triggering default under the bond if the borrower defaults under other material debt. Prevents bondholders from being last in line if the borrower's other obligations are in default. The threshold for triggering cross-default is typically defined ('default under debt of $10 million or more').

### **Event of Default**

A specific event that constitutes a default under the indenture, giving bondholders the right to accelerate the bond (declare all principal immediately due). Common events of default: payment default (missed interest or principal), covenant default (breach of financial or operational covenants), bankruptcy of the borrower, cross-default under other material debt, material misrepresentation.

### **Cure Period**

A defined period after a covenant breach during which the borrower can cure the breach without triggering an event of default. Typical cure periods: 30 days for payment defaults (sometimes shorter), 60-90 days for financial covenant breaches, 30 days for operational covenant breaches. The cure period gives the borrower time to fix the problem before bondholder remedies become available.

### **Equity Cure**

A specific cure provision allowing the borrower to cure a financial covenant breach by contributing additional equity. The equity contribution is typically deemed to be added to EBITDA (or the relevant denominator) for purposes of the covenant test. Equity cures are typically limited (e.g., usable only 2-3 times during the bond's life, capped at certain amounts).

### **Waiver**

A formal agreement by bondholders to waive a specific covenant breach. Waivers require bondholder consent (typically majority or supermajority depending on the covenant). Waivers are usually obtained when the breach is temporary, when the borrower is otherwise sound, and when bondholders prefer to avoid default proceedings.

### **Forbearance**

A formal agreement by bondholders to refrain from exercising default remedies for a defined period. More limited than a waiver — the covenant breach still exists, but bondholders agree not to take action. Forbearance agreements typically include defined commitments from the borrower (delivery of a restructuring plan, additional reporting, fees) in exchange for the forbearance.

### **Amendment**

A formal modification of the indenture. Amendments require bondholder consent — majority or supermajority for most modifications, unanimous for changes to payment terms. Used when the indenture needs to be modified to accommodate changed circumstances (restructuring, refinancing, sponsor-level changes).

## **Section 13 — Credit Enhancement**

Credit enhancement is anything that improves a bond's credit profile beyond the borrower's standalone credit. Used to access better ratings, tighter pricing, or buyer pools that wouldn't otherwise accept the deal. This section covers the major credit enhancement types.

### **Credit Enhancement (Overview)**

The general concept: a third party provides additional credit support to the bondholders. The third party could be a bank (letter of credit), an insurance company (bond insurance, surety), a federal agency (USDA, HUD), or a stronger affiliated entity (parent guarantee). The bondholders rely on the third party's credit in addition to (or instead of) the borrower's credit.

### **Letter of Credit (LOC)**

A bank's commitment to pay bondholders if the borrower doesn't. Used most commonly in VRDOs but also in some fixed-rate structures. The LOC is typically the most expensive form of credit enhancement but provides the strongest protection — the bank pays on demand without questioning the underlying default.

### **Direct-Pay LOC**

A LOC where the trustee draws on the LOC for every debt service payment, then is repaid by the borrower. The bondholders are paid by the bank, not by the borrower. Used in VRDO structures where the bank is the primary payment source.

### **Standby LOC**

A LOC where the trustee draws only if the borrower fails to pay. The bondholders are paid by the borrower in the normal course; the LOC backstops failure. Less common than direct-pay in tax-exempt structures.

### **Bond Insurance**

An insurance policy issued by a financial guaranty insurer (a 'monoline insurer'). The insurer pays the bondholders if the borrower defaults. The bonds carry the insurer's rating (typically AA or AAA depending on the insurer) rather than the underlying credit. Common in the muni market historically; market shrank after 2008 but still relevant.

Real example: Build America Mutual (BAM) and Assured Guaranty are the two largest active muni bond insurers. Bond insurance fees typically run 0.5%-2.0% of principal and interest payments, paid upfront at closing. The economic question is whether the rating uplift from the insurance produces enough spread tightening to offset the cost.

### **Financial Guaranty**

Generic term for bond insurance. Same product, same providers. 'Bond insurance' is more common in muni market; 'financial guaranty' more common in corporate market.

### **Surety Wrap**

A surety bond from an insurance company guaranteeing the bond's payment. Less common than bond insurance but used in certain structures. The surety pays if the borrower defaults.

### **Parent Guarantee**

A guarantee from the borrower's corporate parent. The parent agrees to pay if the operating subsidiary doesn't. Useful when the parent has a stronger credit profile than the operating subsidiary. Common in corporate finance for special-purpose subsidiaries; less common in muni conduit deals.

### **Corporate Guarantee**

Generic term for any guarantee from an affiliated corporate entity. Parent guarantee is the most common form; sister-company guarantees and other arrangements also occur.

### **Federal Guarantee Programs (Overview)**

Several federal agencies guarantee debt for specific sectors and project types. Each program has detailed eligibility requirements and ongoing compliance obligations. Federal guarantees typically provide AAA-equivalent credit and meaningfully reduce financing costs.

### **USDA Loan Guarantee**

USDA Rural Development programs guarantee loans for rural businesses, rural housing, rural infrastructure, and specific sectors (rural healthcare facilities, rural senior living, agricultural processing). USDA Business and Industry (B&I) guarantees cover up to 80% of loan principal. USDA Community Facilities guarantees cover essential community infrastructure. Each program has detailed application processes and approval timelines (typically 6-18 months).

### **HUD Insurance and the FHA Programs**

Federal Housing Administration (FHA) programs, administered by HUD, insure mortgages and bonds for housing-related projects. Key programs:

**Section 221(d)(4) —** FHA insurance for new construction and substantial rehabilitation of multifamily rental housing.

**Section 223(f) —** FHA insurance for refinancing or acquisition of existing multifamily properties.

**Section 232 —** FHA insurance for senior living facilities, including skilled nursing, assisted living, and intermediate care.

**Section 242 —** FHA insurance for hospital projects.

FHA-insured deals can be structured with HUD-insured bonds or Ginnie Mae securities. The federal guarantee produces AAA-equivalent credit. FHA processing timelines are long (12-24+ months for new construction).

### **GNMA (Ginnie Mae)**

Government National Mortgage Association. Federal agency that guarantees mortgage-backed securities backed by federally insured mortgages (FHA, VA, USDA). GNMA-backed securities carry the full faith and credit of the US government. Common wrapping mechanism for FHA-insured multifamily and senior living bond deals.

### **Moral Obligation Pledge**

A non-binding governmental commitment to consider replenishing a depleted DSRF through annual appropriation. The pledge is 'moral' rather than legal — the government isn't legally required to honor it, but historically governments have honored their moral obligation pledges to maintain market access. Common in state housing finance agency mortgage revenue bonds. Provides rating uplift compared to no governmental support but isn't as strong as a direct guarantee.

### **State Intercept**

In school district and certain other governmental financings, a state law authorizing the state to intercept state aid payments to the underlying entity and redirect them to bond debt service if the entity defaults. State intercepts provide rating uplift by adding state credit support to local government credits.

### **Cash Collateral**

Cash deposited with the trustee to backstop specific obligations. Could be an over-funded DSRF, a development reserve, an interest reserve, or other defined account. Cash collateral provides the strongest form of credit support (the money is sitting there waiting) but ties up borrower equity.

### **Securities Collateral**

Investment securities (Treasuries, agency securities, money market instruments) pledged as collateral. Similar function to cash collateral but allows the borrower to earn investment returns on the pledged assets. Subject to permitted investment restrictions.

## **Section 14 — Tranching and Capital Stack**

Many bond deals split into multiple tranches with different priorities, durations, or risk profiles. Plus, bonds usually sit within a broader capital structure including sponsor equity, tax credit equity, soft loans, and other capital sources. This section covers the major tranching concepts and capital stack components.

### **Tranche**

A specific portion of a bond issuance with defined characteristics — maturity, coupon, priority, etc. A single deal can have multiple tranches sold to different buyer pools at different prices. Common tranching dimensions: maturity (serial vs term), priority (senior vs subordinate), tax status (governmental vs PAB), or coupon type (fixed vs floating).

### **Senior Tranche**

The most senior bonds in a multi-tranche structure. Senior bonds have first claim on the obligor's cash flow and collateral, before any subordinate tranches. Senior bonds typically receive the highest rating in the structure and the tightest pricing.

### **Subordinate Tranche**

Bonds that rank behind the senior tranche. Subordinate bonds receive payments only after senior debt service is current. Higher yield to compensate for the increased risk. Common in commercial real estate, affordable housing, and structured corporate deals.

### **Mezzanine Tranche**

A tranche between senior and subordinate. Mezz often combines debt features (fixed coupon, scheduled amortization) with equity features (warrants, conversion rights, profit participations). Mezz typically prices wider than senior debt but tighter than pure equity.

### **Sequential Pay**

A tranching structure where principal payments go to one tranche first until it's fully retired, then to the next tranche, etc. The first tranche has the shortest expected duration; the last tranche has the longest. Common in structured securities.

### **Pro Rata Pay**

A tranching structure where principal payments are distributed proportionally across tranches. Each tranche amortizes at the same rate. Simpler than sequential pay.

### **Turbo Amortization**

A structure where excess cash flow accelerates principal payments beyond the scheduled amortization. The bondholders receive more principal earlier when cash flow allows; the borrower benefits from faster deleveraging. Used in structures where the borrower wants to retire debt aggressively.

### **Blocked Amortization**

A provision that prevents principal payments to subordinate tranches when defined conditions aren't met (typically senior debt coverage below threshold). Cash that would otherwise pay subordinate principal is trapped or diverted to senior.

### **Lockout Period**

A period during which a specific tranche receives no principal payments. Used to create defined duration profiles — a tranche with a 5-year lockout receives interest only for 5 years, then begins receiving principal.

### **LIHTC (Low-Income Housing Tax Credit)**

Federal tax credit program supporting affordable housing development. Investors receive federal tax credits over 10 years in exchange for equity investments in qualifying affordable housing projects. LIHTC equity is the primary source of equity capital in tax-exempt affordable housing bond deals — typically 30-50% of total project cost.

Real example: A $100 million tax-exempt affordable housing deal might have: $65 million in tax-exempt bonds (PAB allocation), $30 million in LIHTC equity, $5 million in soft loan from state housing trust fund, and $0-$5 million in deferred developer fee. The LIHTC equity is what makes the deal feasible — without it, the rents required to service all-debt financing would exceed affordable housing rent caps.

### **Tax Credit Equity**

Equity investments where the return is primarily through tax credits rather than cash returns. LIHTC is the primary tax credit in affordable housing. Other federal tax credits include New Markets Tax Credits (NMTC), Historic Tax Credits, and Renewable Energy Tax Credits.

### **Deferred Developer Fee**

Developer fee that is earned but not paid at closing — instead held back and paid over time from project cash flow. Common in affordable housing and other tax credit structures. The deferred portion bridges the funding gap and aligns developer incentives with project performance.

### **Soft Loan**

Below-market debt financing, typically from a government or quasi-government source. Could be 0% interest with deferred principal, or low fixed-rate with cash-flow-contingent payments. Common in affordable housing (state and local housing trust funds), in community development (CDFI loans), and in some economic development projects.

### **Gap Financing**

Generic term for the financing that bridges the difference between project cost and available senior debt + equity. Could be subordinate bonds, mezz debt, soft loans, deferred developer fee, sponsor preferred equity, or other sources. Almost every middle-market deal has some gap financing component.

### **Sponsor Equity**

The cash equity contribution from the project sponsor (the developer, operator, or investor). Required minimum sponsor equity varies by deal type: typically 10%-20% for senior living, 15%-25% for hospitality, 20%-30% for hotel-anchored mixed use, 10%-15% for affordable housing. Sponsor equity is the most subordinate position — last to be paid, first to absorb losses.

### **Preferred Equity**

Equity with debt-like features — defined preferred return, defined repayment timing, priority over common equity. Sits below all debt but above common equity in the capital stack. Used to bridge gaps when senior debt and tax credit equity aren't sufficient.

## **Section 15 — Pricing and Yield Concepts**

Bond pricing is expressed in multiple ways depending on context — yield, spread, basis points. Understanding these terms is essential to discussing bond market dynamics. This section covers the major pricing concepts.

### **Coupon Rate**

Cross-reference to Section 2.3. The annual interest rate stated on the bond.

### **Current Yield**

Annual coupon divided by current bond price. A 5% coupon bond trading at $1,025 has a current yield of 4.88% ($50 / $1,025). Simple to calculate but doesn't account for the bond's path to maturity. Less commonly used than yield to maturity.

### **Yield to Maturity (YTM)**

The total return an investor will earn if they hold the bond to maturity. Includes both the coupon payments and the gain or loss between purchase price and par. The most common yield measure. Computed assuming all coupons are reinvested at the YTM rate.

### **Yield to Call (YTC)**

Same calculation as YTM but assumes the bond is called at the first call date rather than held to maturity. Relevant for premium bonds that may be called when interest rates fall.

### **Yield to Worst (YTW)**

The lower of YTM and YTC. Represents the worst-case yield assuming the borrower exercises whatever optional redemption is least favorable to the bondholder. Often quoted as the relevant yield for callable bonds.

### **Yield to Average Life (YTAL)**

Yield calculated assuming the bond amortizes at its average life — the weighted-average time to principal repayment. Used for amortizing bonds (mortgage-style, sinking fund) where YTM doesn't capture the actual cash flow timing.

### **Basis Point (bp)**

One one-hundredth of a percentage point. 100 basis points equals 1%. 25 basis points equals 0.25%. Used to describe small yield differences. A bond pricing '15 basis points wider' means its yield is 0.15% higher than a comparison point.

### **Spread (Overview)**

The yield difference between two bonds or a bond and a benchmark. Multiple spread types exist depending on the benchmark.

### **G-Spread (Treasury Spread)**

Yield over the comparable-maturity US Treasury. A bond yielding 5.25% with a 10-year Treasury yielding 4.00% has a G-spread of 125 basis points. The most common spread measure for taxable corporate bonds.

### **Z-Spread**

Yield over the Treasury spot curve, computed as the constant spread that, when added to each Treasury spot rate, prices the bond to its market price. More technically rigorous than G-spread for amortizing bonds and complex structures. Common in structured finance.

### **Option-Adjusted Spread (OAS)**

Z-spread adjusted for embedded options (calls, puts). OAS strips out the value of the optionality, leaving the spread attributable to credit and liquidity. Used for callable bonds where Z-spread overstates the spread due to option value.

### **Asset Swap Spread**

Yield over the LIBOR or SOFR swap curve. Computed by entering an asset swap (an interest rate swap that converts the bond's fixed coupon to floating). Common in institutional fixed-income trading.

### **MMD (Municipal Market Data) Spread**

In the muni market, yield over the MMD AAA muni curve. MMD publishes a daily yield curve for AAA-rated tax-exempt bonds. A muni bond's spread to MMD measures its credit and structural quality versus the highest-quality muni benchmark.

### **SIFMA Index**

The Securities Industry and Financial Markets Association Municipal Swap Index — a weekly index of variable-rate tax-exempt yields. The benchmark for VRDO rates. Most VRDOs reset to SIFMA plus a defined spread.

### **Duration**

A measure of the bond's price sensitivity to interest rate changes. Higher duration means more price volatility for a given rate change. Three main types:

**Macaulay Duration —** The weighted-average time to the bond's cash flows. Expressed in years.

**Modified Duration —** The percentage change in bond price for a 1% change in yield. Macaulay duration divided by (1 + yield).

**Effective Duration —** Duration adjusted for embedded options. Used for callable and putable bonds.

Real example: A 10-year non-callable corporate bond might have a modified duration of 7.5 years. A 1% increase in yield would cause the bond price to drop by approximately 7.5%.

### **Convexity**

The curvature of the price-yield relationship. Positive convexity means the bond gains more from yield decreases than it loses from equivalent yield increases (favorable to bondholders). Negative convexity means the opposite (favorable to borrowers). Callable bonds have negative convexity at the call point.

### **DV01**

Dollar value of a basis point. The dollar change in bond price for a 1 basis point change in yield. Used by traders to size positions and hedges. A bond with DV01 of $850 changes by $850 for each basis point of yield change.

### **Key Rate Duration**

Duration with respect to specific points on the yield curve (2-year, 5-year, 10-year, 30-year). Decomposes duration into curve sensitivities. Used by portfolio managers to manage curve risk.

## **Section 16 — Rating Categories**

Bond ratings are letter grades assigned by rating agencies that summarize the bond's credit quality. The major scale is widely known but the gradations within each category matter enormously for pricing. This section covers the rating scale and what each level means.

### **Investment Grade vs Non-Investment Grade**

The fundamental rating split. Investment grade (BBB- or higher by S&P and Fitch; Baa3 or higher by Moody's) means the bond is considered low credit risk and suitable for institutional investors with conservative mandates. Non-investment grade (BB+ or lower; Ba1 or lower) means higher credit risk, narrower buyer pool, wider pricing. The cutoff between BBB- and BB+ is one of the most important thresholds in the bond market.

### **AAA / Aaa**

The highest possible rating. Reserved for the strongest credits: US Treasuries, certain government bonds, certain insured/guaranteed bonds, the strongest corporate credits (Microsoft, Johnson & Johnson). Very few middle-market deals achieve standalone AAA; most AAA muni bonds get their rating from credit enhancement.

### **AA Categories (AA+, AA, AA-)**

Very strong credits, one notch below AAA. Major state governments, major hospital systems, top-tier corporates. AA+ is the highest within the AA category, AA- the lowest. Typical pricing on AA tax-exempt: MMD plus 25-50 basis points depending on sector and structure.

### **A Categories (A+, A, A-)**

Strong credits, the typical landing point for well-structured middle-market revenue bonds. Most established hospital systems, mature senior living systems, strong utility revenue bonds. Typical pricing: MMD plus 50-100 basis points.

### **BBB Categories (BBB+, BBB, BBB-) — the Investment Grade Floor**

The lowest investment grade ratings. The line between BBB- and BB+ is the line between investment grade and non-investment grade — crossing it dramatically narrows the buyer pool and widens pricing. Many middle-market bonds price in the BBB category. Typical pricing: MMD plus 100-175 basis points.

### **BB Categories (BB+, BB, BB-) — Non-Investment Grade Begins**

Speculative grade. Buyers are specialized credit funds and high-yield managers rather than mainstream investment grade portfolios. Pricing is significantly wider. Typical: MMD plus 250-400 basis points or wider depending on the deal.

### **B Categories (B+, B, B-)**

Deeper into speculative territory. Significant credit risk. Pricing typically 400-700+ basis points over MMD or comparable taxable benchmarks. Buyer pool is even narrower.

### **CCC and Below**

Substantially distressed or distressed credits. Pricing reflects significant default expectations. Bond often trades on a price basis (cents on the dollar) rather than yield basis.

### **D (Default)**

Bond is in default. Rating agencies use D to indicate that a payment default has occurred or that the issuer has filed for bankruptcy.

### **NR (Not Rated)**

Bond has no rating from this agency. Could mean the issuer didn't request a rating, or the rating was withdrawn, or the deal was structured to avoid rating. Many middle-market deals are unrated (privately placed with QIBs who can evaluate the credit themselves).

### **Outlook (Stable, Positive, Negative, Developing)**

The rating agency's forward view on the rating. Stable means no expected change. Positive means upgrade is more likely than downgrade over the next 12-18 months. Negative means downgrade more likely. Developing means the direction depends on uncertain factors. Outlook is published alongside the rating and reviewed at least annually.

### **CreditWatch (Watch List)**

A more imminent signal than outlook. CreditWatch means the rating is under active review and likely to change within 90 days. Positive CreditWatch means upgrade is likely; Negative CreditWatch means downgrade is likely. Triggered by specific events (M&A, rating methodology changes, financial deterioration).

### **Moody's Investors Service**

One of the three major NRSROs (with S&P and Fitch). Uses the 'Aaa/Aa1/Aa2/Aa3/A1/A2/A3/Baa1/Baa2/Baa3/Ba1...' scale. Owned by Moody's Corporation. Significant market share in muni ratings and structured finance.

### **S&P Global Ratings**

Another of the three majors. Uses the 'AAA/AA+/AA/AA-/A+/A/A-/BBB+/BBB/BBB-/BB+...' scale. Owned by S&P Global. Largest market share in corporate ratings.

### **Fitch Ratings**

Third of the three majors. Uses the same scale as S&P. Smaller market share but full coverage across sectors. Often used as a third rating to gain market access for borderline investment grade credits.

### **Kroll Bond Rating Agency (KBRA)**

Smaller NRSRO with significant market share in CMBS, structured finance, and specialty muni sectors. Used as a complement to or substitute for the major three in certain sectors (charter schools, senior living, some healthcare).

### **DBRS Morningstar**

Canadian-origin rating agency, NRSRO-designated. Smaller market share but growing presence in US structured finance and certain muni sectors.

## **Section 17 — Refundings, Restructurings, and Workouts**

Bonds don't always run to maturity as originally issued. Borrowers refund bonds to capture savings or extend maturities. Borrowers in distress restructure or work out their debt. This section covers the major paths bonds take when something changes.

### **Refunding (Overview)**

Issuing new bonds to retire old bonds. Could be motivated by lower current interest rates (capture NPV savings), restructuring needs (extend maturities, modify covenants), or operational needs (eliminate restrictive covenants from old indenture, consolidate multiple series). The most common transaction type in the muni market by volume — refundings often exceed new money issuance in low-rate environments.

### **Current Refunding**

Cross-reference to Section 5.10. Refunding within 90 days of the old bonds' call date or maturity. Standard refunding mechanic for tax-exempt bonds post-TCJA. The new bonds' proceeds pay off the old bonds when the old bonds become callable.

### **Advance Refunding**

Cross-reference to Section 5.11. Refunding more than 90 days before the old bonds' call date. Permitted only with taxable bonds for tax-exempt issuers (TCJA eliminated tax-exempt advance refunding). The new bond proceeds fund an escrow account that pays the old bonds' debt service through the call date.

### **Forward Refunding**

A refunding structured as a forward delivery — pricing today for closing on a future date (typically 90 days from pricing). Allows the borrower to lock in today's rates for a future refunding while remaining within the current refunding rules. Used when the call date is more than 90 days but less than 180 days away.

### **Crossover Refunding**

A refunding where the old and new bonds are simultaneously outstanding for a defined period. The new bond proceeds fund an escrow that pays old bond debt service until the call date; at the call date, the old bonds are called and the new bonds' debt service begins flowing from operating cash flow. Used when advance refunding rules require careful structuring.

### **Refunding NPV Savings**

The present value of expected debt service savings from a refunding. Calculated as the difference between the present value of the old bonds' remaining debt service and the present value of the new bonds' debt service, discounted at a defined rate (usually the new bonds' yield). Industry conventions typically require minimum NPV savings of 3%-5% of refunded par to justify a refunding.

Real example: A refunding of $40 million of 5.25% bonds with 12 years remaining, replaced by 4.00% new bonds with the same amortization, generates approximately $4-5 million of NPV savings (10-12% of refunded par). Highly economic refunding.

### **Restructuring**

A modification of existing bonds' terms, usually in response to borrower distress. Could include extending maturities, reducing coupons, modifying covenants, exchanging bonds for new instruments, or other changes. Requires bondholder consent — typically majority for most modifications, supermajority for payment-term changes.

### **Workout**

The broader process of resolving distressed bond obligations. May involve restructuring, forbearance, asset sales, bankruptcy, or combinations. The workout process is typically managed by a workout specialist (the financial advisor, a specialty restructuring firm, or in some cases the trustee) coordinating among the borrower, the bondholders, and other stakeholders.

### **Forbearance Agreement**

Cross-reference to Section 12.26. A formal agreement by bondholders to refrain from exercising default remedies for a defined period. Used to buy time during workouts.

### **Exchange Offer**

An offer to bondholders to exchange existing bonds for new bonds with different terms. Used in restructurings to modify bond terms without requiring 100% bondholder consent — bondholders who don't accept the exchange keep their existing bonds. The exchange is structured to make participation more attractive than non-participation.

### **Tender Offer**

An offer to bondholders to sell their bonds back at a defined price. Used to retire bonds early outside the normal call mechanism. Could be at par, at a premium, or at a discount (in distressed situations). Bondholders elect whether to tender; the borrower buys the tendered bonds with available cash.

### **Distressed Exchange**

An exchange offer in distressed circumstances — typically at a discount to face value. Bondholders accept the exchange because the alternative (default and bankruptcy) is worse. Distressed exchanges typically trigger 'restricted default' or 'selective default' ratings from the rating agencies.

### **Chapter 11 Reorganization**

Federal bankruptcy proceeding where the borrower restructures its debt under court supervision. The borrower continues operating; a plan of reorganization is developed and confirmed by the court with creditor approval. Bonds may be modified, exchanged, or paid in cash through the plan. Most middle-market corporate distressed situations are resolved through Chapter 11 or out-of-court workouts that achieve similar results.

### **Chapter 7 Liquidation**

Federal bankruptcy proceeding where the borrower's assets are sold and proceeds distributed to creditors. The borrower ceases operations. Bondholders receive their share of liquidation proceeds based on priority — secured bondholders typically recover more than unsecured. Less common than Chapter 11 for operating businesses.

### **Recovery Rate**

The percentage of par recovered by bondholders in a default scenario. Senior secured bonds typically have higher recovery rates (60-80% of par) than unsecured (20-50%) or subordinate (0-30%). Rating agencies publish historical recovery statistics by seniority and sector.

### **Loss Given Default (LGD)**

The complement of recovery rate. If recovery is 65%, LGD is 35%. Used in credit modeling to estimate expected loss in default scenarios.

### **Probability of Default (PD)**

The estimated probability that the borrower will default within a defined period (typically one year or over the bond's life). Rating agencies and credit models estimate PDs based on financial metrics, sector dynamics, and structural features. Investment grade typically implies PD below 1% over the next year; high yield implies PD of 2-10% or higher.

### **Expected Loss (EL)**

Probability of Default multiplied by Loss Given Default. The expected dollar loss on a bond, expressed as a percentage of par. The fundamental risk-pricing measure for fixed income. Bonds are priced to compensate investors for expected loss plus a risk premium and a liquidity premium.

# **PART 3 — BOND OPERATIONS: THE OPERATOR'S FIELD GUIDE**

Part 3 is the eighteen-silo operational deep-dive on bond mechanics. It treats each subject area at operator depth: anatomy, players, workflow, documents, fees, optionality, covenants, reserves and waterfalls, credit enhancement, tranching, pricing, post-closing administration, refundings and workouts, risk rating, modeling, rule architecture, agent specifications, and tech stack wire-up. Each silo runs at field-guide depth — written as if to a competent senior banker, with no hand-holding on basics.

Part 3 is the operator's field guide. Part 2 (Glossary) provides the foundational vocabulary; Part 3 builds the operator depth on top of that vocabulary. The two parts work together — read the relevant glossary entries first when the terminology is unfamiliar, then come to Part 3 for the operator-depth treatment.

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

* Financial covenants — quantitative tests the borrower must meet (DSCR, leverage, debt yield, additional bonds tests, rate covenants)
* Affirmative covenants — things the borrower must do (maintain insurance, pay taxes, deliver financials, maintain corporate existence)
* Negative covenants — things the borrower cannot do without consent (additional debt, liens, asset sales, dividends, related-party transactions, fundamental changes)
* Reporting covenants — what gets delivered to whom and when (annual audits, quarterly statements, monthly compliance certificates, continuing disclosure filings)
* Operational covenants — sector-specific obligations (occupancy minimums for housing, enrollment minimums for charter schools, licensure maintenance for healthcare)
* Anti-dilution covenants — protect bondholders from structural subordination by limiting additional debt at the borrower or affiliated levels

Covenant design is one of the most under-appreciated craft areas in middle-market bond work. Too loose and the bond can't be sold or gets a punishing pricing penalty. Too tight and the borrower trips the covenants in normal operating fluctuations, triggering events of default for no real reason and creating headaches that consume banker time and erode the relationship. The art is in the cushions — setting covenant thresholds with enough margin above expected operating performance that normal volatility doesn't trip them, while tight enough that real deterioration is captured early enough to act.

## **1.7 Remedies — What Bondholders Can Do If the Borrower Breaches**

Every indenture contains a remedies section that defines what counts as an Event of Default, who has standing to declare it, what the consequences are, and how bondholders can collect. The remedies architecture is what makes the covenants real — covenants without remedies are aspirations. Remedies are typically:

* Acceleration — declaring all principal immediately due and payable upon default
* Trustee action — the trustee, acting on instructions from a defined majority of bondholders, can sue, foreclose on collateral, take possession of pledged assets, or pursue other contractual remedies
* Receivership — in extreme cases, a court-appointed receiver takes operational control of the obligor or the pledged project
* Specific performance — court order requiring the borrower to perform a specific obligation
* Cumulative remedies — bondholders can pursue any or all available remedies in parallel

Cure periods and grace periods are negotiated heavily. A 30-day cure period for a payment default vs. a 60-day cure period changes the effective bondholder protection materially. Material adverse change clauses, cross-default provisions (default under another debt triggers default here), and bankruptcy provisions are the most consequential. Nest's structuring agents will treat the remedies section with the same care as the covenants section — they are two halves of the same protection.

## **1.8 Reserves — The Cash Buffer Architecture**

Reserves are pools of cash held by the trustee for defined purposes, sourced either from bond proceeds at issuance, from operating cash flow over time, or from a combination. Reserves are the most concrete form of bondholder protection — covenants signal problems, but reserves actually pay the bonds when operating cash flow can't. Every reserve gets defined in the indenture with: (a) initial funding amount and source, (b) minimum balance requirement, (c) replenishment mechanism if drawn, (d) permitted uses, (e) release mechanism at maturity or under defined conditions, (f) investment restrictions on how the reserve cash is held.

The major reserve types in middle-market bond work are:

* Debt Service Reserve Fund (DSRF) — typically sized at maximum annual debt service (MADS); first call if operating cash flow falls short of debt service
* Capitalized Interest (Cap-I) — funds interest payments during the construction or ramp-up period before the project generates cash flow
* Replacement and Repair Reserve (R&R) — funds long-term capital maintenance; typical sizing is $200-$500 per unit per year for multifamily, varies by asset class
* Operating Reserve — funds the project's working capital cushion; typically 3-6 months of operating expenses
* Insurance and Tax Escrow — funds collected from operating cash flow to pay insurance premiums and property taxes when due
* Rebate Fund — for tax-exempt bonds, holds the IRS arbitrage rebate liability
* Surplus Fund — receives excess cash flow after all senior obligations met; available for defined uses (additional reserves, redemption, equity distribution per the waterfall)
* Construction Fund — holds bond proceeds during construction, released to the borrower against draw requests
* Costs of Issuance Fund — pays the upfront fees from bond proceeds at closing

The full waterfall design — the order in which cash flows from the obligor get applied to each reserve, debt service, operating expenses, and surplus — is the elegant heart of every well-structured bond. The waterfall is what makes a 7%-yielding revenue stream into a 4.5%-yielding investment-grade bond, because the waterfall ensures that even when revenue falls 30%, bondholders get paid before equity, before operators, before any party except contractually senior claims.

## **1.9 Credit Enhancement — Outside Support**

When the underlying credit is not strong enough to achieve the target rating or pricing, the structure can be enhanced by an outside party. The bond effectively borrows the credit of the enhancement provider. Enhancement is a separate full silo (Silo 9 — Credit Enhancement) and is covered there in depth. At the anatomy level, the inventory is:

* Letter of Credit (LOC) — a bank guarantees debt service; bond rating links to the bank's rating; fee paid annually to the bank
* Financial Guaranty Insurance (Bond Insurance / Surety Wrap) — a monoline insurer guarantees debt service; bond rating links to the insurer's rating; premium paid upfront or annually
* Moral Obligation Pledge — a government entity (typically a state HFA) pledges to seek appropriation to support the bonds if the obligor defaults; not legally binding but practically supportive of rating
* State Intercept — a state agency commits to intercept state aid otherwise payable to the obligor and redirect it to debt service if needed (common in school district financings)
* Parent or Corporate Guarantee — a parent company guarantees the obligor's payments
* Sponsor Personal Guarantee — the individual sponsor personally guarantees; rare in bond context, common in adjacent loan products
* USDA / HUD / Other Federal Guarantee — federal program-specific credit support
* Cash Collateral — segregated cash held by the trustee that is available to pay debt service if needed (this is the 'cash secured' structure that came up earlier in conversation — rare but real)

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

* **Par** — face amount of the bond; what the borrower owes at maturity
* **Coupon** — periodic interest rate paid on par
* **Maturity** — date principal is due
* **Bullet bond** — 100% of principal repays at maturity
* **Serial bond** — principal repays in scheduled portions across multiple maturity dates
* **Sinking fund** — mandatory periodic principal redemption before stated maturity
* **CAB (Capital Appreciation Bond)** — interest accrues into principal; both paid at maturity
* **VRDO (Variable Rate Demand Obligation)** — variable rate bond with bondholder tender right
* **Optional redemption / call** — borrower's right to redeem early
* **Mandatory redemption** — required redemption upon defined trigger
* **Make-whole call** — call at a price that compensates bondholder for remaining cash flow at a reference rate
* **Par call** — call at face value (100)
* **Bondholder put** — bondholder's right to require redemption at defined price
* **Refunding** — issuing new bonds to retire old bonds
* **DSRF (Debt Service Reserve Fund)** — trustee-held reserve covering shortfalls in debt service
* **Capitalized Interest (Cap-I)** — bond-proceed reserve funding interest during construction/ramp
* **Conduit issuer** — government entity that issues bonds on behalf of private obligor; not on credit
* **Revenue bond** — secured by specified revenue stream, not general obligation
* **Tax-exempt** — interest exempt from federal income tax under IRS rules

### **Core Formulas**

**Coupon payment —** Coupon Rate × Par × Period Fraction (e.g., 5% × $1,000 × 0.5 = $25 semi-annual)

**Aggregate par —** Sum of all individual bond face amounts in the issue

**Net proceeds to borrower —** Aggregate Par − Underwriter Discount − Original Issue Discount (or + Original Issue Premium) − Costs of Issuance

### **Documents Referenced**

* Indenture (or Trust Indenture) — the master document defining every structural feature
* Loan Agreement — conduit-issuer-to-borrower document mirroring indenture obligations
* Tax Regulatory Agreement — for tax-exempt bonds, locks in qualification requirements
* Bond Purchase Agreement — issuer-to-underwriter document governing the placement

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

* State Housing Finance Agencies (HFAs) — multifamily affordable housing, single-family mortgage, occasionally healthcare adjacent
* State Health and Educational Facilities Authorities — hospitals, senior living, charter schools, colleges
* State Higher Education Facilities Authorities — colleges and universities
* State Industrial Development Authorities — manufacturing, certain qualified small issue
* State Public Power Authorities — utility and energy infrastructure
* County and Local Industrial Development Bonds — local economic development
* State Bond Banks — pooled financing for smaller municipal borrowers
* Special-Purpose Public Authorities — specific project authorities (airport, port, transit, water)

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

* Mid-tier broker-dealer with active municipal and / or corporate bond practice
* FINRA membership in good standing, clean regulatory history
* MSRB membership for muni capability
* Senior bankers with 15+ years of direct placement experience
* Active institutional buyer relationships across lifecos, bond funds, bank portfolios
* Annual placement volume of $500M-$3B (large enough to be credible, small enough to want Nest's deal flow as meaningful)
* Willingness to integrate with Nest's platform technically and operationally
* Cultural alignment on execution quality and client experience
* Compensation structure that aligns senior bankers' interest with the partnership

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

* **Issuer** — legal entity on the bonds
* **Obligor** — substantive debtor in conduit deals
* **Underwriter** — purchases bonds from issuer, resells to investors
* **Trustee** — corporate trust bank; bondholder representative
* **Bond Counsel** — law firm issuing legal opinion on validity and tax exemption
* **Disclosure Counsel** — separate counsel on disclosure compliance (larger deals)
* **Rating Agency** — Moody's, S&P, Fitch, Kroll, DBRS
* **Financial Advisor / Municipal Advisor** — issuer's fiduciary; Nest in this role on most deals
* **Conduit Issuer** — government entity issuing on behalf of private obligor
* **Paying Agent / Registrar** — processes payments to bondholders
* **Verification Agent** — CPA verifying escrow on refundings
* **Construction Monitor** — engineering / construction firm certifying draws
* **Feasibility Consultant** — sector specialist producing feasibility study
* **Market Study Consultant** — analyzes market for the financed project
* **Auditor** — independent CPA on financial statements
* **Insurance Broker** — confirms required insurance in place
* **Surety** — provides contractor's performance and payment bonds
* **BD Partner** — Nest's registered broker-dealer placement partner
* **Sponsor's Counsel** — obligor's general corporate counsel

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

* Issuer / Obligor — Indenture, Loan Agreement (conduit), Tax Regulatory Agreement, Bond Purchase Agreement, Officer's Certificate, all security documents
* Underwriter — Bond Purchase Agreement, Comfort Letter Reliance, DTC Letter of Representations
* Trustee — Indenture acceptance, Trustee's Certificate of Authentication
* Bond Counsel — Legal Opinion (validity, enforceability, tax exemption)
* Disclosure Counsel — Disclosure Opinion (when separate)
* Rating Agency — Indicative rating letter (delivered at closing as confirmation of rating)
* Auditor — Consent Letter, Comfort Letter
* Verification Agent — Verification Report (refundings only)
* Sponsor's Counsel — Borrower's Counsel Opinion (entity authorization, no conflicts)

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

* Trust Indenture — the master legal document
* Loan Agreement — conduit-issuer-to-obligor agreement (conduit deals only)
* Mortgage and Security Agreement — collateral pledge (where applicable)
* Assignment of Rents / UCC Financing Statements — perfecting security interests
* Regulatory Agreement — for affordable housing, locks in affordability restrictions
* Tax Regulatory Agreement — for tax-exempt deals, locks in qualification requirements
* Continuing Disclosure Agreement — borrower's ongoing disclosure undertaking
* Bond Purchase Agreement — issuer-to-underwriter terms
* Construction Disbursement Agreement — draw procedures for construction bonds
* Subordination Agreements — for subordinate debt holders and LIHTC investors if applicable
* Officer's Certificates — closing certificates from each party
* Forms of Bond Counsel Opinion, Borrower's Counsel Opinion, Underwriter's Opinion, Disclosure Opinion — opinion forms attached to indenture as exhibits

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

* **Draw administration** — $1K-$3K per draw + $3K-$6K monthly retainer during construction
* **Annual administration** — 15-30 bps annual on outstanding par
* **Amendment / consent fees** — $25K-$100K per event
* **Refunding structuring** — full new-issuance fee event at refunding
* **Restructuring / workout fees** — 1-3% of par restructured
* **Call / put execution fees** — $5K-$25K per event
* **Rate mode conversion fees** — $15K-$50K per conversion (VRDOs)
* **Trustee transition fees** — $10K-$30K per transition
* **Tender / exchange fees** — substantial event fees

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

* **Master Transaction Documents**: Trust Indenture, Loan Agreement (conduit), Supplemental Indenture, Tax Regulatory Agreement, Bond Purchase Agreement, Regulatory Agreement (sector-specific)
* **Security Documents**: Mortgage and Security Agreement, UCC Financing Statements, Assignment of Rents and Leases, Subordination Agreements
* **Marketing Documents**: Preliminary Official Statement (POS), Official Statement (OS), Investor Pitch Book / Roadshow Deck
* **Opinion Documents**: Bond Counsel Opinion, Disclosure Counsel Opinion, Borrower's Counsel Opinion, Trustee's Counsel Opinion, Underwriter's Counsel Opinion, Comfort Letter, Auditor's Consent Letter, Tax Opinion
* **Operational Documents**: Continuing Disclosure Agreement, Construction Disbursement Agreement, Paying Agent / Registrar Agreement, Bondholder Representative Agreement
* **Closing Certificates**: Officer's Certificate, Incumbency Certificate, Tax Certificate, Conditions Precedent Certificate, Receipt and Cross-Receipt, Trustee's Certificate of Authentication, DTC Letter of Representations
* **Public Filings**: IRS Form 8038 / 8038-G, EMMA Filings, Mortgage Recordation, UCC Filings, State Securities Filings (Blue Sky), DTC Eligibility and CUSIP Assignment

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

* Debt Service Reserve Fund — typically MADS or 12 months of debt service
* Capitalized Interest Reserve — funds construction-period interest (varies with construction period)
* Operating Reserve at Closing (sometimes) — 3-6 months of operating expenses
* Insurance and Tax Escrow (sometimes funded at closing)

### **Total COI Stack — Illustrative $50M Middle-Market Conduit Bond**

A realistic total COI on a $50M middle-market conduit deal, fully aggregated:

* Legal (bond counsel + sponsor's + trustee's + underwriter's): $200K-$450K
* Rating agencies (one or two): $75K-$300K
* Trustee (acceptance + first year): $10K-$25K
* Conduit issuer (issuance + first year): $130K-$525K
* Specialty consultants (feasibility, market, monitor): $50K-$300K
* Auditor consent/comfort: $15K-$50K
* Insurance and title: $25K-$150K
* Printing, DTC, CUSIP: $15K-$30K
* Nest structuring fee: $200K-$400K
* Contingency: $25K-$75K
* Total COI stack: $750K-$2.3M, typical $900K-$1.5M

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

* **$5M-$20M middle-market conduit**: 1.5%-3.0% of par
* **$20M-$50M middle-market conduit**: 1.0%-2.0% of par
* **$50M-$100M middle-market conduit**: 0.75%-1.5% of par
* **$100M-$300M middle-market 144A or revenue bond**: 0.6%-1.25% of par
* **Public registered offerings (larger deals)**: 0.5%-1.0% of par
* **Traditional private placements**: 0.4%-0.75% paid as placement fee
* **Muni GO bonds (competitive)**: 0.5%-1.25% as winning bid spread

### **On a $50M Deal — Discount Dollars**

Discount typically 1.0%-2.0% on $50M = $500K-$1M. Nest's share of the discount (via BD partner partnership) at a 60/40 split favoring Nest = $300K-$600K. Plus the structuring fee = $200K-$400K. Total Nest revenue at closing on a $50M deal: $500K-$1M (excluding any pre-screen fee earned at Stage 3, which added $15K-$25K).

## **5.4 The Nest / BD Partner Split**

The economic relationship between Nest and the BD partner is the single most important commercial arrangement Nest negotiates. The split governs how the underwriter discount divides between the two firms, and the split must reflect who does which work.

### **What Nest Brings**

* Sponsor relationship and deal origination
* Re-underwriting and structuring
* Document drafting and production
* Rating agency coordination and presentation
* Working group management
* Counterparty engagement
* Marketing material production
* Closing management
* Post-closing administration capability

### **What the BD Partner Brings**

* FINRA registered broker-dealer license
* MSRB membership (for muni)
* Net capital and regulatory capital infrastructure
* Supervisory and compliance infrastructure
* Principal review of offerings
* Institutional buyer relationships
* Distribution capability
* Bond placement and book-building
* Underwriting commitment / balance sheet

### **Indicative Split Structures**

The split should reflect the relative contribution. Typical structures:

* **60/40 favoring Nest** on deals where Nest does the structuring and the BD partner provides the license and placement. Common starting point.
* **65/35 or 70/30 favoring Nest** on highly Nest-originated deals with limited additional work from the BD partner.
* **50/50** on deals where the BD partner brings the sponsor relationship or substantial additional work.
* **40/60 or 30/70 favoring BD partner** on deals the BD partner originates or where placement is exceptionally complex.

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

* Per-draw processing fee: $1K-$3K per draw
* Monthly admin retainer: $3K-$8K per month
* Total construction-period revenue: $50K-$200K per deal

### **Ongoing Administration Fees**

After construction (operating bond life, typically 25-35 years remaining):

* Annual administration fee: 15-30 bps on outstanding par
* On a $50M average outstanding balance: $75K-$150K per year
* Over 28-year operating life: $2.1M-$4.2M cumulative undiscounted
* Present value at 10% discount: $700K-$1.4M

### **Optional Event Fees**

Across the bond's life, optional event fees accrue periodically:

* Amendment and consent fees: $25K-$100K per event
* Call execution: $5K-$25K per event
* Rate mode conversions (VRDOs): $15K-$50K per conversion
* Trustee transitions: $10K-$30K per transition
* Tender offers: substantial event fees
* Restructuring / workout: 1%-3% of restructured par

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

* Closings: 5 deals (ramping up)
* Closing revenue: ~$2.5M-$5M
* Recurring revenue (administration): $50K-$150K (initial construction admin only)
* Total year 1: $2.5M-$5M

### **Year 2**

* Closings: 8 deals
* Closing revenue: ~$5M-$8M
* Recurring revenue: $300K-$700K (year 1 cohort's admin + year 2 closings construction admin)
* Total year 2: $5.5M-$8.7M

### **Year 3**

* Closings: 12 deals
* Closing revenue: ~$8M-$12M
* Recurring revenue: $700K-$1.5M (two-year cohort)
* Total year 3: $8.7M-$13.5M

### **Year 5**

* Closings: 18-25 deals
* Closing revenue: ~$13M-$22M
* Recurring revenue: $2M-$4M (four-year cohort plus first refundings beginning)
* Total year 5: $15M-$26M

### **Year 10**

* Closings: 25-40 new deals plus 5-12 refundings
* Closing revenue: ~$25M-$45M (new + refundings)
* Recurring revenue: $7M-$15M
* Total year 10: $32M-$60M

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

* Bond Counsel: $125K-$200K (after Nest draft savings)
* Sponsor's Counsel: $75K-$125K
* Underwriter's Counsel: $50K-$100K (often in discount)
* Rating Agency (one): $100K-$150K
* Trustee: $10K-$25K
* Conduit Issuer: $200K-$400K
* Feasibility / Market Consultants: $75K-$300K
* Auditor: $15K-$50K
* Verification (refundings): $15K-$40K
* Title and Insurance: $25K-$150K
* Printing / DTC / CUSIP: $15K-$30K
* Nest Structuring Fee: $200K-$400K
* Underwriter Discount (paid from proceeds): $500K-$1M
* Total COI Stack: ~$1.4M-$3M on a $50M deal

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

* **Tax-exempt municipal bonds**: non-call-10 (cannot call until year 10 from issuance) is the historical standard. The Tax Cuts and Jobs Act of 2017 eliminated advance refunding of tax-exempt bonds with tax-exempt bonds, making non-call-10 less consequential than it was pre-2017 (when issuers would advance-refund inside the non-call period using taxable bonds, then re-refund with tax-exempt bonds after the call). Today, non-call-10 is still common but non-call-7 and even non-call-5 are seen on certain shorter-call structures.
* **Corporate 144A bonds**: typically non-call-life with make-whole call (callable any time at make-whole price). Sometimes structured with a par call window opening 6 months before maturity.
* **Project finance bonds**: varies widely. Investment-grade infrastructure project bonds often have make-whole call only. Sub-investment-grade project bonds sometimes have hybrid structures (non-call-3 or 5 with subsequent call at premium).
* **High-yield bonds (corporate)**: typically non-call-3 or non-call-5 with subsequent call at premium declining to par over time. Sometimes with equity claw (right to redeem up to 35% with equity proceeds at premium during non-call period).

### **6.2.2 Call Price**

The price at which the issuer can call. Standard structures:

* **Par call** (call price = 100): the simplest structure. After the non-call period, the issuer can call at face value. Common for municipal bonds; less common for corporate or project bonds.
* **Premium call** (call price > 100, declining over time): a stepdown structure where the call premium declines toward par as the bond seasons. For example, a 10-year non-call period followed by call at 105 in year 11, 104 in year 12, 103 in year 13, 102 in year 14, 101 in year 15, and par thereafter. Common in high-yield corporate bonds.
* **Make-whole call** (call price = present value of remaining cash flows at a reference rate plus spread): the issuer can call any time at a price that fully compensates the bondholder for the present value of remaining coupon and principal. Used for corporate investment-grade and project bonds where call flexibility is needed but bondholders demand protection. The make-whole spread (typically 25-50 bps over the reference Treasury rate) determines how generous the call price is to bondholders.
* **Doubling option**: the issuer can call up to a defined multiple of the scheduled sinking fund payment in a given year. Allows the issuer to retire bonds faster than the sinking fund schedule when cash is available.

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

* Loss of tax-exempt status — if the IRS rules the bonds taxable, the indenture typically requires immediate redemption at par
* Condemnation of the financed project — eminent domain proceedings against the financed asset
* Substantial casualty loss — major damage to the financed project (fire, flood, etc.) that prevents repair or repurposing
* Unused bond proceeds — if construction is completed under budget, unused proceeds may be required to redeem bonds rather than be released to the borrower
* Excess investment earnings — for some tax-exempt structures, investment earnings on bond proceeds above defined thresholds must be used to redeem bonds

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

* Sinking fund bonds: the issuer can typically satisfy the sinking fund obligation by either (a) calling bonds at par per the scheduled amount, or (b) buying bonds in the open market for cancellation. If the bond is trading below par, the issuer can buy in the market at a discount, retiring the same par for less cash — captured optionality value.
* Serial bonds: each maturity is its own bond. The issuer cannot buy in the open market and apply against a future serial maturity. Less optionality flexibility.

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

* **Optional redemption / call** — issuer's right to redeem before maturity
* **Mandatory redemption** — required redemption upon defined trigger
* **Non-call period** — period during which the issuer cannot call
* **Par call** — call at face value (100)
* **Premium call** — call at price above par, often declining over time
* **Make-whole call** — call at PV of remaining payments at reference rate + spread
* **Make-whole spread** — the bps added to reference rate to compute make-whole price
* **Par call window** — defined period before maturity when issuer can call at par
* **Doubling option** — right to redeem multiple of sinking fund payment
* **Hard put** — unconditional bondholder put right
* **Soft put** — conditional bondholder put right
* **Mandatory tender** — required bondholder tender on defined dates
* **Tender option** — bondholder right to tender to liquidity provider
* **Sinking fund** — mandatory periodic principal redemption
* **Equity claw** — right to redeem portion with equity proceeds at premium
* **Roll-up** — extension of maturity through refinancing
* **OAS (Option-Adjusted Spread)** — spread on bond adjusted for embedded option value

### **Core Formulas**

**Refunding NPV Savings —** Σ [PV Old DS − PV New DS] − Call Premium − Refunding COI

**Make-Whole Call Price —** Max(Par, Σ [Remaining CF / (1 + Treasury + MW Spread)^t])

**Breakeven Refunding Rate —** Solve r such that PV(Old DS) = PV(New DS) + Call Premium + COI

**Refunding Economic Threshold —** NPV Savings > 3-5% of par being refunded

### **Decision Rule Inventory**

* O-01: Tax-exempt long-dated muni → non-call-10 with par call
* O-02: IG corporate → make-whole at Treasury+25-40 bps with par call window
* O-03: Sub-IG corporate → non-call-3 or 5 with step-down premium
* O-04: Variable rate / construction → VRDO with LOC and mandatory tender
* O-05: Rising rate environment → tighter call protection
* O-06: Falling rate environment → preserve call optionality
* O-07: Project bond with construction risk → special optional redemption tied to project events
* O-08: PE-backed sponsor with exit horizon → step-down premium plus equity claw
* O-09: First-time issuer → conservative call structure for buyer comfort
* O-10: Specific buyer demand → soft put for buyer pool expansion

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

* Permitted refinancing — refinancing existing debt with debt of equal or lesser amount
* Permitted working capital — short-term operating debt up to a defined cap
* Permitted purchase money debt — debt to finance specific asset acquisitions, secured only by the acquired asset
* Permitted subordinate debt — junior debt that meets defined criteria (subordination, maturity, payment standstill)
* Permitted additional bonds — additional issuance under the indenture meeting the Additional Bonds Test
* Permitted incidental debt — leases, hedging obligations, ordinary course trade payables

The boundary between permitted and prohibited debt is one of the most heavily negotiated areas in the indenture. The platform's default position is moderately tight — allow refinancing and ordinary course needs, restrict significant new senior debt without consent.

### **Limitations on Liens**

The borrower cannot grant liens on its assets except for defined permitted liens. Standard permitted liens:

* Liens securing the bond itself (the trustee's lien)
* Liens securing permitted additional bonds
* Liens for taxes, assessments, statutory obligations not yet delinquent
* Mechanic's, materialman's, and similar liens in the ordinary course
* Liens securing permitted purchase money debt, on the specifically financed asset only
* Easements, rights of way, zoning restrictions not materially impairing use

The lien covenant works in tandem with the additional indebtedness covenant to protect the bondholders' security position. Without a lien covenant, the borrower could grant a senior lien on the same collateral to a new lender, structurally subordinating the existing bondholders.

### **Limitations on Asset Sales**

The borrower cannot sell, dispose of, or transfer material assets except in defined permitted categories. Standard permitted asset sales:

* Sale of obsolete or worn-out assets in the ordinary course
* Sale of inventory in the ordinary course
* Sale of assets up to a defined annual or cumulative dollar threshold
* Sale with mandatory reinvestment in similar productive assets within a defined period
* Sale with mandatory paydown of the bonds with net proceeds

Asset sale covenants are particularly important on real estate-backed or project-specific bonds where the financed asset itself is the primary collateral. On more diversified credits, the asset sale covenant is more lenient.

### **Limitations on Investments**

The borrower cannot make investments outside defined permitted categories. Standard permitted investments:

* Cash and cash equivalents
* Government securities
* Investments in subsidiaries that are guarantors of the bonds
* Investments in joint ventures up to a defined cap
* Trade receivables in the ordinary course
* Hedging arrangements approved under the indenture

Investment covenants prevent the borrower from diverting cash from operations into speculative or unrelated activities. Particularly important when the bondholders are relying on the borrower's specific business cash flow.

### **Limitations on Restricted Payments**

The borrower cannot make distributions to equity holders, repurchase equity, prepay subordinate debt, or make other 'restricted payments' except under defined conditions. Standard conditions:

* No event of default at the time of payment
* Pro forma compliance with all financial covenants after giving effect to the payment
* Payment falls within a defined annual or cumulative cap
* Source of payment is from defined permitted sources (excess cash flow after debt service and reserves)

Restricted payment covenants are the bondholders' protection against the equity sponsor extracting cash from the borrower when the borrower has insufficient cushion. Particularly relevant for private equity-backed borrowers where the sponsor's incentive structure may favor distributions over balance sheet strength.

### **Limitations on Related-Party Transactions**

The borrower cannot enter into transactions with affiliates except on arm's-length terms and with defined approvals. Standard requirements:

* Transactions must be on terms no less favorable to the borrower than would be obtained in arm's-length transactions
* Transactions above a defined dollar threshold require independent director approval
* Transactions above a higher threshold require fairness opinion from a third-party advisor

Related-party covenants are particularly important when the borrower has significant affiliate operations (parent company services, sister entity transactions, principal-related contracts).

### **Limitations on Fundamental Changes**

The borrower cannot undergo defined fundamental changes without bondholder consent. Standard categories:

* Mergers and consolidations (except mergers into the borrower with the borrower as survivor)
* Sale of substantially all assets
* Change of business in a material way
* Change of control (subject to defined exceptions)
* Voluntary dissolution or liquidation

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

* Maintain physical condition of property at defined standards
* Maintain occupancy above defined minimums (typically 90%-93%)
* Maintain affordability restrictions per the Regulatory Agreement (for affordable housing)
* Submit to annual physical inspections
* Maintain on-site management or comparable arrangement

### **Healthcare (Hospitals, Senior Living)**

* Maintain licensure and accreditation (Joint Commission, CMS, state licensure)
* Maintain Medicare and Medicaid participation
* Maintain medical staff and key personnel
* Comply with applicable HIPAA, EMTALA, Stark, anti-kickback, false claims act, and other healthcare regulations
* Minimum days cash on hand
* Maintain professional liability and other healthcare-specific insurance at defined levels

### **Charter Schools**

* Maintain charter authorization
* Meet academic performance benchmarks defined in the charter and the indenture
* Maintain enrollment above defined minimums
* Maintain regulatory compliance with state department of education
* Submit to annual independent academic and financial review

### **Higher Education**

* Maintain accreditation
* Maintain enrollment above defined minimums
* Maintain endowment investment policies
* Comply with federal financial aid eligibility requirements

### **Utility / Public Power**

* Maintain operational reliability standards
* Comply with environmental permits and regulations
* Maintain rate-setting authority
* Submit annual rate studies

## **7.7 Anti-Dilution Covenants**

Anti-dilution covenants protect bondholders from structural subordination caused by future actions at the borrower or its affiliates.

### **Structural Subordination Protection**

If the borrower has subsidiaries that generate cash flow but are not guarantors of the bonds, those subsidiaries' creditors have priority on the subsidiary's assets and cash flow. The bondholders' claim is structurally subordinate. Anti-dilution covenants protect against this by either (a) requiring all material subsidiaries to be guarantors, (b) capping the borrower's investment in non-guarantor subsidiaries, (c) requiring upstream of cash from non-guarantor subsidiaries to the borrower, or (d) requiring debt issued at the parent level to be no senior to the bonds at the parent.

### **Parent-Level Debt Limitations**

On deals where the borrower is a subsidiary of a parent holding company, restrictions on debt at the parent level prevent the parent from issuing senior debt that structurally subordinates the subsidiary-level bondholders. Standard restriction: no parent debt unless either subordinated to or pari passu with the bonds, or unless the parent debt is supported by a downstream guarantee from the borrower (which would be a cross-default trigger).

## **7.8 Events of Default and Cure**

The remedies side of covenants. What constitutes a breach, what counts as an Event of Default, and what cure provisions apply.

### **Categories of Events of Default**

* Payment default — failure to pay scheduled debt service when due (no grace period for principal at maturity; typically 5-30 days grace for interest and scheduled principal)
* Financial covenant default — failure to meet a financial covenant test (often with a 30-60 day cure period to remedy)
* Affirmative covenant default — failure to perform an affirmative obligation (typically 30 day cure after notice)
* Negative covenant default — taking an action prohibited without consent (often immediate default with no cure)
* Misrepresentation — material breach of representation or warranty in the indenture or related documents
* Bankruptcy or insolvency — voluntary or involuntary bankruptcy filing, assignment for benefit of creditors, etc.
* Cross-default — default under other material debt of the borrower above a defined threshold
* Material adverse change — defined event materially impairing the borrower's ability to perform
* Loss of tax-exempt status (for tax-exempt bonds) — IRS ruling or other event causing loss of exemption
* Failure to maintain credit enhancement — for credit-enhanced bonds, expiration or termination of the LOC or insurance without replacement

### **Cure Provisions**

Most covenant defaults have defined cure periods that allow the borrower to remedy before the default becomes a true Event of Default. Standard cure mechanics:

* Equity cure for financial covenants — borrower can cure a missed financial covenant through cash equity infusion (sometimes treated as included in EBITDA, sometimes as a reduction of debt). Often capped (no more than 4 cures in any 5-year period, no more than 2 consecutive).
* Cure of payment defaults — extended grace periods on interest (often 5-30 days); none on principal at maturity
* Reasonable cure for affirmative defaults — opportunity to remedy within defined period after notice
* Forbearance and waiver — bondholders can choose to forbear from acceleration even after default; waivers require defined bondholder approval (typically majority or supermajority)

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

* Direct integration with obligor's accounting system where available, with automated pull of monthly financial data
* Document ingestion of submitted financial statements where direct integration is not possible
* Automated covenant calculation using indenture-defined formulas
* Trend analysis — covenant levels over rolling periods, identification of declining trends before they become defaults
* Early warning alerts when any covenant approaches threshold (typically 10% cushion remaining)
* Compliance certificate generation for obligor's CFO sign-off and trustee filing
* Material event detection for SEC Rule 15c2-12 filings

### **Early Warning and Workout Activation**

When the platform detects deteriorating covenant trends, it alerts Sean and Josh in addition to the obligor. The early warning is actionable — at the time the platform detects the problem, several months of cushion typically still exist before actual default. Early intervention (waiver, amendment, restructuring, operational change) is dramatically more cost-effective than reactive workout after default.

## **7.11 Quick Reference — Silo 7**

### **Financial Covenant Inventory**

* Debt Service Coverage Ratio (DSCR)
* Maximum Annual Debt Service Coverage (MADS Coverage)
* Additional Bonds Test (ABT)
* Rate Covenant (revenue bonds with rate-setting authority)
* Leverage Ratio (Debt / EBITDA)
* Debt to Capitalization
* Debt Yield
* Liquidity (minimum cash, days cash on hand, minimum operating reserve)
* Fixed Charge Coverage Ratio (FCCR)
* Net Worth and Tangible Net Worth

### **Affirmative Covenant Inventory**

* Maintain existence and good standing
* Maintain properties and insurance
* Pay taxes and material obligations
* Comply with laws
* Maintain books and records
* Use of proceeds restrictions
* Tax-exempt compliance (tax-exempt bonds)
* Maintain reserves and make deposits
* Conduct business in ordinary course
* Maintain permits and licenses

### **Negative Covenant Inventory**

* Limitations on additional indebtedness
* Limitations on liens
* Limitations on asset sales
* Limitations on investments
* Limitations on restricted payments
* Limitations on related-party transactions
* Limitations on fundamental changes

### **Reporting Covenant Inventory**

* Annual audited financials
* Quarterly unaudited financials
* Compliance certificate
* Operating statistics (sector-specific)
* Budget and forecasts
* Material event notices (Rule 15c2-12 for muni)

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

* Multifamily housing: MADS or 12 months — strong revenue stability supports lighter sizing
* Healthcare hospital: MADS, sometimes 1.25x MADS — high revenue volatility supports heavier sizing
* Senior living: MADS, sometimes with seasonality overlay
* Charter schools: MADS, often with replenishment requirements within 6 months
* Higher education: 12 months — typically stable revenues support lighter sizing
* Utility / public power: 12 months or average annual debt service — very stable revenues
* Project finance: MADS or higher; sometimes funded from operating cash flow rather than bond proceeds to manage upfront cost

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

* Multifamily housing: $200-$500 per unit per year (newer assets less, older assets more)
* Senior living: $300-$800 per unit per year
* Hotels: $750-$1,500 per room per year (4-5% of revenue typical)
* Healthcare facilities: 2-4% of revenue annually
* Charter schools: $50-$150 per student per year, sometimes calculated on square footage
* Office and retail: $0.20-$0.50 per square foot per year

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

* Initial Operating Deficit Reserve (multifamily affordable, certain new projects) — funds projected operating deficits during initial stabilization
* Lease-Up Reserve (multifamily new construction) — funds operating costs during the lease-up period
* Marketing Reserve (senior living, new healthcare) — funds marketing and absorption activities during ramp-up
* Working Capital Reserve (manufacturing, certain commercial) — supplements operating reserve for working-capital-intensive businesses
* Major Maintenance Reserve (infrastructure) — separately tracked from standard R&R for very large periodic maintenance
* Renewal Reserve (concession-based infrastructure) — funds long-cycle replacement obligations
* Reserve for Compulsory Compliance Items — sector-specific (e.g., student loan servicing transitions, healthcare compliance gaps)

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

* Sweeping waterfalls — where excess cash above defined levels is automatically swept to early redemption rather than released to equity. Used in project finance where bondholders want to capture upside cash flow
* Trapping waterfalls — where distributions are trapped if covenants are tight, even before actual default. Used when bondholders want preventive cash retention
* Multi-series waterfalls — where senior, mezzanine, and subordinate tranches each have their own debt service and reserves, with junior tranches structurally subordinated
* Operating-cash-flow-only waterfalls — where only cash flow from operating revenue moves through the waterfall, with insurance proceeds, condemnation awards, etc., flowing through separate processes
* LIHTC waterfalls (affordable housing) — incorporate the LIHTC investor's preferred return, deferred development fees, and other equity-tier claims at defined waterfall positions

### **The Waterfall as a Pricing Lever**

Bondholders pay attention to the waterfall structure. A tight waterfall with strong cash trapping and senior protection commands tighter pricing than a loose waterfall that allows distributions readily. Specific design moves that improve pricing:

* Cash flow sweep at defined coverage levels — bondholders prefer capture of upside
* Distribution traps tied to forward covenant pro forma — bondholders prefer preventive retention
* Reserve replenishment ahead of equity distributions — bondholders prefer cushions before equity
* Defined waterfall ordering documented in detail — clearer is better, reduces interpretation risk

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

* Stabilized multifamily revenue bond: DSRF (12% of par) + Operating Reserve (1-2% of par) + R&R built up over time = ~13-14% of par funded at closing
* New construction multifamily bond: DSRF (12%) + Cap-I (8-12% depending on construction period) + Operating Reserve (3-5%) + R&R (build-up) = ~25-30% of par funded at closing
* Healthcare hospital bond: DSRF (12-15%) + Days Cash on Hand requirement (separately maintained, not in bond reserves) + R&R = ~12-15% of par funded at closing
* Senior living new construction: DSRF (12%) + Cap-I (10-14%) + Operating Reserve (5-8%) + Marketing Reserve (2-4%) + R&R (build-up) = ~30-35% of par funded at closing
* Project finance infrastructure: DSRF (12%) + Cap-I (varies by construction period) + Major Maintenance Reserve (build-up) + Operating Reserve = 15-25% of par at closing

These reserve percentages are above what would otherwise be the loan amount sized to the asset. The borrower must either accept a smaller usable loan (after funding reserves from proceeds) or fund the reserves from external sources (equity, sponsor cash, etc.). Reserve sizing is one of the key tradeoffs in the structuring decision.

## **8.4 Reserve Investment Restrictions**

Cash held in reserves is invested by the trustee. The indenture defines permitted investments. Standard permitted investments include:

* US Treasuries and government agency obligations
* Money market funds rated AAAm by S&P or equivalent
* Certificates of deposit at banks rated above defined thresholds
* Investment agreements with rated providers (specific to muni bond reserves)
* Repurchase agreements collateralized by Treasuries
* Tax-exempt bonds rated above defined thresholds (for muni reserves)

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

* Debt Service Reserve Fund (DSRF) — covers debt service shortfalls
* Capitalized Interest Reserve (Cap-I) — funds construction-period interest
* Replacement and Repair Reserve (R&R) — funds long-term capital maintenance
* Operating Reserve — working capital cushion
* Insurance and Tax Escrow — collects monthly for these obligations
* Rebate Fund — holds IRS arbitrage rebate liability
* Surplus Fund — receives excess cash after all senior obligations
* Construction Fund — holds bond proceeds during construction
* Costs of Issuance Fund — pays COI at closing
* Special purpose reserves — sector-specific (lease-up, marketing, working capital, major maintenance, renewal)

### **Standard Waterfall Order**

* 1. Operating expenses
* 2. Trustee and administration fees
* 3. Senior bond debt service
* 4. Senior DSRF replenishment
* 5. Subordinate bond debt service
* 6. Subordinate DSRF replenishment
* 7. Capital reserves (R&R, Operating Reserve)
* 8. Rebate Fund deposit
* 9. Insurance and Tax Escrow
* 10. Permitted distributions (subject to restricted payment covenant)
* 11. Surplus Fund

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

* Variable-rate bonds (VRDOs) — almost always LOC-enhanced; the LOC supports the bondholder's put right plus the bond rating
* Short-tenor construction or bridge financings
* Issuers with strong bank relationships but mediocre native credit ratings
* Sectors with high volatility but bondable underlying assets
* Smaller deals where the bond cost of capital is dominated by execution friction and LOC fees can offset

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

* School district financings in states with statutory intercept programs (varies state by state)
* Charter school financings in some states
* Certain higher education financings where state aid is a meaningful revenue source
* Some healthcare financings where Medicaid payments can be intercepted
* State transportation or infrastructure financings where federal or state revenue can be redirected

### **Rating Impact**

Strong state intercept programs produce meaningful rating uplift — often 2-3 notches above the underlying obligor's credit. For school district financings in states with strong intercept programs (e.g., Texas, Pennsylvania), the bonds often achieve ratings close to the state's GO rating despite the underlying district being lower-rated. Intercept is essentially free enhancement (no premium, no annual fee) where available.

## **9.6 Parent or Corporate Guarantee**

A parent company guarantees the subsidiary's bond payments. The bond's effective credit becomes the parent's credit. Standard in corporate structures where a strong parent holding company has weaker subsidiary credits.

### **Structuring the Guarantee**

Standard provisions: (1) unconditional and irrevocable guarantee of timely payment of principal and interest; (2) waivers of typical guarantor defenses (no requirement that bondholders first pursue the borrower); (3) survival through bankruptcy or insolvency of the borrower; (4) defined trigger for guarantor's payment obligation; (5) subrogation provisions (guarantor's rights against borrower after paying).

Parent guarantees can be structured at various levels of guarantor obligation:

* Full and unconditional guarantee — strongest, treats the parent's credit as the bond's credit
* Limited guarantee — capped at a defined amount or for a defined period
* Bad-boy guarantee — guarantor liable only for specific bad acts (fraud, environmental violations, voluntary bankruptcy)
* Springing guarantee — guarantee springs into effect on defined triggers (default, change of control, breach of negative covenant)

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

* Fully cash-secured: cash equal to par held by trustee. Bond is risk-free — bondholders are paid from the collateral. Used where the issuer needs the bond's tax-exempt status or specific buyer pool access but doesn't need the cash itself. Sometimes used by corporate treasurers to access tax-exempt markets while parking corporate cash.
* Partially cash-secured: cash collateral covers a defined portion of debt service (e.g., the next 5 years' interest plus principal at risk). Reduces but doesn't eliminate credit risk.
* Securities-collateralized: government securities held by trustee. Provides cash-like protection but allows the obligor to earn investment income.
* Defeasance escrow: structured similarly but typically used for refundings where old bonds are defeased by an escrow until call or maturity.

### **When Cash Collateral Makes Sense**

Limited use cases. Most obligors don't have the cash to fully collateralize a bond and would prefer to put the cash to productive use. Cash collateral structures make sense when:

* Obligor has specific cash management needs that match the bond structure
* Tax-exempt arbitrage opportunity (specific to certain corporate or institutional contexts)
* Bridge financing where cash is available but needs the bond structure for tax or buyer-pool reasons
* Refunding escrow (defeasance) — old bonds collateralized by escrow until call or maturity

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

* **Letter of Credit (LOC)** — bank LOC, fee 50-250 bps annually, typical for VRDOs
* **Bond Insurance / Surety Wrap** — monoline insurer, premium 50-200 bps upfront, common in muni
* **Moral Obligation Pledge** — state pledge to seek appropriation, free, limited to specific entity types
* **State Intercept** — state redirects aid to debt service, free, available in some sectors
* **Parent / Corporate Guarantee** — parent guarantees subsidiary's bond, common in corporate
* **Federal Guarantee Programs** — USDA, HUD, DOT, DOE, etc., produce AAA effective rating
* **Cash or Securities Collateral** — bonds backed by escrowed cash or government securities

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

* Determine native credit and native pricing
* Identify available enhancement options
* Compute enhanced rating and pricing for each option
* Compute enhancement cost (premiums + fees) for each option
* Run NPV: pricing savings vs. enhancement cost
* Select the highest positive NPV option, or no enhancement if all are negative

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

* First call on cash flow per the waterfall — debt service paid before subordinate
* First claim on collateral in default — sale proceeds applied to senior first
* Higher rating than the subordinate tranche, often by 2-4 notches
* Lower coupon (lower yield)
* Larger size — typically 70-90% of total issuance
* Standard call protection — typical non-call period and call structure for the asset class

### **Subordinate Tranche Characteristics**

* Junior call on cash flow — paid only after senior debt service is current and senior reserves replenished
* Junior claim on collateral in default
* Lower rating than senior, often 2-4 notches
* Higher coupon (higher yield)
* Smaller size — typically 10-30% of total issuance
* Often with longer non-call period or stricter call protection (because the senior gets refinanced first and the subordinate becomes more concentrated)

### **Sizing the Tranches**

Sizing decisions are driven by (a) what the cash flow can support at each rating level, (b) the available buyer pools at each rating, (c) the optimal blended cost of capital. The platform's structuring agent runs this optimization systematically.

Example sizing for a multifamily project bond with $50M total need:

* Senior Series A: $40M (80%), A-rated, 1.40x DSCR coverage on senior debt service, priced at Treasury + 90 bps
* Subordinate Series B: $10M (20%), BBB-rated, 1.20x DSCR coverage on senior + sub debt service combined, priced at Treasury + 175 bps
* Blended cost of capital: (80% × 0.90% + 20% × 1.75%) + Treasury = 1.07% + Treasury
* Compare to single $50M tranche at BBB+ → would price at Treasury + 145 bps
* Tranching savings: 38 bps × $50M × ~25 year duration = significant NPV

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

* Senior to subordinate but junior to senior
* Rated between senior and subordinate (typically BBB+ to BBB-)
* Priced between senior and subordinate spreads
* Often with covenant protection structurally between senior and subordinate
* Sometimes secured differently from senior — e.g., senior has first lien on operating cash flow, mezzanine has second lien on cash flow plus equity pledge

### **When Mezzanine Tranches Make Sense**

Three-tier structures make sense when:

* Deal size is large enough to justify multiple tranches ($75M+ typical minimum)
* The asset class supports multiple rating outcomes from the same project
* Buyer pools exist at each rating level — single-A, mid-BBB, and BB or B
* The marginal pricing benefit of the third tranche exceeds the marginal complexity cost

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

* Construction-period financing where the project has no cash flow during construction
* Highly back-loaded amortization profiles for projects with ramp-up periods
* School district financings in states with tax limitation rules that make current interest expensive
* Deals where current interest expense would exceed available cash flow

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

* Tax-exempt bonds (~50-60% of total project cost) — the senior debt; required for 4% LIHTC eligibility
* LIHTC equity (~25-35% of total project cost) — sponsor sells the LIHTC credits to an investor (usually a corporate or institutional LIHTC syndicator), who pays cash to the project. Investor receives the credits over 10 years.
* Soft sources (~10-20% of total project cost) — local, state, or federal soft loans (HOME, CDBG, AHP, state HFA gap funds, etc.); often deferred or contingent payment
* Deferred developer fee — sponsor's fee partly deferred, paid over time from project cash flow
* Sometimes a small market-rate or seller financing tranche

### **Structural Implications**

The LIHTC structure creates a multi-party waterfall with:

* Bond debt service paid first (senior, as in any structured bond)
* LIHTC investor preferred return paid at defined waterfall position
* Soft loan debt service at lower priority
* Deferred developer fee paid from available cash
* Distribution to general partner / sponsor last

The LIHTC investor's role is unique. They take the credits and have specific compliance requirements (15-year compliance period plus 15-year extended use), but they don't take operating risk — once the project stabilizes and the credits are delivered, they're typically passive.

### **Bond Sizing in LIHTC**

Tax-exempt bond sizing in LIHTC deals is constrained by:

* 50% test — at least 50% of aggregate basis must be financed by tax-exempt bonds to qualify for 4% LIHTC. Bond sizing typically targets just above 50%.
* Operating cash flow DSCR — typically 1.15-1.25x for the bond debt service
* Volume cap — tax-exempt bonds for multifamily are subject to state-level volume cap allocation; the state HFA approves and allocates

## **10.9 Combining Multiple Layering Approaches**

Real complex deals layer multiple approaches simultaneously. Example: a $100M senior living deal might have:

* Tax-exempt series A senior bonds (sequential pay, 30-year, $60M, A-rated)
* Tax-exempt series B subordinate bonds (pro rata pay, 30-year, $20M, BBB-rated)
* Taxable series C mezzanine bonds for non-qualifying purposes (5-year, $10M, BB-rated)
* Tax-exempt series D CABs for entrance fee receipts (10-year accretion, $10M, structured around expected entrance fee absorption)

Each series is sized to its purpose, rated to its risk, priced to its buyer pool. The combined offering produces a substantially lower blended cost of capital than any single-tranche alternative, captures tax exemption where qualifying, and supports the specific cash flow profile of a senior living facility with both bond debt and entrance fee receipts.

## **10.10 Tranching Decision Framework**

How the platform's structuring agent decides whether and how to tranche.

### **Step 1 — Identify Single-Tranche Baseline**

Run the deal as a single tranche. Determine the rating, pricing, and total cost of capital. This is the comparison baseline.

### **Step 2 — Identify Tranching Candidates**

Based on deal type, size, and purpose, identify candidate tranching structures:

* Two-tier senior/subordinate
* Three-tier senior/mezz/subordinate
* Sequential vs. pro rata pay variants
* Tax-exempt + taxable blends
* Multiple maturity tranches
* CAB inclusion where appropriate
* LIHTC layering (for affordable housing)

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

* Senior / subordinate (two-tier)
* Senior / mezzanine / subordinate (three-tier)
* Sequential pay vs. pro rata pay
* Turbo amortization
* Capital Appreciation Bonds (CABs)
* Current interest + CAB combinations
* Tax-exempt + taxable blends
* Multiple maturity tranches (serials + terms)
* LIHTC layered structures

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

* Run single-tranche baseline
* Identify tranching candidates
* Size tranches to optimal buyer pool
* Compute blended cost of capital
* Add execution complexity premium
* Select lowest fully-loaded cost structure

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

* Strong oversubscription (10x covered or better at indicative pricing) suggests room to tighten
* Reasonable subscription (2-5x covered) suggests pricing is appropriately set
* Light subscription (1.5x or less) suggests pricing needs to widen or the deal needs to be reduced
* Differential demand by maturity (strong demand at front, weak at back) suggests retranching

### **Step 3 — Pre-Pricing Calls**

The night before pricing, the BD partner conducts pre-pricing calls with the issuer's representatives (Nest as FA, sponsor as obligor). The BD partner presents the book of orders, the pricing recommendations by maturity, and any retranching suggestions. The issuer's representatives review and provide direction — accept, push for tighter pricing, push for restructuring, or decline if pricing is materially worse than indicative.

### **Step 4 — Pricing Morning**

On pricing morning, the BD partner finalizes the deal terms: coupons by maturity, prices by maturity, allocations by buyer. The Bond Purchase Agreement is executed. The deal is sold to the underwriter. The underwriter has its commitments to allocated buyers.

### **Step 5 — Settlement**

Pricing is settled at closing (typically 7-10 days after pricing). Bonds are issued, allocations are delivered through DTC, payments flow per the closing flow of funds.

## **11.7 Buyer Pool Differential Pricing**

Different buyers pay different prices for the same bond. Understanding the buyer pool by maturity and rating is critical for capturing pricing efficiency.

### **Lifecos (Life Insurance Companies)**

* Buy long-dated investment-grade fixed income matching their long-tail liabilities
* Pay up for high-quality, long-duration, predictable cash flow
* Particularly valuable for muni bonds at the long end (20-30 years)
* Many lifecos have specific allowed/disallowed sectors and rating requirements

### **Bond Funds (Mutual Funds, ETFs)**

* Buy across the credit spectrum and maturity spectrum
* Value liquidity highly because they face redemptions
* Particularly active in BBB to A range, 5-15 year maturities
* Sensitivity to flow patterns — heavy bond fund redemptions widen spreads, inflows tighten

### **Bank Portfolios**

* Buy high-quality, shorter-tenor bonds (typically 1-10 year)
* Tax-exempt bonds attractive for community reinvestment and tax planning
* Value serial structures and amortization
* Particularly active in regional muni bonds where the bank has community presence

### **Money Market Funds and Tender Option Trusts**

* Buy very short-dated (typically 1-7 day) variable rate bonds
* Require high credit quality (AAA or AA short-term)
* Highly sensitive to credit enhancement quality
* Active in VRDOs and certain TOB structures

### **Hedge Funds and Specialty Buyers**

* Buy higher-yielding paper — BB-rated and below, distressed, structured
* Often opportunistic — buy at attractive spreads, sell when spreads tighten
* Less stable demand than long-only buyers
* Higher risk tolerance enables them to buy what other pools cannot

### **Retail and SMA (Separately Managed Account) Buyers**

* Buy across the muni market for tax-exempt income
* Tend to value high-coupon premium bonds for tax management
* Often buy through wealth management platforms with allocation models
* Particularly active in 5-15 year tax-exempt

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

* Lifecos: long-dated IG; pay up for high quality
* Bond funds: full spectrum; value liquidity
* Bank portfolios: short-tenor IG; tax-exempt attractive
* Money market funds: ultra-short variable rate AAA
* Hedge funds: BB and below; opportunistic
* Retail / SMA: tax-exempt across maturities; premium structures

### **Pricing Optimization Levers**

* Premium pricing structure (5-15 bps benefit)
* Block-size concentration (5-15 bps benefit on serials)
* Call protection design (5-25 bps trade-off)
* Covenant quality (5-25 bps benefit for tighter covenants)
* Disclosure quality (10-25 bps benefit)
* Dual ratings (10-30 bps benefit)
* BD partner distribution quality (5-25 bps benefit)

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

* Day 1-5: contractor submits pay application to sponsor
* Day 5-10: sponsor prepares full draw package and submits to platform
* Day 10-15: platform validates; flags any issues; construction monitor schedules site visit
* Day 15-18: site visit and monitor certification
* Day 18-22: trustee review and disbursement
* Day 22-30: contractor receives payment and pays subcontractors
* Repeat next month

### **Common Draw Issues**

Issues that arise during draw processing:

* Budget overruns — line items exceeding budget require change orders or budget reallocation
* Lien waiver gaps — missing waivers from major subs hold up the draw
* Construction monitor disputes — monitor disagrees with claimed completion percentages
* Stalled progress — construction not progressing at the rate that would justify continued draws
* Change orders — formal contract modifications requiring lender/bondholder review
* Soft cost questions — capitalization of certain soft costs disputed under indenture

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

* Yellow alert: covenant ratio within 15% of threshold
* Orange alert: covenant ratio within 5% of threshold
* Red alert: covenant ratio at or below threshold
* Forward red: projected covenant breach in next 1-3 quarters based on trends

Alerts route to Sean and Josh in addition to the obligor. The early warning enables proactive intervention — covenant amendment, equity infusion, operating adjustment, restructuring discussion — before actual breach. By the time the platform red-alerts, several months of cushion typically still exist.

### **Covenant Compliance Failure Response**

When a covenant actually breaches, the platform initiates the response protocol:

* Document the breach with full calculation showing the failure
* Notify the trustee per indenture requirements
* Determine cure period (if applicable) per indenture
* Determine whether the breach is curable through equity infusion or other defined cure
* Determine whether to seek waiver, forbearance, or amendment from bondholders
* Engage bond counsel and disclosure counsel for any required disclosure or remediation
* Initiate workout procedures if breach is structural

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

* Current call eligibility (is the bond past the non-call period or approaching it)
* Call price at next eligible call date
* Current refinancing rate available (based on bond rating, sector, market conditions)
* Projected refunding NPV savings
* Breakeven rate (how much rates would need to move to make refunding economic if not already)
* Strategic considerations (covenant relief desired, structure changes desired, balance sheet optimization)

When refunding economics cross the threshold (typically 3-5% NPV savings of par being refunded), the platform flags the opportunity. Sean and Josh review and present to the obligor.

### **Refunding Execution**

Once the obligor decides to proceed with refunding, the deal effectively runs as a new issuance — Stage 0 of the workflow begins again, with the same set of structural decisions, counterparty engagements, and execution steps. The platform's automation makes refunding execution much faster than a first-time issuance because the obligor's diligence is largely already in the platform.

Refunding revenue is a full new-issuance fee event. Pre-screen fee, structuring fee, BD partner share of new underwriter discount, etc. The refunding is economically equivalent to a new $50M issuance even though the obligor has been a client for 7-10 years.

## **12.9 Restructuring and Workout**

When the obligor's credit deteriorates significantly, the bond moves into workout. This is heavy work — relationship-intensive, structurally complex, often requiring negotiation across multiple bondholder groups, equity holders, and other stakeholders.

### **Workout Triggers**

* Multiple consecutive financial covenant breaches with no clear remediation path
* Payment default (failure to make scheduled debt service)
* Draw on DSRF (signaling that operating cash flow has been insufficient for debt service)
* Material adverse change in the obligor's business or assets
* Bankruptcy filing or imminent bankruptcy filing

### **Workout Options**

* Forbearance — bondholders agree to forbear from exercising remedies for a defined period, giving the obligor time to remediate
* Debt service deferral — interest or principal payments deferred to a later date
* Principal reduction — partial forgiveness of principal in exchange for restructured terms
* Coupon reduction — reduction of coupon rate, with possible later step-up
* Maturity extension — extension of maturity to give more time to repay
* Exchange offer — existing bonds exchanged for new bonds with modified terms
* Distressed exchange — exchange at a discount to par; recognized as a default by rating agencies
* Debt-to-equity conversion — bonds converted to equity in the reorganized obligor
* Sale of assets to repay bonds — obligor sells assets to generate proceeds for bond repayment
* Chapter 11 reorganization — formal bankruptcy with court-supervised restructuring
* Chapter 7 liquidation — last resort; obligor's assets sold and proceeds distributed

### **Workout Fees**

**Structuring fee for workout —** 1-3% of par being restructured

**Success fee if workout completes —** Additional 50-200 bps of par

**Bond counsel and specialist fees —** Substantial; often $300K-$1M+ on complex workouts

Workouts are operationally heavy but commercially valuable. The fees are substantial, and successful workouts preserve client relationships and protect Nest's reputation in adjacent markets. The senior banker (Sean or Josh) leads the workout; the platform supports but does not drive.

## **12.10 Annual Surveillance Support**

Each rating agency conducts annual surveillance reviews on outstanding rated bonds. The surveillance review evaluates whether the bond's rating remains appropriate based on current operating performance, market position, and credit metrics.

### **Surveillance Package Production**

The platform produces the surveillance package on a defined annual cycle. The package includes:

* Updated operating performance vs. projections
* Covenant compliance history over the past year
* Material developments (good and bad) since last surveillance
* Updated peer comparison
* Forward outlook
* Sponsor or management changes
* Updated capital structure
* Any other material information

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

* Construction draw processing
* Debt service administration
* Covenant monitoring
* Continuing disclosure
* Material event response
* Amendment and waiver processing
* Refunding coordination
* Restructuring and workout
* Annual surveillance support

### **Draw Processing Cycle**

* Day 1-5: Contractor submits pay app to sponsor
* Day 5-10: Sponsor prepares package, submits to platform
* Day 10-15: Platform validates; monitor schedules site visit
* Day 15-18: Site visit and certification
* Day 18-22: Trustee disbursement
* Day 22-30: Contractor receives payment

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

* Call status — is the bond past its non-call date, or does advance refunding apply?
* Market direction expectations — if rates are expected to fall further, waiting may produce better savings
* Credit improvement — if the obligor's credit has improved since issuance, refunding can capture both rate improvement and credit improvement simultaneously
* Strategic needs — does the obligor need covenant relief, additional debt capacity, structural changes that go beyond pure rate refinancing?
* Tax status changes — was the original bond tax-exempt and the refunding can preserve or modify the tax structure?
* Timing — is there a window before some other event (rating action, sponsor transaction, regulatory change) that affects the deal?

### **13.1.4 The Refunding Execution Workflow**

Once the obligor decides to refund, the deal effectively reruns the full Stage 1-12 workflow:

* Stage 1: Document ingestion (largely already in platform from administration)
* Stage 2: Sponsor diligence (typically light refresh given existing relationship)
* Stage 3: Project underwriting refresh (update pro forma to current conditions)
* Stage 4: Refunding structuring memorandum (the key decisions are different from a new issuance — escrow design, call mechanics, defeasance vs. current refunding, etc.)
* Stage 5: Engagement and rating strategy (typically simpler — existing rating relationships continue)
* Stage 6: Document drafting (much faster than first issuance — most documents are similar to existing with modifications)
* Stage 7: POS production (existing POS provides substantial starting point)
* Stages 8-12: Working group, approvals, rating committee, pricing, closing (largely as new issuance but compressed)

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

* Continuous relationship — the platform's administration creates monthly touchpoints with the obligor; the obligor doesn't shop refundings to other bankers because Nest is already deeply embedded
* Proactive identification — the platform identifies refunding opportunities before the obligor does; when the obligor receives the analysis, Nest is already two steps ahead of any competitor
* Execution speed — refunding execution from Nest's platform is meaningfully faster than from a new-relationship banker; the obligor values the speed and chooses Nest for it

**THE REFUNDING MOAT:** The post-closing administration relationship is the moat that captures the refunding. Without active administration, refundings get shopped — the obligor runs a competitive process and the original banker often loses to a competitor with better current pricing. With active administration, refundings are nearly automatic — the platform identifies them, presents them, and executes them with the existing relationship.

## **13.2 Restructurings — The Consensual Modification Under Stress**

Restructuring is consensual modification of bond terms when the current structure no longer works for the obligor — typically due to credit deterioration, market change, or sponsor situation. Restructuring is distinct from refunding (which is economically driven) and from workout (which involves default). Restructuring happens when the obligor and bondholders agree to modify terms before formal default.

### **13.2.1 Restructuring Triggers**

Common reasons restructuring becomes necessary:

* Sustained operational underperformance — DSCR has eroded from 1.40x at issuance to 1.10x, hovering at the covenant threshold
* Market shift — the project's market has weakened beyond original projections; rents have declined, occupancy has fallen, demand has shifted
* Sponsor-level distress — the sponsor entity faces broader financial issues that affect the obligor
* Capital structure issues — subordinate debt or equity capital has issues that affect the bonds
* Regulatory or legal changes — new regulations affecting the project; tax law changes; legal rulings affecting the asset class
* Sponsor strategy change — the obligor wants to fundamentally change strategy in a way that requires modified covenants
* Combined factors — usually it's multiple factors combining to push the structure toward modification

### **13.2.2 Restructuring Options**

Available modifications fall along a spectrum from light to heavy:

***Light Modifications***

* Covenant relief — temporary loosening of financial covenants for defined periods; sponsor commits to remediate
* Reporting modifications — additional reporting in exchange for covenant relief; bondholders accept information for forbearance
* Reserve adjustments — temporary reduction in reserve requirements; reserves restored later
* Permitted action expansions — expansion of permitted indebtedness or lien baskets to give sponsor more strategic flexibility

***Medium Modifications***

* Coupon adjustments — temporary or permanent coupon reduction in exchange for other concessions
* Amortization adjustments — back-loading principal payments; converting amortization to bullet structures; deferring scheduled principal
* Maturity extension — pushing the maturity out 5-10 years to align with revised business plans
* Additional collateral — sponsor adds collateral (additional real estate, parent guarantee, cash collateral) in exchange for modifications
* Equity contribution — sponsor injects equity into the borrower entity to support credit

***Heavy Modifications***

* Principal reduction — partial forgiveness of principal in exchange for other concessions
* Exchange offer — existing bonds exchanged for new bonds with materially different terms
* Tranche resubordination — senior bonds and subordinate bonds resubordinated to reflect changed credit dynamics
* Debt-to-equity conversion — bonds converted partially or fully to equity in the borrower entity

### **13.2.3 Bondholder Engagement in Restructuring**

Restructuring requires bondholder consent. The relevant threshold depends on what's being modified:

* Majority consent — sufficient for most covenant and operational modifications
* Supermajority consent (typically two-thirds) — required for material modifications affecting bondholder rights
* Unanimous consent — required for modifications to payment terms (coupon, principal, maturity, payment dates) under most indentures

The unanimous consent requirement for payment-term modifications is the highest practical barrier in restructuring. With unanimous required, a single holdout bondholder can block the restructuring. Strategies to address holdouts:

* Consent fees — paying bondholders a fee for consent (typically 25-100 bps of consenting par)
* Exit consents — modifications that materially reduce protection for non-consenting holders, incentivizing consent
* Bond exchange — offering bondholders new bonds in exchange for existing; non-exchanging holders are left with the existing bonds in a less liquid market
* Buybacks — purchasing holdout bonds in the secondary market

### **13.2.4 The Restructuring Working Group**

Restructuring requires expanded counterparty engagement beyond typical issuance:

* Existing bond counsel and disclosure counsel — handle modification documents
* Workout-specialist legal counsel — sometimes engaged for complex restructurings; firms like Kirkland, Weil, Skadden, Latham, Jones Day, Paul Weiss have dedicated restructuring practices
* Financial restructuring advisor — independent restructuring advisor representing either the bondholders or the obligor; firms like Houlihan Lokey, PJT Partners, Lazard, Evercore, Moelis, Centerview have specialized restructuring practices
* Bondholder advisor / representative — sometimes appointed by major bondholders to coordinate bondholder response
* Existing trustee — continues to administer; may step up engagement for restructuring votes
* Rating agencies — track the restructuring; restructuring often produces rating downgrade even if successful

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

* Payment default — failure to pay scheduled debt service; typically the most consequential default; triggers immediate acceleration rights for bondholders subject to cure periods
* Financial covenant default — failure to meet financial covenant; typically has defined cure period or equity cure availability
* Affirmative covenant default — failure to perform required action; typically has notice and cure period
* Negative covenant default — taking a prohibited action; typically immediate event of default with no cure
* Material adverse change — defined event materially impairing performance; broad and discretionary
* Cross-default — default under other material debt triggers default under the bonds
* Bankruptcy — voluntary or involuntary bankruptcy filing; automatic stay applies

### **13.3.2 Pre-Default Workout (Imminent Default)**

When the platform's covenant monitoring detects impending default — the obligor is on track to miss a payment, breach a covenant, or face another defined default event — preemptive workout begins. Goals:

* Identify the cause of impending default — is it cash flow, operational, market, or structural?
* Determine if the cause is temporary or structural
* Identify possible remediation options — equity infusion, asset sale, operational change, covenant waiver
* If remediation can prevent default, execute remediation and remain in non-default status
* If default is unavoidable, prepare for managed default — engage workout counsel, develop forbearance proposal, coordinate with major bondholders

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

* Par-for-par exchange — new bonds at par equal to existing bonds; modifications are to coupon, maturity, or other terms but not principal
* Discounted exchange — new bonds at less than par; effectively a principal haircut
* Cash plus paper — partial cash payment plus new bonds; sometimes used to clear accrued interest plus restructure remaining principal
* Combination — different exchange options offered to different bondholder categories

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

* Honesty — workouts depend on credibility; understating the problem or overstating the solution destroys trust
* Decisiveness — workouts get worse with delay; the platform's job is to identify problems early and force decisions
* Preserved relationships — even failed workouts (workouts that lead to bankruptcy or liquidation) can preserve relationships when the firm has acted in good faith and competently throughout

## **13.4 Tender Offers**

A separate workout-adjacent mechanism. The obligor (or a third party, sometimes a parent or affiliated party) makes a tender offer to repurchase bonds from holders at a defined price. Used in various contexts:

* Voluntary delevering — the obligor has excess cash and wants to retire debt; tender offer at a modest premium to market price
* Distressed buyback — the obligor's bonds are trading at deep discount; obligor buys back at a discount, capturing the spread
* Cleanup tender — at maturity or near maturity, tender offer to retire remaining bonds and simplify capital structure
* Strategic tender — in connection with M&A, sponsor change, or other strategic event

Tender offers must comply with applicable securities law disclosure and procedural requirements. The mechanics involve setting a tender price, defining the tender period, registering the offer, processing tendered bonds, and settling the tender. Nest's platform administers the tender on the obligor's behalf.

## **13.5 The Modification Lifecycle Summary**

Bringing all of Section 13 together: across a bond's life, multiple modification events typically occur. A typical timeline for a 30-year bond:

* Years 0-3: Construction or initial ramp; potential early covenant work or first amendments
* Years 3-7: Operating period; routine amendments for sponsor-level changes; potential first covenant relief
* Years 7-12: First refunding window opens; major refunding event likely
* Years 12-20: Second-cycle administration; potential mid-life restructurings if credit has deteriorated
* Years 20-28: Second refunding window or amortization to retirement
* Years 28-30: Final payments and bond retirement

Each modification event is a fee event. The platform's continuous administration captures these events because the platform identifies them, prepares the analysis, and presents the recommendation to the obligor. The compounding fee revenue across the modification lifecycle is what makes the administration relationship economically dominant.

## **13.6 Quick Reference — Silo 13**

### **Refunding Categories**

* Current refunding — within 90 days of call/maturity; standard mechanism
* Advance refunding — more than 90 days before call; restricted for tax-exempt since 2017
* Forward refunding — lock in future refunding rates today
* Crossover refunding — escrow flips at call date; specialized use

### **Refunding Decision Framework**

**NPV savings threshold —** 3-5% of par being refunded as baseline; lower thresholds for strategic refundings

**Inputs —** Remaining DS; current refunding rate; call premium; COI; escrow yield restriction (tax-exempt)

**Calculation —** PV(Existing DS) − PV(Refunding DS) − Call Premium − COI − Escrow Cost

**Decision —** Proceed when savings exceed threshold; document analysis even when not proceeding

### **Restructuring Options Spectrum**

* Light: covenant relief, reporting modifications, reserve adjustments, permitted action expansions
* Medium: coupon adjustments, amortization changes, maturity extension, additional collateral, equity contribution
* Heavy: principal reduction, exchange offers, tranche resubordination, debt-to-equity conversion

### **Workout Phases**

* Phase 1: Acceleration decision
* Phase 2: Forbearance
* Phase 3: Plan development
* Phase 4: Plan vote
* Phase 5: Implementation
* Phase 6: Monitoring

### **Fee Reference**

**Refunding structuring fee —** $125K-$400K

**Restructuring structuring fee —** 1.0%-2.5% of restructured par

**Workout structuring fee —** 1.5%-3.0% of workout par

**Success fees on completion —** Additional 50-200 bps

### **Lifecycle Modification Events**

* First amendments and minor restructurings: years 0-7
* First refunding: years 7-12
* Mid-life modifications: years 12-20
* Second refunding or amortization: years 20-28
* Final retirement: years 28-30

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

* AAA: 0.00%-0.02% annual default rate; very rare
* AA: 0.02%-0.05% annual default rate
* A: 0.05%-0.15% annual default rate
* BBB: 0.15%-0.35% annual default rate
* BB: 0.75%-1.50% annual default rate
* B: 4.0%-7.0% annual default rate
* CCC and below: 25%-40% annual default rate

These are approximate corporate bond default rates. Municipal bond default rates have historically been substantially lower — even BBB-rated munis have had cumulative 10-year default rates well below 1% in many sectors. The municipal market's historical default experience reflects the strength of underlying revenue streams and the political economy supporting muni issuers.

### **Loss Given Default (LGD)**

**Definition —** Loss as a percentage of par, conditional on default having occurred

**Formula —** LGD = 1 − Recovery Rate

**Use —** Pricing input; structural decision input; key driver of expected loss

Recovery rates vary substantially by security position, sector, structure, and bankruptcy regime. Approximate recovery rates by bond class:

* Senior secured corporate: 60%-80% recovery
* Senior unsecured corporate: 35%-50% recovery
* Subordinated corporate: 15%-30% recovery
* Senior secured project finance: 70%-90% recovery
* Senior unsecured project finance: 40%-60% recovery
* Municipal essential service revenue bonds: 80%-100% recovery (historical)
* General obligation municipal: 95%-100% recovery (historical)
* Conduit revenue bonds: highly variable, 30%-80% depending on sector and structure

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

* Historical revenue and operating income
* Operating margin
* Variability over time
* Peer comparison

### **Coverage Ratios**

* DSCR at issuance and projected forward
* MADS coverage
* Coverage cushion vs. covenant threshold
* Coverage trajectory

### **Leverage and Capital Structure**

* Total debt / EBITDA or appropriate denominator
* Debt / capitalization
* Senior debt position and any structurally subordinated debt
* Refinancing risk

### **Liquidity**

* Cash and liquid assets
* Days cash on hand
* Reserve coverage
* Working capital adequacy

### **Sector and Market Position**

* Sector dynamics — growing, stable, declining
* Market position — leader, mid-pack, laggard
* Competitive moat
* Regulatory environment

### **Asset Quality (where applicable)**

* Physical condition
* Market value vs. debt
* Operational readiness
* Specific risk factors

### **Management and Governance**

* Management experience and track record
* Governance structure
* Strategic clarity
* Operational discipline

### **Structural Features**

* Security — first lien, second lien, unsecured
* Covenant package — quality and tightness
* Reserves — sizing and trigger mechanisms
* Credit enhancement — if any

### **Sponsor / Owner Strength**

* Financial capacity of sponsor
* Strategic alignment with project
* Track record on prior deals
* Quality of relationships with stakeholders

## **14.4 Rating Migration**

Bond ratings change over time. A bond issued at A may migrate to AA (upgrade) or to BBB (downgrade) over its life. Understanding migration patterns matters for structuring decisions and for portfolio risk management.

### **Historical Migration Statistics**

Rating migration rates over 1-year horizons (corporate bonds, approximate historical averages):

* AAA to AA: 7-10% annual probability
* AA to AAA: 1-2%
* AA to A: 5-8%
* A to BBB: 3-5%
* BBB to BB: 5-7%
* BBB to A: 2-4%
* BB to BBB: 5-8%
* BB to B: 8-12%

Migration is highly correlated with sector and economic environment. In recessions, downgrade rates accelerate. In expansions, upgrade rates accelerate. The relevant 'through-the-cycle' migration rates are roughly the averages above, but actual experience varies cyclically.

### **Implications for Structuring**

Rating migration matters for several structuring decisions:

* Call structure design — if the obligor's credit is expected to improve, the call provisions should capture the upgrade benefit through refunding optionality; if expected to stay flat or decline, call provisions can be more aggressive without hurting bondholders
* Covenant rachet provisions — sometimes covenants are structured to tighten as credit improves (encouraging the obligor to maintain credit quality) or to loosen as credit deteriorates (giving the obligor flexibility before default)
* Rating triggers in operational documents — LOC reimbursement agreements, hedging arrangements, and other obligations sometimes have rating triggers; the structuring agent considers whether these are appropriate or whether they create undue downgrade risk

## **14.5 Sector-Specific Loss Patterns**

Each major sector has characteristic loss patterns shaped by its economics, regulatory environment, and structural conventions.

### **Multifamily Housing**

Multifamily housing has the strongest historical default experience among middle-market bond sectors. Loss patterns:

* Default rates: substantially lower than corporate equivalents at the same rating
* Recovery rates: typically 70-90% in default due to underlying real estate value
* Common default triggers: occupancy collapse, market shifts, sponsor distress
* Cycle sensitivity: moderate; multifamily holds up better than commercial RE in downturns

### **Healthcare (Hospitals and Senior Living)**

Healthcare bonds have more variable default experience. Hospitals tend to be more resilient than senior living. Loss patterns:

* Hospital default rates: low historically but accelerating with payer mix shifts and rural hospital stress
* Hospital recovery rates: 50-70% typically; volatile based on facility specifics
* Senior living default rates: meaningful — entry fee structures have specific risks, market sensitivity is high
* Senior living recovery rates: 40-65% typically, with substantial variation
* Common default triggers: payer reimbursement changes, occupancy collapse, regulatory action, sponsor distress

### **Charter Schools**

Charter schools have higher default rates than other muni sectors due to charter non-renewal risk and enrollment volatility.

* Default rates: 1-3% cumulative over 10 years (substantially higher than other muni sectors)
* Recovery rates: highly variable; sometimes 30-50% (school real estate has limited alternative use)
* Common default triggers: charter non-renewal, enrollment decline, academic underperformance
* Mitigation: state intercept where available; strong sponsor track record; multiple-school portfolios

### **Higher Education**

Higher education has bifurcated experience. Elite institutions have negligible default rates. Smaller, less-selective institutions have meaningful default risk that has been accelerating.

* Top tier default rates: minimal
* Mid-tier default rates: low
* Lower-tier default rates: meaningful and rising
* Recovery rates: typically high for institutions with substantial physical campus

### **Project Finance Infrastructure**

Project finance has structured loss patterns shaped by specific project characteristics.

* Operational risk during construction: meaningful but manageable through monitoring
* Demand risk during operations: substantial for some project types (toll roads, certain ports)
* Counterparty risk: substantial for offtake-dependent projects
* Recovery rates: typically high for assets with alternative use; lower for highly specialized assets

### **Utility / Public Power**

Public power and water/sewer utility revenue bonds have very low default experience.

* Default rates: minimal historically
* Recovery rates: typically 90%+ given the essential service nature
* Common stress factors: regulatory rate denials, capital intensive requirements, environmental compliance costs

## **14.6 Loss Management Techniques**

Structural and operational techniques to reduce PD or LGD.

### **Reducing PD**

* Tighter covenants with appropriate cushions — catch deterioration earlier; provide bondholder protection without crushing operations
* Continuous monitoring and early warning — the platform's covenant monitoring layer reduces effective PD by catching problems early enough to remediate
* Operating reserves — provide cushion against operational volatility before debt service is at risk
* Working capital provisions — fund the obligor's working capital requirements with appropriate facilities
* Sponsor support obligations — completion guarantees, operating deficit guarantees, recourse provisions
* Diversification — for portfolio-financed deals, geographic and sector diversification reduces concentration default risk
* Credit enhancement — LOC, bond insurance, parent guarantee effectively transfer PD from underlying obligor to enhancement provider

### **Reducing LGD**

* Senior secured position — first lien on collateral maximizes recovery
* Tranche structures — senior tranches have first claim, reducing senior LGD
* Strong reserves — DSRF, R&R reserve, operating reserve all reduce LGD by providing cash cushions
* Collateral quality — high-quality collateral with active markets supports recovery
* Cash management — strong cash management with controlled accounts reduces leakage in default
* Geographic diversification (for portfolio deals) — reduces correlated losses
* Waterfall design — senior position in waterfall reduces senior LGD
* Cure provisions — flexibility to cure defaults reduces ultimate LGD by avoiding forced bankruptcy

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

* AAA: ~0.01%
* AA: ~0.05%
* A: ~0.10%
* BBB: ~0.30%
* BB: ~1.00%
* B: ~5.50%
* CCC and below: ~30%+

### **Approximate Recovery Rates**

* Senior secured corporate: 60-80%
* Senior unsecured corporate: 35-50%
* Subordinated corporate: 15-30%
* Senior secured project: 70-90%
* Senior secured municipal essential service: 80-100%
* Subordinate municipal: 30-60%

### **Rating Factor Categories**

* Operating performance
* Coverage ratios
* Leverage and capital structure
* Liquidity
* Sector and market position
* Asset quality
* Management and governance
* Structural features
* Sponsor / owner strength

### **PD Reduction Techniques**

* Tighter covenants with appropriate cushions
* Continuous monitoring
* Operating reserves
* Sponsor support obligations
* Credit enhancement

### **LGD Reduction Techniques**

* Senior secured position
* Strong reserves
* High-quality collateral
* Tight cash management
* Waterfall design
* Geographic diversification (portfolio)

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

* calc\_dscr(noi, debt\_service) → DSCR
* calc\_npv\_refunding\_savings(existing\_ds, new\_ds, call\_premium, coi, escrow\_cost, refunding\_rate) → NPV
* calc\_make\_whole\_call\_price(remaining\_cf, treasury\_yield, mw\_spread) → call price
* calc\_effective\_duration(price\_down, price\_up, price\_current, delta\_r) → duration

### **Audit Trail**

Every calculation logs: function name, inputs, intermediate values, output, timestamp, calling workflow context. This creates the complete audit trail that allows the platform to explain every number it produces. When the platform recommends a loan amount, the recommendation traces back through DSCR calculation, NOI calculation, all source data, and the rules applied.

### **Rule Library Integration**

Formulas in the modeling engine are called by the rule library (Silo 16). A rule like 'Set DSRF to safe harbor amount' calls the calc\_dsrf\_safe\_harbor function with deal-specific inputs. The rule and the formula are separate — the rule decides what to do; the formula computes how much.

## **15.12 Quick Reference — Silo 15**

### **Formula Index by Use Case**

***Pro Forma / Underwriting***

* NOI = EGI − Operating Expenses
* EGI = (Gross Potential Rent × (1−Vacancy %)) − Concessions + Other Income
* EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization
* Cap Rate = NOI / Asset Value

***Sizing***

* LTV = Loan / Value (sizing: Loan = Value × LTV ceiling)
* DSCR = NOI / Debt Service (sizing: solve for max loan at target DSCR)
* Debt Yield = NOI / Debt (sizing: Loan = NOI / Target DY)

***Pricing / Yield***

* Price = Σ CF\_t / (1+y/n)^(nt)
* YTM, YTC, YTW: solve for y given price
* G-Spread = Bond Yield − Treasury Yield
* Z-Spread = spread over spot curve
* OAS = Z-Spread − Option Value

***Duration / Risk***

* ModDur = MacDur / (1+y/n)
* EffDur = (P\_down−P\_up)/(2 × P\_0 × Δr)
* DV01 = ModDur × Price × 0.0001
* Convexity correction: ΔP/P ≈ −ModDur × Δy + ½ Conv × Δy^2

***Refunding***

* NPV Savings = PV(Old DS) − PV(New DS) − Call Premium − COI − Escrow Cost
* Make-Whole Price = max(Par, PV at Treasury + MW Spread)
* Breakeven Rate: solve for r where NPV = 0

***Credit Risk***

* EL = PD × LGD
* LGD = 1 − Recovery Rate
* Cumulative PD = 1 − (1 − Annual PD)^T

***Reserves***

* DSRF Safe Harbor = min(MADS, 10% × Par, 125% × Avg Annual DS)
* Cap-I = (Construction Period × Avg Outstanding × Rate) × Cushion
* R&R = Units × Per-Unit Reserve × Years

# **SILO 16 — RULE LIBRARY ARCHITECTURE**

The rule library is the platform's brain. Everything the platform knows about bond structuring, every pattern it has learned from EMMA and EDGAR, every interpretive judgment from Sean that converts publicly available data into operator-useful insight — all of it lives in the rule library. The platform's analytical agents call rules in the library; the library's rules call formulas in the modeling engine; the modeling engine produces outputs that feed agent decisions. This silo is the architecture of the library.

The rule library is also the firm's most defensible competitive position. Anyone can read methodology papers from rating agencies. Anyone can pull bond data from EMMA. What no one else has is the combination of (a) continuous large-scale ingestion of public data, (b) systematic pattern extraction from that data, and (c) Sean's eighteen-year operator judgment encoded as interpretive rules layered on top. The combination is the moat. This silo specifies how that combination gets built and maintained.

**THE RULE LIBRARY PRINCIPLE —** Knowledge is leverage. Every deal Nest does adds to the library. Every methodology paper adds to the library. Every founder interpretation adds to the library. Over time, the library becomes the firm's most valuable asset — a continuously growing repository of structured knowledge that compounds with every new input. A competing firm starting from scratch in year 5 cannot replicate what Nest has accumulated.

## **16.1 The Three Layers of the Rule Library**

The rule library is organized in three layers, each serving a distinct function:

### **Layer 1: Public Data Extraction**

The bottom layer. This layer continuously ingests publicly available data and converts it into structured, queryable form. Source data includes:

* EMMA (Electronic Municipal Market Access) — every municipal bond offering document, every continuing disclosure filing, every material event notice
* EDGAR (SEC's electronic filing system) — every corporate bond offering document, every periodic report, every material event filing
* DAC Bond / DPC Data / Bloomberg / Refinitiv — bond pricing and secondary market data
* Rating agency publications — methodology papers, rating reports, default studies, special reports
* MSRB rule filings — regulatory updates affecting muni market
* IRS publications — tax-exempt bond guidance, revenue procedures, private letter rulings
* Federal regulatory publications — bank capital rules, insurance regulatory guidance affecting bond buyers
* Sector-specific public sources — HUD multifamily data, CMS healthcare data, state HFA data, state department of education charter data

The layer's job is mechanical: pull the data, parse it into structured form, classify the documents, extract the structured fields, index everything for retrieval. No interpretation — just structured data.

### **Layer 2: Behavioral Pattern Extraction**

The middle layer. This layer reads the structured data from Layer 1 and identifies patterns. Patterns include:

* Default patterns — which sectors, which structures, which obligors default; what default looked like in the months and quarters before
* Rating migration patterns — which factors precede upgrades, which precede downgrades
* Covenant compliance patterns — which covenants get tripped, in what conditions, with what recovery patterns
* Pricing patterns — which structural features correlate with tighter pricing, which with wider
* Counterparty patterns — which bond counsel firms get assigned which deal types, which trustees bid which fees, which rating agencies rate which sectors
* Sector trend patterns — which sectors are growing, which are stressed, which are showing structural shifts
* Refunding patterns — when refundings occur, at what NPV savings thresholds, with what frequency

The layer's output is structured pattern descriptions — 'in healthcare hospital bonds, the average days cash on hand at default is X; the time from first covenant trip to default averages Y; the recovery rate in workout averages Z.' These patterns are quantitative descriptions of how the bond market actually behaves, derived from public data.

### **Layer 3: the founders' Interpretive Judgment**

The top layer. This is where eighteen years of operator experience gets layered onto the patterns from Layer 2. Sean's judgment converts statistical patterns into actionable structural decisions. Interpretive rules look like:

* 'Pattern X in the public data typically means Y in the deal at hand; therefore structure Z'
* 'When rating committee composition includes analysts A, B, and C, the typical response to factor F is X; therefore present F by emphasizing G'
* 'In market environment E, buyer pool P typically pays additional bps for structure S; therefore include S even at modest fee cost'
* 'Sponsor type T has historical default pattern P; therefore include protective covenant C and reserve R even when not technically required by the rating'
* 'Sector S is showing structural change C; therefore re-underwrite assumption A with adjustment X'

Layer 3 is where the difference between a smart computer and a smart banker becomes apparent. Layer 1 and Layer 2 can be built by competent engineers and data scientists. Layer 3 requires the operator judgment that Sean brings. The interpretation rules are encoded explicitly — they're not invisible to the platform, they're documented and applied systematically. This is what makes the platform reproducible and improvable.

**THE LAYER 3 MOAT:** Layer 1 data is publicly available. Layer 2 patterns can be extracted by anyone with the data and the analytical capability. Layer 3 interpretations require eighteen years of operator experience. The firm that combines the three is the firm that has the moat. Sean's eighteen years are not duplicable. They get encoded into the library so they're not lost when Sean is in a meeting or on vacation, but the source — Sean's actual experience — is what produces the layer 3 rules that the platform encodes.

## **16.2 Rule Categories — What Layer 3 Rules Look Like**

Layer 3 rules fall into several categories, each addressing a specific decision point in the workflow.

### **Sponsor Diligence Rules**

Rules that interpret patterns in sponsor diligence findings. Examples:

* 'Sponsor with 3+ prior projects in administered portfolio with clean covenant history → enhanced trust profile; lighter ongoing reporting acceptable'
* 'Sponsor with 1-2 prior projects with workout history → enhanced ongoing reporting required, larger DSRF cushion'
* 'First-time sponsor in middle-market bond space → require personal guarantee on construction completion, larger operating reserve'
* 'Sponsor where principal has been named in litigation involving prior project investors → automatic decline regardless of other factors'

### **Project Underwriting Rules**

Rules that govern how the platform re-underwrites the sponsor's pro forma. Examples:

* 'Multifamily project in market with vacancy rising 2+ years → use trailing 12-month actual vacancy, not market projection'
* 'Healthcare project with concentration of Medicaid revenue above 60% → stress-test revenue assumption by 5%+ for reimbursement risk'
* 'Senior living entry-fee project → require absorption schedule supporting cap-I sizing assumption'
* 'Project in market with measurable seasonal revenue pattern → require operating reserve sized to seasonal trough'

### **Structuring Rules**

Rules that guide structural design. Examples (the rules from earlier silos formalized):

* 'Investment-grade target rating, taxable corporate, 10-30 year maturity → default to make-whole call at Treasury + 30 bps with par call window 90 days before maturity'
* 'Tax-exempt long-dated muni → default to non-call-10 with par call thereafter'
* 'BB or B-rated corporate, 5-7 year maturity → default to non-call-3 with subsequent step-down premium call to par over 4 years'
* 'Multifamily new construction → default to senior 80% / subordinate 20% structure with construction-period sweep mechanic'
* 'Healthcare with strong native credit → consider single rating; if subscale buyer pool, consider dual rating with cost / benefit analysis'

### **Rating Strategy Rules**

Rules that govern rating agency selection and presentation. Examples:

* 'For sector S, agency A's analyst committee has historically focused on factor F; emphasize F in the rating presentation; weak F → consider competing agency'
* 'When the rating committee includes analyst X (known for conservatism on factor Y), pre-structure to anticipate Y-related questions'
* 'For deal type D, agency A typically rates one notch above agency B; if single rating, consider A; if dual rating, both'
* 'New methodology paper from agency C published — re-run all administered deals in affected sector to identify rating action risk'

### **Pricing Rules**

Rules that guide pricing strategy. Examples:

* 'For taxable corporate at A rating, current Treasury + 90-130 bps range; press for tight end on book oversubscription'
* 'For 30-year tax-exempt at A-/A rating, lifeco pool absorbs 5%+ coupon at premium pricing; structure accordingly'
* 'For VRDO deals with strong LOC bank, target SIFMA + 50-100 bps; widen for weaker LOC or smaller deals'
* 'In falling rate environment, push for longer call protection at modest coupon cost; lock in pricing optimization'
* 'In rising rate environment, accept tighter call protection for tighter coupon; reduce premium for refinancing optionality'

### **Covenant Design Rules**

Rules that calibrate covenant thresholds. Examples:

* 'Stabilized multifamily DSCR covenant: target 1.20x with NOI cushion 15-25% above expected'
* 'New construction multifamily DSCR covenant: deferred until 12 months post-stabilization; thereafter 1.15x'
* 'Healthcare hospital DSCR covenant: 1.20x with quarterly testing; days cash on hand at 200+ days'
* 'Charter school DSCR covenant: 1.10x; thereafter requires charter renewal as separate covenant'

### **Reserve Sizing Rules**

Rules that govern reserve sizing decisions. Examples:

* 'DSRF default: MADS unless rating agency requires more for specific sector; healthcare 1.25× MADS standard'
* 'Cap-I sizing: estimated construction interest × 1.20 cushion; reduce cushion to 1.15 for highly predictable construction (e.g., LIHTC standard product)'
* 'R&R Reserve sizing: per-unit reserve at sector-standard rate; reduce for newer asset (under 5 years old) by 25%'
* 'Operating Reserve: 6 months for new construction; 3 months for stabilized; healthcare requires 12 months days cash separately'

### **Credit Enhancement Rules**

Rules that govern enhancement selection. Examples:

* 'Where rating uplift from enhancement > 30 bps tightening and enhancement cost is < tightening NPV, deploy enhancement'
* 'For BBB native credit with AA-insured pricing improvement of 80+ bps, bond insurance creates substantial NPV value; consider'
* 'For VRDO deals, LOC is structural requirement, not optional enhancement'
* 'For affordable multifamily, evaluate HUD-insured option vs. tax-exempt conduit structure; HUD often dominates at AAA effective rating'

### **Documentation Rules**

Rules that govern document drafting choices. Examples:

* 'For sector S, use template T1 unless special structure variants apply'
* 'For deal size above $50M, include separate disclosure counsel; below $50M, dual counsel typical'
* 'Continuing disclosure undertaking: include sector-specific operating data per Rule 15c2-12 sector best practice'
* 'Trustee transition provisions: include lighter transition triggers than market standard to preserve flexibility'

### **Administration Rules**

Rules that govern ongoing administration. Examples:

* 'Covenant ratio trending toward threshold over 3 consecutive quarters → trigger orange alert and obligor engagement'
* 'DSRF balance dropping below required level → automatic notice; trigger replenishment plan within 30 days'
* 'Material event detected from public source → file event notice within 5 business days; coordinate with obligor on operational response'
* 'Refunding economics crossing 4% NPV savings threshold → flag for obligor presentation'

## **16.3 How Rules Get Created and Updated**

The rule library is not static. Rules get created when patterns are identified or interpretations are formalized; rules get updated when patterns shift or interpretations evolve.

### **Rule Creation Sources**

* Methodology papers — when rating agencies publish updated methodologies, new rules are added to capture the changes
* Default studies — when default studies update default rates or recovery rates, the relevant rules are recalibrated
* Deal completions — every deal completed adds data to the library; some deals produce specific new rules from the lessons learned
* Rating committee feedback — when a rating committee provides feedback on a deal, the feedback gets encoded as a rule for future deals
* Workout / restructuring experience — when a workout produces specific lessons, those lessons become rules
* founder interpretation sessions — periodic structured sessions where Sean reviews recent deals, identifies patterns, and articulates new interpretive rules
* Market shifts — when market conditions shift materially, relevant rules are reviewed and updated
* Regulatory changes — when SEC, MSRB, IRS, or other regulators issue new rules, the library captures them

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

* Rule ID — unique identifier for the rule
* Rule category — sponsor diligence, structuring, rating strategy, etc.
* Rule layer — Layer 1, 2, or 3
* Rule trigger — the conditions under which the rule applies
* Rule action — what the rule does when triggered (recommend a value, set a default, flag for human review, decline the deal, etc.)
* Rule evidence — citations to the source data, methodology paper, or experience that supports the rule
* Rule status — active, deprecated, under review
* Rule version — current version number; prior versions archived
* Rule author — who created the rule (typically Sean for Layer 3; the data layer for Layer 1 and Layer 2)
* Rule history — when applied, with what outcomes

The platform's workflow agents query the library by category, trigger, and context. The library returns the applicable rules, the agent applies them, and the result feeds the agent's downstream decision.

### **Rule Conflict Resolution**

When multiple rules apply and conflict, the library has defined precedence:

* Layer 3 rules supersede Layer 2 rules (operator judgment overrides pattern observation when explicitly differing)
* More specific rules supersede more general rules (sector-specific overrides general)
* More recent rules supersede older rules of the same specificity
* Hard rules (disqualifiers, regulatory requirements) supersede soft rules (preferences, defaults)

When the precedence doesn't fully resolve a conflict, the rule application is flagged for human review (Sean or Josh) to make the call. The human resolution then becomes a new rule for future cases.

## **16.6 The Library's Continuous Growth**

Critical operating principle: every deal grows the library.

### **Per-Deal Growth Cycle**

For every deal:

* During structuring, every rule applied is logged
* At closing, the structural decisions are captured with the rules that produced them
* During administration, every covenant test, every event, every modification adds to the library
* At refunding, the refunding decision and the rules that produced it are added
* At restructuring or workout, the lessons learned are captured
* Post-deal review identifies any rules that should be revised based on the experience

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

* Sponsor diligence
* Project underwriting
* Structuring
* Rating strategy
* Pricing
* Covenant design
* Reserve sizing
* Credit enhancement
* Documentation
* Administration

### **Rule Metadata**

* Rule ID, Category, Layer
* Trigger, Action, Evidence
* Status (active/deprecated)
* Version, Author, History

### **Rule Sources**

* Methodology papers
* Default studies
* Deal completions
* Rating committee feedback
* Workout / restructuring experience
* founder interpretation sessions
* Market shifts
* Regulatory changes

### **Conflict Resolution Precedence**

* Layer 3 supersedes Layer 2
* Specific supersedes general
* Recent supersedes older
* Hard rules supersede soft preferences
* Unresolved conflicts → human review → new rule

# **SILO 17 — AGENT SPECIFICATIONS BY WORKFLOW STAGE**

The platform's analytical work happens through agents — specialized AI workers, each scoped to a defined function, each calling defined tools, each producing defined outputs. This silo specifies every agent the platform requires, what each does, what inputs it consumes, what outputs it produces, what rule library categories it queries, and what human gateways it interacts with. The engineer building the platform reads this silo to understand the agent inventory and the integration points.

**THE AGENT PRINCIPLE —** Each agent is narrow and accountable. An agent that tries to do everything ends up doing nothing well. The platform's agents are specialists — each scoped to a defined workflow stage and a defined output, each with clear inputs and outputs, each with traceable decision logic. Narrow agents compose into the full workflow.

## **17.1 The Agent Inventory**

The platform requires the following agents, organized by workflow stage:

### **Stage 0 Agents**

* Triage Agent — inbound qualification
* Sponsor Onboarding Agent — portal setup and initial outreach

### **Stage 1 Agents**

* Document Ingestion Agent — file classification, OCR, parsing
* Data Validation Agent — completeness checks, freshness checks

### **Stage 2 Agents**

* Sponsor Diligence Agent — background, litigation, regulatory, prior project review
* Sponsor Profile Agent — synthesis of diligence into go/no-go profile

### **Stage 3 Agents**

* Re-Underwriting Agent — independent pro forma rebuild
* Sizing Agent — multi-test sizing analysis
* Structuring Gap Agent — diff sponsor vs. Nest, propose restructure options

### **Stage 4 Agents**

* Structuring Agent — full deal structure decision
* Conduit Selection Agent — identify and evaluate conduit options
* Memorandum Generation Agent — produce Structuring Memorandum

### **Stage 5 Agents**

* Rating Strategy Agent — methodology analysis and agency selection
* Rating Presentation Agent — produce rating presentation deck
* Engagement Letter Agent — produce engagement letters with all relevant counterparties

### **Stage 6 Agents**

* Document Drafting Agent — produce first drafts of all transaction documents
* Document Version Control Agent — manage redlines, track comments, consolidate revisions

### **Stage 7 Agents**

* POS Production Agent — produce Preliminary Official Statement
* Pitch Book Agent — produce investor pitch book and roadshow materials
* Disclosure Validation Agent — disclosure completeness and risk factor coverage

### **Stage 8 Agents**

* Working Group Coordinator Agent — agenda, action items, status tracking
* Comment Consolidation Agent — process redlines from all counsels
* Conditions Precedent Tracker — monitor satisfaction of closing conditions

### **Stage 9 Agents**

* Conduit Approval Agent — manage conduit application and approval process
* TEFRA Coordination Agent — handle TEFRA hearing logistics

### **Stage 10 Agents**

* Rating Question Response Agent — log analyst questions, draft responses
* Rating Committee Prep Agent — prepare management for rating meetings
* Rating Tracking Agent — monitor committee process, flag concerns

### **Stage 11 Agents**

* Pricing Analysis Agent — track marketing, book oversubscription, recommend pricing positions
* Buyer Pool Agent — identify and engage relevant institutional buyers via BD partner

### **Stage 12 Agents**

* Closing Checklist Agent — manage 80-150 item closing checklist
* Funds Flow Agent — coordinate flow of funds at closing
* Closing Binder Agent — assemble post-closing record

### **Stage 13 Agents — Post-Closing Administration**

* Draw Processing Agent — validate construction draw requests
* Debt Service Administration Agent — calculate and coordinate periodic payments
* Covenant Monitoring Agent — automated covenant testing
* Compliance Certificate Agent — generate periodic compliance certificates
* Continuing Disclosure Agent — produce EMMA filings
* Material Event Detection Agent — monitor for events triggering disclosure
* Amendment and Waiver Agent — manage consent solicitation processes
* Refunding Identification Agent — continuous refunding NPV analysis
* Surveillance Support Agent — produce annual surveillance packages
* Workout Support Agent — provide structural support during workouts

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

* Stage 0: 2 agents (Triage, Onboarding)
* Stage 1: 2 agents (Ingestion, Validation)
* Stage 2: 2 agents (Diligence, Profile)
* Stage 3: 3 agents (Re-Underwriting, Sizing, Structuring Gap)
* Stage 4: 3 agents (Structuring, Conduit Selection, Memorandum)
* Stage 5: 3 agents (Rating Strategy, Rating Presentation, Engagement Letter)
* Stage 6: 2 agents (Drafting, Version Control)
* Stage 7: 3 agents (POS Production, Pitch Book, Disclosure Validation)
* Stage 8: 3 agents (Working Group, Comment Consolidation, Conditions Precedent)
* Stage 9: 2 agents (Conduit Approval, TEFRA)
* Stage 10: 3 agents (Question Response, Committee Prep, Tracking)
* Stage 11: 2 agents (Pricing Analysis, Buyer Pool)
* Stage 12: 3 agents (Closing Checklist, Funds Flow, Binder)
* Stage 13: 10 agents (Draw, Debt Service, Covenant Monitor, Compliance Cert, Continuing Disclosure, Material Event, Amendment, Refunding ID, Surveillance, Workout)
* Total: ~43 distinct agents

### **Cross-Cutting Patterns**

* Audit trail for every action
* Human gateway for high-stakes / low-confidence decisions
* Continuous learning loop
* Sector-specific variants
* Comprehensive documentation

# **SILO 18 — TECH STACK WIRE-UP**

This silo is the engineer's guide. It specifies the concrete architecture decisions, technology choices, integration points, and build sequence required to translate everything in Silos 1-17 into working software. Sean is not the engineer; this silo describes what the engineer needs to know about the business so they can make the technical decisions and what business-side decisions need to be locked before engineering can begin.

This silo also lays out a phased build sequence so that the platform delivers value at every milestone rather than requiring full completion before any value is generated. The phasing is critical — Nest must be operationally generating revenue with partial platform functionality long before the full platform is built.

**THE BUILD PRINCIPLE —** Build for value at each phase. Phase 1 delivers a working tool that captures meaningful operating leverage. Phase 2 adds capability. Phase 3 builds toward the full vision. Nest does not need the perfect platform on day one — it needs a useful platform that grows. The phasing makes the build economically realistic and operationally usable from early stages.

## **18.1 The Core Architecture**

The platform is structured as a multi-tier system. The tiers, from bottom to top:

### **Tier 1: Data Layer**

The data layer holds all structured data the platform operates on. Major data stores:

* Deal database — all deals (active, closed, administered), with full structural details, document index, working group, status, history
* Counterparty database — bond counsel, trustees, conduit issuers, rating agencies, BD partners, sponsors, etc., with profiles, fees, performance history
* Document repository — all transaction documents indexed by deal, document type, version
* Public data warehouse — EMMA filings, EDGAR filings, rating agency publications, IRS guidance — continuously ingested and structured
* Modeling engine database — formulas, calculation logs, audit trail
* Rule library database — all rules with metadata, version history, application history
* Pattern data warehouse — behavioral patterns extracted from public data
* Administration data — covenant test history, draw history, disclosure filings, refunding analyses

### **Tier 2: Application Layer**

The application layer contains the business logic and agent runtime:

* Agent runtime — orchestration of agent calls, sequencing, dependency management
* Workflow engine — manages deal progression through workflow stages
* Document templating engine — generates draft documents from precedent and structural inputs
* Modeling engine — runs financial calculations
* Rule library query engine — finds applicable rules for a given context
* Notification and alerting system — manages alerts to humans and counterparties
* Reporting engine — generates dashboards, status reports, compliance reports

### **Tier 3: Integration Layer**

The integration layer connects the platform to external systems:

* EMMA API integration — for filing and retrieving municipal bond disclosure
* EDGAR API integration — for filing and retrieving corporate bond disclosure
* Rating agency portals — secure document delivery
* Document signing platform (DocuSign or equivalent) — for executed signatures on transaction documents
* DTC integration — for bond issuance, payment processing, consent solicitation distribution
* Accounting system integrations — APIs to NetSuite, QuickBooks, Sage Intacct, Workday for obligor financial data pull
* Banking integrations — for trustee account integration, wire processing visibility
* Public records search APIs — PACER, state court searches, sanctions screening, credit bureau
* Market data integrations — Bloomberg, Refinitiv, DPC Data, MMD for benchmark rates and comparable transactions

### **Tier 4: User Interface Layer**

The UI layer is where humans interact with the platform:

* Banker portal — for Nest team (Sean, Josh, and growing team) to manage deals, review agent outputs, make gateway decisions
* Sponsor portal — for sponsors and obligors to upload documents, review structuring memoranda, approve decisions, monitor administered bonds
* Counterparty portal — for bond counsel, trustees, conduits, rating analysts to access deal information and deliver documents
* Reporting and analytics dashboard — across the firm's deal portfolio, financial performance, and forward pipeline
* Administration dashboard — for active monitoring of administered bonds (Stage 13)

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

* Encryption in transit (TLS 1.3 for all network traffic)
* Encryption at rest (database encryption, S3 encryption)
* Role-based access control (RBAC) — different access levels for different team members and counterparties
* SOC 2 Type II compliance over time (not required for early build but required as the firm scales)
* Regular penetration testing
* Secrets management (AWS Secrets Manager, HashiCorp Vault, or equivalent)
* MFA on all human accounts
* Audit logging on all sensitive operations

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

* PACER (federal court records) — paid API with documented procedures
* State court records — varies by state; some have APIs, others require manual lookup
* OFAC, SDN, PEP screening — commercial services like Refinitiv World-Check, Dow Jones Risk Center, LexisNexis Bridger
* Credit bureaus — Experian, Equifax, TransUnion via commercial integration
* Bankruptcy and litigation databases — Westlaw, LexisNexis

### **Market Data Integration**

* Bloomberg Terminal API — for market data, comparable transactions, pricing
* Refinitiv (Eikon) — alternative to Bloomberg
* DPC Data — specialized municipal market data
* MMD (Municipal Market Data) — AAA muni yield curves
* Treasury data — direct from Treasury.gov API
* Sector-specific data — varies by sector; some via specialized providers (CoStar for CRE, STR for hospitality, etc.)

## **18.4 The Phased Build Sequence**

The full platform vision in Silos 1-17 is too large to build in one phase. The build sequence is phased to deliver value at each stage.

### **Phase 1: Operational Tool — Months 1-6**

Phase 1's goal: build a working tool that captures meaningful operating leverage on the first set of deals. The tool doesn't need to be elegant; it needs to be useful.

* Document storage and organization — central place for all deal documents, organized by deal and document type
* Working group communication — managed email, document distribution, status tracking
* Basic financial modeling — Python-based pro forma and sizing models for the most common deal types
* Simple document templates for the first 5-10 standard transaction documents
* Basic dashboard for Sean and Josh to see active deals and status
* Counterparty database with contact information and basic fee profiles
* Manual rule application — Sean and Josh apply the structural decisions; the platform helps with execution

Phase 1 is not the full platform vision. It's a meaningfully better tool than what most middle-market bankers use, and it captures real value while the rest is being built.

### **Phase 2: Agent Foundation — Months 7-18**

Phase 2 introduces the AI agent layer. The platform starts making structural recommendations rather than just executing decisions.

* Document ingestion agent — automated classification and parsing of uploaded documents
* Re-underwriting agent — independent pro forma rebuild for the most common deal types
* Sizing agent — multi-test sizing for the most common deals
* Document drafting agent — automated first drafts of standard transaction documents
* Rule library foundation — Layer 1 (public data) and basic Layer 3 (founder rules) for the most common sectors
* EMMA integration — basic filing capability for continuing disclosure
* Better dashboards and reporting

By the end of Phase 2, the platform is materially more capable than Phase 1. Routine deal types are largely automated; complex deals still require heavy founder involvement.

### **Phase 3: Full Workflow — Months 19-36**

Phase 3 builds out the complete workflow agent set.

* All agents in Silo 17, deployed across all workflow stages
* Full modeling engine with all formulas in Silo 15
* Full rule library across all sectors
* EDGAR integration for corporate bonds
* Full disclosure automation
* Covenant monitoring across full administered portfolio
* Refunding identification across portfolio
* Strong sector specialization across multifamily, healthcare, charter schools, higher ed, project finance, utility

By the end of Phase 3, the platform operates as the firm's primary tool for deal execution. New deals enter, move through the workflow with limited human intervention except at gateways, and close through automated processes.

### **Phase 4: Continuous Learning and Expansion — Months 37+**

Phase 4 is ongoing. The platform continuously expands:

* Layer 2 pattern extraction at scale across all public data sources
* Layer 3 rule expansion as deals are completed and lessons learned
* Sector expansion into adjacent areas as the firm grows
* New product types — refinancing windows, secondary trading capabilities, structured products
* Integration with new counterparties and data sources
* Continuous improvement of every agent's performance

## **18.5 Team Structure**

Building the platform requires the right team. Recommended structure by phase:

### **Phase 1 Team (Months 1-6)**

* Tech lead / architect — senior engineer responsible for architecture and major decisions
* 1-2 backend engineers — Python and database work
* Frontend developer — React or equivalent for the UI
* Designer / UX (part-time) — interface design for banker and sponsor portals
* DevOps / infrastructure (part-time) — cloud setup and operations

### **Phase 2 Team (Months 7-18)**

* Add: AI engineer with experience building agent systems with Claude or similar models
* Add: data engineer focused on EMMA/EDGAR ingestion and pattern extraction
* Add: full-time DevOps and observability engineer
* Add: financial modeling specialist to translate Silo 15 formulas into the modeling engine
* Possibly: dedicated security engineer or part-time security consultant

### **Phase 3 Team (Months 19-36)**

* Expand engineering team to 8-12 people
* Add: dedicated product manager or business analyst
* Add: sector specialists who can train the platform on sector-specific patterns
* Add: compliance / regulatory specialist

## **18.6 Risk Considerations**

Risks the engineer must address from day one:

### **Regulatory Risk**

The platform handles regulated activities (municipal advisory services, securities disclosure, bondholder communication). The platform itself doesn't need to be registered as a regulated entity, but the activities it supports are regulated. Architecture must support compliance:

* Audit trails on all advisory decisions
* Document retention per SEC and MSRB requirements
* Disclosure compliance baked into workflows
* No automated trading or placement (those activities flow through the BD partner's registered platform)
* Conflict of interest protections built into the agent system

### **Data Privacy and Security**

The platform handles sensitive sponsor and obligor data. Required protections:

* Access controls limiting who can see what
* Encryption of all sensitive data
* Audit logs on access to sensitive data
* Compliance with applicable privacy laws (state laws, sector-specific laws like HIPAA where healthcare data is involved)

### **Agent Reliability**

AI agents can produce confident-sounding outputs that are wrong. The platform must protect against this:

* Human gateways at every high-stakes decision
* Confidence thresholds — low-confidence outputs flag for human review
* Comparison to precedent — agent outputs that deviate substantially from precedent flag for review
* Continuous quality monitoring of agent outputs against actual outcomes

### **Vendor Dependence**

The platform depends on vendors (Claude API, AWS, EMMA, etc.). Vendor outages or policy changes could disrupt operations. Architecture should:

* Avoid single points of failure where possible
* Maintain operational continuity when vendors have outages (queued operations, cached data)
* Monitor vendor relationships and pricing

### **Cybersecurity Risk**

Financial services platforms are targets. Aggressive cybersecurity posture is required from day one, not added later.

## **18.7 Budget Considerations**

Approximate budgets by phase (highly variable based on team location, structure, and specific scope):

### **Phase 1 (Months 1-6)**

* Team cost: $1.5M-$3M (4-6 person team for 6 months at SF/NYC rates; lower elsewhere)
* Infrastructure: $25K-$75K (cloud, basic SaaS tools)
* Total Phase 1: $1.5M-$3M

### **Phase 2 (Months 7-18)**

* Team cost: $4M-$8M (8-10 person team for 12 months)
* Infrastructure and data: $200K-$500K (Bloomberg, Refinitiv, DPC Data, etc.)
* Total Phase 2: $4M-$8.5M

### **Phase 3 (Months 19-36)**

* Team cost: $9M-$18M (12-15 person team for 18 months)
* Infrastructure and data: $400K-$1M
* Compliance and security: $200K-$500K
* Total Phase 3: $9.5M-$19.5M

### **Cumulative Total (3 years)**

* Total platform investment over 3 years: $15M-$30M depending on team size and scope

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

* Python 3.11+ as primary language; TypeScript/React for UI
* PostgreSQL relational DB; cloud object storage for documents; Elasticsearch for search
* AWS, GCP, or Azure cloud; Docker; Kubernetes as scale demands
* Claude API for AI agents; custom orchestration to start
* Jinja2 + python-docx for document templating
* DocuSign for electronic signatures
* OpenTelemetry for observability

### **Phased Build**

* Phase 1 (Months 1-6): Operational tool — document storage, workflow management, basic modeling, simple templates, basic dashboards
* Phase 2 (Months 7-18): Agent foundation — ingestion, re-underwriting, sizing, drafting agents; rule library foundation; EMMA integration
* Phase 3 (Months 19-36): Full workflow — all agents, all formulas, full rule library, EDGAR, disclosure automation, full sector coverage
* Phase 4 (Months 37+): Continuous learning — Layer 2 pattern extraction, rule expansion, sector expansion, product expansion

### **Team Scaling**

* Phase 1: 4-6 person team
* Phase 2: 8-10 person team
* Phase 3: 12-15 person team

### **Budget Scaling**

* Phase 1: $1.5M-$3M
* Phase 2: $4M-$8.5M
* Phase 3: $9.5M-$19.5M
* Total 3-year platform investment: $15M-$30M

### **Key Risks**

* Regulatory compliance — audit trails, disclosure compliance
* Data privacy and security — access controls, encryption, sector-specific laws
* Agent reliability — human gateways, confidence thresholds, precedent comparison
* Vendor dependence — redundancy where possible, continuity planning
* Cybersecurity — aggressive posture from day one

# **THE ORGANIZATIONAL STRUCTURE**

This section describes Nest's organizational structure desk by desk. Each desk mirrors an institutional counterpart — a real bank, rating agency, trustee, or related counterparty whose organizational structure has evolved over decades and whose roles are well understood across the industry. Nest deploys AI agents into operational positions within these desks; human team members occupy leadership and judgment positions. The mirroring is deliberate. It produces clean external interfaces, defensible regulatory positioning, and the operational rigor that comes from following organizational patterns the industry has already pressure-tested.

Each desk writeup includes: the institutional mirror (who we are mirroring and the specific roles within that institution), the Nest desk structure (each agent role with scope, inputs, and outputs), the handoffs to adjacent desks, the platform component mapping (where this desk lives in the existing Nest platform), and the existing-versus-needed inventory (which of the existing twenty-five Nest agents plug into this desk and what additional capability needs to be deployed).

**THE MIRRORING PRINCIPLE —** Nest does not invent organizational structure. The firm mirrors the structures that investment banks, rating agencies, trustee banks, financial guaranty companies, bond counsel firms, and broker-dealer syndicate desks have evolved. Every desk in Nest has an institutional counterpart. Every agent role within each desk has a counterpart human role within the institutional mirror. The agents fit into existing industry workflow because the workflow is what they are designed around.

## **4.1 — The Leadership Layer**

The leadership layer comprises the human founders and Orca, the digital C-suite. The founders set strategic direction, own key client and counterparty relationships, provide judgment at exception thresholds, and act as the firm's external face. Orca provides executive function across the operational desks — strategic coordination, financial planning, operational oversight, technology direction, business development direction, and legal and compliance oversight.

### **4.1.1 The Founders**

Sean Gilmore and Josh Edwards co-found and lead Nest. The founders own the firm's strategic direction, the senior counterparty relationships, the rating agency and bond insurer relationships at the executive level, the BD partner relationship, the lead sponsor relationships, the board representation function, the regulatory positioning, and the hiring decisions for any human team members brought in over time.

### **4.1.2 Orca — The Digital C-Suite**

Orca is the firm's digital executive function. The six Orca agents report up to the founders and provide executive coordination across the operational desks below.

***CEO Agent***

**Function —** Strategic direction, firm-wide priority-setting, founder-facing executive coordination, weekly and monthly firm review.

**Inputs —** Founder strategic guidance, weekly desk reports from the operational layer, pipeline status, deal-by-deal escalations, market intelligence from Eagle Eye and other BDO functions.

**Outputs —** Strategic priorities for the operational desks, prioritization decisions on deal pipeline, founder briefings, exception escalations to the founders, firm-level strategic communications.

**Reports To —** Sean Gilmore and Josh Edwards.

***CFO Agent***

**Function —** Financial planning, deal-level economics tracking, firm-level revenue and expense forecasting, capital allocation across firm priorities, financial reporting to the founders, banking and treasury management.

**Inputs —** Deal pipeline with expected fees, actual deal closings, expense data across the operational desks, construction card platform rebate revenue, third-party vendor invoices, regulatory and licensing costs.

**Outputs —** Monthly financial reports to the founders, deal-by-deal profitability analysis, firm-level budgeting and forecasting, capital allocation recommendations, treasury function execution.

**Reports To —** CEO Agent and the founders.

***COO Agent***

**Function —** Operational coordination across the fourteen operational desks, workflow management, exception handling, performance tracking, cross-desk handoff coordination.

**Inputs —** Daily and weekly desk-level status from all operational desks, exception flags from individual desks, workflow bottleneck identification, productivity and throughput metrics.

**Outputs —** Cross-desk coordination decisions, escalations to the CEO Agent and founders, operational improvements, agent deployment optimization, throughput reporting.

**Reports To —** CEO Agent and the founders.

***CTO Agent***

**Function —** Platform architecture, agent infrastructure decisions, technology vendor management, build prioritization, technical exception management, integration architecture.

**Inputs —** Operational desk requests for new platform capability, technology vendor performance, platform compute and cost data, security and reliability metrics, integration architecture across data sources.

**Outputs —** Build prioritization recommendations, technology architecture decisions, vendor management decisions, technical exception escalations, platform capability roadmap.

**Reports To —** CEO Agent and the founders.

***Head of Business Development Agent***

**Function —** Origination strategy, pipeline oversight, BD partner relationship coordination, conference and brand presence direction, sourcing campaign architecture.

**Inputs —** Pipeline data from the Business Development Organization desk, sponsor intelligence from Eagle Eye and the BDO sub-agents, BD partner performance data, conference and brand activity tracking, sector concentration data.

**Outputs —** Origination strategy direction, pipeline priorities, BD partner coordination, conference and brand strategy, sourcing campaign design, sub-industry silo emergence signals.

**Reports To —** CEO Agent and the founders.

***In-House Counsel / Chief Compliance Officer Agent***

**Function —** Legal and regulatory oversight at the firm level, compliance posture management, executive-level legal exception handling, regulatory positioning, board-level legal matters.

**Inputs —** Regulatory developments affecting Nest's MA registration and securities law compliance, legal matters arising from individual deals (escalated by the Legal and Compliance Desk), compliance flags from operational desks, KYC/AML escalations.

**Outputs —** Compliance posture decisions, regulatory positioning recommendations, legal exception decisions, escalations to outside counsel, board-level legal matters.

**Reports To —** CEO Agent and the founders.

### **4.1.3 Where Orca Lives in the Existing Platform**

Orca corresponds to the admin dashboard layer of the existing Nest platform plus the executive coordination functions that sit above the operational sections (bond desk, surety desk, Night Vision, Eagle Eye, compliance layer, docs section, real estate section). The existing admin dashboard is where the founders interact with the firm; Orca extends this layer by providing the digital executive coordination across all operational sections.

Of the twenty-five existing Nest agents, those performing executive coordination functions (firm-wide reporting, cross-section coordination, founder briefing) map to Orca roles. Agents performing operational functions within specific sections map to the operational desks described in subsequent sections.

## **4.2 — The Bond Desk**

The Bond Desk is the firm's front office. It owns deals end to end from origination handoff through closing and into post-closing administration. Each deal has an assigned Bond Desk team that coordinates the full execution. The Bond Desk is where the firm's external face shows up — the desk's outputs are the documents, communications, and execution that sponsors, BD partners, rating agencies, bond counsel, and trustees all experience as 'Nest.'

### **Institutional Mirror — JPMorgan Middle-Market Investment Banking Bond Desk**

The Bond Desk mirrors the standard investment banking deal team structure used at JPMorgan, Morgan Stanley, Goldman Sachs, Wells Fargo, and the entire institutional bond market. Every deal at every middle-market and institutional investment bank is staffed with this four-level team. The roles are universally recognized across the industry. Counterparties (sponsors, BD partners, rating agencies, bond counsel, trustees) expect to interact with people occupying these roles. Mirroring this structure produces clean external interfaces.

The four-level team:

* Managing Director — relationship lead, deal economics owner, escalation point, board-level engagement
* Vice President — deal-runner, working group coordinator, execution timeline owner, sponsor-facing day-to-day contact
* Associate — execution layer, materials production, document drafting, due diligence coordination
* Analyst — modeling, credit work, comp set work, data work, financial diligence

### **Nest's Bond Desk Agent Structure**

***Managing Director Agent***

**Function —** Deal economics ownership for each assigned deal. Key sponsor relationship at the senior level. Engagement letter and fee negotiation. Escalation point for material exceptions during execution. Board-level engagement with sponsors when required. Relationship management with BD partners at the senior level.

**Inputs —** Sponsor relationship history from the BDO, deal economics from the Structuring Desk, pricing strategy from the Placement Desk, exception flags from the VP Agent during execution, board materials and engagement letters.

**Outputs —** Engagement letter terms, deal economics decisions, exception resolutions, board-facing communications, senior sponsor communications, BD partner senior coordination.

**Handoffs —** Receives deal from BDO at engagement signing. Hands execution to VP Agent. Returns to active management at pricing, closing, and any escalations.

***Vice President Agent (Banker)***

**Function —** Day-to-day deal management. Working group coordination across all internal desks and external counterparties. Execution timeline ownership. Sponsor-facing daily contact. Document version coordination. Meeting scheduling and agenda management.

**Inputs —** MD Agent strategic direction, sponsor requests and communications, internal desk outputs (credit memo from Credit Desk, structuring memorandum from Structuring Desk, document drafts from Documents Desk, rating strategy from Rating Desk), counterparty status updates.

**Outputs —** Working group call agendas and minutes, execution timelines, weekly deal status reports, sponsor communications, document coordination across desks, escalations to MD Agent.

**Handoffs —** Receives deal from MD Agent after engagement. Coordinates the Associate Agent and Analyst Agent on day-to-day execution. Escalates exceptions to MD Agent. Returns deal to MD Agent at pricing and closing.

***Associate Agent***

**Function —** Execution work — materials production, document drafting support, due diligence coordination, working group call preparation, response to sponsor information requests, coordination with external counsel.

**Inputs —** VP Agent direction on materials needed, sponsor diligence documents, internal desk outputs, prior-deal materials and templates, working group meeting notes.

**Outputs —** Investor presentation materials, sponsor information memorandum drafts, due diligence trackers, working group meeting materials, response packages to sponsor information requests.

**Handoffs —** Works directly with the Analyst Agent on materials production. Receives direction from VP Agent. Coordinates with the Documents Desk on document drafting.

***Analyst Agent***

**Function —** Underlying analytical work — sponsor financial diligence, project financial modeling, comparable transaction analysis, market and industry analysis, sensitivity and stress testing, structuring math, pricing analysis.

**Inputs —** Sponsor financial statements and projections, market data, comparable transaction databases, internal model templates, rating agency methodology guidance, structuring scenarios from the Structuring Desk.

**Outputs —** Financial models, comp set analyses, sensitivity tables, structuring math packages, pricing scenarios, market intelligence summaries, sponsor financial diligence reports.

**Handoffs —** Works directly with Associate Agent on materials. Feeds analytical outputs to Credit Desk for the credit memo, to Structuring Desk for structuring decisions, to Rating Desk for rating support, and to Placement Desk for pricing strategy.

### **Handoffs to Adjacent Desks**

The Bond Desk sits at the center of every deal and coordinates handoffs across the firm's operational layer. Major handoff points:

* From BDO — at engagement signing, the BDO hands the deal to the Bond Desk MD Agent. Sponsor intelligence, prior relationship history, and engagement terms transfer with the deal.
* To Credit Underwriting Desk — the Bond Desk VP Agent and Analyst Agent provide the deal package to Credit Underwriting; Credit Underwriting produces the credit memo and risk assessment that the Bond Desk uses for structuring and rating strategy.
* To Structuring Desk — the Bond Desk Analyst Agent feeds the financial model and deal parameters to the Structuring Desk, which produces the structuring memorandum that defines deal terms.
* To Rating Desk — the Bond Desk coordinates with the Rating Desk on rating agency engagement; the Rating Desk's Moody's and S&P methodology mirror agents produce the internal rating analysis that informs structuring.
* To Documents Desk — the Bond Desk VP and Associate Agents coordinate document drafting with the Documents Desk and external bond counsel.
* To Placement Desk — at pricing, the Bond Desk hands deal execution to the Placement Desk for the actual placement process; the Bond Desk MD Agent stays engaged at the senior level.
* To Operations Desk — at closing, the Bond Desk transitions ongoing administration to the Operations Desk for post-closing covenant monitoring, debt service administration, and continuing disclosure.
* To Surveillance Desk — for ongoing portfolio oversight after closing, the Surveillance Desk tracks deal performance and flags refunding and restructuring opportunities.

### **Platform Component Mapping**

The Bond Desk corresponds primarily to the existing Bond Desk section of the Nest platform. The shell of the Bond Desk is already wired to EDGAR and other public data sources. The Analyst Agent function leverages those data connections for sponsor financial diligence and comparable transaction analysis.

Of the existing twenty-five Nest agents, those performing deal-level analytical and coordination functions within the Bond Desk section map to the four Bond Desk agent roles. Specific mapping will be confirmed during platform-side audit; current understanding is that several existing agents perform Analyst Agent functions (modeling, financial diligence) and several perform Associate or VP Agent functions (materials production, coordination). MD Agent function may require deployment of a new senior-level agent specifically focused on senior coordination and exception handling.

### **Existing vs. Needed Inventory**

**Existing —** Bond Desk section shell, EDGAR connection, multiple analytical agents performing modeling and financial diligence functions, materials production capability.

**Needed (Phase 1) —** Formalization of the four-role agent structure (MD, VP, Associate, Analyst), explicit handoff workflows between roles, MD-level escalation logic, working group coordination tooling, agenda and timeline management.

**Future Capability Deepening —** Sector-specialized variants of each agent role as silos emerge from deal flow.

## **4.3 — The Credit Underwriting Desk**

The Credit Underwriting Desk applies the firm's universal credit policy to every deal. The desk produces the credit memo, the risk assessment, and the credit committee recommendation that determine whether each deal proceeds and on what terms. The desk operates under defined policy parameters that constrain its discretion; exceptions outside the policy parameters escalate to the human leadership for resolution.

### **Institutional Mirror — Bank Credit Organization**

The Credit Underwriting Desk mirrors the standard credit organization structure used at every major commercial and investment bank: JPMorgan, Wells Fargo, Bank of America, US Bank, PNC. Every bank with meaningful credit exposure has a defined credit organization separate from the front-office banking team. The credit organization owns the credit policy, applies the policy independently to each transaction, and provides independent credit recommendations to credit committees that approve or decline transactions.

The standard credit organization structure:

* Chief Credit Officer — owns the credit policy, sets credit posture, leads credit committee, exception authority
* Senior Credit Underwriter — applies credit policy to individual transactions, writes credit memos, prepares credit committee packages
* Credit Analyst — supports underwriter with deeper diligence, stress testing, comparable analysis, sector intelligence
* Credit Committee — formal approval body for material credit decisions

### **Nest's Credit Underwriting Desk Agent Structure**

***Chief Credit Officer Function***

The Chief Credit Officer function is shared between the In-House Counsel / Chief Compliance Officer Agent at the Orca level and the founders. The Chief Credit Officer function owns the universal credit policy (Appendix in this document), approves modifications to the policy, and provides exception authority on credit policy deviations. Exception escalations from the Senior Credit Underwriter Agent route to the Chief Credit Officer function for resolution.

***Senior Credit Underwriter Agent***

**Function —** Application of the universal credit policy to each individual transaction. Production of the credit memo for each deal. Production of the credit committee package. Risk score assignment. Identification of exceptions and routing to Chief Credit Officer function for resolution. Coordination with rating agencies on credit positioning.

**Inputs —** Deal package from Bond Desk (sponsor financial statements, project financial projections, feasibility study, market study, sponsor diligence package), credit policy parameters, sector-specific credit policy overlays where applicable, comparable transaction history, sponsor history database.

**Outputs —** Credit memo (15-30 page document summarizing the deal's credit profile, sponsor analysis, project analysis, financial analysis, sector analysis, risk identification, structural mitigants, and rating implications), credit committee package, risk score, exception identification.

**Handoffs —** Receives deal package from Bond Desk VP Agent. Coordinates with Credit Analyst Agent on deeper analysis. Delivers credit memo to Bond Desk and to Structuring Desk to inform deal structuring. Routes exceptions to Chief Credit Officer function.

***Credit Analyst Agent***

**Function —** Deep credit analysis supporting the Senior Credit Underwriter Agent. Comparable transaction analysis. Stress testing and sensitivity analysis. Sector intelligence and trend analysis. Sponsor financial deep-dive. Project financial validation.

**Inputs —** Direction from Senior Credit Underwriter Agent on analytical needs, deal package from Bond Desk, comparable transaction database, sector intelligence from Eagle Eye and the BDO sub-agents, public records from EMMA and EDGAR.

**Outputs —** Comparable transaction analyses, stress test results, sensitivity analyses, sector trend analyses, sponsor financial deep-dive packages, project financial validation reports.

**Handoffs —** Direct support to Senior Credit Underwriter Agent. Coordination with Bond Desk Analyst Agent on financial model details. Coordination with Surveillance Desk on portfolio comparable analysis.

***Credit Committee Process***

Every deal above defined materiality thresholds requires credit committee approval. The credit committee is composed of the founders and the In-House Counsel / Chief Compliance Officer Agent at the Orca level. The Senior Credit Underwriter Agent presents the credit committee package; the committee approves, declines, or approves with conditions. Approval triggers the deal's progression to formal documentation and rating engagement. Decline returns the deal to Bond Desk for restructuring or termination. Conditional approval requires the conditions to be satisfied before the deal closes.

### **Handoffs to Adjacent Desks**

* From Bond Desk — receives complete deal package at the start of formal underwriting
* To Bond Desk — delivers credit memo and risk assessment for use in structuring and rating strategy
* To Structuring Desk — credit policy parameters constrain structuring options; credit memo informs structuring decisions
* To Rating Desk — credit memo informs the rating agency presentation; rating committee responses feed back to the credit memo
* To Legal and Compliance Desk — credit policy compliance is verified by the Legal and Compliance Desk for regulatory consistency
* To Surveillance Desk — credit memo becomes the baseline for ongoing surveillance throughout the bond's life

### **Platform Component Mapping**

The Credit Underwriting Desk corresponds primarily to a credit underwriting capability that needs to be formalized within the existing platform. The existing compliance layer provides the policy enforcement framework; the Credit Underwriting Desk extends this with deal-level credit analysis and memo production. Of the existing twenty-five agents, several perform credit-adjacent functions (sponsor analysis, financial diligence) that map to the Credit Analyst Agent role; a Senior Credit Underwriter Agent specifically focused on credit memo production and credit committee package preparation likely needs to be deployed as a defined agent role.

### **Existing vs. Needed Inventory**

**Existing —** Compliance layer providing policy enforcement framework, multiple credit-adjacent analytical agents, sponsor analysis capability.

**Needed (Phase 1) —** Formal Senior Credit Underwriter Agent with credit memo production capability, formal Credit Analyst Agent specialization, credit committee package workflow, exception routing to Chief Credit Officer function, universal credit policy operational integration.

**Future Capability Deepening —** Sector-specialized credit policy overlays as silos emerge, automated comparable transaction analysis at scale.

## **4.4 — The Structuring Desk**

The Structuring Desk designs the bond structure for each deal — maturity profile, amortization pattern, security pledge, covenant package, reserves, optionality, tranching, credit enhancement strategy, pricing positioning. The desk produces the structuring memorandum that documents the recommended structure with its rationale. The structuring memorandum is the basis for documentation, rating engagement, and placement strategy.

### **Institutional Mirror — Investment Bank Structured Products Desk**

The Structuring Desk mirrors the structured products and bond structuring functions at major investment banks. At JPMorgan, Morgan Stanley, and similar firms, dedicated structurers work alongside the deal team to design optimal bond structures for each transaction. Structurers know the rating agency methodologies in depth, know what structural levers move ratings, know the buyer pool preferences across different structures, and know the precedent comparable transactions that inform structuring decisions.

The standard structured products desk structure:

* Senior Structurer — owns structure design, runs scenario analysis, produces structuring memorandum, coordinates with rating advisors and placement
* Structuring Analyst — supports the senior structurer with modeling, scenario calculation, comparable analysis

### **Nest's Structuring Desk Agent Structure**

***Senior Structurer Agent***

**Function —** Bond structure design for each deal. Recommendation of maturity profile, amortization pattern, security pledge, covenant package, reserves, optionality, tranching, credit enhancement strategy, pricing positioning. Production of structuring memorandum. Coordination with rating analysis to optimize for rating outcome. Coordination with placement strategy to optimize for buyer pool.

**Inputs —** Deal package from Bond Desk, credit memo from Credit Underwriting Desk, rating methodology analysis from Rating Desk (Moody's and S&P mirror agents), buyer pool intelligence from Placement Desk and Night Vision, sector-specific structuring patterns, comparable transaction database, tax-exempt and securities law constraints from Legal and Compliance Desk.

**Outputs —** Structuring memorandum (10-20 page document recommending the full bond structure with detailed rationale for each major structural decision), scenario analysis showing alternative structures, rating implication analysis, pricing implication analysis.

**Handoffs —** Receives deal package from Bond Desk and credit memo from Credit Underwriting Desk. Coordinates with Rating Desk on rating implications. Coordinates with Placement Desk on buyer pool implications. Delivers structuring memorandum to Bond Desk and Documents Desk.

***Structuring Analyst Agent***

**Function —** Modeling and analytical support for the Senior Structurer Agent. Scenario calculation across alternative structures. Comparable transaction analysis. Cash flow modeling at the structural level. Sensitivity analysis on structural variables.

**Inputs —** Direction from Senior Structurer Agent on scenarios to model, deal data from Bond Desk Analyst Agent, comparable transaction database, structuring templates, rating agency methodology data.

**Outputs —** Scenario analysis tables, cash flow models at the structural level, sensitivity tables, comparable structure analyses, structural option comparisons.

**Handoffs —** Direct support to Senior Structurer Agent. Coordinates with Bond Desk Analyst Agent on financial model integration.

### **Handoffs to Adjacent Desks**

* From Bond Desk — receives complete deal package, financial model, and sponsor input on structural preferences
* From Credit Underwriting Desk — receives credit memo and credit policy parameters that constrain structuring options
* From Rating Desk — receives rating methodology analysis showing how structural decisions affect rating outcome; iterates with Rating Desk during structuring
* From Placement Desk — receives buyer pool intelligence showing how structural decisions affect placement; iterates with Placement Desk during structuring
* To Bond Desk — delivers structuring memorandum that becomes the deal's term sheet
* To Documents Desk — delivers structuring memorandum that becomes the basis for indenture and other document drafting
* To Insurance/Surety/Credit Enhancement Desk — when credit enhancement is part of the structure, coordinates with the Enhancement Desk on enhancement provider selection and terms

### **Platform Component Mapping**

The Structuring Desk corresponds to a structuring capability that builds on the existing Bond Desk section's analytical infrastructure. The existing tools platform provides the analytical environment; the Structuring Desk extends this with structural design logic and structuring memorandum production. Of the existing twenty-five agents, several perform structural-adjacent functions (scenario analysis, modeling) that support the Structuring Analyst Agent role; a Senior Structurer Agent with explicit structuring memorandum production capability likely needs to be deployed.

### **Existing vs. Needed Inventory**

**Existing —** Tools platform analytical environment, multiple modeling agents, scenario analysis capability, comparable transaction analysis capability.

**Needed (Phase 1) —** Formal Senior Structurer Agent with structuring memorandum production, defined structural decision logic per sector, defined rating methodology integration, integration with Placement Desk buyer pool intelligence.

**Future Capability Deepening —** Sector-specialized structural patterns library as silos emerge, automated rating optimization across alternative structures.

## **4.5 — The Rating Desk**

The Rating Desk owns the rating agency engagement for each deal. The desk's signature capability is the internal Moody's Methodology Mirror Agent and S&P Methodology Mirror Agent — internal agents that run each deal through Moody's and S&P methodologies before the deal is ever presented to the actual rating agencies. The internal mirror agents identify the likely rating outcome, the structural levers that could move the rating, the methodology-specific weak points that need to be addressed in the presentation, and the optimal positioning of the credit story. This pre-engagement analysis is the firm's structural advantage over conventional financial advisors who present deals without methodology-precise preparation.

### **Institutional Mirror — Investment Bank Rating Advisory + Rating Agency Analyst Function**

The Rating Desk mirrors two related institutional functions. First, the rating advisory function at investment banks — the dedicated rating advisors who help clients optimize their rating presentations. Second, the rating agency analyst function itself — the credit analysts at Moody's and S&P who actually assign ratings. Nest's internal Methodology Mirror Agents replicate the second function, allowing Nest to anticipate the rating outcome before formal engagement.

The standard rating advisory team:

* Rating Strategy Lead — owns rating agency engagement strategy, agency selection, presentation strategy
* Methodology Analysts — deep knowledge of each major rating agency methodology, apply methodologies to deals to predict outcomes
* Rating Presentation Lead — produces the rating presentation deck and supporting materials
* Rating Committee Liaison — coordinates with the rating agency throughout the rating process

### **Nest's Rating Desk Agent Structure**

***Rating Strategy Agent***

**Function —** Rating agency selection strategy for each deal. Decision on number of ratings (single rating, dual ratings, split ratings). Engagement timing. Presentation strategy and credit story development. Rating outcome target setting. Exception handling when ratings come in below target.

**Inputs —** Structuring memorandum from Structuring Desk, credit memo from Credit Underwriting Desk, internal rating predictions from Moody's and S&P Mirror Agents, sector dynamics and recent rating trends, BD partner input on buyer pool rating preferences, historical rating outcomes by agency by sector.

**Outputs —** Rating agency selection recommendation, engagement strategy, presentation strategy, credit story narrative, target rating expectations, exception escalation when ratings deviate from target.

**Handoffs —** Receives structuring memorandum and credit memo. Coordinates with the Methodology Mirror Agents on rating predictions. Directs the Rating Presentation Agent on presentation content. Coordinates with the Rating Committee Liaison Agent on engagement execution.

***Moody's Methodology Mirror Agent***

**Function —** Internal application of Moody's published methodologies to each deal. Replication of Moody's analyst process: scorecard application, factor scoring, qualitative overlays, rating committee positioning. Production of the internal Moody's-equivalent rating prediction and the supporting analysis.

**Inputs —** Deal package from Bond Desk and Structuring Desk, Moody's published methodologies for the relevant sector, Moody's historical rating actions and committee decisions, sector-specific scorecards, peer comparison data.

**Outputs —** Internal Moody's-equivalent rating prediction (Aaa through C scale), factor-by-factor scoring analysis, qualitative positioning analysis, identification of weak factors that could move the rating down, identification of structural changes that could move the rating up, recommendations for credit story emphasis in the actual Moody's presentation.

**Handoffs —** Provides rating predictions to Rating Strategy Agent. Provides methodology guidance to Structuring Desk during structuring. Provides positioning recommendations to Rating Presentation Agent.

***S&P Methodology Mirror Agent***

**Function —** Internal application of S&P Global Ratings published methodologies to each deal. Same function as Moody's Mirror Agent applied to S&P methodology. Production of the internal S&P-equivalent rating prediction.

**Inputs —** Deal package from Bond Desk and Structuring Desk, S&P published methodologies for the relevant sector, S&P historical rating actions and committee decisions, sector-specific criteria, peer comparison data.

**Outputs —** Internal S&P-equivalent rating prediction (AAA through D scale), factor-by-factor scoring analysis, qualitative positioning analysis, weak factor identification, structural change recommendations, credit story emphasis recommendations for the actual S&P presentation.

**Handoffs —** Same handoff pattern as Moody's Mirror Agent — to Rating Strategy Agent, Structuring Desk, and Rating Presentation Agent.

***Rating Presentation Agent***

**Function —** Production of the rating presentation deck and supporting materials for each rating agency. Deck typically 30-60 slides covering sponsor, project, market, financial, structural, and risk dimensions. Customized to each agency's methodology and presentation preferences.

**Inputs —** Direction from Rating Strategy Agent on credit story and emphasis, Mirror Agent recommendations on positioning, deal data from Bond Desk and Structuring Desk, credit memo from Credit Underwriting Desk, market and sector data.

**Outputs —** Rating presentation deck (60-80 page format typical), supporting financial schedules, supporting market analyses, draft Q&A preparation materials, executive summary slides.

**Handoffs —** Direct support to Rating Strategy Agent. Coordinates with Bond Desk Associate Agent on materials integration.

***Rating Committee Liaison Agent***

**Function —** Coordination with rating agencies throughout the engagement. Scheduling of agency calls and presentations. Tracking of agency information requests and response coordination. Management of agency feedback on the presentation. Post-rating coordination on rating publication and any conditions.

**Inputs —** Engagement timing from Rating Strategy Agent, agency communications, agency information requests, agency feedback during the rating process, rating committee outcomes.

**Outputs —** Agency engagement scheduling, response packages to agency information requests, real-time agency feedback summaries, rating committee outcome reports, agency communication logs.

**Handoffs —** Coordinates externally with rating agencies. Reports to Rating Strategy Agent on engagement status. Escalates to Bond Desk MD Agent on material issues during the rating process.

### **Handoffs to Adjacent Desks**

* From Bond Desk — receives deal package and works closely with the Bond Desk throughout rating engagement
* From Structuring Desk — receives structuring memorandum and iterates with Structuring Desk on rating-optimized structural decisions
* From Credit Underwriting Desk — receives credit memo that informs the credit story
* To Structuring Desk — feeds rating implications of structural alternatives back into structuring
* To Placement Desk — final rating outcome informs the Placement Desk's pricing strategy
* To Surveillance Desk — initial ratings establish the baseline for ongoing rating surveillance throughout the bond's life

### **Platform Component Mapping**

The Rating Desk corresponds to a rating advisory capability that needs to be formalized within the existing platform. The Moody's and S&P Methodology Mirror Agents represent significant new agent capability — they require detailed methodology databases, scorecard logic, and rating committee pattern recognition. These agents likely need to be deployed as defined new agent roles built on top of the existing analytical infrastructure.

### **Existing vs. Needed Inventory**

**Existing —** Analytical infrastructure within the tools platform, sector intelligence within Eagle Eye and the BDO sub-agents, financial analysis capability.

**Needed (Phase 1) —** Moody's Methodology Mirror Agent with full sector methodology databases, S&P Methodology Mirror Agent with same, Rating Strategy Agent for engagement strategy, Rating Presentation Agent for deck production, Rating Committee Liaison Agent for external coordination.

**Future Capability Deepening —** Fitch Methodology Mirror Agent if deal flow justifies, KBRA Methodology Mirror Agent for specialty sectors (charter schools, senior living, certain healthcare), DBRS Morningstar Mirror Agent as needed.

## **4.6 — The Documents Desk**

The Documents Desk owns the document production layer for each deal. The desk drafts initial documents, manages version control across the deal, coordinates with external bond counsel and disclosure counsel on review and revisions, and ensures the document set is consistent and complete at closing. The desk operates against template libraries derived from extensive precedent analysis.

### **Institutional Mirror — Bond Counsel Firm Organization**

The Documents Desk mirrors the standard organizational structure used at major bond counsel firms — Orrick Herrington & Sutcliffe, Hawkins Delafield & Wood, Squire Patton Boggs, Norton Rose Fulbright, Kutak Rock, Chapman and Cutler, and similar firms. These firms organize document production with partner-level oversight, senior associate-level lead drafting, associate-level supporting drafting, and paralegal-level version control and coordination.

The standard bond counsel firm structure:

* Partner — owns document strategy, key drafting decisions, opinion issuance
* Senior Associate — lead drafter on the indenture and major documents
* Associate — supporting drafter on secondary documents and revisions
* Paralegal — version control, document coordination, closing checklist management

### **Nest's Documents Desk Agent Structure**

***Documents Lead Agent***

**Function —** Document strategy ownership for each deal. Key drafting decisions on indenture provisions, covenant package, structural documentation, security documents. Coordination with external bond counsel on opinion-critical provisions. Document set completeness verification.

**Inputs —** Structuring memorandum from Structuring Desk, credit memo from Credit Underwriting Desk, sector-specific template library, prior-deal precedent database, external bond counsel input on opinion requirements, tax-exempt compliance requirements from Legal and Compliance Desk.

**Outputs —** Document strategy memo, key drafting decisions documented, coordination with external bond counsel, document set completeness verification, closing checklist.

**Handoffs —** Receives structuring memorandum from Structuring Desk. Coordinates with Documents Drafting Agent on drafting execution. Coordinates with external bond counsel. Hands closing document set to Bond Desk and Operations Desk.

***Documents Drafting Agent***

**Function —** Production of first drafts for all transaction documents. Indenture drafting from template adapted to deal-specific terms. Loan agreement drafting for conduit deals. Security documents (mortgage, security agreement). Regulatory agreements. Continuing disclosure agreement. Bond purchase agreement coordination.

**Inputs —** Documents Lead Agent direction, structuring memorandum, sector template library, prior precedent documents, tax-exempt compliance requirements, regulatory requirements.

**Outputs —** First drafts of all transaction documents (indenture, loan agreement, mortgage, security agreement, regulatory agreement, continuing disclosure agreement, bond purchase agreement, etc.). Typical deal produces 15-30 distinct documents in first draft.

**Handoffs —** Direct support to Documents Lead Agent. Coordinates with Documents Version Control Agent on document management. Routes drafts to Documents Lead Agent for review and to external bond counsel for finalization.

***Documents Version Control Agent***

**Function —** Document version management across the deal. Tracking of revisions, comments, and consolidation. Closing checklist management. Document signature tracking. Final closing book production.

**Inputs —** All document drafts and revisions across the deal, comments from working group members (sponsor, sponsor counsel, BD, BD counsel, trustee, trustee counsel, rating agencies, etc.), signature page status.

**Outputs —** Version-controlled document set, closing checklist with status, revision logs, final closing book.

**Handoffs —** Coordinates with all working group members on document workflow. Reports to Documents Lead Agent and Bond Desk VP Agent on document status.

### **Handoffs to Adjacent Desks**

* From Structuring Desk — receives structuring memorandum that becomes the basis for document drafting
* From Credit Underwriting Desk — receives credit memo input on covenant package and structural requirements
* From Legal and Compliance Desk — receives regulatory compliance requirements that must be reflected in documents
* To Bond Desk — provides document drafts for working group review and coordination
* To external counsel — works with bond counsel and disclosure counsel on document review and finalization
* To Operations Desk — hands final closing document set for post-closing administration reference

### **Platform Component Mapping**

The Documents Desk corresponds to the existing Docs section of the Nest platform. The Docs section has been built out with document templates and drafting capability. The Documents Desk formalizes the agent role structure within this section and adds the version control and coordination workflows. Of the existing twenty-five agents, several agents perform document drafting and coordination functions that map directly to the Documents Drafting Agent and Documents Version Control Agent roles. A Documents Lead Agent with strategic document responsibility likely needs to be deployed as a defined senior role.

### **Existing vs. Needed Inventory**

**Existing —** Docs section with template library and drafting capability, document drafting agents, document coordination capability.

**Needed (Phase 1) —** Documents Lead Agent with strategic responsibility, formalized handoffs with external bond counsel, closing checklist workflow, final closing book production capability.

**Future Capability Deepening —** Sector-specialized template libraries as silos emerge, automated coordination with external counsel, real-time document AI markup.

## **4.7 — The Legal and Compliance Desk**

The Legal and Compliance Desk owns the firm's day-to-day legal and compliance work. The desk is distinct from the In-House Counsel / Chief Compliance Officer Agent at the Orca level, which provides executive function. The Legal and Compliance Desk does the operational legal and compliance work across every deal and across the firm's portfolio.

### **Institutional Mirror — Investment Bank Legal and Compliance Organization**

The Legal and Compliance Desk mirrors the standard legal and compliance organization at major investment banks. Banks have General Counsel as the executive function and a Legal Department with multiple sub-specialties: transaction counsel, regulatory compliance, securities law compliance, tax compliance, continuing disclosure compliance, KYC and AML, conflicts and ethics, litigation, and records retention. Each sub-specialty has dedicated personnel applying defined frameworks across the firm's transactions and operations.

### **Nest's Legal and Compliance Desk Agent Structure**

***Legal Desk Lead Agent***

**Function —** Operational legal and compliance work coordination across the desk. Routing of legal and compliance matters to appropriate specialist agents. Escalation of executive-level matters to the In-House Counsel / Chief Compliance Officer Agent. Cross-deal legal and compliance pattern identification.

**Inputs —** Deal flow status from Bond Desk, compliance flags from all operational desks, regulatory developments, legal matters arising in individual deals, KYC/AML alerts.

**Outputs —** Legal and compliance work routing, exception escalations to Orca, cross-deal pattern reporting, regulatory development summaries.

***Transaction Counsel Agent***

**Function —** Deal-by-deal legal review. Coordination with external bond counsel and disclosure counsel. Opinion deliverable management. Document review from a legal compliance perspective. Closing legal certifications.

**Inputs —** Document drafts from Documents Desk, deal package from Bond Desk, external counsel correspondence, opinion deliverable requirements.

**Outputs —** Legal review memos for each deal, opinion deliverable tracker, closing legal certifications, external counsel coordination.

***Regulatory Compliance Agent***

**Function —** SEC, MSRB, FINRA compliance across all firm activities. Municipal advisor regulatory compliance specifically. Pay-to-play (Rule G-37) compliance tracking. Books and records requirements. Quarterly and annual regulatory filings.

**Inputs —** Firm-wide activity data, regulatory developments, MSRB rule changes, SEC enforcement actions, FINRA examination notices.

**Outputs —** Regulatory compliance reports, regulatory filings, pay-to-play tracking, books and records maintenance, regulatory exception alerts.

***Securities Law Compliance Agent***

**Function —** Securities law compliance per deal — 144A, Rule 144, Reg D (506(b) and 506(c)), Reg S, public offering registration requirements. Buyer qualification verification. Selling restriction enforcement. Resale tracking.

**Inputs —** Deal package from Bond Desk, placement structure from Placement Desk, buyer information from Placement Desk, securities law requirements per offering type.

**Outputs —** Securities law compliance memo per deal, buyer qualification documentation, selling restriction enforcement tracking, resale compliance monitoring.

***Tax Compliance Agent***

**Function —** Tax-exempt bond compliance across the firm's tax-exempt portfolio. Private use limit monitoring. Arbitrage rebate calculation and filing. Yield restriction monitoring. IRS Form 8038 series filing. Post-issuance compliance tracking.

**Inputs —** Tax-exempt bond portfolio data, project use data from obligors, investment earnings data on bond proceeds, IRS regulatory requirements.

**Outputs —** Tax compliance reports per deal, arbitrage rebate calculations and filings, private use monitoring, IRS filings, tax exception escalations.

***Continuing Disclosure Compliance Agent***

**Function —** Rule 15c2-12 continuing disclosure compliance across the administered portfolio. Annual financial report tracking. Material event monitoring and filing. Dissemination agent coordination. EMMA filing management.

**Inputs —** Continuing disclosure agreements per deal, obligor financial reports, material event triggers, EMMA filing requirements.

**Outputs —** Annual financial report filings, material event notice filings, dissemination agent coordination, continuing disclosure compliance reports.

***KYC and AML Agent***

**Function —** Know-your-customer and anti-money-laundering screening on every sponsor and counterparty. OFAC sanctions screening. Politically exposed persons screening. Source of funds verification.

**Inputs —** Sponsor and counterparty identifying information, OFAC sanctions lists, PEP databases, source of funds documentation, regulatory KYC/AML requirements.

**Outputs —** KYC/AML clearance per sponsor and counterparty, OFAC screening results, PEP screening results, source of funds verification, KYC/AML exception alerts.

***Conflicts and Ethics Agent***

**Function —** Conflicts checking across the firm's activities. Ethical wall management when sectors create potential conflicts. Conflicts disclosure to clients. Gifts and entertainment tracking. Personal trading compliance for any human team members.

**Inputs —** All sponsor relationships, all counterparty relationships, all firm activities, gifts and entertainment data, personal trading data for any humans.

**Outputs —** Conflicts clearance per deal, ethical wall management, conflicts disclosures, gifts and entertainment compliance, personal trading compliance.

***Litigation and Dispute Agent***

**Function —** Litigation and dispute management. Coordination with outside litigation counsel. Workout legal positioning. Default and remedy coordination. Bondholder communication during disputes. Coordination with Workout Support Agent on the Surveillance Desk.

**Inputs —** Litigation and dispute matters, outside counsel reports, workout and default information from Surveillance Desk, bondholder communications.

**Outputs —** Litigation tracking, outside counsel coordination, workout legal positioning, default and remedy execution, dispute resolution coordination.

***Document Retention Agent***

**Function —** Records retention compliance per SEC, MSRB, IRS, and other regulatory requirements. Document classification by retention period. Audit trail integrity. Secure document destruction at end of retention period.

**Inputs —** All firm documents and records, regulatory retention requirements, audit trail data, document classification rules.

**Outputs —** Records retention compliance reports, document classification, audit trail maintenance, document destruction execution.

### **Handoffs to Adjacent Desks**

* From all desks — receives compliance flags and legal matters from across the operational layer
* From Orca — receives executive-level legal and compliance direction from In-House Counsel / Chief Compliance Officer Agent
* From external counsel — coordinates with bond counsel, disclosure counsel, litigation counsel, and tax counsel
* To Orca — escalates executive-level legal and compliance matters
* To all desks — provides legal and compliance requirements and clearances back to operational desks

### **Platform Component Mapping**

The Legal and Compliance Desk corresponds to the existing compliance layer of the Nest platform, formalized into the ten-agent sub-structure described above. The existing compliance layer provides the policy enforcement framework; this desk extends it with the operational legal and compliance work across all dimensions. Of the existing twenty-five agents, the compliance layer agents map to several of the agent roles above; additional specialized agents likely need to be deployed for tax compliance, KYC/AML, and continuing disclosure compliance as distinct roles.

### **Existing vs. Needed Inventory**

**Existing —** Compliance layer with policy enforcement framework, multiple compliance-adjacent agents.

**Needed (Phase 1) —** Formalization of the ten-agent sub-structure with explicit role definitions, KYC/AML capability with OFAC and PEP screening, tax compliance capability for tax-exempt portfolio, continuing disclosure capability with EMMA filing, conflicts checking workflow.

**Future Capability Deepening —** Litigation support automation, automated regulatory filing across all federal and state requirements, real-time pay-to-play monitoring.

## **4.8 — The Trustee Liaison Desk**

The Trustee Liaison Desk owns Nest's relationship with trustee banks across the firm's portfolio. The desk handles trustee selection and engagement for new deals, coordinates with trustees throughout deal execution on operational matters, and manages ongoing trustee relationships across the administered portfolio.

### **Institutional Mirror — Bank Trustee Interface Function**

The Trustee Liaison Desk mirrors the trustee interface function that exists at every investment bank and at every borrower-side organization with significant bond debt. The function spans engagement (selecting and onboarding trustees), execution (working with trustees during deal closing on operational matters like DTC eligibility and account setup), and ongoing administration (working with trustees throughout the bond's life on reporting, compliance, and exception management). Trustees themselves are organized around these same workflow stages, so the interface is desk-to-desk and role-to-role.

### **Nest's Trustee Liaison Desk Agent Structure**

***Trustee Liaison Lead Agent***

**Function —** Owns the firm's relationships with trustee banks. Trustee selection strategy per deal. Trustee fee negotiation. Trustee performance evaluation. Cross-deal trustee relationship management.

**Inputs —** Deal-by-deal trustee needs from Bond Desk, trustee performance data across the portfolio, trustee fee market data, trustee capability data by sector and structure.

**Outputs —** Trustee selection recommendations per deal, trustee engagement letters and fee schedules, trustee performance reports, trustee relationship strategy.

***Trustee Onboarding Agent***

**Function —** Deal-by-deal trustee engagement execution. Trustee acceptance coordination. Account setup at the trustee bank for all required accounts (revenue fund, debt service reserve fund, project fund, etc.). DTC eligibility setup. Paying agent agreement execution.

**Inputs —** Trustee selection from Trustee Liaison Lead Agent, deal structuring memorandum, indenture draft from Documents Desk, account requirements from Structuring Desk.

**Outputs —** Trustee acceptance documentation, account setup at trustee bank, DTC eligibility documentation, paying agent agreement, trustee fee letter.

***Trust Administration Agent***

**Function —** Coordination with trustee throughout deal execution and closing on operational matters. Construction reserve account setup. Capitalized interest fund management. Cost of issuance fund management. Final closing logistics with trustee.

**Inputs —** Closing logistics from Bond Desk and Documents Desk, fund flow requirements from Structuring Desk, trustee operational requirements.

**Outputs —** Closing fund flow coordination, account setup confirmation, trustee operational documentation.

***Trustee Reporting Coordination Agent***

**Function —** Ongoing coordination throughout the bond's life. Trustee delivery of borrower reports (annual financial statements, quarterly covenant certificates, material event notices). Trustee distribution of debt service payments. Trustee draw processing during construction phase.

**Inputs —** Borrower report submissions from Operations Desk, trustee notification requirements, ongoing reporting timelines.

**Outputs —** Trustee report delivery confirmations, debt service distribution tracking, draw processing coordination during construction.

***Trustee Default and Remedy Agent***

**Function —** Coordination with trustee on enforcement actions in default scenarios. Notice deliveries to bondholders. Bondholder vote management. Restructuring solicitations. Workout coordination.

**Inputs —** Default information from Surveillance Desk and Workout Support, restructuring proposals, bondholder communications, trustee default procedures.

**Outputs —** Trustee default coordination, bondholder notices, bondholder vote management, restructuring solicitation execution, workout coordination.

### **Handoffs to Adjacent Desks**

* From Bond Desk — receives trustee needs and engagement direction per deal
* From Structuring Desk — receives fund structure and account requirements
* From Documents Desk — coordinates on indenture provisions affecting trustee role
* From Operations Desk — coordinates ongoing administration through the trustee
* From Surveillance Desk — coordinates default and remedy actions through the trustee
* To trustee banks — external counterparty interface across all dimensions

### **Platform Component Mapping**

The Trustee Liaison Desk represents a capability that needs to be formalized as a distinct desk within the platform. Trustee coordination has historically been handled informally as part of Operations or Bond Desk activity; the formalization into a defined desk with five specialized agents produces cleaner workflow and clearer external trustee relationships. New agent deployment likely required for most of the desk's roles.

### **Existing vs. Needed Inventory**

**Existing —** Informal trustee coordination capability within existing operational sections.

**Needed (Phase 1) —** All five Trustee Liaison Desk agent roles formalized, trustee relationship database, trustee fee benchmarking capability, trustee performance tracking, integration with Operations Desk for ongoing administration.

**Future Capability Deepening —** Automated trustee fee comparison across deal types, trustee performance benchmarking by sector, integration with trustee bank APIs where available.

## **4.9 — The Construction Risk Management Desk**

The Construction Risk Management Desk owns the construction-period oversight for every bond deal funding new construction or substantial rehabilitation. The desk is its own discipline within bond finance — construction risk encompasses cost overruns, schedule overruns, change orders, code compliance, lien risk, builder default, insurance coverage, sponsor equity verification, and substantial completion. Each of these is a specialist function that the desk handles through dedicated agents.

The desk also operates the commercial card construction draw platform that handles construction proceeds disbursement. The card platform provides operational advantages — real-time transaction visibility, automatic budget reconciliation, automated change order tracking, lien protection — and produces interchange rebate revenue as a secondary income stream. Specific technical implementation details of the platform are confidential pending patent counsel review and are not specified in this document.

### **Institutional Mirror — Bank Construction Risk Management Department**

The Construction Risk Management Desk mirrors the construction risk management department at every major construction lender — JPMorgan, Wells Fargo, Bank of America, US Bank, PNC, and the major regional banks with construction expertise. The department exists because construction deals fail in specific ways that require specific expertise. Each major construction lender has dedicated personnel handling draw processing, budget tracking, schedule monitoring, change order management, inspection coordination, building code compliance, lien monitoring, builder performance tracking, insurance monitoring, and substantial completion management.

### **Nest's Construction Risk Management Desk Agent Structure**

***Construction Risk Lead Agent***

**Function —** Construction-period oversight across all deals in construction phase. Setting of construction monitoring standards. Exception management and escalation. Coordination with sponsors, general contractors, construction monitors, and trustees on construction matters.

**Inputs —** All construction-phase deal status data, construction monitor reports, sponsor and contractor communications, exception flags from sub-agents.

**Outputs —** Construction risk reports per deal and across portfolio, exception escalations to Bond Desk MD Agent and Orca, monitoring standards updates, coordination with external construction monitors.

***Draw Processing Agent***

**Function —** Review of each construction draw request against the construction budget, schedule, change orders, lien waivers, and inspection certifications. Validation that draw proceeds go to authorized purposes. Coordination with trustee on draw fund release.

**Inputs —** Draw requests from sponsor and contractor, construction budget baseline, change order log, lien waiver submissions, inspection certifications, construction monitor approval.

**Outputs —** Draw approval decisions, draw rejection or hold decisions with specific reasoning, trustee instructions for draw fund release, draw history tracking per deal.

***Budget vs Actual Tracking Agent***

**Function —** Maintenance of construction budget baseline per deal. Tracking of actual spending against budget by line item. Variance identification and trend analysis. Overrun risk flagging before defaults emerge.

**Inputs —** Approved construction budget at closing, all draw requests and approvals, change order log, contractor payment data.

**Outputs —** Budget vs actual reports per deal, variance trend analysis, overrun risk alerts, contingency budget utilization tracking.

***Schedule Monitoring Agent***

**Function —** Maintenance of construction schedule baseline per deal. Progress tracking against milestones. Delay identification and impact analysis. Capitalized interest impact computation when schedule slips.

**Inputs —** Approved construction schedule at closing, contractor progress reports, inspection reports, weather and external delay factors.

**Outputs —** Schedule status reports per deal, delay impact analysis, capitalized interest reserve depletion tracking, schedule-driven exception alerts.

***Change Order Management Agent***

**Function —** Review of each change order for cost, schedule, scope, and design impact. Verification of sponsor approval where required. Cumulative change order tracking against contingency budget. Identification of change order patterns suggesting scope creep or contractor performance issues.

**Inputs —** Change order submissions from sponsor and contractor, sponsor approval requirements per the construction contract, change order historical data.

**Outputs —** Change order approval decisions, cumulative change order tracking, scope creep alerts, sponsor approval documentation.

***Inspection Coordination Agent***

**Function —** Coordination of independent inspections at defined construction milestones. Independent Engineer or Construction Monitor engagement and coordination. Inspection report review and integration with other construction risk data.

**Inputs —** Inspection schedule from the construction monitor agreement, contractor milestone notifications, inspection reports.

**Outputs —** Inspection scheduling, inspection report integration, inspection-based draw approval input, inspection exception flagging.

***Building Code and Permit Compliance Agent***

**Function —** Tracking of permit status across the construction project. Code inspection results. Certificate of occupancy progression. Building code change implications during construction.

**Inputs —** Permit records from local jurisdiction, code inspection results, certificate of occupancy filings, building code databases.

**Outputs —** Permit and code compliance status per deal, certificate of occupancy progression tracking, code change impact analysis.

***Lien and Title Monitoring Agent***

**Function —** Monitoring for mechanic's liens, material supplier liens, and subcontractor disputes against the financed property. Coordination with title company on continued title insurance coverage during construction. Lien waiver tracking integrated with draw processing.

**Inputs —** Public lien filing records, title insurance updates from title company, lien waiver submissions, subcontractor and supplier dispute alerts.

**Outputs —** Lien status per deal, lien waiver tracking integrated with draw approval, title coverage maintenance verification, lien exception alerts.

***Builder Quality and Performance Agent***

**Function —** Tracking of general contractor performance against construction contract. Workmanship quality assessment via inspection data. Completion percentage validation. Subcontractor management observation. Builder default risk flagging.

**Inputs —** Contractor progress reports, inspection results, quality assessments, completion percentage claims, subcontractor performance data.

**Outputs —** Builder performance reports per deal, builder default risk alerts, contractor compliance verification, quality assessment integration with draw processing.

***Insurance Coverage Monitoring Agent***

**Function —** Verification that builder's risk insurance is in force at all times during construction. Confirmation that named insured and loss payee designations are correct. Coverage amount adequacy tracking as project value increases. General liability and workers compensation policy verification.

**Inputs —** Insurance policies and endorsements, insurance broker confirmations, certificate of insurance updates, policy renewal status.

**Outputs —** Insurance coverage status per deal, coverage gap alerts, renewal requirement notifications, insurance exception escalations.

***Sponsor Equity Verification Agent***

**Function —** Confirmation that sponsor equity contributions are made per the funding schedule. Validation that equity is actually spent on the project before bond proceeds are released (where the structure requires equity-in-first). Documentation of equity contributions.

**Inputs —** Sponsor equity contribution schedule from closing documents, bank statements or other evidence of sponsor equity contributions, project spending records.

**Outputs —** Sponsor equity verification per deal, equity-in-first validation per draw, sponsor equity exception alerts.

***Substantial Completion and Stabilization Agent***

**Function —** Management of the transition from construction phase to operating phase. Certificate of occupancy coordination. Transition from construction insurance to permanent insurance. Transition from construction reserves to operating reserves. Conversion to amortizing debt service from interest-only.

**Inputs —** Construction completion data, certificate of occupancy filings, insurance transition plans, reserve fund balances, debt service conversion schedule.

**Outputs —** Substantial completion certifications, insurance transition coordination, reserve transition coordination, debt service conversion execution, handoff to Operations Desk for ongoing operations.

### **The Commercial Card Construction Draw Platform**

The Construction Risk Management Desk operates the commercial card platform for construction draws. The platform's strategic and economic framing is described in the Executive Summary. Within this desk, the platform serves as the operational tool for construction proceeds disbursement, providing the draw processing, budget reconciliation, change order tracking, lien protection, and insurance verification benefits described in the agent role specifications above. The platform's economics produce interchange rebate revenue at the firm level, tracked by the CFO Agent in Orca.

**Implementation Confidentiality:** Specific technical implementation of the construction card platform — including transaction matching algorithms, integration with trustee disbursement authorization, lien waiver tracking automation, card issuance architecture, and BaaS partner integration — is treated as confidential and is not specified in this document. Implementation specification awaits patent counsel review.

### **Handoffs to Adjacent Desks**

* From Bond Desk — receives deal at construction phase commencement
* From Structuring Desk — receives construction budget, capitalized interest reserve sizing, draw schedule
* From Documents Desk — receives construction disbursement agreement terms
* To Operations Desk — hands off deal at substantial completion for ongoing operating-phase administration
* To Surveillance Desk — feeds construction-phase performance data for ongoing portfolio monitoring
* To Trustee Liaison Desk — coordinates with trustee on draw fund releases
* To Legal and Compliance Desk — coordinates on lien matters, contract disputes, and builder default scenarios

### **Platform Component Mapping**

The Construction Risk Management Desk represents a significant capability that needs to be formalized within the platform. Construction-related capabilities exist in the existing real estate section but require expansion to cover the full twelve-agent construction risk management function. The commercial card platform represents new infrastructure that needs to be built (which is technically deferred pending patent counsel review). Phase 1 builds the operational framework and prepares for the card platform integration; the card platform itself is technically deferred.

### **Existing vs. Needed Inventory**

**Existing —** Real estate section with some construction-related capability, draw processing precursors.

**Needed (Phase 1) —** Formalization of all twelve agent roles, draw processing workflow, budget vs actual tracking, schedule monitoring, change order management, lien monitoring integration, insurance verification workflow, sponsor equity tracking, substantial completion management.

**Future Capability Deepening —** Commercial card platform implementation (pending patent counsel review), BaaS partner integration, automated transaction matching, real-time draw approval, building code database integration by jurisdiction, automated lien filing monitoring.

## **4.10 — The Insurance, Surety, and Credit Enhancement Desk**

The Insurance, Surety, and Credit Enhancement Desk handles credit enhancement strategy and execution across the firm's deal flow. The desk evaluates whether each deal benefits from credit enhancement, designs the enhancement structure, and coordinates with enhancement providers (LOC banks, bond insurers, sureties, federal guarantee programs) on engagement and ongoing administration.

### **Institutional Mirror — Financial Guaranty Company Underwriting Organization**

The Insurance, Surety, and Credit Enhancement Desk mirrors the underwriting organization at financial guaranty insurers (Assured Guaranty, Build America Mutual, Berkshire Hathaway Assurance, etc.) and the credit enhancement specialty teams at major LOC-providing banks. These organizations have dedicated personnel evaluating enhancement opportunities, structuring enhancement transactions, and managing ongoing enhancement administration. The mirror approach produces clean interfaces with enhancement providers.

### **Nest's Insurance, Surety, and Credit Enhancement Desk Agent Structure**

***Enhancement Strategy Agent***

**Function —** Evaluation of credit enhancement opportunity per deal. Cost-benefit analysis of enhancement options (LOC, bond insurance, surety, federal guarantee, no enhancement). Strategy recommendation to Bond Desk and Structuring Desk.

**Inputs —** Deal package from Bond Desk, structuring memorandum from Structuring Desk, credit memo from Credit Underwriting Desk, rating analysis from Rating Desk Mirror Agents (showing rating uplift potential from each enhancement option), enhancement provider terms and capacity.

**Outputs —** Enhancement strategy memo per deal recommending enhancement type or no-enhancement, cost-benefit analysis showing economic value of enhancement, provider selection recommendation.

***LOC Bank Liaison Agent***

**Function —** LOC provider engagement when LOC enhancement is part of the structure. Bank selection. Fee negotiation. LOC agreement coordination. Ongoing LOC bank relationship management throughout the LOC's life.

**Inputs —** Enhancement strategy from Enhancement Strategy Agent (when LOC is selected), LOC bank market intelligence, prior LOC bank relationships, ongoing LOC status data.

**Outputs —** LOC bank selection, LOC fee negotiation, LOC agreement coordination, ongoing LOC bank relationship management, LOC renewal coordination.

***Bond Insurer Liaison Agent***

**Function —** Bond insurer engagement when financial guaranty insurance is part of the structure. Insurer selection (typically Assured Guaranty or Build America Mutual). Premium negotiation. Insurance agreement coordination. Ongoing insurer relationship management.

**Inputs —** Enhancement strategy from Enhancement Strategy Agent (when bond insurance is selected), bond insurer market intelligence, prior bond insurer relationships.

**Outputs —** Bond insurer selection, premium negotiation, bond insurance agreement coordination, ongoing insurer relationship management.

***Surety Liaison Agent***

**Function —** Surety engagement for surety wraps and for construction-period performance and payment bonds. Surety selection. Bond negotiation and coordination.

**Inputs —** Enhancement strategy from Enhancement Strategy Agent (when surety wrap is selected), construction contract bond requirements from Construction Risk Management Desk, surety market intelligence.

**Outputs —** Surety selection, surety bond coordination, ongoing surety relationship management.

***Federal Guarantee Programs Agent***

**Function —** Federal guarantee program engagement (USDA Business and Industry, USDA Community Facilities, FHA Section 221(d)(4), FHA Section 232, FHA Section 242, GNMA wrapping). Application coordination. Approval process management. Ongoing federal program compliance.

**Inputs —** Enhancement strategy from Enhancement Strategy Agent (when federal program is selected), federal program eligibility requirements, application timeline, federal program compliance requirements.

**Outputs —** Federal program application coordination, approval process management, federal program compliance throughout the bond's life.

### **Handoffs to Adjacent Desks**

* From Bond Desk — receives deal and works closely on enhancement strategy decisions
* From Structuring Desk — receives structuring memorandum and iterates on enhancement integration
* From Credit Underwriting Desk — receives credit memo informing enhancement need analysis
* From Rating Desk — receives rating implications of enhancement options
* To Bond Desk — delivers enhancement strategy and provider selection
* To Documents Desk — coordinates documentation of enhancement provisions
* To external enhancement providers — engages LOC banks, bond insurers, sureties, federal program offices

### **Platform Component Mapping**

The Insurance, Surety, and Credit Enhancement Desk corresponds to the existing Surety Desk section of the Nest platform, expanded to cover the full range of enhancement types beyond surety alone. The existing Surety Desk provides the foundation; the desk's expansion adds the LOC, bond insurance, and federal guarantee programs capabilities.

### **Existing vs. Needed Inventory**

**Existing —** Surety Desk section with surety-specific capability, surety market intelligence.

**Needed (Phase 1) —** Enhancement Strategy Agent for type selection, LOC Bank Liaison Agent, Bond Insurer Liaison Agent (Assured Guaranty and BAM relationships), Federal Guarantee Programs Agent with FHA and USDA expertise, cost-benefit analysis logic across enhancement options.

**Future Capability Deepening —** Direct API integration with federal program offices, automated FHA Section 232 application processing for senior living deals, automated USDA B&I application processing for rural deals.

## **4.11 — The Placement Desk**

The Placement Desk owns the actual placement of bonds with institutional investors. The desk coordinates with the BD partner on book-running, manages pricing strategy, runs buyer pool intelligence (Night Vision), and supports the final pricing and allocation decisions.

### **Institutional Mirror — Broker-Dealer Syndicate Desk**

The Placement Desk mirrors the syndicate desk function at broker-dealer firms — Piper Sandler, Stifel, Hilltop Securities, Raymond James, BOK Financial, and the institutional underwriters in the muni and corporate bond markets. Syndicate desks manage the book-building process for each deal: marketing to institutional buyers, taking and aggregating orders, building the book, setting pricing, allocating bonds across buyers. Nest's Placement Desk performs the financial advisor-side of this process, coordinating with the BD partner who legally executes the placement.

### **Nest's Placement Desk Agent Structure**

***Placement Coordinator Agent***

**Function —** Coordination with BD partner on placement strategy. Marketing timeline management. Book-building oversight. Buyer outreach coordination. Final allocation negotiation.

**Inputs —** Deal package from Bond Desk, structuring memorandum from Structuring Desk, rating outcome from Rating Desk, BD partner input, buyer pool intelligence from Night Vision.

**Outputs —** Placement strategy memo, marketing timeline, buyer outreach plan, allocation recommendations, BD partner coordination.

***Pricing Analyst Agent***

**Function —** Pricing strategy development. Comparable transaction pricing analysis. Real-time book analysis during marketing. Pricing recommendation at pricing. Allocation pricing optimization.

**Inputs —** Comparable transaction pricing data from EMMA and EDGAR, rating outcome, market data, book status during marketing, BD partner pricing input.

**Outputs —** Initial pricing recommendation (talk price), book analysis during marketing, final pricing recommendation, allocation pricing optimization.

***Buyer Pool Intelligence Agent (Night Vision)***

**Function —** Maintenance of institutional buyer pool database. Tracking of which buyers buy what types of bonds. Identification of target buyers for each deal based on the deal's characteristics. Real-time buyer activity tracking. Buyer relationship intelligence.

**Inputs —** EMMA and EDGAR public records on buyer activity, public 13F filings, buyer pool intelligence from BD partners, conference presentations and public statements, buyer mandate intelligence.

**Outputs —** Target buyer list per deal, buyer activity tracking, buyer mandate analysis, real-time buyer engagement intelligence.

***BD Partner Interface Agent***

**Function —** Day-to-day coordination with BD partner across deals. BD partner relationship management. Information exchange. Coordination of marketing activities. Allocation coordination at pricing.

**Inputs —** BD partner communications, deal-by-deal coordination needs, BD partner performance data.

**Outputs —** BD partner coordination, information packages to BD partner, allocation coordination, BD partner relationship management.

### **Handoffs to Adjacent Desks**

* From Bond Desk — receives deal at marketing phase commencement
* From Structuring Desk — receives final structuring memorandum
* From Rating Desk — receives final rating outcome
* From Enhancement Desk — receives enhancement structure
* To Bond Desk — coordinates back through the marketing and pricing process; Bond Desk MD Agent stays engaged at senior level
* To BD partner — primary external interface
* To Operations Desk — hands off at closing for post-closing administration

### **Platform Component Mapping**

The Placement Desk corresponds to the existing Night Vision section of the Nest platform (buyer pool intelligence) plus placement coordination capability that needs to be formalized. Night Vision provides the buyer pool intelligence layer; the Placement Desk extends this with pricing analysis, placement coordination, and BD partner interface.

### **Existing vs. Needed Inventory**

**Existing —** Night Vision section with buyer pool intelligence capability, buyer activity tracking, target buyer identification.

**Needed (Phase 1) —** Formal Placement Coordinator Agent, Pricing Analyst Agent with comparable transaction pricing analysis, BD Partner Interface Agent, integration between Night Vision and placement workflow.

**Future Capability Deepening —** Real-time book-building during marketing, automated buyer mandate matching at scale, expanded buyer pool intelligence across additional asset classes.

## **4.12 — The Operations Desk**

The Operations Desk owns ongoing post-closing administration across the firm's portfolio. Once a bond closes, the deal transitions to the Operations Desk for the 20-30 year administration tail. The desk handles draw processing (in coordination with Construction Risk Management Desk during construction phase), debt service administration, compliance with all reporting requirements, covenant monitoring, and continuing disclosure execution.

### **Institutional Mirror — Trustee Bank Operations and Bank Back Office**

The Operations Desk mirrors the operations functions at trustee banks and bank back-office organizations. U.S. Bank, BNY Mellon, Wilmington Trust, UMB Bank, and Zions Bank have substantial trustee operations teams handling debt service processing, account administration, reporting management, and compliance tracking. Bank back-office operations are organized around the same workflow stages. The mirror approach produces operations capability with full institutional rigor.

### **Nest's Operations Desk Agent Structure**

***Operations Lead Agent***

**Function —** Ownership of post-closing administration across the portfolio. Setting of administration standards. Exception management. Coordination across the operations sub-agents.

**Inputs —** Portfolio status across all administered deals, exception flags from sub-agents, ongoing reporting requirements, sponsor and counterparty communications.

**Outputs —** Portfolio administration reports, exception escalations, administration standards updates, cross-desk coordination on administration matters.

***Draw Processing Agent***

This function is shared with the Construction Risk Management Desk's Draw Processing Agent during construction phase. After substantial completion, the Operations Desk's Draw Processing Agent handles any remaining specialized draws (final cost certifications, retainage releases, project closeout draws).

***Debt Service Administration Agent***

**Function —** Periodic interest and principal payment processing across the administered portfolio. Calculation of payment amounts per indenture. Coordination with trustee on payment disbursement. Tracking of any payment exceptions or shortfalls.

**Inputs —** Indenture payment provisions, sponsor payment submissions, trustee status updates, reserve fund balances.

**Outputs —** Payment calculation packages, payment coordination with trustee, payment exception reports, debt service status across portfolio.

***Compliance Agent***

**Function —** Continuing disclosure compliance and material event tracking across the administered portfolio. Coordination with Continuing Disclosure Compliance Agent on the Legal and Compliance Desk. Material event identification and filing coordination.

**Inputs —** Continuing disclosure agreements per deal, sponsor financial reports, material event triggers, EMMA filing requirements.

**Outputs —** Compliance status per deal, material event filings, continuing disclosure execution, EMMA filing coordination.

***Covenant Monitoring Agent***

**Function —** Ongoing financial and operational covenant testing across the portfolio. Quarterly compliance certification production. Identification of covenant breaches. Trend analysis of covenant performance.

**Inputs —** Sponsor financial statements and operating reports, covenant requirements per indenture, financial data feeds, operational performance data.

**Outputs —** Quarterly covenant compliance certifications, covenant breach identification, covenant trend analysis, covenant exception alerts.

### **Handoffs to Adjacent Desks**

* From Bond Desk — receives deal at closing for ongoing administration
* From Construction Risk Management Desk — receives deal at substantial completion
* From Documents Desk — receives final closing document set for reference
* To Surveillance Desk — feeds ongoing performance data for portfolio-level surveillance
* To Trustee Liaison Desk — coordinates ongoing trustee interactions
* To Legal and Compliance Desk — coordinates on regulatory and disclosure matters

### **Platform Component Mapping**

The Operations Desk corresponds to the administration capabilities that need to be formalized across the platform. Multiple existing platform sections touch operations functions (Bond Desk, compliance layer, docs section); the Operations Desk formalizes these into a defined desk with explicit agent roles. Significant Phase 1 work to deploy the formalized operations agents.

### **Existing vs. Needed Inventory**

**Existing —** Administration capability across multiple existing platform sections, compliance layer integration.

**Needed (Phase 1) —** Formal Operations Lead Agent, formalized Debt Service Administration Agent with calculation logic per indenture type, Compliance Agent with EMMA filing integration, Covenant Monitoring Agent with quarterly testing workflow.

**Future Capability Deepening —** Automated EMMA filing across portfolio, real-time covenant testing with intraday data feeds, automated material event detection.

## **4.13 — The Surveillance Desk**

The Surveillance Desk owns the long-term surveillance across the administered portfolio. Where the Operations Desk handles day-to-day administration, the Surveillance Desk takes a longer view — tracking credit deterioration or improvement, identifying refunding opportunities when interest rates move, identifying restructuring opportunities when sponsors need them, supporting workout situations when defaults emerge.

### **Institutional Mirror — Rating Agency Surveillance Team and Bank Portfolio Management**

The Surveillance Desk mirrors two institutional functions. First, the surveillance teams at rating agencies — Moody's, S&P, Fitch all have dedicated surveillance analysts who track outstanding ratings and flag rating changes. Second, the portfolio management function at banks holding outstanding loan portfolios — banks have teams managing existing loans, identifying refinancing opportunities, and addressing deteriorating credits. The mirror combines both functions in one desk.

### **Nest's Surveillance Desk Agent Structure**

***Surveillance Lead Agent***

**Function —** Ownership of long-term portfolio surveillance. Setting of surveillance standards. Cross-deal surveillance pattern identification. Coordination with sub-agents on specific surveillance dimensions.

**Inputs —** All portfolio performance data, ongoing reporting from Operations Desk, market data, sector intelligence, credit policy parameters.

**Outputs —** Portfolio surveillance reports, surveillance standard updates, cross-deal pattern reports, surveillance exception escalations.

***Refunding Identification Agent***

**Function —** Continuous monitoring of refunding opportunities across the administered portfolio. NPV savings analysis at current market rates for each outstanding deal. Identification of deals where refunding economics justify execution. Refunding initiation recommendation to Bond Desk.

**Inputs —** Outstanding deal terms (coupon, maturity, call provisions, remaining principal), current market rates and spreads, comparable refunding precedent.

**Outputs —** Refunding opportunity analyses per deal, prioritized refunding pipeline, refunding initiation recommendations.

***Restructuring Opportunity Agent***

**Function —** Identification of deals approaching restructuring needs — covenant pressure, sponsor distress signals, sector deterioration, structural mismatches. Restructuring opportunity recommendation to Bond Desk.

**Inputs —** Covenant compliance trends from Covenant Monitoring Agent, sponsor financial deterioration signals, sector deterioration data, structural mismatch identification.

**Outputs —** Restructuring opportunity reports, prioritized restructuring pipeline, restructuring initiation recommendations.

***Risk Re-Rating Agent***

**Function —** Internal credit re-rating across the portfolio on a defined cadence (typically quarterly). Application of the Moody's and S&P Methodology Mirror Agent logic to outstanding deals. Identification of credit deterioration or improvement. Rating change anticipation.

**Inputs —** Updated financial and operational data per deal, current Moody's and S&P methodology parameters, sector dynamics, comparable performance data.

**Outputs —** Updated internal credit ratings per deal, credit deterioration alerts, rating change anticipation reports.

***Workout Support Agent***

**Function —** Support for workout situations when deals enter distress. Coordination with Litigation and Dispute Agent on the Legal and Compliance Desk. Restructuring proposal development. Bondholder communication coordination. Outside workout specialist coordination.

**Inputs —** Default and distress information per deal, restructuring options analysis, bondholder communications, outside workout specialist input.

**Outputs —** Workout strategy memos, restructuring proposals, bondholder communication coordination, workout execution support.

### **Handoffs to Adjacent Desks**

* From Operations Desk — receives ongoing performance data for surveillance
* From Credit Underwriting Desk — receives original credit memo as baseline
* From Legal and Compliance Desk — receives compliance flags and material event information
* To Bond Desk — surfaces refunding and restructuring opportunities for execution
* To Credit Underwriting Desk — feeds portfolio learning back into credit policy refinement
* To Legal and Compliance Desk — coordinates on workout legal matters

### **Platform Component Mapping**

The Surveillance Desk represents capability that needs to be formalized within the platform. Surveillance has likely been handled informally across the Bond Desk and compliance functions; the formalization into a defined desk with five specialized agents produces systematic long-term portfolio management. New agent deployment likely required for most roles.

### **Existing vs. Needed Inventory**

**Existing —** Some surveillance capability within existing operational sections.

**Needed (Phase 1) —** All five Surveillance Desk agent roles formalized, refunding NPV calculation engine, internal credit re-rating logic leveraging the Mirror Agents, workout support workflow.

**Future Capability Deepening —** Real-time refunding pipeline with automated NPV calculation as market rates move, automated restructuring opportunity scoring, integrated workout management platform.

## **4.14 — The Business Development Organization**

The Business Development Organization (BDO) owns origination across the firm. The BDO identifies opportunities, qualifies leads, runs outbound campaigns, manages the BD partner relationships, maintains conference and brand presence, and converts the pipeline into engaged deals. The BDO includes Eagle Eye (the business development intelligence layer with M&A signaling, IPO readiness scoring, and sponsor intelligence) and the BDO sub-agents that execute on the intelligence.

### **Institutional Mirror — Investment Bank Originations Organization**

The BDO mirrors how investment banks structure originations. At JPMorgan, Morgan Stanley, and similar firms, dedicated originations teams identify deal opportunities, build relationships with potential sponsors, and convert leads into engagements. Senior originators handle relationship cultivation; analyst-level support handles pipeline tracking, intelligence gathering, and outreach execution. Conference and brand presence is treated as a strategic function with dedicated coordination.

### **Nest's BDO Agent Structure**

***BDO Lead Agent***

**Function —** Ownership of the firm's origination pipeline. Strategic prioritization of opportunities. Cross-sector pipeline coordination. Conversion strategy from lead to engagement. Coordination with Head of Business Development Agent at Orca on origination strategy.

**Inputs —** Sponsor intelligence from Eagle Eye and sub-agents, pipeline data, sector concentration analysis, BD partner input, conference and brand activity.

**Outputs —** Origination prioritization, pipeline reports, conversion strategy memos, sub-industry silo emergence signals, cross-sector coordination.

***Sponsor Intelligence Agent (Eagle Eye Component)***

**Function —** Monitoring of public sources for sponsor activity, project announcements, refinancing opportunities, M&A signals, IPO readiness. Identification of potential deal opportunities. Sponsor profile maintenance.

**Inputs —** EMMA and EDGAR public records, company press releases, conference presentations, industry publications, SEC filings, public 13F filings, M&A databases, IPO databases.

**Outputs —** Sponsor activity reports, project announcement alerts, refinancing opportunity identification, M&A signaling analysis, IPO readiness scoring, sponsor profile updates.

***M&A Signaling Agent (Eagle Eye Component)***

**Function —** Identification of M&A activity that creates bond financing opportunities. LBO financing identification. Acquisition financing identification. Spin-off financing identification. Distressed M&A workout opportunity identification.

**Inputs —** M&A databases (Mergermarket, Refinitiv, S&P Capital IQ equivalents from public sources), private equity firm activity, strategic acquirer activity, distressed sale signals.

**Outputs —** M&A-driven bond financing opportunities, LBO financing pipeline, acquisition financing pipeline, distressed M&A workout opportunities.

***IPO Readiness Agent (Eagle Eye Component)***

**Function —** Identification of companies approaching IPO that may need pre-IPO bond financing or post-IPO restructuring. Tracking of S-1 filings. Identification of late-stage growth companies likely to access bond markets.

**Inputs —** SEC IPO pipeline (S-1 filings), late-stage growth company databases, venture capital portfolio data, growth equity activity.

**Outputs —** IPO readiness scoring, pre-IPO financing opportunities, post-IPO restructuring opportunities.

***Outreach Agent***

**Function —** Drafting and execution of outbound communication to sponsors. Outreach campaign management. Response tracking. Lead qualification before handoff to BDO Lead Agent.

**Inputs —** Sponsor profiles from Sponsor Intelligence Agent, outreach campaign templates, sponsor contact information, prior outreach history.

**Outputs —** Outbound outreach communications (email, LinkedIn, conference outreach), campaign tracking, response tracking, qualified lead handoffs.

***Pipeline Tracking Agent***

**Function —** Maintenance of the firm's deal pipeline from first contact through engagement. Stage progression tracking. Conversion analytics. Pipeline reporting to BDO Lead Agent and Orca.

**Inputs —** All BDO activity data, sponsor responses, lead qualifications, engagement signings.

**Outputs —** Pipeline reports, stage progression analytics, conversion analytics, pipeline forecasting.

***Conference and Brand Presence Agent***

**Function —** Strategic management of conference attendance and brand presence. Conference selection. Speaker submission and management. Sponsor presence at industry events. Industry publication strategy.

**Inputs —** Industry conference calendar, conference attendance data, speaking opportunity tracking, industry publication landscape.

**Outputs —** Conference attendance strategy, speaker submissions, brand presence plans, industry publication strategy.

### **Handoffs to Adjacent Desks**

* To Bond Desk — hands qualified leads at engagement signing
* To Orca Head of Business Development Agent — coordinates strategic direction
* To Surveillance Desk — receives refunding and restructuring opportunities for outbound sponsor coordination
* To Credit Underwriting Desk — sponsor intelligence feeds credit analysis
* To Placement Desk — Night Vision buyer pool intelligence integrates with BDO outreach

### **Platform Component Mapping**

The BDO corresponds to the existing Eagle Eye section of the Nest platform (business development with M&A signaling and IPO readiness) plus outreach and pipeline management capability. Eagle Eye provides the intelligence layer; the BDO formalizes the outreach execution, pipeline management, and conference and brand functions. Several existing agents perform business development and intelligence functions; formalization into the seven-agent BDO structure adds the explicit role definitions.

### **Existing vs. Needed Inventory**

**Existing —** Eagle Eye section with M&A signaling, IPO readiness, and sponsor intelligence capability.

**Needed (Phase 1) —** Formal BDO Lead Agent, formalized Sponsor Intelligence Agent, formalized M&A Signaling Agent and IPO Readiness Agent (deeper integration into Eagle Eye), Outreach Agent with campaign management, Pipeline Tracking Agent with analytics, Conference and Brand Presence Agent.

**Future Capability Deepening —** Automated sponsor outreach at scale, real-time M&A signaling with private market data sources, expanded conference and brand presence automation.

## **4.15 — Where Humans Plug In**

This section describes where humans operate in Nest's organizational structure. The firm is hybrid by design — AI agents perform the operational layer; humans perform the relationship and judgment layer. The boundary between agent work and human work is deliberate and is anchored on what AI does well today versus what AI cannot yet do at the quality bar the firm requires.

### **4.15.1 The Founders — The Permanent Human Team**

Sean Gilmore and Josh Edwards are the human team. Not the starting human team. The permanent human team. The firm's design — agents performing operational roles role-for-role with institutional counterparts — is what allows two principals to do the work of a 40-person regional firm. Expanding the human team would erase the operating leverage that defines Nest.

The founders perform:

* Strategic direction setting — what the firm focuses on, where the platform invests, what new capabilities deepen
* Key sponsor relationships — the senior-level relationships with major sponsors that produce repeat deal flow
* BD partner senior relationships — the firm's relationships with broker-dealer partners at the executive level
* Board representation — when serving on sponsor boards or in board-equivalent advisory roles
* Judgment at exception thresholds — when agent recommendations require human approval per the firm's exception authority framework
* The actual selling of bonds — final sales conversations with institutional buyers when needed
* Capital raise and strategic financing for the firm itself
* Regulatory positioning at the executive level
* Platform development direction — what capability the platform adds next, informed by the deal pipeline

### **4.15.2 The Two-Principal Permanent Model**

Nest is built to stay at two principals. The firm's design — agents performing operational roles role-for-role with institutional counterparts — is what allows two people to produce institutional-quality work at full scale. Adding more humans dilutes the operating leverage that defines the firm. Adding more humans recreates the cost structure, the management overhead, the credit-stealing dynamics, and the hiring-and-firing churn that traditional firms accept as the price of doing business. Nest exists to avoid that price.

The two principals handle the relationship and judgment layer for every deal. The agent workforce handles everything else. As deal volume grows, the agents absorb the operational scaling without adding to the firm's human cost structure. The principals' capacity sets the ceiling — not on operational throughput (which scales without bound through the agents) but on the relationships and judgment work that the principals personally execute. When the firm approaches that ceiling, the response is to raise minimums or selectively decline business, not to hire.

**THE PERMANENT TWO-PRINCIPAL PRINCIPLE —** Nest is two principals plus the platform. The platform does the work of institutional staff. Hiring additional principals or staff is the failure mode the firm is architecturally designed to avoid. Higher per-principal economics is the long-term identity, not a stepping stone to traditional firm headcount.

### **4.15.3 When Sub-Industry Silos Earn Specialization (Without Specialist Hires)**

As the sub-industry silo framework (Part 5) promotes sectors to dedicated silo treatment, the response is platform capability deployment — not human specialist hiring. The Moody's and S&P Methodology Mirror Agents get calibrated to the sector's specific criteria. The template library gets sector-specific patterns. Eagle Eye and Night Vision develop sector-specific intelligence overlays. The universal credit policy gets sector-specific overlays. None of this requires additional humans. The agents perform the sector specialist function at the operational layer.

The principals retain the relationship layer for each sector. Sean and Josh build sponsor relationships in the sectors that emerge, the same way they would in any sector. The difference is that the agents do the sector-specialist operational work that traditional firms would assign to dedicated sector teams. Two principals can therefore cover an arbitrary number of sectors at sector-specialist operational quality, bounded only by the principals' capacity for relationship work.

### **4.15.4 The Handoff Points Between Agents and Humans**

The boundary between agent work and human work is defined at specific handoff points. The major handoff points where agent work transitions to human judgment:

* Credit committee approval — every deal above defined materiality thresholds requires human credit committee approval before proceeding to documentation and rating
* Exception escalation — when agent decisions exceed defined exception thresholds (credit policy deviations, pricing outside guidance, structural anomalies), the matter escalates to the founders or designated Orca agent for resolution
* Sponsor relationship — initial sponsor meetings, key relationship moments, board presentations, and high-stakes negotiations are handled by the founders or designated senior human team members
* Strategic decisions — sector entry, BD partner selection at the strategic level, capital raise decisions, hiring decisions are made by the founders
* External representation — the firm's external face at conferences, in press, in regulatory matters, and in industry organizations is the founders (or designated humans)
* Workout and restructuring — when deals enter distress, the human team participates in strategy and execution alongside the Workout Support Agent and Surveillance Desk

### **4.15.5 The Operating Cadence**

The firm operates on a defined cadence that integrates agent work with human direction:

* Daily — agents process deal flow, execute on assigned tasks, produce outputs; exception flags raised in real-time to relevant human or Orca agent
* Weekly — Orca produces firm-wide weekly review; founders receive briefings on pipeline, active deals, exceptions, and strategic matters
* Monthly — Orca produces financial reports, performance dashboards, sub-industry concentration analysis; founders set monthly priorities
* Quarterly — Orca produces credit committee reviews, covenant testing results, surveillance reports; founders engage in strategic planning
* Annually — Orca and founders produce annual strategic review; capital allocation, capability investments, hiring decisions, sub-industry silo emergence assessments

# **THE SUB-INDUSTRY SILO FRAMEWORK**

Nest does not pre-commit to specific verticals at launch. The firm goes where deal flow goes. As deal volume concentrates in particular sectors over time, those sectors earn dedicated silo treatment — specialized credit policy parameters, specialized template libraries, specialized rating methodology calibration, specialized buyer pool intelligence, specialized brand and conference presence. The verticals emerge from actual market behavior rather than from upfront marketing decisions.

## **5.1 The Principle: Business Dictates Specialization**

Traditional firms typically allocate resources to verticals based on founder judgment, prior banker experience, or strategic positioning decisions made before the firm has substantial market evidence. Nest takes the opposite approach: resources are allocated to verticals only after deal volume demonstrates that the vertical is real for the firm. This empirical approach allocates capability based on actual market behavior.

The firm's universal capability set (the fourteen operational desks described in Part 4) handles deals across sectors at launch. Each deal that comes in is processed through the universal infrastructure. As patterns emerge — three deals in senior living, five deals in hospitality, ten deals in data centers — the firm builds sector-specialized overlay capability for those sectors. The overlay sits on top of the universal infrastructure rather than replacing it.

**THE EMPIRICAL ALLOCATION PRINCIPLE —** Specialization is earned. A sub-industry silo gets dedicated capability only after deal flow demonstrates it. Nest does not allocate resources to verticals before the verticals demonstrate they will produce volume.

## **5.2 How a Silo Earns Its Place**

A sub-industry earns silo treatment when it meets defined volume and pattern criteria. The criteria are deliberately quantitative to prevent founder bias toward favored sectors. Specifically:

* Volume threshold — the sub-industry has produced at least three closed deals or five engaged deals within a defined twelve-month window
* Pipeline depth — the sub-industry shows additional pipeline depth beyond the closed and engaged deals (at least five additional qualified leads)
* Pattern recognizability — the deals in the sub-industry show common structural patterns, common counterparty patterns, common credit dynamics that justify specialized capability
* Margin viability — the sub-industry produces deal economics sufficient to justify the incremental capability investment

When these criteria are met, the sub-industry is promoted to silo status. The silo gets dedicated capability deployment per Section 5.3. Sub-industries that don't meet the criteria continue to be served through universal infrastructure; they remain candidates for future silo status if volume develops.

## **5.3 The Silo Deployment Pattern**

When a sub-industry earns silo status, the firm deploys sector-specialized instances of the same role structure described in Part 4. The deployment pattern is consistent across silos:

* Sector-specialized credit policy overlay — specific financial metrics calibration, sector-specific sponsor diligence requirements, sector-specific project underwriting standards, sector-specific structural requirements
* Sector-specialized template library — document templates calibrated to the sector's common structures (indenture provisions, covenant package, security documents)
* Sector-specialized rating methodology calibration — the Moody's and S&P Mirror Agents calibrated to the sector's specific methodology criteria
* Sector-specialized buyer pool intelligence — Night Vision calibrated to the buyers who acquire bonds in this sector
* Sector-specialized BDO outreach — Eagle Eye and the BDO sub-agents calibrated to the sector's sponsor universe, conference circuit, and intelligence sources
* Sector-specialized brand and conference presence — Nest's external presence at the sector's major conferences, in the sector's industry publications, with the sector's relevant trade associations

## **5.4 The Universal Architecture (What Stays the Same)**

The universal capabilities that span all sectors remain consistent regardless of which silos are active:

* Orca and the executive function
* The fourteen operational desks as organizational units
* The agent role structure within each desk
* The universal credit policy (with sector overlays adding rather than replacing)
* The handoffs between desks
* The regulatory compliance framework
* The technical stack and data infrastructure
* The platform's intelligence layer (EMMA and EDGAR ingestion, public records, market data feeds)
* The construction card platform (where applicable)

## **5.5 The Silo Overlay (What Gets Customized)**

The sector-specific customizations sit on top of the universal architecture rather than replacing it:

* Sector-specific credit policy parameters (DSCR thresholds, days cash on hand requirements, occupancy and ramp-up assumptions, sponsor quality standards)
* Sector-specific structuring patterns (amortization patterns, reserve sizing, covenant packages, security pledges)
* Sector-specific rating methodology weighting
* Sector-specific buyer mandates and pricing benchmarks
* Sector-specific sponsor universe and outreach patterns
* Sector-specific regulatory requirements (where sectors have specific rules — for example, IRC §142(d) for affordable housing, FHA 232 for senior living)

## **5.6 Cross-Silo Capabilities**

Some capabilities serve multiple silos and remain centralized at the universal level. M&A bond financing capability — covering high-yield LBO, investment grade corporate acquisition, and tax-exempt nonprofit M&A — serves any silo where M&A bond opportunities emerge. The capability is built once at the universal level and deployed to any silo with relevant M&A activity.

Similarly, refunding capability serves all silos. Restructuring and workout capability serves all silos. The Surveillance Desk's portfolio management capability spans all silos. These cross-silo capabilities prevent capability duplication and ensure consistent execution across the firm.

## **5.7 Silo Lifecycle**

Silos have a lifecycle: emergence, growth, maturity, and possible retirement.

* Emergence — the sub-industry meets the criteria in Section 5.2 and is promoted to silo status. Sector overlay capability is deployed. The first dedicated cycle of capability investment occurs.
* Growth — the silo produces increasing deal flow. Capability investment continues with refinements based on actual deal experience. Sponsor and counterparty relationships deepen.
* Maturity — the silo operates at steady-state volume. Capability investment shifts to optimization rather than buildout. Platform capability is maximally deployed for the sector; the principals own the sponsor relationships in the sector directly with full agent support.
* Possible retirement — if a silo's volume declines materially below sustainability thresholds, the silo may be deactivated. Sector overlay capability is retained for historical reference but no longer prioritized for new deals.

# **THE EMMA AND PUBLIC RECORDS INGESTION STRATEGY**

The platform's intelligence layer ingests data from EMMA (the MSRB municipal bond disclosure repository), EDGAR (the SEC corporate filing repository), and other public records to reverse-engineer the bond market into structured intelligence. This intelligence feeds every desk — credit underwriting comparable analysis, structuring precedent analysis, rating methodology calibration, buyer pool intelligence, sponsor intelligence, refunding identification, surveillance, and BDO sourcing.

## **6.1 Why EMMA and Public Records Matter to Nest**

The bond market produces enormous amounts of public data. Every muni bond's official statement is on EMMA. Every public corporate bond's prospectus is on EDGAR. Every annual continuing disclosure filing is on EMMA. Every material event notice is on EMMA. Every Form 8-K material event for public corporates is on EDGAR. Every Form 13F holding for institutional buyers is on EDGAR. Every public bond rating from the major NRSROs is published in the agencies' research.

This data is structured, accessible, and free. The bottleneck has historically been not data availability but data integration — pulling structured information out of unstructured documents at scale, organizing it into queryable databases, and connecting it across deals, counterparties, sectors, and time. AI changes this calculation completely. The platform's intelligence layer ingests the data, structures it, and makes it queryable across every desk and every analytical function.

## **6.2 What Gets Ingested**

The ingestion pipeline pulls data from multiple sources:

* EMMA — official statements, continuing disclosure annual reports, material event notices, rating action notices, audit reports, bond document filings
* EDGAR — registration statements and prospectuses for public corporate bonds, 10-K and 10-Q filings for public companies, 8-K material event filings, 13F holdings filings for institutional buyers, Section 16 insider transactions, proxy statements
* Rating agency research — published criteria and methodology updates, sector research, rating action publications
* Market data — yield curves (Treasury, MMD, SIFMA), credit spreads, market commentary
* Industry data — sector publications, conference materials, trade association data, regulatory filings by sector
* Public records — court records (litigation involving sponsors), permit and entitlement records (project approvals), real estate records (property transactions), corporate records (entity formations and changes)

## **6.3 How the Intelligence Layer Self-Learns**

The intelligence layer is designed to continuously improve through pattern recognition across the ingested data. As more deals are processed, the layer identifies patterns:

* Sector patterns — what financial profiles correlate with what ratings in each sector
* Structural patterns — what structural features correlate with what pricing in each sector
* Sponsor patterns — which sponsors produce which outcomes (closed deals vs failed deals, performing deals vs distressed deals)
* Buyer patterns — which institutional buyers acquire which types of bonds at what spreads
* Counterparty patterns — which bond counsel firms work on which sectors, which rating analysts cover which sectors, which trustees handle which structures
* Market patterns — how pricing spreads move with market conditions, how new issuance volumes correlate with market conditions, how refunding opportunity emerges

Each new deal processed adds data points that refine the pattern recognition. The intelligence layer compounds in value as the platform accumulates deal experience.

## **6.4 How the Intelligence Layer Teaches Through Tutorials**

The intelligence layer powers the platform's tutorial system. When a user (human or agent) encounters a decision point, the tutorial system provides:

* Plain-English explanation of the decision being made
* Reference to comparable precedent transactions
* Analysis of the optimal choice given the deal's characteristics
* Identification of the consequences of alternative choices
* Bernard-style gating that prevents proceeding without acknowledgment of the choice
* Wrap-up documentation summarizing the decision after it is made

The tutorial system makes the platform self-teaching. Users learn the bond market as they work through deals. The platform absorbs each new deal into its training data, making future tutorials more precise and more useful.

## **6.5 The Ingestion Pipeline (Conceptual)**

The ingestion pipeline operates across four conceptual stages:

* Stage 1 — Data acquisition: scheduled pulling of data from EMMA, EDGAR, rating agency websites, and other public sources
* Stage 2 — Data structuring: extraction of structured fields from unstructured documents (using AI document parsing); normalization into queryable database tables
* Stage 3 — Data enrichment: cross-referencing across sources, identification of relationships (parent-subsidiary, sponsor-deal, counterparty-deal), classification by sector and structure type
* Stage 4 — Data integration: making the structured data queryable by every operational desk through defined data access interfaces

Technical implementation of the pipeline is deferred to a future iteration. This document captures the strategic framework; the technical buildout follows when prioritized.

# **THE PRODUCT MENU AND ROADMAP**

## **7.1 Phase 1 — The Lead Product: Bond Lending**

Nest's Phase 1 product is bond lending. The firm originates, structures, places, and administers bonds across the middle-market spectrum. The product menu at launch includes the full range described in the Executive Summary: tax-exempt 501(c)(3) bonds, tax-exempt private activity bonds (PABs), governmental purpose bonds, investment grade taxable corporate bonds, select non-investment grade corporate bonds, senior secured project finance bonds, and refundings across all categories.

Sector coverage at launch is universal. Sub-industry specialization emerges from deal flow per the framework in Part 5. The firm targets deal size from approximately $5 million floor to approximately $300 million ceiling in Phase 1, with the ceiling expanding over time as the firm's capability and capital base grow.

## **7.2 Phase 1 Adjacency — The Commercial Card Construction Draw Platform**

Within the bond lending product, the firm operates a commercial card platform for construction draws on bond-financed projects. The platform produces operational advantages (fraud reduction, real-time draw tracking, automatic budget reconciliation, lien protection through merchant-level data) and interchange rebate revenue as a secondary income stream. The platform is positioned as a smart adjacency to the construction administration work the firm already performs, not as a standalone product line.

Implementation specification for the platform awaits patent counsel review and is not detailed in this document. The strategic and economic framing is captured in the Executive Summary.

## **7.3 The Capability-Deepening Roadmap**

The roadmap is not about adding products. It is about deepening the bond capability as the platform learns from deal flow. Each closed deal feeds the intelligence layer. Each new sub-industry that meets the silo criteria (Part 5) earns dedicated overlay capability. Each surveillance cycle refines the credit policy. The platform compounds in value as deal experience accumulates.

Capability deepening is intentional rather than scope-expanding. The firm does not chase new product lines as a growth strategy. Growth comes from doing more bond deals, more profitable, more often — within the same two-principal structure, with the agent workforce absorbing the operational scaling. Two people doing institutional-quality bond work at the operational efficiency of a 40-person regional firm is the long-term identity, not a stepping stone toward one.

## **7.4 Capacity, Not Scale**

The firm's capacity is bounded by what the two principals can handle at the relationship and judgment layer. The agents absorb operational scaling without limit; the human capacity sets the ceiling on deals. When the firm approaches that ceiling, the response is to raise deal-size minimums (which raises revenue per deal at constant human bandwidth) or to selectively decline new business — not to hire additional principals. Hiring more humans recreates the cost structure that the firm exists to avoid.

This is a deliberate design choice. The firm chooses higher per-principal economics over headcount growth. The two principals capture the operating leverage of the platform rather than diluting it across an expanding team. This is the structural difference between Nest and every other middle-market firm: the agents perform the role of additional staff without the additional cost, additional management overhead, additional regulatory complexity, or additional credit-stealing dynamics that characterize traditional firm growth.

# **THE TECHNICAL STACK**

This part describes the technical stack at the conceptual level. Detailed cost analysis, API call volume modeling, modeling methodology, and coding lift estimation are deferred to a future iteration of this document. This v1 captures the strategic framework so the platform can be operationalized against it; the technical buildout details follow when prioritized. These deferrals are about deepening the bond capability — not about adding new product lines, which the firm explicitly does not pursue.

## **8.1 Existing Platform State**

The Nest platform exists today in operational form with multiple components built out. Existing components include:

* Bond Desk section — shell with EDGAR integration and analytical capability
* Surety Desk section — credit enhancement capability
* Compliance layer — regulatory and policy enforcement framework
* Documents (Docs) section — document templates and drafting capability
* Tools platform — underlying analytical infrastructure
* Admin dashboard — human interface for founders and team
* Real estate section — real estate-specific capability
* User tiers — owner, user, investor access control
* Night Vision — buyer pool and outreach intelligence
* Eagle Eye — business development with M&A signaling and IPO readiness
* Intelligence layers with wired APIs for public data ingestion
* Approximately twenty-five AI agents deployed across the platform

This Operating Framework v1 provides the structural spine for these components: it formalizes the agent role architecture within each section, defines the handoffs between sections, and provides the operational manual for the agent workforce.

## **8.2 What This Document Adds Structurally**

The document adds the following structural framework to the existing platform:

* Orca digital C-suite layer — six executive function agents (CEO, CFO, COO, CTO, Head of BD, In-House Counsel/Compliance)
* Fourteen operational desks with defined agent role structures (the structure described in Part 4)
* Universal credit policy as the Underwriter Agent's operating logic
* Moody's and S&P Methodology Mirror Agents within the Rating Desk
* Construction Risk Management Desk with twelve specialized agents
* Legal and Compliance Desk with ten specialized agents
* Trustee Liaison Desk with five specialized agents
* Surveillance Desk with five specialized agents
* Sub-industry silo framework for emerging vertical specialization
* Tutorial / gate / wrap-up architecture for self-teaching platform behavior
* EMMA and public records ingestion strategy for the intelligence layer

The platform implements against this framework; the framework is the spine that gives the platform's existing capability operational direction.

## **8.3 The Technical Buildout (Deferred)**

The detailed technical specification is deferred to a future iteration of this document. That future iteration produces detailed technical specifications and implementation guidance for capability deepening within the bond lending product. The scope includes:

* Tech stack cost analysis — platform compute costs, data feed costs, API call volumes and costs
* Modeling methodology specification — financial modeling architecture, scenario analysis, sensitivity analysis, Monte Carlo where applicable
* Coding lift estimation — engineering scope for the framework operationalization, prioritized buildout sequence
* API integration architecture — EMMA, EDGAR, rating agency portals, document signing, DTC, accounting systems, banking systems, public records sources, market data feeds
* Construction card platform technical specification (subject to patent counsel review)
* Security architecture and access controls
* Disaster recovery and business continuity
* Regulatory technology compliance

Future iterations of this document will be produced as platform learning accumulates and as the deal pipeline shapes capability priorities. Each iteration is about making the bond lending capability deeper, not the firm broader. The product is bond lending; the firm is two principals plus the platform; that is the long-term identity.

# **APPENDICES**

The appendices provide quick-reference tools that compress the body of the document into decision-support format. Each appendix is designed for fast lookup during deal execution — by humans on the team learning the bond market and by agents executing operational work against defined parameters.

## **Appendix A — Bond Type Decision Table**

This table maps borrower type and project type to the bond type that fits. The table is a decision-support tool, not an absolute rule — exceptions exist for every combination. The table is the starting point; deal-specific structuring determines the final choice.

|  |  |  |  |
| --- | --- | --- | --- |
| **Borrower Type** | **Project Type** | **Recommended Bond Type** | **Key Considerations** |
| 501(c)(3) nonprofit hospital | New hospital construction or expansion | Tax-exempt qualified 501(c)(3) revenue bonds (IRC §145) | Rated through Moody's/S&P; revenue pledge of hospital operating revenues; 30-year tenor typical |
| 501(c)(3) nonprofit hospital | Refunding of existing tax-exempt debt | Tax-exempt current refunding under §145; or taxable advance refunding | NPV savings analysis; current refunding within 90 days of call; taxable advance refunding outside that window |
| 501(c)(3) nonprofit senior living (CCRC) | New construction or expansion | Tax-exempt qualified 501(c)(3) revenue bonds; possible FHA 232 wrap | Entry-fee model drives debt service capacity; KBRA or Fitch often used as rating agency; 30-year tenor |
| For-profit senior living operator | New construction or expansion | Taxable bonds; possible FHA 232 wrap for some projects | Sponsor balance sheet credit underwriting; cash flow waterfall; sponsor equity 20%+ |
| 501(c)(3) charter school | New facility construction or acquisition | Tax-exempt qualified 501(c)(3) revenue bonds | Per-pupil state funding flow; charter renewal risk; KBRA dominant rating agency for sector |
| 501(c)(3) private college/university | Campus construction, endowment management, refunding | Tax-exempt qualified 501(c)(3) revenue bonds; possible state HFA conduit | Endowment-driven credit; demographics and enrollment trends; long tenor (30+ years) |
| For-profit affordable housing developer | New construction of qualified residential rental project | Tax-exempt private activity bonds (IRC §142(d)) plus LIHTC equity plus soft loans | Volume cap allocation; 20/50 or 40/60 test; bifurcated taxable/tax-exempt structure common |
| For-profit market-rate multifamily | New construction or refinancing of market-rate apartments | Taxable real estate-backed bonds (private placement); possibly FHA 221(d)(4) or 223(f) wrap | DSCR coverage 1.20x+; debt yield 8-12%; sponsor equity 20-30% |
| For-profit hospitality (hotel) | New hotel construction or repositioning | Taxable real estate-backed bonds (private placement) | Cash flow sweep at low DSCR; sponsor equity 25-35%; brand and franchise considerations |
| For-profit data center | New build or stabilized refinancing | Taxable lease-backed bonds (CMBS-adjacent); private placement | Lease quality and tenant credit drive pricing; long-term contracts preferred |
| For-profit C&I corporate borrower (investment grade) | Working capital, M&A, refinancing | Taxable corporate bonds (public Rule 144A or registered) | Investment grade rating; 5-30 year tenor; bullet at maturity typical |
| For-profit C&I corporate borrower (high yield/LBO) | Acquisition financing, dividend recapitalization, refinancing | Taxable high-yield corporate bonds (Rule 144A typical) | Sponsor-backed credit; significant covenant package; equity claw; call schedule |
| Manufacturer (small) | Manufacturing facility construction or equipment | Qualified small issue manufacturing bonds (IRC §144(a)) up to $10M | Volume cap allocation; manufacturing facility limitations; AMT applies |
| Solid waste/sewage facility (private) | Solid waste disposal facility, sewage facility | Tax-exempt exempt facility bonds (IRC §142) | Facility category compliance; volume cap if PAB |
| Airport (governmental or private) | Airport facility construction | Tax-exempt exempt facility bonds (IRC §142) or governmental purpose bonds | Governmental vs PAB structure; AMT considerations |
| State or local government | Public infrastructure, general budget | Tax-exempt governmental purpose bonds (general obligation or revenue) | Full faith and credit pledge vs revenue pledge; no volume cap; no AMT |
| State housing finance agency | First-time homebuyer mortgages, multifamily housing | Tax-exempt qualified mortgage bonds (single-family) or qualified residential rental (multifamily) | Volume cap allocation; moral obligation pledge common |
| Indian tribe (federally recognized) | Economic development project | Tax-exempt tribal economic development bonds (IRC §7871) | Tribe-specific allocation under IRC §7871 |
| Distressed obligor (any type) | Restructuring or workout financing | Restructured bonds (exchange offer or new money) or DIP financing for bankruptcy | Sector-specific; bondholder consents required for restructuring; specialized workout counsel |

## **Appendix B — Rating Movement Table**

This table summarizes what produces each rating tier and what factors move between tiers. The table is a quick-reference for understanding how the Mirror Agents will likely score a deal. The Mirror Agents apply the actual Moody's and S&P published methodologies; this table provides the general framework.

|  |  |  |  |
| --- | --- | --- | --- |
| **Rating Tier** | **Typical Profile** | **What Earns It** | **What Loses It** |
| AAA / Aaa | Strongest credits; government-backed or extraordinary corporate credits | Government guarantee; or exceptional financial strength with diversified revenue, deep liquidity, conservative leverage | Rare in middle-market without credit enhancement; typical loss factor is concentration risk |
| AA / Aa | Very strong credits; major government entities, top-tier corporates, major hospital systems | Strong financial metrics (DSCR 2.0x+ steady-state); deep market position; experienced management; diversified revenue | Material concentration; leveraging up; sector volatility; management transition |
| A / single-A | Strong credits; established institutional borrowers | Solid financial metrics (DSCR 1.50-2.00x); established market position; clean operating history; good liquidity | DSCR compression below 1.50x; market share loss; aggressive M&A; major capex |
| BBB+ to BBB- | Investment grade floor; well-structured middle-market deals | Adequate financial metrics (DSCR 1.20-1.50x); reasonable market position; defensible competitive position | DSCR approaching 1.20x; sector deterioration; sponsor credit issues; covenant pressure |
| BB+ to BB- | Non-investment grade upper tier; specialty credits and select sponsor-backed deals | Aggressive but workable financial metrics (DSCR 1.10-1.30x); sponsor-backed credit with track record; defensible cash flows | DSCR approaching 1.10x; sponsor distress; sector dislocation; covenant breach |
| B+ to B- | Speculative credits; high-yield bonds and distressed/turnaround situations | Workable cash flow with limited cushion (DSCR 1.05-1.20x); leveraged buyout structure; sponsor commitment to credit | DSCR below 1.05x; liquidity erosion; covenant breach; sector dislocation |
| CCC and below | Substantially distressed; default risk material | Limited cushion; material default risk | Payment default; bankruptcy filing; covenant default without cure |
| D / SD | Default | Payment default; bankruptcy filing; selective default through distressed exchange | N/A (already in default) |

### **Structural Levers That Move Ratings**

Beyond financial metrics, specific structural features move ratings:

* Adding a debt service reserve fund typically lifts ratings by 0-1 notches depending on sizing
* Adding bond insurance (BAM, Assured Guaranty) lifts ratings to the insurer's rating (typically AA)
* Adding a federal guarantee (FHA, USDA) typically produces AAA-equivalent ratings
* Adding a LOC from an investment grade bank produces a rating consistent with the bank's short-term rating
* Restrictive covenant packages (1.20x DSCR vs 1.10x DSCR, additional bonds test, distribution traps) typically move ratings 0-1 notches
* Sponsor equity sizing (30% vs 20%) typically moves ratings 0-1 notches
* Construction completion guaranty (full guarantee vs cost overrun guaranty) moves ratings during construction phase
* Operating period support agreements (parent operating company support) move ratings during ramp-up

## **Appendix C — NAICS Cross-Reference**

This appendix maps the major bond-relevant sectors to their NAICS (North American Industry Classification System) codes. NAICS codes are used in regulatory filings, SBA programs, USDA programs, and various federal programs. Mapping deals to NAICS codes helps with eligibility analysis for federal guarantee programs and with sector classification for the platform's intelligence layer.

|  |  |  |
| --- | --- | --- |
| **Sector** | **NAICS Code** | **Description** |
| Hospitals | 622110 | General Medical and Surgical Hospitals |
| Specialty hospitals | 622310 | Specialty (except Psychiatric and Substance Abuse) Hospitals |
| Continuing Care Retirement Communities | 623311 | Continuing Care Retirement Communities |
| Assisted Living facilities | 623312 | Assisted Living Facilities for the Elderly |
| Skilled Nursing | 623110 | Nursing Care Facilities (Skilled Nursing Facilities) |
| Charter schools | 611110 | Elementary and Secondary Schools |
| Higher education | 611310 | Colleges, Universities, and Professional Schools |
| Affordable multifamily housing | 531110 | Lessors of Residential Buildings and Dwellings |
| Market-rate multifamily housing | 531110 | Lessors of Residential Buildings and Dwellings |
| Hotels and hospitality | 721110 | Hotels (except Casino Hotels) and Motels |
| Data centers | 518210 | Computing Infrastructure Providers, Data Processing, Web Hosting |
| Solid waste disposal | 562212 | Solid Waste Landfill |
| Sewage facilities | 221320 | Sewage Treatment Facilities |
| Water utilities | 221310 | Water Supply and Irrigation Systems |
| Electric power generation | 221110 | Electric Power Generation |
| Airports | 488119 | Other Airport Operations |
| Manufacturing (general) | 31-33 | Manufacturing (varies by specific industry) |
| Cannabis cultivation | 111419 | Other Food Crops Grown Under Cover (federal categorization) |
| Cannabis retail | 453998 | All Other Miscellaneous Store Retailers (federal categorization) |

## **Appendix D — Regulatory Citation Quick Reference**

This appendix consolidates the major regulatory citations referenced throughout the document. Each citation is paired with a plain-English summary of what the citation governs.

### **Internal Revenue Code (IRC) Sections**

**IRC §103 —** Exempts state and local government bond interest from federal income tax. The foundational tax-exempt bond statute.

**IRC §141 —** Defines private activity bonds. More than 10% of proceeds benefiting private parties triggers PAB classification.

**IRC §142 —** Defines exempt facility bonds and the permitted facility categories (airports, residential rental, sewage, solid waste, etc.).

**IRC §142(d) —** Defines qualified residential rental project tests — the 20/50 or 40/60 affordability tests for multifamily PABs.

**IRC §145 —** Defines qualified 501(c)(3) bonds — the most common middle-market tax-exempt bond category.

**IRC §146 —** Establishes volume cap rules and per-state allocation formula for private activity bonds.

**IRC §147 —** Establishes requirements for private activity bonds — TEFRA hearings, public approval, maturity limits.

**IRC §147(f) —** Specifically requires the TEFRA public approval process before PAB issuance.

**IRC §148 —** Arbitrage rules — yield restriction, rebate, reserves. The compliance backbone for tax-exempt bonds.

**IRC §148(d) —** Establishes the safe harbor maximum DSRF sizing — lesser of MADS, 125% of average debt service, or 10% of bond proceeds.

**IRC §149 —** Miscellaneous restrictions — registration requirements, federally guaranteed bonds limitations.

**IRC §150 —** Definitions and special rules applicable to tax-exempt bonds.

**IRC §144(a) —** Qualified small issue manufacturing bonds — $10M cap per project, AMT-eligible.

**IRC §7871 —** Tribal Economic Development Bonds — authority for federally recognized tribes to issue tax-exempt bonds.

### **Securities Laws**

**Securities Act of 1933 (the 33 Act) —** Governs public offerings of securities; establishes the registration requirement and disclosure framework.

**Securities Exchange Act of 1934 (the 34 Act) —** Governs secondary trading and the securities markets; establishes SEC as federal securities regulator.

**Rule 144A (under the 33 Act) —** Permits sales of securities to Qualified Institutional Buyers without full SEC registration. Most common middle-market private placement pathway.

**Rule 144 (under the 33 Act) —** Governs resale of restricted securities; provides the safe harbor for 144A resales.

**Regulation D (under the 33 Act) —** Contains private placement safe harbors — Rule 504, Rule 506(b), Rule 506(c).

**Rule 506(b) —** Permits Reg D sales to unlimited accredited investors plus up to 35 sophisticated non-accredited investors; no general solicitation.

**Rule 506(c) —** Permits Reg D sales only to accredited investors but allows general solicitation; requires verification of accredited status.

**Regulation S (under the 33 Act) —** Governs offshore securities offerings to non-US investors.

**Rule 15c2-12 (MSRB) —** Continuing disclosure requirements for municipal bonds. Requires CDA and EMMA filings throughout the bond's life.

**Dodd-Frank Act Section 975 —** Created the Municipal Advisor regulatory category; established MA fiduciary duty to municipal entity clients.

**Tax Cuts and Jobs Act of 2017 —** Eliminated tax-exempt advance refunding (current refundings within 90 days still permitted); other tax-exempt bond changes.

### **MSRB Rules**

**MSRB Rule G-37 (Pay-to-Play) —** Prohibits MA and dealer firms from doing business with state and local government entities to which they have made political contributions above defined thresholds.

**MSRB Rule G-42 —** Sets the fiduciary duty and conduct standards for Municipal Advisors.

**MSRB Rule G-17 (Fair Dealing) —** Requires MAs and dealers to deal fairly with all persons and not engage in deceptive practices.

**MSRB Rule G-44 —** Supervision requirements for municipal advisor firms.

### **Federal Programs**

**USDA Business and Industry (B&I) Loan Guarantee —** USDA guarantees up to 80% of loans to rural businesses (defined population thresholds).

**USDA Community Facilities Program —** USDA guarantees loans for essential community facilities in rural areas (healthcare, fire stations, schools, libraries, etc.).

**FHA Section 221(d)(4) —** FHA insurance for new construction and substantial rehabilitation of multifamily rental housing.

**FHA Section 223(f) —** FHA insurance for refinancing or acquisition of existing multifamily properties (no construction).

**FHA Section 232 —** FHA insurance for senior living facilities — skilled nursing, assisted living, intermediate care.

**FHA Section 242 —** FHA insurance for hospital projects.

**Ginnie Mae (GNMA) Wrap —** Government National Mortgage Association guarantees mortgage-backed securities backed by federally insured mortgages.

## **Appendix E — Counterparty Reference**

This appendix identifies the major counterparties in the middle-market bond ecosystem by role. The list is illustrative rather than exhaustive — firms enter and exit the market over time, and counterparty selection depends on deal-specific factors. The platform's intelligence layer maintains current counterparty data; this reference provides the baseline.

### **Broker-Dealer Partners (Middle-Market Focus)**

Major middle-market and specialty bond broker-dealers — Piper Sandler, Stifel Financial, Hilltop Securities, Raymond James, BOK Financial Securities, RBC Capital Markets, Robert W. Baird, Janney Montgomery Scott, B.C. Ziegler (specialty in healthcare and senior living), HJ Sims (specialty in senior living), and various regional and specialty firms. Selection depends on sector expertise, buyer relationships, and pricing competitiveness.

### **Bond Counsel Firms**

Major bond counsel firms — Orrick Herrington & Sutcliffe, Hawkins Delafield & Wood, Squire Patton Boggs, Norton Rose Fulbright, Kutak Rock, Chapman and Cutler, Mintz, Greenberg Traurig, Ballard Spahr, Hunton Andrews Kurth, McCall Parkhurst & Horton (Texas), Stradling Yocca Carlson & Rauth (California), and regional firms by jurisdiction.

### **Trustee Banks**

Major trustee banks — U.S. Bank, BNY Mellon, Wilmington Trust, UMB Bank, Zions Bank, Computershare Trust Company, Regions Trust, Truist (formerly BB&T/SunTrust). Selection depends on sector experience, fee competitiveness, and operational quality.

### **Rating Agencies**

The five NRSROs — Moody's Investors Service, S&P Global Ratings, Fitch Ratings, Kroll Bond Rating Agency (KBRA), DBRS Morningstar. Sector-specific patterns: Moody's and S&P dominate most sectors; Fitch frequent as a third rating; KBRA dominant in charter schools and active in senior living and healthcare specialty sectors; DBRS growing in CMBS and structured finance.

### **Bond Insurers (Active)**

Currently active bond insurers — Assured Guaranty (AGM, AGC), Build America Mutual (BAM), Berkshire Hathaway Assurance. Smaller monoline insurers exist for niche segments.

### **LOC-Providing Banks**

Major banks active in muni LOC market — JPMorgan Chase, Bank of America Merrill Lynch, Wells Fargo, US Bank, Citi, BNY Mellon, PNC Bank, TD Bank, Royal Bank of Canada, Mizuho, MUFG.

### **Feasibility Consultants (by Major Sector)**

**Senior Living —** Kaufman Hall, Plante Moran, Ziegler, CliftonLarsonAllen, SmithGroup, Continuum Development Services.

**Affordable Housing —** Novogradac, Reznick Group, CohnReznick, Plante Moran.

**Hospitals/Healthcare —** Kaufman Hall, Crowe, BDO USA, Vizient Advisory Solutions, ECG Management Consultants.

**Charter Schools —** EdTec, Charter School Capital, Building Hope, IFF.

**Hospitality —** STR Inc., HVS, CBRE Hotels Advisory, Pinnacle Advisory Group.

**Data Centers —** Cushman & Wakefield Data Center Advisory, JLL Data Centers, CBRE Data Center Solutions.

**Solid Waste —** SCS Engineers, GBB Solid Waste Management Consultants, HDR Engineering.

### **Construction Monitors / Independent Engineers**

Major construction monitoring firms — Partner Engineering and Science, EMG, ECS Limited, Adams Engineering, Inspection Services Inc., Crawford and Company, Construction Risk Management.

### **Verification Agents**

Robert Thomas CPA, Causey Demgen & Moore, Bingham Arbitrage Rebate Services, Grant Thornton, Crowe LLP.

### **Dissemination Agents**

Digital Assurance Certification (DAC), Lumesis, BLX (Bond Logistix), Acacia Financial Group, and most major trustee banks as part of their administration services.

## **Appendix F — Universal Credit Policy Framework**

This appendix sets out the firm's universal credit policy framework. The policy applies across all sectors as the baseline credit underwriting framework. Sector-specific overlays (when sub-industry silos earn them) add to this baseline rather than replacing it. Exceptions to the universal policy require approval per the firm's exception authority framework.

### **F.1 — Credit Policy Purpose**

The universal credit policy exists to establish consistent credit standards across the firm's deal flow, to ensure that credit decisions are made within defined risk parameters, and to provide the operating logic for the Senior Credit Underwriter Agent on the Credit Underwriting Desk. The policy is the standard against which every deal is evaluated; deviations require documented justification and appropriate approval.

### **F.2 — Sponsor Standards**

Universal sponsor standards apply to every deal regardless of sector:

* Sponsor entity must be in good standing in its state of formation
* Sponsor must clear KYC/AML screening, OFAC sanctions screening, and PEP screening
* Sponsor principals must have at least seven years of relevant industry experience for new construction deals; three years for stabilized acquisitions or refinancings
* Sponsor must demonstrate financial capacity to fund required equity contribution plus reasonable cushion
* Sponsor's prior project history must show no material default or workout in the past five years (exceptions require explicit approval)
* Sponsor's tax filings must be current; no unresolved tax disputes above defined materiality threshold
* Sponsor litigation history must be reviewed; material adverse litigation requires explicit approval

### **F.3 — Financial Standards**

Universal financial standards apply with sector-specific calibration:

* Minimum DSCR (or MADS coverage) at stabilization — sector-calibrated, generally 1.20x as universal floor
* Minimum debt yield at stabilization (where applicable) — sector-calibrated, generally 8% as universal floor
* Maximum leverage (debt to total capitalization) — sector-calibrated, generally 80% as universal ceiling
* Minimum sponsor equity contribution — sector-calibrated, generally 20% of total project cost as universal floor
* Debt service reserve fund — generally MADS unless reduced by IRC §148(d) safe harbor formula
* Operating reserve — sector-calibrated, generally 3 months of operating expenses at stabilization as universal floor
* Days cash on hand at stabilization — sector-calibrated where the metric applies

### **F.4 — Structural Standards**

Universal structural standards govern deal architecture:

* Senior secured position — bondholders have first lien on primary collateral; subordinate debt allowed only when senior coverage maintained
* Maturity profile — long-tail bonds (30-year typical for tax-exempt revenue; 5-30 year range for taxable corporate) with appropriate call protection
* Covenant package — DSCR (or MADS coverage), additional bonds test, distribution restrictions, reporting requirements at minimum
* Cash sweep at low coverage — trigger when DSCR falls below 1.20x or sector-calibrated threshold
* Permitted indebtedness limitations — bondholders must approve material new debt above defined thresholds

### **F.5 — Project Standards (New Construction)**

For new construction deals, additional project-specific standards apply:

* Capitalized interest reserve fully covering construction period interest plus 15-25% cushion
* Construction budget contingency of at least 5% of hard costs (sector-calibrated upward)
* Sponsor equity contribution funded in cash at closing (or per defined construction draw schedule)
* Construction monitor engagement with milestone inspection requirements
* Builder's risk insurance with appropriate coverage limits and Nest-required endorsements
* Performance and payment bonds from the general contractor (where required by sector standards)
* Substantial completion deadline with appropriate cushion before debt service conversion

### **F.6 — Project Standards (Stabilized)**

For stabilized acquisition or refinancing deals:

* Operating history demonstrating consistent performance (minimum 2-3 years stabilized at sector-calibrated standards)
* Trailing 12-month financial performance meeting all underwriting metrics
* Current period performance confirming trailing-period assumptions
* Market study supporting demand and pricing assumptions
* Property condition assessment for real estate-backed deals
* Environmental Phase I (and Phase II if indicated) for real estate-backed deals

### **F.7 — Continuing Standards**

Standards that apply throughout the bond's life:

* Annual audited financial statements with going concern review
* Quarterly unaudited financial statements with covenant compliance certification
* Annual continuing disclosure filing through EMMA (per Rule 15c2-12)
* Material event notice filing within 10 business days of triggering event
* Insurance coverage maintenance per indenture requirements
* Reserve fund maintenance per indenture requirements
* Tax compliance certifications (for tax-exempt bonds)

### **F.8 — Exception Authority**

Deviations from the universal credit policy require exception authority approval. The exception framework:

* Minor deviations (within sector norms, well-supported) — Senior Credit Underwriter Agent may approve with documentation
* Moderate deviations — escalation to Chief Credit Officer function (In-House Counsel / Chief Compliance Officer Agent and founders)
* Material deviations — escalation to founders for explicit approval
* Policy-level changes — founders may modify the universal credit policy; modifications documented and applied prospectively

### **F.9 — Credit Policy Review**

The universal credit policy is reviewed at defined intervals to ensure it reflects current market conditions and firm experience:

* Quarterly review by Senior Credit Underwriter Agent of policy compliance across deal flow
* Annual review by founders of policy parameters, threshold calibration, and sector overlays
* Triggered review when material exceptions exceed defined frequency (suggesting policy parameters need adjustment)
* Triggered review when portfolio surveillance identifies systemic credit issues

# **THE CLAUDE CODE INGESTION PROMPT**

This section is the structured prompt for ingestion into Claude Code by the firm's engineering team. The prompt converts this Operating Framework into actionable engineering directives. The engineering team feeds this prompt (along with the full Operating Framework document) into Claude Code and uses Claude Code to build the platform against the framework's specifications.

## **Prompt Header — Identity and Context**

Copy the block below verbatim into Claude Code as the system prompt or initial instruction. The block establishes Claude Code's identity, its operating context, and the framework it implements against.

**CLAUDE CODE SYSTEM PROMPT — COPY VERBATIM:** You are working as the primary engineering AI for Nest Advisors, a digital commercial investment bank co-founded by Sean Gilmore and Josh Edwards. The firm's lead product is bond lending — origination, structuring, placement, and 30-year administration of middle-market bonds across investment grade and select non-investment grade categories, in tax-exempt and taxable formats. The firm operates as a hybrid AI-and-human workforce: AI agents perform the operational layer; the founders and any senior team perform the relationship and judgment layer. You are building the platform that runs this firm. The complete operating framework is provided in the accompanying document, the Nest Operating Framework v1. Your job is to operationalize the platform against the framework's specifications.

## **Prompt Section 1 — Existing Platform Inventory**

The Nest platform exists today with substantial components built out. Treat the existing platform as the foundation and extend it rather than rebuilding. The existing components include:

* Bond Desk section with EDGAR integration and analytical capability
* Surety Desk section with credit enhancement capability
* Compliance layer with regulatory and policy enforcement framework
* Documents (Docs) section with template library and drafting capability
* Tools platform with underlying analytical infrastructure
* Admin dashboard for founders and team
* Real estate section with real estate-specific capability
* User tiers — owner, user, investor access control
* Night Vision — buyer pool and outreach intelligence
* Eagle Eye — business development with M&A signaling and IPO readiness
* Intelligence layers with wired APIs for public data ingestion
* Approximately twenty-five AI agents deployed across the platform

Before building any new capability, audit the existing platform to identify which existing components map to the framework's specifications and which gaps require new build. Existing components should be extended, not replaced, unless extension is structurally infeasible.

## **Prompt Section 2 — Build Priorities (Sequenced)**

Build priorities are sequenced to deliver platform capability matching the framework's structure. Execute in this order:

### **Build Priority 1 — Orca Digital C-Suite Layer**

Deploy the six Orca agents (CEO, CFO, COO, CTO, Head of BD, In-House Counsel/Compliance) on top of the existing admin dashboard. Each Orca agent has defined inputs, outputs, and reporting relationships per Part 4.1.2 of the Operating Framework. Orca provides the executive coordination layer above the operational desks. Orca's first deliverable is producing the weekly firm review, the monthly financial report, and the quarterly strategic review per the operating cadence defined in Part 4.15.5.

### **Build Priority 2 — Bond Desk Four-Role Agent Structure**

Formalize the Bond Desk's four-role agent structure (MD, VP, Associate, Analyst) per Part 4.2 of the Operating Framework. Audit which existing agents map to which role. Deploy missing roles, particularly the MD Agent if no existing agent performs that senior coordination function. Define the handoffs between the four roles and to the adjacent desks (Credit Underwriting, Structuring, Rating, Documents, Placement, Operations).

### **Build Priority 3 — Credit Underwriting Desk and Universal Credit Policy**

Deploy the Credit Underwriting Desk per Part 4.3 of the Operating Framework. Operationalize the Universal Credit Policy Framework (Appendix F) as the Senior Credit Underwriter Agent's operating logic. Build the credit memo production capability with sector-aware template adaptation. Build the credit committee package production capability. Implement the exception escalation framework per Part F.8 of the Operating Framework.

### **Build Priority 4 — Moody's and S&P Methodology Mirror Agents**

Deploy the Moody's Methodology Mirror Agent and S&P Methodology Mirror Agent within the Rating Desk per Part 4.5 of the Operating Framework. These are the firm's signature capability. The Mirror Agents apply the actual published methodologies of Moody's and S&P to each deal to predict the rating outcome before formal agency engagement. The build requires ingesting and structuring the published methodologies, building the scorecard application logic, and validating against historical rating outcomes.

### **Build Priority 5 — Documents Desk and Template Libraries**

Formalize the Documents Desk per Part 4.6 of the Operating Framework. Extend the existing Docs section with the three-agent role structure (Documents Lead Agent, Documents Drafting Agent, Documents Version Control Agent). Build out the sector template libraries starting with the most common deal types (501(c)(3) hospital revenue bonds, multifamily PABs, senior living revenue bonds, taxable corporate bonds).

### **Build Priority 6 — Legal and Compliance Desk Sub-Agent Structure**

Formalize the Legal and Compliance Desk's ten sub-agent structure per Part 4.7 of the Operating Framework. Extend the existing compliance layer to formalize each specialized role: Transaction Counsel Agent, Regulatory Compliance Agent, Securities Law Compliance Agent, Tax Compliance Agent, Continuing Disclosure Compliance Agent, KYC and AML Agent, Conflicts and Ethics Agent, Litigation and Dispute Agent, Document Retention Agent.

### **Build Priority 7 — Trustee Liaison Desk Formalization**

Formalize the Trustee Liaison Desk's five-agent structure per Part 4.8 of the Operating Framework. Build out the trustee relationship database. Build out the trustee fee benchmarking capability. Implement the trustee performance tracking.

### **Build Priority 8 — Construction Risk Management Desk (Excluding Card Platform)**

Formalize the Construction Risk Management Desk's twelve-agent structure per Part 4.9 of the Operating Framework. Build the draw processing workflow, budget vs actual tracking, schedule monitoring, change order management, lien monitoring, insurance verification, and sponsor equity tracking. The commercial card platform itself is technically deferred pending patent counsel review; build the operational framework that the card platform will integrate into when the implementation specification is finalized.

### **Build Priority 9 — Insurance, Surety, and Credit Enhancement Desk**

Extend the existing Surety Desk to cover the full range of enhancement types per Part 4.10 of the Operating Framework. Deploy the five enhancement-type agents (Enhancement Strategy, LOC Bank Liaison, Bond Insurer Liaison, Surety Liaison, Federal Guarantee Programs).

### **Build Priority 10 — Placement Desk and Night Vision Integration**

Formalize the Placement Desk per Part 4.11 of the Operating Framework. Integrate Night Vision with the placement workflow. Deploy the Pricing Analyst Agent with comparable transaction pricing analysis. Deploy the BD Partner Interface Agent.

### **Build Priority 11 — Operations Desk Formalization**

Formalize the Operations Desk per Part 4.12 of the Operating Framework. Build the Debt Service Administration Agent with calculation logic per indenture type. Build the Compliance Agent with EMMA filing integration. Build the Covenant Monitoring Agent with quarterly testing workflow.

### **Build Priority 12 — Surveillance Desk and Refunding Pipeline**

Formalize the Surveillance Desk per Part 4.13 of the Operating Framework. Deploy the Refunding Identification Agent with NPV calculation engine. Deploy the Restructuring Opportunity Agent. Deploy the Risk Re-Rating Agent leveraging the Mirror Agents. Deploy the Workout Support Agent.

### **Build Priority 13 — Business Development Organization Formalization**

Formalize the BDO per Part 4.14 of the Operating Framework. Extend Eagle Eye with the formalized agent structure. Deploy the Outreach Agent with campaign management. Deploy the Pipeline Tracking Agent with analytics. Deploy the Conference and Brand Presence Agent.

### **Build Priority 14 — Cross-Desk Workflow Integration**

Once individual desks are operational, integrate the cross-desk workflows per the handoff specifications in Part 4 of the Operating Framework. Each deal flows through defined desk-to-desk handoffs from BDO origination through Bond Desk execution through closing through Operations administration through Surveillance ongoing oversight. The integration ensures clean handoffs at each transition point.

### **Build Priority 15 — Tutorial / Gate / Wrap-Up Architecture**

Implement the tutorial / gate / wrap-up architecture per Part 6.4 of the Operating Framework. Every significant decision point in the platform produces a tutorial explanation, a gate that prevents proceeding without acknowledgment, and a wrap-up that documents the decision. This architecture makes the platform self-teaching for human users and self-documenting for audit purposes.

## **Prompt Section 3 — Architectural Constraints**

The platform must satisfy the following architectural constraints throughout the build:

* Agent roles must map cleanly to institutional counterpart roles per the mirroring principle (Part 4 of the Operating Framework)
* Each desk's handoffs must be explicitly defined with clear inputs and outputs
* Exception escalation must follow the framework's escalation paths
* Universal credit policy must apply to every deal with sector overlays added rather than replacing
* Sub-industry silos earn dedicated capability only after meeting volume criteria (Part 5.2)
* EMMA and EDGAR ingestion must feed every desk's analytical functions
* The intelligence layer must continuously improve through pattern recognition across processed deals
* The construction card platform implementation is technically deferred pending patent counsel review
* Tech stack cost analysis, API call modeling, modeling methodology, and coding lift estimation are deferred to a future iteration

## **Prompt Section 4 — What Is Deferred for Future Iteration**

Several items are explicitly deferred to subsequent iterations of this document. Do not attempt to build these capabilities against the current v1 framework:

* Commercial card construction draw platform technical implementation (pending patent counsel review)
* Detailed tech stack cost analysis and API call volume modeling
* Detailed financial modeling methodology specification
* Detailed engineering coding lift estimation
* Sector-specialized agent overlays for sub-industries that have not yet earned silo treatment per Part 5

Subsequent iterations of this document will refine these items as platform learning accumulates and as the deal pipeline produces concrete sector concentrations. Each deferral is about deepening the bond capability, not about adding new product lines. Nest's product is bond lending; the deferrals make the bond lending capability deeper, not broader.

## **Prompt Section 5 — How to Work Through the Build**

Recommended working pattern when executing the build priorities:

* Read the relevant section of the Operating Framework first; do not build before reading the specification
* Audit the existing platform component before proposing new build; identify what extends versus what is new
* Build incrementally — small focused changes rather than large rewrites
* Show before/after for every change; do not change code without explaining the diff
* One change at a time; do not bundle multiple changes into a single change
* Verify each change works before moving to the next change
* Document changes against the build priority they advance
* Escalate to founders when build decisions exceed engineering scope (architecture decisions, sector overlay decisions, exception framework adjustments)

## **Prompt Section 6 — Output Expectations**

For every working session with Claude Code on the Nest platform, the expected outputs are:

* Specific code changes with before/after diffs
* Reference to the build priority advanced
* Reference to the framework section the change implements
* Identification of any framework gaps or ambiguities encountered (for founder resolution)
* Verification that the change does not regress existing platform capability
* Update to the build status tracker (which priorities are complete, in progress, blocked)

This Operating Framework provides the spine. Claude Code translates the spine into operational platform capability through the engineering team. The framework and the platform are designed to work together — the framework defines what the platform does; the platform implements what the framework specifies.

## **Prompt Section 7 — Founder Decision Points During Build**

Several decision points require founder input during the build. When these decision points emerge, pause the build and surface the decision to the founders rather than making the decision unilaterally:

* Universal credit policy modifications (parameter changes, sector overlay additions)
* Sub-industry silo promotion or demotion decisions
* Exception authority threshold adjustments
* Counterparty selection at the firm level (BD partner relationships, trustee bank relationships)
* Capital allocation decisions for platform development
* Regulatory positioning at the executive level
* Construction card platform implementation (post patent counsel review)

These decisions are inherently human decisions. The two principals own them. The platform supports the decisions; it does not make them autonomously. The platform also does not propose hiring additional principals or staff under any circumstances — Nest is two principals plus the platform, permanently.

# **CLOSING**

This document is the Nest Operating Framework v1. It establishes the firm's structural spine and operating manual. The platform implements against this framework. The two principals operate within this framework. The agent workforce executes operational work within this framework.

Subsequent iterations of this document will refine the bond lending capability as platform learning accumulates and as deal experience deepens. The framework is designed to evolve with the firm's bond capability while preserving the structural identity: two principals, the agent workforce, bond lending as the product, the platform as the moat.

*Nest is two principals and a platform. The platform does the operational work of a 40-person firm. The two principals do the relationships, the judgment, and the selling of bonds. We do more deals, more profitable, more often. When we hit capacity, we raise minimums. We do not hire. The platform is the moat. The moat is internal. The two-principal structure is the long-term identity.*

— Sean Gilmore and Josh Edwards, Co-Founders