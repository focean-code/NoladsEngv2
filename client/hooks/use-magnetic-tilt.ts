import { useRef, useEffect, useCallback } from "react";

interface MagneticTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glare?: boolean;
  reset?: boolean;
}

export const useMagneticTilt = (options: MagneticTiltOptions = {}) => {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.05,
    speed = 300,
    glare = false,
    reset = true,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);

  const updateTransform = useCallback(
    (x: number, y: number, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = x - centerX;
      const deltaY = y - centerY;

      const rotateY = (deltaX / (rect.width / 2)) * maxTilt;
      const rotateX = -(deltaY / (rect.height / 2)) * maxTilt;

      element.style.setProperty("--rotate-x", `${rotateX}deg`);
      element.style.setProperty("--rotate-y", `${rotateY}deg`);

      element.style.transform = `
      perspective(${perspective}px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      scale3d(${scale}, ${scale}, ${scale})
    `;

      if (glare) {
        const glareElement = element.querySelector(
          ".tilt-glare",
        ) as HTMLElement;
        if (glareElement) {
          const glareX = (deltaX / rect.width) * 100;
          const glareY = (deltaY / rect.height) * 100;
          glareElement.style.background = `linear-gradient(${Math.atan2(deltaY, deltaX) * (180 / Math.PI)}deg, rgba(255,255,255,0.2) 0%, transparent 50%)`;
          glareElement.style.opacity = Math.min(
            Math.abs(deltaX + deltaY) / 200,
            0.3,
          ).toString();
        }
      }
    },
    [maxTilt, perspective, scale, glare],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!elementRef.current) return;
      updateTransform(e.clientX, e.clientY, elementRef.current);
    },
    [updateTransform],
  );

  const handleMouseLeave = useCallback(() => {
    if (!elementRef.current || !reset) return;

    const element = elementRef.current;
    element.style.setProperty("--rotate-x", "0deg");
    element.style.setProperty("--rotate-y", "0deg");
    element.style.transform = `
      perspective(${perspective}px) 
      rotateX(0deg) 
      rotateY(0deg) 
      scale3d(1, 1, 1)
    `;

    if (glare) {
      const glareElement = element.querySelector(".tilt-glare") as HTMLElement;
      if (glareElement) {
        glareElement.style.opacity = "0";
      }
    }
  }, [perspective, glare, reset]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.style.transformStyle = "preserve-3d";
    element.style.transition = `transform ${speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;

    if (glare) {
      let glareElement = element.querySelector(".tilt-glare") as HTMLElement;
      if (!glareElement) {
        glareElement = document.createElement("div");
        glareElement.className = "tilt-glare";
        glareElement.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          pointer-events: none;
          transition: opacity ${speed}ms ease;
          opacity: 0;
        `;
        element.appendChild(glareElement);
      }
    }

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, speed, glare]);

  return elementRef;
};
