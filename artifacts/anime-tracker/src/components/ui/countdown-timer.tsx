import React, { useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";

interface CountdownTimerProps {
  airingAt: number; // Unix timestamp
  className?: string;
  onZero?: () => void;
}

export function CountdownTimer({ airingAt, className = "", onZero }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, airingAt - now);
  });

  useEffect(() => {
    const initialNow = Math.floor(Date.now() / 1000);
    const initialDiff = airingAt - initialNow;
    
    if (initialDiff <= 0) {
      setTimeLeft(0);
      onZero?.();
      return;
    }

    setTimeLeft(initialDiff);

    // Update every second if under an hour, else every minute
    const intervalMs = initialDiff < 3600 ? 1000 : 60000;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = airingAt - now;
      
      if (diff <= 0) {
        setTimeLeft(0);
        onZero?.();
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [airingAt, onZero]);

  if (timeLeft <= 0) {
    return (
      <div className={`flex items-center gap-2 text-destructive font-bold ${className}`}>
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
        </span>
        LIVE
      </div>
    );
  }

  // Format time
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  let displayTime = "";
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    displayTime = `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    displayTime = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    displayTime = `${minutes}m ${seconds}s`;
  } else {
    displayTime = `${seconds}s`;
  }

  return (
    <span className={`font-mono font-medium ${className}`}>
      in {displayTime}
    </span>
  );
}
