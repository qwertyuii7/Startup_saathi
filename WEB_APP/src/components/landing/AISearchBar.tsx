"use client";

import { motion } from "framer-motion";
import { Sparkles, Paperclip, ArrowUp, Globe } from "lucide-react";
import { useState, useEffect } from "react";

const placeholders = [
  "Find schemes for early stage SaaS startups...",
  "Am I eligible for the Startup India Seed Fund?",
  "Show me agriculture grants in Maharashtra...",
  "What are the requirements for DPIIT recognition?"
];

export function AISearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;
    let currentChar = 0;
    let isDeleting = false;

    const type = () => {
      const currentString = placeholders[currentIndex];
      
      if (isDeleting) {
        setPlaceholderText(currentString.substring(0, currentChar - 1));
        currentChar--;
      } else {
        setPlaceholderText(currentString.substring(0, currentChar + 1));
        currentChar++;
      }

      if (!isDeleting && currentChar === currentString.length) {
        timeout = setTimeout(() => {
          isDeleting = true;
          type();
        }, 2000);
      } else if (isDeleting && currentChar === 0) {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % placeholders.length;
        timeout = setTimeout(type, 500);
      } else {
        timeout = setTimeout(type, isDeleting ? 30 : 60);
      }
    };

    timeout = setTimeout(type, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div 
      initial={false}
      animate={{ 
        boxShadow: isFocused ? "0 8px 32px rgba(59, 130, 246, 0.15)" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        borderColor: isFocused ? "rgba(59, 130, 246, 0.4)" : "rgba(229, 231, 235, 1)"
      }}
      className="relative w-full max-w-lg mx-auto bg-white rounded-2xl border flex flex-col p-2 transition-colors duration-300 overflow-hidden"
    >
      {/* Animated Glowing Gradient Background when focused */}
      {isFocused && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-orange-500/5 pointer-events-none"
        />
      )}

      <div className="flex items-center gap-2 px-3 py-2 relative z-10">
        <input 
          type="text"
          placeholder={placeholderText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-neutral-800 placeholder-neutral-400 text-sm font-medium"
        />
      </div>

      <div className="flex items-center justify-between px-2 pt-2 relative z-10 border-t border-neutral-100/50 mt-1">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100 text-xs font-medium text-neutral-500 transition-colors">
            <Paperclip className="w-3.5 h-3.5" />
            Attach Profile
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100 text-xs font-medium text-neutral-500 transition-colors">
            <Globe className="w-3.5 h-3.5" />
            Web Search
          </button>
        </div>
        
        <button className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-300 ${isFocused ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
