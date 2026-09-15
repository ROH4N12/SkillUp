import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * WavyBackground / BlueMeshyBackground
 * 
 * Reusable animated generative wavy canvas background.
 * Uses 3D simplex noise to create organic, fluid undulating waves.
 * Can be used both as a layout wrapper or as a fixed background layer.
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
  const noise = createNoise3D();
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return typeof speed === "number" ? speed : 0.0015;
    }
  };

  const waveColors = colors ?? [
    "#38bdf8", // Sky Blue
    "#818cf8", // Indigo
    "#c084fc", // Purple
    "#a855f7", // Violet
    "#22d3ee", // Cyan
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (ctx.canvas.width = window.innerWidth);
    let h = (ctx.canvas.height = window.innerHeight);
    ctx.filter = `blur(${blur}px)`;
    let nt = 0;

    const handleResize = () => {
      if (!canvas) return;
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };

    window.addEventListener("resize", handleResize);

    let animationId;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const currentBg = backgroundFill || (isDark ? "#090d16" : "#f8faff");

      ctx.fillStyle = currentBg;
      ctx.globalAlpha = waveOpacity || 0.5;
      ctx.fillRect(0, 0, w, h);

      drawWave(5);

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(render);
      }
    };

    const drawWave = (n) => {
      nt += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + h * 0.5); // centered wave
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [blur, speed, waveWidth, waveOpacity, backgroundFill, colors, theme]);

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
