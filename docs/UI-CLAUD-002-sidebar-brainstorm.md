# UI-CLAUD-002: Claudification Sidebar Structure — Brainstorm

## The Problem

The current sidebar (v4) has **7 servers**: Home, Comms, Files, Admin, Reports, Docs, Agent.
For a 5-7 person accounting firm, this doesn't match how people actually work:

1. **File Sharing as standalone server** — Files don't exist in isolation. They belong to client engagements.
2. **No cross-app access** — Can't reach Muse Board or OathLedger from Claudification without switching apps.
3. **Server groupings feel like software categories**, not workflows — "Reports" and "Docs" are separate servers but both answer "how's this engagement going?"
4. **Too many clicks** — Finding "the Smith return" requires knowing which server it lives in.

## Design Constraints

- Dark academia palette stays (C tokens unchanged)
- Discord-style bubbles on the server rail (40px circles, personality)
- Two-rail pattern stays (server rail + channel panel)
- Role-gated: admin sees everything, preparer sees their work
- Must support tax season urgency (Jan-Apr) and off-season calm

## Team Profile (Bearden & Associates)

| Person | Role | Primary Work |
|--------|------|-------------|
| Jeffrey Watts | Admin | Everything, firm management |
| Charles | Partner | Return review, client relationships |
| Chris | Partner | Return review, client relationships |
| Susan | Reviewer | Quality review, Ardent flag triage |
| Molly | Reviewer | Quality review, Ardent flag triage |
| Ashley | Preparer | Data entry, extraction review |
| Leigh | Preparer | Data entry, extraction review (inactive) |

---

## Option A: "Engagement-Centric"

**Core idea:** Everything revolves around client engagements. Files, facts, reviews, and communication all belong to a client — not to separate "servers."

### Server Rail

```
 [Sun]    Today           — Your queue, deadlines, alerts
 ----
 [Chat]   Team            — General chat, DMs, announcements
 [Brief]  Engagements     — Client-organized workspace
 ----
 [Scale]  OathLedger      — Extraction pipeline (cross-app)
 [Star]   Muse Board      — Project management (cross-app)
 [Bot]    Agent           — AI console
 ----
 [Gear]   Admin           — (partner+ only)
 [JW]     Jeffrey Watts   — Profile, settings
```

### Channel Panels

**Today** (personal dashboard — no channels, full-width content):
- My assignments (due today, overdue, upcoming)
- Ardent flags that need my attention
- Recent activity feed
- Tax season countdown (if Jan-Apr)

**Team**:
```
CHANNELS
  # general
  # tax-season          (Jan-Apr only, auto-shown)
  # client-review
  # announcements

DIRECT MESSAGES
  Susan          (typing...)
  Charles
  Ashley
  Molly
```

**Engagements** (THE key innovation):
```
ACTIVE RETURNS
  # Smith Family Trust      [Partner Review]  (2)
  # Davis Holdings          [Reviewer Review] (1)
  # Thompson LLC            [Preparer Review]
  # Miller Corp             [Final]

BOOKKEEPING
  # Bearden Internal        [Current]

ARCHIVED (collapsed)
  ...
```

Each engagement channel shows:
- Document list (uploaded PDFs, W-2s, 1099s)
- Extraction status (CandidateFacts generated?)
- Review stage badge
- Ardent findings (drift alerts, rule violations)
- Team assignments
- Activity thread (who did what, when)

**OathLedger** (cross-app jump):
```
EXTRACTION QUEUE
  # incoming              (3 new)
  # processing
  # ready-for-review

FACT REVIEW
  # unverified
  # flagged
```

**Muse Board** (cross-app jump):
```
BOARDS
  # Spren Roadmap         (1 in progress)
  # Tax Season 2026
  # Client Onboarding
```

### Why This Works
- **Ashley (preparer)** opens Claudification, sees "Today" with her 3 assigned extractions. Clicks into "Davis Holdings" engagement — sees the 22-page PDF, extraction status, and Susan's review notes. All in one place.
- **Susan (reviewer)** sees Ardent flags in "Today", clicks into the flagged engagement, reviews the findings, advances the stage.
- **Charles (partner)** checks "Engagements" → sees Smith Family Trust is at Partner Review. Opens it, sees everything, signs off.
- **No one ever opens "Files" as a concept.** Files live where they belong.

