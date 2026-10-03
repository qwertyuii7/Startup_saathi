"use client";

import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  href?: string | null;
  /** "dark" (default) renders dark text for light backgrounds; "light" renders white text for dark backgrounds. */
  tone?: "dark" | "light";
}

export function BrandLogo({
  className = "",
  size = 28,
  showText = true,
  href = "/dashboard",
  tone = "dark",
}: BrandLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-xs"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="AROVA Logo"
          width={size}
          height={size}
          className="object-contain w-full h-full"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold text-sm tracking-tight leading-tight ${
              tone === "light" ? "text-white" : "text-neutral-900"
            }`}
          >
            AROVA
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-violet-600 leading-none">
            INTELLIGENCE
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-95 transition-opacity inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
