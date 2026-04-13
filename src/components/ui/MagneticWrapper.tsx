"use client";

import React from "react";
import useMagnetic from "@/hooks/useMagnetic";

interface MagneticWrapperProps {
  children: React.ReactElement;
  className?: string;
}

export default function MagneticWrapper({ children, className }: MagneticWrapperProps) {
  const ref = useMagnetic();

  return React.cloneElement(children, {
    // @ts-ignore - ref from hook
    ref: ref,
    className: `${children.props.className || ""} ${className || ""}`.trim(),
  });
}
