export interface CuratedSampleSpec {
  key: 'transformer' | 'port' | 'solar';
  title: string;
  nodeId: string;
  location: string;
  sensorMode: string;
  defaultDirective: string;
  caption: string;
}

export const CURATED_SAMPLES: CuratedSampleSpec[] = [
  {
    key: 'transformer',
    title: 'HVDC Substation Transformer Bushing #04',
    nodeId: 'node-hvdc-northsea',
    location: 'Eemshaven Converter Station · 53.4386° N, 6.8355° E',
    sensorMode: 'Dual Optical + Radiometric Thermal Overlay',
    defaultDirective:
      'Analyze this substation transformer inspection frame for high-voltage bushing thermal stress, insulator dielectric degradation, cooling fin blockage, and IEC 60076 compliance risks.',
    caption: 'Radiometric capture showing 118.4°C hotspot on Phase-B porcelain bushing flange and oil seal seepage.'
  },
  {
    key: 'port',
    title: 'Rotterdam Hydrogen & Cryo-Tanker Berth 7',
    nodeId: 'node-rotterdam-h2',
    location: 'Maasvlakte Energy Terminal · 51.9551° N, 4.0124° E',
    sensorMode: 'Aerial Port Optical Telemetry',
    defaultDirective:
      'Inspect this port terminal telemetry image for intermodal container stacking bottlenecks, cryogenic manifold valve icing, crane corridor obstruction, and ISO 19880 safety compliance.',
    caption: 'Aerial berth capture highlighting cryogenic transfer manifold frost accumulation and Bay-14 yard congestion.'
  },
  {
    key: 'solar',
    title: 'Atacama Bifacial PV Array Sector C-19',
    nodeId: 'node-atacama-lithium',
    location: 'Antofagasta Solar-Brine Microgrid · 23.6509° S, 70.3975° W',
    sensorMode: 'Electroluminescence + UV Field Scan',
    defaultDirective:
      'Examine this utility solar array scan for hail-induced cell micro-cracks, busbar delamination, inverter string mismatch, and IEC 61215 performance degradation.',
    caption: 'High-contrast PV string scan revealing dendritic micro-fractures across cells R3-C4 and junction box overheating.'
  }
];

/**
 * Generates a realistic, high-detail industrial inspection PNG (data:image/png;base64,...)
 * so the user sees crisp technical imagery with zero external URL fragility and can send real
 * pixel data to gemini-4-argon for multimodal analysis.
 */
