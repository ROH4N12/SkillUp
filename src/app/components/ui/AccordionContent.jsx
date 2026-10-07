import React from "react";

/**
 * Modern CSS Grid-based smooth accordion container.
 * Seamlessly expands and collapses in and out without hardcoded heights or layout jumps.
 */
export function AccordionContent({ isOpen, children, className = "" }) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
      } ${className}`}
      style={{
        transitionDuration: "280ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "grid-template-rows, opacity"
      }}
    >
      <div className="overflow-hidden">
        {children}
      </div>
    </div>
  );
}
