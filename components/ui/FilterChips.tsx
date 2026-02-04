"use client";

import { useState } from "react";
import { X, Filter, ChevronDown } from "lucide-react";
import Link from "next/link";

interface FilterOption {
  label: string;
  value: string;
  href?: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  selected?: string[];
  onChange?: (selected: string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

// Simple filter chips for inline filtering
export function FilterChips({
  options,
  selected = [],
  onChange,
  multiSelect = false,
  className = "",
}: FilterChipsProps) {
  const handleClick = (value: string) => {
    if (!onChange) return;
    
    if (multiSelect) {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        
        if (option.href) {
          return (
            <Link
              key={option.value}
              href={option.href}
              className={`
                inline-flex items-center gap-2 
                px-4 py-2.5 
                rounded-full 
                text-sm font-medium
                transition-all duration-200
                min-h-[44px]
                ${isSelected 
                  ? "bg-masters-green text-deep-black" 
                  : "bg-charcoal border border-default text-cream-subtle hover:border-masters-green hover:text-cream"
                }
              `}
            >
              {option.label}
              {option.count !== undefined && (
                <span className={`text-xs ${isSelected ? "text-deep-black/70" : "text-muted"}`}>
                  ({option.count})
                </span>
              )}
            </Link>
          );
        }

        return (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            className={`
              inline-flex items-center gap-2 
              px-4 py-2.5 
              rounded-full 
              text-sm font-medium
              transition-all duration-200
              min-h-[44px]
              ${isSelected 
                ? "bg-masters-green text-deep-black" 
                : "bg-charcoal border border-default text-cream-subtle hover:border-masters-green hover:text-cream"
              }
            `}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`text-xs ${isSelected ? "text-deep-black/70" : "text-muted"}`}>
                ({option.count})
              </span>
            )}
            {isSelected && (
              <X className="w-4 h-4" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Sticky filter bar for mobile
interface StickyFilterBarProps {
  title?: string;
  children: React.ReactNode;
  showClear?: boolean;
  onClear?: () => void;
  className?: string;
}

export function StickyFilterBar({
  title = "Filter",
  children,
  showClear = false,
  onClear,
  className = "",
}: StickyFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`sticky top-16 z-40 bg-deep-black/95 backdrop-blur-sm border-b border-default ${className}`}>
      {/* Mobile: Collapsible */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 min-h-[52px]"
        >
          <div className="flex items-center gap-2 text-cream">
            <Filter className="w-4 h-4" />
            <span className="font-medium">{title}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            {children}
            {showClear && onClear && (
              <button
                onClick={onClear}
                className="mt-3 text-sm text-masters-green hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Always visible */}
      <div className="hidden md:block px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 overflow-x-auto">
            {children}
          </div>
          {showClear && onClear && (
            <button
              onClick={onClear}
              className="flex-shrink-0 text-sm text-masters-green hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Category filter section with title
interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selected?: string[];
  onChange?: (selected: string[]) => void;
  multiSelect?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function FilterSection({
  title,
  options,
  selected = [],
  onChange,
  multiSelect = false,
  collapsible = true,
  defaultExpanded = true,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="py-4 border-b border-default last:border-b-0">
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-cream font-medium text-sm uppercase tracking-wider">{title}</h3>
          <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <h3 className="text-cream font-medium text-sm uppercase tracking-wider mb-3">{title}</h3>
      )}
      
      {(!collapsible || isExpanded) && (
        <FilterChips
          options={options}
          selected={selected}
          onChange={onChange}
          multiSelect={multiSelect}
        />
      )}
    </div>
  );
}

// Quick filter bar for common categories
interface QuickFilterBarProps {
  basePath: string;
  currentFilter?: string;
  filters?: {
    label: string;
    value: string;
  }[];
}

export function QuickFilterBar({
  basePath,
  currentFilter,
  filters = [
    { label: "All", value: "" },
    { label: "Sim Bar", value: "sim-bar" },
    { label: "Date Night", value: "date-night" },
    { label: "Corporate", value: "corporate-events" },
    { label: "Family", value: "family-friendly" },
    { label: "TrackMan", value: "trackman" },
  ],
}: QuickFilterBarProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 py-3">
      <div className="flex gap-2 min-w-max">
        {filters.map((filter) => {
          const isActive = currentFilter === filter.value || (!currentFilter && filter.value === "");
          const href = filter.value ? `${basePath}/best/${filter.value}` : basePath;
          
          return (
            <Link
              key={filter.value}
              href={href}
              className={`
                inline-flex items-center
                px-4 py-2.5
                rounded-full
                text-sm font-medium
                whitespace-nowrap
                min-h-[44px]
                transition-all duration-200
                ${isActive 
                  ? "bg-masters-green text-deep-black" 
                  : "bg-charcoal border border-default text-cream-subtle hover:border-masters-green hover:text-cream"
                }
              `}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
