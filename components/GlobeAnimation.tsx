type City = {
  id: "sin" | "par" | "tko" | "lon";
  name: string;
  flag: string;
  x: number;
  y: number;
  labelW: number;
  labelDx: number;
  labelDy: number;
  pulseDelay: string;
};

const VIEW_W = 520;
const VIEW_H = 440;
const CX = 260;
const CY = 220;
const R = 200;
const ZOOM = 1.18;

const cities: City[] = [
  { id: "sin", name: "Singapore", flag: "🇸🇬", x: 295, y: 380, labelW: 102, labelDx: 14, labelDy: -14, pulseDelay: "0s" },
  { id: "par", name: "Paris", flag: "🇫🇷", x: 210, y: 155, labelW: 70, labelDx: 14, labelDy: -28, pulseDelay: "0.65s" },
  { id: "tko", name: "Tokyo", flag: "🇯🇵", x: 400, y: 190, labelW: 70, labelDx: -86, labelDy: -28, pulseDelay: "1.3s" },
  { id: "lon", name: "London", flag: "🇬🇧", x: 155, y: 100, labelW: 80, labelDx: -94, labelDy: -2, pulseDelay: "1.95s" },
];

const legs = [
  { id: "leg1", d: "M 295,380 Q 175,290 210,155" },
  { id: "leg2", d: "M 210,155 Q 310,55 400,190" },
  { id: "leg3", d: "M 400,190 Q 280,10 155,100" },
  { id: "leg4", d: "M 155,100 Q 470,230 295,380" },
];

const camTranslate = (c: City) =>
  `${(CX - ZOOM * c.x).toFixed(2)} ${(CY - ZOOM * c.y).toFixed(2)}`;

const T_SIN = camTranslate(cities[0]);
const T_PAR = camTranslate(cities[1]);
const T_TKO = camTranslate(cities[2]);
const T_LON = camTranslate(cities[3]);
const T_DEF = "0 0";

const camTranslateValues = [
  T_SIN, T_SIN, T_DEF, T_DEF,
  T_PAR, T_PAR, T_DEF, T_DEF,
  T_TKO, T_TKO, T_DEF, T_DEF,
  T_LON, T_LON, T_DEF, T_DEF,
  T_SIN,
].join("; ");

const camScaleValues = [
  ZOOM, ZOOM, 1, 1,
  ZOOM, ZOOM, 1, 1,
  ZOOM, ZOOM, 1, 1,
  ZOOM, ZOOM, 1, 1,
  ZOOM,
].join("; ");

const camKeyTimes =
  "0; 0.0833; 0.1111; 0.2222; 0.25; 0.3333; 0.3611; 0.4722; 0.5; 0.5833; 0.6111; 0.7222; 0.75; 0.8333; 0.8611; 0.9722; 1";

const FLAT = "0 0 1 1";
const EASE = "0.42 0 0.58 1";
const camKeySplines = [
  FLAT, EASE, FLAT, EASE,
  FLAT, EASE, FLAT, EASE,
  FLAT, EASE, FLAT, EASE,
  FLAT, EASE, FLAT, EASE,
].join("; ");

