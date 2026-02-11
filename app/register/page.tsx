"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    role: "golfer",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess(true);
        // Auto sign in after registration
        const supabase = createClient();
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-black py-12 px-4">
        <div className="absolute inset-0 scorecard-grid opacity-20" />
        
        <div className="relative z-10 w-full max-w-md">
          <div className="border border-default p-8 bg-charcoal text-center">
            <div className="w-16 h-16 border border-masters-green flex items-center justify-center mx-auto mb-6">
              <span className="text-masters-green text-2xl">✓</span>
            </div>
            <h1 className="text-cream mb-4">Registration Successful!</h1>
            <p className="text-muted">
              Your account has been created. Redirecting you to the homepage...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-black py-12 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
              <span className="text-masters-green font-mono font-bold">GSM</span>
            </div>
            <span className="text-xl font-semibold text-cream group-hover:text-masters-green transition-colors">
              GolfSimMap
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="border border-default p-8 bg-charcoal">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Get Started</span>
            <div className="w-8 h-px bg-masters-green" />
          </div>

          <h1 className="text-center text-cream mb-2">Create Account</h1>
          <p className="text-center text-muted mb-8">
            Join GolfSimMap to save favorites and claim your venue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 border border-sunday-red text-sunday-red text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cream mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-cream mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-cream mb-2">
                Account Type *
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-charcoal border border-default text-cream focus:outline-none focus:border-masters-green transition-colors appearance-none cursor-pointer"
                >
                  <option value="golfer">Golfer</option>
                  <option value="business_owner">Venue Owner</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-cream mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-cream mb-2">
                  Confirm *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-transparent border border-default text-cream placeholder-muted focus:outline-none focus:border-masters-green transition-colors"
                    placeholder="••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 mt-6"
            >
              {isLoading ? "Creating account..." : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-masters-green hover:text-cream transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted hover:text-cream transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
