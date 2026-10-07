import React, { useState, useMemo } from "react";
import { Flame, Trophy, Zap } from "lucide-react";

/**
 * Modern GitHub-style Contribution Heatmap Calendar
 * Evenly distributed grid with centered month labels and comfortable spacing
 */
export function GitHubCalendar({
  data = [],
  weeksToShow = 26, // ~6 months
  colorTheme = "emerald", // "emerald" | "indigo" | "purple" | "blue"
  showStats = true,
  showLegend = true,
  showMonthLabels = true,
  showDayLabels = true,
  title,
  subtitle,
  className = "",
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Parse and index input data into Map<dateString, count>
  const countMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(data)) return map;

    data.forEach((item) => {
      if (typeof item === "string") {
        map.set(item, (map.get(item) || 0) + 1);
      } else if (item && item.date) {
        const dStr = typeof item.date === "string" ? item.date.slice(0, 10) : item.date;
        map.set(dStr, (map.get(dStr) || 0) + (Number(item.count) || 1));
      }
    });
    return map;
  }, [data]);

  // Generate contiguous calendar grid (weeks x 7 days) ending today
  const { weeks, monthSpans, totalCount, activeDaysCount, maxStreak, currentStreak } = useMemo(() => {
    const today = new Date();
    // End on Saturday of the current week to align columns cleanly
    const endDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - endDayOfWeek));

    const totalDays = weeksToShow * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    const generatedWeeks = [];
    let total = 0;
    let activeDays = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    let iterDate = new Date(startDate);

    for (let w = 0; w < weeksToShow; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dStr = iterDate.toISOString().slice(0, 10);
        const count = countMap.get(dStr) || 0;
        const isFuture = iterDate > today;

        if (!isFuture) {
          total += count;
          if (count > 0) {
            activeDays++;
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        }

        days.push({
          date: dStr,
          displayDate: iterDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          month: iterDate.toLocaleDateString("en-US", { month: "short" }),
          count,
          isFuture,
          dayOfWeek: d,
        });

        iterDate.setDate(iterDate.getDate() + 1);
      }
      generatedWeeks.push(days);
    }

    // Group weeks into month spans with accurate column coverage
    const spans = [];
    let curMonth = null;
    for (let w = 0; w < weeksToShow; w++) {
      // Use the month of the middle day in the week for clean month boundaries
      const midDay = generatedWeeks[w][3];
      const mName = midDay.month;

      if (!curMonth || curMonth.name !== mName) {
        if (curMonth) {
          spans.push(curMonth);
        }
        curMonth = {
          name: mName,
          span: 1,
          startWeek: w,
        };
      } else {
        curMonth.span += 1;
      }
    }
    if (curMonth) {
      spans.push(curMonth);
    }

    // Calculate current active streak ending today
    let currStreak = 0;
    let checkDate = new Date(today);
    while (true) {
      const dStr = checkDate.toISOString().slice(0, 10);
      if (countMap.get(dStr) > 0) {
        currStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      weeks: generatedWeeks,
      monthSpans: spans,
      totalCount: total,
      activeDaysCount: activeDays,
      maxStreak: longestStreak,
      currentStreak: currStreak,
    };
  }, [countMap, weeksToShow]);

  // Color intensities
  const getCellClass = (count, isFuture) => {
    if (isFuture) {
      return "bg-transparent border border-dashed border-slate-200 dark:border-slate-800 opacity-20 pointer-events-none";
    }
    if (count === 0) {
      return "bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500";
    }

    // Emerald theme
    if (colorTheme === "emerald") {
      if (count === 1) return "bg-emerald-300 dark:bg-emerald-900 border-emerald-400/50 text-emerald-950";
      if (count === 2) return "bg-emerald-400 dark:bg-emerald-700 border-emerald-500/60 text-white";
      if (count <= 4) return "bg-emerald-500 dark:bg-emerald-600 border-emerald-600/70 text-white shadow-xs";
      return "bg-emerald-600 dark:bg-emerald-400 border-emerald-700 dark:border-emerald-300 text-white shadow-[0_0_10px_rgba(16,185,129,0.55)]";
    }

    // Indigo theme
    if (colorTheme === "indigo") {
      if (count === 1) return "bg-indigo-300 dark:bg-indigo-900 border-indigo-400/50";
      if (count === 2) return "bg-indigo-400 dark:bg-indigo-700 border-indigo-500/60";
      if (count <= 4) return "bg-indigo-500 dark:bg-indigo-600 border-indigo-600/70";
      return "bg-indigo-600 dark:bg-indigo-400 border-indigo-700 shadow-[0_0_10px_rgba(99,102,241,0.55)]";
    }

    return "bg-emerald-500 text-white";
  };

  return (
    <div className={`w-full flex flex-col justify-between ${className}`}>
      {/* Header Stats */}
      {showStats && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {title || "Daily Activity"}
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Flame className="w-3 h-3" />
                {currentStreak > 0 ? `${currentStreak} day streak` : "Active calendar"}
              </span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {subtitle || `${totalCount} Activity across the last ${weeksToShow} weeks`}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{activeDaysCount} active days</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 pl-3 border-l border-slate-200 dark:border-slate-700">
              <Trophy className="w-3.5 h-3.5 text-indigo-500" />
              <span>{maxStreak} day best</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Heatmap Container */}
      <div className="w-full overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <div className="w-full min-w-[620px] flex flex-col">
          {/* Month Labels along top - centered in the middle of each month's columns */}
          {showMonthLabels && (
            <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3.5 pl-7 sm:pl-8 select-none gap-1.5 sm:gap-2">
              {monthSpans.map((m, idx) => (
                <div
                  key={idx}
                  style={{ flex: m.span }}
                  className="h-4 flex items-center justify-center text-center overflow-hidden"
                >
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-tight whitespace-nowrap text-center">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Grid Rows: Weekday labels + evenly distributed week columns */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Day of Week Labels (Mon, Wed, Fri) aligned to 7 rows */}
            {showDayLabels && (
              <div className="flex flex-col justify-between h-[120px] sm:h-[135px] text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-400 pr-1 select-none shrink-0">
                <span className="h-3.5 leading-3.5">Mon</span>
                <span className="h-3.5 leading-3.5">Wed</span>
                <span className="h-3.5 leading-3.5">Fri</span>
              </div>
            )}

            {/* Weeks Columns: Evenly spread across available width */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-between">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5 sm:gap-2 flex-1 max-w-[18px]">
                  {week.map((day, dIdx) => {
                    const isHovered = hoveredCell?.date === day.date;
                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={() => setHoveredCell(day)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-full aspect-square min-w-[12px] min-h-[12px] rounded-[3.5px] sm:rounded-md transition-all duration-150 cursor-pointer ${getCellClass(
                          day.count,
                          day.isFuture
                        )} ${isHovered
                          ? "scale-135 z-20 brightness-115 shadow-lg ring-2 ring-indigo-500 dark:ring-indigo-400"
                          : ""
                          }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Info Tooltip & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-4 pt-3 text-xs border-t border-slate-100 dark:border-slate-800/80">
        <div className="text-slate-600 dark:text-slate-400 text-[11px] min-h-[20px] flex items-center">
          {hoveredCell ? (
            <span className="font-semibold text-slate-900 dark:text-white">
              {hoveredCell.count === 0
                ? "no activity"
                : `${hoveredCell.count} ${hoveredCell.count === 1 ? "contribution" : "contributions"}`}{" "}
              on <span className="text-indigo-600 dark:text-indigo-400 font-bold">{hoveredCell.displayDate}</span>
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">Hover over any day to see activity count</span>
          )}
        </div>

        {/* Legend: Less -> More */}
        {showLegend && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 select-none">
            <span>Less</span>
            <div className="w-3 h-3 rounded-[3px] bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-300 dark:bg-emerald-900" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-500 dark:bg-emerald-600" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-600 dark:bg-emerald-400" />
            <span>More</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GitHubCalendar;
