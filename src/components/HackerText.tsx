"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface HackerTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export default function HackerText({ text, className = "", delay = 0 }: HackerTextProps) {
  const [displayText, setDisplayText] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let iteration = 0;
    let timeoutId: NodeJS.Timeout;

    // Optional delay
    if (delay > 0) {
      timeoutId = setTimeout(() => {
        startScrambling();
      }, delay * 1000);
    } else {
      startScrambling();
    }

    function startScrambling() {
      const intervalId = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join("")
        );

        // Slow down the reveal
        if (iteration >= text.length) {
          clearInterval(intervalId);
        }
        
        // Increase iteration based on some logic (e.g. 1/3 characteristic)
        iteration += 1 / 3;
      }, 40);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isInView, text, delay]);

  return (
    <span ref={ref} className={className}>
      {displayText || " "}
    </span>
  );
}
