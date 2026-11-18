function StudyDeskIllustration({ className = '' }) {
  return (
    <div className={`study-desk-illustration-container ${className}`}>
      <svg
        viewBox="0 0 540 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="study-desk-svg"
        role="img"
        aria-label="Atmospheric study desk with moonlit window, lamp, books, headphones, and coffee"
      >
        <defs>
          {/* Night sky window gradient */}
          <linearGradient id="window-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B0E33" />
            <stop offset="50%" stopColor="#2A1254" />
            <stop offset="100%" stopColor="#3B1775" />
          </linearGradient>

          {/* Moon glow */}
          <radialGradient id="moon-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E2D4FF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#BF5AFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B35FF" stopOpacity="0" />
          </radialGradient>

          {/* Desk Lamp light cone */}
          <linearGradient id="lamp-beam" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#E5C7FF" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#BF5AFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B35FF" stopOpacity="0" />
          </linearGradient>

          {/* Desk surface gradient */}
          <linearGradient id="desk-surface" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C142A" />
            <stop offset="100%" stopColor="#120B1E" />
          </linearGradient>

          {/* Book spine gradient 1 */}
          <linearGradient id="book-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B35FF" />
            <stop offset="100%" stopColor="#6C1EC9" />
          </linearGradient>

          {/* Book spine gradient 2 */}
          <linearGradient id="book-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BF5AFF" />
            <stop offset="100%" stopColor="#9C34DE" />
          </linearGradient>

          {/* Headphone metallic band */}
          <linearGradient id="headphone-band" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#938B9E" />
            <stop offset="50%" stopColor="#F7F3FF" />
            <stop offset="100%" stopColor="#7E728B" />
          </linearGradient>

          {/* Headphone earcups */}
          <radialGradient id="earcup-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#BF5AFF" />
            <stop offset="70%" stopColor="#8B35FF" />
            <stop offset="100%" stopColor="#4A1891" />
          </radialGradient>

          {/* Ambient wall shadow */}
          <radialGradient id="wall-ambient" cx="80%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#321759" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0E0818" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient room background wall */}
        <rect x="0" y="0" width="540" height="320" fill="#0C0715" />
        <rect x="0" y="0" width="540" height="320" fill="url(#wall-ambient)" />

        {/* ================= MOONLIT WINDOW ================= */}
        <g className="illustration-window">
          {/* Window Frame outer */}
          <rect x="290" y="20" width="210" height="180" rx="14" fill="#151022" stroke="#45316B" strokeWidth="3" />
          {/* Sky pane */}
          <rect x="298" y="28" width="194" height="164" rx="8" fill="url(#window-sky)" />

          {/* Stars */}
          <circle cx="320" cy="50" r="1.5" fill="#FFFFFF" opacity="0.8" className="anim-star" />
          <circle cx="350" cy="40" r="1.2" fill="#E2D4FF" opacity="0.6" className="anim-star-delayed" />
          <circle cx="380" cy="65" r="1" fill="#C9B4FF" opacity="0.7" />
          <circle cx="460" cy="45" r="1.5" fill="#FFFFFF" opacity="0.9" className="anim-star" />
          <circle cx="475" cy="80" r="1.2" fill="#E2D4FF" opacity="0.5" />
          <circle cx="330" cy="95" r="1" fill="#FFFFFF" opacity="0.7" className="anim-star-delayed" />
          <circle cx="405" cy="110" r="1.2" fill="#FFFFFF" opacity="0.6" />

          {/* Distant mountains silhouetted */}
          <path
            d="M298 175 L340 145 L380 162 L430 135 L470 158 L492 148 L492 192 L298 192 Z"
            fill="#1E1038"
            opacity="0.8"
          />

          {/* Crescent Moon & Glow */}
          <circle cx="435" cy="68" r="26" fill="url(#moon-aura)" opacity="0.7" className="anim-moon-pulse" />
          <path
            d="M444 54 C432 57 424 67 424 80 C424 93 433 103 446 105 C434 104 420 94 420 79 C420 65 431 55 444 54 Z"
            fill="#F7F3FF"
          />

          {/* Window Grid Lines (Mullions) */}
          <line x1="395" y1="28" x2="395" y2="192" stroke="#25193C" strokeWidth="4" />
          <line x1="298" y1="110" x2="492" y2="110" stroke="#25193C" strokeWidth="4" />

          {/* Window sill */}
          <rect x="282" y="196" width="226" height="8" rx="2" fill="#25193C" stroke="#45316B" strokeWidth="1" />
        </g>

        {/* Ambient moonlight cast on wall */}
        <polygon points="395,196 520,196 540,250 430,250" fill="#BF5AFF" opacity="0.05" />

        {/* ================= STUDY DESK SURFACE ================= */}
        {/* Main desk surface top */}
        <polygon points="10,240 530,240 540,320 0,320" fill="url(#desk-surface)" stroke="#39245C" strokeWidth="1.5" />
        {/* Desk edge bevel */}
        <line x1="0" y1="240" x2="540" y2="240" stroke="#5F3A96" strokeWidth="2" opacity="0.8" />
        <rect x="0" y="242" width="540" height="6" fill="#140D20" />

        {/* ================= DESK LAMP & LIGHT BEAM ================= */}
        <g className="illustration-lamp">
          {/* Light cone hitting desk */}
          <polygon
            points="110,105 32,280 260,280"
            fill="url(#lamp-beam)"
            className="anim-beam-glow"
          />

          {/* Lamp base */}
          <ellipse cx="70" cy="248" rx="22" ry="7" fill="#201732" stroke="#68459E" strokeWidth="2" />
          <ellipse cx="70" cy="246" rx="14" ry="4" fill="#362254" />

          {/* Lower arm */}
          <line x1="70" y1="246" x2="88" y2="170" stroke="#938B9E" strokeWidth="4.5" strokeLinecap="round" />
          {/* Arm pivot joint */}
          <circle cx="88" cy="170" r="5" fill="#BF5AFF" stroke="#15111D" strokeWidth="2" />

          {/* Upper arm */}
          <line x1="88" y1="170" x2="110" y2="105" stroke="#938B9E" strokeWidth="4" strokeLinecap="round" />
          {/* Lamp head pivot */}
          <circle cx="110" cy="105" r="4.5" fill="#BF5AFF" stroke="#15111D" strokeWidth="1.5" />

          {/* Lamp Shade (Cone) */}
          <path
            d="M98 96 L130 114 L104 126 Z"
            fill="#2C1B4A"
            stroke="#8B35FF"
            strokeWidth="2"
          />
          {/* Bulb aura inside shade */}
          <circle cx="114" cy="116" r="6" fill="#FFFFFF" />
          <circle cx="114" cy="116" r="14" fill="#BF5AFF" opacity="0.6" />
        </g>

        {/* ================= STACK OF BOOKS & OPEN NOTEBOOK ================= */}
        <g className="illustration-books">
          {/* Bottom Book */}
          <rect x="135" y="242" width="105" height="15" rx="3" fill="url(#book-grad-1)" stroke="#531FB3" strokeWidth="1" />
          <rect x="238" y="244" width="4" height="11" fill="#F7F3FF" opacity="0.9" /> {/* pages */}

          {/* Middle Book */}
          <rect x="140" y="228" width="98" height="14" rx="3" fill="url(#book-grad-2)" stroke="#7421B8" strokeWidth="1" />
          <rect x="236" y="230" width="4" height="10" fill="#F7F3FF" opacity="0.9" />

          {/* Top Journal with bookmark ribbon */}
          <rect x="145" y="215" width="90" height="13" rx="2.5" fill="#2E1C4D" stroke="#8B35FF" strokeWidth="1" />
          <rect x="233" y="217" width="4" height="9" fill="#F7F3FF" opacity="0.8" />
          {/* Bookmark ribbon dangling */}
          <path d="M190 228 L190 252 L194 248 L198 252 L198 228 Z" fill="#BF5AFF" opacity="0.9" />

          {/* Open study notebook beside the stack */}
          <polygon points="255,248 310,244 315,268 255,272" fill="#EADFFF" stroke="#4A346E" strokeWidth="1" />
          <polygon points="310,244 365,248 365,272 315,268" fill="#F7F3FF" stroke="#4A346E" strokeWidth="1" />
          <line x1="310" y1="244" x2="315" y2="268" stroke="#8B35FF" strokeWidth="1.5" />
          {/* Note lines */}
          <line x1="262" y1="251" x2="304" y2="248" stroke="#938B9E" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="263" y1="256" x2="305" y2="253" stroke="#938B9E" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="264" y1="261" x2="306" y2="258" stroke="#938B9E" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="320" y1="248" x2="358" y2="251" stroke="#938B9E" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="321" y1="253" x2="357" y2="256" stroke="#938B9E" strokeWidth="1" strokeDasharray="3 2" />
          {/* Pen lying beside notebook */}
          <line x1="372" y1="248" x2="395" y2="266" stroke="#BF5AFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="396" cy="267" r="1.5" fill="#F7F3FF" />
        </g>

        {/* ================= PREMIUM OVER-EAR HEADPHONES ================= */}
        <g className="illustration-headphones">
          {/* Arch headband */}
          <path
            d="M150 205 C150 162 215 162 215 205"
            fill="none"
            stroke="url(#headphone-band)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Inner headband padding */}
          <path
            d="M158 198 C158 170 207 170 207 198"
            fill="none"
            stroke="#15111D"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left Earcup */}
          <g>
            <rect x="140" y="195" width="16" height="26" rx="8" fill="url(#earcup-glow)" stroke="#D4A7FF" strokeWidth="1.5" />
            <ellipse cx="148" cy="208" rx="4" ry="7" fill="#15111D" />
            <circle cx="148" cy="208" r="2" fill="#BF5AFF" />
          </g>

          {/* Right Earcup */}
          <g>
            <rect x="210" y="195" width="16" height="26" rx="8" fill="url(#earcup-glow)" stroke="#D4A7FF" strokeWidth="1.5" />
            <ellipse cx="218" cy="208" rx="4" ry="7" fill="#15111D" />
            <circle cx="218" cy="208" r="2" fill="#BF5AFF" />
          </g>
        </g>

        {/* ================= COFFEE MUG WITH SUBTLE STEAM ================= */}
        <g className="illustration-mug">
          {/* Coaster */}
          <ellipse cx="435" cy="265" rx="20" ry="6" fill="#1A112A" stroke="#482F72" strokeWidth="1" />

          {/* Mug handle */}
          <path
            d="M450 240 C462 240 462 256 450 256"
            fill="none"
            stroke="#BF5AFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Mug body */}
          <rect x="420" y="235" width="30" height="27" rx="5" fill="#24163C" stroke="#8B35FF" strokeWidth="1.5" />
          {/* Ceramic accent stripe */}
          <line x1="422" y1="248" x2="448" y2="248" stroke="#BF5AFF" strokeWidth="2" opacity="0.8" />
          {/* Coffee surface */}
          <ellipse cx="435" cy="236" rx="14" ry="4" fill="#120A1E" stroke="#5C3B8D" strokeWidth="1" />
          <ellipse cx="435" cy="236" rx="10" ry="2.5" fill="#4B271B" />

          {/* Subtle rising steam waves */}
          <g className="anim-steam" opacity="0.65">
            <path
              d="M430 228 C427 222 433 216 430 210"
              fill="none"
              stroke="#E2D4FF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M436 226 C439 218 434 212 437 205"
              fill="none"
              stroke="#C9B4FF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M441 228 C438 221 443 215 440 209"
              fill="none"
              stroke="#BF5AFF"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Small potted succulent desk plant */}
        <g className="illustration-plant">
          {/* Pot */}
          <polygon points="480,266 500,266 496,280 484,280" fill="#2B1A48" stroke="#BF5AFF" strokeWidth="1" />
          {/* Plant leaves */}
          <ellipse cx="490" cy="262" rx="4" ry="8" fill="#4CC790" transform="rotate(-15 490 262)" />
          <ellipse cx="493" cy="260" rx="4" ry="9" fill="#5FDC9E" />
          <ellipse cx="497" cy="263" rx="4" ry="8" fill="#3AA674" transform="rotate(20 497 263)" />
        </g>

        {/* Floating dust motes / purple ambient particles */}
        <circle cx="160" cy="140" r="1.5" fill="#E2D4FF" opacity="0.5" className="anim-star" />
        <circle cx="220" cy="120" r="1" fill="#BF5AFF" opacity="0.6" className="anim-star-delayed" />
        <circle cx="190" cy="160" r="1.2" fill="#FFFFFF" opacity="0.4" />
      </svg>
    </div>
  );
}

export default StudyDeskIllustration;

