"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  searchParams = {}
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    
    // Copy existing params except page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
    
    // Add page param if not page 1
    if (page > 1) {
      params.set("page", String(page));
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show with ellipsis
      if (currentPage <= 3) {
        // Start: 1, 2, 3, 4, ..., last
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // End: 1, ..., last-3, last-2, last-1, last
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: 1, ..., current-1, current, current+1, ..., last
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <Link
        href={buildHref(currentPage - 1)}
        className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
          currentPage <= 1
            ? "pointer-events-none opacity-50 border-default text-muted"
            : "border-default text-cream hover:border-masters-green hover:text-masters-green"
        }`}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => (
          <span key={index}>
            {page === "..." ? (
              <span className="px-2 text-muted">...</span>
            ) : (
              <Link
                href={buildHref(page as number)}
                className={`min-w-[40px] h-10 flex items-center justify-center text-sm rounded-lg border transition-colors ${
                  currentPage === page
                    ? "bg-masters-green text-deep-black border-masters-green font-semibold"
                    : "border-default text-cream hover:border-masters-green hover:text-masters-green"
                }`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </Link>
            )}
          </span>
        ))}
      </div>

      {/* Next Button */}
      <Link
        href={buildHref(currentPage + 1)}
        className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
          currentPage >= totalPages
            ? "pointer-events-none opacity-50 border-default text-muted"
            : "border-default text-cream hover:border-masters-green hover:text-masters-green"
        }`}
        aria-disabled={currentPage >= totalPages}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}
