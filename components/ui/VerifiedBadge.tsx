import { Check } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerifiedBadge({ size = "md", className = "" }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center bg-masters-green/20 border border-masters-green text-masters-green font-medium ${sizeClasses[size]} ${className}`}
      title="Verified by owner"
    >
      <Check className={iconSizes[size]} />
      <span>Verified</span>
    </span>
  );
}
