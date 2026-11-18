import { memo } from 'react';
import Snowfall from '../study/Snowfall';

/**
 * NightSceneBackground: Immersive panoramic nighttime bedroom/study environment.
 * 
 * Features:
 * - Large floor-to-ceiling window with city skyline view
 * - Falling snow effect in multiple layers
 * - Moon, stars, twinkling lights
 * - Cozy desk with warm lighting
 * - Desk decorations (books, plant, lamp)
 * - Purely decorative (aria-hidden, no interactive content)
 * - Full-screen background for widgets to float over
 */

function NightSceneBackground() {
  return (
    <div className="night-scene-background" aria-hidden="true">
      {/* Main panoramic window view */}
      <svg
        className="night-window-svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          {/* Sky gradient: midnight blue to deeper blue */}
          <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B1630" />
            <stop offset="40%" stopColor="#14264C" />
            <stop offset="70%" stopColor="#1E3562" />
            <stop offset="100%" stopColor="#3A2140" />
          </linearGradient>

          {/* Cityscape lighting haze */}
          <radialGradient id="city-haze" cx="50%" cy="100%" r="65%">
            <stop offset="0%" stopColor="#D6BD91" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#D6BD91" stopOpacity="0" />
          </radialGradient>

          {/* Moon glow */}
          <radialGradient id="moon-halo">
            <stop offset="0%" stopColor="#F5EFE0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F5EFE0" stopOpacity="0" />
          </radialGradient>

          {/* City window pattern */}
          <pattern id="city-windows" width="12" height="16" patternUnits="userSpaceOnUse">
            <rect x="3" y="4" width="3" height="4" rx="0.6" fill="#F2D9A6" opacity="0.75" />
          </pattern>

          {/* Dimmer window pattern */}
          <pattern id="city-windows-dim" width="14" height="18" patternUnits="userSpaceOnUse">
            <rect x="4" y="5" width="3" height="4" rx="0.6" fill="#D6BD91" opacity="0.4" />
          </pattern>
        </defs>

        {/* Night sky background */}
        <rect x="0" y="0" width="1600" height="900" fill="url(#sky-gradient)" />

        {/* City light haze on horizon */}
        <ellipse cx="800" cy="920" rx="1000" ry="120" fill="url(#city-haze)" />

        {/* Moon */}
        <circle cx="1200" cy="150" r="80" fill="url(#moon-halo)" />
        <circle cx="1200" cy="150" r="35" className="night-moon" />
        {/* Moon craters detail */}
        <circle cx="1185" cy="135" r="5" fill="#E3DCCB" opacity="0.4" />
        <circle cx="1210" cy="165" r="3" fill="#E3DCCB" opacity="0.3" />

        {/* Stars (randomly scattered, twinkling) */}
        {[
          { cx: 100, cy: 120, r: 1.5, delay: 0 },
          { cx: 280, cy: 180, r: 1.2, delay: 0.8 },
          { cx: 420, cy: 100, r: 1.4, delay: 1.6 },
          { cx: 580, cy: 160, r: 1, delay: 2.4 },
          { cx: 750, cy: 140, r: 1.3, delay: 3.2 },
          { cx: 920, cy: 190, r: 1.1, delay: 1.2 },
          { cx: 1080, cy: 110, r: 1.5, delay: 2.8 },
          { cx: 1300, cy: 240, r: 1, delay: 0.4 },
          { cx: 1450, cy: 100, r: 1.4, delay: 3.6 },
          { cx: 1550, cy: 180, r: 1.2, delay: 1.5 }
        ].map((star) => (
          <circle
            key={`star-${star.cx}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            className="night-star"
            style={{ animationDelay: `${star.delay}s` }}
          />
        ))}

        {/* Far buildings (dimmer, depth) */}
        {[
          { x: 0, w: 80, h: 200 },
          { x: 90, w: 60, h: 240 },
          { x: 160, w: 90, h: 180 },
          { x: 260, w: 70, h: 220 },
          { x: 340, w: 100, h: 190 },
          { x: 450, w: 75, h: 230 },
          { x: 540, w: 85, h: 200 },
          { x: 640, w: 70, h: 240 },
          { x: 720, w: 90, h: 210 },
          { x: 830, w: 80, h: 200 },
          { x: 920, w: 95, h: 190 },
          { x: 1030, w: 70, h: 220 },
          { x: 1110, w: 85, h: 200 },
          { x: 1210, w: 90, h: 180 },
          { x: 1310, w: 75, h: 230 },
          { x: 1400, w: 85, h: 200 },
          { x: 1500, w: 100, h: 190 }
        ].map((b) => (
          <g key={`far-building-${b.x}`}>
            <rect
              x={b.x}
              y={550 - b.h}
              width={b.w}
              height={b.h}
              className="night-building-far"
            />
            <rect
              x={b.x + 6}
              y={550 - b.h + 8}
              width={Math.max(0, b.w - 12)}
              height={Math.max(0, b.h - 16)}
              fill="url(#city-windows-dim)"
            />
          </g>
        ))}

        {/* Near buildings (brighter, more detail) */}
        {[
          { x: 20, w: 100, h: 160, dim: false },
          { x: 130, w: 85, h: 200, dim: true },
          { x: 225, w: 110, h: 180, dim: false },
          { x: 345, w: 95, h: 220, dim: true },
          { x: 450, w: 120, h: 190, dim: false },
          { x: 580, w: 90, h: 210, dim: true },
          { x: 680, w: 110, h: 200, dim: false },
          { x: 800, w: 100, h: 230, dim: true },
          { x: 910, w: 115, h: 190, dim: false },
          { x: 1035, w: 95, h: 220, dim: true },
          { x: 1140, w: 105, h: 200, dim: false },
          { x: 1260, w: 100, h: 180, dim: true },
          { x: 1370, w: 110, h: 210, dim: false },
          { x: 1490, w: 110, h: 200, dim: true }
        ].map((b) => (
          <g key={`near-building-${b.x}`}>
            <rect
              x={b.x}
              y={550 - b.h}
              width={b.w}
              height={b.h}
              className="night-building-near"
            />
            <rect
              x={b.x + 8}
              y={550 - b.h + 10}
              width={Math.max(0, b.w - 16)}
              height={Math.max(0, b.h - 20)}
              fill={b.dim ? 'url(#city-windows-dim)' : 'url(#city-windows)'}
            />
          </g>
        ))}

        {/* Building antennas */}
        <rect x="380" y="280" width="2.5" height="40" className="night-building-near" />
        <rect x="780" y="310" width="2.5" height="45" className="night-building-near" />
        <rect x="1180" y="290" width="2.5" height="35" className="night-building-near" />

        {/* Gently flickering city lights */}
        {[
          { x: 150, y: 400, delay: 0 },
          { x: 320, y: 380, delay: 2.1 },
          { x: 650, y: 420, delay: 4.2 },
          { x: 900, y: 390, delay: 1.5 },
          { x: 1220, y: 410, delay: 3.3 }
        ].map((light) => (
          <rect
            key={`flicker-${light.x}`}
            x={light.x}
            y={light.y}
            width="4"
            height="5"
            rx="0.8"
            className="night-flicker"
            style={{ animationDelay: `${light.delay}s` }}
          />
        ))}
      </svg>

      {/* Snowfall layer (back - inside window) */}
      <Snowfall layer="back" />

      {/* Desk-side decorations and lighting */}
      <div className="desk-decor-layer">
        {/* Arc lamp on right side */}
        <svg className="desk-lamp" viewBox="0 0 200 280" focusable="false">
          <path
            d="M40 270 Q40 80 140 70"
            fill="none"
            stroke="#A88755"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M100 35 Q130 20 160 35 Q168 60 140 75 Q110 60 100 35 Z"
            fill="#D6BD91"
          />
          <circle cx="140" cy="78" r="10" fill="#F2D9A6" opacity="0.85" />
          <rect x="20" y="270" width="50" height="10" rx="5" fill="#795365" />
        </svg>

        {/* Potted plant on left */}
        <svg className="desk-plant" viewBox="0 0 150 200" focusable="false">
          <g stroke="#3E5C50" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M75 140 C 72 100 55 70 35 55" />
            <path d="M75 140 C 78 100 95 70 115 60" />
            <path d="M75 140 C 75 100 75 65 75 45" />
          </g>
          <path d="M35 55 C 20 48 10 30 14 15 C 30 25 42 45 35 55 Z" fill="#5E7B6A" />
          <path d="M115 60 C 132 52 142 32 138 15 C 122 25 110 45 115 60 Z" fill="#7A9B84" />
          <path d="M75 45 C 65 28 65 10 75 0 C 85 10 85 28 75 45 Z" fill="#7A9B84" />
          <rect x="45" y="135" width="60" height="12" rx="6" fill="#C99CA8" />
          <path d="M52 147 L98 147 L92 180 Q75 187 58 180 Z" fill="#B77D85" />
        </svg>

        {/* Books stack */}
        <svg className="desk-books" viewBox="0 0 200 150" focusable="false">
          <rect x="8" y="110" width="150" height="22" rx="6" fill="#22345C" />
          <rect x="8" y="110" width="12" height="22" rx="6" fill="#31477A" />
          <rect x="22" y="80" width="125" height="22" rx="6" fill="#B77D85" />
          <rect x="22" y="80" width="11" height="22" rx="6" fill="#C99CA8" />
          <rect x="40" y="55" width="90" height="18" rx="6" fill="#A88755" />
          <rect x="40" y="55" width="10" height="18" rx="5" fill="#D6BD91" />
          <rect x="148" y="90" width="35" height="40" rx="10" fill="#D6BD91" />
          <path
            d="M183 98 Q200 104 196 120 Q191 130 183 130"
            fill="none"
            stroke="#D6BD91"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect x="152" y="90" width="8" height="40" rx="4" fill="#F2D9A6" opacity="0.6" />
        </svg>

        {/* Warm lamp glow effect */}
        <div className="lamp-glow" />
      </div>

      {/* Snowfall layer (front - over widgets) */}
      <Snowfall layer="front" />
    </div>
  );
}

export default memo(NightSceneBackground);
