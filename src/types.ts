export type NodeStatus = 'Critical' | 'Warning' | 'Nominal';

export type NodeSector =
  | 'Grid Infrastructure'
  | 'Critical Minerals'
  | 'Port Logistics'
  | 'Renewable Storage';

export interface SupplyChainNode {
  id: string;
  code: string;
  name: string;
  region: string;
  coordinates: string;
  sector: NodeSector;
  status: NodeStatus;
  riskScore: number; // 0 - 100
  capacityMW: number;
  carbonIntensityKgMWh: number;
  dailyThroughputUSD: number;
  primaryThreat: string;
  lastUpdated: string;
  defaultSearchQuery: string;
  sampleKey: 'transformer' | 'port' | 'solar';
}

export interface DetectedAnomaly {
  id: string;
  component: string;
  zone: string;
  issue: string;
  severity: 'Critical' | 'Warning' | 'Nominal';
  confidence: number; // 0 - 100
  recommendedAction: string;
  complianceStandard: string;
}

export interface VisualInspectionReport {
  inspectionId: string;
  nodeId: string;
  timestamp: string;
  modelUsed: string;
  latencyMs: number;
  assetType: string;
  overallRiskScore: number;
  severityLabel: 'Critical' | 'Warning' | 'Nominal';
  executiveSummary: string;
  thermalPeakCelsius: number;
  structuralIntegrityPct: number;
  detectedAnomalies: DetectedAnomaly[];
}

export interface VerifiedWebSource {
  title: string;
  uri: string;
  domain: string;
}

export interface GroundingIntelligenceReport {
  groundingId: string;
  nodeId: string;
  query: string;
  timestamp: string;
  modelUsed: string;
  latencyMs: number;
  summaryText: string;
  threatLevel: 'Critical' | 'Warning' | 'Nominal';
  riskDelta: number;
  keySignals: string[];
  verifiedSources: VerifiedWebSource[];
}

export interface AgentStepLog {
  stepNumber: number;
  agentName: string;
  agentRole: string;
  status: 'Completed' | 'Verified';
  confidencePct: number;
  reasoningSummary: string;
  keyMetricLabel: string;
  keyMetricValue: string;
  evidenceCited: string;
}

export interface MitigationActionItem {
  id: string;
  actionTitle: string;
  corridorRoute: string;
  priority: 'Immediate' | 'High' | 'Scheduled';
  dispatchStatus: 'Pending Review' | 'Approved for Dispatch' | 'Simulated';
  estimatedSavingsUSD: number;
  mwCapacityRestored: number;
  carbonReductionTons: number;
  leadTimeHours: number;
}

export interface AgentPipelineReport {
  executionId: string;
  nodeId: string;
  timestamp: string;
  modelUsed: string;
  latencyMs: number;
  compositeResilienceScore: number;
  projectedRiskAfterMitigation: number;
  totalExposureUSD: number;
  scope3EmissionsDeltaTons: number;
  agentSteps: AgentStepLog[];
  mitigationPlaybook: MitigationActionItem[];
}

export interface DialogueTurn {
  speaker: 'Alex' | 'Sam';
  roleLabel: string;
  text: string;
}

export interface AudioBriefingReport {
  briefingId: string;
  nodeId: string;
  timestamp: string;
  modelUsed: string;
  latencyMs: number;
  audioBase64Wav: string;
  dialogueTurns: DialogueTurn[];
}

export type AlertTriggerSource =
  | 'Live Telemetry Stream'
  | 'Gemini 4 Argon Inspection'
  | 'Mitigation Playbook'
  | 'Operator Stress Test';

export interface RiskThresholdAlert {
  id: string;
  nodeId: string;
  nodeCode: string;
  nodeName: string;
  thresholdType: 'HIGH_RISK_BREACH' | 'LOW_RISK_RECOVERY';
  previousScore: number;
  currentScore: number;
  source: AlertTriggerSource;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

