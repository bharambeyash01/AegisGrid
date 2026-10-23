# AegisGrid: Real-Time Risk Threshold Notification System

This plan extends **AegisGrid: EcoGrid & Supply Chain Resilience Intelligence** with a server-authoritative real-time notification system in the Command Matrix. Whenever any monitored corridor's **Overall Risk Score** exceeds **85** (Critical Breach) or drops below **30** (Nominal Stabilization), the system emits structured real-time events and renders non-blocking corner toast alerts with one-click corridor inspection and an auditable Alert Log Drawer.

## User Review & Critical Decisions

> [!IMPORTANT]
> Please review the confirmed real-time notification architecture and UX decisions below before we proceed to implementation.

- **Confirmed Decision 1 (Real-Time Alert Triggers)**:
  1. **Live Server-Sent Telemetry Updates (SSE Stream)**: The Express server maintains authoritative corridor state and streams real-time telemetry updates (`/api/alerts/stream`) to connected clients.
  2. **AI Visual Inspection & Multi-Agent Pipeline Recalculations**: Completing a `gemini-4-argon` visual inspection or approving mitigation playbook actions updates the corridor's authoritative risk score on the server and broadcasts threshold crossings (`> 85` or `< 30`).
  3. **Interactive Corridor Risk Controls in the Command Matrix**: Operators can directly adjust or stress-test corridor risk scores from the Command Matrix row controls (`+10 Surge` / `-15 Mitigate` / `Sync Telemetry`) to immediately verify threshold alerting across connected views.
- **Confirmed Decision 2 (Toast Presentation & Alert Log UX)**:
  - **Non-Blocking Corner Toast Stack**: Fixed bottom-right command toast stack (`z-50`) displaying up to 4 active threshold alerts at a time with explicit semantic coloring (Crimson `#EF4444` for `Risk > 85`, Emerald `#10B981` for `Risk < 30`), tabular numerals, a `Quick Inspect Corridor` action button, and individual dismiss/auto-expiry controls.
  - **Collapsible Alert History Log Drawer**: Accessible directly from the Command Matrix toolbar to inspect all historical threshold breach and stabilization events, mute/unmute auto-toasts, or clear acknowledged alerts.

---

## 1. Overview & Core Concept

- **What It Does**: Continuously monitors the `riskScore` of every EcoGrid and Supply Chain corridor against two critical operational thresholds:
  - **High-Risk Breach (`riskScore > 85`)**: Triggers a `CRITICAL THRESHOLD BREACH` toast alert highlighting the corridor code, previous vs. new risk score, primary threat driver, and a direct button to lock context and jump to the corridor's Visual Inspector / Mitigation Playbook.
  - **Low-Risk Stabilization (`riskScore < 30`)**: Triggers a `NOMINAL STABILIZATION` toast alert confirming that autonomous mitigation or telemetry recovery has brought the corridor into safe operating margins (`< 30`).
- **Target Audience / Persona**: Grid dispatch directors and supply chain reliability engineers who need immediate, non-disruptive visual interrupts when a corridor crosses critical safety boundaries without losing focus on their active analysis panel.
- **Key Value**: Bridges passive dashboard telemetry with active incident response—ensuring no `> 85` thermal/congestion spike or `< 30` stabilization milestone goes unnoticed.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Automated Server-Side Telemetry Stream (`GET /api/alerts/stream`)**:
   - Upon loading the workspace, the client connects to the server's Server-Sent Events (SSE) endpoint.
   - When a server-side telemetry update or operator mutation causes a corridor's `riskScore` to exceed `85` or drop below `30`, the server broadcasts a `risk-threshold-alert` event containing an idempotent alert ID, timestamp, corridor metadata, previous score, new score, and trigger source (`Live Telemetry`, `Gemini Visual Inspection`, `Playbook Mitigation`, or `Matrix Stress Test`).
2. **Interactive Corridor Threshold Testing in Command Matrix**:
   - In Section 01 (*Monitored EcoGrid & Supply Chain Corridors*), each row includes quick interactive telemetry adjustment controls (`-15 Mitigate`, `+10 Surge`) alongside a toolbar `Trigger Live Telemetry Pulse` button and an `Alert Log (N)` drawer toggle.
3. **Non-Blocking Corner Toast Stack**:
   - Alerts enter smoothly in the bottom-right viewport (`transform`/`opacity` transition $\le 180\text{ms}$).
   - Each toast displays:
     - Clean unboxed metadata header: `CRITICAL BREACH (>85)` or `NOMINAL RECOVERY (<30)` · `Corridor Code` · `Trigger Source` · `Timestamp`.
     - Tabular numeral score readout: e.g., `Risk Index: 79 ➔ 88 / 100`.
     - Interactive actions: `Inspect Corridor` (selects the node and scrolls to the relevant panel) and `Dismiss`.
