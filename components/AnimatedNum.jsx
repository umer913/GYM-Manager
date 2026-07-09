"use client";
import { useState, useEffect } from "react";

// Counts up from 0 to `target` with a short animation
export default function AnimatedNum({ target, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(current);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}
