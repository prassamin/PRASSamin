"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@heroui/react";

interface CountDownProps extends React.HTMLAttributes<HTMLDivElement> {
  targetDate: Date;
}

const CountDown: React.FC<CountDownProps> = ({
  targetDate,
  className,
  ...props
}) => {
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate.getTime() - now;

    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("text-xl font-bold text-center", className)} {...props}>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
};

export default CountDown;
