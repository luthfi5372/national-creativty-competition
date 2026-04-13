"use client";

import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

interface TextAnimateProps {
  text: string;
  type?: "word" | "char" | "line";
  className?: string;
  delay?: number;
  duration?: number;
  as?: any;
  once?: boolean;
}

export default function TextAnimate({
  text,
  type = "word",
  className = "",
  delay = 0,
  duration = 0.5,
  as: Component = "span",
  once = true,
}: TextAnimateProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: type === "char" ? 0.02 : 0.1,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { 
      filter: "blur(10px)",
      opacity: 0,
      y: 10,
    },
    visible: { 
      filter: "blur(0px)",
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: "easeOut",
      },
    },
  };

  const elements = type === "word" 
    ? text.split(" ") 
    : type === "char" 
      ? text.split("") 
      : [text];

  // Use Component directly as it is a capitalized React.ElementType

  return (
    <Component
      ref={ref}
      className={`${className}`}
    >
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="inline-block"
      >
        {elements.map((el, i) => (
          <motion.span
            key={`${el}-${i}`}
            variants={itemVariants}
            className="inline-block"
            style={{ marginRight: type === "word" ? "0.25em" : "0" }}
          >
            {el === " " ? "\u00A0" : el}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}