export function renderSampleInspectionDataUrl(key: 'transformer' | 'port' | 'solar'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Base industrial dark slate canvas
  const bgGrad = ctx.createLinearGradient(0, 0, 960, 600);
  bgGrad.addColorStop(0, '#0a101d');
  bgGrad.addColorStop(1, '#111c2d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 960, 600);

  // Subtle calibration grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 960; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 600);
    ctx.stroke();
  }
  for (let y = 0; y < 600; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(960, y);
    ctx.stroke();
  }

  if (key === 'transformer') {
    // Draw Substation Transformer Tank & Cooling Radiators
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fillRect(180, 250, 560, 260);
    ctx.strokeRect(180, 250, 560, 260);

    // Cooling radiator fins
    for (let i = 0; i < 12; i++) {
      const fx = 210 + i * 42;
      ctx.fillStyle = i >= 6 && i <= 8 ? '#332421' : '#0f172a';
      ctx.fillRect(fx, 275, 26, 210);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(fx, 275, 26, 210);
    }

    // 3 High-Voltage Porcelain Bushings (Phase A, B, C)
    const phases = [
      { x: 280, label: 'PHASE A · 400kV', temp: '64.2°C', hot: false },
      { x: 460, label: 'PHASE B · 400kV [ANOMALY]', temp: '118.4°C', hot: true },
      { x: 640, label: 'PHASE C · 400kV', temp: '67.8°C', hot: false }
    ];

    phases.forEach((p) => {
      // Insulator sheds
      for (let s = 0; s < 6; s++) {
        const sy = 115 + s * 22;
        ctx.fillStyle = p.hot ? '#7c2d12' : '#334155';
        ctx.beginPath();
        ctx.ellipse(p.x, sy, 34 - s * 1.5, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = p.hot ? '#f97316' : '#64748b';
        ctx.stroke();
      }

      // Conductor rod
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x, 40);
      ctx.lineTo(p.x, 110);
      ctx.stroke();

      if (p.hot) {
        // Radiometric thermal bloom on Phase B bushing flange
        const rad = ctx.createRadialGradient(p.x, 215, 8, p.x, 215, 115);
        rad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        rad.addColorStop(0.3, 'rgba(249, 115, 22, 0.80)');
        rad.addColorStop(0.65, 'rgba(220, 38, 38, 0.45)');
        rad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(p.x, 215, 115, 0, Math.PI * 2);
        ctx.fill();

        // Target reticle box
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - 65, 145, 130, 125);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillText('HOTSPOT Z-01: 118.4°C (+54.2°C DELTA)', p.x - 110, 134);
      }

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(p.label, p.x - 48, 535);
      ctx.fillText(`FLANGE: ${p.temp}`, p.x - 48, 553);
    });
  } else if (key === 'port') {
    // Rotterdam Port Terminal Berth & Cryogenic H2 Pipelines
    ctx.fillStyle = '#0c192c';
    ctx.fillRect(0, 0, 960, 220);

    // Quay wall
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 220, 960, 380);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.lineTo(960, 220);
    ctx.stroke();

    // LH2 Carrier Vessel at Berth
    ctx.fillStyle = '#172554';
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.fillRect(110, 55, 720, 140);
    ctx.strokeRect(110, 55, 720, 140);

    // Spherical Cryo Tanks on Vessel
    [240, 420, 600].forEach((cx, idx) => {
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(cx, 125, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#93c5fd';
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(`LH2 SPHERE #0${idx + 1}`, cx - 46, 129);
    });

    // Cryogenic Loading Manifold with Valve Icing Anomaly
    const iceGrad = ctx.createRadialGradient(420, 225, 6, 420, 225, 85);
    iceGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
    iceGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.55)');
    iceGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = iceGrad;
    ctx.beginPath();
    ctx.arc(420, 225, 85, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(355, 175, 130, 105);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('MANIFOLD M-02: CRYO SEAL FROST / PRESSURE DROP', 295, 300);

    // Intermodal Container Stacks (Yard Bay 14 Bottleneck)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        const cx = 110 + c * 125;
        const cy = 340 + r * 62;
        const isCongested = c >= 3 && r <= 1;
        ctx.fillStyle = isCongested ? '#7f1d1d' : '#0f172a';
        ctx.strokeStyle = isCongested ? '#ef4444' : '#334155';
        ctx.fillRect(cx, cy, 108, 46);
        ctx.strokeRect(cx, cy, 108, 46);
        ctx.fillStyle = isCongested ? '#fca5a5' : '#94a3b8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(isCongested ? `HOLD B14-${r}${c}` : `TEU N09-${r}${c}`, cx + 12, cy + 27);
      }
    }
  } else {
    // Atacama Bifacial Solar PV Array Electroluminescence Scan
    const cols = 6;
    const rows = 4;
    const startX = 110;
    const startY = 95;
    const cellW = 120;
    const cellH = 95;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (cellW + 6);
        const y = startY + r * (cellH + 6);
        const isDamaged = (r === 1 && c === 2) || (r === 2 && c === 3) || (r === 1 && c === 3);

        ctx.fillStyle = isDamaged ? '#3b1d2e' : '#0f2942';
        ctx.strokeStyle = isDamaged ? '#f43f5e' : '#38bdf8';
        ctx.lineWidth = isDamaged ? 2 : 1;
        ctx.fillRect(x, y, cellW, cellH);
        ctx.strokeRect(x, y, cellW, cellH);

        // Busbars
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 1;
        for (let b = 1; b <= 3; b++) {
          ctx.beginPath();
          ctx.moveTo(x + (cellW * b) / 4, y);
          ctx.lineTo(x + (cellW * b) / 4, y + cellH);
          ctx.stroke();
        }

        if (isDamaged) {
          // Micro-crack dendritic fracture lines
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 15, y + 12);
          ctx.lineTo(x + 65, y + 52);
          ctx.lineTo(x + 105, y + 78);
          ctx.moveTo(x + 65, y + 52);
          ctx.lineTo(x + 32, y + 84);
          ctx.stroke();

          ctx.fillStyle = '#fb7185';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(`CRACK R${r + 1}C${c + 1}`, x + 12, y + 24);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`R${r + 1}C${c + 1} · OK`, x + 10, y + 20);
        }
      }
    }

    // Junction Box Thermal Warning
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX + 2 * 126 - 8, startY + 1 * 101 - 8, 258, 208);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('STRING S-19 DELAMINATION & HAIL FRACTURE CLUSTER (-18.6% MW OUTPUT)', 180, 525);
  }

  // Telemetry HUD Header & Footer Bars
  ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
  ctx.fillRect(0, 0, 960, 38);
  ctx.fillRect(0, 564, 960, 36);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillText(`AEGISGRID OPTICAL/IR CAPTURE · KEY: ${key.toUpperCase()}`, 18, 24);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText('CALIBRATED: IEC-60076 / ISO-19880 · RES: 960x600 · RADIOMETRIC: ENABLED', 18, 586);

  return canvas.toDataURL('image/png');
}
