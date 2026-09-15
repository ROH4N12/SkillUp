import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { createNoise3D } from "simplex-noise";

/**
 * WavyBackground / BlueMeshyBackground
 * 
 * High-performance animated generative wavy canvas background.
 * Uses 3D simplex noise for organic, fluid undulating waves.
 * 
 * Performance optimizations:
 * - Noise instance created once (useRef) — never recreated
 * - All animation state stored in refs — zero re-renders during animation
 * - Resize handler debounced to 200ms
 * - Wave drawing step increased to 8px (~40% fewer noise calls per frame)
 * - CSS containment applied for layout isolation
 */
export function WavyBackground({
  children,
  className = "",
  containerClassName = "",
  colors,
  waveWidth = 50,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  isFixed = true,
  ...props
}) {
  // ─── Stable refs (never cause re-renders) ─────────────────────────
  const noiseRef = useRef(null);
  if (!noiseRef.current) {
    noiseRef.current = createNoise3D();
  }
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);
  const ntRef = useRef(0);

  const getSpeed = useCallback(() => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return typeof speed === "number" ? speed : 0.0015;
    }
  }, [speed]);

  const waveColors = useMemo(
    () =>
      colors ?? [
        "#38bdf8", // Sky Blue
        "#818cf8", // Indigo
        "#c084fc", // Purple
        "#a855f7", // Violet
        "#22d3ee", // Cyan
      ],
    [colors]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (ctx.canvas.width = window.innerWidth);
    let h = (ctx.canvas.height = window.innerHeight);
    ctx.filter = `blur(${blur}px)`;

    // Debounced resize — avoids layout thrashing during window resize
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas) return;
        w = ctx.canvas.width = window.innerWidth;
        h = ctx.canvas.height = window.innerHeight;
        ctx.filter = `blur(${blur}px)`;
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const noise = noiseRef.current;
    const speedVal = getSpeed();

    const drawWave = (n) => {
      ntRef.current += speedVal;
      const nt = ntRef.current;
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        // Step of 8px instead of 5px — 40% fewer noise calls per frame
        for (let x = 0; x < w; x += 8) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + h * 0.5);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      // Read theme directly from DOM — avoids React state dependency
      const isDark = document.documentElement.classList.contains("dark");
      const currentBg = backgroundFill || (isDark ? "#090d16" : "#f8faff");

      ctx.fillStyle = currentBg;
      ctx.globalAlpha = waveOpacity || 0.5;
      ctx.fillRect(0, 0, w, h);

      drawWave(5);

      if (!prefersReducedMotion) {
        animIdRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [blur, speed, waveWidth, waveOpacity, backgroundFill, waveColors, getSpeed]);

  if (!children) {
    // Standalone background mode
    return (
      <div
        className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none [contain:strict] ${className}`}
        aria-hidden="true"
        {...props}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block transform-gpu will-change-transform"
          id="canvas"
          style={{
            filter: `blur(${blur}px)`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${containerClassName}`}
      {...props}
    >
      <canvas
        className="absolute inset-0 z-0 w-full h-full block transform-gpu"
        ref={canvasRef}
        id="canvas"
        style={{
          filter: `blur(${blur}px)`,
        }}
      />
      <div className={`relative z-10 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export default WavyBackground;
