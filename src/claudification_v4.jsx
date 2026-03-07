import { useState, useEffect, useRef, useCallback } from "react";
import {
  listConversations, getConversation, createConversation, updateConversation,
  sprenChat, listKeyring, registerKey, connectWebSocket, checkBackendHealth,
} from "./api.js";

/* ══════════════════════════════════════════════════════════════
   CLAUDIFICATION v4 — Lite Platform · OathLedger Muse
   "Order before speed · Truth before automation · Humans before machines"
   ══════════════════════════════════════════════════════════════ */

/* ── Design Tokens ── */
const C = {
  accent: "#5865F2", green: "#23a55a", orange: "#f0a020", red: "#ed4245",
  yellow: "#fee75c", gold: "#c9a44a", bgDark: "#1e1f22", bgDarker: "#111214",
  bgSidebar: "#2b2d31", bgContent: "#313338", bgElevated: "#232428",
  bgMedium: "#3b3d42", borderDark: "rgba(255,255,255,0.07)",
  textPrimary: "#f2f3f5", textSecondary: "#b5bac1", textMuted: "#6d6f78",
  font: "'Segoe UI','SF Pro Display',-apple-system,sans-serif",
};
const TIER_COLORS = { Executive: C.red, Management: C.orange, Engineering: C.accent, "All Staff": C.green };
const ACTIVITY = { green: C.green, orange: C.orange, red: C.red, none: null };

/* ── Four Systems Colors ── */
const SYS_COLORS = {
  oathledger: "#c9a44a",
  lens: "#5865F2",
  ardent: "#b0b0b0",
  muse: "#a78bfa",
};

/* ── OathLedger Users (from app.py seed) ── */
const OATH_USERS = [
  { id: 1, username: "jeff", display: "Jeffrey Watts", role: "admin", active: true, lastLogin: "2026-02-25T14:33:00Z" },
  { id: 2, username: "susan", display: "Susan", role: "reviewer", active: true, lastLogin: "2026-02-25T10:15:00Z" },
  { id: 3, username: "charles", display: "Charles", role: "partner", active: true, lastLogin: "2026-02-24T16:40:00Z" },
  { id: 4, username: "chris", display: "Chris", role: "partner", active: true, lastLogin: "2026-02-23T09:00:00Z" },
  { id: 5, username: "ashley", display: "Ashley", role: "preparer", active: true, lastLogin: "2026-02-25T11:22:00Z" },
  { id: 6, username: "leigh", display: "Leigh", role: "preparer", active: false, lastLogin: "2026-02-10T08:00:00Z" },
  { id: 7, username: "molly", display: "Molly", role: "reviewer", active: true, lastLogin: "2026-02-25T13:05:00Z" },
];

/* ── Current User & Role Permissions ── */
const CURRENT_USER = OATH_USERS[0]; // Jeffrey Watts, admin
const ROLE_HIERARCHY = { admin: 4, partner: 3, reviewer: 2, preparer: 1 };
const ROLE_PERMISSIONS = {
  admin:    { canModerate: true, canAssign: true, canShareApps: true, canSetPermissions: true, canVoiceHost: true, visibleChannels: "all" },
  partner:  { canModerate: false, canAssign: false, canShareApps: true, canSetPermissions: true, canVoiceHost: true, visibleChannels: "all" },
  reviewer: { canModerate: false, canAssign: false, canShareApps: true, canSetPermissions: false, canVoiceHost: false, visibleChannels: "standard" },
  preparer: { canModerate: false, canAssign: false, canShareApps: false, canSetPermissions: false, canVoiceHost: false, visibleChannels: "basic" },
};
const MY_PERMS = ROLE_PERMISSIONS[CURRENT_USER.role];

/* ── Tax Season Detection (Jan 1 – Apr 15) ── */
const NOW = new Date();
const IS_TAX_SEASON = (NOW.getMonth() < 3) || (NOW.getMonth() === 3 && NOW.getDate() <= 15);

/* ── Recent Jobs (for one-click document sharing) ── */
const RECENT_JOBS = [
  { id: "j-001", client: "Smith Family Trust", type: "Tax Returns", stage: "partner_review", unread: 2 },
  { id: "j-003", client: "Davis Holdings", type: "K-1 Documents", stage: "reviewer_review", unread: 1 },
  { id: "j-004", client: "Thompson LLC", type: "Bookkeeping", stage: "preparer_review", unread: 0 },
  { id: "j-002", client: "Miller Corp", type: "Bank Statements", stage: "final", unread: 0 },
];

const REVIEW_STAGES = ["draft", "preparer_review", "reviewer_review", "partner_review", "final"];
const STAGE_DISPLAY = { draft: "Draft", preparer_review: "Preparer Review", reviewer_review: "Reviewer Review", partner_review: "Partner Review", final: "Final" };
const ROLE_BADGE = { admin: { bg: "#ed424530", color: C.red }, preparer: { bg: "#5865F230", color: C.accent }, reviewer: { bg: "#f0a02030", color: C.orange }, partner: { bg: "#23a55a30", color: C.green } };

/* ── The LITE Loop ── */
const LITE_LOOP = [
  { step: 1, name: "Event", sub: "Trigger", color: C.green },
  { step: 2, name: "CandidateFact", sub: "Structured", color: SYS_COLORS.oathledger },
  { step: 3, name: "ContextBundle", sub: "Lens-scoped", color: SYS_COLORS.lens },
  { step: 4, name: "Ardent", sub: "Evaluated", color: SYS_COLORS.ardent },
  { step: 5, name: "Human Review", sub: "Verified", color: C.orange },
  { step: 6, name: "Canonical Fact", sub: "Truth written", color: SYS_COLORS.oathledger },
  { step: 7, name: "Statistical Update", sub: "Recorded", color: SYS_COLORS.muse },
];

/* ── Four Systems ── */
const FOUR_SYSTEMS = [
  { key: "oathledger", name: "OathLedger", subtitle: "KEEPER OF FINANCIAL TRUTH", icon: "⚖️", color: SYS_COLORS.oathledger,
    desc: "Extracts, structures, verifies, and preserves financial facts. Transforms documents into CandidateFacts.",
    tags: ["Document Intake", "CandidateFact Generation", "Canonicalization", "Audit Persistence"] },
  { key: "lens", name: "Lens", subtitle: "GATE OF CONTEXT", icon: "◎", color: SYS_COLORS.lens,
    desc: "Builds ContextBundles with explicit intent, scope, constraints, and actor. Prevents unbounded evaluation.",
    tags: ["Intent Scoping", "Constraint Enforcement", "Context Bundling", "Boundary Control"] },
  { key: "ardent", name: "Ardent", subtitle: "DETERMINISTIC SPINE", icon: "◇", color: SYS_COLORS.ardent,
    desc: "Pure evaluation engine. No database, no I/O, no side effects. Versioned rules emitting structured evidence.",
    tags: ["Rule Evaluation", "Severity Scoring", "Evidence Emission", "Purity Guarantees"] },
  { key: "muse", name: "Muse", subtitle: "WEAVER OF WORKFLOWS", icon: "✦", color: SYS_COLORS.muse,
    desc: "Governs tasks, dependencies, and execution integrity. Tracks alignment scoring and completion reviews.",
    tags: ["Task Orchestration", "Dependency Resolution", "Alignment Scoring", "CompletionReview"] },
];

/* ── Governance Principles ── */
const GOVERNANCE = [
  "Deterministic rules before AI suggestions",
  "Append-only event logging",
  "No hidden coupling",
  "Humans as final authority",
  "Explicit rule IDs and versions",
  "170+ tests per release",
];

/* ── File Categories ── */
const FILE_CATEGORIES = [
  { id: 1, name: "Financial Reports", icon: "📊", activity: "green", tier: "Executive" },
  { id: 2, name: "HR Documents", icon: "👤", activity: "red", tier: "Management" },
  { id: 3, name: "Project Assets", icon: "🎨", activity: "green", tier: "All Staff" },
  { id: 4, name: "Client Contracts", icon: "📝", activity: "orange", tier: "Executive" },
  { id: 5, name: "Marketing Media", icon: "📢", activity: "none", tier: "All Staff" },
  { id: 6, name: "Dev Resources", icon: "⚙️", activity: "green", tier: "Engineering" },
  { id: 7, name: "Legal Filings", icon: "⚖️", activity: "red", tier: "Executive" },
  { id: 8, name: "Training Docs", icon: "📚", activity: "none", tier: "All Staff" },
  { id: 9, name: "Internal Memos", icon: "📨", activity: "orange", tier: "Management" },
  { id: 10, name: "Archive Vault", icon: "🗄️", activity: "none", tier: "Executive" },
];

