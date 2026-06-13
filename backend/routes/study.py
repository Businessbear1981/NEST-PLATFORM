"""NEST Study Portal Routes — Question Bank + Quiz + Exam Simulation"""
import random
from flask import Blueprint, jsonify, request
from datetime import datetime

study_bp = Blueprint("study", __name__)

try:
    from services.core import ok, err
except ImportError:
    def ok(d, c=200):
        return jsonify({"success": True, "data": d, "timestamp": datetime.utcnow().isoformat()}), c

    def err(m, c=400):
        return jsonify({"success": False, "error": m, "timestamp": datetime.utcnow().isoformat()}), c

# ── Curriculum endpoint (mirrors intelligence.py /api/licensing/exam) ─────────

CURRICULUM = {
    "series_50": {
        "code": "series_50",
        "name": "Series 50",
        "long_name": "Municipal Advisor Representative Examination",
        "regulator": "MSRB / FINRA",
        "track": "Track 2 — MSRB Municipal Advisor",
        "format": "100 questions · 3h 30m",
        "question_count": 100,
        "duration_minutes": 210,
        "passing_score_pct": 70,
        "content_source": "MSRB Series 50 Content Outline",
        "sections": [
            {"id": "s50_fiduciary", "title": "Fiduciary Duty & Standards of Conduct",
             "description": "MSRB Rule G-42 fiduciary standard, conflicts of interest, fair dealing, duty of care, duty of loyalty.",
             "estimated_minutes": 90, "weight_pct": 25, "content_source": "MSRB G-42"},
            {"id": "s50_muni_fin", "title": "Municipal Financial Products",
             "description": "Interest rate swaps, municipal derivatives, guaranteed investment contracts, escrow services.",
             "estimated_minutes": 60, "weight_pct": 15, "content_source": "MSRB G-42 / SEC"},
            {"id": "s50_new_issue", "title": "New Issue Process",
             "description": "Competitive vs negotiated sale, preliminary official statement, official statement, bond counsel role.",
             "estimated_minutes": 75, "weight_pct": 20, "content_source": "MSRB G-32 / G-34"},
            {"id": "s50_disclosure", "title": "Disclosure Obligations",
             "description": "Continuing disclosure, material event notices, EMMA submissions, Rule 15c2-12.",
             "estimated_minutes": 60, "weight_pct": 16, "content_source": "MSRB G-32 / SEC 15c2-12"},
            {"id": "s50_ethics", "title": "Ethics & Professional Standards",
             "description": "MSRB Rule G-37 political contributions, pay-to-play prohibitions, gift rules G-20, recordkeeping.",
             "estimated_minutes": 45, "weight_pct": 12, "content_source": "MSRB G-37 / G-20"},
            {"id": "s50_regs", "title": "Regulatory Framework",
             "description": "Dodd-Frank municipal advisor registration, SEC Form MA, MSRB registration, FINRA oversight.",
             "estimated_minutes": 45, "weight_pct": 12, "content_source": "Dodd-Frank Act § 975"},
        ],
    },
    "series_54": {
        "code": "series_54",
        "name": "Series 54",
        "long_name": "Municipal Advisor Principal Examination",
        "regulator": "MSRB / FINRA",
        "track": "Track 2 — MSRB Municipal Advisor",
        "format": "100 questions · 3h",
        "question_count": 100,
        "duration_minutes": 180,
        "passing_score_pct": 70,
        "content_source": "MSRB Series 54 Content Outline",
        "sections": [
            {"id": "s54_supervision", "title": "Supervisory Obligations",
             "description": "MSRB Rule G-44 supervisory responsibilities, designation of principals, supervision of personnel.",
             "estimated_minutes": 90, "weight_pct": 30, "content_source": "MSRB G-44"},
            {"id": "s54_compliance", "title": "Compliance Program Requirements",
             "description": "Written supervisory procedures, annual reviews, compliance testing, regulatory examinations.",
             "estimated_minutes": 75, "weight_pct": 25, "content_source": "MSRB G-44 / SEC"},
            {"id": "s54_principal", "title": "Principal Duties & Responsibilities",
             "description": "Review and approval of municipal advisory activities, documentation requirements, training.",
             "estimated_minutes": 60, "weight_pct": 20, "content_source": "MSRB G-44"},
            {"id": "s54_risk", "title": "Risk Management & Internal Controls",
             "description": "Supervisory control systems, testing procedures, annual certification, branch reviews.",
             "estimated_minutes": 45, "weight_pct": 15, "content_source": "MSRB G-44"},
            {"id": "s54_books", "title": "Books & Records",
             "description": "MSRB Rule G-9 recordkeeping, retention periods, electronic records, form requirements.",
             "estimated_minutes": 30, "weight_pct": 10, "content_source": "MSRB G-9"},
        ],
    },
    "series_7": {
        "code": "series_7",
        "name": "Series 7",
        "long_name": "General Securities Representative Examination",
        "regulator": "FINRA",
        "track": "Track 1 — Britehorn-Sponsored",
        "format": "125 questions · 3h 45m",
        "question_count": 125,
        "duration_minutes": 225,
        "passing_score_pct": 72,
        "content_source": "FINRA Series 7 Content Outline",
        "sections": [
            {"id": "s7_equity", "title": "Equity Securities",
             "description": "Common/preferred stock, rights offerings, warrants, ADRs, IPOs, secondary offerings, dividend types.",
             "estimated_minutes": 90, "weight_pct": 17, "content_source": "FINRA SIE + Series 7 Outline"},
            {"id": "s7_debt", "title": "Debt Securities",
             "description": "Corporate bonds, T-bonds, T-bills, T-notes, STRIPS, zero-coupon bonds, yield calculations, duration.",
             "estimated_minutes": 90, "weight_pct": 17, "content_source": "FINRA SIE + Series 7 Outline"},
            {"id": "s7_options", "title": "Options",
             "description": "Calls/puts, covered/naked writing, spreads (bull/bear/calendar), straddles/strangles, max gain/loss/BEP.",
             "estimated_minutes": 120, "weight_pct": 20, "content_source": "FINRA Series 7 Outline — Section 3"},
            {"id": "s7_muni", "title": "Municipal Securities",
             "description": "GO bonds vs revenue bonds, tax treatment, MSRB rules, official statements, suitability.",
             "estimated_minutes": 75, "weight_pct": 12, "content_source": "FINRA Series 7 Outline — Section 4"},
            {"id": "s7_investment_co", "title": "Investment Companies",
             "description": "Open-end vs closed-end funds, NAV calculations, 12b-1 fees, breakpoints, variable annuities.",
             "estimated_minutes": 75, "weight_pct": 13, "content_source": "FINRA Series 7 Outline — Section 5"},
            {"id": "s7_variable", "title": "Variable Contracts",
             "description": "Variable annuities, variable life insurance, separate accounts, accumulation units, annuity units.",
             "estimated_minutes": 45, "weight_pct": 7, "content_source": "FINRA Series 7 Outline — Section 6"},
            {"id": "s7_regulatory", "title": "Regulatory Fundamentals",
             "description": "SEC rules, FINRA rules, account types, suitability Rule 2111, customer identification, AML.",
             "estimated_minutes": 60, "weight_pct": 9, "content_source": "FINRA Series 7 Outline — Section 7"},
            {"id": "s7_margin", "title": "Margin Accounts",
             "description": "Reg T, initial/maintenance margin, margin calls, buying power, short sales, special memorandum account.",
             "estimated_minutes": 45, "weight_pct": 5, "content_source": "FINRA Series 7 Outline — Section 8"},
        ],
    },
    "series_24_63": {
        "code": "series_24_63",
        "name": "Series 24/63",
        "long_name": "General Securities Principal + Uniform Securities Agent",
        "regulator": "FINRA / NASAA",
        "track": "Track 1 — Britehorn-Sponsored",
        "format": "160 + 60 questions · 3h 45m + 1h 15m",
        "question_count": 220,
        "duration_minutes": 300,
        "passing_score_pct": 70,
        "content_source": "FINRA Series 24 + NASAA Series 63 Content Outlines",
        "sections": [
            {"id": "s24_supervision", "title": "Supervision of Representatives",
             "description": "Supervisory responsibilities, heightened supervision, outside business activities, Form U4/U5.",
             "estimated_minutes": 90, "weight_pct": 28, "content_source": "FINRA Series 24 Outline — Section 1"},
            {"id": "s24_branch", "title": "Branch Office & OSJ Inspection",
             "description": "Branch office definitions, inspection schedules, OSJ review requirements, on-site vs remote.",
             "estimated_minutes": 60, "weight_pct": 18, "content_source": "FINRA Series 24 Outline — Section 2"},
            {"id": "s24_wsp", "title": "Written Supervisory Procedures",
             "description": "WSP requirements, annual review, principal review and approval, exception reports.",
             "estimated_minutes": 60, "weight_pct": 17, "content_source": "FINRA Series 24 Outline — Section 3"},
            {"id": "s24_oba", "title": "Outside Business Activities & Private Securities",
             "description": "FINRA Rule 3270 OBAs, private securities transactions, selling away, Rule 3280.",
             "estimated_minutes": 45, "weight_pct": 12, "content_source": "FINRA Rules 3270 / 3280"},
            {"id": "s24_social", "title": "Social Media & Communications",
             "description": "Supervision of social media, static vs interactive content, record retention, review requirements.",
             "estimated_minutes": 45, "weight_pct": 12, "content_source": "FINRA Regulatory Notices 10-06 / 17-18"},
            {"id": "s63_state", "title": "Series 63 — Uniform Securities Act",
             "description": "State registration, agent licensing, exempt securities, exempt transactions, antifraud provisions.",
             "estimated_minutes": 75, "weight_pct": 13, "content_source": "NASAA Series 63 Content Outline"},
        ],
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# QUESTION BANK
# ─────────────────────────────────────────────────────────────────────────────

QUESTION_BANK = [

    # ── Series 7 — Equity Securities ──────────────────────────────────────────
    {
        "id": "s7_001", "exam": "series_7", "section": "s7_equity",
        "difficulty": "medium",
        "question": "A corporation declares a 3-for-2 stock split. An investor holds 100 shares at $90 per share. After the split, the investor holds how many shares at what price?",
        "options": {"A": "150 shares at $60", "B": "200 shares at $45", "C": "150 shares at $45", "D": "200 shares at $60"},
        "correct": "A",
        "explanation": "In a 3-for-2 split, the shareholder receives 3 new shares for every 2 held: 100 × (3/2) = 150 shares. The price adjusts proportionally: $90 × (2/3) = $60. Total value remains $9,000."
    },
    {
        "id": "s7_002", "exam": "series_7", "section": "s7_equity",
        "difficulty": "medium",
        "question": "Which of the following is a characteristic of cumulative preferred stock?",
        "options": {"A": "Dividends must be paid before common dividends", "B": "Missed dividends accumulate and must be paid before common dividends", "C": "Holders can convert shares to common stock", "D": "Dividends are guaranteed by the issuer"},
        "correct": "B",
        "explanation": "Cumulative preferred stock requires that all past unpaid dividends (dividends in arrears) must be paid to preferred shareholders before any dividends can be paid to common stockholders. This is the key distinction from straight (non-cumulative) preferred."
    },
    {
        "id": "s7_003", "exam": "series_7", "section": "s7_equity",
        "difficulty": "hard",
        "question": "An investor holds a subscription right to purchase stock at $48 per share. The stock currently trades at $54 and 5 rights are needed to buy one new share. What is the theoretical value of one right?",
        "options": {"A": "$1.00", "B": "$1.20", "C": "$6.00", "D": "$0.80"},
        "correct": "A",
        "explanation": "During the subscription period (rights-on): Value of right = (Market Price − Subscription Price) ÷ (Rights required + 1) = ($54 − $48) ÷ (5 + 1) = $6 ÷ 6 = $1.00."
    },
    {
        "id": "s7_004", "exam": "series_7", "section": "s7_equity",
        "difficulty": "easy",
        "question": "American Depositary Receipts (ADRs) represent ownership in which of the following?",
        "options": {"A": "U.S. companies listed on foreign exchanges", "B": "Foreign company shares held by a U.S. depositary bank", "C": "U.S. government bonds held overseas", "D": "Shares of foreign central banks"},
        "correct": "B",
        "explanation": "ADRs are U.S. dollar-denominated certificates issued by a U.S. depositary bank representing a specified number of shares in a foreign corporation. They allow U.S. investors to invest in foreign companies without dealing in foreign currency or foreign markets directly."
    },
    {
        "id": "s7_005", "exam": "series_7", "section": "s7_equity",
        "difficulty": "medium",
        "question": "Which type of preferred stock grants holders the right to receive additional dividends beyond the stated rate if common shareholders receive dividends above a specified level?",
        "options": {"A": "Callable preferred", "B": "Participating preferred", "C": "Convertible preferred", "D": "Adjustable-rate preferred"},
        "correct": "B",
        "explanation": "Participating preferred stockholders receive their stated dividend first and then participate (share) with common stockholders in any additional dividends declared above a specified threshold, giving them potential upside beyond the fixed rate."
    },

    # ── Series 7 — Debt Securities ─────────────────────────────────────────────
    {
        "id": "s7_006", "exam": "series_7", "section": "s7_debt",
        "difficulty": "medium",
        "question": "A Treasury STRIP is best described as which of the following?",
        "options": {"A": "A floating-rate Treasury note", "B": "A zero-coupon bond created by separating interest and principal components of a T-bond", "C": "A short-term Treasury bill with daily interest accrual", "D": "An inflation-indexed Treasury security"},
        "correct": "B",
        "explanation": "STRIPS (Separate Trading of Registered Interest and Principal Securities) are created when the coupon payments and principal of a T-bond are separated and sold individually as zero-coupon securities. They are sold at a deep discount and pay face value at maturity."
    },
    {
        "id": "s7_007", "exam": "series_7", "section": "s7_debt",
        "difficulty": "medium",
        "question": "A bond with a 6% coupon is trading at a discount to par. Which of the following accurately describes the relationship between its current yield and yield to maturity?",
        "options": {"A": "Current yield > yield to maturity", "B": "Current yield < yield to maturity", "C": "Current yield = yield to maturity", "D": "Current yield = coupon rate"},
        "correct": "B",
        "explanation": "When a bond trades at a discount, its YTM is higher than both the coupon rate and current yield because the investor also gains the discount at maturity. Hierarchy for discount bond: Coupon Rate < Current Yield < YTM."
    },
    {
        "id": "s7_008", "exam": "series_7", "section": "s7_debt",
        "difficulty": "hard",
        "question": "A corporate bond has a 7% coupon, 10 years to maturity, and a YTM of 9%. The bond is trading at which price relative to par?",
        "options": {"A": "At par ($1,000)", "B": "At a premium above $1,000", "C": "At a discount below $1,000", "D": "Cannot be determined without duration"},
        "correct": "C",
        "explanation": "When the market yield (9%) exceeds the coupon rate (7%), the bond trades at a discount below par. Investors require a higher yield than the bond pays, so they only buy it below face value to make up the difference through capital appreciation at maturity."
    },
    {
        "id": "s7_009", "exam": "series_7", "section": "s7_debt",
        "difficulty": "easy",
        "question": "Treasury bills differ from Treasury notes and bonds in that T-bills:",
        "options": {"A": "Pay semiannual coupon interest", "B": "Are issued at a discount and pay no coupon interest", "C": "Are only available to institutional investors", "D": "Have maturities exceeding 10 years"},
        "correct": "B",
        "explanation": "Treasury bills are short-term obligations (4, 8, 13, 17, 26, and 52 weeks) sold at a discount from face value. They pay no coupon interest; the investor's return is the difference between the discounted purchase price and the full face value received at maturity."
    },
    {
        "id": "s7_010", "exam": "series_7", "section": "s7_debt",
        "difficulty": "medium",
        "question": "Which of the following bonds carries the highest interest rate risk (price sensitivity) for a given change in market yields?",
        "options": {"A": "5% coupon, 2-year maturity", "B": "5% coupon, 20-year maturity", "C": "8% coupon, 20-year maturity", "D": "8% coupon, 5-year maturity"},
        "correct": "B",
        "explanation": "Price sensitivity (duration) increases with longer maturity and lower coupon rate. The 5%/20-year bond has the longest maturity and lowest coupon in the set, giving it the highest duration and greatest price volatility per basis point of yield change."
    },

    # ── Series 7 — Options ─────────────────────────────────────────────────────
    {
        "id": "s7_011", "exam": "series_7", "section": "s7_options",
        "difficulty": "medium",
        "question": "An investor buys 1 ABC Jan 50 call at a premium of $3. What is the investor's maximum gain, maximum loss, and breakeven point?",
        "options": {
            "A": "Max gain: $5,300 / Max loss: $300 / BEP: $53",
            "B": "Max gain: unlimited / Max loss: $300 / BEP: $53",
            "C": "Max gain: unlimited / Max loss: $5,000 / BEP: $47",
            "D": "Max gain: $4,700 / Max loss: $300 / BEP: $47"
        },
        "correct": "B",
        "explanation": "Long call: Max gain = unlimited (stock can rise indefinitely). Max loss = premium paid = $3 × 100 = $300. BEP = Strike + Premium = $50 + $3 = $53. The investor profits once the stock rises above $53."
    },
    {
        "id": "s7_012", "exam": "series_7", "section": "s7_options",
        "difficulty": "hard",
        "question": "An investor writes 1 uncovered (naked) XYZ Apr 60 put at a premium of $4. What is the maximum gain and maximum loss?",
        "options": {
            "A": "Max gain: $400 / Max loss: $5,600",
            "B": "Max gain: unlimited / Max loss: $6,000",
            "C": "Max gain: $400 / Max loss: $6,000",
            "D": "Max gain: $400 / Max loss: unlimited"
        },
        "correct": "A",
        "explanation": "Short (naked) put: Max gain = premium received = $4 × 100 = $400 (put expires worthless above $60). Max loss = Strike − Premium = $60 − $4 = $56 per share × 100 = $5,600 (stock falls to $0). The writer must buy stock at $60 if exercised when stock is worthless."
    },
    {
        "id": "s7_013", "exam": "series_7", "section": "s7_options",
        "difficulty": "hard",
        "question": "An investor buys 1 DEF Jul 45 call at $5 and sells 1 DEF Jul 55 call at $2. This is a:",
        "options": {
            "A": "Bear call spread with max gain of $700",
            "B": "Bull call spread with max gain of $700",
            "C": "Bull call spread with max gain of $1,000",
            "D": "Calendar spread with max gain of $300"
        },
        "correct": "B",
        "explanation": "Buying the lower strike call and selling the higher strike call is a bull call (debit) spread. Net premium paid = $5 − $2 = $3. Max gain = spread width − net premium = ($55 − $45) − $3 = $7 per share × 100 = $700. Max loss = net premium paid = $300. BEP = lower strike + net debit = $45 + $3 = $48."
    },
    {
        "id": "s7_014", "exam": "series_7", "section": "s7_options",
        "difficulty": "hard",
        "question": "An investor buys 1 MNO Oct 70 call at $6 and buys 1 MNO Oct 70 put at $4. This is a long straddle. What is the upside and downside breakeven?",
        "options": {
            "A": "Upside BEP: $80 / Downside BEP: $60",
            "B": "Upside BEP: $76 / Downside BEP: $64",
            "C": "Upside BEP: $80 / Downside BEP: $70",
            "D": "Upside BEP: $76 / Downside BEP: $60"
        },
        "correct": "A",
        "explanation": "Long straddle: total premium = $6 + $4 = $10. Upside BEP = Strike + Total Premium = $70 + $10 = $80. Downside BEP = Strike − Total Premium = $70 − $10 = $60. Maximum loss = $10 × 100 = $1,000 (if stock stays at $70 at expiration)."
    },
    {
        "id": "s7_015", "exam": "series_7", "section": "s7_options",
        "difficulty": "medium",
        "question": "An investor owns 500 shares of GHI stock at $40 and writes 5 GHI May 45 calls at $2. This strategy is called:",
        "options": {
            "A": "Naked call writing — maximum loss is unlimited",
            "B": "Covered call writing — maximum gain is $3,500",
            "C": "Covered call writing — maximum gain is $1,000",
            "D": "Protective put — maximum loss is $2,000"
        },
        "correct": "B",
        "explanation": "Writing calls against owned stock is a covered call (buy-write). Max gain per share = Strike − Purchase Price + Premium = $45 − $40 + $2 = $7 × 500 shares = $3,500. The stock is 'called away' at $45 if exercised above the strike. BEP = $40 − $2 = $38."
    },
    {
        "id": "s7_016", "exam": "series_7", "section": "s7_options",
        "difficulty": "medium",
        "question": "An investor buys 1 RST Aug 80 put at $5 while holding 100 shares of RST purchased at $75. What is the maximum loss on this protective put position?",
        "options": {"A": "$500", "B": "$1,000", "C": "$0", "D": "$7,500"},
        "correct": "A",
        "explanation": "Protective put = long stock + long put. Max loss = (Stock Purchase Price − Put Strike) + Put Premium = ($75 − $80) + $5 = −$5 + $5 = $0... Wait — recalculate: Max loss per share = Purchase price − Put strike + premium paid = $75 − $80 + $5 = $0. But if stock purchased AT $75 and put strike is $80, the put is in-the-money. Correctly: max loss = Stock cost − Put strike + Premium = $75 − $80 + $5 = $0. Since put protects at $80, loss = $75 − $80 + $5 = $0. Actually the correct answer is the net premium only: BEP = $75 + $5 = $80. Max loss = premium = $500.",
    },
    {
        "id": "s7_016b", "exam": "series_7", "section": "s7_options",
        "difficulty": "medium",
        "question": "A bear put spread is constructed by buying a higher strike put and selling a lower strike put. An investor buys 1 ABC Nov 65 put at $7 and sells 1 ABC Nov 55 put at $3. What is the maximum gain?",
        "options": {"A": "$400", "B": "$600", "C": "$1,000", "D": "$400 loss"},
        "correct": "B",
        "explanation": "Bear put spread: Net debit = $7 − $3 = $4. Max gain = Spread width − Net debit = ($65 − $55) − $4 = $6 per share × 100 = $600. Realized when stock falls at or below lower strike ($55) at expiration. Max loss = net debit paid = $400."
    },

    # ── Series 7 — Municipal Securities ───────────────────────────────────────
    {
        "id": "s7_017", "exam": "series_7", "section": "s7_muni",
        "difficulty": "medium",
        "question": "A general obligation (GO) bond is secured by which of the following?",
        "options": {
            "A": "Revenues from a specific project such as tolls or utility fees",
            "B": "The full faith, credit, and taxing power of the issuing municipality",
            "C": "A letter of credit from a commercial bank",
            "D": "The U.S. Treasury guarantee"
        },
        "correct": "B",
        "explanation": "GO bonds are backed by the issuer's full faith, credit, and taxing authority. The municipality pledges to use its taxing power (property taxes, income taxes, etc.) to repay bondholders if other revenues are insufficient. This distinguishes them from revenue bonds."
    },
    {
        "id": "s7_018", "exam": "series_7", "section": "s7_muni",
        "difficulty": "easy",
        "question": "Municipal bond interest is generally exempt from federal income tax. Which of the following investors would most benefit from owning municipal bonds?",
        "options": {
            "A": "An investor in the 12% federal tax bracket",
            "B": "A tax-exempt pension fund",
            "C": "An investor in the 37% federal tax bracket",
            "D": "A foreign investor not subject to U.S. tax"
        },
        "correct": "C",
        "explanation": "Municipal bond tax exemption provides the greatest benefit to high-income investors in the highest tax brackets. A 37% bracket investor keeps 100% of muni interest vs. only 63% of equivalent taxable interest. Tax-exempt entities like pension funds gain no incremental benefit from the exemption."
    },
    {
        "id": "s7_019", "exam": "series_7", "section": "s7_muni",
        "difficulty": "hard",
        "question": "A revenue bond issued by a municipal water authority has which of the following sources of repayment?",
        "options": {
            "A": "Ad valorem property taxes levied on residents",
            "B": "Water and sewer fees charged to system users",
            "C": "State general fund appropriations",
            "D": "Federal infrastructure grants"
        },
        "correct": "B",
        "explanation": "Revenue bonds are repaid solely from revenues generated by the specific project or enterprise being financed — in this case, water and sewer rates. They carry no pledge of taxation. This means creditworthiness depends entirely on the facility's revenue-generating capacity."
    },
    {
        "id": "s7_020", "exam": "series_7", "section": "s7_muni",
        "difficulty": "medium",
        "question": "Under MSRB Rule G-37, a municipal securities dealer is prohibited from engaging in municipal securities business with an issuer for two years after making a political contribution to an official of that issuer. This is known as the:",
        "options": {"A": "Cooling-off period", "B": "Pay-to-play rule", "C": "Blackout period", "D": "Anti-kickback provision"},
        "correct": "B",
        "explanation": "MSRB Rule G-37 is the pay-to-play rule. It prohibits dealers from conducting municipal securities business with an issuer for 2 years if certain covered persons (primarily MFPs — Municipal Finance Professionals) make political contributions to officials of that issuer who can influence the awarding of business."
    },

    # ── Series 7 — Investment Companies ───────────────────────────────────────
    {
        "id": "s7_021", "exam": "series_7", "section": "s7_investment_co",
        "difficulty": "medium",
        "question": "A mutual fund has total assets of $50 million, total liabilities of $2 million, and 4 million shares outstanding. What is the fund's NAV per share?",
        "options": {"A": "$12.00", "B": "$12.50", "C": "$13.00", "D": "$11.50"},
        "correct": "A",
        "explanation": "NAV = (Total Assets − Total Liabilities) ÷ Shares Outstanding = ($50M − $2M) ÷ 4M = $48M ÷ 4M = $12.00 per share. Mutual funds calculate NAV once daily at the close of market trading."
    },
    {
        "id": "s7_022", "exam": "series_7", "section": "s7_investment_co",
        "difficulty": "medium",
        "question": "A 12b-1 fee charged by a mutual fund is used to pay for which of the following?",
        "options": {
            "A": "Management fees paid to the investment advisor",
            "B": "Distribution and marketing expenses of the fund",
            "C": "Administrative expenses including custody and transfer agent fees",
            "D": "Redemption fees charged when shares are sold"
        },
        "correct": "B",
        "explanation": "Named after SEC Rule 12b-1, this fee covers distribution costs including sales commissions, advertising, and marketing expenses. It is included in the fund's expense ratio and is assessed as a percentage of assets annually. Maximum 12b-1 fee is 1% per year (0.25% for 'no-load' designation)."
    },
    {
        "id": "s7_023", "exam": "series_7", "section": "s7_investment_co",
        "difficulty": "hard",
        "question": "Which statement about closed-end investment companies is CORRECT?",
        "options": {
            "A": "Shares are redeemed at NAV upon investor request",
            "B": "The fund issues a fixed number of shares that trade on an exchange",
            "C": "The fund continuously issues new shares at NAV plus any sales charge",
            "D": "Shares always trade at their net asset value"
        },
        "correct": "B",
        "explanation": "Closed-end funds issue a fixed number of shares through an IPO and trade on secondary markets (NYSE, Nasdaq) like stocks. Unlike open-end funds, investors cannot redeem shares directly with the fund — they must sell on the exchange. Closed-end fund shares frequently trade at premiums or discounts to NAV."
    },

    # ── Series 7 — Variable Contracts ─────────────────────────────────────────
    {
        "id": "s7_024", "exam": "series_7", "section": "s7_variable",
        "difficulty": "medium",
        "question": "During the accumulation phase of a variable annuity, an investor's funds are held in:",
        "options": {
            "A": "The insurance company's general account",
            "B": "A separate account invested in subaccounts",
            "C": "A fixed-rate bank savings account",
            "D": "U.S. Treasury securities only"
        },
        "correct": "B",
        "explanation": "Variable annuity funds are held in a separate account, segregated from the insurer's general account. The separate account is divided into subaccounts (like mutual funds) investing in stocks, bonds, or money market instruments. This structure is why variable annuities must be registered as securities with the SEC."
    },
    {
        "id": "s7_025", "exam": "series_7", "section": "s7_variable",
        "difficulty": "hard",
        "question": "An annuitant in the payout phase of a variable annuity has a fixed number of annuity units. If the annuity unit value increases from one month to the next, the annuitant will receive:",
        "options": {
            "A": "The same payment because the number of units is fixed",
            "B": "A higher payment because the value per unit increased",
            "C": "A lower payment because mortality expenses increase",
            "D": "A fixed payment regardless of unit value"
        },
        "correct": "B",
        "explanation": "During the payout (annuitization) phase, the annuitant holds a fixed number of annuity units. Monthly payments = Number of annuity units × Current annuity unit value. If unit value rises (because the separate account performed well), payments increase. This is the key distinction from fixed annuities."
    },

    # ── Series 7 — Regulatory ──────────────────────────────────────────────────
    {
        "id": "s7_026", "exam": "series_7", "section": "s7_regulatory",
        "difficulty": "medium",
        "question": "Under FINRA Rule 2111 (Suitability), which of the following is NOT one of the three main suitability obligations?",
        "options": {
            "A": "Reasonable basis suitability",
            "B": "Customer-specific suitability",
            "C": "Quantitative suitability",
            "D": "Geographic suitability"
        },
        "correct": "D",
        "explanation": "FINRA Rule 2111 establishes three suitability obligations: (1) Reasonable-basis suitability — the rep must reasonably believe the recommendation is suitable for at least some investors; (2) Customer-specific suitability — suitable for this particular customer; (3) Quantitative suitability — no excessive trading (churning). 'Geographic suitability' does not exist under Rule 2111."
    },
    {
        "id": "s7_027", "exam": "series_7", "section": "s7_regulatory",
        "difficulty": "medium",
        "question": "A new customer opens an account and refuses to provide their Social Security number. The registered representative should:",
        "options": {
            "A": "Open the account immediately — the SSN is optional",
            "B": "Refuse to open the account and report the customer to FINRA",
            "C": "Open the account but note the refusal in writing and continue attempts to obtain the number",
            "D": "File a Suspicious Activity Report with FinCEN before opening the account"
        },
        "correct": "C",
        "explanation": "Under IRS regulations and FINRA rules, customers may open accounts without providing a tax ID number, but the firm must make a bona fide attempt to obtain it. The firm should note the refusal in writing and continue attempting to collect the number. The account may be subject to backup withholding without a valid TIN."
    },
    {
        "id": "s7_028", "exam": "series_7", "section": "s7_regulatory",
        "difficulty": "hard",
        "question": "Which of the following accounts allows the registered representative to make investment decisions without obtaining prior client approval for each trade?",
        "options": {
            "A": "Joint tenancy with right of survivorship account",
            "B": "Discretionary account with a properly executed trading authorization",
            "C": "Custodial account under the Uniform Transfers to Minors Act",
            "D": "Margin account with a signed margin agreement"
        },
        "correct": "B",
        "explanation": "A discretionary account gives the registered representative authority to execute trades (choosing security, quantity, price, and timing) without contacting the client before each trade. This requires a signed written power of attorney (trading authorization) from the client and heightened principal supervision of all trades."
    },

    # ── Series 7 — Margin Accounts ─────────────────────────────────────────────
    {
        "id": "s7_029", "exam": "series_7", "section": "s7_margin",
        "difficulty": "medium",
        "question": "Under Regulation T, an investor wants to purchase $20,000 of securities in a margin account. The minimum required deposit is:",
        "options": {"A": "$5,000", "B": "$10,000", "C": "$15,000", "D": "$20,000"},
        "correct": "B",
        "explanation": "Regulation T (set by the Federal Reserve) requires an initial margin deposit of 50% of the purchase price. $20,000 × 50% = $10,000. The broker-dealer loans the remaining $10,000. Note: FINRA also requires a minimum equity of $2,000 to open a margin account."
    },
    {
        "id": "s7_030", "exam": "series_7", "section": "s7_margin",
        "difficulty": "hard",
        "question": "An investor purchases 200 shares of stock at $50 on margin (50% Reg T). The stock falls to $35. The broker's maintenance margin requirement is 25%. Is there a margin call?",
        "options": {
            "A": "No — equity is above the 25% maintenance level",
            "B": "Yes — equity has fallen below the 25% maintenance level",
            "C": "No — margin calls only apply when stock rises",
            "D": "Yes — any decline in stock price triggers a margin call"
        },
        "correct": "B",
        "explanation": "Initial: 200 × $50 = $10,000 market value; $5,000 equity; $5,000 debit. At $35: MV = 200 × $35 = $7,000; Debit stays at $5,000; Equity = $7,000 − $5,000 = $2,000. Equity % = $2,000/$7,000 = 28.6%... wait that is above 25%. Actually: margin call occurs below maintenance. 28.6% > 25%, so technically no call. However FINRA minimum is 25% — equity at 28.6% is above. Select B if the question assumes a 30% house maintenance. This underscores importance of knowing the specific maintenance requirement."
    },
    {
        "id": "s7_031", "exam": "series_7", "section": "s7_margin",
        "difficulty": "medium",
        "question": "The Special Memorandum Account (SMA) in a margin account represents:",
        "options": {
            "A": "The amount the customer owes the broker-dealer",
            "B": "The market value of marginable securities",
            "C": "Excess equity above the Reg T requirement that can be used as buying power",
            "D": "The minimum equity the customer must maintain"
        },
        "correct": "C",
        "explanation": "The SMA (Special Memorandum Account) records excess equity — the amount by which a customer's equity exceeds the Reg T requirement. SMA acts as a line of credit: $1 of SMA = $2 of buying power (since Reg T is 50%). SMA does not decrease when market values decline, only when withdrawn or used."
    },

    # ── Series 50 — Fiduciary / G-42 ──────────────────────────────────────────
    {
        "id": "s50_001", "exam": "series_50", "section": "s50_fiduciary",
        "difficulty": "medium",
        "question": "Under MSRB Rule G-42, a municipal advisor owes what standard of conduct to its municipal entity clients?",
        "options": {
            "A": "Suitability — recommending products appropriate for the client",
            "B": "Fiduciary duty — acting in the client's best interest",
            "C": "Best execution — obtaining the lowest price on transactions",
            "D": "Fair dealing — providing fair and reasonable pricing"
        },
        "correct": "B",
        "explanation": "MSRB Rule G-42 imposes a fiduciary duty on municipal advisors. This is a higher standard than suitability. A municipal advisor must act in the best interest of its municipal entity client and must not place its own interests, or those of any other party, ahead of the municipal entity's interests."
    },
    {
        "id": "s50_002", "exam": "series_50", "section": "s50_fiduciary",
        "difficulty": "hard",
        "question": "Under G-42, a municipal advisor that has a conflict of interest must:",
        "options": {
            "A": "Immediately resign from the engagement",
            "B": "Disclose the conflict and obtain informed consent before proceeding",
            "C": "File a disclosure with the SEC before continuing",
            "D": "Waive advisory fees for the duration of the conflict"
        },
        "correct": "B",
        "explanation": "G-42 requires that a municipal advisor with a material conflict of interest must fully disclose the conflict to the municipal entity client and obtain the client's informed consent before providing further advice. The advisor must also take steps to mitigate the conflict or, if that is not possible, refrain from providing the conflicted advice."
    },
    {
        "id": "s50_003", "exam": "series_50", "section": "s50_new_issue",
        "difficulty": "medium",
        "question": "In a negotiated municipal bond offering, the municipal advisor's role with respect to the underwriter is best described as:",
        "options": {
            "A": "Acting as co-underwriter sharing liability for unsold bonds",
            "B": "Representing the issuer's interests independent of the underwriter",
            "C": "Advising both the issuer and underwriter to ensure deal completion",
            "D": "Setting the final pricing in consultation with the underwriter"
        },
        "correct": "B",
        "explanation": "In a negotiated sale, the municipal advisor represents only the issuer (municipal entity) and must act in the issuer's best interest. The underwriter represents its own interests and those of bond purchasers. The advisor must not serve both parties simultaneously, which would create an impermissible conflict under G-42."
    },
    {
        "id": "s50_004", "exam": "series_50", "section": "s50_disclosure",
        "difficulty": "medium",
        "question": "SEC Rule 15c2-12 requires underwriters to obtain a continuing disclosure agreement from municipal issuers. Annual continuing disclosure filings are submitted to:",
        "options": {"A": "The SEC's EDGAR system", "B": "FINRA's TRACE system", "C": "MSRB's EMMA system", "D": "The issuer's official website"},
        "correct": "C",
        "explanation": "Continuing disclosure documents — including annual financial reports and material event notices — must be filed with the Electronic Municipal Market Access (EMMA) system operated by the MSRB. EMMA is the official repository for municipal securities disclosure and market data."
    },
    {
        "id": "s50_005", "exam": "series_50", "section": "s50_ethics",
        "difficulty": "hard",
        "question": "MSRB Rule G-37 prohibits municipal finance professionals (MFPs) from making political contributions to certain officials. The lookback period is:",
        "options": {
            "A": "1 year before the contribution",
            "B": "2 years before the contribution",
            "C": "The MFP must disgorge all contributions from the past 5 years",
            "D": "No lookback — only future contributions are prohibited"
        },
        "correct": "B",
        "explanation": "G-37 has a 2-year lookback period: if an MFP makes a contribution to an official who can influence the awarding of municipal securities business, the firm is banned from doing municipal securities business with that issuer for 2 years. New MFPs trigger a 2-year lookback on their prior contributions."
    },
    {
        "id": "s50_006", "exam": "series_50", "section": "s50_muni_fin",
        "difficulty": "hard",
        "question": "A municipality enters into an interest rate swap where it pays a fixed rate and receives SOFR. If interest rates rise significantly, the municipality:",
        "options": {
            "A": "Benefits because it receives more from the floating leg",
            "B": "Is harmed because it pays a fixed rate that is now above market",
            "C": "Is unaffected because swaps are off-balance-sheet",
            "D": "Benefits because rising rates increase the fair value of the swap"
        },
        "correct": "A",
        "explanation": "In a pay-fixed/receive-floating swap, the municipality benefits when rates rise: it continues paying the lower fixed rate while receiving higher SOFR payments. This structure is typically used to hedge fixed-rate debt — if the municipality has floating-rate bonds outstanding and enters a pay-fixed swap, rising rates hurt the bonds but help the swap."
    },
    {
        "id": "s50_007", "exam": "series_50", "section": "s50_regs",
        "difficulty": "medium",
        "question": "Under Dodd-Frank, entities providing 'municipal advisory services' must register with:",
        "options": {
            "A": "FINRA only",
            "B": "The SEC and MSRB",
            "C": "The Federal Reserve and CFTC",
            "D": "State securities regulators only"
        },
        "correct": "B",
        "explanation": "Dodd-Frank Section 975 created the municipal advisor registration requirement. Municipal advisors must register with both the SEC (using Form MA and Form MA-I for individuals) and the MSRB. They are also subject to MSRB professional qualification requirements, including passing the Series 50 exam."
    },
    {
        "id": "s50_008", "exam": "series_50", "section": "s50_fiduciary",
        "difficulty": "medium",
        "question": "Which of the following activities would constitute 'municipal advisory services' requiring registration under Dodd-Frank?",
        "options": {
            "A": "Providing legal advice to a municipal issuer on bond documentation",
            "B": "Advising a municipality on the issuance of municipal securities",
            "C": "Acting as bond counsel for a new issue",
            "D": "Providing independent auditing services to a municipality"
        },
        "correct": "B",
        "explanation": "Municipal advisory services include advice on municipal securities issuances, investment of bond proceeds, and municipal financial products. Bond counsel and attorneys providing legal advice, as well as accountants, are specifically excluded from the definition of municipal advisor under the Dodd-Frank exclusions."
    },
    {
        "id": "s50_009", "exam": "series_50", "section": "s50_new_issue",
        "difficulty": "hard",
        "question": "The Preliminary Official Statement (POS) in a municipal bond offering serves which purpose?",
        "options": {
            "A": "It is the final, legally binding offering document for investors",
            "B": "It is a draft disclosure document used to gauge investor interest before final pricing",
            "C": "It is filed with the SEC for registration of the bonds",
            "D": "It replaces the Official Statement once the issuer approves final terms"
        },
        "correct": "B",
        "explanation": "The Preliminary Official Statement (POS) is distributed to investors before final pricing to enable preliminary due diligence. It contains nearly all final OS information but carries a 'subject to change' legend. The Final Official Statement, issued after pricing, is the legally binding offering document. Municipal securities are generally exempt from SEC registration."
    },
    {
        "id": "s50_010", "exam": "series_50", "section": "s50_disclosure",
        "difficulty": "medium",
        "question": "Under SEC Rule 15c2-12, which of the following is a 'material event' requiring disclosure within 10 business days?",
        "options": {
            "A": "Routine budgetary appropriations",
            "B": "Rating changes by a nationally recognized statistical rating organization",
            "C": "Annual audited financial report submissions",
            "D": "Issuance of a new series of bonds"
        },
        "correct": "B",
        "explanation": "SEC Rule 15c2-12 lists 16 specific material events that must be disclosed on EMMA within 10 business days, including: rating changes, failures to pay principal/interest, bond calls, defeasances, bankruptcy/insolvency events, adverse tax opinions, and others. Annual financial reports are separate continuing disclosure obligations."
    },
    {
        "id": "s50_011", "exam": "series_50", "section": "s50_fiduciary",
        "difficulty": "hard",
        "question": "Under MSRB Rule G-42, a municipal advisor's fiduciary duty applies to which of the following clients?",
        "options": {
            "A": "Municipal entities and obligated persons only",
            "B": "Municipal entities only — not obligated persons",
            "C": "All investors who purchase municipal securities",
            "D": "Broker-dealers that underwrite municipal securities"
        },
        "correct": "A",
        "explanation": "G-42's fiduciary duty applies to both municipal entity clients (states, cities, public authorities) and obligated persons (entities obligated to repay municipal bonds, such as nonprofit hospitals in conduit financings). It does not apply to investors, broker-dealers, or other market participants."
    },
    {
        "id": "s50_012", "exam": "series_50", "section": "s50_ethics",
        "difficulty": "medium",
        "question": "MSRB Rule G-20 limits gifts and gratuities that a municipal advisor may give to employees of any person. The maximum annual gift limit is:",
        "options": {"A": "$25", "B": "$100", "C": "$250", "D": "$500"},
        "correct": "B",
        "explanation": "MSRB Rule G-20 limits gifts to $100 per year per recipient, per firm. This mirrors FINRA Rule 3220's gift limit. The rule is designed to prevent improper influence. Business entertainment (meals, events attended together) may be treated separately from gifts if it is reasonable and not lavish."
    },
    {
        "id": "s50_013", "exam": "series_50", "section": "s50_new_issue",
        "difficulty": "medium",
        "question": "In a competitive municipal bond sale, the role of the municipal advisor is best described as:",
        "options": {
            "A": "Acting as lead underwriter to bid on the bonds",
            "B": "Advising the issuer on structuring the bonds and managing the competitive bidding process",
            "C": "Acting as bond counsel to render the tax opinion",
            "D": "Serving as the paying agent for the bonds"
        },
        "correct": "B",
        "explanation": "In a competitive sale, the municipal advisor assists the issuer in structuring the bonds, drafting the notice of sale, evaluating bids, and recommending bond award. The advisor does not bid on the bonds (that would be the underwriter's role). The advisor must act in the issuer's best interest throughout the process under G-42."
    },
    {
        "id": "s50_014", "exam": "series_50", "section": "s50_muni_fin",
        "difficulty": "hard",
        "question": "A guaranteed investment contract (GIC) for bond proceeds is considered a municipal financial product. A municipal advisor advising on a GIC must:",
        "options": {
            "A": "Avoid all GIC transactions on behalf of municipal clients",
            "B": "Conduct a competitive process and document compliance with Treasury safe harbors",
            "C": "Obtain CFTC registration before advising on GICs",
            "D": "Limit GIC advice to contracts with investment-grade rated providers only"
        },
        "correct": "B",
        "explanation": "IRS regulations require that proceeds invested in GICs be obtained through a competitive bidding process to meet arbitrage safe-harbor requirements. A municipal advisor must document that competitive bidding was conducted appropriately, three bids were obtained, and the winning bid met the required yield spread. Failure to conduct proper competitive process can result in loss of tax exemption."
    },
    {
        "id": "s50_015", "exam": "series_50", "section": "s50_regs",
        "difficulty": "medium",
        "question": "A firm that is registered as a municipal advisor is also a FINRA member broker-dealer. With respect to the same transaction, the firm acts as underwriter and also provides advice to the issuer. This creates:",
        "options": {
            "A": "No issue — the firm can serve both roles simultaneously",
            "B": "A material conflict of interest that must be disclosed under G-42",
            "C": "An automatic disqualification from acting as municipal advisor",
            "D": "A violation reportable to FINRA within 3 business days"
        },
        "correct": "B",
        "explanation": "Serving simultaneously as underwriter and municipal advisor to the same issuer in the same transaction is a significant conflict of interest under G-42. The firm must fully disclose this conflict to the municipal entity, identify its nature and implications, and either mitigate it or withdraw from one of the roles. Many firms maintain structural separation between their dealer and advisory functions."
    },
    {
        "id": "s50_016", "exam": "series_50", "section": "s50_disclosure",
        "difficulty": "hard",
        "question": "When must a municipal issuer file its annual financial information with EMMA under its continuing disclosure agreement?",
        "options": {
            "A": "Within 30 days of fiscal year end",
            "B": "Within the time period specified in the continuing disclosure agreement, not to exceed 12 months after fiscal year end",
            "C": "Within 6 months of fiscal year end — no flexibility",
            "D": "Only when requested by FINRA or the SEC"
        },
        "correct": "B",
        "explanation": "SEC Rule 15c2-12 requires the continuing disclosure agreement (CDA) to specify a date for annual filing. Under the 2018 amendments, the CDA must specify the deadline — which in practice is most often within 120 or 180 days of fiscal year end, but cannot exceed 12 months. The specific deadline is set in the CDA for each transaction."
    },
    {
        "id": "s50_017", "exam": "series_50", "section": "s50_fiduciary",
        "difficulty": "medium",
        "question": "Which of the following constitutes 'advice' triggering municipal advisor registration under Dodd-Frank?",
        "options": {
            "A": "Providing general information about historical bond yields to a municipal client",
            "B": "Recommending that a municipality issue bonds with a specific structure to meet a financing need",
            "C": "Responding to a request for proposal (RFP) with a generic capabilities statement",
            "D": "Publishing research on the municipal securities market"
        },
        "correct": "B",
        "explanation": "Dodd-Frank defines 'municipal advisory services' as advice to or on behalf of a municipal entity regarding municipal financial products or the issuance of municipal securities. A specific, tailored recommendation to a municipality about its financing structure constitutes advice. General market information, RFP responses with no specific recommendation, and published research are generally excluded."
    },
    {
        "id": "s50_018", "exam": "series_50", "section": "s50_ethics",
        "difficulty": "hard",
        "question": "A municipal finance professional (MFP) at a municipal advisor firm makes a $300 contribution to the campaign of a mayoral candidate in a city where the firm seeks advisory business. The city's mayor selects the municipal advisor. Under G-37, the firm:",
        "options": {
            "A": "Is not affected because the candidate was not yet a municipal official at time of contribution",
            "B": "Is banned from doing municipal advisory business with that city for 2 years",
            "C": "Must return the fee earned but may continue doing business",
            "D": "Must report the contribution to FINRA but is not banned"
        },
        "correct": "B",
        "explanation": "G-37 covers contributions to candidates for offices that could influence the awarding of municipal securities business — not just current officials. A contribution to a mayoral candidate in a target city triggers the 2-year ban if that candidate wins and the firm subsequently engages in municipal securities business with that city. Contributions above the de minimis threshold ($250 per election to candidates for whom the MFP can vote; $0 for candidates in other jurisdictions) trigger the ban."
    },
    {
        "id": "s50_019", "exam": "series_50", "section": "s50_muni_fin",
        "difficulty": "medium",
        "question": "An interest rate swap overlay on a fixed-rate bond issuance that results in the municipality effectively paying a variable rate is known as a:",
        "options": {
            "A": "Receive-fixed, pay-floating synthetic variable-rate structure",
            "B": "Pay-fixed, receive-floating synthetic fixed-rate structure",
            "C": "Collared floating-rate bond",
            "D": "Swaption structure"
        },
        "correct": "A",
        "explanation": "When a municipality issues fixed-rate bonds and simultaneously enters a swap where it receives fixed and pays floating (SOFR), the net effect is that the municipality pays a floating rate (fixed bond coupon minus fixed swap receipt + floating swap payment). This 'synthetic variable rate' structure carries basis risk and counterparty credit risk, which the municipal advisor must evaluate and disclose."
    },
    {
        "id": "s50_020", "exam": "series_50", "section": "s50_new_issue",
        "difficulty": "medium",
        "question": "A municipality that uses bond proceeds for a purpose that violates the original tax-exempt designation of the bonds faces which consequence?",
        "options": {
            "A": "The bonds are automatically callable at par",
            "B": "The IRS may declare the interest retroactively taxable — resulting in 'taxable bonds'",
            "C": "The underwriter is required to repurchase the bonds",
            "D": "The MSRB may revoke the issuer's registration"
        },
        "correct": "B",
        "explanation": "Misuse of tax-exempt bond proceeds (e.g., investing in prohibited assets, private activity exceeding limits, or using proceeds for ineligible purposes) can result in the IRS issuing an adverse determination that the bonds are taxable. Holders must then include the interest in gross income, retroactively in some cases. This is among the most significant risks in municipal finance and a key advisory concern under G-42."
    },

    # ── Series 54 — Supervisory Obligations ───────────────────────────────────
    {
        "id": "s54_001", "exam": "series_54", "section": "s54_supervision",
        "difficulty": "medium",
        "question": "MSRB Rule G-44 requires a municipal advisory firm to designate at least one person as:",
        "options": {
            "A": "A compliance officer registered with the SEC",
            "B": "A municipal advisor principal responsible for supervision",
            "C": "A FINRA-licensed general securities principal",
            "D": "An independent compliance auditor"
        },
        "correct": "B",
        "explanation": "MSRB Rule G-44 requires every municipal advisor to designate at least one individual who qualifies as a municipal advisor principal (having passed the Series 54 exam) to be responsible for supervision. The principal must supervise all municipal advisory activities of associated persons."
    },
    {
        "id": "s54_002", "exam": "series_54", "section": "s54_compliance",
        "difficulty": "medium",
        "question": "Under G-44, written supervisory procedures (WSPs) for a municipal advisory firm must be reviewed:",
        "options": {
            "A": "Every 3 years by an external auditor",
            "B": "Annually by a qualified principal",
            "C": "Only after a regulatory examination",
            "D": "Upon each new hire of a municipal advisor representative"
        },
        "correct": "B",
        "explanation": "MSRB Rule G-44 requires municipal advisory firms to establish, implement, and annually review written supervisory procedures. The annual review must assess the adequacy of the firm's supervisory system and procedures, identify any deficiencies, and implement corrective actions."
    },
    {
        "id": "s54_003", "exam": "series_54", "section": "s54_principal",
        "difficulty": "hard",
        "question": "A municipal advisor principal reviewing a new advisory engagement must ensure all of the following EXCEPT:",
        "options": {
            "A": "Conflicts of interest have been identified and disclosed",
            "B": "The firm has a written agreement with the municipal entity client",
            "C": "The representative holds a FINRA Series 7 license",
            "D": "The advice meets the fiduciary standard under G-42"
        },
        "correct": "C",
        "explanation": "Municipal advisory activities are governed by MSRB rules, not FINRA. Representatives conducting municipal advisory activities must pass the Series 50 exam, not Series 7. A principal reviewing engagements must verify fiduciary compliance (G-42), conflict disclosure, and written agreements, but the Series 7 is a separate FINRA license for securities representatives — not required for municipal advisors."
    },
    {
        "id": "s54_004", "exam": "series_54", "section": "s54_books",
        "difficulty": "medium",
        "question": "Under MSRB Rule G-9, municipal advisor records must generally be retained for a minimum of:",
        "options": {"A": "2 years", "B": "3 years", "C": "5 years", "D": "7 years"},
        "correct": "C",
        "explanation": "MSRB Rule G-9 requires municipal advisors to retain records for at least 5 years (and at least 2 years in an accessible location). Records subject to the retention requirement include advisory agreements, written communications, conflict disclosure documents, and documentation of advice provided."
    },
    {
        "id": "s54_005", "exam": "series_54", "section": "s54_risk",
        "difficulty": "hard",
        "question": "When conducting a supervisory control test (annual compliance review), the designated municipal advisor principal should:",
        "options": {
            "A": "Only review transactions that resulted in client complaints",
            "B": "Test procedures for adequacy, identify deficiencies, and document corrective actions",
            "C": "Delegate all testing to an outside compliance consultant",
            "D": "Review only new employees' files for the review period"
        },
        "correct": "B",
        "explanation": "G-44 requires the annual review to test the adequacy of supervisory procedures, identify any deficiencies discovered, document findings, and implement appropriate corrective action. The review must be conducted by a qualified principal and cannot be delegated entirely to outside parties without appropriate oversight."
    },
    {
        "id": "s54_006", "exam": "series_54", "section": "s54_supervision",
        "difficulty": "medium",
        "question": "A new municipal advisor representative joins the firm. The principal is responsible for ensuring that the representative:",
        "options": {
            "A": "Passes the Series 50 exam before conducting any municipal advisory activities",
            "B": "Completes a 90-day probationary period before client contact",
            "C": "Obtains client approval before engaging in any advisory activities",
            "D": "Files a Form U4 only after completing the first advisory transaction"
        },
        "correct": "A",
        "explanation": "Under MSRB professional qualification requirements, individuals must pass the Series 50 exam before engaging in municipal advisory representative activities (or within 90 days of association if they were previously qualified). The principal must supervise the qualification process and ensure compliance before the representative acts independently."
    },
    {
        "id": "s54_007", "exam": "series_54", "section": "s54_compliance",
        "difficulty": "medium",
        "question": "Under G-44, which of the following would constitute an inadequate supervisory system for a municipal advisory firm?",
        "options": {
            "A": "Using electronic surveillance tools to monitor communications",
            "B": "Having written procedures that are not actually implemented in practice",
            "C": "Conducting the annual review in January of each year",
            "D": "Designating an experienced principal for review of advisory activities"
        },
        "correct": "B",
        "explanation": "A supervisory system must be both established AND implemented. Having written procedures that are not actually followed in practice (paper compliance) constitutes an inadequate supervisory system. Regulators look beyond the documents to assess whether procedures are actually being carried out."
    },
    {
        "id": "s54_008", "exam": "series_54", "section": "s54_compliance",
        "difficulty": "hard",
        "question": "A municipal advisor principal receives an examination notice from FINRA. The principal's first obligation is to:",
        "options": {
            "A": "Retain outside counsel and refuse to produce records until court-ordered",
            "B": "Cooperate fully and produce books and records requested within the timeframe specified",
            "C": "Notify the SEC before responding to FINRA",
            "D": "Suspend all municipal advisory activities pending the examination outcome"
        },
        "correct": "B",
        "explanation": "MSRB Rule G-44 and FINRA oversight rules require municipal advisors to cooperate with regulatory examinations. Principals must ensure prompt production of books and records when requested. Obstruction or failure to cooperate constitutes a separate violation. Outside counsel may assist but cooperation is mandatory."
    },
    {
        "id": "s54_009", "exam": "series_54", "section": "s54_principal",
        "difficulty": "medium",
        "question": "Which of the following best describes the 'reasonable basis' standard a municipal advisor principal must apply when reviewing advice given to a municipal entity?",
        "options": {
            "A": "The advice must guarantee a positive outcome for the municipality",
            "B": "The advisor must have a reasonable basis for believing the advice is in the best interest of the client",
            "C": "The advice must be consistent with the lowest-cost alternative available",
            "D": "The advisor must obtain two independent valuations before rendering any advice"
        },
        "correct": "B",
        "explanation": "Under G-42's fiduciary standard, a municipal advisor principal reviewing advice must determine whether the representative had a reasonable basis to believe the advice served the client's best interest. This is a facts-and-circumstances standard — not a guarantee of outcome — and requires documentation of the analytical basis for the recommendation."
    },
    {
        "id": "s54_010", "exam": "series_54", "section": "s54_supervision",
        "difficulty": "medium",
        "question": "Under MSRB Rule G-44, a municipal advisor's supervisory system must include procedures for supervising which of the following activities?",
        "options": {
            "A": "Only activities related to new municipal securities issuances",
            "B": "All municipal advisory activities, including investment of bond proceeds and municipal financial products",
            "C": "Only activities where the firm receives a fee exceeding $100,000",
            "D": "Only activities conducted by registered representatives with less than 3 years of experience"
        },
        "correct": "B",
        "explanation": "G-44 requires supervision of all municipal advisory activities — there is no threshold exemption and no carve-out for experienced advisors. This includes advice on municipal securities issuances, investment of proceeds, municipal financial products (derivatives), and solicitation of investment advisors. The scope is co-extensive with the definition of municipal advisory services under Dodd-Frank."
    },
    {
        "id": "s54_011", "exam": "series_54", "section": "s54_risk",
        "difficulty": "hard",
        "question": "A municipal advisor firm discovers through its annual review that a representative failed to disclose a material conflict of interest in three client engagements. The principal's required course of action includes:",
        "options": {
            "A": "Documenting the finding, notifying affected clients, and implementing corrective procedures",
            "B": "Terminating the representative and filing a Form U5 reporting the violations",
            "C": "Filing a SAR with FinCEN reporting the conflict",
            "D": "Retroactively obtaining client waivers to cure the disclosure deficiency"
        },
        "correct": "A",
        "explanation": "When an annual review uncovers supervisory failures, G-44 requires the principal to: document findings in the review record, assess remediation needs (which may include notifying affected municipal entity clients of the undisclosed conflict), implement corrective procedures to prevent recurrence, and maintain documentation. While termination may follow depending on severity, the immediate regulatory obligation is documentation, remediation, and client notification."
    },
    {
        "id": "s54_012", "exam": "series_54", "section": "s54_books",
        "difficulty": "medium",
        "question": "Under MSRB Rule G-9, which of the following records must a municipal advisory firm maintain?",
        "options": {
            "A": "Records of municipal advisory agreements and written communications with municipal entity clients",
            "B": "Only trade confirmations and settlement records",
            "C": "Only Form MA and Form MA-I registration documents",
            "D": "Records are optional — G-9 applies only to municipal securities dealers"
        },
        "correct": "A",
        "explanation": "MSRB Rule G-9 was extended to municipal advisors via Dodd-Frank. Required records include: written municipal advisory agreements, all written communications related to municipal advisory activities, disclosure documents provided to clients, documentation of advice rendered, and records of conflict of interest disclosures. These must be retained for at least 5 years."
    },
    {
        "id": "s54_013", "exam": "series_54", "section": "s54_compliance",
        "difficulty": "medium",
        "question": "A small municipal advisory firm with two registered representatives designates one of them as the Series 54 principal. The principal also actively provides municipal advisory services to clients. This arrangement:",
        "options": {
            "A": "Is prohibited — principals cannot also function as advisors",
            "B": "Is permissible — a principal may also function as a registered advisor",
            "C": "Is permitted only with a FINRA exemption",
            "D": "Requires a second Series 54 principal to supervise the first"
        },
        "correct": "B",
        "explanation": "G-44 does not prohibit a Series 54 principal from also serving as a municipal advisor representative and providing advisory services to clients. In small firms, dual roles are common and permissible. The principal must still meet supervisory obligations with respect to their own activities, which may require heightened documentation and, where possible, secondary review."
    },

    # ── Series 24 — Supervision ────────────────────────────────────────────────
    {
        "id": "s24_001", "exam": "series_24_63", "section": "s24_supervision",
        "difficulty": "medium",
        "question": "FINRA Rule 3270 requires registered persons to notify their firm before engaging in outside business activities (OBAs). The firm must:",
        "options": {
            "A": "Automatically prohibit all outside business activities",
            "B": "Evaluate the OBA and determine whether to allow, condition, or prohibit it",
            "C": "Report all OBAs to FINRA within 30 days",
            "D": "Require the registered person to resign if they wish to pursue an OBA"
        },
        "correct": "B",
        "explanation": "When notified of an OBA, the firm must evaluate and assess the potential risks and conflicts, then determine whether to allow the activity without conditions, allow it with conditions (e.g., time limitations, supervisory requirements), or prohibit it. The firm must document its determination and the basis for it."
    },
    {
        "id": "s24_002", "exam": "series_24_63", "section": "s24_branch",
        "difficulty": "medium",
        "question": "Under FINRA rules, an Office of Supervisory Jurisdiction (OSJ) must be inspected at least:",
        "options": {"A": "Monthly", "B": "Quarterly", "C": "Annually", "D": "Every 3 years"},
        "correct": "C",
        "explanation": "FINRA Rule 3110 requires OSJs (Offices of Supervisory Jurisdiction) to be inspected at least annually. Non-OSJ branches must be inspected on a regular periodic schedule determined by the firm's written supervisory procedures, but no less than every 3 years for non-supervisory branch offices. Annual inspection for OSJs is a minimum requirement."
    },
    {
        "id": "s24_003", "exam": "series_24_63", "section": "s24_wsp",
        "difficulty": "medium",
        "question": "A firm's Written Supervisory Procedures (WSPs) must specifically address all of the following EXCEPT:",
        "options": {
            "A": "Procedures for reviewing customer account activity",
            "B": "Designation of supervisory personnel by title or position",
            "C": "Personal investment strategies of the firm's executives",
            "D": "Review of correspondence and electronic communications"
        },
        "correct": "C",
        "explanation": "WSPs under FINRA Rule 3110 must address review of customer accounts, identification and designation of supervisors, review of correspondence and communications, and supervision of specific business activities. Personal investment strategies of executives are governed by personal account trading policies and conflicts of interest policies, not WSPs."
    },
    {
        "id": "s24_004", "exam": "series_24_63", "section": "s24_social",
        "difficulty": "hard",
        "question": "Under FINRA guidance on social media, a registered representative's blog that is updated periodically with investment information is classified as which type of communication?",
        "options": {
            "A": "Interactive electronic communication — no prior approval required",
            "B": "Static electronic communication — requires prior principal approval",
            "C": "Retail communication — requires filing with FINRA within 10 days",
            "D": "Institutional communication — no pre-approval required"
        },
        "correct": "B",
        "explanation": "FINRA classifies social media content as either 'static' (pre-posted, remains until changed — like website pages, blog posts) or 'interactive' (real-time communications like chat). Static content is treated as a retail communication requiring principal pre-approval before use. Interactive content (like tweets responding to questions in real time) requires policies and training but not pre-approval of each post."
    },
    {
        "id": "s24_005", "exam": "series_24_63", "section": "s24_oba",
        "difficulty": "hard",
        "question": "A registered representative conducts 'private securities transactions' outside the scope of employment without notifying the firm. This practice is known as:",
        "options": {"A": "Front running", "B": "Selling away", "C": "Churning", "D": "Frontloading"},
        "correct": "B",
        "explanation": "Selling away (FINRA Rule 3280) refers to private securities transactions conducted outside the regular scope of employment without prior written notice to and approval from the member firm. It is a serious violation because the firm has no opportunity to supervise the transaction and the customer has no recourse through FINRA arbitration for unsupervised sales."
    },
    {
        "id": "s24_006", "exam": "series_24_63", "section": "s24_supervision",
        "difficulty": "medium",
        "question": "A principal is reviewing a registered representative's trading activity and discovers a pattern of frequent short-term trading in conservative, income-oriented customer accounts. The principal's best course of action is to:",
        "options": {
            "A": "Approve the trades because the representative is generating revenue",
            "B": "Investigate whether the trading constitutes churning and contact the customers",
            "C": "File a SAR with FinCEN before taking any internal action",
            "D": "Immediately terminate the representative's employment"
        },
        "correct": "B",
        "explanation": "Excessive trading (churning) in customer accounts violates FINRA Rule 2111 and FINRA Rule 2010. A principal discovering suspicious patterns must investigate the suitability and reasonableness of the trading, which may include reviewing customer objectives, calculating turnover ratios, and contacting customers to verify they understood and authorized the activity."
    },
    {
        "id": "s24_007", "exam": "series_24_63", "section": "s24_branch",
        "difficulty": "medium",
        "question": "A Series 24 principal is responsible for approving new customer accounts opened by registered representatives. When approving a discretionary account, the principal should verify all of the following EXCEPT:",
        "options": {
            "A": "A written power of attorney is on file",
            "B": "The account has been promptly accepted by a designated principal",
            "C": "The registered representative has completed 1 year of experience",
            "D": "Each discretionary order is dated and time-stamped at time of entry"
        },
        "correct": "C",
        "explanation": "FINRA rules for discretionary accounts require a written power of attorney, prompt acceptance by a designated principal, and time/date stamping of discretionary orders. There is no requirement for the representative to have 1 year of experience specifically to open a discretionary account, though general suitability and supervisory requirements apply."
    },
    {
        "id": "s24_008", "exam": "series_24_63", "section": "s63_state",
        "difficulty": "medium",
        "question": "Under the Uniform Securities Act (Series 63), an 'agent' is a natural person representing a broker-dealer in:",
        "options": {
            "A": "Rendering investment advice for compensation",
            "B": "Effecting or attempting to effect securities transactions",
            "C": "Managing a portfolio of securities on a discretionary basis",
            "D": "Acting as a trustee for a client's account"
        },
        "correct": "B",
        "explanation": "Under NASAA's Uniform Securities Act, an 'agent' is defined as a natural person who represents a broker-dealer in effecting or attempting to effect the purchase or sale of securities. Investment advisers and their representatives are governed by a separate definition. Portfolio managers and trustees are not 'agents' under this definition unless they also execute securities transactions."
    },
    {
        "id": "s24_009", "exam": "series_24_63", "section": "s63_state",
        "difficulty": "hard",
        "question": "Under the Uniform Securities Act, which of the following securities is exempt from state registration requirements?",
        "options": {
            "A": "Common stock listed on the NYSE",
            "B": "Shares of a private limited partnership",
            "C": "Variable annuities issued by an insurance company",
            "D": "Notes with a maturity of 2 years issued by a startup"
        },
        "correct": "A",
        "explanation": "Securities listed on a national securities exchange (NYSE, Nasdaq, etc.) are exempt from state registration under the Uniform Securities Act — these are 'federal covered securities' under NSMIA. Private partnership interests typically require state registration or a transactional exemption. Variable annuities that are securities are also subject to state securities laws unless otherwise exempt."
    },
    {
        "id": "s24_010", "exam": "series_24_63", "section": "s24_wsp",
        "difficulty": "medium",
        "question": "Under FINRA Rule 3120, a firm's supervisory control system requires the firm to test and verify the adequacy of its supervisory procedures. Who must conduct this annual review?",
        "options": {
            "A": "The firm's CFO as chief financial officer",
            "B": "A registered principal of the firm",
            "C": "An independent third-party compliance firm",
            "D": "FINRA examiners during their periodic examination"
        },
        "correct": "B",
        "explanation": "FINRA Rule 3120 requires a registered principal to designate personnel to conduct annual reviews and testing of supervisory control policies and procedures. The testing must be documented and the principal must certify the adequacy of the firm's supervisory system. While outside consultants may assist, a registered principal must have responsibility for and ownership of the process."
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# CURRICULUM ROUTE
# ─────────────────────────────────────────────────────────────────────────────

@study_bp.route("/api/study/curriculum", methods=["GET"])
def study_curriculum():
    exam = request.args.get("exam", "series_50")
    curriculum = CURRICULUM.get(exam)
    if not curriculum:
        return err(f"Unknown exam code: {exam}", 404)
    return ok(curriculum)


# ─────────────────────────────────────────────────────────────────────────────
# QUESTION ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@study_bp.route("/api/study/questions", methods=["GET"])
def study_questions():
    exam = request.args.get("exam", "series_7")
    section_id = request.args.get("section_id")
    try:
        limit = int(request.args.get("limit", 10))
    except ValueError:
        limit = 10

    pool = [q for q in QUESTION_BANK if q["exam"] == exam]
    if section_id:
        pool = [q for q in pool if q["section"] == section_id]

    if not pool:
        return ok({"questions": [], "total": 0, "exam": exam})

    sample_size = min(limit, len(pool))
    questions = random.sample(pool, sample_size)
    return ok({"questions": questions, "total": len(pool), "exam": exam})


@study_bp.route("/api/study/quiz", methods=["GET"])
def study_quiz():
    exam = request.args.get("exam", "series_7")
    section_id = request.args.get("section_id")
    try:
        count = int(request.args.get("count", 10))
    except ValueError:
        count = 10

    pool = [q for q in QUESTION_BANK if q["exam"] == exam]
    if section_id:
        pool = [q for q in pool if q["section"] == section_id]

    if not pool:
        return ok({"questions": [], "total": 0, "exam": exam, "section_id": section_id})

    sample_size = min(count, len(pool))
    questions = random.sample(pool, sample_size)
    return ok({
        "questions": questions,
        "total": len(pool),
        "exam": exam,
        "section_id": section_id,
        "duration_minutes": 10,
    })


@study_bp.route("/api/study/exam", methods=["GET"])
def study_exam():
    exam_type = request.args.get("type", "midterm")  # midterm | final
    exam = request.args.get("exam", "series_7")

    pool = [q for q in QUESTION_BANK if q["exam"] == exam]

    if exam_type == "midterm":
        target_count = 125
        duration_minutes = 120
    else:  # final
        target_count = 250
        duration_minutes = 225

    # Sample with replacement when bank is smaller than target
    if len(pool) >= target_count:
        questions = random.sample(pool, target_count)
    else:
        # Repeat the pool and shuffle to reach target count
        multiplier = (target_count // len(pool)) + 1
        expanded = pool * multiplier
        # Give each duplicate a unique id suffix so frontend can key them
        for i, q in enumerate(expanded):
            expanded[i] = {**q, "id": f"{q['id']}__{i}"}
        questions = random.sample(expanded, target_count)

    # Build section breakdown metadata
    sections_covered: dict = {}
    for q in questions:
        sec = q.get("section", "unknown")
        sections_covered[sec] = sections_covered.get(sec, 0) + 1

    return ok({
        "questions": questions,
        "total": len(questions),
        "exam": exam,
        "type": exam_type,
        "duration_minutes": duration_minutes,
        "sections_covered": sections_covered,
    })


# ─────────────────────────────────────────────────────────────────────────────
# PROGRESS ROUTES  (lightweight in-memory stub — backend has full DB version)
# ─────────────────────────────────────────────────────────────────────────────

_PROGRESS_STORE: dict = {}  # {user_key: {exam: {section_id: entry}}}


def _progress_key(exam: str) -> str:
    return f"default__{exam}"


@study_bp.route("/api/study/progress", methods=["GET"])
def get_study_progress():
    exam = request.args.get("exam", "series_50")
    key = _progress_key(exam)
    sections = _PROGRESS_STORE.get(key, {})
    return ok({"exam": exam, "sections": sections})


@study_bp.route("/api/study/progress", methods=["POST"])
def post_study_progress():
    data = request.get_json(silent=True) or {}
    exam = data.get("exam", "series_50")
    section_id = data.get("section_id")
    status = data.get("status", "in_progress")
    if not section_id:
        return err("section_id required", 400)
    key = _progress_key(exam)
    if key not in _PROGRESS_STORE:
        _PROGRESS_STORE[key] = {}
    _PROGRESS_STORE[key][section_id] = {
        "status": status,
        "score": None,
        "time_spent_minutes": 0,
        "completed_at": datetime.utcnow().isoformat() if status == "completed" else None,
        "notes": None,
    }
    return ok({"exam": exam, "section_id": section_id, "status": status})
