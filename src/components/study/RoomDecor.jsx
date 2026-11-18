/**
 * RoomDecor: subtle desk-side details for the Snowy Night room —
 * a warm lamp glow, a potted plant and a small stack of books with
 * a mug. Modern flat vector shapes in the room palette, rendered
 * behind the content panels. Decorative only (aria-hidden).
 */
function RoomDecor() {
  return (
    <div className="sn-decor" aria-hidden="true">
      {/* Warm champagne light pools */}
      <div className="sn-lamp-glow" />
      <div className="sn-desk-glow" />

      {/* Arc floor lamp */}
      <svg
        className="sn-decor-lamp"
        viewBox="0 0 140 200"
        focusable="false"
      >
        <path
          d="M28 196 Q28 54 96 48"
          fill="none"
          stroke="#A88755"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M74 24 Q96 12 118 24 Q124 44 96 50 Q68 44 74 24 Z"
          fill="#D6BD91"
        />
        <circle cx="96" cy="52" r="7" fill="#F2D9A6" />
        <rect x="16" y="192" width="34" height="7" rx="3.5" fill="#795365" />
      </svg>

      {/* Potted plant */}
      <svg
        className="sn-decor-plant"
        viewBox="0 0 120 150"
        focusable="false"
      >
        <g stroke="#3E5C50" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M60 100 C 58 76 46 56 34 46" />
          <path d="M60 100 C 62 74 74 56 88 48" />
          <path d="M60 100 C 60 70 60 52 60 36" />
        </g>
        <path
          d="M34 46 C 22 42 16 30 18 20 C 30 24 38 34 34 46 Z"
          fill="#5E7B6A"
        />
        <path
          d="M88 48 C 100 44 106 32 104 22 C 92 26 84 36 88 48 Z"
          fill="#7A9B84"
        />
        <path
          d="M60 36 C 52 26 52 14 60 4 C 68 14 68 26 60 36 Z"
          fill="#7A9B84"
        />
        <path
          d="M60 100 C 54 84 42 78 32 80 C 40 90 50 98 60 100 Z"
          fill="#48604F"
        />
        <path
          d="M60 100 C 66 84 78 78 88 80 C 80 90 70 98 60 100 Z"
          fill="#5E7B6A"
        />
        <rect x="34" y="98" width="52" height="10" rx="5" fill="#C99CA8" />
        <path d="M40 108 L80 108 L74 140 Q60 146 46 140 Z" fill="#B77D85" />
      </svg>

      {/* Book stack + mug */}
      <svg
        className="sn-decor-books"
        viewBox="0 0 160 120"
        focusable="false"
      >
        <rect x="6" y="88" width="122" height="18" rx="5" fill="#22345C" />
        <rect x="6" y="88" width="10" height="18" rx="5" fill="#31477A" />
        <rect x="18" y="68" width="100" height="18" rx="5" fill="#B77D85" />
        <rect x="18" y="68" width="9" height="18" rx="4.5" fill="#C99CA8" />
        <rect x="32" y="52" width="72" height="15" rx="5" fill="#A88755" />
        <rect x="32" y="52" width="8" height="15" rx="4" fill="#D6BD91" />
        <rect x="118" y="74" width="28" height="32" rx="8" fill="#D6BD91" />
        <path
          d="M146 80 Q160 84 156 96 Q152 104 146 104"
          fill="none"
          stroke="#D6BD91"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x="122" y="74" width="6" height="32" rx="3" fill="#F2D9A6" opacity="0.6" />
      </svg>
    </div>
  );
}

export default RoomDecor;
