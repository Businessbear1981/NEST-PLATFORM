'use client';

import { useState } from 'react';

interface WeeklyPlanProps {
  userXP: number;
  currentStreak: number;
  onStartLesson: (weekNum: number, dayNum: number, topic: string) => void;
}

interface DayData {
  day: number;
  topic: string;
  xp: number;
  keyFormula: string;
}

interface WeekData {
  week: number;
  title: string;
  exam: string;
  xpTarget: number;
  badge: string;
  days: DayData[];
}

const WEEKS: WeekData[] = [
  {
    week: 1,
    title: 'Municipal Foundations',
    exam: 'S52',
    xpTarget: 500,
    badge: 'MuniFoundations',
    days: [
      { day: 1, topic: 'GO vs Revenue Bonds', xp: 100, keyFormula: 'Current Yield = Annual Coupon / Market Price' },
      { day: 2, topic: 'TEFRA & Volume Cap', xp: 100, keyFormula: 'PAB volume cap = $110 per capita' },
      { day: 3, topic: 'MSRB Core Rules G-17/G-30', xp: 100, keyFormula: 'Fair Dealing · No Deception · Mark-up rules' },
      { day: 4, topic: 'Yield Calculations & Tax Equivalency', xp: 150, keyFormula: 'TEY = Muni Yield / (1 - Tax Rate)' },
      { day: 5, topic: 'S52 Practice Quiz', xp: 200, keyFormula: 'Pass score: 72%' },
    ],
  },
  {
    week: 2,
    title: 'Bond Math Mastery',
    exam: 'S7',
    xpTarget: 750,
    badge: 'BondMath',
    days: [
      { day: 1, topic: 'Price / Yield Relationship', xp: 100, keyFormula: 'P = Σ(C/(1+y)^t) + F/(1+y)^n' },
      { day: 2, topic: 'Duration & Convexity', xp: 150, keyFormula: 'Modified Duration = Macaulay Duration / (1 + y/m)' },
      { day: 3, topic: 'Options Fundamentals', xp: 150, keyFormula: 'Call BEP = Strike + Premium; Put BEP = Strike - Premium' },
      { day: 4, topic: 'Packaged Products & ETFs', xp: 100, keyFormula: 'NAV = (Assets - Liabilities) / Shares Outstanding' },
      { day: 5, topic: 'S7 Bond Math Quiz', xp: 250, keyFormula: 'Pass score: 72%' },
    ],
  },
  {
    week: 3,
    title: 'Municipal Advisor Framework',
    exam: 'S54',
    xpTarget: 1000,
    badge: 'MuniAdvisor',
    days: [
      { day: 1, topic: 'MA Registration & Form MA', xp: 100, keyFormula: 'Fiduciary duty to municipal entity' },
      { day: 2, topic: 'MSRB Rule G-42 — MA Duties', xp: 150, keyFormula: 'Disclosure of conflicts · Best interest standard' },
      { day: 3, topic: 'Political Contributions G-37', xp: 100, keyFormula: '2-year ban on business after $250 contribution' },
      { day: 4, topic: 'Conduit Financing & PABs', xp: 150, keyFormula: 'TEFRA hearing + Gov\'t approval = tax-exempt status' },
      { day: 5, topic: 'S54 Full Practice', xp: 500, keyFormula: 'Pass score: 70%' },
    ],
  },
  {
    week: 4,
    title: 'Operations & Capital',
    exam: 'S28',
    xpTarget: 1500,
    badge: 'OpsExpert',
    days: [
      { day: 1, topic: 'Net Capital Rule 15c3-1', xp: 150, keyFormula: 'Aggregate Indebtedness / Net Capital ≤ 15:1' },
      { day: 2, topic: 'Customer Protection 15c3-3', xp: 150, keyFormula: 'Free credit balances must be segregated' },
      { day: 3, topic: 'SIPC Coverage & Haircuts', xp: 150, keyFormula: 'SIPC: $500k total / $250k cash' },
      { day: 4, topic: 'FOCUS Reports & Books/Records', xp: 150, keyFormula: 'Monthly FOCUS filing to FINRA' },
      { day: 5, topic: 'Final Mock Exam', xp: 900, keyFormula: 'All 4 exams: 70-72% pass threshold' },
    ],
  },
];

// XP unlock: 100 XP per day sequential within each week.
// Week 1 Day 1 always unlocked. Each subsequent day in a week
// requires the previous day to have been "completed" (approximated
// by cumulative XP threshold).
// Weeks unlock after prior week's xpTarget is met.

const XP_PER_UNLOCK = 100;

