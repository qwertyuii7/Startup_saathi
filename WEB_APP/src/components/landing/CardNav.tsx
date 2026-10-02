"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export interface NavLink {
  label: string;
  ariaLabel?: string;
  href?: string;
}

export interface NavItem {
  label: string;
  bgColor: string;
  textColor: string;
  links: NavLink[];
}

export interface CardNavProps {
  logo?: any;
  logoAlt?: string;
  items: NavItem[];
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ease?: string;
  theme?: string;
}

export default function CardNav({
  items,
  baseColor = "#0A0A0A",
  menuColor = "#fff",
  buttonBgColor = "#111",
  buttonTextColor = "#fff",
  ease = "power3.out",
}: CardNavProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (index: number) => {
    setActiveMenu(index);
    const menu = menuRefs.current[index];
    if (menu) {
      gsap.killTweensOf(menu);
      gsap.fromTo(
        menu,
        { y: 15, opacity: 0, display: "none" },
        { y: 0, opacity: 1, duration: 0.4, ease: ease, display: "block" }
      );

      // Stagger in the links smoothly
      const links = menu.querySelectorAll(".nav-link-item");
      if (links.length) {
        gsap.killTweensOf(links);
        gsap.fromTo(
          links,
          { x: -10, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out", delay: 0.05 }
        );
      }
    }
  };

  const handleMouseLeave = (index: number) => {
    setActiveMenu(null);
    const menu = menuRefs.current[index];
    if (menu) {
      gsap.killTweensOf(menu);
      gsap.to(menu, {
        y: 10,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        display: "none",
      });
    }
  };

  return (
    <div className={`fixed inset-x-0 z-[100] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-center ${isScrolled ? 'top-4 px-4' : 'top-0 px-0'}`}>
      <div 
        ref={containerRef}
        className={`w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] backdrop-blur-md flex items-center ${isScrolled ? 'max-w-4xl h-16 rounded-2xl border border-neutral-200 shadow-2xl px-6' : 'max-w-full h-20 border-b border-white/10 px-6 lg:px-8'}`}
        style={{ backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.9)' : `${baseColor}E6` }}
      >
        <div className="flex w-full items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className={`flex items-center gap-2 tracking-tight transition-all duration-700 ${isScrolled ? 'text-black' : 'text-white'}`}>
            <span className={`font-serif italic font-light transition-all duration-700 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>
              SS
            </span>
            <span className={`font-medium ${isScrolled ? 'text-lg' : 'text-xl'}`}>Startup Saathi</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 relative h-full">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="relative flex items-center h-full px-1"
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={() => handleMouseLeave(idx)}
              >
                <button 
                  className={`flex items-center px-4 py-2 font-medium rounded-xl transition-colors ${isScrolled ? 'text-[13px] text-neutral-600 hover:text-black hover:bg-neutral-100' : 'text-sm text-white hover:bg-white/10'}`}
                >
                  {item.label}
                  <ChevronDown className={`ml-1 transition-transform duration-300 ${activeMenu === idx ? 'rotate-180' : ''} ${isScrolled ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                </button>

                {/* Dropdown Wrapper with invisible bridge padding (pt-6) so hover doesn't break */}
                <div 
                  ref={(el) => { menuRefs.current[idx] = el; }}
                  className={`absolute left-1/2 -translate-x-1/2 opacity-0 hidden min-w-[220px] ${isScrolled ? 'top-[40px] pt-8' : 'top-[50px] pt-8'}`}
                >
                  {/* Floating Card Visuals */}
                  <div 
                    className="overflow-hidden rounded-2xl shadow-2xl border border-white/10"
                    style={{ backgroundColor: item.bgColor, color: item.textColor }}
                  >
                    <div className="p-3 flex flex-col gap-1">
                      {item.links.map((link, linkIdx) => (
                        <Link 
                          key={linkIdx} 
                          href={link.href || "#"}
                          aria-label={link.ariaLabel}
                          className="nav-link-item block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Link 
              href="/login" 
              className={`px-3 py-2 font-medium transition-colors hover:opacity-70 ${isScrolled ? 'text-[13px] text-neutral-600 hover:text-black' : 'text-sm text-white'}`}
            >
              Log in
            </Link>
            <Link 
              href="/dashboard" 
              className={`rounded-xl font-medium transition-transform hover:scale-105 shadow-sm flex items-center ${isScrolled ? 'px-4 py-2 text-[13px] bg-black text-white' : 'px-5 py-2.5 text-sm bg-white text-black'}`}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
