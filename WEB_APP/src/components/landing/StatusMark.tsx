"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatusMarkProps {
  status?: "idle" | "running" | "done" | "error";
  progress?: number;
  label?: string;
  color?: string;
  doneColor?: string;
  errorColor?: string;
  size?: number;
  strokeWidth?: number;
  dashes?: number;
  fontSize?: number;
  spinDuration?: number;
  arcLength?: number;
  drawDuration?: number;
  fillOpacity?: number;
  strike?: boolean;
  strikeDelay?: number;
  indeterminate?: boolean;
  delay?: number;
}

export default function StatusMark({
  status = "idle",
  label,
  color = "#a3a3a3",
  doneColor = "#22c55e",
  errorColor = "#ef4444",
  size = 24,
  strokeWidth = 2.5,
  strike = false,
  strikeDelay = 300,
  fontSize = 15,
  delay = 0,
}: StatusMarkProps) {

  return (
    <div className="flex items-center gap-3">
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center shrink-0">
        
        {/* Idle */}
        {status === "idle" && (
           <div className="w-full h-full rounded-full border-2 border-neutral-200" />
        )}
        
        {/* Running (Spinning) */}
        {status === "running" && (
           <motion.div 
             className="w-full h-full rounded-full border-2 border-neutral-200 border-t-neutral-500"
             animate={{ rotate: 360 }}
             transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
           />
        )}
        
        {/* Done (Checkmark) */}
        {status === "done" && (
           <div className="w-full h-full rounded-full bg-green-500/10 flex items-center justify-center">
             <motion.svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke={doneColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }} 
                  whileInView={{ pathLength: 1, opacity: 1 }} 
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut", delay }} 
                  d="M20 6L9 17l-5-5" 
                />
             </motion.svg>
           </div>
        )}
        
        {/* Error (X mark) */}
        {status === "error" && (
           <div className="w-full h-full rounded-full bg-red-500/10 flex items-center justify-center">
             <motion.svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke={errorColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }} 
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }} 
                  transition={{ duration: 0.4, ease: "easeOut", delay }} 
                  d="M18 6L6 18M6 6l12 12" 
                />
             </motion.svg>
           </div>
        )}
      </div>
      
      {label && (
        <span 
          className={`font-medium relative ${status === 'error' ? 'text-neutral-500' : 'text-neutral-700'}`} 
          style={{ fontSize }}
        >
          {label}
          {strike && (
            <motion.div 
              initial={{ width: 0 }} 
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut", delay: delay + (strikeDelay / 1000) }}
              className="absolute top-1/2 left-0 h-[2px] bg-neutral-400 -translate-y-1/2" 
            />
          )}
        </span>
      )}
    </div>
  );
}