// Per-week accent palette
const WEEK_COLORS: Record<string, { accent: string; accentHi: string; badge: string; border: string }> = {
  S52: { accent: '#C4A048', accentHi: '#E8C87A', badge: '#1E3A10', border: '#C4A048' },
  S7:  { accent: '#7A9A82', accentHi: '#A8C4AE', badge: '#0D2A20', border: '#7A9A82' },
  S54: { accent: '#3DAA6C', accentHi: '#5DD68C', badge: '#0A2A1A', border: '#3DAA6C' },
  S28: { accent: '#4A8FA8', accentHi: '#70BFD8', badge: '#0A1E2A', border: '#4A8FA8' },
};

function getDayUnlockXP(weekIndex: number, dayIndex: number): number {
  // Day 0 of week 0 is always free (threshold = 0).
  // Every other day costs 100 XP cumulatively.
  const totalDaysBefore = weekIndex * 5 + dayIndex;
  return totalDaysBefore * XP_PER_UNLOCK;
}

function getWeekProgress(weekData: WeekData, userXP: number): number {
  const totalXP = weekData.days.reduce((s, d) => s + d.xp, 0);
  // Estimate completion by how many days are unlocked vs total
  const unlockedDays = weekData.days.filter((_, di) => {
    const weekIndex = WEEKS.findIndex((w) => w.week === weekData.week);
    return userXP >= getDayUnlockXP(weekIndex, di);
  }).length;
  return Math.round((unlockedDays / weekData.days.length) * 100);
}

// ProgressBar
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      style={{
        height: 4,
        background: '#1E4A2E',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 6,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }}
      />
    </div>
  );
}

// Streak badge
function StreakBadge({ streak }: { streak: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#1E4A2E',
        border: '1px solid #2D6B3D',
        borderRadius: 20,
        padding: '4px 12px',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '0.72rem',
        color: '#E8C87A',
        letterSpacing: '0.06em',
      }}
    >
      <span style={{ fontSize: '0.85rem' }}>🔥</span>
      {streak} day{streak !== 1 ? 's' : ''} streak
    </div>
  );
}

