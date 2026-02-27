import { useState } from "react";

/* ══════════════════════════════════════════════════════════════
   CLAUDIFICATION v4 — Lite Platform · OathLedger Muse
   "Order before speed · Truth before automation · Humans before machines"
   ══════════════════════════════════════════════════════════════ */

/* ── Design Tokens ── */
const C = {
  accent: "#5865F2", green: "#23a55a", orange: "#f0a020", red: "#ed4245",
  yellow: "#fee75c", gold: "#c9a44a", bgDark: "#1e1f22", bgDarker: "#111214",
  bgSidebar: "#2b2d31", bgContent: "#313338", bgElevated: "#232428",
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

/* ── Sidebar ── */
const SIDEBAR_CATS = [
  { id: "home", label: "Home", icon: "🏠", group: 0, tint: "#3b5998" },
  { id: "comms", label: "Comms", icon: "💬", group: 1, tint: "#5865F2" },
  { id: "filesharing", label: "FILE\nSHARING", icon: null, isFS: true, group: 1, tint: "#2d7d46" },
  { id: "admin", label: "Admin", icon: "🛡️", group: 2, tint: "#8b3a3a" },
  { id: "reports", label: "Reports", icon: "📈", group: 2, tint: "#7c5c2e" },
  { id: "docs", label: "Docs", icon: "📖", group: 2, tint: "#4a4a6a" },
  { id: "agent", label: "Agent", icon: "🤖", group: 3, tint: "#6b3fa0" },
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
   SIDEBAR BUBBLE
   ═══════════════════════════════════════════════════════════════ */
function SidebarBubble({ cat, active, onClick }) {
  const isActive = active === cat.id;
  const [hov, setHov] = useState(false);
  const tint = cat.tint || C.bgDark;
  const baseBg = `linear-gradient(145deg, ${tint}, ${C.bgDark})`;
  const activeBg = `linear-gradient(145deg, ${C.accent}, #4752c4)`;
  const hoverBg = `linear-gradient(145deg, ${tint}dd, ${tint}88)`;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
      <div style={{ position: "absolute", left: -4, width: 4, height: isActive ? 36 : hov ? 20 : 0, borderRadius: "0 4px 4px 0", background: C.textPrimary, transition: "height 0.2s" }} />
      {hov && <div style={{ position: "absolute", left: 62, zIndex: 999, background: "#111214", color: C.textPrimary, padding: "5px 10px", borderRadius: 5, fontSize: 12, fontFamily: C.font, fontWeight: 600, whiteSpace: "nowrap", pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>{cat.label.replace("\n", " ")}</div>}
      <button onClick={() => onClick(cat.id)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          width: 48, height: 48, borderRadius: isActive || hov ? 16 : 24,
          background: isActive ? activeBg : hov ? hoverBg : baseBg,
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.25s", overflow: "hidden",
          boxShadow: isActive
            ? "0 2px 8px rgba(88,101,242,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
            : hov
              ? `0 2px 8px ${tint}60, inset 0 1px 0 rgba(255,255,255,0.08)`
              : "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)",
        }}>
        {cat.isFS ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1, gap: 1 }}>
            <span style={{ fontSize: 11, fontFamily: C.font, fontWeight: 700, color: C.textPrimary, letterSpacing: "0.6px" }}>FILE</span>
            <span style={{ fontSize: 7.8, fontFamily: C.font, fontWeight: 500, color: "rgba(255,255,255,0.7)", letterSpacing: "0.15px" }}>SHARING</span>
          </div>
        ) : <span style={{ fontSize: 20, lineHeight: 1 }}>{cat.icon}</span>}
      </button>
    </div>
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
   PROFILE BAR (bottom of far-left sidebar)
   ═══════════════════════════════════════════════════════════════ */
function ProfileBar() {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ width: 72, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 12px 0", borderTop: "1px solid rgba(255,255,255,0.06)", background: C.bgDarker }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
        {["🎤", "🎧"].map((ico, i) => (
          <button key={i} style={{ width: 24, height: 24, borderRadius: 5, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, opacity: 0.45, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "0.45"; e.currentTarget.style.background = "transparent"; }}>{ico}</button>
        ))}
      </div>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ position: "relative", cursor: "pointer" }}>
        <div style={{ width: 48, height: 48, borderRadius: hov ? 16 : 24, background: `linear-gradient(135deg,${C.accent},#7289da)`, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-radius 0.25s" }}>
          <span style={{ fontSize: 16, fontFamily: C.font, fontWeight: 800, color: "#fff" }}>JW</span>
        </div>
        <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: C.green, border: `3px solid ${C.bgDarker}` }} />
        {hov && <div style={{ position: "absolute", left: 58, bottom: 4, zIndex: 999, background: "#111214", color: C.textPrimary, padding: "6px 12px", borderRadius: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 13, fontFamily: C.font, fontWeight: 700 }}>Jeffrey W.</div>
          <div style={{ fontSize: 11, fontFamily: C.font, color: C.green }}>Admin · Online</div>
        </div>}
      </div>
      <button style={{ width: 24, height: 24, borderRadius: 5, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, opacity: 0.45, transition: "all 0.15s", marginTop: 6 }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "0.45"; e.currentTarget.style.background = "transparent"; }}>⚙️</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHANNEL LIST — Slim People Panel for Comms, normal for others
   ═══════════════════════════════════════════════════════════════ */
