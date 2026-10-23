import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { SupplyChainNode } from '../types';
import { GitCommitHorizontal, ArrowRight, SlidersHorizontal, Layers } from 'lucide-react';

interface CrossNodeCorrelationHeatmapProps {
  nodes: SupplyChainNode[];
  selectedNode: SupplyChainNode;
  onSelectNode: (node: SupplyChainNode) => void;
}

export interface CorrelationCellData {
  sourceId: string;
  sourceCode: string;
  sourceName: string;
  targetId: string;
  targetCode: string;
  targetName: string;
  correlation: number; // 0.00 to 1.00
  lagHours: number;
  downstreamImpactScore: number; // 0 to 100
  mwCascadeAtRisk: number;
  dailyFinancialCascadeUSD: number;
  mechanism: string;
  sevenDaySeries: {
    dayLabel: string;
    dateStr: string;
    sourceRisk: number;
    inducedTargetRisk: number;
    couplingCoeff: number;
  }[];
}

const LOOKBACK_DAYS = [
  { dayLabel: 'D-6', dateStr: 'Oct 17' },
  { dayLabel: 'D-5', dateStr: 'Oct 18' },
  { dayLabel: 'D-4', dateStr: 'Oct 19' },
  { dayLabel: 'D-3', dateStr: 'Oct 20' },
  { dayLabel: 'D-2', dateStr: 'Oct 21' },
  { dayLabel: 'D-1', dateStr: 'Oct 22' },
  { dayLabel: 'Today', dateStr: 'Oct 23' }
];

