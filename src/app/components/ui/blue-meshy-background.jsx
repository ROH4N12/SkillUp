import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { createNoise3D } from "simplex-noise";

/**
 * WavyBackground / BlueMeshyBackground
 * 
 * High-performance animated generative wavy & mesh canvas background.
 * Uses 3D simplex noise with multi-tier wave heights and dynamic floating gradients
 * to create an organic, fluid, moving ambient backdrop across the entire screen.
 */
export function WavyBackground({
  children,
  className = "",
  containerClassName = "",
  colors,
  waveWidth = 40,
  backgroundFill,
  blur = 20,
  speed = "slow",
  waveOpacity = 0.25,
  isFixed = true,
  ...props
}) {
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
        return 0.0008;
      case "fast":
        return 0.002;
      default:
        return typeof speed === "number" ? speed : 0.0012;
    }
  }, [speed]);

  const waveColors = useMemo(
    () =>
      colors ?? [
        "rgba(99, 102, 241, 0.35)",  // Indigo
        "rgba(168, 85, 247, 0.3)",   // Purple
        "rgba(56, 189, 248, 0.32)",  // Sky Blue
        "rgba(139, 92, 246, 0.28)",  // Violet
        "rgba(34, 211, 238, 0.25)",  // Cyan
        "rgba(236, 72, 153, 0.2)",   // Pink subtle bloom
      ],
    [colors]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas) return;
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const noise = noiseRef.current;
    const speedVal = getSpeed();

    // Multi-height wave configurations spanning entire screen
    const waveConfigs = [
      { yRatio: 0.15, amp: 80, freq: 0.0012, width: 60, colorIdx: 0 },
      { yRatio: 0.35, amp: 100, freq: 0.001, width: 75, colorIdx: 1 },
      { yRatio: 0.55, amp: 90, freq: 0.0014, width: 65, colorIdx: 2 },
      { yRatio: 0.75, amp: 110, freq: 0.0009, width: 80, colorIdx: 3 },
      { yRatio: 0.90, amp: 75, freq: 0.0015, width: 50, colorIdx: 4 },
    ];

    const render = () => {
      const isDark = document.documentElement.classList.contains("dark");
      
      // Clean clear every frame
      ctx.clearRect(0, 0, w, h);

      // Base background fill
      const baseBg = backgroundFill || (isDark ? "#090d16" : "#f8faff");
      ctx.fillStyle = baseBg;
      ctx.fillRect(0, 0, w, h);

      ntRef.current += speedVal;
      const nt = ntRef.current;

      // Draw floating ambient color orbs
      const orbTime = nt * 0.6;
      const orbs = [
        {
          x: w * (0.2 + 0.15 * Math.sin(orbTime * 0.8)),
          y: h * (0.2 + 0.12 * Math.cos(orbTime * 0.7)),
          r: Math.min(w, h) * 0.45,
          color: isDark ? "rgba(99, 102, 241, 0.14)" : "rgba(99, 102, 241, 0.10)",
        },
        {
          x: w * (0.8 - 0.15 * Math.cos(orbTime * 0.6)),
          y: h * (0.35 + 0.15 * Math.sin(orbTime * 0.9)),
          r: Math.min(w, h) * 0.5,
          color: isDark ? "rgba(168, 85, 247, 0.12)" : "rgba(168, 85, 247, 0.08)",
        },
        {
          x: w * (0.45 + 0.12 * Math.cos(orbTime * 0.5)),
          y: h * (0.75 - 0.12 * Math.sin(orbTime * 0.8)),
          r: Math.min(w, h) * 0.55,
          color: isDark ? "rgba(56, 189, 248, 0.10)" : "rgba(56, 189, 248, 0.07)",
        },
      ];

      orbs.forEach((orb) => {
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw dynamic full-screen wave ribbons
      ctx.globalAlpha = waveOpacity || 0.25;
      
      waveConfigs.forEach((cfg, idx) => {
        ctx.beginPath();
        ctx.lineWidth = cfg.width;
        ctx.strokeStyle = waveColors[cfg.colorIdx % waveColors.length];

        const baseY = h * cfg.yRatio;
        const step = 12;

        for (let x = 0; x <= w + step; x += step) {
          const noiseVal = noise(x * cfg.freq, idx * 0.45, nt);
          const y = baseY + noiseVal * cfg.amp;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.closePath();
      });

      ctx.globalAlpha = 1.0;

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
