"use client";

import { Star, Trophy, Award, Sparkles } from "lucide-react";

interface FeaturedBadgeProps {
  variant?: "star" | "trophy" | "award" | "sparkle";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const icons = {
  star: Star,
  trophy: Trophy,
  award: Award,
  sparkle: Sparkles,
};

const sizes = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function FeaturedBadge({
  variant = "star",
  size = "sm",
  label = "Featured",
  className = "",
}: FeaturedBadgeProps) {
  const Icon = icons[variant];

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        bg-masters-green/20 border border-masters-green/40
        text-masters-green font-semibold uppercase tracking-wider
        rounded-sm
        ${sizes[size]}
        ${className}
      `}
    >
      <Icon className={iconSizes[size]} />
      <span>{label}</span>
    </div>
  );
}

// Rank badge for numbered positions (1st, 2nd, 3rd)
interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RankBadge({ rank, size = "sm", className = "" }: RankBadgeProps) {
  const bgColors: Record<number, string> = {
    1: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
    2: "bg-gray-400/20 border-gray-400/40 text-gray-300",
    3: "bg-amber-600/20 border-amber-600/40 text-amber-500",
  };

  const defaultColor = "bg-charcoal border-default text-muted";
  const colorClass = bgColors[rank] || defaultColor;

  const suffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";

  return (
    <div
      className={`
        inline-flex items-center justify-center
        font-mono font-bold
        border rounded-sm
        ${sizes[size]}
        ${colorClass}
        ${className}
      `}
    >
      #{rank}
      <span className="text-[0.6em] ml-0.5">{suffix}</span>
    </div>
  );
}