export const CrossNodeCorrelationHeatmap: React.FC<CrossNodeCorrelationHeatmapProps> = ({
  nodes,
  selectedNode,
  onSelectNode
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [heatmapMode, setHeatmapMode] = useState<'7day-propagation' | 'pairwise-matrix'>(
    '7day-propagation'
  );
  const [metricOverlay, setMetricOverlay] = useState<'correlation' | 'impactScore' | 'lagHours'>(
    'correlation'
  );
  const [activeCellKey, setActiveCellKey] = useState<string>(
    'node-hvdc-northsea__node-rotterdam-h2'
  );
  const [hoveredInfo, setHoveredInfo] = useState<{
    title: string;
    subtitle: string;
    metricText: string;
  } | null>(null);

  // Extended network nodes (combining authoritative monitored nodes with 2 linked downstream industrial sinks)
  const networkHubs = useMemo(() => {
    const base =
      nodes.length > 0
        ? nodes
        : [
            {
              id: 'node-hvdc-northsea',
              code: 'NSEA-HVDC-01',
              name: 'North Sea HVDC Interconnector Hub',
              region: 'Eemshaven, Netherlands',
              coordinates: '53.4386° N, 6.8355° E',
              sector: 'Grid Infrastructure' as const,
              status: 'Critical' as const,
              riskScore: 86,
              capacityMW: 1400,
              carbonIntensityKgMWh: 18.4,
              dailyThroughputUSD: 4250000,
              primaryThreat: 'Converter transformer Phase-B bushing thermal spike',
              lastUpdated: '2026-10-23T06:42:00Z',
              defaultSearchQuery: '',
              sampleKey: 'transformer' as const
            },
            {
              id: 'node-rotterdam-h2',
              code: 'RTM-LH2-07',
              name: 'Rotterdam Green Hydrogen & Battery Corridor',
              region: 'Port of Rotterdam, Netherlands',
              coordinates: '51.9551° N, 4.0124° E',
              sector: 'Port Logistics' as const,
              status: 'Warning' as const,
              riskScore: 68,
              capacityMW: 850,
              carbonIntensityKgMWh: 31.2,
              dailyThroughputUSD: 6180000,
              primaryThreat: 'Cryogenic manifold frost pressure drop at Berth 7',
              lastUpdated: '2026-10-23T06:35:00Z',
              defaultSearchQuery: '',
              sampleKey: 'port' as const
            },
            {
              id: 'node-atacama-lithium',
              code: 'ATC-LCE-19',
              name: 'Atacama Solar-Brine Lithium Processing Microgrid',
              region: 'Antofagasta Corridor, Chile',
              coordinates: '23.6509° S, 70.3975° W',
              sector: 'Critical Minerals' as const,
              status: 'Warning' as const,
              riskScore: 62,
              capacityMW: 620,
              carbonIntensityKgMWh: 24.0,
              dailyThroughputUSD: 5400000,
              primaryThreat: 'Bifacial PV string micro-cracks reducing output',
              lastUpdated: '2026-10-23T06:20:00Z',
              defaultSearchQuery: '',
              sampleKey: 'solar' as const
            },
            {
              id: 'node-ercot-bess',
              code: 'ERC-BESS-04',
              name: 'Permian Basin Grid-Scale LFP Battery Reserve',
              region: 'West Texas, United States',
              coordinates: '31.9973° N, 102.0779° W',
              sector: 'Renewable Storage' as const,
              status: 'Nominal' as const,
              riskScore: 24,
              capacityMW: 1120,
              carbonIntensityKgMWh: 14.8,
              dailyThroughputUSD: 3190000,
              primaryThreat: 'Nominal cell balancing across 48 LFP enclosures',
              lastUpdated: '2026-10-23T06:15:00Z',
              defaultSearchQuery: '',
              sampleKey: 'transformer' as const
            }
          ];

    return [
      ...base,
      {
        id: 'downstream-rhine-electrolyzer',
        code: 'RHN-ELX-02',
        name: 'Rhine Industrial PEM Electrolyzer Cluster',
        region: 'Duisburg, Germany · Downstream Sink',
        coordinates: '51.4344° N, 6.7623° E',
        sector: 'Grid Infrastructure' as const,
        status: 'Warning' as const,
        riskScore: Math.min(95, Math.round((base[0]?.riskScore ?? 86) * 0.84)),
        capacityMW: 740,
        carbonIntensityKgMWh: 22.1,
        dailyThroughputUSD: 3890000,
        primaryThreat: 'Direct HVDC feed dependency on Eemshaven converter bus',
        lastUpdated: '2026-10-23T06:42:00Z',
        defaultSearchQuery: '',
        sampleKey: 'transformer' as const
      },
      {
        id: 'downstream-bavaria-cellfab',
        code: 'BAV-GIG-09',
        name: 'European EV Cathode & Cell Refining Hub',
        region: 'Munich Corridor, Germany · Downstream Sink',
        coordinates: '48.1351° N, 11.5820° E',
        sector: 'Critical Minerals' as const,
        status: 'Warning' as const,
        riskScore: Math.min(92, Math.round(((base[1]?.riskScore ?? 68) + (base[2]?.riskScore ?? 62)) * 0.52)),
        capacityMW: 510,
        carbonIntensityKgMWh: 27.5,
        dailyThroughputUSD: 4950000,
        primaryThreat: 'Depends on Rotterdam LH2 carrier berth & Atacama lithium carbonate shipments',
        lastUpdated: '2026-10-23T06:42:00Z',
        defaultSearchQuery: '',
        sampleKey: 'port' as const
      }
    ];
  }, [nodes]);

  // Build deterministic, live-reactive correlation & 7-day lookback matrix
  const correlationMatrix = useMemo(() => {
    const baseCoupling: Record<string, { corr: number; lag: number; mechanism: string }> = {
      'node-hvdc-northsea__node-rotterdam-h2': {
        corr: 0.89,
        lag: 4,
        mechanism:
          'Eemshaven 400kV HVDC thermal derating curtails offshore wind power delivery to Rotterdam Maasvlakte hydrogen liquefaction compressors within 4 hours.'
      },
      'node-hvdc-northsea__downstream-rhine-electrolyzer': {
        corr: 0.94,
        lag: 2,
        mechanism:
          'Direct 380kV cross-border transmission coupling forces immediate PEM electrolyzer stack load-shedding across Duisburg industrial buses.'
      },
      'node-hvdc-northsea__downstream-bavaria-cellfab': {
        corr: 0.72,
        lag: 14,
        mechanism:
          'Intraday NW European grid balancing price spike (+18.2%) propagates southward to high-load cathode calcination kilns.'
      },
      'node-hvdc-northsea__node-atacama-lithium': {
        corr: 0.34,
        lag: 48,
        mechanism:
          'Indirect global clean-energy PPA hedge reallocation and maritime bunker fuel swap pricing.'
      },
      'node-hvdc-northsea__node-ercot-bess': {
        corr: 0.28,
        lag: 36,
        mechanism:
          'Transatlantic virtual storage arbitrage and shared LFP spare transformer bushing inventory pool.'
      },
      'node-rotterdam-h2__downstream-bavaria-cellfab': {
        corr: 0.91,
        lag: 12,
        mechanism:
          'Bay-14 container hold and Berth 7 cryogenic frost delay inland Rhine barge and rail delivery of precursor battery materials.'
      },
      'node-rotterdam-h2__downstream-rhine-electrolyzer': {
        corr: 0.85,
        lag: 6,
        mechanism:
          'Back-pressure on Rotterdam hydrogen pipeline header limits export compression from Rhine PEM cluster.'
      },
      'node-rotterdam-h2__node-hvdc-northsea': {
        corr: 0.82,
        lag: 5,
        mechanism:
          'Port cold-ironing and shore-power load fluctuations alter reactive power balance on Dutch coastal 380kV grid.'
      },
      'node-atacama-lithium__downstream-bavaria-cellfab': {
        corr: 0.88,
        lag: 72,
        mechanism:
          '18.6% solar microgrid output drop in Antofagasta slows lithium carbonate (LCE) brine concentration, tightening European cathode safety stock.'
      },
      'node-atacama-lithium__node-rotterdam-h2': {
        corr: 0.76,
        lag: 48,
        mechanism:
          'Delayed bulk mineral vessel departures from Antofagasta create bunched arrival windows at Rotterdam container terminals.'
      },
      'node-ercot-bess__node-hvdc-northsea': {
        corr: 0.31,
        lag: 24,
        mechanism:
          'Shared OEM high-voltage bushing and inverter spare-parts logistics allocation across North American and European reserves.'
      }
    };

    const map = new Map<string, CorrelationCellData>();

    networkHubs.forEach((src) => {
      networkHubs.forEach((tgt) => {
        const key = `${src.id}__${tgt.id}`;
        const reverseKey = `${tgt.id}__${src.id}`;
        const isSelf = src.id === tgt.id;

        const spec = baseCoupling[key] ||
          baseCoupling[reverseKey] || {
            corr: isSelf ? 1.0 : 0.42,
            lag: isSelf ? 0 : 24,
            mechanism: isSelf
              ? 'Autocorrelated local telemetry and internal thermal inertia across 7-day lookback window.'
              : 'Cross-corridor supply chain buffer coupling and shared grid equipment redundancy.'
          };

        // Adjust correlation slightly by current live risk score so real-time surges reflect in analytics
        const liveFactor = (src.riskScore - 50) * 0.0012;
        const effectiveCorr = isSelf
          ? 1.0
          : Math.min(0.98, Math.max(0.15, Number((spec.corr + liveFactor).toFixed(2))));

        const impactScore = Math.min(
          100,
          Math.round(src.riskScore * effectiveCorr * (isSelf ? 1 : 0.92))
        );

        const sevenDaySeries = LOOKBACK_DAYS.map((d, dayIdx) => {
          const histSrcRisk = Math.min(
            100,
            Math.max(12, Math.round(src.riskScore - (6 - dayIdx) * (src.riskScore > 60 ? 2.4 : 0.8)))
          );
          const dayCoupling = Math.min(
            0.99,
            Math.max(0.12, Number((effectiveCorr - (6 - dayIdx) * 0.015).toFixed(2)))
          );
          const inducedTargetRisk = Math.min(
            100,
            Math.round(histSrcRisk * dayCoupling)
          );
          return {
            dayLabel: d.dayLabel,
            dateStr: d.dateStr,
            sourceRisk: histSrcRisk,
            inducedTargetRisk,
            couplingCoeff: dayCoupling
          };
        });

        map.set(key, {
          sourceId: src.id,
          sourceCode: src.code,
          sourceName: src.name,
          targetId: tgt.id,
          targetCode: tgt.code,
          targetName: tgt.name,
          correlation: effectiveCorr,
          lagHours: isSelf ? 0 : spec.lag,
          downstreamImpactScore: impactScore,
          mwCascadeAtRisk: Math.round(tgt.capacityMW * effectiveCorr * (src.riskScore / 100) * 0.45),
          dailyFinancialCascadeUSD: Math.round(
            tgt.dailyThroughputUSD * effectiveCorr * (src.riskScore / 100) * 0.38
          ),
          mechanism: spec.mechanism,
          sevenDaySeries
        });
      });
    });

    return map;
  }, [networkHubs]);

  // Keep activeCellKey synchronized when selectedNode changes
  useEffect(() => {
    const defaultTarget =
      selectedNode.id === 'node-hvdc-northsea'
        ? 'downstream-rhine-electrolyzer'
        : 'node-rotterdam-h2';
    setActiveCellKey(`${selectedNode.id}__${defaultTarget}`);
  }, [selectedNode.id]);

  const selectedCellData = useMemo(() => {
    return (
      correlationMatrix.get(activeCellKey) ||
      Array.from(correlationMatrix.values())[1]
    );
  }, [correlationMatrix, activeCellKey]);

  // Render D3.js Heatmap whenever mode, metricOverlay, selectedNode, or correlationMatrix updates
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 760;
    const height = 390;
    const margin = { top: 44, right: 24, bottom: 42, left: 158 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Custom dark-command-center sequential color interpolator (Slate -> Emerald -> Amber -> Rose)
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, 0.45, 0.75, 1.0])
      .range(['#0f172a', '#065f46', '#d97706', '#e11d48'])
      .clamp(true);

    if (heatmapMode === '7day-propagation') {
      // Mode A: 7-Day Lookback Propagation Heatmap from Selected Source Hub -> Downstream Nodes
      const downstreamTargets = networkHubs.filter((h) => h.id !== selectedNode.id);
      const xLabels = LOOKBACK_DAYS.map((d) => `${d.dateStr} (${d.dayLabel})`);
      const yLabels = downstreamTargets.map((t) => t.code);

      const xScale = d3.scaleBand().domain(xLabels).range([0, innerWidth]).padding(0.08);
      const yScale = d3.scaleBand().domain(yLabels).range([0, innerHeight]).padding(0.12);

      // Top X Axis
      const xAxis = d3.axisTop(xScale).tickSize(0);
      g.append('g')
        .attr('class', 'x-axis')
        .call(xAxis)
        .call((axisGroup) => axisGroup.select('.domain').remove())
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10.5px')
        .attr('dy', '-6px');

      // Left Y Axis
      const yAxis = d3.axisLeft(yScale).tickSize(0);
      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .call((axisGroup) => axisGroup.select('.domain').remove())
        .selectAll('text')
        .attr('fill', '#e2e8f0')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('dx', '-8px');

      // Build cells for each Downstream Hub x Lookback Day
      interface PropagationCell {
        targetHub: (typeof networkHubs)[number];
        dayIdx: number;
        xLabel: string;
        pairKey: string;
        inducedRisk: number;
        coupling: number;
        lagHours: number;
      }

      const cells: PropagationCell[] = [];
      downstreamTargets.forEach((tgt) => {
        const pairKey = `${selectedNode.id}__${tgt.id}`;
        const cellSpec = correlationMatrix.get(pairKey);
        if (!cellSpec) return;

        cellSpec.sevenDaySeries.forEach((dayPt, dayIdx) => {
          cells.push({
            targetHub: tgt,
            dayIdx,
            xLabel: `${dayPt.dateStr} (${dayPt.dayLabel})`,
            pairKey,
            inducedRisk: dayPt.inducedTargetRisk,
            coupling: dayPt.couplingCoeff,
            lagHours: cellSpec.lagHours
          });
        });
      });

      const cellGroups = g
        .selectAll('.heatmap-cell')
        .data(cells)
        .enter()
        .append('g')
        .attr('class', 'heatmap-cell')
        .attr(
          'transform',
          (d) => `translate(${xScale(d.xLabel) ?? 0},${yScale(d.targetHub.code) ?? 0})`
        )
        .style('cursor', 'pointer')
        .on('click', (_event, d) => {
          setActiveCellKey(d.pairKey);
        })
        .on('mouseenter', (_event, d) => {
          setHoveredInfo({
            title: `${selectedNode.code} ➔ ${d.targetHub.code} (${d.xLabel})`,
            subtitle: d.targetHub.name,
            metricText: `Induced Risk: ${d.inducedRisk}/100 · r = ${d.coupling.toFixed(2)} · Lag: +${d.lagHours}h`
          });
        })
        .on('mouseleave', () => {
          setHoveredInfo(null);
        });

      cellGroups
        .append('rect')
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('rx', 4)
        .attr('fill', (d) =>
          metricOverlay === 'correlation'
            ? colorScale(d.coupling)
            : colorScale(d.inducedRisk / 100)
        )
        .attr('stroke', (d) => (d.pairKey === activeCellKey ? '#34d399' : '#1e293b'))
        .attr('stroke-width', (d) => (d.pairKey === activeCellKey ? 2 : 1));

      // Primary value label inside each cell
      cellGroups
        .append('text')
        .attr('x', xScale.bandwidth() / 2)
        .attr('y', yScale.bandwidth() / 2 - 3)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#f8fafc')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text((d) =>
          metricOverlay === 'correlation'
            ? `r=${d.coupling.toFixed(2)}`
            : metricOverlay === 'lagHours'
            ? `+${d.lagHours}h`
            : `${d.inducedRisk}/100`
        );

      // Sub-label inside each cell
      cellGroups
        .append('text')
        .attr('x', xScale.bandwidth() / 2)
        .attr('y', yScale.bandwidth() / 2 + 12)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'rgba(226, 232, 240, 0.75)')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '9.5px')
        .text((d) =>
          metricOverlay === 'correlation'
            ? `Risk ${d.inducedRisk}`
            : `r=${d.coupling.toFixed(2)}`
        );
    } else {
      // Mode B: Full Pairwise Cross-Node Correlation Matrix (All 6 Network Hubs x 6 Network Hubs)
      const hubCodes = networkHubs.map((h) => h.code);
      const xScale = d3.scaleBand().domain(hubCodes).range([0, innerWidth]).padding(0.08);
      const yScale = d3.scaleBand().domain(hubCodes).range([0, innerHeight]).padding(0.08);

      const xAxis = d3.axisTop(xScale).tickSize(0);
      g.append('g')
        .call(xAxis)
        .call((axisGroup) => axisGroup.select('.domain').remove())
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10.5px')
        .attr('dy', '-6px');

      const yAxis = d3.axisLeft(yScale).tickSize(0);
      g.append('g')
        .call(yAxis)
        .call((axisGroup) => axisGroup.select('.domain').remove())
        .selectAll('text')
        .attr('fill', '#e2e8f0')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10.5px')
        .attr('font-weight', '600')
        .attr('dx', '-8px');

      const allCells = Array.from(correlationMatrix.values());

      const cellGroups = g
        .selectAll('.matrix-cell')
        .data(allCells)
        .enter()
        .append('g')
        .attr('class', 'matrix-cell')
        .attr(
          'transform',
          (d) => `translate(${xScale(d.targetCode) ?? 0},${yScale(d.sourceCode) ?? 0})`
        )
        .style('cursor', 'pointer')
        .on('click', (_event, d) => {
          setActiveCellKey(`${d.sourceId}__${d.targetId}`);
        })
        .on('mouseenter', (_event, d) => {
          setHoveredInfo({
            title: `${d.sourceCode} ➔ ${d.targetCode}`,
            subtitle: `${d.sourceName} to ${d.targetName}`,
            metricText: `7D Correlation: r = ${d.correlation.toFixed(2)} · Induced Impact: ${d.downstreamImpactScore}/100 · Lag: +${d.lagHours}h`
          });
        })
        .on('mouseleave', () => {
          setHoveredInfo(null);
        });

      cellGroups
        .append('rect')
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('rx', 4)
        .attr('fill', (d) =>
          d.sourceId === d.targetId
            ? '#1e293b'
            : metricOverlay === 'correlation'
            ? colorScale(d.correlation)
            : colorScale(d.downstreamImpactScore / 100)
        )
        .attr('stroke', (d) =>
          `${d.sourceId}__${d.targetId}` === activeCellKey ? '#34d399' : '#1e293b'
        )
        .attr('stroke-width', (d) =>
          `${d.sourceId}__${d.targetId}` === activeCellKey ? 2 : 1
        );

      cellGroups
        .append('text')
        .attr('x', xScale.bandwidth() / 2)
        .attr('y', yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', (d) => (d.sourceId === d.targetId ? '#64748b' : '#f8fafc'))
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text((d) =>
          d.sourceId === d.targetId
            ? '1.00 (SELF)'
            : metricOverlay === 'correlation'
            ? d.correlation.toFixed(2)
            : metricOverlay === 'lagHours'
            ? `+${d.lagHours}h`
            : `${d.downstreamImpactScore}`
        );
    }

    // D3 Legend Bar at bottom
    const legendWidth = 220;
    const legendHeight = 8;
    const legendG = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${height - 22})`);

    const defs = svg.append('defs');
    const lg = defs
      .append('linearGradient')
      .attr('id', 'd3-heatmap-legend-grad')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    lg.append('stop').attr('offset', '0%').attr('stop-color', '#0f172a');
    lg.append('stop').attr('offset', '45%').attr('stop-color', '#065f46');
    lg.append('stop').attr('offset', '75%').attr('stop-color', '#d97706');
    lg.append('stop').attr('offset', '100%').attr('stop-color', '#e11d48');

    legendG
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('rx', 3)
      .attr('fill', 'url(#d3-heatmap-legend-grad)');

    legendG
      .append('text')
      .attr('x', legendWidth + 10)
      .attr('y', 8)
      .attr('fill', '#94a3b8')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px')
      .text('0.00 (Decoupled) ➔ 0.50 (Moderate) ➔ 1.00 (Critical Cascade Coupling)');
  }, [heatmapMode, metricOverlay, selectedNode, networkHubs, correlationMatrix, activeCellKey]);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-6 space-y-6">
      {/* Header & Interactive Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>D3.js Cross-Node Causal Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>7-Day Lookback Window (Oct 17 – Oct 23)</span>
            <span aria-hidden="true">·</span>
            <span>Source Hub: {selectedNode.code}</span>
          </div>
          <h2 className="font-display text-lg font-semibold text-slate-100">
            Cross-Node Risk Correlation & 7-Day Downstream Propagation Heatmap
          </h2>
          <p className="text-xs text-slate-400">
            Quantifies how thermal spikes or logistics bottlenecks at{' '}
            <span className="text-slate-200 font-medium">{selectedNode.name}</span> propagate across downstream industrial corridors over a 7-day lookback window.
          </p>
        </div>

        {/* Mode & Metric Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
            <button
              onClick={() => setHeatmapMode('7day-propagation')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                heatmapMode === '7day-propagation'
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7-Day Lookback Cascade
            </button>
            <button
              onClick={() => setHeatmapMode('pairwise-matrix')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                heatmapMode === 'pairwise-matrix'
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pairwise Correlation Matrix
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
            {(
              [
                { key: 'correlation', label: 'Coupling (r)' },
                { key: 'impactScore', label: 'Induced Risk' },
                { key: 'lagHours', label: 'Propagation Lag' }
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => setMetricOverlay(m.key)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  metricOverlay === m.key
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Source Hub Quick Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 rounded-md px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Originating Disturbance Hub:</span>
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => onSelectNode(node)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedNode.id === node.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {node.code} ({node.riskScore})
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400 truncate">
          {hoveredInfo ? (
            <span className="text-emerald-300">
              {hoveredInfo.title} · {hoveredInfo.metricText}
            </span>
          ) : (
            <span>Click any heatmap cell to inspect 7-day causal propagation</span>
          )}
        </div>
      </div>

      {/* Main 12-Column Split: D3 Heatmap Canvas (8 cols) + Causal Propagation Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: D3 SVG Heatmap */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-md p-4 flex flex-col justify-between">
          <div className="w-full overflow-x-auto">
            <svg ref={svgRef} className="w-full h-auto min-w-[640px] select-none" />
          </div>
        </div>

        {/* Right: Selected Corridor Pair Causal Inspector */}
        {selectedCellData && (
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-md p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2.5">
                <span>Causal Coupling Dossier</span>
                <span className="text-emerald-400 font-semibold tabular-nums">
                  r = {selectedCellData.correlation.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm font-display font-semibold text-slate-100">
                <span>{selectedCellData.sourceCode}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedCellData.targetCode}</span>
              </div>

              <div className="text-xs text-slate-400">
                {selectedCellData.sourceName} <span className="text-slate-600">➔</span>{' '}
                {selectedCellData.targetName}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 border border-slate-800/90 rounded p-3">
                {selectedCellData.mechanism}
              </p>

              {/* Quantitative Cascade Metrics */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded">
                  <div className="text-xs text-slate-400">Propagation Lag</div>
                  <div className="text-sm font-mono font-bold tabular-nums text-slate-100">
                    +{selectedCellData.lagHours} hours
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded">
                  <div className="text-xs text-slate-400">Induced Risk Index</div>
                  <div className="text-sm font-mono font-bold tabular-nums text-rose-400">
                    {selectedCellData.downstreamImpactScore} / 100
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded">
                  <div className="text-xs text-slate-400">Downstream MW At Risk</div>
                  <div className="text-sm font-mono font-bold tabular-nums text-amber-400">
                    {selectedCellData.mwCascadeAtRisk} MW
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded">
                  <div className="text-xs text-slate-400">Value Cascade Exposure</div>
                  <div className="text-sm font-mono font-bold tabular-nums text-slate-100">
                    ${(selectedCellData.dailyFinancialCascadeUSD / 1000000).toFixed(2)}M/d
                  </div>
                </div>
              </div>

              {/* 7-Day Daily Lookback Breakdown Table */}
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-semibold text-slate-300">
                  7-Day Lookback Coupling Ledger
                </div>
                <div className="border border-slate-800 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <th className="py-1.5 px-2.5">Day</th>
                        <th className="py-1.5 px-2.5 text-right">Src Risk</th>
                        <th className="py-1.5 px-2.5 text-right">r Coeff</th>
                        <th className="py-1.5 px-2.5 text-right">Induced</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {selectedCellData.sevenDaySeries.map((pt) => (
                        <tr key={pt.dayLabel} className="hover:bg-slate-900/40">
                          <td className="py-1 px-2.5 text-slate-300">
                            {pt.dateStr} ({pt.dayLabel})
                          </td>
                          <td className="py-1 px-2.5 text-right text-slate-300">
                            {pt.sourceRisk}
                          </td>
                          <td className="py-1 px-2.5 text-right text-emerald-400">
                            {pt.couplingCoeff.toFixed(2)}
                          </td>
                          <td className="py-1 px-2.5 text-right font-semibold text-slate-100">
                            {pt.inducedTargetRisk}/100
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {nodes.some((n) => n.id === selectedCellData.targetId) &&
              selectedCellData.targetId !== selectedNode.id && (
                <button
                  onClick={() => {
                    const target = nodes.find((n) => n.id === selectedCellData.targetId);
                    if (target) onSelectNode(target);
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors cursor-pointer whitespace-nowrap"
                >
                  Switch Active Context to {selectedCellData.targetCode}
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