### What Dies
- Standalone "Files" server (absorbed into Engagements)
- Standalone "Reports" server (metrics move to Today dashboard)
- Standalone "Docs" server (architecture docs move to Agent or Admin)

---

## Option B: "Four Systems as Workspaces"

**Core idea:** The LITE architecture IS the firm's workflow. Each system is a natural workspace that matches how different roles spend their day.

### Server Rail

```
 [Home]   Firm            — Dashboard, announcements, governance
 ----
 [Scale]  OathLedger      — Extract, structure, verify
 [Eye]    Lens            — Context, scope, prior-year
 [Diamond] Ardent         — Rules, drift, validation
 [Star]   Muse            — Tasks, boards, orchestration
 ----
 [Chat]   Comms           — Team chat + DMs
 [Bot]    Agent           — Cross-system AI
 ----
 [Gear]   Admin           — (partner+ only)
 [JW]     Jeffrey Watts   — Profile
```

### Channel Panels

**Firm** (landing page):
- Today's firm pulse (returns in progress, deadlines, team online)
- Governance principles (always visible)
- Tax season status bar

**OathLedger**:
```
DOCUMENTS
  # extraction-queue      (3)
  # recently-extracted
  # needs-classification

FACTS
  # unverified-candidates (7)
  # verified-today
  # canonical-ledger

CLIENTS
  # Smith Family Trust
  # Davis Holdings
  # Thompson LLC
```

**Lens**:
```
CONTEXT
  # active-bundles
  # prior-year-comparison
  # scope-violations

CONSTRAINTS
  # client-instructions
  # firm-policy
```

**Ardent**:
```
VALIDATION
  # active-evaluations
  # drift-alerts          (1)
  # flagged-findings      (3)

RULES
  # rule-changelog
  # severity-overrides
```

**Muse**:
```
BOARDS
  # Spren Roadmap
  # Tax Season 2026
  # Client Onboarding

PIPELINE
  # all-engagements
  # bottlenecks
  # timeline
```

**Comms** (simplified):
```
  # general
  # tax-season
  # client-review
DIRECT MESSAGES
  Susan, Charles, etc.
```

### Why This Works
- **Maps to architecture** — every team member knows which system they're working in
- **Preparers live in OathLedger** (extraction is their job)
- **Reviewers live in Ardent** (validation is their job)
- **Partners live in Muse** (tracking progress is their job)
- **Admin lives in Firm + Admin** (oversight is their job)
- **Cross-app is native** — OathLedger and Muse aren't "jumps", they're home

### What Dies
- Standalone "Files" server (files are OathLedger documents)
- Standalone "Reports" server (metrics move to Muse pipeline)
- Standalone "Docs" server (architecture docs move to Firm or Agent)

### Risk
- Lens and Ardent may feel empty for non-technical users
- 4 systems + 3 utility servers = 7 bubbles (same count as today)
- Preparers might not understand "Lens" as a navigation concept

---

## Option C: "People + Pipeline"

**Core idea:** In a 5-7 person firm, you know everyone. The natural questions are "Who needs help?" and "Which clients are stuck?" — not "Which system should I open?"

### Server Rail

```
 [Clock]  Now             — Your work right now
 [People] Team            — Who's doing what + chat
 [Chart]  Pipeline        — Every return, every stage
 [Folder] Clients         — Client profiles (everything per-client)
 ----
 [Bolt]   Systems         — OathLedger, Lens, Ardent, Muse
 [Bot]    Agent           — AI console
 ----
 [Gear]   Admin           — (partner+ only)
 [JW]     Jeffrey Watts   — Profile
```

### Channel Panels

**Now** (no channels — full dashboard):
- Your task queue (sorted by urgency)
- Deadlines this week (countdown timers during tax season)
- Ardent alerts assigned to you
- "Quick actions": Start extraction, Continue review, Check pipeline

