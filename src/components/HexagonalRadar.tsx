/**
 * HexaStudy — Pure SVG Hexagonal & Multi-Axis Radar Chart
 * True 6-Axis Geometry with Dynamic N-Axis Support and PNG Canvas Export
 */

import React, { useMemo, useRef } from 'react';
import { Download } from 'lucide-react';
import { ComputedSubjectScore } from '../types';

interface HexagonalRadarProps {
  subjects: ComputedSubjectScore[];
  compareSubjects?: ComputedSubjectScore[];
  title?: string;
  compareTitle?: string;
  size?: number;
  showExport?: boolean;
  onSubjectClick?: (subjectId: string) => void;
}

export const HexagonalRadar: React.FC<HexagonalRadarProps> = ({
  subjects,
  compareSubjects,
  title = 'Current Assessment',
  compareTitle = 'Previous Baseline',
  size = 460,
  showExport = true,
  onSubjectClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const center = size / 2;
  const radius = size * 0.38;
  const count = Math.max(subjects.length, 3);

  // Concentric polygon grid levels: 1, 2, 3, 4, 5
  const gridLevels = [1, 2, 3, 4, 5];

  // Helper to calculate coordinates on axis
  const getCoordinates = (index: number, value: number, total: number) => {
    // Start from top (-PI/2) and rotate clockwise
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const distance = (Math.max(0, Math.min(5, value)) / 5) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
      angle,
    };
  };

  // Helper to generate polygon path string for a value level
  const getGridPolygonPoints = (level: number) => {
    return Array.from({ length: count })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level, count);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Primary data polygon points
  const primaryPoints = useMemo(() => {
    return subjects
      .map((s, i) => {
        const { x, y } = getCoordinates(i, s.score, count);
        return `${x},${y}`;
      })
      .join(' ');
  }, [subjects, count, radius]);

  // Comparison data polygon points (if available)
  const comparePoints = useMemo(() => {
    if (!compareSubjects || compareSubjects.length === 0) return null;
    return compareSubjects
      .map((s, i) => {
        const { x, y } = getCoordinates(i, s.score, count);
        return `${x},${y}`;
      })
      .join(' ');
  }, [compareSubjects, count, radius]);

  // PNG Export Handler
  const handleExportPNG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `hexastudy-radar-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            {/* Primary polygon gradient fill */}
            <linearGradient id="primaryPolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0078d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#60cdff" stopOpacity="0.15" />
            </linearGradient>

            {/* Comparison polygon gradient fill */}
            <linearGradient id="comparePolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.08" />
            </linearGradient>

            {/* Glow filter for polygon edges */}
            <filter id="fluentGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background grid concentric polygons */}
          {gridLevels.map((lvl) => (
            <g key={`grid-lvl-${lvl}`}>
              <polygon
                points={getGridPolygonPoints(lvl)}
                fill={lvl === 5 ? 'rgba(255, 255, 255, 0.015)' : 'none'}
                stroke="rgba(255, 255, 255, 0.09)"
                strokeWidth={lvl === 5 ? '1.5' : '1'}
                strokeDasharray={lvl === 5 ? 'none' : '3 3'}
              />
              {/* Level numbers along the top axis */}
              <text
                x={center + 5}
                y={center - (lvl / 5) * radius + 4}
                fill="rgba(255, 255, 255, 0.28)"
                fontSize="10"
                fontFamily="JetBrains Mono"
                className="tabular-nums pointer-events-none"
              >
                {lvl}.0
              </text>
            </g>
          ))}

          {/* Radial axis lines from center to outer ring */}
          {subjects.map((_, i) => {
            const { x, y } = getCoordinates(i, 5, count);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
            );
          })}

          {/* Comparison Polygon Overlay (if provided) */}
          {comparePoints && (
            <g>
              <polygon
                points={comparePoints}
                fill="url(#comparePolyGrad)"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              {compareSubjects?.map((s, i) => {
                const { x, y } = getCoordinates(i, s.score, count);
                return (
                  <circle
                    key={`compare-dot-${s.subjectId}`}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#f59e0b"
                    stroke="#1e1e1e"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          )}

          {/* Primary Assessment Polygon */}
          <polygon
            points={primaryPoints}
            fill="url(#primaryPolyGrad)"
            stroke="#60cdff"
            strokeWidth="2.5"
            filter="url(#fluentGlow)"
          />

          {/* Score Vertices and Interactive Data Points */}
          {subjects.map((s, i) => {
            const { x, y } = getCoordinates(i, s.score, count);
            const isWeak = s.score < 2.5;
            const isStrong = s.score >= 4.0;
            const vertexColor = isStrong ? '#22c55e' : isWeak ? '#ef4444' : '#60cdff';

            return (
              <g
                key={`vertex-${s.subjectId}`}
                className="cursor-pointer group"
                onClick={() => onSubjectClick && onSubjectClick(s.subjectId)}
              >
                {/* Visible vertex circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="5.5"
                  fill={vertexColor}
                  stroke="#181818"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />

                {/* Score badge at vertex */}
                <circle
                  cx={x}
                  cy={y}
                  r="12"
                  fill="transparent"
                  className="group-hover:fill-sky-500/20"
                />
              </g>
            );
          })}

          {/* Subject Labels and Score Callouts around Perimeter */}
          {subjects.map((s, i) => {
            const labelCoord = getCoordinates(i, 5.85, count);
            const isRightSide = labelCoord.x > center + 10;
            const isLeftSide = labelCoord.x < center - 10;
            const textAnchor = isRightSide ? 'start' : isLeftSide ? 'end' : 'middle';

            return (
              <g
                key={`label-${s.subjectId}`}
                className="cursor-pointer"
                onClick={() => onSubjectClick && onSubjectClick(s.subjectId)}
              >
                {/* Subject Name */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y - 6}
                  textAnchor={textAnchor}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Plus Jakarta Sans"
                  className="transition-colors hover:fill-sky-400"
                >
                  {s.subjectName.length > 22 ? `${s.subjectName.slice(0, 20)}...` : s.subjectName}
                </text>

                {/* Score and Code unboxed text */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y + 10}
                  textAnchor={textAnchor}
                  fill={s.score >= 4 ? '#4ade80' : s.score < 2.5 ? '#f87171' : '#94a3b8'}
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  className="tabular-nums"
                >
                  {s.subjectCode} · {s.score.toFixed(1)}/5.0 ({s.percentage}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Export Controls */}
      <div className="flex items-center justify-between w-full max-w-md mt-4 px-3 py-2 bg-neutral-900/60 rounded-lg border border-white/5 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 ring-2 ring-sky-400/30" />
            <span className="text-neutral-300 font-medium">{title}</span>
          </div>

          {comparePoints && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400" />
              <span className="text-neutral-400">{compareTitle}</span>
            </div>
          )}
        </div>

        {showExport && (
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            title="Export hexagonal radar chart as high-resolution PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        )}
      </div>
    </div>
  );
};
