"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  MapPin,
  Briefcase,
  LogIn,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Trophy,
  Target
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links with icons for mobile
  const navLinks = [
    { label: "Find Venues", href: "/venue/us", icon: MapPin },
    { label: "Search", href: "/search", icon: Search },
    { label: "Best By", href: "/best", icon: Trophy },
    { label: "Launch Monitors", href: "/launch-monitors", icon: Target },
    { label: "For Owners", href: "/submit", icon: Briefcase },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !(e.target as Element).closest('header')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-deep-black/95 backdrop-blur-sm shadow-lg" : "bg-deep-black"
        } border-b border-subtle`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-16 h-16 flex items-center justify-center rounded">
              <Image
                src="/logo.png"
                alt="GolfSimMap logo"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
                priority
              />
            </div>
            <span className="text-lg font-semibold tracking-tight text-cream group-hover:text-masters-green transition-colors">
              GolfSimMap
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-cream transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/search"
              className="p-2.5 text-muted hover:text-cream transition-colors rounded-lg hover:bg-slate/50"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm text-muted hover:text-cream transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border border-default text-muted hover:border-masters-green hover:text-cream transition-all rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm text-muted hover:text-cream transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/submit"
                  className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border border-masters-green text-masters-green hover:bg-masters-green hover:text-deep-black transition-all rounded"
                >
                  List Your Venue
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Larger touch target (48px) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex items-center justify-center w-12 h-12 -mr-2 text-cream hover:bg-slate/50 rounded-lg transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Enhanced with larger touch targets */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-deep-black/80 backdrop-blur-sm md:hidden z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-x-0 top-16 bottom-0 md:hidden bg-deep-black border-t border-subtle z-50 overflow-y-auto">
            <nav className="px-4 py-6">
              {/* Main Navigation - 48px touch targets */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between gap-4 px-4 py-4 min-h-[56px] text-cream font-medium rounded-lg hover:bg-slate/50 active:bg-slate transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className="w-5 h-5 text-masters-green" />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted" />
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-subtle" />

              {/* Auth Section */}
              <div className="space-y-1">
                {session?.user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-4 px-4 py-4 min-h-[56px] text-cream font-medium rounded-lg hover:bg-slate/50 active:bg-slate transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5 text-masters-green" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-4 px-4 py-4 min-h-[56px] w-full text-left text-muted font-medium rounded-lg hover:bg-slate/50 active:bg-slate transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-4 px-4 py-4 min-h-[56px] text-muted font-medium rounded-lg hover:bg-slate/50 active:bg-slate transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-subtle" />

              {/* CTA Button - Large touch target */}
              <Link
                href="/submit"
                className="flex items-center justify-center gap-2 px-6 py-4 min-h-[56px] bg-masters-green text-deep-black font-semibold rounded-lg hover:bg-masters-green/90 active:bg-masters-green/80 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase className="w-5 h-5" />
                <span>List Your Venue</span>
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
