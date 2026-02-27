# LITE Platform — Full Changelog

**From:** Jeffrey  
**Date:** Feb 25–27, 2026  
**Version:** LITECOMMSCOPY 1.04  
**Status:** React prototype — simulated data, no live backend

---

## Sidebar & Navigation

### 1. Calls Merged Into Communications
- Removed the separate Calls sidebar bubble (8 bubbles → 7)
- All messaging, voice, video, and screen sharing live under a single 💬 Comms bubble

### 2. Tactile Sidebar Bubbles
- Each bubble has a unique tinted gradient background by category:
  - Home: steel blue · Comms: blurple · File Sharing: forest green · Admin: dark red · Reports: amber · Docs: slate purple · Agent: violet
- 3D effect with inset highlights and shadows
- Active state: blue glow with accent gradient · Hover: intensified tint

---

## Communications Hub — 3-Tab System

### 3. Full-Width Tab Bar
- 3 tabs (Chat, Voice & Video, Direct) stretch edge-to-edge across the workspace
- Each tab gets equal width — clean, centered labels
- Active tab: accent underline + content background match

### 4. Chat Tab — Team Messaging
- Channel selector bar: squared-off buttons (General, Tax Returns, Client Review, Deadlines, Announcements) replacing the old `# general` hashtag header
- Full message thread with realistic accounting conversations
- Inline document sharing via JobShareCard with review stage badges
- Typing indicator with animated dots at bottom of chat
- Share menu: 📄 button opens list of recent jobs by client name (job-centric, not system-centric)

### 5. Voice & Video Tab
- Screen sharing as the hero action (large orange gradient card)
- Voice and video call cards as secondary
- 4 fixed persistent rooms: Meeting Room, Huddle, Video Room, Client Review
- Group calls available in sidebar
- Compact mode for split-view layout

### 6. Direct Messages Tab — Full Rebuild
- **Two-panel layout** fills the entire workspace:
  - Left (280px): conversation list with people AND groups interleaved by recency
  - Right (flex-fill): active conversation with message thread, header, and input bar
- **11 conversations** — 5 individual DMs + 6 groups, all clickable and interactable:
  - Individual: Susan, Molly, Charles, Ashley, Chris
  - Groups: "Susan, Molly" · "Charles, Chris" · "Tax Season Team" · "Client Onboarding" · "Susan, Ashley" · "Audit & Compliance"
- Groups use rounded-square avatars (borderRadius: 10) to visually distinguish from person DMs (circles)
- Each group has its own message thread with multi-person conversation
- Unread badges on conversations with new messages
- "+ New Message" button at top of conversation list
- **File attachment**: 📁 button on the input bar opens a picker with 6 accounting-specific file types:
  - 📄 Tax Documents (K-1s, W-2s, 1099s, returns)
  - 📊 Workpapers (spreadsheets, schedules)
  - 📑 Client Documents (bank statements, invoices, receipts)
  - 📋 Review Notes (memos, sign-off sheets)
  - 📁 Job Files (share from a job folder)
  - 📎 Other File (generic fallback)
- Inline file cards render in the message thread when documents are shared (Susan sent a PDF, Ashley sent an Excel file)
- "Files are encrypted and audit-logged" footer on the attachment picker

---

## Layout & Panels

### 7. People Panel — Right Side
- Moved from left sidebar to right edge (like Discord's member list)
- Flat list: just names, online dots, typing/speaking indicators, and 📞 call icons
- No role indicators, no section headers, no colored avatars — everyone is equal in the UI
- Width: 200px, appears only in Comms view
- Hidden automatically during file split-view (not enough room)

### 8. File + Comms Split View
- "View File" button in the comms header splits workspace: document viewer left, comms panel right (320px)
- Comms auto-enters compact mode: smaller avatars, tighter spacing, abbreviated names
- Mock document viewer shows Smith Family Trust with metadata and security signals
- "Close File" returns to normal layout

---

## Role & Identity Design

### 9. Role Indicators Removed from Active UI
- No role-colored avatars anywhere in People panel or DMs
- No "Partner · Online" or role labels in conversation headers — just "Online" or "X members"
- All avatars use a neutral grey-blue palette
- Role information preserved in the system — will surface only in profile views (click to see) and admin tools
- Designed for an intimate team where constant rank display is socially unnecessary
- This becomes a toggle ("show/hide roles") if the platform expands to other companies

### 10. Role-Based Permission System (Backend Logic)
- Every user has a role (admin=4, partner=3, reviewer=2, preparer=1)
- Permissions resolved per role: `canModerate`, `canAssign`, `canShareApps`, `canSetPermissions`, `canVoiceHost`
- UI elements appear/hide based on role — admin sees host controls, moderation tools; lower roles see less
- Partners/admins can grant edit or view-only access; reviewers/preparers limited to view-only

---

## Ambient Features

### 11. Tax Season Auto-Detection
- `IS_TAX_SEASON` computed from current date (Jan 1 – Apr 15)
- When active: "📋 Tax Season" badge in header
- Foundation for future priority sorting, notification changes, quick-share defaults

### 12. Security Signals
- "🔒 Encrypted" in channel and conversation headers
- "Encrypted · Logged" on every shared document card
- "All calls encrypted & logged" in call history
- "Files are encrypted and audit-logged" on attachment picker
- No flashy badges — trust through quiet consistency

### 13. Live Activity Indicators
- **Typing:** animated 3-dot component with staggered CSS keyframes, in sidebar + chat + DMs
- **Voice:** speaking users get green glow on avatar, green name, "🔊 Speaking" label
- Simulated with static data (would be WebSocket events in production)

### 14. Desk-Phone Calling Pattern
- 📞 icon next to every person's name (People panel, DMs, inline on messages)
- Hover brightens, click calls — like picking up a desk extension

### 15. Increased Touch Targets & Font Sizes
- Message text: 15px · All interactive elements: 44px minimum height
- Input fields/buttons: minHeight 40px
- Designed for extended use during tax season

---

## What This Is NOT Yet

These are functional structures in a React prototype. No backend WebSocket, no real encryption, no actual call infrastructure. Data is static/simulated. The goal is to validate interaction patterns before building infrastructure.

---

## File Structure (Local)

```
claudification/
├── src/
│   ├── claudification_v4.jsx        ← Current build (1533 lines)
│   └── LITECOMMSCOPY_1.04.jsx       ← Versioned snapshot
├── versions/                         ← Previous iterations (v1–v3)
├── docs/                             ← Changelogs, GPT prompts, README
├── backend/                          ← app.py, extract.py (reference)
└── assets/                           ← Screenshots
```