function ChannelList({ activeView, commsTab, onCommsTab }) {
  // ── Comms mode: no left panel — people panel is on the right ──
  if (activeView === "comms") return null;

  // ── Normal mode: standard channel list for other views ──
  const channelMap = {
    home: [
      { type: "header", label: "LITE PLATFORM" },
      { type: "item", label: "# dashboard", active: true },
      { type: "item", label: "# announcements" },
      { type: "divider" },
      { type: "header", label: "FOUR SYSTEMS" },
      { type: "item", label: "⚖️ OathLedger" },
      { type: "item", label: "◎ Lens" },
      { type: "item", label: "◇ Ardent" },
      { type: "item", label: "✦ Muse" },
    ],
    filesharing: [
      { type: "header", label: "FILE NAVIGATION" },
      { type: "item", label: "# upload-queue" },
      { type: "item", label: "# shared-with-me" },
      { type: "item", label: "# recent-files", active: true },
      { type: "divider" },
      { type: "header", label: "BY PERMISSION" },
      { type: "item", label: "🔒 Executive Only" },
      { type: "item", label: "🔐 Management+" },
      { type: "item", label: "🔧 Engineering" },
      { type: "item", label: "🌐 All Staff" },
    ],
    admin: [
      { type: "header", label: "USER MANAGEMENT" },
      { type: "item", label: "👥 All Users", active: true },
      { type: "item", label: "➕ Create User" },
      { type: "item", label: "🔑 Reset PINs" },
      { type: "divider" },
      { type: "header", label: "SECURITY" },
      { type: "item", label: "🛡️ Permissions" },
      { type: "item", label: "📋 Audit Log" },
      { type: "item", label: "🔒 Session Policy" },
      { type: "divider" },
      { type: "header", label: "SYSTEM" },
      { type: "item", label: "✅ Health Checks" },
      { type: "item", label: "💾 Backups" },
      { type: "item", label: "⚡ Commands" },
    ],
    reports: [
      { type: "header", label: "EXTRACTION" },
      { type: "item", label: "📊 Job Pipeline", active: true },
      { type: "item", label: "💰 Cost Tracking" },
      { type: "item", label: "📈 LITE Loop Stats" },
      { type: "divider" },
      { type: "header", label: "QUALITY" },
      { type: "item", label: "🎯 Drift Analysis" },
      { type: "item", label: "🧪 Smoke Tests" },
      { type: "item", label: "🏆 Golden Files" },
    ],
    docs: [
      { type: "header", label: "ARCHITECTURE" },
      { type: "item", label: "📖 Lite Platform", active: true },
      { type: "item", label: "🔄 The LITE Loop" },
      { type: "item", label: "🗃️ Four Systems" },
      { type: "divider" },
      { type: "header", label: "GOVERNANCE" },
      { type: "item", label: "📜 Principles" },
      { type: "item", label: "📋 Checklists" },
      { type: "item", label: "⚠️ Critical Rules" },
    ],
    agent: [
      { type: "header", label: "CENTRAL AGENT" },
      { type: "item", label: "🤖 Agent Console", active: true },
      { type: "item", label: "📡 Live Queries" },
      { type: "divider" },
      { type: "header", label: "CONNECTED SYSTEMS" },
      { type: "item", label: "⚖️ OathLedger" },
      { type: "item", label: "◎ Lens" },
      { type: "item", label: "◇ Ardent" },
      { type: "item", label: "✦ Muse" },
      { type: "divider" },
      { type: "header", label: "DATA STORES" },
      { type: "item", label: "💳 Transaction Ledger" },
      { type: "item", label: "📝 Facts Store" },
      { type: "item", label: "🔍 CAS Telemetry" },
    ],
  };
  const channels = channelMap[activeView] || channelMap.home;
  const titles = { home: "Lite Platform", filesharing: "📁  File Sharing", admin: "🛡️  Admin Panel", reports: "📈  Reports", docs: "📖  Documentation", agent: "🤖  Agent Hub" };

  return (
    <div style={{ width: 230, minWidth: 230, background: C.bgSidebar, display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.35)", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: C.font, fontWeight: 700, fontSize: 15, color: C.textPrimary, flexShrink: 0 }}>
        {titles[activeView] || "CLAUDIFICATION"}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 16px 8px" }}>
        {channels.map((ch, i) => {
          if (ch.type === "header") return <SectionHeader key={i}>{ch.label}</SectionHeader>;
          if (ch.type === "divider") return <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "4px 8px" }} />;
          return (
            <div key={i} style={{ padding: "8px 10px", minHeight: 36, borderRadius: 6, fontSize: 14, fontFamily: C.font, color: ch.active ? C.textPrimary : C.textSecondary, background: ch.active ? "rgba(88,101,242,0.15)" : "transparent", fontWeight: ch.active ? 600 : 400, cursor: "pointer", marginBottom: 2, transition: "background 0.12s" }}
              onMouseEnter={e => { if (!ch.active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!ch.active) e.currentTarget.style.background = "transparent"; }}>
              {ch.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME — Lite Platform Dashboard
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
   AGENT HUB — Cross-system intelligent agent
   ═══════════════════════════════════════════════════════════════ */
function AgentView() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([
    { role: "agent", text: "Central Agent online. Connected to all four Lite Platform systems:\n\n⚖️ OathLedger — CandidateFact generation, document intake, canonicalization\n◎ Lens — ContextBundle builder, intent scoping, boundary control\n◇ Ardent — Rule evaluation, severity scoring, evidence emission\n✦ Muse — Task orchestration, dependency resolution, alignment scoring\n\nPlus Transaction Ledger, Facts Store, and CAS Telemetry. Ready for queries." },
  ]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    const q = query.trim();
    setHistory(h => [...h, { role: "user", text: q }]);
    setQuery("");
    setTimeout(() => {
      let response = "Processing query across all four systems...";
      const ql = q.toLowerCase();
      if (ql.includes("user") || ql.includes("who")) {
        response = `Queried OathLedger user store: ${OATH_USERS.filter(u => u.active).length} active users. Roles: 1 admin (Jeffrey Watts), 2 preparers (Ashley, Leigh—disabled), 2 reviewers (Susan, Molly), 2 partners (Charles, Chris). Review chain (LITE steps 5→6) is fully staffed across all stages.`;
      } else if (ql.includes("lite") || ql.includes("loop") || ql.includes("step")) {
        response = `LITE Loop status: 7-stage pipeline operational.\n\nStep 1 (Event): 3 triggers today\nStep 2 (CandidateFact): OathLedger generated 54 CandidateFacts from 5 jobs\nStep 3 (ContextBundle): Lens scoped all with zero boundary violations\nStep 4 (Ardent): 170+ rules evaluated, 1 drift alert (j-003, 18.4% edit rate)\nStep 5 (Human Review): 3 jobs awaiting review across chain\nStep 6 (Canonical): 2 jobs reached Truth Written (Miller Corp, Bearden Internal)\nStep 7 (Statistical): Muse recorded all completions`;
      } else if (ql.includes("job") || ql.includes("extract")) {
        response = `OathLedger pipeline: ${REPORT_JOBS.length} recent extractions flowing through LITE Loop. Total cost: $4.54. Ardent flagged drift on j-003 (Davis Holdings). Muse tracking: 1 at preparer_review, 1 at reviewer_review, 1 at partner_review, 2 finalized with Canonical Facts written.`;
      } else if (ql.includes("cost") || ql.includes("api")) {
        response = `CAS telemetry (via Muse): 68 API calls in 24h. Cost: $2.10 (Davis Holdings—heaviest, 22 pages), $1.24 (Smith Family Trust), $0.67 (Thompson LLC), $0.38 (Miller Corp), $0.15 (Bearden Internal). OCR-first mode (OathLedger v6) saved ~$38 estimated vs full-vision.`;
      } else if (ql.includes("ardent") || ql.includes("rule")) {
        response = `Ardent status: Pure evaluation engine operational. No database, no I/O, no side effects. 170+ versioned rules active. Last drift check: edit rate 18.4% on j-003 exceeds 15% threshold—severity WARNING. Evidence emission nominal. All purity guarantees holding.`;
      } else if (ql.includes("lens") || ql.includes("context")) {
        response = `Lens status: ContextBundle builder nominal. Today: 5 bundles built with explicit intent, scope, constraints, and actor fields. 1 scope violation caught and retried (11:30 API boundary exceeded). Boundary control enforced on all evaluations. No unbounded evaluations permitted.`;
      } else if (ql.includes("governance") || ql.includes("principle")) {
        response = `Governance check: All 6 principles holding.\n✓ Deterministic rules before AI suggestions\n✓ Append-only event logging (847 events, no gaps)\n✓ No hidden coupling between systems\n✓ Humans as final authority (3 jobs in human review)\n✓ Explicit rule IDs and versions (Ardent v6)\n✓ 170+ tests passing\n\nThe human remains sovereign.`;
      } else if (ql.includes("health") || ql.includes("status")) {
        response = `All four systems operational:\n⚖️ OathLedger: Active — pipeline processing\n◎ Lens: Active — context bundling nominal\n◇ Ardent: Active — 170+ rules, 1 drift warning\n✦ Muse: Active — workflow tracking\n\nInfra: Flask v5.2 on :5050, SQLite WAL, Tesseract v5.3.1, Anthropic API connected. Warning: Disk at 12.3 GB (threshold 10 GB).`;
      }
      setHistory(h => [...h, { role: "agent", text: response }]);
    }, 800);
  };

  return (
    <div style={{ padding: "28px 36px", maxWidth: 920, display: "flex", flexDirection: "column", height: "calc(100vh - 48px)" }}>
      <h2 style={{ fontFamily: C.font, fontWeight: 800, fontSize: 20, color: C.textPrimary, margin: "0 0 4px 0" }}>🤖 Centralized Intelligent Agent</h2>
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
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Ask about LITE Loop, systems, users, jobs, governance, Ardent rules, Lens contexts..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: C.bgElevated, color: C.textPrimary, fontSize: 14, fontFamily: C.font, outline: "none" }} />
        <button onClick={handleSubmit} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 14, fontFamily: C.font, fontWeight: 700, cursor: "pointer" }}>Send</button>
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

  // ═══ CHAT (default) ═══
  const messages = [
    { user: "Ashley", time: "2:15 PM", msg: "Davis Holdings extraction complete — 22 pages, ready for review.", role: "preparer" },
    { user: "Susan", time: "2:28 PM", msg: "Moving j-001 to partner review — Smith Family Trust looks clean.", role: "reviewer" },
    { user: "Susan", time: "2:30 PM", msg: null, role: "reviewer", jobShare: RECENT_JOBS[0], shareMsg: "Here's the Smith Family Trust for sign-off:" },
    { user: "Molly", time: "2:35 PM", msg: "Heads up — Ardent flagged drift on j-003. Edit rate 18.4%.", role: "reviewer" },
    { user: "Jeffrey Watts", time: "2:40 PM", msg: "Thanks Molly. Charles — j-001 is in your queue.", role: "admin" },
    { user: "Charles", time: "2:52 PM", msg: "On it. Should have it finalized by end of day.", role: "partner" },
  ];

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

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: compact ? "10px 14px" : "16px 28px" }}>
        {messages.map((m, i) => (
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
          <input placeholder="Message General" style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: C.bgElevated, color: C.textPrimary, fontSize: 14, fontFamily: C.font, outline: "none", minHeight: 36 }} />
          <button style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: C.accent, color: "#fff", fontSize: 14, fontFamily: C.font, fontWeight: 700, cursor: "pointer", minHeight: 36 }}>Send</button>
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
  const cat = SIDEBAR_CATS.find(c => c.id === activeView);

  // ── COMMS: special layout with people panel on right ──
  if (activeView === "comms") {
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

  // ── Non-comms views: standard layout ──
  const map = {
    home: <HomeView />, filesharing: <FileSharingView />,
    admin: <AdminView />, reports: <ReportsView />, docs: <DocsView />, agent: <AgentView />,
  };
  return (
    <div style={{ flex: 1, background: C.bgContent, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.25)", display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0, gap: 10 }}>
        <span style={{ fontFamily: C.font, fontWeight: 700, fontSize: 15, color: C.textPrimary }}>
          {`${cat?.icon || ""} ${cat?.label?.replace("\n", " ") || "Home"}`}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>{map[activeView] || <HomeView />}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [activeView, setActiveView] = useState("home");
  const [commsTab, setCommsTab] = useState("conversations");
  const [fileViewOpen, setFileViewOpen] = useState(false);
  let lastGroup = -1;
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", background: C.bgDark, fontFamily: C.font, color: C.textPrimary, overflow: "hidden" }}>
      <div style={{ width: 72, minWidth: 72, background: C.bgDarker, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12 }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {SIDEBAR_CATS.map(cat => {
            const showDiv = cat.group !== lastGroup && lastGroup !== -1;
            lastGroup = cat.group;
            return (
              <div key={cat.id}>
                {showDiv && <div style={{ width: 32, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.07)", margin: "2px auto 4px" }} />}
                <SidebarBubble cat={cat} active={activeView} onClick={setActiveView} />
              </div>
            );
          })}
        </div>
        <ProfileBar />
      </div>
      <ChannelList activeView={activeView} commsTab={commsTab} onCommsTab={setCommsTab} />
      <MainContent activeView={activeView} commsTab={commsTab} onCommsTab={setCommsTab} fileViewOpen={fileViewOpen} onToggleFileView={() => setFileViewOpen(f => !f)} />
    </div>
  );
}
