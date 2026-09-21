import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, Activity, Flame, Layers } from "lucide-react";

/**
 * Custom Frosted Glass Tooltip for Mini Frequency / Multi-Series Chart
 */
const MiniChartTooltip = ({ active, payload, label, unit = "", total = 0, isMulti = false }) => {
  if (active && payload && payload.length) {
    if (isMulti) {
      const bucketTotal = payload.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-xl transition-all pointer-events-none z-50 min-w-[150px]">
          <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {label || "Bucket"}
            </span>
            <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
              {bucketTotal.toLocaleString()} {unit}
            </span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 shrink-0"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {entry.name || entry.dataKey}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  {entry.value?.toLocaleString() || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const item = payload[0];
    const val = item.value || 0;
    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : null;
    const color = item.payload?.fill || item.color || "#6366f1";

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3.5 py-2 shadow-xl transition-all pointer-events-none z-50 min-w-[120px]">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {label || item.payload?.name || item.payload?.range || "Bucket"}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {val.toLocaleString()} {unit}
          </span>
          {pct !== null && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {pct}%
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Default sample frequency data for standalone demo usage
 */
const sampleFrequencyData = [
  { label: "Mon", frequency: 12 },
  { label: "Tue", frequency: 19 },
  { label: "Wed", frequency: 8 },
  { label: "Thu", frequency: 24 },
  { label: "Fri", frequency: 16 },
  { label: "Sat", frequency: 28 },
  { label: "Sun", frequency: 22 },
];

/**
 * High-performance, modern Mini Frequency / Activity Chart
 */
export function MiniChart({
  data,
  xKey = "label",
  dataKey = "frequency",
  bars, // Array of { key, name, color, radius } for multi-series activity breakdown
  height = 180,
  barColor = "#6366f1",
  accentColor = "#8b5cf6",
  unit = "",
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  showStats = true,
  showLegend = true,
  title,
  subtitle,
  badgeText,
  className = "",
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredSeries, setHoveredSeries] = useState(null);

  const isMulti = Boolean(bars && Array.isArray(bars) && bars.length > 0);

  // Normalize data with fallbacks
  const chartData = useMemo(() => {
    const raw = data && data.length > 0 ? data : sampleFrequencyData;
    return raw.map((item, idx) => {
      const lbl = item[xKey] || item.range || item.date || item.month || item.label || item.course || `#${idx + 1}`;
      if (isMulti) {
        return {
          ...item,
          label: lbl,
          originalIndex: idx,
        };
      }
      const val = Number(item[dataKey] !== undefined ? item[dataKey] : (item.count || item.value || item.hours || item.completion || 0));
      return {
        ...item,
        label: lbl,
        [dataKey]: val,
        originalIndex: idx,
      };
    });
  }, [data, xKey, dataKey, isMulti]);

  // Aggregate stats
  const { total, peak, peakLabel } = useMemo(() => {
    if (!chartData.length) return { total: 0, peak: 0, peakLabel: "" };
    let sum = 0;
    let max = -Infinity;
    let maxLbl = "";

    chartData.forEach((d) => {
      if (isMulti) {
        let rowSum = 0;
        bars.forEach((b) => {
          const val = Number(d[b.key]) || 0;
          rowSum += val;
          sum += val;
        });
        if (rowSum > max) {
          max = rowSum;
          maxLbl = d.label;
        }
      } else {
        const v = d[dataKey] || 0;
        sum += v;
        if (v > max) {
          max = v;
          maxLbl = d.label;
        }
      }
    });

    return {
      total: sum,
      peak: max > -Infinity ? max : 0,
      peakLabel: maxLbl,
    };
  }, [chartData, dataKey, isMulti, bars]);

  // Unique ID for gradients
  const gradientId = useMemo(() => `miniChartGrad-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div className={`w-full flex flex-col justify-between ${className}`}>
      {/* Header Stats */}
      {(title || showStats) && (
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            {title && (
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {title}
                {badgeText && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    {badgeText}
                  </span>
                )}
              </h4>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {showStats && (
            <div className="flex items-center gap-3 text-right">
              <div className="hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 block leading-tight">
                  Total
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                  {total.toLocaleString()} {unit}
                </span>
              </div>
              <div className="pl-3 border-l border-gray-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 block leading-tight flex items-center justify-end gap-0.5">
                  <Flame className="w-2.5 h-2.5" /> Peak
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                  {peak.toLocaleString()} {unit}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart Canvas */}
      <div className="w-full relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 8, left: showYAxis ? -15 : 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.95} />
                <stop offset="100%" stopColor={barColor} stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id={`${gradientId}-hover`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.95} />
              </linearGradient>

              {/* Multi-series gradients */}
              {isMulti &&
                bars.map((b, idx) => (
                  <linearGradient
                    key={`grad-${b.key}`}
                    id={`barGrad-${gradientId}-${idx}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={b.color || "#6366f1"} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={b.color || "#6366f1"} stopOpacity={0.75} />
                  </linearGradient>
                ))}
            </defs>

            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.18)"
                vertical={false}
              />
            )}

            {showXAxis && (
              <XAxis
                dataKey="label"
                stroke="rgba(100, 116, 139, 0.85)"
                fontSize={11}
                fontWeight={500}
                tickLine={false}
                axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                dy={6}
              />
            )}

            {showYAxis && (
              <YAxis
                stroke="rgba(100, 116, 139, 0.85)"
                fontSize={11}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
            )}

            <Tooltip
              cursor={{ fill: "rgba(99, 102, 241, 0.08)", radius: 6 }}
              content={<MiniChartTooltip unit={unit} total={total} isMulti={isMulti} />}
            />

            {isMulti ? (
              bars.map((b, bIdx) => (
                <Bar
                  key={b.key}
                  dataKey={b.key}
                  name={b.name || b.label || b.key}
                  fill={`url(#barGrad-${gradientId}-${bIdx})`}
                  radius={b.radius || [5, 5, 1, 1]}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onMouseEnter={() => setHoveredSeries(b.key)}
                  onMouseLeave={() => setHoveredSeries(null)}
                  style={{
                    opacity: hoveredSeries !== null && hoveredSeries !== b.key ? 0.45 : 1,
                    transition: "opacity 0.2s ease",
                  }}
                />
              ))
            ) : (
              <Bar
                dataKey={dataKey}
                radius={[6, 6, 2, 2]}
                animationDuration={800}
                animationEasing="ease-out"
                onMouseEnter={(_, idx) => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {chartData.map((entry, index) => {
                  const isHovered = hoveredIndex === index;
                  const isPeak = entry[dataKey] === peak && peak > 0;
                  return (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={
                        isHovered
                          ? `url(#${gradientId}-hover)`
                          : isPeak
                          ? accentColor
                          : `url(#${gradientId})`
                      }
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        filter: isHovered
                          ? "drop-shadow(0 4px 8px rgba(99, 102, 241, 0.35))"
                          : "none",
                        opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1,
                      }}
                    />
                  );
                })}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Modern Tag Legend for Multi-Series */}
      {isMulti && showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {bars.map((b, idx) => {
            const isHovered = hoveredSeries === b.key;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredSeries(b.key)}
                onMouseLeave={() => setHoveredSeries(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer border ${
                  isHovered
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 scale-105 shadow-xs"
                    : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: b.color || "#6366f1" }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                  {b.name || b.label || b.key}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Self-contained Glassmorphic MiniChart Card
 */
export function MiniChartCard({
  title = "Frequency Distribution",
  subtitle = "Activity and frequency breakdown",
  badgeText,
  data,
  xKey,
  dataKey,
  bars,
  height = 190,
  barColor,
  accentColor,
  unit,
  className = "",
  ...props
}) {
  return (
    <div
      className={`glass-default rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-5 sm:p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xs ${className}`}
      {...props}
    >
      <MiniChart
        title={title}
        subtitle={subtitle}
        badgeText={badgeText}
        data={data}
        xKey={xKey}
        dataKey={dataKey}
        bars={bars}
        height={height}
        barColor={barColor}
        accentColor={accentColor}
        unit={unit}
      />
    </div>
  );
}

export default MiniChart;
