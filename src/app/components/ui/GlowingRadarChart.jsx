import React, { useId, useState, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Target } from "lucide-react";
import { Badge } from "./badge";

/**
 * Custom Frosted Glass Tooltip for Glowing Radar Chart
 */
export const RadarTooltipContent = ({
  active,
  payload,
  labelKey = "skill",
  unit = "%",
  config,
}) => {
  if (active && payload && payload.length) {
    const firstItem = payload[0];
    const skillName =
      firstItem.payload?.[labelKey] ||
      firstItem.payload?.month ||
      firstItem.payload?.subject ||
      firstItem.payload?.name ||
      "Skill Domain";

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-xl transition-all pointer-events-none z-50 min-w-[150px]">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2 pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-indigo-500" />
          <span>{skillName}</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, idx) => {
            const conf = config?.[entry.dataKey];
            const name = conf?.label || entry.name || entry.dataKey;
            const color = conf?.color || entry.stroke || entry.color || "#6366f1";

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
                  {entry.value?.toLocaleString() || 0}
                  {unit}
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
 * Modern Glowing Stroke Radar Chart with Gaussian SVG filter glow
 */
export function GlowingRadarChart({
  data = [],
  config,
  series, // Array of { dataKey, name, stroke, fill, fillOpacity, strokeDasharray }
  dataKey = "current",
  angleKey = "skill",
  stroke = "var(--chart-1, #6366f1)",
  height = 250,
  showLegend = true,
  unit = "%",
  fill = "none",
  className = "",
  margin = { top: 10, right: 25, bottom: 10, left: 25 },
}) {
  const [hoveredSeries, setHoveredSeries] = useState(null);
  const filterId = useId().replace(/:/g, "_");

  // Determine radar series list
  const seriesList = useMemo(() => {
    if (series && Array.isArray(series) && series.length > 0) {
      return series.map((s, i) => {
        const conf = config?.[s.dataKey];
        return {
          dataKey: s.dataKey,
          name: s.name || conf?.label || s.dataKey,
          stroke: s.stroke || conf?.color || (i === 0 ? "#6366f1" : "#a855f7"),
          fill: s.fill !== undefined ? s.fill : "none",
          fillOpacity: s.fillOpacity !== undefined ? s.fillOpacity : (s.fill === "none" ? 0 : 0.2),
          strokeWidth: s.strokeWidth || 2.5,
          strokeDasharray: s.strokeDasharray,
        };
      });
    }

    if (config) {
      return Object.entries(config).map(([k, v], i) => ({
        dataKey: k,
        name: v.label || k,
        stroke: v.color || (i === 0 ? "#6366f1" : "#a855f7"),
        fill: "none",
        fillOpacity: 0,
        strokeWidth: 2.5,
      }));
    }

    return [
      {
        dataKey,
        name: "Current",
        stroke,
        fill,
        fillOpacity: fill === "none" ? 0 : 0.2,
        strokeWidth: 2.5,
      },
    ];
  }, [series, config, dataKey, stroke, fill]);

  return (
    <div className={`w-full flex flex-col justify-between ${className}`}>
      <div className="w-full relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={margin}>
            <defs>
              {/* SVG Glowing Stroke Filter */}
              <filter
                id={`stroke-line-glow-${filterId}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <PolarGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.25)"
            />

            <PolarAngleAxis
              dataKey={angleKey}
              stroke="rgba(71, 85, 105, 0.9)"
              fontSize={11}
              fontWeight={600}
              tick={{ fill: "currentColor", opacity: 0.9 }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              stroke="rgba(148, 163, 184, 0.35)"
              fontSize={9.5}
            />

            <Tooltip
              cursor={false}
              content={
                <RadarTooltipContent
                  labelKey={angleKey}
                  unit={unit}
                  config={config}
                />
              }
            />

            {seriesList.map((s) => {
              const isHovered = hoveredSeries === s.dataKey;
              const isFaded = hoveredSeries !== null && !isHovered;

              return (
                <Radar
                  key={s.dataKey}
                  name={s.name}
                  dataKey={s.dataKey}
                  stroke={s.stroke}
                  fill={s.fill}
                  fillOpacity={s.fillOpacity}
                  strokeWidth={isHovered ? s.strokeWidth + 1 : s.strokeWidth}
                  strokeDasharray={s.strokeDasharray}
                  filter={`url(#stroke-line-glow-${filterId})`}
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
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend Badges */}
      {showLegend && seriesList.length > 0 && (
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
 * Self-contained GlowingRadarChartCard with glassmorphic styling
 */
export function GlowingRadarChartCard({
  title = "Radar Chart",
  subtitle = "Domain & Skill breakdown",
  badgeText,
  badgeTrending = true,
  data = [],
  config,
  series,
  dataKey,
  angleKey = "skill",
  height = 250,
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

      <GlowingRadarChart
        data={data}
        config={config}
        series={series}
        dataKey={dataKey}
        angleKey={angleKey}
        height={height}
        unit={unit}
      />
    </div>
  );
}

export default GlowingRadarChart;
