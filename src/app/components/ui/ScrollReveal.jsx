import React, { useEffect, useRef, useState } from "react";

/**
 * High-performance ScrollReveal container.
 * Animates elements in when scrolled into the viewport, and out when scrolled away.
 * Operates on GPU transforms for 120 FPS performance.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up", // 'up' | 'down' | 'left' | 'right' | 'scale'
  distance = 16,
  duration = 300,
  once = false, // if true, stays visible once entered; if false, does in/out animation
  as: Component = "div",
  ...props
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale(1)";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0)`;
      case "down":
        return `translate3d(0, -${distance}px, 0)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0)`;
      case "scale":
        return "translate3d(0, 0, 0) scale(0.96)";
      default:
        return `translate3d(0, ${distance}px, 0)`;
    }
  };

  return (
    <Component
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
        backfaceVisibility: "hidden"
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
