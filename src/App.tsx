import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Upload,
  Search,
  Play,
  Pause,
  Download,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  SlidersHorizontal,
  ArrowUpDown,
  Volume2,
  FileDown,
  Sparkles,
  Layers,
  Eye,
  Globe,
  TrendingUp,
  Bell,
  X,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import {
  SupplyChainNode,
  NodeStatus,
  VisualInspectionReport,
  GroundingIntelligenceReport,
  AgentPipelineReport,
  AudioBriefingReport,
  RiskThresholdAlert
} from './types';
import { CURATED_SAMPLES, renderSampleInspectionDataUrl } from './utils/sampleImages';
import { CrossNodeCorrelationHeatmap } from './components/CrossNodeCorrelationHeatmap';
import { StatusShiftVelocityGauge } from './components/StatusShiftVelocityGauge';

const INITIAL_INSPECTION_REPORT: VisualInspectionReport = {
  inspectionId: 'INSP-849201',
  nodeId: 'node-hvdc-northsea',
  timestamp: '2026-10-23T06:42:18Z',
  modelUsed: 'gemini-4-argon',
  latencyMs: 1420,
  assetType: '400kV HVDC Converter Transformer Bushing Assembly',
  overallRiskScore: 86,
  severityLabel: 'Critical',
  executiveSummary:
    'Radiometric and optical inspection confirms localized 118.4°C thermal runaway at the Phase-B 400kV porcelain bushing base flange (+54.2°C above ambient baseline) accompanied by dielectric oil seepage across radiator bank #07.',
  thermalPeakCelsius: 118.4,
  structuralIntegrityPct: 71.5,
  detectedAnomalies: [
    {
      id: 'ANOM-01',
      component: 'Phase-B 400kV Bushing Flange',
      zone: 'Upper Turret Seal Z-01',
      issue: 'Severe thermal hotspot (118.4°C) indicating internal partial discharge and gasket carbonization',
      severity: 'Critical',
      confidence: 96,
      recommendedAction: 'De-rate converter pole load by 25% immediately and engage redundant cooling loop B',
      complianceStandard: 'IEC 60076-7 / IEEE C57.19.01'
    },
    {
      id: 'ANOM-02',
      component: 'Radiator Fin Bank #07-#08',
      zone: 'Center Manifold Loop',
      issue: 'Restricted oil circulation causing 22.1°C thermal gradient across vertical cooling fins',
      severity: 'Warning',
      confidence: 91,
      recommendedAction: 'Actuate auxiliary forced-oil pumps and schedule dissolved gas analysis (DGA)',
      complianceStandard: 'IEC 60599'
    },
    {
      id: 'ANOM-03',
      component: 'Phase-A & Phase-C Insulator Sheds',
      zone: 'External Creepage Path',
      issue: 'Saline aerosol deposition within acceptable dielectric margin; no flashover tracking detected',
      severity: 'Nominal',
      confidence: 94,
      recommendedAction: 'Maintain standard 30-day robotic demineralized wash cycle',
      complianceStandard: 'IEC 60815'
    }
  ]
};

const INITIAL_GROUNDING_REPORT: GroundingIntelligenceReport = {
  groundingId: 'GRND-309412',
  nodeId: 'node-hvdc-northsea',
  query: 'North Sea HVDC subsea interconnector offshore wind grid congestion maintenance Europe',
  timestamp: '2026-10-23T06:43:05Z',
  modelUsed: 'gemini-3.8-flash + googleSearch',
  latencyMs: 1180,
  summaryText:
    'Live grid and maritime intelligence indicates high offshore wind output across the North Sea basin is driving cross-border HVDC interconnectors (including NorNed, COBRAcable, and North Sea Link corridors) above 90% capacity utilization. Concurrent scheduled transformer maintenance in Northern Germany has tightened N-1 reserve margins across TenneT Eemshaven buses.\n\nRegional transmission operators have issued redispatch advisories to prevent thermal overloading on 380kV/400kV converter stations during peak evening ramp hours, elevating spot balancing costs by 18% across NW European day-ahead markets.',
  threatLevel: 'Critical',
  riskDelta: 6.4,
  keySignals: [
    'North Sea offshore wind surge pushing HVDC converter utilization above 91.5% sustained load',
    'Cross-border redispatch volume between Netherlands and Germany elevated due to onshore line upgrades',
    'Converter station N-1 thermal margin reduced; forced outage would curtail 680 MW of clean wind export',
    'European day-ahead grid balancing prices showing +18.2% intraday volatility premium'
  ],
  verifiedSources: [
    {
      title: 'ENTSO-E Transparency Platform · North Sea Cross-Border Physical Flows',
      uri: 'https://transparency.entsoe.eu/',
      domain: 'transparency.entsoe.eu'
    },
    {
      title: 'TenneT System Operations & Eemshaven Converter Grid Status',
      uri: 'https://www.tennet.eu/',
      domain: 'tennet.eu'
    },
    {
      title: 'International Energy Agency (IEA) · Electricity Grids and Secure Energy Transitions',
      uri: 'https://www.iea.org/reports/electricity-grids-and-secure-energy-transitions',
      domain: 'iea.org'
    }
  ]
};

const INITIAL_PIPELINE_REPORT: AgentPipelineReport = {
  executionId: 'PIPE-992104',
  nodeId: 'node-hvdc-northsea',
  timestamp: '2026-10-23T06:44:10Z',
  modelUsed: 'gemini-4-argon',
  latencyMs: 2190,
  compositeResilienceScore: 68,
  projectedRiskAfterMitigation: 24,
  totalExposureUSD: 4250000,
  scope3EmissionsDeltaTons: 1840,
  agentSteps: [
    {
      stepNumber: 1,
      agentName: 'Telemetry & Physical Anomaly Agent',
      agentRole: 'Multimodal Sensor & Vision Correlation',
      status: 'Verified',
      confidencePct: 96,
      reasoningSummary:
        'Correlated 118.4°C Phase-B bushing flange hotspot from optical/IR inspection with dissolved acetylene trace thresholds. Unchecked thermal ramp exceeds IEC 60076 top-oil limit within 4.5 hours at current 1,400 MW load.',
      keyMetricLabel: 'Time-to-Limit',
      keyMetricValue: '4.5 hrs @ 118.4°C',
      evidenceCited: 'INSP-849201 · Phase-B Turret Z-01'
    },
    {
      stepNumber: 2,
      agentName: 'Geopolitical & Environmental Grounding Agent',
      agentRole: 'Live Web Search & Market Context Synthesis',
      status: 'Verified',
      confidencePct: 93,
      reasoningSummary:
        'Cross-referenced Eemshaven converter stress against live North Sea offshore wind generation surge. Full pole trip would force emergency curtailment of 680 MW renewable feed-in and trigger peaker gas fallback.',
      keyMetricLabel: 'Corridor Load',
      keyMetricValue: '91.8% Utilization',
      evidenceCited: 'GRND-309412 · ENTSO-E / TenneT Feeds'
    },
    {
      stepNumber: 3,
      agentName: 'Cascade & Carbon Impact Agent',
      agentRole: 'Downstream Supply Chain & Scope 3 Modeler',
      status: 'Completed',
      confidencePct: 91,
      reasoningSummary:
        'Quantified downstream impact on Rotterdam green hydrogen electrolyzers and industrial power purchase agreements. Unplanned outage risks $4.25M daily throughput loss and +1,840 tCO2e from thermal gas peaker substitution.',
      keyMetricLabel: 'Carbon Exposure',
      keyMetricValue: '1,840 tCO2e Avoidable',
      evidenceCited: 'Scope 3 Grid Intensity Model · 18.4 kg/MWh'
    },
    {
      stepNumber: 4,
      agentName: 'Mitigation & Dispatch Strategist',
      agentRole: 'Autonomous Load Rerouting & Maintenance Planner',
      status: 'Completed',
      confidencePct: 95,
      reasoningSummary:
        'Synthesized 3-point mitigation playbook: shift 320 MW across COBRAcable/BESS reserve, activate redundant oil-cooling bank B, and pre-stage mobile 400kV spare bushing assembly during low-wind window.',
      keyMetricLabel: 'Risk Reduction',
      keyMetricValue: '86 ➔ 24 (-62 pts)',
      evidenceCited: 'N-1 Contingency Playbook #04'
    }
  ],
  mitigationPlaybook: [
    {
      id: 'ACT-01',
      actionTitle: 'Dynamic 320 MW HVDC Load Shift to COBRAcable & BESS Reserve',
      corridorRoute: 'Eemshaven Bus B ➔ COBRAcable / Permian-Linked Virtual Storage',
      priority: 'Immediate',
      dispatchStatus: 'Approved for Dispatch',
      estimatedSavingsUSD: 2450000,
      mwCapacityRestored: 320,
      carbonReductionTons: 1120,
      leadTimeHours: 0.5
    },
    {
      id: 'ACT-02',
      actionTitle: 'Engage Redundant Forced-Oil Cooling Loop & Automated DGA Sampling',
      corridorRoute: 'Converter Station Bay #04 · Auxiliary Radiator Bank B',
      priority: 'Immediate',
      dispatchStatus: 'Pending Review',
      estimatedSavingsUSD: 1180000,
      mwCapacityRestored: 185,
      carbonReductionTons: 490,
      leadTimeHours: 1.2
    },
    {
      id: 'ACT-03',
      actionTitle: 'Dispatch Robotic Hot-Wash & Spare 400kV Bushing Replacement Crew',
      corridorRoute: 'Rotterdam Logistics Depot ➔ Eemshaven Substation Gate 2',
      priority: 'High',
      dispatchStatus: 'Pending Review',
      estimatedSavingsUSD: 620000,
      mwCapacityRestored: 140,
      carbonReductionTons: 230,
      leadTimeHours: 6.0
    }
  ]
};

