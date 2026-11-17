import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  ReferenceDot,
  XAxis,
  YAxis,
} from 'recharts';

export interface SparklineDataPoint {
  x: number | string;
  y: number;
  label?: string;
  formattedX?: string;
  formattedY?: string;
  isCurrent?: boolean;
}

interface RechartsSparklineProps {
  data: SparklineDataPoint[];
  currentX?: number | string;
  currentY?: number;
  color?: string;
  gradientId?: string;
  height?: number;
  label?: string;
  valueFormatter?: (val: number) => string;
  unit?: string;
  showCurrentBadge?: boolean;
  minLabel?: string;
  maxLabel?: string;
}

export const RechartsSparkline: React.FC<RechartsSparklineProps> = ({
  data,
  currentX,
  currentY,
  color = '#ea580c',
  gradientId = 'sparkline-grad',
  height = 36,
  label,
  valueFormatter = (val) => val.toLocaleString(),
  unit = '',
  showCurrentBadge = true,
  minLabel,
  maxLabel,
}) => {
  if (!data || data.length === 0) return null;

  // Find min and max y values for proper y-axis domain
  const yValues = data.map((d) => d.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const range = maxY - minY || 1;
  const domainMin = Math.floor(minY - range * 0.05);
  const domainMax = Math.ceil(maxY + range * 0.05);

  // Identify current point
  const currentPoint =
    currentX !== undefined
      ? data.find((d) => d.x === currentX || d.isCurrent)
      : data.find((d) => d.isCurrent);

  const activeY = currentY !== undefined ? currentY : currentPoint?.y;
  const activeX = currentPoint ? currentPoint.x : currentX;

  // Unique gradient ID to avoid SVG collision across multiple instances
  const uniqueGradId = `${gradientId}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="w-full space-y-1 pt-1">
      {(label || (showCurrentBadge && activeY !== undefined)) && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          {label && <span className="truncate">{label}</span>}
          {showCurrentBadge && activeY !== undefined && (
            <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200/90 shadow-2xs tabular-nums ml-auto">
              Live: <strong className="text-slate-900">{valueFormatter(activeY)}{unit}</strong>
            </span>
          )}
        </div>
      )}

      <div className="w-full relative bg-slate-50/50 rounded border border-slate-100 overflow-hidden" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 3, right: 3, left: 3, bottom: 2 }}
          >
            <defs>
              <linearGradient id={uniqueGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <XAxis dataKey="x" hide={true} />
            <YAxis hide={true} domain={[domainMin, domainMax]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as SparklineDataPoint;
                  return (
                    <div className="bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg border border-slate-700 pointer-events-none z-50">
                      <div>
                        {item.formattedX || item.x}: <span className="font-bold text-amber-300">{item.formattedY || valueFormatter(item.y)}{unit}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="y"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${uniqueGradId})`}
              isAnimationActive={false}
            />
            {activeX !== undefined && activeY !== undefined && (
              <ReferenceDot
                x={activeX}
                y={activeY}
                r={3}
                fill={color}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span>{minLabel || `${valueFormatter(minY)}${unit}`}</span>
          <span>{maxLabel || `${valueFormatter(maxY)}${unit}`}</span>
        </div>
      )}
    </div>
  );
};
