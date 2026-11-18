import { memo, useMemo } from 'react';
import Snowfall from '../study/Snowfall';

/**
 * PanoramicWindow: Immersive anime-inspired modern bedroom/study at night.
 *
 * Features:
 * - Interior: Modern desk, chair, plants, books, warm desk lamp
 * - Window: Large panoramic frame with subtle curtains
 * - Exterior: Beautiful snowy city skyline with glowing lights
 * - Lighting: Warm amber interior vs. cool midnight-blue exterior
 * - Snowfall: Multi-layer animated particles with depth
 * - Atmosphere: Cozy, immersive, premium
 */

function PanoramicWindow() {
  // Generate procedural star positions for variety
  const stars = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 35,
      size: Math.random() * 1.2 + 0.6,
      duration: Math.random() * 3 + 2.5,
      delay: Math.random() * 2
    }));
  }, []);

  // Generate building skyline for depth (far layer)
  const farBuildings = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: `far-${i}`,
      x: (i * 115) % 1600,
      width: Math.random() * 70 + 55,
      height: Math.random() * 100 + 70,
      opacity: 0.5
    }));
  }, []);

  // Generate building skyline (near layer, more visible)
  const nearBuildings = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `near-${i}`,
      x: (i * 160) % 1600,
      width: Math.random() * 110 + 90,
      height: Math.random() * 140 + 110,
      opacity: 0.8
    }));
  }, []);

  return (
    <div className="panoramic-window-root" aria-hidden="true">
      {/* Background container for layered rendering */}
      <div className="panoramic-background-layers">
        {/* Distant city exterior (behind window) */}
        <svg
          className="panoramic-city-exterior"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <defs>
            {/* Night sky gradient */}
            <linearGradient id="night-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A0F1F" />
              <stop offset="30%" stopColor="#0E1A33" />
              <stop offset="60%" stopColor="#1B2C4F" />
              <stop offset="100%" stopColor="#2D1B3D" />
            </linearGradient>

            {/* City glow */}
            <radialGradient id="city-glow-grad" cx="50%" cy="110%" r="80%">
              <stop offset="0%" stopColor="#D6BD91" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#D6BD91" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#D6BD91" stopOpacity="0" />
            </radialGradient>

            {/* Window pattern */}
            <pattern id="window-bright" width="14" height="16" patternUnits="userSpaceOnUse">
              <rect x="1" y="1" width="5" height="6" rx="0.8" fill="#F2D9A6" opacity="0.9" />
              <rect x="8" y="1" width="5" height="6" rx="0.8" fill="#E8C070" opacity="0.75" />
              <rect x="1" y="9" width="5" height="6" rx="0.8" fill="#D6A855" opacity="0.8" />
              <rect x="8" y="9" width="5" height="6" rx="0.8" fill="#F2D9A6" opacity="0.85" />
            </pattern>

            <pattern id="window-dim" width="16" height="18" patternUnits="userSpaceOnUse">
              <rect x="2" y="2" width="4" height="5" rx="0.6" fill="#D6BD91" opacity="0.4" />
              <rect x="9" y="2" width="4" height="5" rx="0.6" fill="#CBBBA5" opacity="0.3" />
              <rect x="2" y="10" width="4" height="5" rx="0.6" fill="#D6BD91" opacity="0.35" />
              <rect x="9" y="10" width="4" height="5" rx="0.6" fill="#D6BD91" opacity="0.32" />
            </pattern>
          </defs>

          {/* Sky background */}
          <rect width="1600" height="900" fill="url(#night-sky)" />

          {/* City light glow at horizon */}
          <ellipse cx="800" cy="950" rx="1200" ry="220" fill="url(#city-glow-grad)" />

          {/* Moon */}
          <defs>
            <filter id="moon-glow-filter">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="1320" cy="150" r="70" fill="#F5EFE0" opacity="0.3" filter="url(#moon-glow-filter)" />
          <circle cx="1320" cy="150" r="42" className="panoramic-moon" />

          {/* Stars */}
          {stars.map((star) => (
            <circle
              key={star.id}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size}
              className="panoramic-star"
              style={{
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}

          {/* Far building layer (depth) */}
          {farBuildings.map((bldg) => (
            <g key={bldg.id}>
              <rect
                x={bldg.x}
                y={550 - bldg.height}
                width={bldg.width}
                height={bldg.height}
                fill="#0E1A33"
                opacity={bldg.opacity}
              />
              <rect
                x={bldg.x + 2}
                y={550 - bldg.height + 3}
                width={bldg.width - 4}
                height={bldg.height - 6}
                fill="url(#window-dim)"
              />
            </g>
          ))}

          {/* Near building layer (bright) */}
          {nearBuildings.map((bldg) => (
            <g key={bldg.id}>
              <rect
                x={bldg.x}
                y={550 - bldg.height}
                width={bldg.width}
                height={bldg.height}
                fill="#1B2C4F"
                opacity={bldg.opacity}
              />
              <rect
                x={bldg.x + 3}
                y={550 - bldg.height + 4}
                width={bldg.width - 6}
                height={bldg.height - 8}
                fill="url(#window-bright)"
              />
            </g>
          ))}

          {/* Building antenna details */}
          <rect x="480" y="280" width="1.5" height="70" fill="#1B2C4F" opacity="0.6" />
          <rect x="1150" y="260" width="2" height="85" fill="#1B2C4F" opacity="0.6" />
        </svg>

        {/* Snowfall layer (back - inside window) */}
        <Snowfall layer="back" />
      </div>

      {/* Interior room container */}
      <div className="room-interior-container">
        {/* Large panoramic window frame */}
        <div className="window-frame-container">
          {/* Left window frame */}
          <div className="window-frame window-left" />
          {/* Center window divider */}
          <div className="window-divider" />
          {/* Right window frame */}
          <div className="window-frame window-right" />

          {/* Subtle curtains */}
          <div className="curtain curtain-left" />
          <div className="curtain curtain-right" />

          {/* Window shine/gloss */}
          <div className="window-gloss" />
        </div>

        {/* Interior room elements */}
        <div className="room-interior-elements">
          {/* Desk surface */}
          <div className="room-desk" />

          {/* Potted plant (left) */}
          <svg className="room-plant" viewBox="0 0 120 150" focusable="false">
            <g stroke="#3E5C50" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M60 100 C 58 76 46 56 34 46" />
              <path d="M60 100 C 62 74 74 56 88 48" />
              <path d="M60 100 C 60 70 60 52 60 36" />
            </g>
            <path d="M34 46 C 22 42 16 30 18 20 C 30 24 38 34 34 46 Z" fill="#5E7B6A" />
            <path d="M88 48 C 100 44 106 32 104 22 C 92 26 84 36 88 48 Z" fill="#7A9B84" />
            <path d="M60 36 C 52 26 52 14 60 4 C 68 14 68 26 60 36 Z" fill="#7A9B84" />
            <rect x="34" y="98" width="52" height="10" rx="5" fill="#C99CA8" />
            <path d="M40 108 L80 108 L74 135 Q60 141 46 135 Z" fill="#B77D85" />
          </svg>

          {/* Books stack (right) */}
          <svg className="room-books" viewBox="0 0 160 120" focusable="false">
            <rect x="6" y="88" width="122" height="18" rx="5" fill="#22345C" />
            <rect x="6" y="88" width="10" height="18" rx="5" fill="#31477A" />
            <rect x="18" y="68" width="100" height="18" rx="5" fill="#B77D85" />
            <rect x="18" y="68" width="9" height="18" rx="4.5" fill="#C99CA8" />
            <rect x="32" y="52" width="72" height="15" rx="5" fill="#A88755" />
            <rect x="32" y="52" width="8" height="15" rx="4" fill="#D6BD91" />
            <rect x="118" y="74" width="28" height="32" rx="8" fill="#D6BD91" />
            <path d="M146 80 Q160 84 156 96 Q152 104 146 104" fill="none" stroke="#D6BD91" strokeWidth="5" strokeLinecap="round" />
            <rect x="122" y="74" width="6" height="32" rx="3" fill="#F2D9A6" opacity="0.6" />
          </svg>

          {/* Desk lamp (right side) */}
          <svg className="room-lamp" viewBox="0 0 140 200" focusable="false">
            <path d="M28 196 Q28 54 96 48" fill="none" stroke="#A88755" strokeWidth="4" strokeLinecap="round" />
            <path d="M74 24 Q96 12 118 24 Q124 44 96 50 Q68 44 74 24 Z" fill="#D6BD91" />
            <circle cx="96" cy="52" r="7" fill="#F2D9A6" />
            <rect x="16" y="192" width="34" height="7" rx="3.5" fill="#795365" />
          </svg>
        </div>

        {/* Warm interior lighting glow */}
        <div className="room-interior-glow" />
      </div>

      {/* Snowfall layer (front - over room) */}
      <Snowfall layer="front" />
    </div>
  );
}

export default memo(PanoramicWindow);
