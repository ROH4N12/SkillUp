import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

export interface ATCShaderProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  intensity?: "subtle" | "medium" | "vibrant";
  interactive?: boolean;
  className?: string;
}

/**
 * ATCShader (Aperture Transit Corridor Shader Background)
 * 
 * Production-ready WebGL2 / WebGL fullscreen shader component.
 * Features a cosine-folded chromatic warp tunnel effect with smooth
 * interactive parallax, adaptive dark/light palette, and zero-overhead GPU rendering.
 * 
 * Sits strictly at z-index 0 with pointer-events-none to prevent interfering
 * with UI interactions, clicks, modals, or dropdowns.
 */
export function ATCShader({
  speed = 0.6,
  intensity = "subtle",
  interactive = true,
  className = "",
  ...props
}: ATCShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  const intensityMultiplier = {
    subtle: 0.65,
    medium: 1.0,
    vibrant: 1.4,
  }[intensity] || 0.65;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL2 or fallback to WebGL
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      console.warn("WebGL not supported for ATC Shader");
      return;
    }

    // Vertex Shader (Fullscreen Quad)
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader (Aperture Transit Corridor Cosine-Folded Chromatic Warp)
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_speed;
      uniform float u_intensity;
      uniform float u_dark;

      mat2 rot(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c, -s, s, c);
      }

      // Cosine color palette (IQ palette technique)
      vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Gentle interactive mouse parallax
        uv += mouse * 0.05;
        
        float t = u_time * u_speed * 0.35;
        float r = length(uv);
        float angle = atan(uv.y, uv.x);
        
        vec3 col = vec3(0.0);
        vec2 p = uv;
        
        // 4-layer Cosine-folded raymarch iterations
        for (float i = 0.0; i < 4.0; i++) {
          float fi = i;
          vec2 q = p;
          q = rot(t * 0.12 + fi * 0.35 + angle * 0.15) * q;
          q = abs(q) - vec2(0.28 + 0.08 * sin(t * 0.25 + fi * 1.2), 0.28 + 0.08 * cos(t * 0.2 + fi * 1.5));
          q = rot(t * 0.08 + fi * 0.18) * q;
          
          float d = length(q) * exp(-r * 0.65);
          
          // SkillUp Violet / Indigo / Cyan Chromatic Dispersion
          vec3 pCol = palette(
            d + fi * 0.22 + t * 0.18,
            vec3(0.5, 0.5, 0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(1.0, 1.0, 1.0),
            vec3(0.68, 0.52, 0.88) // SkillUp Violet/Cyan hues
          );
          
          // Soft ambient luminous caustic ring accumulation
          float ring = 0.015 / (abs(sin(d * 7.5 + t * 0.45)) + 0.075);
          ring *= smoothstep(2.8, 0.15, r);
          
          col += pCol * ring;
        }
        
        // Theme-responsive tone mapping & color balance
        if (u_dark > 0.5) {
          // Dark Mode: Deep obsidian/indigo backdrop with glowing soft violet-cyan filaments
          vec3 bg = vec3(0.038, 0.045, 0.075) + vec3(0.015, 0.02, 0.04) * (1.0 - r);
          col = bg + col * (0.42 * u_intensity);
        } else {
          // Light Mode: Clean luminous white-lavender base with soft pastel caustics
          vec3 bg = vec3(0.975, 0.982, 0.995) - vec3(0.025, 0.018, 0.01) * r;
          col = bg + (col * vec3(0.55, 0.45, 0.8)) * (0.18 * u_intensity);
        }
        
        // Smooth cinematic vignette
        col *= (1.0 - 0.12 * r * r);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Compile Shader Helper
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uSpeedLoc = gl.getUniformLocation(program, "u_speed");
    const uIntensityLoc = gl.getUniformLocation(program, "u_intensity");
    const uDarkLoc = gl.getUniformLocation(program, "u_dark");

    // State tracking
    let animationFrameId: number;
    let startTime = performance.now();
    let currentMouse = [0, 0];
    let targetMouse = [0, 0];
    let isVisible = true;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Resize handler
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      if (targetMouse[0] === 0 && targetMouse[1] === 0) {
        targetMouse = [canvas.width * 0.5, canvas.height * 0.5];
        currentMouse = [canvas.width * 0.5, canvas.height * 0.5];
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // Mouse / Pointer handler with smooth dampening
    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      targetMouse = [e.clientX * dpr, (window.innerHeight - e.clientY) * dpr];
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Visibility change handler (pauses render loop when tab is hidden)
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        startTime = performance.now() - (lastElapsed || 0);
        render();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let lastElapsed = 0;

    // Render loop
    const render = () => {
      if (!isVisible) return;

      const now = performance.now();
      const elapsed = prefersReducedMotion ? 0.0 : (now - startTime) * 0.001;
      lastElapsed = elapsed;

      // Mouse smooth lerp
      currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.04;
      currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.04;

      // Dark mode detection
      const isDark = document.documentElement.classList.contains("dark") ? 1.0 : 0.0;

      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uMouseLoc, currentMouse[0], currentMouse[1]);
      gl.uniform1f(uSpeedLoc, prefersReducedMotion ? 0.0 : speed);
      gl.uniform1f(uIntensityLoc, intensityMultiplier);
      gl.uniform1f(uDarkLoc, isDark);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    // Cleanup
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      if (program) gl.deleteProgram(program);

      const loseContextExt = gl.getExtension("WEBGL_lose_context");
      if (loseContextExt) loseContextExt.loseContext();
    };
  }, [speed, intensityMultiplier, interactive, theme]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none [contain:strict] ${className}`}
      aria-hidden="true"
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block transform-gpu will-change-transform"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default ATCShader;
