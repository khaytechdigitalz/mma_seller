"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "right" | "top";
  offset?: number;
}

export default function Tooltip({
  content,
  children,
  side = "right",
  offset = 8,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const top = rect.top + rect.height / 2; // Center vertically
      const left = rect.right + offset; // Right side

      setCoords({ top, left });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full relative block" // Allows trigger to be part of parent layout
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            className="fixed z-60 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded shadow-md pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translateY(-50%)", // Center vertically on coordinate
            }}
          >
            {content}
            {/* Tiny arrow pointing left */}
            <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </div>,
          document.body,
        )}
    </>
  );
}