// Single day row
function DayRow({
  day,
  weekIndex,
  dayIndex,
  userXP,
  weekNum,
  onStart,
  colors,
}: {
  day: DayData;
  weekIndex: number;
  dayIndex: number;
  userXP: number;
  weekNum: number;
  onStart: (weekNum: number, dayNum: number, topic: string) => void;
  colors: (typeof WEEK_COLORS)[string];
}) {
  const threshold = getDayUnlockXP(weekIndex, dayIndex);
  const unlocked = userXP >= threshold;
  const xpNeeded = threshold - userXP;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: unlocked ? 'rgba(30,74,46,0.18)' : 'transparent',
        borderRadius: 6,
        border: `1px solid ${unlocked ? colors.border + '44' : '#1E4A2E'}`,
        marginBottom: 4,
        opacity: unlocked ? 1 : 0.65,
        transition: 'all 0.2s',
      }}
    >
      {/* Day number */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: unlocked ? colors.accent : '#1E4A2E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.65rem',
          color: unlocked ? '#030A06' : '#2D6B3D',
          fontWeight: 700,
        }}
      >
        {day.day}
      </div>

      {/* Topic + formula */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '0.82rem',
            color: unlocked ? '#EDE8DC' : '#7A9A82',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {day.topic}
        </div>
        <div
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.62rem',
            color: unlocked ? colors.accent : '#2D6B3D',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {day.keyFormula}
        </div>
      </div>

      {/* XP badge */}
      <div
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.65rem',
          color: unlocked ? colors.accentHi : '#2D6B3D',
          background: unlocked ? colors.badge : '#0D2218',
          border: `1px solid ${unlocked ? colors.border + '55' : '#1E4A2E'}`,
          padding: '2px 7px',
          borderRadius: 4,
          flexShrink: 0,
        }}
      >
        +{day.xp} XP
      </div>

      {/* Action */}
      <div style={{ flexShrink: 0 }}>
        {unlocked ? (
          <button
            onClick={() => onStart(weekNum, day.day, day.topic)}
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              padding: '5px 12px',
              borderRadius: 5,
              border: `1px solid ${colors.border}`,
              background: colors.badge,
              color: colors.accentHi,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = colors.accent;
              (e.currentTarget as HTMLButtonElement).style.color = '#030A06';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = colors.badge;
              (e.currentTarget as HTMLButtonElement).style.color = colors.accentHi;
            }}
          >
            START
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.62rem',
              color: '#2D6B3D',
            }}
            title={`Unlock at ${threshold} XP`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {xpNeeded > 0 ? `${xpNeeded} XP` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// Single week card
function WeekCard({
  weekData,
  weekIndex,
  userXP,
  onStartLesson,
}: {
  weekData: WeekData;
  weekIndex: number;
  userXP: number;
  onStartLesson: (weekNum: number, dayNum: number, topic: string) => void;
}) {
  const [expanded, setExpanded] = useState(weekIndex === 0);
  const colors = WEEK_COLORS[weekData.exam] ?? WEEK_COLORS['S52'];
  const progress = getWeekProgress(weekData, userXP);
  const weekXPEarned = Math.min(userXP, weekData.xpTarget);
  const isWeekStarted = userXP >= getDayUnlockXP(weekIndex, 0);

  return (
    <div
      style={{
        background: '#0D2218',
        border: `1px solid ${expanded ? colors.border + '66' : '#1E4A2E'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Week header — clickable to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '16px 18px',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Week number */}
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.65rem',
                color: colors.accent,
                letterSpacing: '0.1em',
                opacity: 0.8,
              }}
            >
              WK {weekData.week}
            </span>
            {/* Exam badge */}
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.65rem',
                color: colors.accentHi,
                background: colors.badge,
                border: `1px solid ${colors.border}55`,
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: '0.08em',
              }}
            >
              {weekData.exam}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* XP progress */}
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.65rem',
                color: colors.accent,
              }}
            >
              {isWeekStarted ? weekXPEarned : 0} / {weekData.xpTarget} XP
            </span>
            {/* Chevron */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                flexShrink: 0,
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <span
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#EDE8DC',
            letterSpacing: '0.01em',
          }}
        >
          {weekData.title}
        </span>

        {/* Progress bar */}
        <ProgressBar value={progress} color={colors.accent} />
      </button>

      {/* Expanded day list */}
      {expanded && (
        <div
          style={{
            padding: '4px 14px 16px',
            borderTop: `1px solid ${colors.border}22`,
          }}
        >
          {weekData.days.map((day, di) => (
            <DayRow
              key={day.day}
              day={day}
              weekIndex={weekIndex}
              dayIndex={di}
              userXP={userXP}
              weekNum={weekData.week}
              onStart={onStartLesson}
              colors={colors}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WeeklyPlan({ userXP, currentStreak, onStartLesson }: WeeklyPlanProps) {
  const totalXPTarget = WEEKS.reduce((s, w) => s + w.xpTarget, 0);
  const overallProgress = Math.min(100, Math.round((userXP / totalXPTarget) * 100));

  return (
    <div
      style={{
        fontFamily: '"Space Grotesk", sans-serif',
        background: '#030A06',
        minHeight: '100%',
        padding: '24px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#E8C87A',
                margin: 0,
                letterSpacing: '0.01em',
              }}
            >
              4-Week Study Plan
            </h2>
            <p
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '0.82rem',
                color: '#7A9A82',
                margin: '4px 0 0',
              }}
            >
              FINRA S52 · S7 · S54 · S28 Licensing Track
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <StreakBadge streak={currentStreak} />
            <div
              style={{
                background: '#0D2218',
                border: '1px solid #2D6B3D',
                borderRadius: 20,
                padding: '4px 14px',
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.72rem',
                color: '#C4A048',
                letterSpacing: '0.06em',
              }}
            >
              {userXP.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Overall progress */}
        <div
          style={{
            background: '#0D2218',
            border: '1px solid #1E4A2E',
            borderRadius: 8,
            padding: '12px 16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', color: '#7A9A82' }}>Overall Progress</span>
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.72rem',
                color: '#C4A048',
              }}
            >
              {overallProgress}%
            </span>
          </div>
          <ProgressBar value={overallProgress} color="#C4A048" />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 6,
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.62rem',
              color: '#2D6B3D',
            }}
          >
            <span>{userXP.toLocaleString()} XP earned</span>
            <span>{totalXPTarget.toLocaleString()} XP total</span>
          </div>
        </div>
      </div>

      {/* 2×2 grid of week cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {WEEKS.map((week, idx) => (
          <WeekCard
            key={week.week}
            weekData={week}
            weekIndex={idx}
            userXP={userXP}
            onStartLesson={onStartLesson}
          />
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          borderTop: '1px solid #1E4A2E',
          paddingTop: 16,
        }}
      >
        {Object.entries(WEEK_COLORS).map(([exam, c]) => (
          <div
            key={exam}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: c.accent,
              }}
            />
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.65rem',
                color: '#7A9A82',
              }}
            >
              {exam}
            </span>
          </div>
        ))}
        <span
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '0.68rem',
            color: '#2D6B3D',
            marginLeft: 'auto',
          }}
        >
          100 XP unlocks each day
        </span>
      </div>
    </div>
  );
}
