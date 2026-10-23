import React, { useState, useMemo } from 'react';
import { SupplyChainNode } from '../types';
import { Gauge } from 'lucide-react';

interface StatusShiftVelocityGaugeProps {
  selectedNode: SupplyChainNode;
  recentScores: number[];
  dynamicProjectedRisk: number;
  approvedActionsCount: number;
}

export const StatusShiftVelocityGauge: React.FC<StatusShiftVelocityGaugeProps> = ({
  selectedNode,
  recentScores,
  dynamicProjectedRisk,
  approvedActionsCount
}) => {
  const [velocityMode, setVelocityMode] = useState<'telemetry' | 'mitigated'>('telemetry');

  const gaugeData = useMemo(() => {
    const len = recentScores.length;
    const current = selectedNode.riskScore;
    const prev3Day = len >= 4 ? recentScores[len - 4] : current - 4;
    const rawVelocityPerDay = Number(((current - prev3Day) / 3).toFixed(1));

    // When in 'mitigated' mode and playbook actions are approved, velocity reflects downward stabilization pull
    const mitigatedVelocityPerDay =
      approvedActionsCount > 0
        ? Number(((dynamicProjectedRisk - current) / 2).toFixed(1))
        : rawVelocityPerDay;

    const activeVelocity =
      velocityMode === 'mitigated' ? mitigatedVelocityPerDay : rawVelocityPerDay;

    let directionLabel = 'Holding Nominal Margin';
    let targetStateLabel = 'Nominal';
    let likelihoodPct = 18;
    let accentHex = '#10b981'; // emerald-500
    let textAccentClass = 'text-emerald-400';
    let thresholdDeltaText = `${Math.max(0, 30 - current)} pts to Warning (30)`;

    if (selectedNode.status === 'Critical') {
      // Currently Critical (>= 75)
      const distToWarning = Math.max(1, current - 74);
      if (activeVelocity < -0.5) {
        directionLabel = 'Moving toward Warning';
        targetStateLabel = 'Warning (<75)';
        likelihoodPct = Math.min(96, Math.max(35, Math.round(88 - distToWarning * 1.6 + Math.abs(activeVelocity) * 2.2)));
        accentHex = '#10b981';
        textAccentClass = 'text-emerald-400';
        thresholdDeltaText = `-${distToWarning} pts to Warning`;
      } else {
        directionLabel = current > 85 ? 'Escalating Critical Breach' : 'Moving toward >85 Breach';
        targetStateLabel = 'Breach (>85)';
        likelihoodPct = Math.min(98, Math.max(64, Math.round(current + activeVelocity * 3)));
        accentHex = '#f43f5e';
        textAccentClass = 'text-rose-400';
        thresholdDeltaText =
          current > 85 ? `+${current - 85} pts above 85 limit` : `${86 - current} pts to 85 breach`;
      }
    } else if (selectedNode.status === 'Warning') {
      // Currently Warning (30 - 74)
      if (activeVelocity >= 0) {
        const distToCritical = Math.max(1, 75 - current);
        directionLabel = 'Moving toward Critical';
        targetStateLabel = 'Critical (75)';
        likelihoodPct = Math.min(
          95,
          Math.max(28, Math.round(100 - distToCritical * 2.1 + activeVelocity * 5))
        );
        accentHex = likelihoodPct >= 70 ? '#f43f5e' : '#f59e0b';
        textAccentClass = likelihoodPct >= 70 ? 'text-rose-400' : 'text-amber-400';
        thresholdDeltaText = `${distToCritical} pts to Critical (75)`;
      } else {
        const distToNominal = Math.max(1, current - 29);
        directionLabel = 'Moving toward Nominal';
        targetStateLabel = 'Nominal (<30)';
        likelihoodPct = Math.min(
          94,
          Math.max(30, Math.round(85 - distToNominal * 1.1 + Math.abs(activeVelocity) * 2.5))
        );
        accentHex = '#10b981';
        textAccentClass = 'text-emerald-400';
        thresholdDeltaText = `-${distToNominal} pts to Nominal (<30)`;
      }
    } else {
      // Currently Nominal (< 30)
      const distToWarning = Math.max(1, 30 - current);
      if (activeVelocity >= 0.8) {
        directionLabel = 'Moving toward Warning';
        targetStateLabel = 'Warning (30)';
        likelihoodPct = Math.min(
          92,
          Math.max(24, Math.round(90 - distToWarning * 3.2 + activeVelocity * 6))
        );
        accentHex = '#f59e0b';
        textAccentClass = 'text-amber-400';
        thresholdDeltaText = `${distToWarning} pts to Warning (30)`;
      } else {
        directionLabel = 'Stabilized in Nominal';
        targetStateLabel = 'Nominal (<30)';
        likelihoodPct = Math.max(8, Math.min(25, Math.round(28 - distToWarning)));
        accentHex = '#10b981';
        textAccentClass = 'text-emerald-400';
        thresholdDeltaText = `${distToWarning} pts margin below 30`;
      }
    }

    return {
      activeVelocity,
      directionLabel,
      targetStateLabel,
      likelihoodPct,
      accentHex,
      textAccentClass,
      thresholdDeltaText
    };
  }, [selectedNode, recentScores, dynamicProjectedRisk, approvedActionsCount, velocityMode]);

  // Semi-circle SVG arc math (radius = 38, center = (50, 46))
  const radius = 38;
  const circumference = Math.PI * radius; // ~119.38
  const strokeDashoffset =
    circumference - (gaugeData.likelihoodPct / 100) * circumference;

  // Needle angle (-90deg to +90deg)
  const angleDeg = -90 + (gaugeData.likelihoodPct / 100) * 180;

  return (
    <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-lg flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Gauge className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Status Shift Velocity</span>
        </span>
        <button
          onClick={() =>
            setVelocityMode((prev) => (prev === 'telemetry' ? 'mitigated' : 'telemetry'))
          }
          className="text-[11px] font-mono text-slate-300 hover:text-emerald-300 underline decoration-slate-600 underline-offset-2 cursor-pointer whitespace-nowrap"
          title="Toggle between raw telemetry drift velocity and playbook-mitigated velocity"
        >
          {velocityMode === 'telemetry' ? 'Raw Drift' : 'Mitigated'}
        </button>
      </div>

      {/* Middle Row: Semi-Circular SVG Gauge + Likelihood & Trajectory Readout */}
      <div className="flex items-center gap-3.5 pt-0.5">
        <div className="relative w-[96px] h-[54px] shrink-0">
          <svg viewBox="0 0 100 56" className="w-full h-full overflow-visible">
            {/* Background Track Arc */}
            <path
              d="M 12 46 A 38 38 0 0 1 88 46"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active Likelihood Arc */}
            <path
              d="M 12 46 A 38 38 0 0 1 88 46"
              fill="none"
              stroke={gaugeData.accentHex}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
            {/* Pivot Needle */}
            <g transform={`translate(50, 46) rotate(${angleDeg})`}>
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-30"
                stroke="#f8fafc"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="0" cy="0" r="3.5" fill="#f8fafc" />
            </g>
          </svg>
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="text-xl font-bold font-mono tabular-nums text-slate-50 leading-tight">
            {gaugeData.likelihoodPct}%{' '}
            <span className="text-xs font-normal text-slate-400">shift prob</span>
          </div>
          <div
            className={`text-xs font-semibold truncate ${gaugeData.textAccentClass}`}
            title={gaugeData.directionLabel}
          >
            {gaugeData.directionLabel}
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Velocity Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums pt-0.5">
        <span>
          Vel:{' '}
          <span className="text-slate-200">
            {gaugeData.activeVelocity > 0
              ? `+${gaugeData.activeVelocity}`
              : gaugeData.activeVelocity}{' '}
            pts/d
          </span>
        </span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{gaugeData.thresholdDeltaText}</span>
      </div>
    </div>
  );
};