4. **Alert History Drawer / Panel**:
   - Clicking `Alert Log` in the Command Matrix toolbar opens a structured slide-over or expandable ledger listing all captured `> 85` and `< 30` threshold events during the session, with filter controls (`All`, `Critical >85`, `Stabilized <30`) and `Acknowledge All`.

### Visual Identity & Theme

- **Aesthetic Direction**: High-contrast dark command center (`#090D16` canvas, `#111827` surface panels, `1px` crisp borders) adhering strictly to the **Universal Frontend Design Constitution**:
  - **Zero-Pill Discipline**: Metadata inside toasts and the alert log uses clean unboxed typography with `·` separators rather than rounded pill badges.
  - **No Thick Left Accent Borders**: Toasts use subtle all-around 1px semantic borders (`border-rose-500/50` for `> 85` critical alerts, `border-emerald-500/50` for `< 30` nominal recovery alerts) and explicit icon + text labels (`Critical Threshold >85`, `Nominal Threshold <30`).
  - **Tabular Numerals**: All risk scores, threshold deltas, and timestamps use `JetBrains Mono` (`font-mono tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Sent Events (SSE) + REST Mutation Broadcasts on Port 3000**
  - *Chosen Approach*: Implement `GET /api/alerts/stream` (SSE) and update `POST /api/nodes/:id/status` and `POST /api/nodes/pulse` on the Express server so the server acts as the single source of truth for corridor risk scores and broadcasts threshold alerts to all connected clients.
  - *Why*: Fully complies with real-time server-authoritative guidelines, works seamlessly through Vite's dev middleware and Cloud Run HTTP proxies on port 3000, and supports automatic client reconnection.
- **Decision 2: Idempotent Alert Deduplication & Smart Auto-Dismiss**
  - *Chosen Approach*: Guard incoming SSE/mutation alert events by unique `alertId` on the client so reconnections never duplicate toasts; auto-dismiss routine toasts after 8 seconds while preserving all alerts in the persistent Alert History Log.
  - *Why*: Prevents screen clutter while guaranteeing a complete audit trail.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER (AUTHORITATIVE STATE)                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Monitored Nodes Store + Threshold Evaluator (Risk > 85 or Risk < 30)   │  │
│  └───────────┬────────────────────────────┬───────────────────────────────┘  │
│              │                            │                                  │
│   POST /api/nodes/:id/status   GET /api/alerts/stream (Live SSE Broadcast)   │
│   POST /api/nodes/pulse                   │                                  │
└──────────────┼────────────────────────────┼──────────────────────────────────┘
               │                            ▼
┌──────────────┼───────────────────────────────────────────────────────────────┐
│              │        AEGISGRID CLIENT WORKSPACE (React 19)                  │
│              ▼                                                               │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ Command Matrix Row & Toolbar       │  │ AI Inspection & Playbook Hooks │  │
│  │ • [-15 Mitigate] / [+10 Surge]     │  │ • Syncs new Risk Score to API  │  │
│  │ • [Trigger Telemetry Pulse]        │  │ • Evaluates >85 / <30 crossing │  │
│  │ • [Alert Log Drawer Toggle]        │  └───────────────┬────────────────┘  │
│  └───────────────────┬────────────────┘                  │                   │
│                      └─────────────────┬─────────────────┘                   │
│                                        ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Real-Time Notification Engine (Idempotent Event Store)                 │  │
│  │  ├── Non-Blocking Bottom-Right Toast Stack (Quick Inspect + Dismiss)   │  │
│  │  └── Expandable Alert History Log Drawer (Filterable Audit Ledger)     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **`RiskThresholdAlert`**:
  - `id`: Unique string identifier (`ALRT-xxxxxx`) for idempotent deduplication.
  - `nodeId`: Corridor ID (`node-hvdc-northsea`, etc.).
  - `nodeCode`: Corridor short code (`NSEA-HVDC-01`).
  - `nodeName`: Full corridor title.
  - `thresholdType`: `'HIGH_RISK_BREACH'` (`> 85`) | `'LOW_RISK_RECOVERY'` (`< 30`).
  - `previousScore`: Number (`0–100`).
  - `currentScore`: Number (`0–100`).
  - `source`: `'Live Telemetry Stream'` | `'Gemini 4 Argon Inspection'` | `'Mitigation Playbook'` | `'Operator Stress Test'`.
  - `message`: Concise operational description of why the threshold was crossed.
  - `timestamp`: ISO-8601 timestamp.
  - `acknowledged`: Boolean flag for the Alert History Drawer.
