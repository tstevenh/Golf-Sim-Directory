"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

interface Monitor {
  name: string;
  code: string;
  technology?: string;
  price?: string;
  dataPoints?: string;
  specs?: { label: string; value: string }[];
  hue: number;
}

const monitors: Monitor[] = [
  {
    name: "TrackMan 4",
    code: "TM",
    technology: "Optically Enhanced Radar Tracking (OERT)",
    price: "$25,495",
    dataPoints: "40+ parameters",
    specs: [
      { label: "Radar Sensors", value: "Dual radar (short + long range)" },
      { label: "Indoor Setup", value: "TrackMan to net min 4.7 m (16 ft)" },
      { label: "Dimensions", value: "300 x 300 x 45 mm" },
      { label: "Weight", value: "6.2 lbs / 2.8 kg" },
    ],
    hue: 145,
  },
  {
    name: "Foresight GCQuad",
    code: "FS",
    technology: "Quadrascopic Imaging (4 cameras)",
    price: "$15,999",
    specs: [
      { label: "Cameras", value: "4 (quadrascopic)" },
      { label: "Hitting Zone", value: "18 in x 14 in" },
      { label: "Battery", value: "10,400 mAh; 6–8 hours" },
      { label: "Weight", value: "7.5 lbs / 3.8 kg" },
    ],
    hue: 200,
  },
  {
    name: "Uneekor EYE XO",
    code: "UK",
    technology: "Front Overhead Photometric System",
    price: "$8,000",
    dataPoints: "24 data points",
    specs: [
      { label: "Cameras", value: "2" },
      { label: "Hitting Zone", value: "12 in W x 16 in L" },
      { label: "Placement", value: "Front overhead" },
      { label: "Ball Type", value: "Any" },
    ],
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
                      {monitor.technology ? (
                        <span className="text-xs text-muted">
                          {monitor.technology}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-sm text-cream">
                      {monitor.price ?? ""}
                    </span>
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
                      {activeMonitor.technology ? (
                        <span
                          className="px-2 py-1 text-xs font-mono"
                          style={{
                            backgroundColor: `hsla(${activeMonitor.hue} 70% 30% / 0.3)`,
                            color: `hsl(${activeMonitor.hue} 70% 50%)`,
                          }}
                        >
                          {activeMonitor.technology}
                        </span>
                      ) : null}
                    </div>
                    {activeMonitor.price ? (
                      <p className="text-muted text-sm">
                        Starting at{" "}
                        <span className="font-mono text-cream">
                          {activeMonitor.price}
                        </span>
                      </p>
                    ) : null}
                    {activeMonitor.dataPoints ? (
                      <p className="text-muted text-sm mt-1">
                        Data points:{" "}
                        <span className="font-mono text-cream">
                          {activeMonitor.dataPoints}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>

                {activeMonitor.specs?.length ? (
                  <div className="mb-8">
                    <span className="text-xs text-muted uppercase tracking-wider block mb-3">
                      Key Specs
                    </span>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {activeMonitor.specs.map((spec) => (
                        <div key={spec.label} className="border border-default p-3">
                          <span className="text-xs text-muted uppercase tracking-wider block mb-1">
                            {spec.label}
                          </span>
                          <span className="text-sm text-cream-subtle">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-4 pt-6 border-t border-subtle">
                  <Link
                    href={`/launch-monitors/${
                      activeMonitor.code === "TM" ? "trackman-4" : 
                      activeMonitor.code === "FS" ? "gcquad" : "uneekor-eyexo"
                    }`}
                    className="btn-primary"
                  >
                    <span>Full Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/launch-monitors"
                    className="btn-outline"
                  >
                    <span>Compare All</span>
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
          <Link href="/launch-monitors" className="block p-5 border border-subtle hover:border-masters-green/50 hover:bg-masters-green/5 transition-all">
            <Zap className="w-5 h-5 text-masters-green mb-3" />
            <span className="text-cream font-semibold block mb-1">
              Radar Systems
            </span>
            <span className="text-sm text-muted">
              Track full ball flight. Best for outdoor use and maximum
              accuracy. Learn more →
            </span>
          </Link>
          <Link href="/launch-monitors" className="block p-5 border border-subtle hover:border-masters-green/50 hover:bg-masters-green/5 transition-all">
            <Target className="w-5 h-5 text-masters-green mb-3" />
            <span className="text-cream font-semibold block mb-1">
              Camera Systems
            </span>
            <span className="text-sm text-muted">
              Capture impact data with precision. Ideal for indoor simulators.
              Learn more →
            </span>
          </Link>
          <Link href="/launch-monitors" className="block p-5 border border-subtle hover:border-masters-green/50 hover:bg-masters-green/5 transition-all">
            <TrendingUp className="w-5 h-5 text-masters-green mb-3" />
            <span className="text-cream font-semibold block mb-1">
              Which to Choose?
            </span>
            <span className="text-sm text-muted">
              Compare all systems and find the right fit for your space and budget →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
