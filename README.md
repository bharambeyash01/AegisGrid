# AegisGrid — EcoGrid & Supply Chain Resilience Intelligence

**AegisGrid** is a real-time clean-energy grid and industrial supply chain resilience command center. It combines multimodal physical asset inspection, live web search threat grounding, a 4-stage autonomous multi-agent mitigation pipeline, dual-speaker executive audio briefings, real-time SSE threshold alerting, and D3.js cross-node propagation analytics.

---

## Key Capabilities

1. **Command Matrix & Telemetry Velocity Gauge**
   - Live corridor telemetry across critical clean-energy and supply chain nodes (North Sea HVDC, Rotterdam Green H2, Taiwan Semiconductor Fab Corridor, Atacama Lithium Hub, Strait of Hormuz Energy Logistics).
   - **Status Shift Velocity Gauge**: Semi-circular SVG instrument gauge next to the Corridor Risk Index displaying real-time momentum (`+/− pts/hr`) and status transition likelihood.
   - **30-Day Risk Evolution**: Interactive Recharts area telemetry with reference threshold markers at `85` (Critical) and `30` (Nominal).
   - **Critical Corridor Pulsing Indicators**: Subtle pulsing crimson glow animations on nodes currently in `Critical` status.

2. **Multimodal Visual Asset Inspection (`/api/inspect`)**
   - Analyzes thermal and optical imagery of HVDC substation transformers, maritime container terminals, and utility solar arrays to detect dielectric hotspots, structural micro-fractures, and IEC/IEEE compliance hazards.

3. **Live Google Search Threat Grounding (`/api/grounding`)**
   - Correlates physical grid telemetry with live global news, maritime congestion advisories, weather disruptions, and regulatory feeds with verified source citations.

4. **4-Stage Autonomous Multi-Agent Mitigation Pipeline (`/api/pipeline`)**
   - Executes a 4-agent reasoning chain (*Telemetry & Physical Anomaly Agent*, *Geopolitical & Environmental Grounding Agent*, *Cascade & Carbon Impact Agent*, and *Mitigation & Dispatch Strategist*) to synthesize quantified load-rerouting actions, MW capacity restoration, and Scope 3 $\text{CO}_2\text{e}$ savings.

5. **D3.js Cross-Node Correlation & 7-Day Cascade Heatmap (`Advanced Analytics` Tab)**
   - Interactive D3.js matrix visualizing how risk spikes at an origin hub propagate downstream across dependent supply chain nodes over a 7-day lookback window ($D-6 \rightarrow D-0$), plus a $5 \times 5$ pairwise Pearson correlation matrix.

6. **Executive Multi-Speaker Audio Briefing (`/api/tts-briefing`)**
   - Generates a two-voice executive command briefing (`Alex` — Grid Operations Director, and `Sam` — Supply Chain Risk Analyst) with instant browser WAV playback.

7. **Real-Time Risk Threshold Alerting (`/api/alerts/stream`)**
   - Server-Sent Events (SSE) stream that pushes non-blocking corner toast alerts and logs events whenever a corridor breaches the `> 85` Critical threshold or stabilizes below `< 30`.

---

## Local Setup & Installation

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd aegisgrid-resilience-intelligence
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and add your Google AI Studio Gemini API Key (`AIza...`):
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY=AIzaSyYourValidGeminiApiKeyHere
```

### 4. Start the Development Server
```bash
npm run dev
```
The full-stack Express + Vite server will start on `http://localhost:3000`.

### 5. Production Build
```bash
npm run build
npm start
```
