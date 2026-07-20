export function LotusSeparator({ className = "" }: { className?: string }) {
  return (
    <div className={`flex w-full items-center justify-center py-2 opacity-70 ${className}`}>
      <svg
        width="240"
        height="40"
        viewBox="0 0 240 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white drop-shadow-sm"
      >
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Left Line */}
          <path d="M 5 18 Q 30 28, 50 20 T 94 22" fill="none" />
          
          {/* Right Line */}
          <path d="M 235 18 Q 210 28, 190 20 T 146 22" fill="none" />

          {/* Center Petal */}
          <path d="M 120 5 C 105 13, 110 25, 120 28 C 130 25, 135 13, 120 5 Z" fill="none" />
          
          {/* Inner Teardrop */}
          <path d="M 120 15 C 115 19, 117 25, 120 28 C 123 25, 125 19, 120 15 Z" fill="none" />

          {/* Inner Side Petals */}
          <path d="M 120 28 C 110 28, 102 20, 106 12 C 106 17, 112 23, 120 25" fill="none" />
          <path d="M 120 28 C 130 28, 138 20, 134 12 C 134 17, 128 23, 120 25" fill="none" />

          {/* Outer Side Petals */}
          <path d="M 116 27 C 105 27, 95 23, 92 16 C 96 20, 103 23, 111 24" fill="none" />
          <path d="M 124 27 C 135 27, 145 23, 148 16 C 144 20, 137 23, 129 24" fill="none" />

          {/* Base Cradle Curve */}
          <path d="M 96 23 Q 120 31, 144 23" fill="none" />
        </g>
        
        {/* Center Dot */}
        <circle cx="120" cy="34" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}