export default function GlobeAnimation() {
  return (
    <div
      className="mx-auto w-full max-w-[680px]"
      role="img"
      aria-label="Animated globe with a plane flying between Singapore, Paris, Tokyo, and London"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="globe-grad" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#2a5a9c" />
            <stop offset="55%" stopColor="#0e2a5c" />
            <stop offset="100%" stopColor="#02091c" />
          </radialGradient>
          <radialGradient id="globe-shine" cx="32%" cy="28%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter
            id="globe-glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter
            id="trail-glow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter
            id="plane-shadow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
          <clipPath id="globe-clip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>

        <g transform={`translate(${T_SIN}) scale(${ZOOM})`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={camTranslateValues}
            keyTimes={camKeyTimes}
            keySplines={camKeySplines}
            calcMode="spline"
            dur="18s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="scale"
            values={camScaleValues}
            keyTimes={camKeyTimes}
            keySplines={camKeySplines}
            calcMode="spline"
            dur="18s"
            repeatCount="indefinite"
            additive="sum"
          />

          <circle
            cx={CX}
            cy={CY}
            r={R + 10}
            fill="#3a6cd6"
            opacity="0.28"
            filter="url(#globe-glow)"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R + 4}
            fill="#f5b04a"
            opacity="0.06"
            filter="url(#globe-glow)"
          />

          <circle cx={CX} cy={CY} r={R} fill="url(#globe-grad)" />

          <g
            clipPath="url(#globe-clip)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.8"
            fill="none"
          >
            <ellipse cx={CX} cy={CY} rx={R} ry="48" />
            <ellipse cx={CX} cy={CY} rx={R} ry="100" />
            <ellipse cx={CX} cy={CY} rx={R} ry="150" />
            <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} />

            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="-100 0"
                dur="32s"
                repeatCount="indefinite"
              />
              {[0, 100, 200, 300, 400, 500, 600].map((offset) => {
                const x = CX - R - 50 + offset;
                return (
                  <line
                    key={offset}
                    x1={x}
                    y1={CY - R - 20}
                    x2={x}
                    y2={CY + R + 20}
                  />
                );
              })}
            </g>
          </g>

          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="url(#globe-shine)"
            pointerEvents="none"
          />

          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.5"
          />

          <g filter="url(#trail-glow)">
            {legs.map((leg, i) => {
              const next = legs[(i + 1) % legs.length];
              return (
                <path
                  key={leg.id}
                  d={leg.d}
                  fill="none"
                  stroke="#f5b04a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="2.5 3"
                  strokeDashoffset="100"
                  opacity="0"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="100"
                    to="0"
                    dur="3s"
                    begin={`${leg.id}-motion.begin`}
                    fill="freeze"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 1; 1"
                    keyTimes="0; 0.18; 1"
                    dur="3s"
                    begin={`${leg.id}-motion.begin`}
                    fill="freeze"
                  />
                  <animate
                    attributeName="opacity"
                    from="1"
                    to="0"
                    dur="0.8s"
                    begin={`${next.id}-motion.begin`}
                    fill="freeze"
                  />
                </path>
              );
            })}
          </g>

          {cities.map((c) => (
            <g key={`pulse-${c.id}`}>
              <circle
                cx={c.x}
                cy={c.y}
                r="6"
                fill="none"
                stroke="#f5b04a"
                strokeWidth="1.6"
                opacity="0"
              >
                <animate
                  attributeName="r"
                  values="6; 24"
                  dur="2.6s"
                  begin={c.pulseDelay}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.7; 0"
                  dur="2.6s"
                  begin={c.pulseDelay}
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={c.x}
                cy={c.y}
                r="6"
                fill="none"
                stroke="#f5b04a"
                strokeWidth="1.4"
                opacity="0"
              >
                <animate
                  attributeName="r"
                  values="6; 24"
                  dur="2.6s"
                  begin={`${parseFloat(c.pulseDelay) + 1.3}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5; 0"
                  dur="2.6s"
                  begin={`${parseFloat(c.pulseDelay) + 1.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={c.x}
                cy={c.y}
                r="7"
                fill="white"
                stroke="#0a1f44"
                strokeWidth="2"
              />
              <circle cx={c.x} cy={c.y} r="2.8" fill="#f5b04a" />
            </g>
          ))}

          <g transform={`translate(${cities[0].x} ${cities[0].y})`}>
            <line
              x1="-9"
              y1="-2.5"
              x2="-22"
              y2="-2.5"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0; 0.5; 0.5; 0"
                keyTimes="0; 0.15; 0.85; 1"
                dur="3s"
                begin="leg1-motion.begin; leg2-motion.begin; leg3-motion.begin; leg4-motion.begin"
                fill="freeze"
              />
            </line>
            <line
              x1="-9"
              y1="2.5"
              x2="-22"
              y2="2.5"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0; 0.5; 0.5; 0"
                keyTimes="0; 0.15; 0.85; 1"
                dur="3s"
                begin="leg1-motion.begin; leg2-motion.begin; leg3-motion.begin; leg4-motion.begin"
                fill="freeze"
              />
            </line>
            <line
              x1="-2"
              y1="0"
              x2="-15"
              y2="0"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0; 0.65; 0.65; 0"
                keyTimes="0; 0.15; 0.85; 1"
                dur="3s"
                begin="leg1-motion.begin; leg2-motion.begin; leg3-motion.begin; leg4-motion.begin"
                fill="freeze"
              />
            </line>
            <path
              d="M 14,0 L -8,-7 L -2,0 L -8,7 Z"
              fill="#0a0a0a"
              stroke="white"
              strokeWidth="0.6"
              strokeLinejoin="round"
              filter="url(#plane-shadow)"
            />
            <path
              d="M 14,0 L -8,-7 L -2,0 L -8,7 Z"
              fill="#0a0a0a"
              stroke="rgba(245,176,74,0.6)"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
            <animateMotion
              id="leg1-motion"
              dur="3s"
              rotate="auto"
              path={legs[0].d}
              begin="1.5s; leg4-motion.end+1.5s"
              fill="freeze"
              calcMode="spline"
              keyPoints="0; 1"
              keyTimes="0; 1"
              keySplines="0.4 0 0.4 1"
            />
            <animateMotion
              id="leg2-motion"
              dur="3s"
              rotate="auto"
              path={legs[1].d}
              begin="leg1-motion.end+1.5s"
              fill="freeze"
              calcMode="spline"
              keyPoints="0; 1"
              keyTimes="0; 1"
              keySplines="0.4 0 0.4 1"
            />
            <animateMotion
              id="leg3-motion"
              dur="3s"
              rotate="auto"
              path={legs[2].d}
              begin="leg2-motion.end+1.5s"
              fill="freeze"
              calcMode="spline"
              keyPoints="0; 1"
              keyTimes="0; 1"
              keySplines="0.4 0 0.4 1"
            />
            <animateMotion
              id="leg4-motion"
              dur="3s"
              rotate="auto"
              path={legs[3].d}
              begin="leg3-motion.end+1.5s"
              fill="freeze"
              calcMode="spline"
              keyPoints="0; 1"
              keyTimes="0; 1"
              keySplines="0.4 0 0.4 1"
            />
          </g>

          {cities.map((c) => {
            const lx = c.x + c.labelDx;
            const ly = c.y + c.labelDy;
            return (
              <g
                key={`label-${c.id}`}
                transform={`translate(${lx} ${ly})`}
                style={{ pointerEvents: "none" }}
              >
                <rect
                  x="0"
                  y="0"
                  width={c.labelW}
                  height="22"
                  rx="11"
                  fill="white"
                  stroke="rgba(10,31,68,0.08)"
                  strokeWidth="0.8"
                />
                <text
                  x="11"
                  y="15"
                  fontSize="11.5"
                  fontWeight="500"
                  fill="#0a1f44"
                  fontFamily="system-ui, -apple-system, 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif"
                >
                  {c.flag} {c.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
