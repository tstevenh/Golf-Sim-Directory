"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

interface Monitor {
  name: string;
  code: string;
  type: string;
  price: string;
  accuracy: number;
  accuracyLabel: string;
  metrics: string[];
  bestFor: string[];
  hue: number;
}

const monitors: Monitor[] = [
  {
    name: "TrackMan 4",
    code: "TM",
    type: "Radar",
    price: "$19,000+",
    accuracy: 98,
    accuracyLabel: "±0.5 yards",
    metrics: [
      "Ball Speed",
      "Spin Rate",
      "Launch Angle",
      "Carry Distance",
      "Total Distance",
      "Club Path",
    ],
    bestFor: ["Tour Players", "Professionals", "Serious Amateurs"],
    hue: 145,
  },
  {
    name: "Foresight GCQuad",
    code: "FS",
    type: "Camera",
    price: "$14,000+",
    accuracy: 97,
    accuracyLabel: "±0.3 yards",
    metrics: [
      "Ball Speed",
      "Spin Rate",
      "Launch Angle",
      "Carry Distance",
      "Club Head Speed",
      "Attack Angle",
    ],
    bestFor: ["Fitters", "Indoor Facilities", "Coaches"],
    hue: 200,
  },
  {
    name: "Uneekor EYE XO",
    code: "UK",
    type: "Camera",
    price: "$10,000+",
    accuracy: 95,
    accuracyLabel: "±0.5 yards",
    metrics: [
      "Ball Speed",
      "Spin Rate",
      "Launch Angle",
      "Carry Distance",
      "Smash Factor",
    ],
    bestFor: ["Home Simulators", "Commercial", "Value Seekers"],
    hue: 43,
  },
];

export function LaunchMonitorComparison() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<string>("TM");
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const activeMonitor = monitors.find((m) => m.code === selectedMonitor);

  return (
    <section
      ref={sectionRef}
      id="compare"
      className="relative py-24 md:py-32 bg-deep-black overflow-hidden"
    >
      <div className="absolute inset-0 scorecard-grid opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              Compare
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <h2 className="text-cream">
              Launch Monitor
              <br />
              <span className="text-muted">Showdown</span>
            </h2>
            <p className="text-muted max-w-md mt-4 md:mt-0 text-sm leading-relaxed">
              Compare the top systems found at indoor golf venues. Each offers
              unique advantages depending on your needs.
            </p>
          </div>
        </div>

        <div
          className={`grid lg:grid-cols-12 gap-6 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="lg:col-span-4 space-y-3">
            {monitors.map((monitor) => (
              <button
                key={monitor.code}
                onClick={() => setSelectedMonitor(monitor.code)}
                className={`w-full text-left p-5 border transition-all duration-300 ${
                  selectedMonitor === monitor.code
                    ? "border-masters-green bg-masters-green-subtle"
                    : "border-subtle hover:border-default bg-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center font-mono font-bold text-sm"
                      style={{
                        backgroundColor:
                          selectedMonitor === monitor.code
                            ? `hsla(${monitor.hue} 70% 30% / 0.3)`
                            : "hsla(var(--cream) / 0.05)",
                        color: `hsl(${monitor.hue} 70% 50%)`,
                      }}
                    >
                      {monitor.code}
                    </div>
                    <div>
                      <span
                        className={`block font-semibold ${
                          selectedMonitor === monitor.code
                            ? "text-cream"
                            : "text-cream-subtle"
                        }`}
                      >
                        {monitor.name}
                      </span>
                      <span className="text-xs text-muted">
                        {monitor.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-sm text-cream">
                      {monitor.price}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted">Accuracy</span>
                    <span
                      className="font-mono"
                      style={{ color: `hsl(${monitor.hue} 70% 50%)` }}
                    >
                      {monitor.accuracyLabel}
                    </span>
                  </div>
                  <div className="h-1 bg-slate overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000"
                      style={{
                        width: isVisible ? `${monitor.accuracy}%` : "0%",
                        backgroundColor: `hsl(${monitor.hue} 70% 50%)`,
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8">
            {activeMonitor && (
              <div className="h-full border border-default p-6 md:p-8">
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-subtle">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-cream text-2xl">
                        {activeMonitor.name}
                      </h3>
                      <span
                        className="px-2 py-1 text-xs font-mono"
                        style={{
                          backgroundColor: `hsla(${activeMonitor.hue} 70% 30% / 0.3)`,
                          color: `hsl(${activeMonitor.hue} 70% 50%)`,
                        }}
                      >
                        {activeMonitor.type}
                      </span>
                    </div>
                    <p className="text-muted text-sm">
                      Starting at{" "}
                      <span className="font-mono text-cream">
                        {activeMonitor.price}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Target
                        className="w-5 h-5"
                        style={{ color: `hsl(${activeMonitor.hue} 70% 50%)` }}
                      />
                      <span className="font-mono text-2xl font-bold text-cream">
                        {activeMonitor.accuracy}%
                      </span>
                    </div>
                    <span className="text-xs text-muted">Accuracy Rating</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <span className="text-xs text-muted uppercase tracking-wider block mb-3">
                      Tracked Metrics
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeMonitor.metrics.map((metric) => (
                        <span
                          key={metric}
                          className="px-3 py-1.5 text-xs border border-default text-cream-subtle"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted uppercase tracking-wider block mb-3">
                      Best For
                    </span>
                    <div className="space-y-2">
                      {activeMonitor.bestFor.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-masters-green" />
                          <span className="text-sm text-cream-subtle">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-subtle">
                  <Link
                    href={`/compare/launch-monitors/${activeMonitor.code.toLowerCase()}`}
                    className="btn-primary"
                  >
                    <span>Full Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/search?system=${activeMonitor.code.toLowerCase()}`}
                    className="btn-outline"
                  >
                    <span>Find Venues</span>
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`mt-12 grid md:grid-cols-3 gap-6 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="p-5 border border-subtle">
            <Zap className="w-5 h-5 text-masters-green mb-3" />
            <span className="text-cream font-semibold block mb-1">
              Radar Systems
            </span>
            <span className="text-sm text-muted">
              Track full ball flight. Best for outdoor use and maximum
              accuracy.
            </span>
          </div>
          <div className="p-5 border border-subtle">
            <Target className="w-5 h-5 text-masters-green mb-3" />
            <span className="text-cream font-semibold block mb-1">
              Camera Systems
            </span>
            <span className="text-sm text-muted">
              Capture impact data with precision. Ideal for indoor simulators.
            </span>
          </div>
          <div className="p-5 border border-subtle">
            <TrendingUp className="w-5 h-5 text-masters-green mb-3" />
            <span className="text-cream font-semibold block mb-1">
              Which to Choose?
            </span>
            <span className="text-sm text-muted">
              Consider your space, budget, and primary use case.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
