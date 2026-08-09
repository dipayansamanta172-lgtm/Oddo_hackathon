import React from 'react';
import { motion, useTransform } from 'framer-motion';

export default function CursorTracker({ scrollYProgress }) {
  // Cursor coordinate path mappings to simulate clicks inside the dashboard
  // 0.48: hover catalog items -> 0.50: moves towards Canon EOS -> 0.52: clicks add to cart
  // 0.53: moves inside cart drawer -> 0.55: clicks "HOME DELIVERY" -> 0.58: clicks "Confirm Booking"
  // 0.76: moves inside Admin dashboard -> 0.80: moves to Canon EOS Settle Return button -> 0.83: clicks button
  // 0.84: moves inside settlement modal -> 0.86: checks final refund box -> 0.88: clicks settle button
  
  const cursorX = useTransform(
    scrollYProgress,
    [0.45, 0.50, 0.52, 0.54, 0.56, 0.58, 0.76, 0.81, 0.83, 0.85, 0.87, 0.89],
    ['60%', '42%', '45%', '72%', '75%', '75%', '50%', '82%', '84%', '34%', '36%', '65%']
  );

  const cursorY = useTransform(
    scrollYProgress,
    [0.45, 0.50, 0.52, 0.54, 0.56, 0.58, 0.76, 0.81, 0.83, 0.85, 0.87, 0.89],
    ['60%', '30%', '42%', '50%', '45%', '85%', '20%', '20%', '21%', '50%', '58%', '85%']
  );

  // Animate a scale click pulse when a button is selected
  const cursorScale = useTransform(
    scrollYProgress,
    [0.45, 0.51, 0.52, 0.53, 0.54, 0.57, 0.58, 0.59, 0.80, 0.82, 0.83, 0.84, 0.86, 0.87, 0.88, 0.89],
    [1, 1, 0.8, 1, 1, 1, 0.8, 1, 1, 1, 0.8, 1, 1, 0.8, 1, 0.8]
  );

  const cursorOpacity = useTransform(
    scrollYProgress,
    [0.42, 0.45, 0.60, 0.62, 0.74, 0.77, 0.90, 0.92],
    [0, 1, 1, 0, 0, 1, 1, 0]
  );

  return (
    <motion.div
      style={{
        left: cursorX,
        top: cursorY,
        scale: cursorScale,
        opacity: cursorOpacity,
      }}
      className="absolute w-5 h-5 z-40 pointer-events-none -translate-x-1/2 -translate-y-1/2"
    >
      {/* Hand Cursor SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full text-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
      >
        <path d="M7.5 7.5V6a3.5 3.5 0 0 0-7 0v11.5A5.5 5.5 0 0 0 6 23h9a5.5 5.5 0 0 0 5.5-5.5V13a3.5 3.5 0 0 0-7 0v-1.5a2.5 2.5 0 0 0-5 0v-4ZM9 7.5v-1a1.5 1.5 0 0 1 3 0v1h-3Zm5 0v2.5h-1v-2.5a1.5 1.5 0 0 1 3 0v1h-2Z" />
      </svg>
    </motion.div>
  );
}
