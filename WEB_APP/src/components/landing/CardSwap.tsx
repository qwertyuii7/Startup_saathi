"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full h-full bg-white rounded-3xl p-8 lg:p-10 border border-neutral-200 shadow-xl flex flex-col ${className}`}>
      {children}
    </div>
  );
}

interface CardSwapProps {
  children: React.ReactNode[];
  cardDistance?: number; // unused in this specific GSAP setup but kept for API compatibility
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
}

export default function CardSwap({
  children,
  cardDistance = 60,
  verticalDistance = 40,
  delay = 5000,
  pauseOnHover = false,
}: CardSwapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalCards = React.Children.count(children);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);

  const swap = () => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  };

  useEffect(() => {
    timerRef.current = setInterval(swap, delay);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [delay, totalCards]);

  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      const relativeIndex = (index - activeIndex + totalCards) % totalCards;
      
      // If the card just went to the back (relativeIndex is totalCards - 1), we animate it up and out, then snap to back
      if (relativeIndex === totalCards - 1) {
         const tl = gsap.timeline();
         // "Torn apart" throw away animation
         const randomX = (Math.random() - 0.5) * 400;
         const randomRotate = (Math.random() - 0.5) * 45;
         
         tl.to(card, {
            y: -200,
            x: randomX,
            rotationZ: randomRotate,
            opacity: 0,
            scale: 1.1,
            duration: 0.5,
            ease: "power2.in",
            zIndex: 0
         }).set(card, {
            y: 100,
            scale: 0.8,
            opacity: 0
         }).to(card, {
            y: relativeIndex * verticalDistance,
            scale: 1 - relativeIndex * 0.05,
            opacity: 1 - relativeIndex * 0.1,
            duration: 0.4,
            ease: "power3.out"
         });
      } else {
         gsap.to(card, {
            x: 0,
            y: relativeIndex * verticalDistance,
            scale: 1 - relativeIndex * 0.05,
            opacity: 1 - relativeIndex * 0.1,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            zIndex: totalCards - relativeIndex,
            duration: 0.8,
            ease: "power3.out",
         });
      }
    });
  }, [activeIndex, totalCards, verticalDistance]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (pauseOnHover && timerRef.current) clearInterval(timerRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    // Calculate mouse position relative to container center
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    cardsRef.current.forEach((card, index) => {
      const relativeIndex = (index - activeIndex + totalCards) % totalCards;
      
      if (relativeIndex === 0) {
        // Front card: 3D tilt tracking the mouse
        gsap.to(card, {
          rotationY: (x / rect.width) * 20,
          rotationX: -(y / rect.height) * 20,
          x: (x / rect.width) * 10,
          y: (y / rect.height) * 10,
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        // Back cards: Scatter / tear apart pushed by the mouse
        const scatterX = -(x / rect.width) * 80 * relativeIndex;
        const scatterY = relativeIndex * verticalDistance - (y / rect.height) * 60 * relativeIndex;
        const scatterRotate = (x / rect.width) * 15 * relativeIndex;
        
        gsap.to(card, {
          x: scatterX,
          y: scatterY,
          rotationZ: scatterRotate,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    });
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (pauseOnHover) {
       timerRef.current = setInterval(swap, delay);
    }
    
    // Reset all cards to their normal stacked positions
    cardsRef.current.forEach((card, index) => {
      const relativeIndex = (index - activeIndex + totalCards) % totalCards;
      gsap.to(card, {
        x: 0,
        y: relativeIndex * verticalDistance,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    });
  };

  const handleClick = () => {
    swap();
    // Restart timer when clicked to prevent double-swaps immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      if (!isHoveredRef.current || !pauseOnHover) {
        timerRef.current = setInterval(swap, delay);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full perspective-1000 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {React.Children.map(children, (child, index) => (
        <div
          ref={(el) => {
             if (el) cardsRef.current[index] = el;
          }}
          className="absolute inset-0 origin-top will-change-transform"
          style={{ zIndex: totalCards - index }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
