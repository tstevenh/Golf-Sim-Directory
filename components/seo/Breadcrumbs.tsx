import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
}

export function Breadcrumbs({ items, showHomeIcon = true }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.current ? (
              <span className="text-cream font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted hover:text-cream transition-colors flex items-center gap-1.5"
              >
                {index === 0 && showHomeIcon && (
                  <Home className="w-3.5 h-3.5" />
                )}
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted mx-1.5" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
