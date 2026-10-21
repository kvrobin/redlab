"use client";
import React from "react";

interface RedLabLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

export function RedLabLogo({
  variant = "full",
  size = "md",
  animated = true,
  className = "",
}: RedLabLogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Mikrofluidikai Hatszög & R-E-D Csomópontok */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-red-600/30 to-rose-500/30 blur-md group-hover:from-red-500/50 group-hover:to-rose-500/50 transition-all duration-500 ${
            animated ? "animate-pulse" : ""
          }`}
        />
        <svg
          viewBox="0 0 64 64"
          className="relative w-full h-full drop-shadow-[0_0_12px_rgba(225,29,72,0.45)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="redlabHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="50%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#9F1239" />
            </linearGradient>
          </defs>

          {/* Külső Lab-on-a-Chip Hatszög */}
          <polygon
            points="32,5 57,19 57,45 32,59 7,45 7,19"
            fill="#090A0F"
            stroke="url(#redlabHexGrad)"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Belső szaggatott Barrier gyűrű */}
          <polygon
            points="32,13 49,23 49,41 32,51 15,41 15,23"
            fill="none"
            stroke="#E11D48"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.55"
          />

          {/* 3 Mikrocsatorna */}
          <path
            d="M32,14 L32,26 M16,41 L26,35 M48,41 L38,35"
            stroke="#FB7185"
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Központi Szinkron Mag */}
          <circle cx="32" cy="32" r="6" fill="url(#redlabHexGrad)" />
          <circle cx="32" cy="32" r="2.4" fill="#FFF1F2" />

          {/* R - E - D Kutatói Csomópontok (Robin, Emma, Domi) */}
          <circle cx="32" cy="14" r="3.6" fill="#EF4444" />
          <circle cx="16" cy="41" r="3.6" fill="#F43F5E" />
          <circle cx="48" cy="41" r="3.6" fill="#F97316" />
        </svg>
      </div>

      {/* Szöveges Logó */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <div className={`flex items-center gap-1 tracking-tight ${textSizes[size]}`}>
            <span className="font-black bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(225,29,72,0.3)]">
              RED
            </span>
            <span className="font-light text-slate-100">Lab</span>
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 mt-1">
            R • E • D RESEARCH
          </span>
        </div>
      )}
    </div>
  );
}
