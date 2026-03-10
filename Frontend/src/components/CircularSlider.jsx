import { useRef } from "react";
import { motion } from "framer-motion";
import { playTickSound, triggerHaptic } from "../utils/feedback";

export default function CircularSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  size = 140,
}) {
  const center = size / 2;
  const radius = 52;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const svgRef = useRef(null);

  const percent = (value - min) / (max - min);
  const angle = percent * 360 - 90;
  const offset = circumference * (1 - percent);

  const polarToCartesian = (angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const handlePointer = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;

    let deg = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;

    const newValue = Math.round(
      (deg / 360) * (max - min) + min
    );

    const clamped = Math.max(min, Math.min(max, newValue));

    if (clamped !== value) {
      playTickSound();
      triggerHaptic("light");
      onChange(clamped);
    }
  };

  const knob = polarToCartesian(angle);

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <span className="text-sm font-medium text-mutedLight dark:text-mutedDark">
        {label}
      </span>

      <svg
        ref={svgRef}
        width={size}
        height={size}
        onMouseDown={(e) => {
          handlePointer(e);
          window.addEventListener("mousemove", handlePointer);
          window.addEventListener("mouseup", () => {
            window.removeEventListener("mousemove", handlePointer);
          }, { once: true });
        }}
        className="cursor-pointer"
      >
        {/* Background */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* Gradient */}
        <defs>
          <linearGradient id="grad">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Knob */}
        <motion.circle
          cx={knob.x}
          cy={knob.y}
          r="8"
          fill="#3b82f6"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />

        {/* Value */}
        <text
          x={center}
          y={center + 6}
          textAnchor="middle"
          className="fill-textLight dark:fill-textDark text-xl font-bold"
        >
          {value}
        </text>
      </svg>

      <span className="text-xs text-mutedLight dark:text-mutedDark">
        {min} – {max}
      </span>
    </div>
  );
}
