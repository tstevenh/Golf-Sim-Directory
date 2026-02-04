// Golf-inspired SVG patterns and textures
export function GolfBallPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full opacity-5 ${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dimples" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="3" fill="currentColor" />
          <circle cx="30" cy="30" r="3" fill="currentColor" />
          <circle cx="30" cy="10" r="2" fill="currentColor" opacity="0.5" />
          <circle cx="10" cy="30" r="2" fill="currentColor" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dimples)" />
    </svg>
  );
}

export function SwingPathSVG({ className = "" }: { className?: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        d="M -10 80 Q 25 20, 50 50 T 110 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        className="swing-path opacity-10"
      />
      <path
        d="M -10 85 Q 30 30, 55 55 T 110 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.3"
        className="swing-path opacity-5"
        style={{ animationDelay: "0.5s" }}
      />
    </svg>
  );
}

export function GridLines({ className = "" }: { className?: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] ${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export function RadarSweep({ className = "" }: { className?: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none opacity-10 ${className}`} viewBox="0 0 200 200">
      <defs>
        <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="80%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
    </svg>
  );
}

export function FairwayCurve({ className = "" }: { className?: string }) {
  return (
    <svg className={`absolute bottom-0 left-0 right-0 w-full ${className}`} viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path
        d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z"
        fill="currentColor"
        className="text-[var(--bg-primary)]"
      />
    </svg>
  );
}