/* ── Sidebar — Server/Channel Navigation (unified pattern) ── */
/* ── Option A: Engagement-Centric Sidebar (UI-CLAUD-002) ── */
const SERVERS = [
  { id: 'today', label: 'Today', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', page: 'today' },
  { id: 'divider0', type: 'divider' },
  { id: 'team', label: 'Team', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', page: 'team' },
  { id: 'engagements', label: 'Engagements', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', page: 'engagements' },
  { id: 'divider1', type: 'divider' },
  { id: 'oathledger', label: 'OathLedger', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', page: 'oathledger' },
  { id: 'museboard', label: 'Muse Board', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', page: 'museboard' },
  { id: 'agent', label: 'Agent', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', page: 'agent' },
  { id: 'divider2', type: 'divider' },
  { id: 'admin', label: 'Admin', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', page: 'admin' },
];

/* ── System checks ── */
const SYSTEM_CHECKS = [
  { name: "OathLedger", status: "ok", detail: "Document intake pipeline active" },
  { name: "Lens", status: "ok", detail: "ContextBundle builder nominal" },
  { name: "Ardent", status: "ok", detail: "Rule engine — 170+ tests passing" },
  { name: "Muse", status: "ok", detail: "Workflow orchestrator connected" },
  { name: "Flask/URITHIRU", status: "ok", detail: "v5.2 — Port 5050" },
  { name: "SQLite Database", status: "ok", detail: "bearden.db — WAL mode" },
  { name: "Tesseract OCR", status: "ok", detail: "v5.3.1 installed" },
  { name: "Anthropic API", status: "ok", detail: "claude-sonnet-4 — key set" },
  { name: "Disk Space", status: "warn", detail: "12.3 GB free (threshold: 10 GB)" },
  { name: "Audit Log", status: "ok", detail: "847 events — append-only, no gaps" },
];

const REPORT_JOBS = [
  { id: "j-001", client: "Smith Family Trust", type: "Tax Returns", stage: "partner_review", cost: "$1.24", pages: 14, date: "2026-02-25" },
  { id: "j-002", client: "Miller Corp", type: "Bank Statements", stage: "final", cost: "$0.38", pages: 6, date: "2026-02-24" },
  { id: "j-003", client: "Davis Holdings", type: "K-1 Documents", stage: "reviewer_review", cost: "$2.10", pages: 22, date: "2026-02-24" },
  { id: "j-004", client: "Thompson LLC", type: "Bookkeeping", stage: "preparer_review", cost: "$0.67", pages: 9, date: "2026-02-23" },
  { id: "j-005", client: "Bearden Internal", type: "Payroll", stage: "final", cost: "$0.15", pages: 3, date: "2026-02-22" },
];

const AUDIT_EVENTS = [
  { ts: "14:33:10", level: "info", type: "login", user: "Jeffrey Watts", msg: "Logged in from 192.168.1.10" },
  { ts: "14:28:05", level: "info", type: "review_advance", user: "Susan", msg: "Job j-001 → partner_review (LITE step 5: Human Review)" },
  { ts: "13:55:22", level: "warn", type: "drift_alert", user: "Ardent", msg: "Edit rate 18.4% exceeds 15% threshold on j-003" },
  { ts: "13:12:00", level: "info", type: "extraction", user: "OathLedger", msg: "CandidateFact generation: Davis Holdings — 22 pages" },
  { ts: "12:45:33", level: "info", type: "login", user: "Molly", msg: "Logged in from 192.168.1.14" },
  { ts: "11:30:00", level: "error", type: "api_error", user: "Lens", msg: "ContextBundle scope exceeded — retried with tighter constraints" },
  { ts: "11:22:15", level: "info", type: "canonical", user: "Muse", msg: "Canonical Facts written for Miller Corp — Truth is Written" },
  { ts: "10:15:40", level: "info", type: "login", user: "Susan", msg: "Logged in from 192.168.1.11" },
];

/* ═══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Badge({ text, bg, color }) {
  return <span style={{ fontSize: 10, fontFamily: C.font, fontWeight: 700, color, background: bg, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>{text}</span>;
}
function StatusDot({ status, size = 8 }) {
  const color = status === "ok" ? C.green : status === "warn" ? C.orange : status === "error" ? C.red : C.textMuted;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}60`, flexShrink: 0 }} />;
}
function SectionHeader({ children }) {
  return <div style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", padding: "14px 8px 6px 8px" }}>{children}</div>;
}
function Card({ children, style = {} }) {
  return <div style={{ background: C.bgElevated, borderRadius: 10, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.05)", ...style }}>{children}</div>;
}
function SystemTag({ text, color }) {
  return <span style={{ fontSize: 10.5, fontFamily: C.font, fontWeight: 500, color: color || C.textMuted, background: (color || C.textMuted) + "15", padding: "3px 8px", borderRadius: 4, border: `1px solid ${(color || C.textMuted)}25` }}>{text}</span>;
}

/* ── Typing Indicator Dots ── */
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 4, height: 4, borderRadius: "50%", background: C.textMuted,
          animation: `typingPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes typingPulse { 0%,60%,100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERVER ICON — Unified sidebar pattern (SVG icons, clean states)
   ═══════════════════════════════════════════════════════════════ */
function ServerIconSvg({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOLDER CARD
   ═══════════════════════════════════════════════════════════════ */
function FolderCard({ category, onClick, isSelected }) {
  const [hov, setHov] = useState(false);
  const ac = ACTIVITY[category.activity]; const tc = TIER_COLORS[category.tier];
  return (
    <button onClick={() => onClick(category)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: "relative", width: "100%", aspectRatio: "1.4/1", background: isSelected ? "rgba(88,101,242,0.15)" : hov ? "rgba(88,101,242,0.08)" : "rgba(30,31,34,0.55)", border: isSelected ? `2px solid ${C.accent}` : hov ? "2px solid rgba(88,101,242,0.3)" : "2px solid transparent", borderRadius: 14, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.18s", padding: "10px 6px", transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? "0 6px 20px rgba(0,0,0,0.3)" : "none" }}>
      {ac && <div style={{ position: "absolute", top: 6, right: 6, width: 10, height: 10, borderRadius: "50%", background: ac, boxShadow: `0 0 6px ${ac}80`, border: `2px solid ${C.bgContent}` }} />}
      <div style={{ width: 50, height: 42, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 4, width: 20, height: 9, background: tc, borderRadius: "5px 5px 0 0", opacity: 0.85 }} />
        <div style={{ position: "absolute", top: 7, left: 0, right: 0, bottom: 0, background: tc, borderRadius: "3px 7px 7px 7px", opacity: 0.8, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 17 }}>{category.icon}</span></div>
      </div>
      <span style={{ fontSize: 11.5, fontFamily: C.font, fontWeight: 600, color: C.textPrimary, textAlign: "center", lineHeight: 1.2, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{category.name}</span>
      <span style={{ fontSize: 8.5, fontFamily: C.font, fontWeight: 700, color: tc, textTransform: "uppercase", letterSpacing: "0.4px", opacity: 0.85 }}>{category.tier}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE BAR (bottom of server rail)
   ═══════════════════════════════════════════════════════════════ */
function ProfileBar() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 10px 0", borderTop: `1px solid ${C.borderDark}`, gap: 6 }}>
      <div style={{ position: "relative" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.bgMedium, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textSecondary }}>JW</span>
        </div>
        <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: C.green, border: `2px solid ${C.bgDarker}` }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHANNEL PANEL — Unified pattern (matches Muse Board)
   ═══════════════════════════════════════════════════════════════ */
/* ── Option A Channel Map (UI-CLAUD-002) ── */
const CHANNEL_MAP = {
  today: [
    { type: "header", label: "YOUR DAY" },
    { type: "item", label: "Dashboard", prefix: "☀️", active: true },
    { type: "item", label: "My Queue", prefix: "📋" },
    { type: "item", label: "Deadlines", prefix: "⏰" },
    { type: "divider" },
    { type: "header", label: "ALERTS" },
    { type: "item", label: "Ardent Flags", prefix: "◇" },
    { type: "item", label: "Announcements", prefix: "📢" },
  ],
  team: [
    { type: "header", label: "CHANNELS" },
    { type: "item", label: "general", prefix: "#", active: true },
    { type: "item", label: "tax-returns", prefix: "#" },
    { type: "item", label: "client-review", prefix: "#" },
    { type: "item", label: "deadlines", prefix: "#" },
    { type: "item", label: "announcements", prefix: "#" },
    { type: "divider" },
    { type: "header", label: "DIRECT MESSAGES" },
    { type: "item", label: "Susan" },
    { type: "item", label: "Molly" },
    { type: "item", label: "Charles" },
  ],
  engagements: [
    { type: "header", label: "PIPELINE" },
    { type: "item", label: "All Active", prefix: "📊", active: true },
    { type: "item", label: "My Assignments", prefix: "👤" },
    { type: "divider" },
    { type: "header", label: "BY STAGE" },
    { type: "item", label: "Draft", prefix: "📝" },
    { type: "item", label: "Preparer Review", prefix: "🔍" },
    { type: "item", label: "Reviewer Review", prefix: "✓" },
    { type: "item", label: "Partner Review", prefix: "⭐" },
    { type: "item", label: "Final", prefix: "✅" },
    { type: "divider" },
    { type: "header", label: "SEARCH" },
    { type: "item", label: "Find Client...", prefix: "🔎" },
  ],
  oathledger: [
    { type: "header", label: "EXTRACTION" },
    { type: "item", label: "Queue", prefix: "📥", active: true },
    { type: "item", label: "Processing", prefix: "⚙️" },
    { type: "item", label: "Ready for Review", prefix: "✓" },
    { type: "divider" },
    { type: "header", label: "FACTS" },
    { type: "item", label: "Unverified", prefix: "⚠️" },
    { type: "item", label: "Verified Today", prefix: "✅" },
    { type: "item", label: "Canonical Ledger", prefix: "⚖️" },
  ],
  museboard: [
    { type: "header", label: "BOARDS" },
    { type: "item", label: "Spren Roadmap", prefix: "📋", active: true },
    { type: "item", label: "Tax Season 2026", prefix: "📋" },
    { type: "item", label: "Client Onboarding", prefix: "📋" },
    { type: "divider" },
    { type: "header", label: "VIEWS" },
    { type: "item", label: "Timeline", prefix: "📅" },
    { type: "item", label: "Resource Planner", prefix: "👥" },
  ],
  agent: [
    { type: "header", label: "CENTRAL AGENT" },
    { type: "item", label: "Agent Console", prefix: "🤖", active: true },
    { type: "item", label: "Live Queries", prefix: "📡" },
    { type: "divider" },
    { type: "header", label: "CONNECTED SYSTEMS" },
    { type: "item", label: "OathLedger", prefix: "⚖️" },
    { type: "item", label: "Lens", prefix: "◎" },
    { type: "item", label: "Ardent", prefix: "◇" },
    { type: "item", label: "Muse", prefix: "✦" },
    { type: "divider" },
    { type: "header", label: "DATA STORES" },
    { type: "item", label: "Transaction Ledger", prefix: "💳" },
    { type: "item", label: "Facts Store", prefix: "📝" },
    { type: "item", label: "CAS Telemetry", prefix: "🔍" },
  ],
  admin: [
    { type: "header", label: "USER MANAGEMENT" },
    { type: "item", label: "All Users", prefix: "👥", active: true },
    { type: "item", label: "Create User", prefix: "+" },
    { type: "item", label: "Reset PINs", prefix: "🔑" },
    { type: "divider" },
    { type: "header", label: "SECURITY" },
    { type: "item", label: "Permissions", prefix: "🛡️" },
    { type: "item", label: "Audit Log", prefix: "📋" },
    { type: "item", label: "Session Policy", prefix: "🔒" },
    { type: "divider" },
    { type: "header", label: "SYSTEM" },
    { type: "item", label: "Health Checks", prefix: "✅" },
    { type: "item", label: "Backups", prefix: "💾" },
    { type: "item", label: "Commands", prefix: "⚡" },
  ],
};

function ChannelPanel({ activeView, collapsed, onCollapse }) {
  if (collapsed) return null;

  const channels = CHANNEL_MAP[activeView] || CHANNEL_MAP.today;
  const server = SERVERS.find(s => s.id === activeView);
  const title = server ? server.label : "Claudification";

  return (
    <div style={{ width: 190, minWidth: 190, display: "flex", flexDirection: "column", background: C.bgSidebar, borderLeft: `1px solid ${C.borderDark}` }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px 8px", minHeight: 44 }}>
        <span style={{ fontFamily: C.font, fontSize: 15, fontWeight: 600, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
        <button onClick={onCollapse} title="Collapse sidebar"
          style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
      </div>
      {/* Channel list */}
      <div style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
        {channels.map((ch, i) => {
          if (ch.type === "header") {
            return <div key={i} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: C.textMuted, padding: "10px 8px 4px", fontFamily: C.font }}>{ch.label}</div>;
          }
          if (ch.type === "divider") {
            return <div key={i} style={{ height: 1, background: C.borderDark, margin: "6px 4px" }} />;
          }
          return (
            <button key={i} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px",
              border: "none", background: ch.active ? C.bgElevated : "transparent",
              color: ch.active ? C.gold : C.textMuted, fontSize: 13, fontFamily: C.font,
              cursor: "pointer", borderRadius: 4, transition: "all 0.15s", textAlign: "left",
            }}
              onMouseEnter={e => { if (!ch.active) { e.currentTarget.style.background = C.bgMedium; e.currentTarget.style.color = C.textPrimary; } }}
              onMouseLeave={e => { if (!ch.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; } }}>
              {ch.prefix && <span style={{ color: C.textMuted, fontWeight: 600, fontSize: 13, width: 18, textAlign: "center", flexShrink: 0 }}>{ch.prefix}</span>}
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TODAY — Personal Dashboard (Option A: replaces Home)
   ═══════════════════════════════════════════════════════════════ */
function TodayView() {
  const myAssignments = RECENT_JOBS.filter(j => j.stage !== "final");
  const urgentFlags = AUDIT_EVENTS.filter(e => e.level === "warn" || e.level === "error");
  const daysToDeadline = IS_TAX_SEASON ? Math.ceil((new Date(NOW.getFullYear(), 3, 15) - NOW) / 86400000) : null;

  return (
    <div style={{ padding: "28px 36px", maxWidth: 920 }}>
      {/* Greeting + tax season */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: C.font, fontWeight: 300, fontSize: 28, color: C.textPrimary, margin: "0 0 4px 0" }}>
          Good {NOW.getHours() < 12 ? "morning" : NOW.getHours() < 17 ? "afternoon" : "evening"}, <span style={{ fontWeight: 700 }}>{CURRENT_USER.display.split(" ")[0]}</span>
        </h1>
        <div style={{ fontSize: 13, fontFamily: C.font, color: C.textMuted }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>
        {IS_TAX_SEASON && (
          <div style={{ marginTop: 10, padding: "10px 16px", borderRadius: 8, background: `${C.orange}15`, border: `1px solid ${C.orange}30`, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <div>
              <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.orange }}>Tax Season Active</div>
              <div style={{ fontSize: 12, fontFamily: C.font, color: C.textSecondary }}>{daysToDeadline} days to April 15 deadline</div>
            </div>
          </div>
        )}
      </div>

      {/* My Queue */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>📋 My Queue — {myAssignments.length} active</div>
        {myAssignments.length === 0 ? (
          <div style={{ fontSize: 13, fontFamily: C.font, color: C.textMuted, fontStyle: "italic" }}>No active assignments. You're caught up!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {myAssignments.map(j => (
              <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(0,0,0,0.15)", borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(88,101,242,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.15)"; }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: C.accent, fontWeight: 600, flexShrink: 0 }}>{j.id}</span>
                <span style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: C.textPrimary, flex: 1 }}>{j.client}</span>
                <Badge text={j.type} bg="rgba(255,255,255,0.06)" color={C.textSecondary} />
                <Badge text={STAGE_DISPLAY[j.stage]} bg={j.stage === "partner_review" ? C.gold + "25" : C.accent + "25"} color={j.stage === "partner_review" ? C.gold : C.accent} />
                {j.unread > 0 && <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{j.unread}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pipeline Summary */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 14 }}>📈 Pipeline — Review Stages</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {REVIEW_STAGES.map((s, i) => {
            const count = REPORT_JOBS.filter(j => j.stage === s).length;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ padding: "8px 12px", borderRadius: 8, background: count > 0 ? C.accent + "20" : "rgba(255,255,255,0.04)", border: `1px solid ${count > 0 ? C.accent + "40" : "rgba(255,255,255,0.06)"}`, textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontSize: 18, fontFamily: C.font, fontWeight: 800, color: count > 0 ? C.textPrimary : C.textMuted }}>{count}</div>
                  <div style={{ fontSize: 9, fontFamily: C.font, color: C.textMuted, marginTop: 2 }}>{STAGE_DISPLAY[s]}</div>
                </div>
                {i < REVIEW_STAGES.length - 1 && <span style={{ color: C.textMuted, fontSize: 14 }}>→</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Alerts */}
      {urgentFlags.length > 0 && (
        <Card style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.orange, marginBottom: 10 }}>⚠️ Alerts — {urgentFlags.length} item(s)</div>
          {urgentFlags.map((ev, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: i < urgentFlags.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
              <StatusDot status={ev.level} />
              <div>
                <span style={{ fontSize: 12, fontFamily: C.font, fontWeight: 600, color: FOUR_SYSTEMS.find(x => x.name === ev.user) ? FOUR_SYSTEMS.find(x => x.name === ev.user).color : C.textPrimary }}>{ev.user}</span>
                <span style={{ fontSize: 12, fontFamily: C.font, color: C.textSecondary, marginLeft: 6 }}>{ev.msg}</span>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Four Systems Status (compact) */}
      <Card>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 10 }}>⚡ Systems</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {FOUR_SYSTEMS.map(sys => (
            <div key={sys.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(0,0,0,0.15)", borderRadius: 8 }}>
              <span style={{ fontSize: 16 }}>{sys.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: sys.color }}>{sys.name}</div>
                <div style={{ fontSize: 10, fontFamily: C.font, color: C.textMuted }}>{sys.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME — Lite Platform Dashboard (preserved for architecture reference)
   ═══════════════════════════════════════════════════════════════ */
function HomeView() {
  return (
    <div style={{ padding: "28px 36px", maxWidth: 920 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontFamily: C.font, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>System Architecture</div>
        <h1 style={{ fontFamily: C.font, fontWeight: 300, fontSize: 32, color: C.textPrimary, margin: "0 0 6px 0" }}>
          <span style={{ fontWeight: 300 }}>Lite </span><span style={{ fontWeight: 800 }}>Platform</span>
        </h1>
        <div style={{ fontSize: 13, fontFamily: C.font, color: C.gold, fontStyle: "italic" }}>
          Order before speed · Truth before automation · Humans before machines
        </div>
      </div>

      {/* 4 Steps */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginBottom: 28, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        {[
          { step: 1, label: "AI Interprets", color: C.accent },
          { step: 2, label: "Rules Evaluate", color: C.red },
          { step: 3, label: "Humans Verify", color: C.orange },
          { step: 4, label: "Truth is Written", color: C.gold },
        ].map((s, i) => (
          <div key={i} style={{ padding: "14px 12px", textAlign: "center", background: `${s.color}10`, borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <div style={{ fontSize: 10, fontFamily: C.font, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Step {s.step}</div>
            <div style={{ fontSize: 14, fontFamily: C.font, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* LITE Loop */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1.5px" }}>The LITE Loop</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
          {LITE_LOOP.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ textAlign: "center", minWidth: 85 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${l.color}20`, border: `2px solid ${l.color}60`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px" }}>
                  <span style={{ fontSize: 14, fontFamily: C.font, fontWeight: 800, color: l.color }}>{l.step}</span>
                </div>
                <div style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>{l.name}</div>
                <div style={{ fontSize: 10, fontFamily: C.font, color: C.textMuted, fontStyle: "italic" }}>{l.sub}</div>
              </div>
              {i < LITE_LOOP.length - 1 && <span style={{ color: C.textMuted, fontSize: 12, margin: "0 2px", marginBottom: 20 }}>→</span>}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, fontFamily: C.font, color: C.textMuted, letterSpacing: "0.5px" }}>
          Closed · Auditable · Deterministic
        </div>
      </Card>

      {/* Four Systems in Concert */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "1.5px" }}>Four Systems in Concert</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        {FOUR_SYSTEMS.map(sys => (
          <Card key={sys.key} style={{ borderLeft: `3px solid ${sys.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18, color: sys.color }}>{sys.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontFamily: C.font, fontWeight: 700, color: C.textPrimary }}>{sys.name}</div>
                <div style={{ fontSize: 9, fontFamily: C.font, fontWeight: 600, color: sys.color, textTransform: "uppercase", letterSpacing: "1px" }}>{sys.subtitle}</div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, fontFamily: C.font, color: C.textSecondary, lineHeight: 1.5, margin: "0 0 10px 0" }}>{sys.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {sys.tags.map(t => <SystemTag key={t} text={t} color={sys.color} />)}
            </div>
          </Card>
        ))}
      </div>

      {/* Governance */}
      <Card style={{ borderTop: `2px solid ${C.gold}` }}>
        <div style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Governance Principles</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
          {GOVERNANCE.map((g, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontFamily: C.font, color: C.textSecondary }}>{g}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, fontFamily: C.font, color: C.gold, fontStyle: "italic" }}>
          The human remains sovereign.
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILE SHARING
   ═══════════════════════════════════════════════════════════════ */
function FileSharingView() {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ padding: "28px 36px" }}>
      <div style={{ display: "flex", gap: 18, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Tiers:</span>
        {Object.entries(TIER_COLORS).map(([t, c]) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: c }} /><span style={{ fontSize: 11, fontFamily: C.font, color: C.textSecondary }}>{t}</span></div>)}
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
        <span style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Activity:</span>
        {[{ l: "Active", c: C.green }, { l: "Updates", c: C.orange }, { l: "Urgent", c: C.red }].map(s => <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: s.c, boxShadow: `0 0 5px ${s.c}60` }} /><span style={{ fontSize: 11, fontFamily: C.font, color: C.textSecondary }}>{s.l}</span></div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, maxWidth: 880 }}>
        {FILE_CATEGORIES.map(cat => <FolderCard key={cat.id} category={cat} isSelected={sel?.id === cat.id} onClick={setSel} />)}
      </div>
      {sel && (
        <Card style={{ marginTop: 24, maxWidth: 880, border: "1px solid rgba(88,101,242,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 24 }}>{sel.icon}</span>
            <span style={{ fontFamily: C.font, fontWeight: 700, fontSize: 17, color: C.textPrimary }}>{sel.name}</span>
            <Badge text={sel.tier} bg={TIER_COLORS[sel.tier] + "25"} color={TIER_COLORS[sel.tier]} />
          </div>
          <p style={{ fontSize: 13.5, fontFamily: C.font, color: C.textSecondary, lineHeight: 1.55, margin: "0 0 14px 0" }}>
            Access restricted to <strong style={{ color: TIER_COLORS[sel.tier] }}>{sel.tier}</strong> tier and above.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {["Upload File", "Request Access", "View Log"].map((b, i) => <button key={i} style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: i === 0 ? C.accent : "rgba(255,255,255,0.07)", color: C.textPrimary, fontSize: 13, fontFamily: C.font, fontWeight: 600, cursor: "pointer" }}>{b}</button>)}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENGAGEMENTS — Pipeline by Stage (Option A: no per-client channels)
   ═══════════════════════════════════════════════════════════════ */
function EngagementsView() {
  const [stageFilter, setStageFilter] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = REPORT_JOBS.filter(j => {
    if (stageFilter && j.stage !== stageFilter) return false;
    if (search && !j.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "28px 36px", maxWidth: 920 }}>
      <h2 style={{ fontFamily: C.font, fontWeight: 800, fontSize: 20, color: C.textPrimary, margin: "0 0 4px 0" }}>📋 Engagements</h2>
      <p style={{ fontFamily: C.font, fontSize: 13, color: C.textMuted, margin: "0 0 20px 0" }}>Active client engagements across the review pipeline</p>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          style={{ width: "100%", maxWidth: 400, padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.borderDark}`, background: C.bgElevated, color: C.textPrimary, fontSize: 13, fontFamily: C.font, outline: "none" }}
        />
      </div>

      {/* Stage Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setStageFilter(null)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: !stageFilter ? C.accent : "rgba(255,255,255,0.06)", color: !stageFilter ? "#fff" : C.textSecondary, fontSize: 12, fontFamily: C.font, fontWeight: 600, cursor: "pointer" }}>All ({REPORT_JOBS.length})</button>
        {REVIEW_STAGES.map(s => {
          const count = REPORT_JOBS.filter(j => j.stage === s).length;
          return (
            <button key={s} onClick={() => setStageFilter(stageFilter === s ? null : s)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: stageFilter === s ? C.accent : "rgba(255,255,255,0.06)", color: stageFilter === s ? "#fff" : C.textSecondary, fontSize: 12, fontFamily: C.font, fontWeight: 600, cursor: "pointer" }}>
              {STAGE_DISPLAY[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Engagement Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(j => (
          <Card key={j.id} style={{ cursor: "pointer", transition: "all 0.15s", border: "1px solid transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontFamily: C.font, fontWeight: 700, color: C.textPrimary }}>{j.client}</span>
                  {j.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{j.unread}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: C.accent }}>{j.id}</span>
                  <Badge text={j.type} bg="rgba(255,255,255,0.06)" color={C.textSecondary} />
                  <span style={{ fontSize: 11, fontFamily: C.font, color: C.textMuted }}>{j.pages} pages</span>
                  <span style={{ fontSize: 11, fontFamily: C.font, color: C.textMuted }}>{j.cost}</span>
                </div>
              </div>
              <Badge text={STAGE_DISPLAY[j.stage]} bg={j.stage === "final" ? C.gold + "25" : j.stage === "partner_review" ? C.green + "25" : C.accent + "25"} color={j.stage === "final" ? C.gold : j.stage === "partner_review" ? C.green : C.accent} />
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: C.textMuted, fontFamily: C.font }}>
            {search ? `No clients matching "${search}"` : "No engagements at this stage"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OATHLEDGER — Cross-app: Extraction Pipeline
   ═══════════════════════════════════════════════════════════════ */
function OathLedgerView() {
  return (
    <div style={{ padding: "28px 36px", maxWidth: 920 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 24 }}>⚖️</span>
        <h2 style={{ fontFamily: C.font, fontWeight: 800, fontSize: 20, color: SYS_COLORS.oathledger, margin: 0 }}>OathLedger</h2>
        <Badge text="KEEPER OF FINANCIAL TRUTH" bg={SYS_COLORS.oathledger + "20"} color={SYS_COLORS.oathledger} />
      </div>
      <p style={{ fontFamily: C.font, fontSize: 13, color: C.textMuted, margin: "0 0 20px 0" }}>Document extraction, fact generation, and verification pipeline</p>

      {/* Extraction Queue */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>📥 Extraction Queue</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { label: "Queued", count: 3, color: C.orange },
            { label: "Processing", count: 1, color: C.accent },
            { label: "Ready for Review", count: 2, color: C.green },
          ].map(q => (
            <div key={q.label} style={{ padding: "14px", borderRadius: 8, background: q.color + "12", border: `1px solid ${q.color}30`, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontFamily: C.font, fontWeight: 800, color: q.color }}>{q.count}</div>
              <div style={{ fontSize: 11, fontFamily: C.font, color: C.textSecondary, marginTop: 2 }}>{q.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Extractions */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>📊 Recent Jobs — LITE Loop Tracking</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: C.font, fontSize: 13 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["Job", "Client", "Type", "Stage", "Cost", "Pages"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {REPORT_JOBS.map(j => (
              <tr key={j.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "7px 8px", color: C.accent, fontWeight: 600, fontFamily: "monospace", fontSize: 12 }}>{j.id}</td>
                <td style={{ padding: "7px 8px", color: C.textPrimary, fontWeight: 600 }}>{j.client}</td>
                <td style={{ padding: "7px 8px", color: C.textSecondary }}>{j.type}</td>
                <td style={{ padding: "7px 8px" }}><Badge text={STAGE_DISPLAY[j.stage]} bg={j.stage === "final" ? C.gold + "25" : C.accent + "25"} color={j.stage === "final" ? C.gold : C.accent} /></td>
                <td style={{ padding: "7px 8px", color: C.textSecondary, fontFamily: "monospace" }}>{j.cost}</td>
                <td style={{ padding: "7px 8px", color: C.textSecondary }}>{j.pages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* LITE Loop */}
      <Card>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 14 }}>🔄 The LITE Loop</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {LITE_LOOP.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ padding: "6px 10px", borderRadius: 6, background: step.color + "15", border: `1px solid ${step.color}30`, textAlign: "center", minWidth: 70 }}>
                <div style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: step.color }}>{step.name}</div>
                <div style={{ fontSize: 9, fontFamily: C.font, color: C.textMuted }}>{step.sub}</div>
              </div>
              {i < LITE_LOOP.length - 1 && <span style={{ color: C.textMuted, fontSize: 12 }}>→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MUSE BOARD — Cross-app: Project Management
   ═══════════════════════════════════════════════════════════════ */
function MuseBoardView() {
  const boards = [
    { name: "Spren Roadmap", tasks: 28, inProgress: 2, done: 22, upNext: 4 },
    { name: "Tax Season 2026", tasks: 45, inProgress: 8, done: 12, upNext: 15 },
    { name: "Client Onboarding", tasks: 18, inProgress: 3, done: 10, upNext: 5 },
  ];

  return (
    <div style={{ padding: "28px 36px", maxWidth: 920 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 24 }}>✦</span>
        <h2 style={{ fontFamily: C.font, fontWeight: 800, fontSize: 20, color: SYS_COLORS.muse, margin: 0 }}>Muse Board</h2>
        <Badge text="WEAVER OF WORKFLOWS" bg={SYS_COLORS.muse + "20"} color={SYS_COLORS.muse} />
      </div>
      <p style={{ fontFamily: C.font, fontSize: 13, color: C.textMuted, margin: "0 0 20px 0" }}>Project boards, task tracking, and workflow orchestration</p>

      {/* Board Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {boards.map(b => (
          <Card key={b.name} style={{ cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontFamily: C.font, fontWeight: 700, color: C.textPrimary }}>{b.name}</span>
              <span style={{ fontSize: 12, fontFamily: C.font, color: C.textMuted, marginLeft: "auto" }}>{b.tasks} tasks</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, padding: "8px", borderRadius: 6, background: C.green + "12", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.green }}>{b.done}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>Done</div>
              </div>
              <div style={{ flex: 1, padding: "8px", borderRadius: 6, background: C.accent + "12", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.accent }}>{b.inProgress}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>In Progress</div>
              </div>
              <div style={{ flex: 1, padding: "8px", borderRadius: 6, background: C.orange + "12", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.orange }}>{b.upNext}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>Up Next</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Link */}
      <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 8, background: SYS_COLORS.muse + "10", border: `1px solid ${SYS_COLORS.muse}25`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 14 }}>🔗</span>
        <span style={{ fontSize: 13, fontFamily: C.font, color: C.textSecondary }}>Open full Muse Board at <span style={{ color: SYS_COLORS.muse, fontWeight: 600 }}>localhost:5173</span></span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PANEL
   ═══════════════════════════════════════════════════════════════ */
function AdminView() {
  return (
    <div style={{ padding: "28px 36px", maxWidth: 920 }}>
      <h2 style={{ fontFamily: C.font, fontWeight: 800, fontSize: 20, color: C.textPrimary, margin: "0 0 4px 0" }}>🛡️ Admin Panel</h2>
      <p style={{ fontFamily: C.font, fontSize: 13, color: C.textMuted, margin: "0 0 20px 0" }}>User management, security, and system health across all four systems</p>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>👥 User Management — {OATH_USERS.length} users</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: C.font, fontSize: 13 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["User", "Role", "Status", "Last Login", "Actions"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {OATH_USERS.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "8px 10px", color: C.textPrimary, fontWeight: 600 }}>{u.display}</td>
                <td style={{ padding: "8px 10px" }}><Badge text={u.role} bg={ROLE_BADGE[u.role]?.bg} color={ROLE_BADGE[u.role]?.color} /></td>
                <td style={{ padding: "8px 10px" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><StatusDot status={u.active ? "ok" : "error"} /><span style={{ color: u.active ? C.green : C.textMuted, fontSize: 12 }}>{u.active ? "Active" : "Disabled"}</span></div></td>
                <td style={{ padding: "8px 10px", color: C.textMuted, fontSize: 12 }}>{new Date(u.lastLogin).toLocaleDateString()}</td>
                <td style={{ padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Reset PIN", u.active ? "Disable" : "Enable"].map((a, i) => <button key={i} style={{ padding: "3px 10px", borderRadius: 4, border: "none", background: i === 1 && u.active ? "rgba(237,66,69,0.15)" : "rgba(255,255,255,0.07)", color: i === 1 && u.active ? C.red : C.textSecondary, fontSize: 11, fontFamily: C.font, fontWeight: 600, cursor: "pointer" }}>{a}</button>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>✅ System Health — Four Systems + Infrastructure</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {SYSTEM_CHECKS.map((ch, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(0,0,0,0.15)", borderRadius: 8 }}>
              <StatusDot status={ch.status} />
              <div>
                <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: C.textPrimary }}>{ch.name}</div>
                <div style={{ fontSize: 11, fontFamily: C.font, color: C.textMuted }}>{ch.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>⚡ Admin Commands</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "Run Smoke Tests", icon: "🧪" }, { label: "Force Backup", icon: "💾" },
            { label: "Clear Sessions", icon: "🔒" }, { label: "Rebuild Indexes", icon: "🔄" },
            { label: "Export Audit Log", icon: "📋" }, { label: "Golden File Check", icon: "🏆" },
            { label: "Recalculate Drift", icon: "🎯" }, { label: "Verify DB Integrity", icon: "🛡️" },
          ].map((cmd, i) => (
            <button key={i} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: C.textSecondary, fontSize: 12, fontFamily: C.font, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(88,101,242,0.1)"; e.currentTarget.style.borderColor = "rgba(88,101,242,0.3)"; e.currentTarget.style.color = C.textPrimary; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = C.textSecondary; }}>
              <span>{cmd.icon}</span>{cmd.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REPORTS
   ═══════════════════════════════════════════════════════════════ */
function ReportsView() {
  return (
    <div style={{ padding: "28px 36px", maxWidth: 920 }}>
      <h2 style={{ fontFamily: C.font, fontWeight: 800, fontSize: 20, color: C.textPrimary, margin: "0 0 4px 0" }}>📈 Reports & Telemetry</h2>
      <p style={{ fontFamily: C.font, fontSize: 13, color: C.textMuted, margin: "0 0 20px 0" }}>LITE Loop pipeline status, cost tracking, and quality metrics</p>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>📊 Job Pipeline — LITE Loop Tracking</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: C.font, fontSize: 13 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["Job", "Client", "Type", "LITE Stage", "Cost", "Pages"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {REPORT_JOBS.map(j => (
              <tr key={j.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "7px 8px", color: C.accent, fontWeight: 600, fontFamily: "monospace", fontSize: 12 }}>{j.id}</td>
                <td style={{ padding: "7px 8px", color: C.textPrimary, fontWeight: 600 }}>{j.client}</td>
                <td style={{ padding: "7px 8px", color: C.textSecondary }}>{j.type}</td>
                <td style={{ padding: "7px 8px" }}><Badge text={STAGE_DISPLAY[j.stage]} bg={j.stage === "final" ? C.gold + "25" : C.accent + "25"} color={j.stage === "final" ? C.gold : C.accent} /></td>
                <td style={{ padding: "7px 8px", color: C.textSecondary, fontFamily: "monospace" }}>{j.cost}</td>
                <td style={{ padding: "7px 8px", color: C.textSecondary }}>{j.pages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 14 }}>🔄 Review Chain — mapped to LITE Loop steps 5→6</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {REVIEW_STAGES.map((s, i) => {
            const count = REPORT_JOBS.filter(j => j.stage === s).length;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ padding: "8px 12px", borderRadius: 8, background: count > 0 ? C.accent + "20" : "rgba(255,255,255,0.04)", border: `1px solid ${count > 0 ? C.accent + "40" : "rgba(255,255,255,0.06)"}`, textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontSize: 18, fontFamily: C.font, fontWeight: 800, color: count > 0 ? C.textPrimary : C.textMuted }}>{count}</div>
                  <div style={{ fontSize: 9, fontFamily: C.font, color: C.textMuted, marginTop: 2 }}>{STAGE_DISPLAY[s]}</div>
                </div>
                {i < REVIEW_STAGES.length - 1 && <span style={{ color: C.textMuted, fontSize: 14 }}>→</span>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>📋 Audit Events — Append-Only Log</div>
        {AUDIT_EVENTS.map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: i < AUDIT_EVENTS.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: C.textMuted, flexShrink: 0, marginTop: 2 }}>{ev.ts}</span>
            <StatusDot status={ev.level === "warn" ? "warn" : ev.level === "error" ? "error" : "ok"} />
            <div>
              <span style={{ fontSize: 12, fontFamily: C.font, fontWeight: 600, color: FOUR_SYSTEMS.find(s => s.name === ev.user) ? FOUR_SYSTEMS.find(s => s.name === ev.user).color : C.textPrimary }}>{ev.user}</span>
              <span style={{ fontSize: 12, fontFamily: C.font, color: C.textSecondary, marginLeft: 6 }}>{ev.msg}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENTATION — Lite Platform Architecture
   ═══════════════════════════════════════════════════════════════ */
function DocsView() {
  return (
    <div style={{ padding: "28px 36px", maxWidth: 920 }}>
      <h2 style={{ fontFamily: C.font, fontWeight: 800, fontSize: 20, color: C.textPrimary, margin: "0 0 4px 0" }}>📖 Lite Platform Documentation</h2>
      <p style={{ fontFamily: C.font, fontSize: 13, color: C.gold, fontStyle: "italic", margin: "0 0 20px 0" }}>Order before speed · Truth before automation · Humans before machines</p>

      {/* Pipeline overview */}
      <Card style={{ marginBottom: 18, borderTop: `2px solid ${C.accent}` }}>
        <div style={{ fontSize: 14, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 10 }}>Extraction Pipeline v6 — mapped to LITE Loop</div>
        <div style={{ fontFamily: C.font, fontSize: 12.5, color: C.textSecondary, lineHeight: 1.7, fontFamily: "monospace", background: "rgba(0,0,0,0.2)", padding: 14, borderRadius: 8, whiteSpace: "pre-wrap" }}>
{`PDF → Images (250 DPI)
  → Phase 0: Parallel OCR (Tesseract)    ← LITE Step 1: Event (Trigger)
  → Phase 1: Classify via Claude vision  ← LITE Step 2: CandidateFact
  → Phase 1.5: Group by EIN/entity       ← LITE Step 3: ContextBundle (Lens)
  → Phase 2: Extract fields              ← LITE Step 4: Ardent evaluates
     OCR-first → vision fallback
     [checkpoint saved]
  → Phase 3: Verify critical fields      ← LITE Step 5: Human Review
     [checkpoint saved]
  → Phase 4: Normalize
  → Phase 5: Validate (arithmetic, dedup, variance)
  → Phase 6: Excel + JSON audit log      ← LITE Steps 6-7: Canonical + Statistical`}
        </div>
      </Card>

      {/* Four Systems deep dive */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 14 }}>Four Systems — Deep Reference</div>
        {FOUR_SYSTEMS.map((sys, i) => (
          <div key={sys.key} style={{ padding: "14px 16px", background: "rgba(0,0,0,0.12)", borderRadius: 8, marginBottom: i < 3 ? 10 : 0, borderLeft: `3px solid ${sys.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16, color: sys.color }}>{sys.icon}</span>
              <span style={{ fontSize: 15, fontFamily: C.font, fontWeight: 700, color: C.textPrimary }}>{sys.name}</span>
              <span style={{ fontSize: 9, fontFamily: C.font, fontWeight: 600, color: sys.color, textTransform: "uppercase", letterSpacing: "1px" }}>{sys.subtitle}</span>
            </div>
            <p style={{ fontSize: 13, fontFamily: C.font, color: C.textSecondary, margin: "0 0 8px 0", lineHeight: 1.5 }}>{sys.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {sys.tags.map(t => <SystemTag key={t} text={t} color={sys.color} />)}
            </div>
          </div>
        ))}
      </Card>

      {/* Deployment Checklist */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 10 }}>📋 Deployment Checklist</div>
        {[
          { check: "Python 3 installed and in PATH", critical: true },
          { check: "Tesseract OCR installed and in PATH", critical: true },
          { check: "ANTHROPIC_API_KEY environment variable set", critical: true },
          { check: "Poppler/pdf2image available (pdftoppm)", critical: true },
          { check: "All four systems initialized (OathLedger, Lens, Ardent, Muse)", critical: true },
          { check: "SQLite WAL mode — bearden.db writable", critical: false },
          { check: "Port 5050 available and not blocked", critical: false },
          { check: "Default users seeded, temp PINs reset", critical: true },
          { check: "Append-only audit log verified — no gaps", critical: false },
          { check: "170+ tests passing before deployment", critical: true },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${item.critical ? C.red : C.textMuted}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 11, color: item.critical ? C.red : C.textMuted }}>✓</span></div>
            <span style={{ fontSize: 13, fontFamily: C.font, color: C.textSecondary }}>{item.check}</span>
            {item.critical && <Badge text="CRITICAL" bg={C.red + "20"} color={C.red} />}
          </div>
        ))}
      </Card>

      {/* Governance + Critical Rules */}
      <Card style={{ borderTop: `2px solid ${C.gold}` }}>
        <div style={{ fontSize: 14, fontFamily: C.font, fontWeight: 700, color: C.gold, marginBottom: 10 }}>📜 Governance Principles</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", marginBottom: 18 }}>
          {GOVERNANCE.map((g, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontFamily: C.font, color: C.textSecondary }}>{g}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>⚠️ Critical Rules</div>
        {[
          "Never change extract.py stdout format without updating app.py progress matching",
          "Never remove _operator_category from field flow",
          "Tax documents never generate journal entries",
          "Every journal entry must balance (DR = CR)",
          "Vendor memory file grows over time — never reset it",
          "Client instructions are injected into AI prompts",
          "Context parsing is OCR + pattern matching, not LLM",
          "Checkpoints are auto-deleted on successful completion",
        ].map((rule, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: C.red, fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
            <span style={{ fontSize: 13, fontFamily: C.font, color: C.textSecondary, lineHeight: 1.4 }}>{rule}</span>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, fontFamily: C.font, color: C.gold, fontStyle: "italic" }}>The human remains sovereign.</div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AGENT HUB — Cross-system intelligent agent (CLAUDIFICATION-001)
   Wired to muse-board backend: conversations + spren/chat proxy
   ═══════════════════════════════════════════════════════════════ */

/* ── Agent system prompt for spren/chat proxy ── */
const AGENT_SYSTEM_PROMPT = `You are the Lite Platform Central Agent — a cross-system intelligent assistant for the OathLedger financial platform.

You have access to four systems:
- OathLedger: CandidateFact generation, document intake, canonicalization
- Lens: ContextBundle builder, intent scoping, boundary control
- Ardent: Deterministic rule evaluation, severity scoring, evidence emission
- Muse: Task orchestration, dependency resolution, alignment scoring

Plus: Transaction Ledger, Facts Store, and CAS Telemetry.

Current staff: ${OATH_USERS.filter(u => u.active).length} active users across admin, preparer, reviewer, and partner roles.

Active pipeline:
${REPORT_JOBS.map(j => `- ${j.id}: ${j.client} (${j.type}) — ${j.stage}, ${j.pages} pages, ${j.cost}`).join('\n')}

Governance principles: Deterministic rules before AI, append-only logging, no hidden coupling, humans as final authority, explicit rule versions, 170+ tests per release.

Respond concisely and factually. Reference specific job IDs, system names, and metrics when relevant.`;

/* ── Offline fallback: keyword-based responses when proxy unavailable ── */
function agentFallback(q) {
  const ql = q.toLowerCase();
  if (ql.includes("user") || ql.includes("who")) {
    return `[Offline] OathLedger user store: ${OATH_USERS.filter(u => u.active).length} active users. Roles: 1 admin (Jeffrey Watts), 2 preparers (Ashley, Leigh\u2014disabled), 2 reviewers (Susan, Molly), 2 partners (Charles, Chris). Review chain (LITE steps 5\u21926) is fully staffed.`;
  } else if (ql.includes("lite") || ql.includes("loop") || ql.includes("step")) {
    return `[Offline] LITE Loop: 7-stage pipeline operational.\nStep 1 (Event): 3 triggers today\nStep 2 (CandidateFact): OathLedger generated 54 CandidateFacts\nStep 3 (ContextBundle): Lens scoped all, zero violations\nStep 4 (Ardent): 170+ rules, 1 drift alert (j-003)\nStep 5 (Human Review): 3 jobs in review\nStep 6 (Canonical): 2 finalized\nStep 7 (Statistical): All recorded`;
  } else if (ql.includes("job") || ql.includes("extract")) {
    return `[Offline] Pipeline: ${REPORT_JOBS.length} recent extractions. Ardent flagged drift on j-003 (Davis Holdings, 18.4% edit rate).`;
  } else if (ql.includes("health") || ql.includes("status")) {
    return `[Offline] Cannot reach backend for live status. Cached: all four systems were operational at last check.`;
  } else if (ql.includes("governance") || ql.includes("principle")) {
    return `[Offline] Governance: 6 principles\n\u2713 Deterministic rules before AI\n\u2713 Append-only logging\n\u2713 No hidden coupling\n\u2713 Humans as final authority\n\u2713 Explicit rule versions\n\u2713 170+ tests per release`;
  }
  return `[Offline] Backend unavailable. Keyword match not found for "${q}". Connect to muse-board (port 3001) and register an Anthropic key for full agent capabilities.`;
}

function AgentView() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendOk, setBackendOk] = useState(null); // null=checking, true, false
  const [keyringStatus, setKeyringStatus] = useState(null); // null=checking, 'ok', 'missing', 'disabled'
  const [showKeyringModal, setShowKeyringModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const chatEndRef = useRef(null);

  const WELCOME_MSG = {
    role: "agent",
    text: "Central Agent online. Connected to all four Lite Platform systems:\n\n\u2696\ufe0f OathLedger \u2014 CandidateFact generation, document intake, canonicalization\n\u25ce Lens \u2014 ContextBundle builder, intent scoping, boundary control\n\u25c7 Ardent \u2014 Rule evaluation, severity scoring, evidence emission\n\u2726 Muse \u2014 Task orchestration, dependency resolution, alignment scoring\n\nPlus Transaction Ledger, Facts Store, and CAS Telemetry. Ready for queries.",
  };

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // ── Initialize: check backend, keyring, load/create conversation ──
  useEffect(() => {
    let cancelled = false;
    async function init() {
      // 1. Check backend health
      const healthy = await checkBackendHealth();
      if (cancelled) return;
      setBackendOk(healthy);

      if (!healthy) {
        setKeyringStatus('disabled');
        setHistory([{ ...WELCOME_MSG, text: WELCOME_MSG.text + "\n\n\u26a0\ufe0f Backend (muse-board :3001) unreachable \u2014 running in offline mode with keyword fallback." }]);
        return;
      }

      // 2. Check keyring
      try {
        const keys = await listKeyring(CURRENT_USER.id);
        if (cancelled) return;
        const hasAnthropic = keys.some(k => k.service === 'anthropic');
        setKeyringStatus(hasAnthropic ? 'ok' : 'missing');
      } catch {
        if (cancelled) return;
        setKeyringStatus('disabled');
      }

      // 3. Load most recent agent conversation or create one
      try {
        const convos = await listConversations();
        if (cancelled) return;
        const agentConvo = convos.find(c => c.title?.startsWith('Agent:'));
        if (agentConvo) {
          const full = await getConversation(agentConvo.id);
          if (cancelled) return;
          setConversationId(agentConvo.id);
          // Convert from API format {role, content} to display format {role, text}
          const msgs = (full.messages || []).map(m => ({
            role: m.role === 'assistant' ? 'agent' : m.role,
            text: m.content || m.text,
          }));
          setHistory(msgs.length > 0 ? msgs : [WELCOME_MSG]);
        } else {
          // Create new agent conversation
          const convo = await createConversation('Agent: Central Agent', [
            { role: 'assistant', content: WELCOME_MSG.text },
          ]);
          if (cancelled) return;
          setConversationId(convo.id);
          setHistory([WELCOME_MSG]);
        }
      } catch {
        if (cancelled) return;
        setHistory([WELCOME_MSG]);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  // ── Persist conversation to backend ──
  const persistConversation = useCallback(async (msgs) => {
    if (!conversationId || !backendOk) return;
    try {
      // Convert display format to API format
      const apiMsgs = msgs.map(m => ({
        role: m.role === 'agent' ? 'assistant' : m.role,
        content: m.text,
      }));
      await updateConversation(conversationId, { messages: apiMsgs });
    } catch (e) {
      console.warn('[Agent] Conversation persist failed:', e.message);
    }
  }, [conversationId, backendOk]);

  // ── Submit handler: try spren/chat, fall back to keywords ──
  const handleSubmit = useCallback(async () => {
    if (!query.trim() || loading) return;
    const q = query.trim();
    const userMsg = { role: "user", text: q };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setQuery("");
    setLoading(true);

    let response;
    const useLive = backendOk && keyringStatus === 'ok';

    if (useLive) {
      try {
        // Build message array for Anthropic API
        const apiMessages = newHistory
          .filter(m => m.role === 'user' || m.role === 'agent')
          .map(m => ({
            role: m.role === 'agent' ? 'assistant' : 'user',
            content: m.text,
          }));

        const data = await sprenChat(apiMessages, {
          system: AGENT_SYSTEM_PROMPT,
          userId: CURRENT_USER.id,
        });

        response = data.content?.[0]?.text || "Agent returned empty response.";
      } catch (e) {
        console.warn('[Agent] sprenChat failed, falling back:', e.message);
        response = agentFallback(q);
      }
    } else {
      // Offline/no key: use keyword fallback
      await new Promise(r => setTimeout(r, 400)); // small delay for UX
      response = agentFallback(q);
    }

    const agentMsg = { role: "agent", text: response };
    const finalHistory = [...newHistory, agentMsg];
    setHistory(finalHistory);
    setLoading(false);

    // Persist asynchronously
    persistConversation(finalHistory);
  }, [query, loading, history, backendOk, keyringStatus, persistConversation]);

  // ── New conversation ──
  const handleNewChat = useCallback(async () => {
    if (!backendOk) return;
    try {
      const convo = await createConversation('Agent: Central Agent', [
        { role: 'assistant', content: WELCOME_MSG.text },
      ]);
      setConversationId(convo.id);
      setHistory([WELCOME_MSG]);
    } catch (e) {
      console.warn('[Agent] New conversation failed:', e.message);
    }
  }, [backendOk]);

  // ── Register Anthropic key ──
  const handleKeyRegister = useCallback(async () => {
    if (!keyInput.trim()) return;
    setKeyError("");
    try {
      await registerKey('anthropic', keyInput.trim(), 'Claudification Agent', CURRENT_USER.id);
      setKeyringStatus('ok');
      setShowKeyringModal(false);
      setKeyInput("");
      setHistory(h => [...h, { role: "agent", text: "\u2705 Anthropic API key registered. Agent is now connected to Claude for intelligent responses." }]);
    } catch (e) {
      setKeyError(e.message);
    }
  }, [keyInput]);

  // ── Connection status badge ──
  const statusColor = backendOk === null ? C.textMuted : backendOk ? (keyringStatus === 'ok' ? C.green : C.orange) : C.red;
  const statusLabel = backendOk === null ? "Connecting..." : backendOk ? (keyringStatus === 'ok' ? "Live (Claude)" : "Connected (no API key)") : "Offline";

  return (
    <div style={{ padding: "28px 36px", maxWidth: 920, display: "flex", flexDirection: "column", height: "calc(100vh - 48px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <h2 style={{ fontFamily: C.font, fontWeight: 800, fontSize: 20, color: C.textPrimary, margin: 0 }}>🤖 Centralized Intelligent Agent</h2>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Connection status */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
            <span style={{ fontSize: 10, fontFamily: C.font, fontWeight: 600, color: statusColor }}>{statusLabel}</span>
          </div>
          {/* Key setup button (when missing) */}
          {keyringStatus === 'missing' && (
            <button onClick={() => setShowKeyringModal(true)}
              style={{ padding: "3px 10px", borderRadius: 6, border: `1px solid ${C.orange}40`, background: `${C.orange}10`, color: C.orange, fontSize: 10, fontFamily: C.font, fontWeight: 600, cursor: "pointer" }}>
              \ud83d\udd11 Setup Key
            </button>
          )}
          {/* New chat */}
          {backendOk && (
            <button onClick={handleNewChat} title="New conversation"
              style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.textMuted, fontSize: 10, fontFamily: C.font, fontWeight: 600, cursor: "pointer" }}>
              + New Chat
            </button>
          )}
        </div>
      </div>
      <p style={{ fontFamily: C.font, fontSize: 13, color: C.textMuted, margin: "0 0 14px 0" }}>Query across all four Lite Platform systems and connected data stores</p>

      {/* Connected systems */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {FOUR_SYSTEMS.map(sys => (
          <div key={sys.key} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: `${sys.color}10`, border: `1px solid ${sys.color}30`, borderRadius: 6 }}>
            <StatusDot status="ok" size={6} />
            <span style={{ fontSize: 11, fontFamily: C.font, fontWeight: 600, color: sys.color }}>{sys.name}</span>
          </div>
        ))}
        {["Txn Ledger", "Facts Store", "CAS"].map(db => (
          <div key={db} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(35,165,90,0.08)", border: "1px solid rgba(35,165,90,0.2)", borderRadius: 6 }}>
            <StatusDot status="ok" size={6} />
            <span style={{ fontSize: 11, fontFamily: C.font, fontWeight: 600, color: C.green }}>{db}</span>
          </div>
        ))}
      </div>

      {/* Keyring Registration Modal */}
      {showKeyringModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowKeyringModal(false)}>
          <div style={{ background: C.bgElevated, borderRadius: 12, padding: "24px 28px", maxWidth: 440, width: "90%", border: `1px solid ${C.borderDark}`, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: C.font, fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px 0" }}>\ud83d\udd10 Register Anthropic API Key</h3>
            <p style={{ fontFamily: C.font, fontSize: 13, color: C.textMuted, margin: "0 0 16px 0", lineHeight: 1.5 }}>
              Your key is encrypted server-side via Spren Keyring (SPREN-005). It never touches the browser after registration.
            </p>
            <input value={keyInput} onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleKeyRegister()}
              placeholder="sk-ant-..."
              type="password"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: C.bgDark, color: C.textPrimary, fontSize: 14, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
            {keyError && <div style={{ fontSize: 12, fontFamily: C.font, color: C.red, marginTop: 8 }}>{keyError}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={() => setShowKeyringModal(false)}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.textSecondary, fontSize: 13, fontFamily: C.font, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleKeyRegister}
                style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontFamily: C.font, fontWeight: 700, cursor: "pointer" }}>
                Register Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {history.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: msg.role === "agent" ? C.accent : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 13 }}>{msg.role === "agent" ? "🤖" : "👤"}</span>
            </div>
            <div style={{ padding: "10px 14px", background: msg.role === "agent" ? C.bgElevated : "rgba(88,101,242,0.1)", borderRadius: "4px 12px 12px 12px", maxWidth: "85%" }}>
              <div style={{ fontSize: 10, fontFamily: C.font, fontWeight: 700, color: msg.role === "agent" ? C.accent : C.textMuted, marginBottom: 4, textTransform: "uppercase" }}>
                {msg.role === "agent" ? "Central Agent" : "You"}
              </div>
              <div style={{ fontSize: 13, fontFamily: C.font, color: C.textSecondary, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{msg.text}</div>
            </div>
          </div>
        ))}
        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 13 }}>🤖</span>
            </div>
            <div style={{ padding: "10px 14px", background: C.bgElevated, borderRadius: "4px 12px 12px 12px" }}>
              <div style={{ fontSize: 10, fontFamily: C.font, fontWeight: 700, color: C.accent, marginBottom: 4, textTransform: "uppercase" }}>Central Agent</div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: C.textMuted, fontFamily: C.font }}>Thinking</span>
                <TypingDots />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          disabled={loading}
          placeholder={loading ? "Agent is thinking..." : "Ask about LITE Loop, systems, users, jobs, governance, Ardent rules, Lens contexts..."}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: C.bgElevated, color: C.textPrimary, fontSize: 14, fontFamily: C.font, outline: "none", opacity: loading ? 0.6 : 1 }} />
        <button onClick={handleSubmit} disabled={loading}
          style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: loading ? C.bgMedium : C.accent, color: "#fff", fontSize: 14, fontFamily: C.font, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

/* ── People Panel (right side, Discord-style member list) ── */
function PeoplePanel() {
  const people = OATH_USERS.filter(u => u.active && u.username !== "jeff");
  const voiceActive = ["susan"];
  const typing = ["molly"];

  // Neutral avatar colors — no role signaling
  const avatarColors = ["#4a5568", "#556b7a", "#5c6370", "#4f5d6b", "#5a6474"];
  const getAvatarBg = (i) => `${avatarColors[i % avatarColors.length]}30`;
  const getAvatarText = (i) => avatarColors[i % avatarColors.length];

  return (
    <div style={{ width: 200, minWidth: 200, background: C.bgSidebar, borderLeft: "1px solid rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.35)", display: "flex", alignItems: "center", padding: "0 14px", flexShrink: 0 }}>
        <span style={{ fontFamily: C.font, fontWeight: 700, fontSize: 13, color: C.textPrimary }}>People</span>
        <span style={{ fontSize: 10, fontFamily: C.font, color: C.textMuted, marginLeft: "auto" }}>{people.length} online</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
        {people.map((u, i) => {
          const isSpeaking = voiceActive.includes(u.username);
          const isTyping = typing.includes(u.username);
          return (
            <div key={u.id} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6,
              cursor: "pointer", marginBottom: 2, transition: "background 0.12s", minHeight: 36,
              background: isSpeaking ? "rgba(35,165,90,0.08)" : "transparent",
            }}
              onMouseEnter={e => { if (!isSpeaking) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = isSpeaking ? "rgba(35,165,90,0.08)" : "transparent"; }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: getAvatarBg(i),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isSpeaking ? `0 0 6px ${C.green}50` : "none",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: getAvatarText(i) }}>{u.display[0]}</span>
                </div>
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: C.green, border: `2px solid ${C.bgSidebar}` }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontFamily: C.font, fontWeight: 600, color: isSpeaking ? C.green : C.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.display}</div>
                {isSpeaking && <div style={{ fontSize: 9, fontFamily: C.font, color: C.green }}>🔊 Speaking</div>}
                {isTyping && !isSpeaking && <div style={{ display: "flex", alignItems: "center", gap: 2 }}><TypingDots /></div>}
              </div>
              <span style={{ fontSize: 12, opacity: 0.25, cursor: "pointer", transition: "opacity 0.15s", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.25"}>📞</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Job Share Card (compact-aware) ── */
function JobShareCard({ job, compact }) {
  const sc = job.stage === "final" ? C.gold : job.stage === "partner_review" ? C.green : C.accent;
  return (
    <div style={{ background: `${sc}06`, border: `1px solid ${sc}18`, borderRadius: 8, padding: compact ? "8px 12px" : "12px 16px", marginTop: 4, maxWidth: compact ? "100%" : 400 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: compact ? 14 : 18 }}>📄</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: compact ? 12 : 14, fontFamily: C.font, fontWeight: 600, color: C.textPrimary }}>{job.client}</div>
          <div style={{ fontSize: compact ? 10 : 11, fontFamily: C.font, color: C.textMuted }}>{job.id} · {job.type}</div>
        </div>
        <div style={{ padding: "2px 6px", borderRadius: 3, fontSize: 9, fontFamily: C.font, fontWeight: 600, background: `${sc}15`, color: sc }}>{STAGE_DISPLAY[job.stage]}</div>
      </div>
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 9, opacity: 0.5 }}>🔒</span>
          <span style={{ fontSize: 9, fontFamily: C.font, color: C.textMuted }}>Encrypted · Logged</span>
          <span style={{ fontSize: 11, fontFamily: C.font, color: sc, marginLeft: "auto", cursor: "pointer", fontWeight: 600 }}>Open →</span>
        </div>
      )}
    </div>
  );
}

/* ── COMMS VIEW — Centered Tab Bar, Clean, Compact-able ── */
function CommsView({ commsTab, onCommsTab, compact }) {
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [activeDm, setActiveDm] = useState("susan");
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatConvoId, setChatConvoId] = useState(null);

  // CLAUDIFICATION-001: Seed messages shown on first load; new user messages persist to backend
  const SEED_MESSAGES = [
    { user: "Ashley", time: "2:15 PM", msg: "Davis Holdings extraction complete \u2014 22 pages, ready for review.", role: "preparer" },
    { user: "Susan", time: "2:28 PM", msg: "Moving j-001 to partner review \u2014 Smith Family Trust looks clean.", role: "reviewer" },
    { user: "Susan", time: "2:30 PM", msg: null, role: "reviewer", jobShare: RECENT_JOBS[0], shareMsg: "Here's the Smith Family Trust for sign-off:" },
    { user: "Molly", time: "2:35 PM", msg: "Heads up \u2014 Ardent flagged drift on j-003. Edit rate 18.4%.", role: "reviewer" },
    { user: "Jeffrey Watts", time: "2:40 PM", msg: "Thanks Molly. Charles \u2014 j-001 is in your queue.", role: "admin" },
    { user: "Charles", time: "2:52 PM", msg: "On it. Should have it finalized by end of day.", role: "partner" },
  ];
  const [chatMessages, setChatMessages] = useState(SEED_MESSAGES);

  // Load team chat conversation on mount
  useEffect(() => {
    let cancelled = false;
    async function loadTeamChat() {
      try {
        const convos = await listConversations();
        if (cancelled) return;
        const teamConvo = convos.find(c => c.title?.startsWith('Team:'));
        if (teamConvo) {
          const full = await getConversation(teamConvo.id);
          if (cancelled) return;
          setChatConvoId(teamConvo.id);
          // Merge: seed messages + any persisted user messages
          const persisted = (full.messages || []).map(m => ({
            user: m.user || CURRENT_USER.display,
            time: m.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            msg: m.content || m.msg,
            role: m.role || CURRENT_USER.role,
          }));
          if (persisted.length > SEED_MESSAGES.length) {
            setChatMessages(persisted);
          }
        } else {
          const convo = await createConversation('Team: General', []);
          if (cancelled) return;
          setChatConvoId(convo.id);
        }
      } catch { /* backend unavailable — use seed data */ }
    }
    loadTeamChat();
    return () => { cancelled = true; };
  }, []);

  // Send a chat message
  const handleChatSend = useCallback(async () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { user: CURRENT_USER.display, time: now, msg: chatInput.trim(), role: CURRENT_USER.role };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setChatInput("");

    // Persist to backend
    if (chatConvoId) {
      try {
        const apiMsgs = updated.map(m => ({
          user: m.user, time: m.time, msg: m.msg, content: m.msg, role: m.role,
        }));
        await updateConversation(chatConvoId, { messages: apiMsgs });
      } catch { /* silent — message shows locally */ }
    }
  }, [chatInput, chatMessages, chatConvoId]);

  const tabs = [
    { key: "conversations", label: "Chat", icon: "💬" },
    { key: "calls", label: "Voice & Video", icon: "📞" },
    { key: "dm", label: "Direct", icon: "👤" },
  ];

  // ── Tab Bar — fills width ──
  const TabBar = () => (
    <div style={{ display: "flex", padding: compact ? "8px 8px 0" : "8px 12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, background: "rgba(255,255,255,0.015)" }}>
      {tabs.map(tab => {
        const isActive = commsTab === tab.key;
        return (
          <button key={tab.key} onClick={() => onCommsTab(tab.key)}
            style={{
              flex: 1, padding: compact ? "10px 8px 12px" : "12px 16px 14px", border: "none", cursor: "pointer",
              borderRadius: "8px 8px 0 0",
              background: isActive ? C.bgContent : "transparent",
              borderBottom: isActive ? `2px solid ${C.accent}` : "2px solid transparent",
              color: isActive ? C.textPrimary : C.textMuted,
              fontSize: compact ? 12 : 14, fontFamily: C.font, fontWeight: isActive ? 700 : 500,
              transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: compact ? 4 : 6,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = C.textSecondary; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = isActive ? C.textPrimary : C.textMuted; }}>
            <span style={{ fontSize: compact ? 14 : 16 }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  const pad = compact ? "14px 16px" : "28px 36px";

  // ═══ CALLS & SHARING ═══
  if (commsTab === "calls") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <TabBar />
        <div style={{ flex: 1, overflowY: "auto", padding: pad, width: "100%" }}>
          {/* Screen Share Hero */}
          <div style={{ background: `linear-gradient(135deg, ${C.orange}12, ${C.orange}06)`, border: `1px solid ${C.orange}25`, borderRadius: 12, padding: compact ? "16px" : "24px 28px", marginBottom: 18, cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.orange }} />
            <div style={{ display: "flex", alignItems: compact ? "flex-start" : "center", gap: compact ? 12 : 20, flexDirection: compact ? "column" : "row" }}>
              <span style={{ fontSize: compact ? 36 : 48 }}>🖥️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: compact ? 16 : 18, fontFamily: C.font, fontWeight: 800, color: C.textPrimary, marginBottom: 4 }}>Share Your Screen</div>
                <div style={{ fontSize: 13, fontFamily: C.font, color: C.textSecondary, lineHeight: 1.5 }}>
                  Walk through a return, review extractions, or present to a client.
                </div>
              </div>
              <div style={{ padding: "10px 22px", borderRadius: 8, background: C.orange, color: "#fff", fontSize: 14, fontFamily: C.font, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, textAlign: "center" }}>Start Sharing</div>
            </div>
          </div>

          {/* Voice & Video */}
          <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 18 }}>
            {[
              { icon: "🔊", title: "Voice Call", desc: "Start talking", color: C.green, users: 3 },
              { icon: "📹", title: "Video Call", desc: "Face-to-face", color: C.accent, users: 1 },
            ].map((item, i) => (
              <div key={i} style={{ background: C.bgElevated, borderRadius: 10, padding: "16px 18px", border: `1px solid rgba(255,255,255,0.05)`, cursor: "pointer", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: item.color }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontFamily: C.font, fontWeight: 700, color: C.textPrimary }}>{item.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                      <StatusDot status="ok" size={6} />
                      <span style={{ fontSize: 11, fontFamily: C.font, color: C.green }}>{item.users} online</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rooms */}
          <Card style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, marginBottom: 10 }}>Rooms</div>
            {[
              { name: "Meeting Room", icon: "🔊", occupants: ["Susan", "Molly"] },
              { name: "Huddle", icon: "🔊", occupants: [] },
              { name: "Video Room", icon: "📹", occupants: ["Charles"] },
              { name: "Client Review", icon: "🖥️", occupants: [], status: "3:30 PM" },
            ].map((room, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 6, background: room.occupants.length > 0 ? "rgba(35,165,90,0.06)" : "transparent", cursor: "pointer", marginBottom: 2, minHeight: 40 }}
                onMouseEnter={e => e.currentTarget.style.background = room.occupants.length > 0 ? "rgba(35,165,90,0.1)" : "rgba(255,255,255,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = room.occupants.length > 0 ? "rgba(35,165,90,0.06)" : "transparent"}>
                <span style={{ fontSize: 18 }}>{room.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: C.textPrimary }}>{room.name}</div>
                  <div style={{ fontSize: 11, fontFamily: C.font, color: C.textMuted }}>{room.occupants.length > 0 ? room.occupants.join(", ") : room.status || "Empty"}</div>
                </div>
                <div style={{ padding: "5px 12px", borderRadius: 5, background: room.occupants.length > 0 ? C.green : "rgba(255,255,255,0.06)", color: room.occupants.length > 0 ? "#fff" : C.textSecondary, fontSize: 11, fontFamily: C.font, fontWeight: 600 }}>{room.occupants.length > 0 ? "Join" : "Enter"}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  // ═══ DIRECT MESSAGES — Two-panel: conversation list + active chat ═══
  if (commsTab === "dm") {

    // Neutral avatar palette — no role signaling
    const neutralBg = "rgba(255,255,255,0.08)";
    const neutralText = "#8b95a5";
    const myBg = "rgba(88,101,242,0.12)";
    const myText = C.accent;

    // All conversations — people AND groups mixed, sorted by recency
    const allConversations = [
      { id: "susan", type: "person", label: "Susan", last: "Sent: Smith Trust K-1.pdf", time: "2:45 PM", unread: 2 },
      { id: "review-team", type: "group", label: "Susan, Molly", last: "Drift alert discussed — edit rate 18.4%", time: "2:10 PM", unread: 3, members: ["susan", "molly", "jeff"] },
      { id: "molly", type: "person", label: "Molly", last: "Can you double-check the Ardent flags on j-003?", time: "2:20 PM", unread: 0 },
      { id: "charles", type: "person", label: "Charles", last: "Approved. Moving to final.", time: "1:55 PM", unread: 0 },
      { id: "tax-team", type: "group", label: "Tax Season Team", last: "Extension deadlines pinned", time: "1:45 PM", unread: 0, members: ["susan", "molly", "ashley", "charles", "jeff"] },
      { id: "partners", type: "group", label: "Charles, Chris", last: "Smith Trust sign-off complete", time: "1:40 PM", unread: 0, members: ["charles", "chris", "jeff"] },
      { id: "ashley", type: "person", label: "Ashley", last: "Davis Holdings extraction uploaded", time: "12:30 PM", unread: 1 },
      { id: "onboarding", type: "group", label: "Client Onboarding", last: "New client checklist updated", time: "12:00 PM", unread: 0, members: ["ashley", "susan", "jeff"] },
      { id: "chris", type: "person", label: "Chris", last: "Will review after lunch", time: "11:15 AM", unread: 0 },
      { id: "handoff", type: "group", label: "Susan, Ashley", last: "j-003 handed off for review", time: "10:45 AM", unread: 0, members: ["susan", "ashley", "jeff"] },
      { id: "audit", type: "group", label: "Audit & Compliance", last: "QA checklist for Q4 returns", time: "9:30 AM", unread: 0, members: ["charles", "susan", "molly", "jeff"] },
    ];

    // Message threads — people + groups
    const dmThreads = {
      susan: [
        { from: "susan", time: "2:10 PM", msg: "Jeff, Smith Family Trust is clean. No Ardent flags. Ready for Charles." },
        { from: "jeff", time: "2:15 PM", msg: "Great. Did you check the K-1 allocation against last year?" },
        { from: "susan", time: "2:20 PM", msg: "Yes — allocations match within 0.3%. Lens context was scoped correctly." },
        { from: "susan", time: "2:30 PM", msg: null, file: { name: "Smith_Trust_K1_2025.pdf", type: "tax", size: "2.4 MB", job: "j-001" } },
        { from: "jeff", time: "2:35 PM", msg: "Perfect. Forwarding to Charles now." },
        { from: "susan", time: "2:45 PM", msg: "Also heads up — Molly found drift on j-003. Edit rate is 18.4%." },
      ],
      molly: [
        { from: "molly", time: "1:50 PM", msg: "Jeff, Ardent flagged something on the Davis Holdings job." },
        { from: "jeff", time: "1:55 PM", msg: "What's the severity?" },
        { from: "molly", time: "2:00 PM", msg: "Medium. Edit rate 18.4% — above our 15% threshold. Might need a second extraction pass." },
        { from: "jeff", time: "2:05 PM", msg: "Pull the CAS telemetry and send it over. I want to see the drift pattern." },
        { from: "molly", time: "2:20 PM", msg: "Can you double-check the Ardent flags on j-003?" },
      ],
      charles: [
        { from: "jeff", time: "1:30 PM", msg: "Charles — j-001 Smith Family Trust is in your queue for final sign-off." },
        { from: "charles", time: "1:40 PM", msg: "Got it. Looks straightforward. Any Ardent flags?" },
        { from: "jeff", time: "1:45 PM", msg: "Clean. Susan confirmed K-1 allocations match last year." },
        { from: "charles", time: "1:55 PM", msg: "Approved. Moving to final." },
      ],
      ashley: [
        { from: "ashley", time: "11:45 AM", msg: "Starting Davis Holdings — 22 pages, mostly bank statements and 1099s." },
        { from: "jeff", time: "11:50 AM", msg: "Flag anything over $10k that doesn't match the prior year." },
        { from: "ashley", time: "12:30 PM", msg: "Davis Holdings extraction uploaded" },
        { from: "ashley", time: "12:30 PM", msg: null, file: { name: "Davis_Holdings_1099s.xlsx", type: "workpaper", size: "890 KB", job: "j-003" } },
      ],
      chris: [
        { from: "jeff", time: "10:30 AM", msg: "Chris, can you take Martinez Group when it comes through?" },
        { from: "chris", time: "11:15 AM", msg: "Will review after lunch" },
      ],
      "review-team": [
        { from: "susan", time: "1:55 PM", msg: "Molly, did you see the drift alert on j-003?" },
        { from: "molly", time: "2:00 PM", msg: "Yes — edit rate 18.4%. Above threshold. I'm pulling the telemetry now." },
        { from: "jeff", time: "2:05 PM", msg: "Good catch. Let's see the pattern before we decide on a second pass." },
        { from: "molly", time: "2:10 PM", msg: "Drift alert discussed — edit rate 18.4%" },
      ],
      "tax-team": [
        { from: "charles", time: "1:30 PM", msg: "Extension deadlines coming up. Let's make sure all client files are in the pipeline by Thursday." },
        { from: "ashley", time: "1:35 PM", msg: "I have 3 more sets to extract — Davis, Martinez, and Webb." },
        { from: "susan", time: "1:40 PM", msg: "I can take Webb if Ashley is overloaded." },
        { from: "jeff", time: "1:45 PM", msg: "Extension deadlines pinned. Susan — take Webb. Ashley focus on Davis and Martinez." },
      ],
      "partners": [
        { from: "charles", time: "1:20 PM", msg: "Chris, Smith Trust is coming your way if I don't get to it first." },
        { from: "chris", time: "1:25 PM", msg: "I'm on Martinez. You take Smith." },
        { from: "jeff", time: "1:30 PM", msg: "Charles has Smith. Chris has Martinez. Clean split." },
        { from: "charles", time: "1:40 PM", msg: "Smith Trust sign-off complete." },
      ],
      "onboarding": [
        { from: "ashley", time: "11:30 AM", msg: "New client packet for Henderson LLC came in. Standard setup?" },
        { from: "susan", time: "11:45 AM", msg: "Yes, standard. I'll set up the Lens context scope." },
        { from: "jeff", time: "12:00 PM", msg: "New client checklist updated. Ashley — start extraction once Susan scopes it." },
      ],
      "handoff": [
        { from: "ashley", time: "10:30 AM", msg: "j-003 extraction done. 22 pages processed. Sending to you Susan." },
        { from: "susan", time: "10:45 AM", msg: "j-003 handed off for review. I'll start on it after lunch." },
      ],
      "audit": [
        { from: "charles", time: "9:00 AM", msg: "We need to update the QA checklist for Q4 returns before filing." },
        { from: "susan", time: "9:15 AM", msg: "I'll draft the updated checklist and circulate it." },
        { from: "molly", time: "9:30 AM", msg: "QA checklist for Q4 returns — I'll add the new Ardent threshold rules." },
      ],
    };

    // File type categories
    const fileTypes = [
      { key: "tax", icon: "📄", label: "Tax Documents", desc: "K-1s, W-2s, 1099s, returns" },
      { key: "workpaper", icon: "📊", label: "Workpapers", desc: "Spreadsheets, schedules" },
      { key: "client", icon: "📑", label: "Client Documents", desc: "Bank statements, invoices, receipts" },
      { key: "review", icon: "📋", label: "Review Notes", desc: "Memos, sign-off sheets" },
      { key: "job", icon: "📁", label: "Job Files", desc: "Share from a job folder" },
      { key: "other", icon: "📎", label: "Other File", desc: "Any file type" },
    ];

    const activeConvo = allConversations.find(c => c.id === activeDm);
    const activeUser = activeConvo?.type === "person" ? OATH_USERS.find(u => u.username === activeDm) : null;
    const activeThread = dmThreads[activeDm] || [];
    const voiceActive = ["susan"];
    const typingUsers = ["molly"];
    const isSpeaking = activeUser ? voiceActive.includes(activeDm) : false;
    const isTyping = activeUser ? typingUsers.includes(activeDm) : false;
    const senderName = (from) => { if (from === "jeff") return "You"; const u = OATH_USERS.find(x => x.username === from); return u ? u.display : from; };

    const FileAttachment = ({ file }) => {
      const typeMap = { tax: { icon: "📄", color: C.gold }, workpaper: { icon: "📊", color: C.green }, client: { icon: "📑", color: C.accent }, review: { icon: "📋", color: C.orange }, job: { icon: "📁", color: C.accent }, other: { icon: "📎", color: C.textMuted } };
      const ft = typeMap[file.type] || typeMap.other;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: `${ft.color}08`, border: `1px solid ${ft.color}20`, borderRadius: 8, marginTop: 4, maxWidth: 340, cursor: "pointer" }}>
          <span style={{ fontSize: 24 }}>{ft.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: C.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
            <div style={{ fontSize: 11, fontFamily: C.font, color: C.textMuted }}>{file.size}{file.job ? ` · ${file.job}` : ""}</div>
          </div>
          <span style={{ fontSize: 11, fontFamily: C.font, color: ft.color, fontWeight: 600, flexShrink: 0 }}>Open</span>
        </div>
      );
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <TabBar />
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* ── Left: Conversation list (people + groups mixed) ── */}
          <div style={{ width: compact ? 220 : 280, minWidth: compact ? 220 : 280, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: C.bgSidebar }}>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
              <div style={{ padding: "8px 14px", borderRadius: 6, background: `${C.accent}12`, border: `1px solid ${C.accent}25`, cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = `${C.accent}20`}
                onMouseLeave={e => e.currentTarget.style.background = `${C.accent}12`}>
                <span style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: C.accent }}>+ New Message</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 6px" }}>
              {allConversations.map(convo => {
                const isActive = activeDm === convo.id;
                const isGroup = convo.type === "group";
                return (
                  <div key={convo.id} onClick={() => setActiveDm(convo.id)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, transition: "background 0.12s", minHeight: 52, background: isActive ? "rgba(88,101,242,0.12)" : "transparent" }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isActive ? "rgba(88,101,242,0.12)" : "transparent"; }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: isGroup ? 10 : "50%", background: isGroup ? "rgba(88,101,242,0.1)" : neutralBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: isGroup ? 15 : 14, fontWeight: 700, color: isGroup ? C.accent : neutralText }}>{isGroup ? "👥" : convo.label[0]}</span>
                      </div>
                      {!isGroup && <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: C.green, border: `2px solid ${C.bgSidebar}` }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontFamily: C.font, fontWeight: convo.unread > 0 ? 700 : 600, color: convo.unread > 0 ? C.textPrimary : C.textSecondary }}>{convo.label}</span>
                        <span style={{ fontSize: 10, fontFamily: C.font, color: C.textMuted, flexShrink: 0, marginLeft: 6 }}>{convo.time}</span>
                      </div>
                      <div style={{ fontSize: 11, fontFamily: C.font, color: convo.unread > 0 ? C.textSecondary : C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{convo.last}</div>
                    </div>
                    {convo.unread > 0 && (
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{convo.unread}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Active conversation ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {activeConvo && (
              <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 34, height: 34, borderRadius: activeConvo.type === "group" ? 10 : "50%", background: activeConvo.type === "group" ? "rgba(88,101,242,0.1)" : neutralBg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isSpeaking ? `0 0 8px ${C.green}40` : "none" }}>
                    <span style={{ fontSize: activeConvo.type === "group" ? 16 : 14, fontWeight: 700, color: activeConvo.type === "group" ? C.accent : neutralText }}>{activeConvo.type === "group" ? "👥" : activeConvo.label[0]}</span>
                  </div>
                  {activeUser && <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: C.green, border: `2px solid ${C.bgContent}` }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontFamily: C.font, fontWeight: 700, color: isSpeaking ? C.green : C.textPrimary }}>{activeConvo.label}</div>
                  <div style={{ fontSize: 11, fontFamily: C.font, color: C.textMuted }}>{activeConvo.type === "group" ? `${activeConvo.members.length} members` : (isSpeaking ? "🔊 In voice" : "Online")}</div>
                </div>
                {activeUser && <>
                  <span style={{ fontSize: 18, opacity: 0.4, cursor: "pointer", padding: "6px 8px", borderRadius: 6, transition: "all 0.15s" }} title={`Call ${activeConvo.label}`}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "0.4"; e.currentTarget.style.background = "transparent"; }}>📞</span>
                  <span style={{ fontSize: 18, opacity: 0.4, cursor: "pointer", padding: "6px 8px", borderRadius: 6, transition: "all 0.15s" }} title="Video call"
                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "0.4"; e.currentTarget.style.background = "transparent"; }}>📹</span>
                </>}
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 9, opacity: 0.4 }}>🔒</span>
                  <span style={{ fontSize: 9, fontFamily: C.font, color: C.textMuted }}>Encrypted</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: compact ? "12px 16px" : "16px 24px" }}>
              {activeThread.map((m, i) => {
                const isMe = m.from === "jeff";
                return (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: isMe ? myBg : neutralBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isMe ? myText : neutralText }}>{isMe ? "J" : senderName(m.from)[0]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: isMe ? myText : C.textPrimary }}>{senderName(m.from)}</span>
                        <span style={{ fontSize: 10, fontFamily: C.font, color: C.textMuted }}>{m.time}</span>
                      </div>
                      {m.msg && <div style={{ fontSize: 14, fontFamily: C.font, color: C.textSecondary, lineHeight: 1.5 }}>{m.msg}</div>}
                      {m.file && <FileAttachment file={m.file} />}
                    </div>
                  </div>
                );
              })}
              {isTyping && activeUser && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: 0.7 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: neutralBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: neutralText }}>{activeUser?.display[0]}</span>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: C.font, color: C.textMuted }}>{activeUser?.display} is typing</span>
                  <TypingDots />
                </div>
              )}
            </div>

            {/* Input bar */}
            <div style={{ padding: "10px 20px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, position: "relative" }}>
              {fileMenuOpen && (
                <div style={{ position: "absolute", bottom: "100%", right: 20, background: C.bgElevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 6px", marginBottom: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", minWidth: 260 }}>
                  <div style={{ fontSize: 10, fontFamily: C.font, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 10px 8px" }}>Attach a File</div>
                  {fileTypes.map(ft => (
                    <div key={ft.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, cursor: "pointer", minHeight: 40, transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{ft.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: C.textPrimary }}>{ft.label}</div>
                        <div style={{ fontSize: 11, fontFamily: C.font, color: C.textMuted }}>{ft.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4, padding: "6px 12px 2px", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 9, opacity: 0.4 }}>🔒</span>
                    <span style={{ fontSize: 9, fontFamily: C.font, color: C.textMuted }}>Files are encrypted and audit-logged</span>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input placeholder={`Message ${activeConvo?.label || ""}...`} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: C.bgElevated, color: C.textPrimary, fontSize: 14, fontFamily: C.font, outline: "none", minHeight: 40 }} />
                <button onClick={() => setFileMenuOpen(!fileMenuOpen)}
                  style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${fileMenuOpen ? C.accent + "40" : "rgba(255,255,255,0.1)"}`, background: fileMenuOpen ? `${C.accent}12` : C.bgElevated, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
                  title="Attach a file">📁</button>
                <button style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 14, fontFamily: C.font, fontWeight: 700, cursor: "pointer", minHeight: 40 }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══ CHAT (default) — CLAUDIFICATION-001: now backed by state ═══

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TabBar />
      {/* Channel selector bar — squared-off columns */}
      <div style={{ padding: compact ? "8px 12px" : "10px 28px", display: "flex", alignItems: "center", gap: compact ? 4 : 6, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.03)", overflowX: "auto" }}>
        {[
          { key: "general", label: "General", active: true },
          { key: "tax", label: "Tax Returns" },
          { key: "review", label: "Client Review" },
          { key: "deadlines", label: "Deadlines" },
          { key: "announce", label: "Announcements" },
        ].map(ch => (
          <div key={ch.key} style={{
            padding: compact ? "5px 10px" : "6px 14px",
            borderRadius: 4,
            background: ch.active ? "rgba(88,101,242,0.15)" : "rgba(255,255,255,0.04)",
            border: ch.active ? `1px solid ${C.accent}40` : "1px solid rgba(255,255,255,0.06)",
            cursor: "pointer",
            transition: "all 0.15s",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}>
            <span style={{
              fontSize: compact ? 12 : 13,
              fontFamily: C.font,
              fontWeight: ch.active ? 700 : 500,
              color: ch.active ? C.textPrimary : C.textMuted,
            }}>{ch.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 10, opacity: 0.4 }}>🔒</span>
          {IS_TAX_SEASON && <span style={{ fontSize: 9, fontFamily: C.font, color: C.orange, fontWeight: 600, padding: "2px 6px", borderRadius: 3, background: `${C.orange}10` }}>📋 Tax Season</span>}
        </div>
      </div>

      {/* Messages — CLAUDIFICATION-001: backed by state */}
      <div style={{ flex: 1, overflowY: "auto", padding: compact ? "10px 14px" : "16px 28px" }}>
        {chatMessages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: compact ? 10 : 14, marginBottom: compact ? 14 : 18 }}>
            <div style={{ width: compact ? 30 : 40, height: compact ? 30 : 40, borderRadius: "50%", background: ROLE_BADGE[m.role]?.bg || "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: compact ? 12 : 16, fontFamily: C.font, fontWeight: 700, color: ROLE_BADGE[m.role]?.color }}>{m.user[0]}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: compact ? 13 : 15, fontFamily: C.font, fontWeight: 600, color: ROLE_BADGE[m.role]?.color || C.textPrimary }}>{compact ? m.user.split(" ")[0] : m.user}</span>
                <span style={{ fontSize: 10, fontFamily: C.font, color: C.textMuted }}>{m.time}</span>
              </div>
              {m.msg && <div style={{ fontSize: compact ? 13 : 15, fontFamily: C.font, color: C.textSecondary, lineHeight: 1.5 }}>{m.msg}</div>}
              {m.jobShare && <JobShareCard job={m.jobShare} compact={compact} />}
            </div>
          </div>
        ))}
        {/* Typing indicator at bottom */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: 0.7 }}>
          <div style={{ width: compact ? 20 : 24, height: compact ? 20 : 24, borderRadius: "50%", background: ROLE_BADGE.reviewer?.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, color: ROLE_BADGE.reviewer?.color }}>M</span>
          </div>
          <span style={{ fontSize: 12, fontFamily: C.font, color: C.textMuted }}>Molly is typing</span>
          <TypingDots />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: compact ? "8px 14px 12px" : "12px 28px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, position: "relative" }}>
        {shareMenuOpen && (
          <div style={{ position: "absolute", bottom: "100%", left: compact ? 14 : 28, background: C.bgElevated, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 6px", marginBottom: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", minWidth: compact ? 220 : 300 }}>
            <div style={{ fontSize: 10, fontFamily: C.font, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 10px 6px" }}>Share a Document</div>
            {RECENT_JOBS.slice(0, compact ? 3 : 4).map(j => {
              const sc = j.stage === "final" ? C.gold : j.stage === "partner_review" ? C.green : C.accent;
              return (
                <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 5, cursor: "pointer", minHeight: 36 }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: 16 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 600, color: C.textPrimary }}>{j.client}</div>
                    <div style={{ fontSize: 11, fontFamily: C.font, color: C.textMuted }}>{j.id}</div>
                  </div>
                  {j.unread > 0 && <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{j.unread}</span>
                  </div>}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setShareMenuOpen(!shareMenuOpen)} style={{ minWidth: 36, height: 36, borderRadius: 6, border: `1px solid ${shareMenuOpen ? C.accent + "40" : "rgba(255,255,255,0.1)"}`, background: shareMenuOpen ? `${C.accent}12` : C.bgElevated, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            title="Share a document">📄</button>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleChatSend()}
            placeholder="Message General" style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: C.bgElevated, color: C.textPrimary, fontSize: 14, fontFamily: C.font, outline: "none", minHeight: 36 }} />
          <button onClick={handleChatSend} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 14, fontFamily: C.font, fontWeight: 700, cursor: "pointer", minHeight: 36 }}>Send</button>
        </div>
      </div>
    </div>
  );
}

/* ── Placeholder ── */
function PlaceholderView({ icon, title }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.textMuted, fontFamily: C.font, gap: 10 }}>
      <span style={{ fontSize: 48, opacity: 0.8 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 18, color: C.textSecondary }}>{title}</span>
      <span style={{ fontSize: 14 }}>Coming soon</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CONTENT ROUTER — with file split layout for comms
   ═══════════════════════════════════════════════════════════════ */
function MainContent({ activeView, commsTab, onCommsTab, fileViewOpen, onToggleFileView }) {
  const cat = SERVERS.find(s => s.id === activeView && s.type !== 'divider');

  // ── TEAM (was COMMS): special layout with people panel on right ──
  if (activeView === "team") {
    if (fileViewOpen) {
      // Split layout: file viewer left, comms panel right (no people panel — too narrow)
      return (
        <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
          <div style={{ flex: 1, background: C.bgContent, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.25)", display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0, gap: 10 }}>
              <span style={{ fontFamily: C.font, fontWeight: 700, fontSize: 15, color: C.textPrimary }}>📄 Smith Family Trust — Tax Returns</span>
              <span style={{ fontSize: 10, fontFamily: C.font, color: C.textMuted, marginLeft: "auto" }}>j-001 · Partner Review</span>
              <button onClick={onToggleFileView} style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.textSecondary, fontSize: 11, fontFamily: C.font, cursor: "pointer" }}>Close File</button>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontFamily: C.font }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 64, display: "block", marginBottom: 12, opacity: 0.5 }}>📄</span>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.textSecondary }}>Smith Family Trust</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>14 pages · Tax Returns · $1.24 extraction cost</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 8 }}>
                  <span style={{ fontSize: 10 }}>🔒</span>
                  <span style={{ fontSize: 10, color: C.textMuted }}>Encrypted · Audit-logged · View tracked</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: 320, minWidth: 320, borderLeft: "1px solid rgba(0,0,0,0.3)", background: C.bgContent, display: "flex", flexDirection: "column" }}>
            <CommsView commsTab={commsTab} onCommsTab={onCommsTab} compact={true} />
          </div>
        </div>
      );
    }

    // Normal comms: content fills main square + people panel on right
    return (
      <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
        <div style={{ flex: 1, background: C.bgContent, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.25)", display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0, gap: 10 }}>
            <span style={{ fontFamily: C.font, fontWeight: 700, fontSize: 15, color: C.textPrimary }}>💬 Communications</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, opacity: 0.4 }}>🔒</span>
              <span style={{ fontSize: 10, fontFamily: C.font, color: C.textMuted }}>Encrypted</span>
            </div>
            <button onClick={onToggleFileView} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: C.textSecondary, fontSize: 11, fontFamily: C.font, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              title="Open a file alongside comms">
              <span style={{ fontSize: 12 }}>📄</span> View File
            </button>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <CommsView commsTab={commsTab} onCommsTab={onCommsTab} compact={false} />
          </div>
        </div>
        <PeoplePanel />
      </div>
    );
  }

  // ── Non-comms views: standard layout (Option A routing) ──
  const map = {
    today: <TodayView />, home: <HomeView />,
    engagements: <EngagementsView />, oathledger: <OathLedgerView />,
    museboard: <MuseBoardView />, agent: <AgentView />,
    admin: <AdminView />, reports: <ReportsView />, docs: <DocsView />,
    filesharing: <FileSharingView />,
  };
  return (
    <div style={{ flex: 1, background: C.bgContent, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.25)", display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0, gap: 10 }}>
        <span style={{ fontFamily: C.font, fontWeight: 700, fontSize: 15, color: C.textPrimary }}>
          {cat?.label || "Home"}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>{map[activeView] || <TodayView />}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT — Unified sidebar: server rail + channel panel
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [activeView, setActiveView] = useState("today");
  const [commsTab, setCommsTab] = useState("conversations");
  const [fileViewOpen, setFileViewOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('cf_sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('cf_sidebar_collapsed', String(next)); } catch {}
      return next;
    });
  };

  // CLAUDIFICATION-001: WebSocket connection for real-time updates
  useEffect(() => {
    let ws;
    let reconnectTimer;
    function connect() {
      ws = connectWebSocket(
        (data) => {
          // Handle broadcast events from muse-board
          // Future: update conversation lists, task changes, etc.
          console.log('[Claudification] WS event:', data.type);
        },
        () => setWsConnected(true),
        () => {
          setWsConnected(false);
          // Auto-reconnect after 5s
          reconnectTimer = setTimeout(connect, 5000);
        }
      );
    }
    connect();
    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bgDark, fontFamily: C.font, color: C.textPrimary, overflow: "hidden" }}>
      {/* ── Sidebar container ── */}
      <aside style={{ display: "flex", flexDirection: "row", flexShrink: 0, height: "100vh", background: C.bgDarker, borderRight: `1px solid ${C.borderDark}`, position: "relative" }}>
        {/* Server Rail */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 56, padding: "8px 0", gap: 4, background: C.bgDarker, overflowY: "auto" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {SERVERS.map(srv => {
              if (srv.type === 'divider') {
                return <div key={srv.id} style={{ width: 24, height: 1, background: C.borderDark, margin: "4px 0" }} />;
              }
              const isActive = activeView === srv.id;
              const isHome = srv.id === 'home';
              return (
                <button key={srv.id} onClick={() => setActiveView(srv.page)} title={srv.label}
                  style={{
                    width: 40, height: 40, borderRadius: isActive ? 12 : "50%", border: "none",
                    background: isActive ? C.gold : isHome ? "transparent" : C.bgMedium,
                    color: isActive ? C.bgDarker : isHome ? C.gold : C.textMuted,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease", flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderRadius = "12px"; e.currentTarget.style.background = isHome ? C.bgMedium : C.bgElevated; e.currentTarget.style.color = C.textPrimary; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderRadius = "50%"; e.currentTarget.style.background = isHome ? "transparent" : C.bgMedium; e.currentTarget.style.color = isHome ? C.gold : C.textMuted; } }}>
                  <ServerIconSvg d={srv.icon} />
                </button>
              );
            })}
          </div>
          <ProfileBar />
        </div>
        {/* Channel Panel */}
        <ChannelPanel activeView={activeView} collapsed={collapsed} onCollapse={toggleCollapse} />
        {/* Expand button (when collapsed) */}
        {collapsed && (
          <button onClick={toggleCollapse} title="Expand sidebar"
            style={{ position: "absolute", left: 56, top: 12, background: C.bgSidebar, border: `1px solid ${C.borderDark}`, color: C.textMuted, cursor: "pointer", padding: "4px 2px", borderRadius: "0 4px 4px 0", display: "flex", alignItems: "center", zIndex: 51 }}
            onMouseEnter={e => { e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.bgMedium; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.background = C.bgSidebar; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </aside>
      {/* ── Main content ── */}
      <MainContent activeView={activeView} commsTab={commsTab} onCommsTab={setCommsTab} fileViewOpen={fileViewOpen} onToggleFileView={() => setFileViewOpen(f => !f)} />
    </div>
  );
}
