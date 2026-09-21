import React, { useId, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Badge } from "./badge";

/**
 * Custom Frosted Glass Tooltip for Glowing Line Chart
 */
export const LineChartTooltipContent = ({
  active,
  payload,
  label,
  hideLabel = false,
  unit = "",
  config,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-xl transition-all pointer-events-none z-50 min-w-[140px]">
        {!hideLabel && (
          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
            {label}
          </div>
        )}
        <div className="space-y-1.5">
          {payload.map((entry, idx) => {
            const seriesConfig = config?.[entry.dataKey];
            const name = seriesConfig?.label || entry.name || entry.dataKey;
            const color = seriesConfig?.color || entry.stroke || entry.color || "#6366f1";

            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  {entry.value?.toLocaleString() || 0} {unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const ChartTooltip = ({ content, cursor = false, ...props }) => {
  return <Tooltip cursor={cursor} content={content} {...props} />;
};

export const ChartContainer = ({ children, className = "", config, ...props }) => {
  return (
    <div className={`w-full ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Modern Glowing Line Chart with SVG filter glow and smooth bump/monotone interpolation
 */
export function GlowingLineChart({
  data = [],
  config,
  lines, // Array of { dataKey, stroke, name, type, strokeWidth }
  dataKey = "progress",
  xKey = "month",
  stroke = "var(--chart-2, #6366f1)",
  glowColor = "#6366f1",
  type = "bump", // "bump" | "monotone" | "natural"
  height = 240,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = false,
  showDots = false,
  unit = "%",
  className = "",
  margin = { top: 15, right: 15, left: -15, bottom: 5 },
}) {
  const [hoveredSeries, setHoveredSeries] = useState(null);
  const filterId = useId().replace(/:/g, "_");

  // Determine series to render
  const seriesList = React.useMemo(() => {
    if (lines && Array.isArray(lines) && lines.length > 0) {
      return lines.map((l, i) => {
        const conf = config?.[l.dataKey];
        return {
          dataKey: l.dataKey,
          name: l.name || conf?.label || l.dataKey,
          stroke: l.stroke || conf?.color || (i === 0 ? "var(--chart-2, #6366f1)" : i === 1 ? "var(--chart-5, #14b8a6)" : "#a855f7"),
          strokeWidth: l.strokeWidth || 2.5,
          type: l.type || type,
        };
      });
    }

    if (config) {
      return Object.entries(config).map(([k, v], i) => ({
        dataKey: k,
        name: v.label || k,
        stroke: v.color || (i === 0 ? "var(--chart-2, #6366f1)" : "var(--chart-5, #ec4899)"),
        strokeWidth: 2.5,
        type,
      }));
    }

    return [
      {
        dataKey,
        name: "Progress",
        stroke,
        strokeWidth: 2.5,
        type,
      },
    ];
  }, [lines, config, dataKey, stroke, type]);

  return (
    <div className={`w-full flex flex-col justify-between ${className}`}>
      <div className="w-full relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={margin} accessibilityLayer>
            <defs>
              {/* SVG Glowing Filter */}
              <filter
                id={`rainbow-line-glow-${filterId}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {showGrid && (
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.18)"
              />
            )}

            {showXAxis && (
              <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                fontWeight={500}
                stroke="rgba(100, 116, 139, 0.85)"
                tickFormatter={(value) => {
                  if (typeof value === "string" && value.length > 3 && !value.startsWith("Week")) {
                    return value.slice(0, 3);
                  }
                  return value;
                }}
              />
            )}

            {showYAxis && (
              <YAxis
                stroke="rgba(100, 116, 139, 0.85)"
                fontSize={11}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                domain={[0, (dataMax) => Math.max(30, Math.ceil((dataMax + 5) / 10) * 10)]}
              />
            )}

            <Tooltip
              cursor={{ stroke: "rgba(99, 102, 241, 0.15)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
              content={<LineChartTooltipContent unit={unit} config={config} />}
            />

            {seriesList.map((s, idx) => {
              const isHovered = hoveredSeries === s.dataKey;
              const isFaded = hoveredSeries !== null && !isHovered;

              return (
                <Line
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  type={s.type}
                  stroke={s.stroke}
                  strokeWidth={isHovered ? s.strokeWidth + 1 : s.strokeWidth}
                  dot={
                    showDots
                      ? { fill: s.stroke, r: 3.5, strokeWidth: 2, stroke: "#ffffff" }
                      : false
                  }
                  activeDot={{
                    r: 6,
                    fill: s.stroke,
                    stroke: "#ffffff",
                    strokeWidth: 2.5,
                    filter: `url(#rainbow-line-glow-${filterId})`,
                  }}
                  filter={`url(#rainbow-line-glow-${filterId})`}
                  animationDuration={900}
                  animationEasing="ease-out"
                  style={{
                    opacity: isFaded ? 0.35 : 1,
                    transition: "opacity 0.2s ease, stroke-width 0.2s ease",
                  }}
                  onMouseEnter={() => setHoveredSeries(s.dataKey)}
                  onMouseLeave={() => setHoveredSeries(null)}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend Tags for Multi-Series */}
      {(showLegend || seriesList.length > 1) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {seriesList.map((s, idx) => {
            const isHovered = hoveredSeries === s.dataKey;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredSeries(s.dataKey)}
                onMouseLeave={() => setHoveredSeries(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer border ${
                  isHovered
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 scale-105 shadow-xs"
                    : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.stroke }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                  {s.name}
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
 * Self-contained GlowingLineChartCard with header badge and glassmorphism styling
 */
export function GlowingLineChartCard({
  title = "Glowing Line Chart",
  subtitle = "Performance trends",
  badgeText = "5.2%",
  badgeTrending = true,
  data = [],
  config,
  lines,
  dataKey = "progress",
  xKey = "month",
  height = 240,
  unit = "%",
  className = "",
  ...props
}) {
  return (
    <div
      className={`glass-default rounded-2xl border border-slate-200/70 dark:border-slate-800/80 p-5 sm:p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xs flex flex-col justify-between ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {title}
            {badgeText && (
              <Badge
                variant="outline"
                className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-none ml-1.5"
              >
                {badgeTrending && <TrendingUp className="h-3.5 w-3.5" />}
                <span>{badgeText}</span>
              </Badge>
            )}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <GlowingLineChart
        data={data}
        config={config}
        lines={lines}
        dataKey={dataKey}
        xKey={xKey}
        height={height}
        unit={unit}
      />
    </div>
  );
}

export default GlowingLineChart;