export default function App() {
  // Navigation & Workspace Section Focus
  const [activeSection, setActiveSection] = useState<
    'matrix' | 'analytics' | 'inspector' | 'grounding' | 'pipeline' | 'briefing'
  >('matrix');
  const [workspaceTab, setWorkspaceTab] = useState<'all' | 'analytics'>('all');

  // Nodes state
  const [nodes, setNodes] = useState<SupplyChainNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-hvdc-northsea');
  const [statusFilter, setStatusFilter] = useState<'All' | NodeStatus>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'riskScore' | 'capacityMW' | 'dailyThroughputUSD'>('riskScore');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  // Visual Inspection state (gemini-4-argon)
  const [selectedSampleKey, setSelectedSampleKey] = useState<'transformer' | 'port' | 'solar'>('transformer');
  const [inspectionImageBase64, setInspectionImageBase64] = useState<string>('');
  const [inspectionMimeType, setInspectionMimeType] = useState<string>('image/png');
  const [customImageName, setCustomImageName] = useState<string | null>(null);
  const [inspectionDirective, setInspectionDirective] = useState<string>(
    CURATED_SAMPLES[0].defaultDirective
  );
  const [inspectionReport, setInspectionReport] = useState<VisualInspectionReport>(
    INITIAL_INSPECTION_REPORT
  );
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Google Search Grounding state (gemini-3.8-flash + googleSearch)
  const [groundingQuery, setGroundingQuery] = useState<string>(
    'North Sea HVDC subsea interconnector offshore wind grid congestion maintenance Europe'
  );
  const [groundingReport, setGroundingReport] = useState<GroundingIntelligenceReport>(
    INITIAL_GROUNDING_REPORT
  );
  const [isGrounding, setIsGrounding] = useState<boolean>(false);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  // Multi-Agent Reasoning Pipeline state (gemini-4-argon)
  const [pipelineReport, setPipelineReport] = useState<AgentPipelineReport>(INITIAL_PIPELINE_REPORT);
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [activePipelineStage, setActivePipelineStage] = useState<number>(4);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Executive Audio Briefing state (gemini-3.8-flash-tts)
  const [audioBriefing, setAudioBriefing] = useState<AudioBriefingReport | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Full Audit Orchestration state
  const [isRunningFullAudit, setIsRunningFullAudit] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // 30-Day Risk Trend Chart Controls
  const [trendWindow, setTrendWindow] = useState<'30D' | '14D' | '7D'>('30D');
  const [showMitigatedBand, setShowMitigatedBand] = useState<boolean>(true);

  // Real-Time Threshold Notification System State (>85 Critical Breach | <30 Nominal Recovery)
  const [alertHistory, setAlertHistory] = useState<RiskThresholdAlert[]>([]);
  const [activeToasts, setActiveToasts] = useState<RiskThresholdAlert[]>([]);
  const [showAlertDrawer, setShowAlertDrawer] = useState<boolean>(false);
  const [alertLogFilter, setAlertLogFilter] = useState<
    'ALL' | 'HIGH_RISK_BREACH' | 'LOW_RISK_RECOVERY'
  >('ALL');
  const [autoToastEnabled, setAutoToastEnabled] = useState<boolean>(true);
  const seenAlertIdsRef = useRef<Set<string>>(new Set());
  const autoToastEnabledRef = useRef<boolean>(true);

  useEffect(() => {
    autoToastEnabledRef.current = autoToastEnabled;
  }, [autoToastEnabled]);

  // Idempotent Alert Ingestion Helper (pushes to Alert Log + Non-Blocking Toast Stack)
  const ingestThresholdAlert = (incoming: RiskThresholdAlert, triggerToast = true) => {
    if (!incoming || !incoming.id) return;
    if (seenAlertIdsRef.current.has(incoming.id)) return;
    seenAlertIdsRef.current.add(incoming.id);

    setAlertHistory((prev) => [incoming, ...prev.filter((a) => a.id !== incoming.id)].slice(0, 50));

    if (triggerToast && autoToastEnabledRef.current) {
      setActiveToasts((prev) => [incoming, ...prev.filter((t) => t.id !== incoming.id)].slice(0, 4));
      setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== incoming.id));
      }, 8500);
    }
  };

  // Load initial nodes & subscribe to authoritative Server-Sent Events (/api/alerts/stream)
  useEffect(() => {
    let isMounted = true;

    async function fetchInitialNodes() {
      try {
        const res = await fetch('/api/nodes');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data.nodes) && data.nodes.length > 0) {
            setNodes(data.nodes);
          }
          if (Array.isArray(data.alerts)) {
            data.alerts.forEach((a: RiskThresholdAlert) => {
              seenAlertIdsRef.current.add(a.id);
            });
            setAlertHistory(data.alerts);
            // Display the initial critical breach (>85) toast on arrival so operators immediately see active threshold status
            const initialBreach = data.alerts.find(
              (a: RiskThresholdAlert) => a.thresholdType === 'HIGH_RISK_BREACH'
            );
            if (initialBreach) {
              setActiveToasts([initialBreach]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch nodes:', err);
      }
    }

    fetchInitialNodes();

    const eventSource = new EventSource('/api/alerts/stream');

    eventSource.addEventListener('init', (event) => {
      if (!isMounted) return;
      try {
        const payload = JSON.parse((event as MessageEvent).data);
        if (Array.isArray(payload.nodes)) {
          setNodes(payload.nodes);
        }
        if (Array.isArray(payload.alerts)) {
          payload.alerts.forEach((a: RiskThresholdAlert) => {
            seenAlertIdsRef.current.add(a.id);
          });
          setAlertHistory(payload.alerts);
        }
      } catch (e) {
        console.error('SSE init parse error:', e);
      }
    });

    eventSource.addEventListener('node:updated', (event) => {
      if (!isMounted) return;
      try {
        const { node } = JSON.parse((event as MessageEvent).data);
        if (node?.id) {
          setNodes((prev) => prev.map((n) => (n.id === node.id ? node : n)));
        }
      } catch (e) {
        console.error('SSE node:updated parse error:', e);
      }
    });

    eventSource.addEventListener('alert:created', (event) => {
      if (!isMounted) return;
      try {
        const { alert, node } = JSON.parse((event as MessageEvent).data);
        if (node?.id) {
          setNodes((prev) => prev.map((n) => (n.id === node.id ? node : n)));
        }
        if (alert) {
          ingestThresholdAlert(alert, true);
        }
      } catch (e) {
        console.error('SSE alert:created parse error:', e);
      }
    });

    return () => {
      isMounted = false;
      eventSource.close();
    };
  }, []);

  // Generate procedural sample image on sample key change (when not using custom uploaded file)
  useEffect(() => {
    if (!customImageName) {
      const dataUrl = renderSampleInspectionDataUrl(selectedSampleKey);
      setInspectionImageBase64(dataUrl);
      setInspectionMimeType('image/png');
      const spec = CURATED_SAMPLES.find((s) => s.key === selectedSampleKey);
      if (spec) {
        setInspectionDirective(spec.defaultDirective);
      }
    }
  }, [selectedSampleKey, customImageName]);

  const selectedNode = useMemo(() => {
    return (
      nodes.find((n) => n.id === selectedNodeId) || {
        id: 'node-hvdc-northsea',
        code: 'NSEA-HVDC-01',
        name: 'North Sea HVDC Interconnector Hub',
        region: 'Eemshaven, Netherlands · North Sea Grid',
        coordinates: '53.4386° N, 6.8355° E',
        sector: 'Grid Infrastructure' as const,
        status: 'Critical' as const,
        riskScore: 86,
        capacityMW: 1400,
        carbonIntensityKgMWh: 18.4,
        dailyThroughputUSD: 4250000,
        primaryThreat:
          'Converter transformer Phase-B bushing thermal spike (118.4°C) during offshore wind surge',
        lastUpdated: '2026-10-23T06:42:00Z',
        defaultSearchQuery:
          'North Sea HVDC subsea interconnector offshore wind grid congestion maintenance Europe',
        sampleKey: 'transformer' as const
      }
    );
  }, [nodes, selectedNodeId]);

  // Filtered and sorted nodes
  const filteredNodes = useMemo(() => {
    return nodes
      .filter((node) => {
        if (statusFilter !== 'All' && node.status !== statusFilter) return false;
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          return (
            node.name.toLowerCase().includes(q) ||
            node.code.toLowerCase().includes(q) ||
            node.region.toLowerCase().includes(q) ||
            node.sector.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        return sortDesc ? valB - valA : valA - valB;
      });
  }, [nodes, statusFilter, searchFilter, sortBy, sortDesc]);

  // Dynamic Playbook KPIs based on operator approvals
  const playbookMetrics = useMemo(() => {
    const approvedItems = pipelineReport.mitigationPlaybook.filter(
      (item) => item.dispatchStatus === 'Approved for Dispatch' || item.dispatchStatus === 'Simulated'
    );
    const totalSavings = approvedItems.reduce((acc, i) => acc + i.estimatedSavingsUSD, 0);
    const restoredMW = approvedItems.reduce((acc, i) => acc + i.mwCapacityRestored, 0);
    const carbonSaved = approvedItems.reduce((acc, i) => acc + i.carbonReductionTons, 0);
    const riskReduction = Math.min(
      65,
      approvedItems.length * 20 + (restoredMW > 300 ? 12 : 4)
    );
    const dynamicProjectedRisk = Math.max(
      14,
      selectedNode.riskScore - riskReduction
    );
    return {
      approvedCount: approvedItems.length,
      totalSavings,
      restoredMW,
      carbonSaved,
      dynamicProjectedRisk
    };
  }, [pipelineReport.mitigationPlaybook, selectedNode.riskScore]);

  // 30-Day Historical Risk Score Trend Data for Selected Corridor
  const riskTrendData = useMemo(() => {
    const baseProfiles: Record<string, number[]> = {
      'node-hvdc-northsea': [
        42, 44, 43, 46, 45, 48, 51, 49, 52, 54, 53, 56, 58, 57, 61, 63, 60, 64, 67, 69, 71, 74, 73,
        76, 79, 81, 83, 84, 85, selectedNode.riskScore
      ],
      'node-rotterdam-h2': [
        38, 39, 37, 40, 42, 41, 44, 46, 45, 49, 52, 50, 51, 53, 55, 54, 57, 59, 58, 60, 61, 63, 62,
        64, 65, 66, 64, 67, 67, selectedNode.riskScore
      ],
      'node-atacama-lithium': [
        31, 32, 30, 33, 35, 34, 36, 38, 39, 41, 40, 42, 45, 47, 46, 48, 50, 52, 51, 53, 55, 56, 58,
        57, 59, 60, 61, 61, 62, selectedNode.riskScore
      ],
      'node-ercot-bess': [
        29, 28, 30, 27, 26, 28, 25, 24, 26, 25, 23, 24, 22, 23, 25, 24, 22, 21, 23, 22, 24, 23, 21,
        22, 23, 22, 24, 23, 24, selectedNode.riskScore
      ]
    };

    const rawSeries =
      baseProfiles[selectedNode.id] || baseProfiles['node-hvdc-northsea'];

    const endDate = new Date('2026-10-23T00:00:00Z');
    const full30Days = rawSeries.map((score, idx) => {
      const d = new Date(endDate);
      d.setUTCDate(endDate.getUTCDate() - (29 - idx));
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateLabel = `${monthNames[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}`;

      // Calculate mitigated trajectory over the recent 7-day intervention horizon
      const mitigationFactor =
        idx >= 23
          ? Math.round(
              score -
                ((score - playbookMetrics.dynamicProjectedRisk) * (idx - 22)) / 7
            )
          : score;

      return {
        dayIndex: idx + 1,
        date: dateLabel,
        riskScore: score,
        mitigatedScore: Math.max(12, mitigationFactor),
        threshold: 70
      };
    });

    const sliceCount = trendWindow === '7D' ? 7 : trendWindow === '14D' ? 14 : 30;
    const visibleSeries = full30Days.slice(30 - sliceCount);
    const scores = visibleSeries.map((pt) => pt.riskScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const netDelta = scores[scores.length - 1] - scores[0];

    return {
      series: visibleSeries,
      minScore,
      maxScore,
      avgScore,
      netDelta
    };
  }, [selectedNode.id, selectedNode.riskScore, playbookMetrics.dynamicProjectedRisk, trendWindow]);

  // Handle selecting a node from the matrix
  const handleSelectNode = (node: SupplyChainNode) => {
    setSelectedNodeId(node.id);
    setGroundingQuery(node.defaultSearchQuery);
    setCustomImageName(null);
    setSelectedSampleKey(node.sampleKey);
    setStatusBanner(`Context locked to ${node.code} · ${node.name}`);
  };

  // Handle custom image upload for Gemini 4 Argon inspection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setInspectionImageBase64(reader.result);
        setInspectionMimeType(file.type || 'image/png');
        setCustomImageName(file.name);
        setInspectionDirective(
          `Analyze uploaded field photo (${file.name}) for physical defects, thermal anomalies, structural wear, and operational supply-chain risk.`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger Multimodal Image Analysis (gemini-4-argon)
  const handleRunVisualInspection = async () => {
    if (!inspectionImageBase64) return;
    setIsInspecting(true);
    setInspectError(null);
    try {
      const res = await fetch('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: inspectionImageBase64,
          mimeType: inspectionMimeType,
          directive: inspectionDirective,
          nodeId: selectedNode.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Visual inspection request failed.');
      }
      setInspectionReport(data.report);
      if (data.node) {
        setNodes((prev) => prev.map((n) => (n.id === data.node.id ? data.node : n)));
      }
      if (data.alert) {
        ingestThresholdAlert(data.alert, true);
      }
      setStatusBanner(
        `Visual inspection ${data.report.inspectionId} completed in ${data.report.latencyMs}ms`
      );
    } catch (err: unknown) {
      setInspectError(err instanceof Error ? err.message : 'Visual inspection failed.');
    } finally {
      setIsInspecting(false);
    }
  };

  // Trigger Live Web Search Grounding (gemini-3.8-flash + googleSearch)
  const handleRunSearchGrounding = async (overrideQuery?: string) => {
    const q = overrideQuery ?? groundingQuery;
    if (!q.trim()) return;
    setIsGrounding(true);
    setGroundingError(null);
    try {
      const res = await fetch('/api/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          nodeId: selectedNode.id,
          nodeContext: `${selectedNode.name} (${selectedNode.region}) · Primary Threat: ${selectedNode.primaryThreat}`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google Search grounding request failed.');
      }
      setGroundingReport(data.report);
      setStatusBanner(
        `Search grounding ${data.report.groundingId} verified ${data.report.verifiedSources.length} web sources in ${data.report.latencyMs}ms`
      );
    } catch (err: unknown) {
      setGroundingError(err instanceof Error ? err.message : 'Search grounding failed.');
    } finally {
      setIsGrounding(false);
    }
  };

  // Trigger Multi-Agent Reasoning Pipeline (gemini-4-argon)
  const handleRunAgentPipeline = async () => {
    setIsRunningPipeline(true);
    setPipelineError(null);
    setActivePipelineStage(1);

    const stageTimer = setInterval(() => {
      setActivePipelineStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 550);

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node: selectedNode,
          inspectionSummary: inspectionReport.executiveSummary,
          groundingSummary: groundingReport.summaryText
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Multi-agent pipeline failed.');
      }
      setPipelineReport(data.report);
      setActivePipelineStage(4);
      setStatusBanner(
        `Autonomous pipeline ${data.report.executionId} synthesized ${data.report.mitigationPlaybook.length} dispatch actions in ${data.report.latencyMs}ms`
      );
    } catch (err: unknown) {
      setPipelineError(err instanceof Error ? err.message : 'Agent pipeline execution failed.');
    } finally {
      clearInterval(stageTimer);
      setIsRunningPipeline(false);
    }
  };

  // Trigger Dual-Speaker Executive Audio Briefing (gemini-3.8-flash-tts)
  const handleSynthesizeAudioBriefing = async () => {
    setIsGeneratingAudio(true);
    setAudioError(null);
    try {
      const topAction = pipelineReport.mitigationPlaybook[0];
      const mitigationSummary = topAction
        ? `${topAction.actionTitle} on ${topAction.corridorRoute}, restoring ${topAction.mwCapacityRestored} megawatts and saving ${(topAction.estimatedSavingsUSD / 1000000).toFixed(2)} million dollars.`
        : 'Executing automated HVDC load balancing and auxiliary cooling dispatch.';

      const res = await fetch('/api/tts-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeName: selectedNode.name,
          riskScore: inspectionReport.overallRiskScore,
          inspectionSummary: inspectionReport.executiveSummary,
          mitigationSummary
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Audio briefing synthesis failed.');
      }
      setAudioBriefing(data.report);
      setStatusBanner(
        `Dual-speaker WAV audio briefing ${data.report.briefingId} synthesized via gemini-3.8-flash-tts in ${data.report.latencyMs}ms`
      );
    } catch (err: unknown) {
      setAudioError(err instanceof Error ? err.message : 'Failed to synthesize audio briefing.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Run Full End-to-End Audit (Chains Inspection -> Grounding -> Multi-Agent Pipeline)
  const handleRunFullAudit = async () => {
    if (isRunningFullAudit) return;
    setIsRunningFullAudit(true);
    setStatusBanner(`Executing end-to-end resilience audit for ${selectedNode.code}...`);
    try {
      await handleRunVisualInspection();
      await handleRunSearchGrounding();
      await handleRunAgentPipeline();
      setStatusBanner(`Full resilience audit completed for ${selectedNode.name}.`);
    } finally {
      setIsRunningFullAudit(false);
    }
  };

  // Toggle dispatch status in playbook & sync projected risk with authoritative threshold evaluator
  const handleTogglePlaybookStatus = (actionId: string) => {
    setPipelineReport((prev) => {
      const nextPlaybook = prev.mitigationPlaybook.map((item) => {
        if (item.id !== actionId) return item;
        const nextStatus: Record<
          'Pending Review' | 'Approved for Dispatch' | 'Simulated',
          'Pending Review' | 'Approved for Dispatch' | 'Simulated'
        > = {
          'Pending Review': 'Approved for Dispatch',
          'Approved for Dispatch': 'Simulated',
          Simulated: 'Pending Review'
        };
        return {
          ...item,
          dispatchStatus: nextStatus[item.dispatchStatus]
        };
      });

      const approvedItems = nextPlaybook.filter(
        (i) => i.dispatchStatus === 'Approved for Dispatch' || i.dispatchStatus === 'Simulated'
      );
      const restoredMW = approvedItems.reduce((acc, i) => acc + i.mwCapacityRestored, 0);
      const riskReduction = Math.min(65, approvedItems.length * 20 + (restoredMW > 300 ? 12 : 4));
      const newProjectedRisk = Math.max(14, selectedNode.riskScore - riskReduction);

      // If approving/simulating playbook actions drops projected corridor risk < 30 or back > 85, notify server
      if (newProjectedRisk < 30 || newProjectedRisk > 85) {
        fetch(`/api/nodes/${selectedNode.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            riskScore: newProjectedRisk,
            source: 'Mitigation Playbook',
            reason: `Mitigation Playbook (${approvedItems.length} actions active) shifted ${selectedNode.code} Overall Risk Score to ${newProjectedRisk}/100.`
          })
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.node) {
              setNodes((nodesPrev) =>
                nodesPrev.map((n) => (n.id === data.node.id ? data.node : n))
              );
            }
            if (data.alert) {
              ingestThresholdAlert(data.alert, true);
            }
          })
          .catch((err) => console.error('Failed to sync playbook risk status:', err));
      }

      return {
        ...prev,
        mitigationPlaybook: nextPlaybook
      };
    });
  };

  // Interactive Corridor Risk Adjustment in Command Matrix (-15 Mitigate / +12 Surge)
  const handleAdjustCorridorRisk = async (
    node: SupplyChainNode,
    delta: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const targetScore = Math.min(98, Math.max(14, node.riskScore + delta));
    try {
      const res = await fetch(`/api/nodes/${node.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskScore: targetScore,
          source: 'Operator Stress Test',
          reason:
            targetScore > 85
              ? `Command Matrix stress test surged ${node.code} Overall Risk Score to ${targetScore}/100 (exceeds >85 critical threshold).`
              : targetScore < 30
              ? `Command Matrix mitigation lowered ${node.code} Overall Risk Score to ${targetScore}/100 (dropped below <30 nominal threshold).`
              : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.node) {
          setNodes((prev) => prev.map((n) => (n.id === data.node.id ? data.node : n)));
        }
        if (data.alert) {
          ingestThresholdAlert(data.alert, true);
        }
      }
    } catch (err) {
      console.error('Failed to adjust corridor risk score:', err);
    }
  };

  // Trigger Server-Authoritative Live Telemetry Pulse
  const handleTriggerTelemetryPulse = async (mode?: 'breach' | 'stabilize') => {
    try {
      const res = await fetch('/api/nodes/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNodeId: selectedNode.id,
          mode
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.node) {
          setNodes((prev) => prev.map((n) => (n.id === data.node.id ? data.node : n)));
        }
        if (data.alert) {
          ingestThresholdAlert(data.alert, true);
        }
      }
    } catch (err) {
      console.error('Failed to trigger telemetry pulse:', err);
    }
  };

  // Export Resilience Audit Dossier as JSON
  const handleExportDossier = () => {
    const dossier = {
      generatedAt: new Date().toISOString(),
      platform: 'AegisGrid Resilience Intelligence',
      activeNode: selectedNode,
      visualInspection: inspectionReport,
      searchGrounding: groundingReport,
      multiAgentPipeline: pipelineReport
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegisgrid-dossier-${selectedNode.code.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Control WAV audio playback
  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Playback error:', err);
      });
      setIsPlayingAudio(true);
    }
  };

  const scrollToSection = (
    section: 'matrix' | 'analytics' | 'inspector' | 'grounding' | 'pipeline' | 'briefing',
    elementId: string
  ) => {
    setActiveSection(section);
    if (section === 'analytics') {
      setWorkspaceTab('analytics');
    } else {
      setWorkspaceTab('all');
    }
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* STRICT TOP BAR CONTRACT: 1 row, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/90 bg-[#090d16]/95 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('matrix', 'section-matrix');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0"
        >
          AegisGrid
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <a
            href="#section-matrix"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('matrix', 'section-matrix');
            }}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'matrix'
                ? 'text-slate-50 border-emerald-500'
                : 'border-transparent'
            }`}
          >
            Command Matrix
          </a>
          <a
            href="#section-analytics"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('analytics', 'section-analytics');
            }}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'analytics' || workspaceTab === 'analytics'
                ? 'text-slate-50 border-emerald-500'
                : 'border-transparent'
            }`}
          >
            Advanced Analytics
          </a>
          <a
            href="#section-inspector"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('inspector', 'section-inspector');
            }}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'inspector'
                ? 'text-slate-50 border-emerald-500'
                : 'border-transparent'
            }`}
          >
            Visual Inspector
          </a>
          <a
            href="#section-grounding"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('grounding', 'section-grounding');
            }}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'grounding'
                ? 'text-slate-50 border-emerald-500'
                : 'border-transparent'
            }`}
          >
            Live Grounding
          </a>
          <a
            href="#section-pipeline"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('pipeline', 'section-pipeline');
            }}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'pipeline'
                ? 'text-slate-50 border-emerald-500'
                : 'border-transparent'
            }`}
          >
            Agent Pipeline
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={handleRunFullAudit}
            disabled={isRunningFullAudit}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRunningFullAudit ? 'Running Full Audit...' : 'Run Full Audit'}
          </button>
        </div>
      </header>

      {/* Main 1440px Command Container */}
      <main id="top" className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-7 space-y-10">
        {/* Top Command Header & Active Corridor Context Bar */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
              <span>EcoGrid & Supply Chain Resilience Intelligence</span>
              <span aria-hidden="true">·</span>
              <span>Active Corridor: {selectedNode.code}</span>
              <span aria-hidden="true">·</span>
              <span>Coordinates: {selectedNode.coordinates}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight">
              {selectedNode.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedNode.primaryThreat}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {statusBanner && (
              <span className="text-xs text-emerald-300 font-mono pr-2">
                {statusBanner}
              </span>
            )}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md">
              <button
                onClick={() => {
                  setWorkspaceTab('all');
                  setActiveSection('matrix');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  workspaceTab === 'all'
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Command Workspace
              </button>
              <button
                onClick={() => {
                  setWorkspaceTab('analytics');
                  setActiveSection('analytics');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  workspaceTab === 'analytics'
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Advanced Analytics
              </button>
            </div>
            <button
              onClick={handleExportDossier}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-400" />
              Export Audit Dossier
            </button>
          </div>
        </section>

        {/* Dedicated View Banner when Advanced Analytics Tab is Active */}
        {workspaceTab === 'analytics' && (
          <section id="section-analytics-focused" className="space-y-4">
            <CrossNodeCorrelationHeatmap
              nodes={nodes}
              selectedNode={selectedNode}
              onSelectNode={handleSelectNode}
            />
          </section>
        )}

        {/* Full-Width 5-Column Quantitative KPI Strip (Tabular Numerals + Status Shift Velocity Gauge) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-lg flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Corridor Risk Index</span>
              <span
                className={`font-mono font-semibold ${
                  selectedNode.status === 'Critical'
                    ? 'text-rose-400 critical-status-glow'
                    : selectedNode.status === 'Warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-50">
              {selectedNode.riskScore}{' '}
              <span className="text-sm font-normal text-slate-400">
                / 100 ➔ {playbookMetrics.dynamicProjectedRisk} projected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visual thermal peak: {inspectionReport.thermalPeakCelsius.toFixed(1)}°C
            </p>
          </div>

          {/* Gauge Component Next to Corridor Risk Index */}
          <StatusShiftVelocityGauge
            selectedNode={selectedNode}
            recentScores={riskTrendData.series.map((pt) => pt.riskScore)}
            dynamicProjectedRisk={playbookMetrics.dynamicProjectedRisk}
            approvedActionsCount={playbookMetrics.approvedCount}
          />

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-lg flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Monitored Grid Capacity</span>
              <span className="font-mono text-slate-300">{selectedNode.sector}</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-50">
              {selectedNode.capacityMW.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-400">MW</span>
            </div>
            <p className="text-xs text-slate-400">
              +{playbookMetrics.restoredMW} MW protected via active playbook
            </p>
          </div>

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-lg flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Daily Value Throughput</span>
              <span className="font-mono text-emerald-400">Mitigation Active</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-50">
              ${(selectedNode.dailyThroughputUSD / 1000000).toFixed(2)}M{' '}
              <span className="text-sm font-normal text-slate-400">USD / day</span>
            </div>
            <p className="text-xs text-slate-400">
              ${(playbookMetrics.totalSavings / 1000000).toFixed(2)}M loss avoided by approved actions
            </p>
          </div>

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-lg flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Scope 3 Carbon Intensity</span>
              <span className="font-mono text-slate-300">ISO-14064</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-50">
              {selectedNode.carbonIntensityKgMWh.toFixed(1)}{' '}
              <span className="text-sm font-normal text-slate-400">kg CO2e/MWh</span>
            </div>
            <p className="text-xs text-slate-400">
              {playbookMetrics.carbonSaved.toLocaleString()} tCO2e peaker fallback prevented
            </p>
          </div>

          {/* 30-Day Historical Risk Score Trend Chart (Spans Full KPI Strip Width) */}
          <div className="sm:col-span-2 lg:col-span-5 p-5 bg-slate-900/70 border border-slate-800 rounded-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>30-Day Corridor Risk Evolution</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedNode.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    Window Avg: {riskTrendData.avgScore}/100
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    Peak: {riskTrendData.maxScore}/100
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`tabular-nums font-semibold ${
                      riskTrendData.netDelta > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {trendWindow} Delta: {riskTrendData.netDelta > 0 ? `+${riskTrendData.netDelta}` : riskTrendData.netDelta} pts
                  </span>
                </div>
                <h2 className="font-display text-sm font-semibold text-slate-100">
                  Historical Telemetry Risk Trajectory & Autonomous Mitigation Projection ({selectedNode.name})
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowMitigatedBand(!showMitigatedBand)}
                  className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    showMitigatedBand
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {showMitigatedBand ? 'Mitigated Projection: On' : 'Mitigated Projection: Off'}
                </button>

                <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
                  {(['30D', '14D', '7D'] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => setTrendWindow(w)}
                      className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        trendWindow === w
                          ? 'bg-slate-800 text-slate-50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={riskTrendData.series}
                  margin={{ top: 10, right: 16, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="riskScoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={
                          selectedNode.status === 'Critical'
                            ? '#f43f5e'
                            : selectedNode.status === 'Warning'
                            ? '#f59e0b'
                            : '#10b981'
                        }
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          selectedNode.status === 'Critical'
                            ? '#f43f5e'
                            : selectedNode.status === 'Warning'
                            ? '#f59e0b'
                            : '#10b981'
                        }
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                    <linearGradient id="mitigatedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                    minTickGap={24}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                    tickLine={false}
                    axisLine={false}
                    ticks={[0, 25, 50, 70, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#f8fafc'
                    }}
                    itemStyle={{ padding: '2px 0' }}
                    formatter={(value: unknown, name: string) => [
                      `${value} / 100`,
                      name === 'riskScore'
                        ? 'Observed Risk Index'
                        : 'Mitigated Playbook Trajectory'
                    ]}
                    labelFormatter={(label) => `Date: ${label}, 2026`}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'CRITICAL THRESHOLD (70)',
                      position: 'insideTopRight',
                      fill: '#f87171',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="riskScore"
                    stroke={
                      selectedNode.status === 'Critical'
                        ? '#f43f5e'
                        : selectedNode.status === 'Warning'
                        ? '#f59e0b'
                        : '#10b981'
                    }
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#riskScoreFill)"
                    isAnimationActive={false}
                  />
                  {showMitigatedBand && (
                    <Area
                      type="monotone"
                      dataKey="mitigatedScore"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#mitigatedFill)"
                      isAnimationActive={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* SECTION 01: ECOGRID & SUPPLY CHAIN CORRIDOR MATRIX */}
        <section id="section-matrix" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-100">
                01. Monitored EcoGrid & Supply Chain Corridors
              </h2>
              <p className="text-xs text-slate-400">
                Real-time threshold alerting active: triggers non-blocking toast notifications when any corridor&apos;s Overall Risk Score exceeds 85 or drops below 30.
              </p>
            </div>

            {/* Interactive Filter & Real-Time Notification Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md">
                {(['All', 'Critical', 'Warning', 'Nominal'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      statusFilter === status
                        ? 'bg-slate-800 text-slate-50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status === 'All' ? 'All Corridors' : status}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter nodes or regions..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-44"
                />
              </div>

              <button
                onClick={() => handleTriggerTelemetryPulse('breach')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/70 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Simulate live telemetry surge above 85 risk score on active corridor"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                Simulate &gt;85 Surge
              </button>

              <button
                onClick={() => handleTriggerTelemetryPulse('stabilize')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/70 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Simulate live telemetry stabilization below 30 risk score on active corridor"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Simulate &lt;30 Recovery
              </button>

              <button
                onClick={() => setShowAlertDrawer(!showAlertDrawer)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showAlertDrawer
                    ? 'bg-slate-800 border-emerald-500/60 text-slate-50'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-emerald-400" />
                Alert Log ({alertHistory.filter((a) => !a.acknowledged).length})
              </button>
            </div>
          </div>

          {/* Expandable Real-Time Threshold Alert Log Drawer */}
          {showAlertDrawer && (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>Real-Time Threshold Audit Ledger</span>
                    <span aria-hidden="true">·</span>
                    <span>Rules: Risk &gt; 85 (Critical Breach) / Risk &lt; 30 (Nominal Recovery)</span>
                  </div>
                  <h3 className="font-display text-sm font-semibold text-slate-100">
                    Captured Corridor Threshold Notifications
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md">
                    {(
                      [
                        { key: 'ALL', label: 'All Events' },
                        { key: 'HIGH_RISK_BREACH', label: 'Breach (>85)' },
                        { key: 'LOW_RISK_RECOVERY', label: 'Stabilized (<30)' }
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setAlertLogFilter(tab.key)}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          alertLogFilter === tab.key
                            ? 'bg-slate-800 text-slate-50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setAutoToastEnabled(!autoToastEnabled)}
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      autoToastEnabled
                        ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {autoToastEnabled ? 'Live Toasts: Enabled' : 'Live Toasts: Muted'}
                  </button>

                  <button
                    onClick={() => {
                      setAlertHistory((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
                      setActiveToasts([]);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Acknowledge All
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {alertHistory.filter(
                  (a) => alertLogFilter === 'ALL' || a.thresholdType === alertLogFilter
                ).length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-mono">
                    No threshold alerts recorded for this filter.
                  </div>
                ) : (
                  alertHistory
                    .filter((a) => alertLogFilter === 'ALL' || a.thresholdType === alertLogFilter)
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          alert.thresholdType === 'HIGH_RISK_BREACH'
                            ? 'bg-rose-950/20 border-rose-800/60'
                            : 'bg-emerald-950/20 border-emerald-800/60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span
                              className={
                                alert.thresholdType === 'HIGH_RISK_BREACH'
                                  ? 'text-rose-400 font-semibold'
                                  : 'text-emerald-400 font-semibold'
                              }
                            >
                              {alert.thresholdType === 'HIGH_RISK_BREACH'
                                ? 'CRITICAL BREACH (>85)'
                                : 'NOMINAL RECOVERY (<30)'}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                            <span className="text-slate-200 font-semibold">{alert.nodeCode}</span>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                            <span className="text-slate-300 tabular-nums">
                              Score: {alert.previousScore} ➔ {alert.currentScore}/100
                            </span>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                            <span className="text-slate-400">{alert.source}</span>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                            <span className="text-slate-500 tabular-nums">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200">{alert.message}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              const found = nodes.find((n) => n.id === alert.nodeId);
                              if (found) handleSelectNode(found);
                              scrollToSection('inspector', 'section-inspector');
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Inspect Corridor
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          <div className="bg-slate-900/70 border border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                  <th className="py-3 px-4">Corridor Node</th>
                  <th className="py-3 px-4">Sector · Region</th>
                  <th className="py-3 px-4">Operational Status</th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (sortBy === 'riskScore') setSortDesc(!sortDesc);
                        else {
                          setSortBy('riskScore');
                          setSortDesc(true);
                        }
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      Overall Risk Score
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (sortBy === 'capacityMW') setSortDesc(!sortDesc);
                        else {
                          setSortBy('capacityMW');
                          setSortDesc(true);
                        }
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      Capacity (MW)
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (sortBy === 'dailyThroughputUSD') setSortDesc(!sortDesc);
                        else {
                          setSortBy('dailyThroughputUSD');
                          setSortDesc(true);
                        }
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      Daily Value
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">Telemetry & Context Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {filteredNodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-xs text-slate-400">
                      No corridors match the active filter criteria.{' '}
                      <button
                        onClick={() => {
                          setStatusFilter('All');
                          setSearchFilter('');
                        }}
                        className="text-emerald-400 underline ml-1 cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredNodes.map((node) => {
                    const isSelected = node.id === selectedNode.id;
                    return (
                      <tr
                        key={node.id}
                        onClick={() => handleSelectNode(node)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/25 hover:bg-emerald-950/35'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-100">{node.name}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            {node.code} · {node.coordinates}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-300">
                          <span>{node.sector}</span>
                          <span aria-hidden="true" className="mx-1.5 text-slate-500">
                            ·
                          </span>
                          <span className="text-slate-400">{node.region}</span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">
                          {node.status === 'Critical' && (
                            <span className="critical-status-glow inline-flex items-center gap-2 text-rose-400 font-semibold">
                              <span className="relative inline-flex items-center justify-center w-4 h-4">
                                <span
                                  aria-hidden="true"
                                  className="critical-halo-ring absolute inset-0 rounded-full bg-rose-500/45 blur-[3px]"
                                />
                                <ShieldAlert className="relative w-3.5 h-3.5 text-rose-400 shrink-0" />
                              </span>
                              <span>Critical Alert</span>
                            </span>
                          )}
                          {node.status === 'Warning' && (
                            <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              Elevated Warning
                            </span>
                          )}
                          {node.status === 'Nominal' && (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Nominal Operation
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                          <span
                            className={
                              node.riskScore > 85
                                ? 'text-rose-400'
                                : node.riskScore < 30
                                ? 'text-emerald-400'
                                : 'text-slate-100'
                            }
                          >
                            {node.riskScore} / 100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                          {node.capacityMW.toLocaleString()} MW
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                          ${(node.dailyThroughputUSD / 1000000).toFixed(2)}M
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => handleAdjustCorridorRisk(node, -15, e)}
                              className="px-2 py-1 text-xs font-mono text-emerald-300 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              title="Reduce risk score by 15 pts (triggers Nominal Toast if < 30)"
                            >
                              -15
                            </button>
                            <button
                              onClick={(e) => handleAdjustCorridorRisk(node, 12, e)}
                              className="px-2 py-1 text-xs font-mono text-rose-300 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              title="Increase risk score by 12 pts (triggers Critical Toast if > 85)"
                            >
                              +12
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectNode(node);
                              }}
                              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                              }`}
                            >
                              {isSelected ? 'Active Context' : 'Inspect Corridor'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 01B: ADVANCED ANALYTICS — D3.JS CROSS-NODE CORRELATION & 7-DAY PROPAGATION HEATMAP */}
        {workspaceTab === 'all' && (
          <section id="section-analytics" className="scroll-mt-20">
            <CrossNodeCorrelationHeatmap
              nodes={nodes}
              selectedNode={selectedNode}
              onSelectNode={handleSelectNode}
            />
          </section>
        )}

        {/* SECTION 02 & 03: 2-COLUMN SPLIT (VISUAL INSPECTOR + LIVE WEB SEARCH GROUNDING) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* SECTION 02: MULTIMODAL PHYSICAL ASSET INSPECTOR (gemini-4-argon) */}
          <section
            id="section-inspector"
            className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-lg p-6 flex flex-col justify-between space-y-5 scroll-mt-20"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Multimodal Vision Engine</span>
                    <span aria-hidden="true">·</span>
                    <span>Model: {inspectionReport.modelUsed}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{inspectionReport.latencyMs}ms</span>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-slate-100 mt-1">
                    02. Physical Asset & Anomaly Visual Inspector
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    Upload Photo
                  </button>
                  <button
                    onClick={handleRunVisualInspection}
                    disabled={isInspecting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isInspecting ? 'Analyzing with Gemini...' : 'Analyze Image'}
                  </button>
                </div>
              </div>

              {/* Sample Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
                  {CURATED_SAMPLES.map((sample) => (
                    <button
                      key={sample.key}
                      onClick={() => {
                        setCustomImageName(null);
                        setSelectedSampleKey(sample.key);
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        !customImageName && selectedSampleKey === sample.key
                          ? 'bg-slate-800 text-slate-50'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sample.key === 'transformer'
                        ? 'Substation IR'
                        : sample.key === 'port'
                        ? 'Rotterdam Berth 7'
                        : 'Atacama Solar PV'}
                    </button>
                  ))}
                </div>
                {customImageName && (
                  <span className="text-xs text-emerald-400 font-mono">
                    Uploaded: {customImageName}
                  </span>
                )}
              </div>

              {/* Visual Viewport Frame (Zero-Broken-Image Policy Compliant) */}
              <div className="relative rounded-md overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/10] flex items-center justify-center">
                {inspectionImageBase64 ? (
                  <img
                    src={inspectionImageBase64}
                    alt="Industrial asset inspection frame"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 font-mono">
                    Initializing radiometric sensor frame...
                  </div>
                )}

                {/* Measured Gradient Scrim for Bottom Telemetry Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-wrap items-end justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono text-slate-300">
                      {inspectionReport.assetType}
                    </div>
                    <div className="text-xs text-slate-400">
                      Peak Temp: {inspectionReport.thermalPeakCelsius.toFixed(1)}°C · Integrity:{' '}
                      {inspectionReport.structuralIntegrityPct.toFixed(1)}%
                    </div>
                  </div>
                  <div className="font-mono text-xs font-semibold text-slate-100">
                    Visual Risk: {inspectionReport.overallRiskScore} / 100 ({inspectionReport.severityLabel})
                  </div>
                </div>
              </div>

              {/* Operator Inspection Directive Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400">
                  Inspection Directive for Gemini 4 Argon Vision
                </label>
                <input
                  type="text"
                  value={inspectionDirective}
                  onChange={(e) => setInspectionDirective(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {inspectError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-md text-xs text-rose-200 flex items-center justify-between gap-3">
                  <span>{inspectError}</span>
                  <button
                    onClick={handleRunVisualInspection}
                    className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-100 rounded whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Retry Inspection
                  </button>
                </div>
              )}

              {/* Executive Summary & Detected Anomalies Table */}
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {inspectionReport.executiveSummary}
                </p>

                <div className="border border-slate-800 rounded-md overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                        <th className="py-2.5 px-3">Component · Zone</th>
                        <th className="py-2.5 px-3">Detected Defect & Action</th>
                        <th className="py-2.5 px-3">Severity</th>
                        <th className="py-2.5 px-3 text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {inspectionReport.detectedAnomalies.map((anom) => (
                        <tr key={anom.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 align-top">
                            <div className="font-medium text-slate-200">{anom.component}</div>
                            <div className="text-slate-400 font-mono">
                              {anom.zone} · {anom.complianceStandard}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 align-top space-y-1">
                            <div className="text-slate-200">{anom.issue}</div>
                            <div className="text-emerald-400">
                              Action: {anom.recommendedAction}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 align-top font-mono">
                            <span
                              className={
                                anom.severity === 'Critical'
                                  ? 'text-rose-400 font-semibold'
                                  : anom.severity === 'Warning'
                                  ? 'text-amber-400 font-medium'
                                  : 'text-emerald-400'
                              }
                            >
                              {anom.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 align-top text-right font-mono tabular-nums text-slate-300">
                            {anom.confidence}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 03: LIVE GOOGLE SEARCH GROUNDING (gemini-3.8-flash + googleSearch) */}
          <section
            id="section-grounding"
            className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-lg p-6 flex flex-col justify-between space-y-5 scroll-mt-20"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Google Search Grounding</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{groundingReport.latencyMs}ms</span>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-slate-100 mt-1">
                    03. Real-Time Threat & Market Verification
                  </h2>
                </div>

                <span className="text-xs font-mono text-slate-400">
                  gemini-3.8-flash
                </span>
              </div>

              {/* Search Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunSearchGrounding();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={groundingQuery}
                    onChange={(e) => setGroundingQuery(e.target.value)}
                    placeholder="Search live grid outages, port congestion, lithium tariffs..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isGrounding}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isGrounding ? 'Searching...' : 'Verify Live'}
                </button>
              </form>

              {/* Preset Grounding Probes */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 mr-1">Probes:</span>
                {[
                  {
                    label: 'North Sea HVDC Flows',
                    q: 'North Sea HVDC subsea interconnector offshore wind grid congestion maintenance Europe'
                  },
                  {
                    label: 'Rotterdam Hydrogen Port',
                    q: 'Port of Rotterdam green hydrogen terminal supply chain container congestion updates'
                  },
                  {
                    label: 'Chile Lithium & Solar Grid',
                    q: 'Chile Atacama lithium supply chain solar grid renewable power export logistics'
                  }
                ].map((probe) => (
                  <button
                    key={probe.label}
                    onClick={() => {
                      setGroundingQuery(probe.q);
                      handleRunSearchGrounding(probe.q);
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {probe.label}
                  </button>
                ))}
              </div>

              {groundingError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-md text-xs text-rose-200">
                  {groundingError}
                </div>
              )}

              {/* Synthesized Intelligence Brief */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-md space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
                  <span>Query ID: {groundingReport.groundingId}</span>
                  <span
                    className={
                      groundingReport.threatLevel === 'Critical'
                        ? 'text-rose-400 font-semibold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    Threat Level: {groundingReport.threatLevel} (+{groundingReport.riskDelta} Risk Delta)
                  </span>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto pr-1">
                  {groundingReport.summaryText}
                </div>
              </div>

              {/* Key Signals Extracted */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300">
                  Key Grounded Risk Signals
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {groundingReport.keySignals.map((sig, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-emerald-400 shrink-0">0{i + 1}.</span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verified Web Citations (groundingChunks) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Verified Google Search Citations
                  </span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {groundingReport.verifiedSources.length} sources linked
                  </span>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {groundingReport.verifiedSources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-xs transition-colors group"
                    >
                      <div className="truncate">
                        <div className="font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                          {src.title}
                        </div>
                        <div className="text-slate-400 font-mono truncate">
                          {src.domain} · {src.uri}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION 04: AUTONOMOUS MULTI-AGENT REASONING & MITIGATION PIPELINE */}
        <section
          id="section-pipeline"
          className="bg-slate-900/70 border border-slate-800 rounded-lg p-6 space-y-6 scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>4-Stage Causal Orchestrator</span>
                <span aria-hidden="true">·</span>
                <span>Execution ID: {pipelineReport.executionId}</span>
                <span aria-hidden="true">·</span>
                <span>Model: {pipelineReport.modelUsed}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{pipelineReport.latencyMs}ms</span>
              </div>
              <h2 className="font-display text-lg font-semibold text-slate-100 mt-1">
                04. Autonomous Multi-Agent Reasoning & Mitigation Playbook
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunAgentPipeline}
                disabled={isRunningPipeline}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningPipeline ? 'animate-spin' : ''}`} />
                {isRunningPipeline
                  ? `Executing Stage ${activePipelineStage}/4...`
                  : 'Execute Mitigation Pipeline'}
              </button>
            </div>
          </div>

          {pipelineError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-md text-xs text-rose-200">
              {pipelineError}
            </div>
          )}

          {/* 4-Stage Agent Audit Trail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineReport.agentSteps.map((step) => {
              const isStageActive = isRunningPipeline && activePipelineStage === step.stepNumber;
              return (
                <div
                  key={step.stepNumber}
                  className={`p-4 bg-slate-950/90 border rounded-md flex flex-col justify-between space-y-3 transition-colors ${
                    isStageActive ? 'border-emerald-500' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>STAGE 0{step.stepNumber}</span>
                      <span className="text-emerald-400 tabular-nums">
                        {step.confidencePct}% Conf
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-semibold text-slate-100">
                      {step.agentName}
                    </h3>
                    <div className="text-xs text-slate-400">{step.agentRole}</div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {step.reasoningSummary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{step.keyMetricLabel}:</span>
                      <span className="text-slate-100 font-semibold tabular-nums">
                        {step.keyMetricValue}
                      </span>
                    </div>
                    <div className="text-slate-500 truncate" title={step.evidenceCited}>
                      Ref: {step.evidenceCited}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actionable Rerouting & Load-Balancing Playbook Table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-slate-200">
                Ranked Dispatch & Rerouting Playbook (Click Status to Approve or Simulate)
              </h3>
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                Approved Actions: {playbookMetrics.approvedCount} /{' '}
                {pipelineReport.mitigationPlaybook.length} · Projected Risk:{' '}
                {playbookMetrics.dynamicProjectedRisk}/100
              </div>
            </div>

            <div className="border border-slate-800 rounded-md overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400">
                    <th className="py-3 px-4">Action ID · Priority</th>
                    <th className="py-3 px-4">Mitigation Directive & Corridor Route</th>
                    <th className="py-3 px-4 text-right">MW Protected</th>
                    <th className="py-3 px-4 text-right">Carbon Avoided</th>
                    <th className="py-3 px-4 text-right">Protected Value</th>
                    <th className="py-3 px-4 text-right">Dispatch State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {pipelineReport.mitigationPlaybook.map((action) => (
                    <tr key={action.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        <span className="text-slate-200 font-semibold">{action.id}</span>
                        <span aria-hidden="true" className="mx-1.5 text-slate-600">
                          ·
                        </span>
                        <span
                          className={
                            action.priority === 'Immediate'
                              ? 'text-rose-400'
                              : action.priority === 'High'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {action.priority}
                        </span>
                        <div className="text-slate-400">
                          Lead time: {action.leadTimeHours}h
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-100">{action.actionTitle}</div>
                        <div className="text-slate-400 font-mono">{action.corridorRoute}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                        {action.mwCapacityRestored} MW
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                        -{action.carbonReductionTons.toLocaleString()} tCO2e
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-100 font-semibold">
                        ${(action.estimatedSavingsUSD / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleTogglePlaybookStatus(action.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            action.dispatchStatus === 'Approved for Dispatch'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                              : action.dispatchStatus === 'Simulated'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {action.dispatchStatus}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 05: EXECUTIVE AUDIO BRIEFING SYNTHESIZER (gemini-3.8-flash-tts) */}
        <section
          id="section-briefing"
          className="bg-slate-900/70 border border-slate-800 rounded-lg p-6 space-y-5 scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dual-Speaker Neural Speech Synthesis</span>
                <span aria-hidden="true">·</span>
                <span>Model: gemini-3.8-flash-tts</span>
                <span aria-hidden="true">·</span>
                <span>Format: 24kHz Unary WAV (Puck & Kore)</span>
              </div>
              <h2 className="font-display text-lg font-semibold text-slate-100 mt-1">
                05. Executive Dispatch Audio Briefing
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSynthesizeAudioBriefing}
                disabled={isGeneratingAudio}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {isGeneratingAudio
                  ? 'Synthesizing Dual-Speaker WAV...'
                  : 'Synthesize Executive Audio Briefing'}
              </button>
            </div>
          </div>

          {audioError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-md text-xs text-rose-200">
              {audioError}
            </div>
          )}

          {audioBriefing ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Audio Player Controls */}
              <div className="lg:col-span-5 p-5 bg-slate-950 border border-slate-800 rounded-md space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Briefing ID: {audioBriefing.briefingId}</span>
                  <span className="tabular-nums">Latency: {audioBriefing.latencyMs}ms</span>
                </div>

                <audio
                  ref={audioRef}
                  src={`data:audio/wav;base64,${audioBriefing.audioBase64Wav}`}
                  onPlay={() => setIsPlayingAudio(true)}
                  onPause={() => setIsPlayingAudio(false)}
                  onEnded={() => setIsPlayingAudio(false)}
                  controls
                  className="w-full h-10"
                />

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={toggleAudioPlayback}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        Pause Briefing
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Play Briefing
                      </>
                    )}
                  </button>

                  <a
                    href={`data:audio/wav;base64,${audioBriefing.audioBase64Wav}`}
                    download={`aegisgrid-briefing-${audioBriefing.briefingId.toLowerCase()}.wav`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Download WAV
                  </a>
                </div>
              </div>

              {/* Synchronized Screenplay Dialogue Transcript */}
              <div className="lg:col-span-7 space-y-2.5">
                <div className="text-xs font-semibold text-slate-300">
                  Multi-Speaker Briefing Script (With Vocal Inflection & Backchanneling)
                </div>
                <div className="space-y-2">
                  {audioBriefing.dialogueTurns.map((turn, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-md space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span
                          className={
                            turn.speaker === 'Alex'
                              ? 'text-emerald-400 font-semibold'
                              : 'text-sky-400 font-semibold'
                          }
                        >
                          {turn.speaker} · {turn.roleLabel}
                        </span>
                        <span className="text-slate-500">Turn 0{index + 1}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{turn.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-200">
                  Ready to Synthesize Dual-Speaker Operational Briefing
                </div>
                <p className="text-xs text-slate-400">
                  Generates a 24kHz WAV dialogue between Grid Operations Director (Alex · Voice Puck) and Supply Chain Risk Analyst (Sam · Voice Kore) summarizing active visual inspection and mitigation actions for {selectedNode.name}.
                </p>
              </div>
              <button
                onClick={handleSynthesizeAudioBriefing}
                disabled={isGeneratingAudio}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isGeneratingAudio ? 'Generating Audio...' : 'Generate WAV Briefing'}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Non-Blocking Corner Toast Notification Stack (Risk > 85 or Risk < 30) */}
      {activeToasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 w-full max-w-md space-y-2.5 pointer-events-none px-4 sm:px-0"
        >
          {activeToasts.map((toast) => {
            const isCritical = toast.thresholdType === 'HIGH_RISK_BREACH';
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto p-4 rounded-lg border bg-[#0b101b]/95 backdrop-blur-md shadow-xl transition-all duration-150 space-y-2.5 ${
                  isCritical
                    ? 'border-rose-500/60 text-slate-100'
                    : 'border-emerald-500/60 text-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    {isCritical ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span
                      className={`font-semibold ${
                        isCritical ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isCritical
                        ? 'CRITICAL RISK BREACH (>85)'
                        : 'NOMINAL RISK STABILIZATION (<30)'}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span className="text-slate-300 font-semibold">{toast.nodeCode}</span>
                  </div>

                  <button
                    onClick={() =>
                      setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id))
                    }
                    className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-100">
                    {toast.nodeName}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/90 text-xs font-mono">
                  <div className="text-slate-400 tabular-nums">
                    Score: <span className="text-slate-200">{toast.previousScore}</span> ➔{' '}
                    <span
                      className={`font-bold ${
                        isCritical ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {toast.currentScore}/100
                    </span>{' '}
                    · {toast.source}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const targetNode = nodes.find((n) => n.id === toast.nodeId);
                        if (targetNode) handleSelectNode(targetNode);
                        scrollToSection('pipeline', 'section-pipeline');
                        setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
                      }}
                      className={`px-2.5 py-1 text-xs font-sans font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isCritical
                          ? 'bg-rose-500 text-slate-950 hover:bg-rose-400'
                          : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                      }`}
                    >
                      Inspect Corridor
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clean Utilitarian Footer (No Fake Telemetry Tickers) */}
      <footer className="border-t border-slate-800/80 py-5 px-6 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            AegisGrid · EcoGrid & Supply Chain Resilience Intelligence
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportDossier}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Export JSON Dossier
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('matrix', 'section-matrix');
              }}
              className="hover:text-slate-200 transition-colors"
            >
              Return to Top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
