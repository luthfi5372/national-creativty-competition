"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface FluidParams {
  viscosity: number;
  flowSpeed: number;
  refractionDepth: number;
  cursorIntensity: number;
}

interface FluidContextType {
  mousePos: { x: number; y: number };
  mousePosNormalized: { x: number; y: number };
  params: FluidParams;
  setParams: React.Dispatch<React.SetStateAction<FluidParams>>;
  updateMousePos: (x: number, y: number) => void;
  matrixMode: boolean;
  setMatrixMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultParams: FluidParams = {
  viscosity: 0.5,
  flowSpeed: 0.3,
  refractionDepth: 0.6,
  cursorIntensity: 0.7,
};

const FluidContext = createContext<FluidContextType>({
  mousePos: { x: 0, y: 0 },
  mousePosNormalized: { x: 0, y: 0 },
  params: defaultParams,
  setParams: () => {},
  updateMousePos: () => {},
  matrixMode: false,
  setMatrixMode: () => {},
});

export function FluidProvider({ children }: { children: React.ReactNode }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mousePosNormalized, setMousePosNormalized] = useState({ x: 0, y: 0 });
  const [params, setParams] = useState<FluidParams>(defaultParams);
  const [matrixMode, setMatrixMode] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Easter egg listener
  useEffect(() => {
    let keySequence = "";
    const target = "rahasia";

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") {
        return;
      }
      
      keySequence += e.key.toLowerCase();
      
      // Keep only last N characters
      if (keySequence.length > target.length) {
        keySequence = keySequence.slice(-target.length);
      }
      
      if (keySequence === target) {
        setMatrixMode(prev => !prev);
        // Add a bit of visual flair on activation if we want, like speeding up params
        setParams(p => ({
          ...p,
          flowSpeed: matrixMode ? 0.3 : 0.8,
          viscosity: matrixMode ? 0.5 : 0.8,
        }));
        keySequence = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [matrixMode]);

  const updateMousePos = useCallback((x: number, y: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setMousePos({ x, y });
      setMousePosNormalized({
        x: (x / window.innerWidth) * 2 - 1,
        y: -(y / window.innerHeight) * 2 + 1,
      });
    });
  }, []);

  return (
    <FluidContext.Provider
      value={{ mousePos, mousePosNormalized, params, setParams, updateMousePos, matrixMode, setMatrixMode }}
    >
      {children}
    </FluidContext.Provider>
  );
}

export function useFluid() {
  return useContext(FluidContext);
}
