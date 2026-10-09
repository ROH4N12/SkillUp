import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { createNoise3D } from "simplex-noise";

/**
 * WavyBackground / BlueMeshyBackground
 * 
 * High-performance generative wavy & mesh background.
 * Optimized for mobile & low-power devices:
 *  - Uses zero-overhead CSS radial gradient mesh on mobile (<768px) and reduced motion.
 *  - On desktop: runs throttled at 30fps with half-resolution canvas buffer to reduce GPU draw calls by 75%.
 *  - Automatically pauses rendering when the browser tab is hidden.
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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  const noiseRef = useRef(null);
  if (!noiseRef.current) {
    noiseRef.current = createNoise3D();
  }
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);
  const ntRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    if (isMobile) return; // Skip canvas rendering on mobile — CSS gradient handles it

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Half-resolution rendering for 75% GPU fill-rate savings (blur softens it anyway)
    const scale = 0.5;
    let w = (canvas.width = Math.floor(window.innerWidth * scale));
    let h = (canvas.height = Math.floor(window.innerHeight * scale));

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas) return;
        w = canvas.width = Math.floor(window.innerWidth * scale);
        h = canvas.height = Math.floor(window.innerHeight * scale);
      }, 200);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const noise = noiseRef.current;
    const speedVal = getSpeed();
    const fpsInterval = 1000 / 30; // Cap to 30 FPS for buttery smooth, battery-friendly ambient motion

    const waveConfigs = [
      { yRatio: 0.15, amp: 40, freq: 0.002, width: 30, colorIdx: 0 },
      { yRatio: 0.35, amp: 50, freq: 0.0018, width: 38, colorIdx: 1 },
      { yRatio: 0.55, amp: 45, freq: 0.0022, width: 32, colorIdx: 2 },
      { yRatio: 0.75, amp: 55, freq: 0.0016, width: 40, colorIdx: 3 },
      { yRatio: 0.90, amp: 38, freq: 0.0024, width: 25, colorIdx: 4 },
    ];

    let isPaused = document.hidden;
    const handleVisibility = () => {
      isPaused = document.hidden;
      if (!isPaused && !prefersReducedMotion) {
        lastFrameTimeRef.current = performance.now();
        animIdRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const render = (currentTime) => {
      if (isPaused) return;

      const elapsed = currentTime - lastFrameTimeRef.current;
      if (elapsed > fpsInterval) {
        lastFrameTimeRef.current = currentTime - (elapsed % fpsInterval);

        const isDark = document.documentElement.classList.contains("dark");
        ctx.clearRect(0, 0, w, h);

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

        // Draw dynamic wave ribbons
        ctx.globalAlpha = waveOpacity || 0.25;
        
        waveConfigs.forEach((cfg, idx) => {
          ctx.beginPath();
          ctx.lineWidth = cfg.width;
          ctx.strokeStyle = waveColors[cfg.colorIdx % waveColors.length];

          const baseY = h * cfg.yRatio;
          const step = 8;

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
      }

      if (!prefersReducedMotion && !isPaused) {
        animIdRef.current = requestAnimationFrame(render);
      }
    };

    lastFrameTimeRef.current = performance.now();
    render(performance.now());

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [blur, speed, waveWidth, waveOpacity, backgroundFill, waveColors, getSpeed, isMobile]);

  // Mobile ultra-fast zero-overhead CSS mesh background
  if (isMobile) {
    const mobileStyle = {
      backgroundImage: `
        radial-gradient(at 15% 15%, rgba(99, 102, 241, 0.18) 0px, transparent 55%),
        radial-gradient(at 85% 25%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
        radial-gradient(at 50% 80%, rgba(56, 189, 248, 0.14) 0px, transparent 55%)
      `,
    };

    if (!children) {
      return (
        <div
          className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-slate-50 dark:bg-[#090d16] ${className}`}
          style={mobileStyle}
          aria-hidden="true"
          {...props}
        />
      );
    }

    return (
      <div
        className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#090d16] ${containerClassName}`}
        style={mobileStyle}
        {...props}
      >
        <div className={`relative z-10 w-full ${className}`}>
          {children}
        </div>
      </div>
    );
  }

  // Desktop smooth canvas background
  if (!children) {
    return (
      <div
        className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none [contain:strict] ${className}`}
        aria-hidden="true"
        {...props}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block transform-gpu"
          id="canvas"
          style={{
            filter: `blur(${Math.min(blur, 16)}px)`,
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
          filter: `blur(${Math.min(blur, 16)}px)`,
        }}
      />
      <div className={`relative z-10 w-full ${className}`}>
        {children}
      </div>
    </div>
  );
}

export default WavyBackground;