**Team**:
```
ONLINE NOW
  Susan          Reviewing j-003       (reviewer)
  Ashley         Extracting Davis      (preparer)
  Charles        Idle                  (partner)

CHAT
  # general
  # tax-season
  # announcements

DIRECT MESSAGES
  Susan, Charles, Ashley, Molly
```

**Pipeline** (firm-wide kanban — read from Muse Board API):
```
STAGES
  # Draft                 (0)
  # Preparer Review       (1)
  # Reviewer Review       (1)
  # Partner Review        (1)
  # Final                 (2)

ALERTS
  # bottlenecks           (1)
  # overdue
  # ardent-flags          (2)
```

**Clients** (each client = mini-workspace):
```
ACTIVE CLIENTS
  # Smith Family Trust     [Partner Review]
  # Davis Holdings         [Reviewer Review]
  # Thompson LLC           [Preparer Review]
  # Miller Corp            [Final]
  # Bearden Internal       [Current]

+ New Client
```

Each client channel shows:
- Engagement overview (return type, tax year, assigned team)
- Documents (PDFs, source docs)
- Facts (CandidateFacts, verified facts)
- Review timeline (who reviewed, when, what they found)
- Ardent findings for this client

**Systems** (expandable — power-user access):
```
LITE SYSTEMS
  > OathLedger    Extraction queue (3)
  > Lens          Active bundles
  > Ardent        Drift alerts (1)
  > Muse          Boards
```
Each expands to show system-specific channels (same as Option B but collapsed).

### Why This Works
- **Lowest learning curve** — "Now" shows your work, "Team" shows people, "Pipeline" shows firm status, "Clients" shows details
- **People-first** — small firm means "Susan is reviewing j-003" is more useful than "Ardent has 3 findings"
- **Pipeline is the partner's dream** — one view showing every return at every stage
- **Clients combine everything** — no hunting across Files/Reports/Comms for one client's stuff
- **Systems are there but not dominant** — available for power users, not forcing everyone through architecture

### What Dies
- Standalone "Files" server (files live in Clients)
- Standalone "Reports" server (Pipeline IS the report)
- Standalone "Docs" server (moved to Admin or Agent)
- Standalone "Comms" server (chat absorbed into Team)

### Risk
- Pipeline requires real Muse Board API integration (not mocked)
- "Systems" collapsed view might hide important Ardent alerts
- Team status requires WebSocket connection to track who's online

---

## Comparison Matrix

| Aspect | A: Engagement | B: Four Systems | C: People + Pipeline |
|--------|:---:|:---:|:---:|
| Server count | 8 | 9 | 8 |
| Matches firm workflow | High | Medium | High |
| Cross-app access | Yes (2 bubbles) | Native | Yes (1 expandable) |
| Learning curve | Low | Medium | Lowest |
| File Sharing problem | Solved (in Engagements) | Solved (in OathLedger) | Solved (in Clients) |
| Preparer experience | Good | Good | Best |
| Partner oversight | Good | OK | Best (Pipeline) |
| Scales to 20+ people | Maybe | Yes | No |
| Architecture visibility | Low | Highest | Medium |
| Tax season urgency | Good (Today) | OK | Best (Now + Pipeline) |
| Implementation effort | Medium | High (4 system views) | Medium-High (Pipeline) |

## My Recommendation

**Option A (Engagement-Centric)** is the strongest fit for Bearden & Associates because:

1. It solves the Files problem most naturally — files belong to engagements
2. Cross-app access is clean (OathLedger and Muse Board as dedicated bubbles)
3. The "Engagements" concept maps directly to how the firm already thinks about work
4. It preserves Comms as a standalone server (Team) but kills the three weakest servers (Files, Reports, Docs)
5. Engagement channels can progressively reveal more LITE architecture data (Ardent findings, CandidateFact status) without forcing everyone to understand the Four Systems

However, Option C's "Pipeline" view is excellent and could be added as a view within Option A's Muse Board cross-app bubble.

**Hybrid possibility:** Option A's structure with Option C's Pipeline view embedded in the Muse Board bubble's channel panel. Best of both.

---

*Brainstorm complete. Ready for direction from Jeff.*
