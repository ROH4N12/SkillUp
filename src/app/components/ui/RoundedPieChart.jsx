import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

/**
 * Custom Frosted Glass Tooltip for Pie Chart
 */
export const ChartTooltipContent = ({ active, payload, total, nameKey = "name", hideLabel = false }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const value = item.value || 0;
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    const color = item.payload?.fill || item.payload?.color || item.color || "#6366f1";
    const name = item.name || item.payload?.[nameKey] || item.payload?.name || item.payload?.browser || "Category";

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-xl transition-all pointer-events-none z-50">
        {!hideLabel && (
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {name}
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-2 text-xs">
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {value.toLocaleString()}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            ({percent}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const ChartTooltip = ({ content, ...props }) => {
  return <Tooltip content={content} {...props} />;
};

export const ChartContainer = ({ children, className = "", config, ...props }) => {
  return (
    <div className={`w-full ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Modern Rounded Pie / Donut Chart with LabelList, cornerRadius, and paddingAngle
 */
export function RoundedPieChart({
  data = [],
  config,
  dataKey = "value",
  nameKey = "name",
  innerRadius = 36,
  outerRadius = 78,
  cornerRadius = 8,
  paddingAngle = 4,
  showLabels = true,
  showLegend = true,
  height = 240,
  centerLabel,
  centerSublabel,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  // Default color palette fallback
  const defaultColors = [
    "#10b981", // Emerald
    "#6366f1", // Indigo
    "#f59e0b", // Amber
    "#ef4444", // Rose
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#ec4899", // Pink
  ];

  // Calculate total for percentage display
  const total = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr[dataKey]) || 0), 0);
  }, [data, dataKey]);

  // Process data with config and fill mapping
  const formattedData = React.useMemo(() => {
    return data.map((entry, index) => {
      const entryKey = entry[nameKey] || entry.browser || entry.name || `item-${index}`;
      const configItem = config ? config[entryKey] || config[entry.browser] || config[entry.name] : null;

      const fill =
        entry.fill ||
        entry.color ||
        configItem?.color ||
        defaultColors[index % defaultColors.length];

      const name =
        configItem?.label ||
        entry[nameKey] ||
        entry.name ||
        entry.browser ||
        `Item ${index + 1}`;

      return {
        ...entry,
        [dataKey]: Number(entry[dataKey]) || 0,
        fill,
        name,
      };
    });
  }, [data, dataKey, nameKey, config]);

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <div className="relative w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <ChartTooltipContent
                  total={total}
                  nameKey={nameKey}
                />
              }
            />
            <Pie
              data={formattedData}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              cornerRadius={cornerRadius}
              paddingAngle={paddingAngle}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke="none"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter:
                      activeIndex === index
                        ? "brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.18))"
                        : "none",
                    transform: activeIndex === index ? "scale(1.03)" : "scale(1)",
                    transformOrigin: "center center",
                  }}
                />
              ))}

              {showLabels && (
                <LabelList
                  dataKey={dataKey}
                  stroke="none"
                  fontSize={11}
                  fontWeight={600}
                  fill="#ffffff"
                  position="inside"
                  formatter={(value) => {
                    if (total === 0 || value === 0) return "";
                    const pct = (value / total) * 100;
                    // Only display label on slice if slice is large enough (>= 10%)
                    return pct >= 10 ? `${pct.toFixed(0)}%` : "";
                  }}
                />
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Optional Center Stat */}
        {(centerLabel || centerSublabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {centerLabel && (
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {centerLabel}
              </span>
            )}
            {centerSublabel && (
              <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mt-0.5">
                {centerSublabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Modern Tag Legend Breakdown */}
      {showLegend && formattedData.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-3 w-full px-2">
          {formattedData.map((item, index) => {
            const val = item[dataKey];
            const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
            const isHovered = activeIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer border ${
                  isHovered
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 scale-105 shadow-xs"
                    : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                  {item.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px] ml-0.5">
                  {pct}%
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
 * Self-contained RoundedPieChartCard with header badge and glassmorphism styling
 */
export function RoundedPieChartCard({
  title = "Pie Chart",
  subtitle = "Analytics overview",
  badgeText = null,
  badgeTrending = true,
  data = [],
  config,
  dataKey = "value",
  nameKey = "name",
  height = 240,
  innerRadius = 36,
  outerRadius = 78,
  cornerRadius = 8,
  paddingAngle = 4,
  centerLabel,
  centerSublabel,
  className = "",
}) {
  return (
    <div
      className={`glass-default rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {title}
            {badgeText && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  badgeTrending
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    : "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
                }`}
              >
                {badgeTrending && <TrendingUp className="w-3.5 h-3.5" />}
                <span>{badgeText}</span>
              </span>
            )}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <RoundedPieChart
        data={data}
        config={config}
        dataKey={dataKey}
        nameKey={nameKey}
        height={height}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        cornerRadius={cornerRadius}
        paddingAngle={paddingAngle}
        centerLabel={centerLabel}
        centerSublabel={centerSublabel}
      />
    </div>
  );
}

export default RoundedPieChart;
