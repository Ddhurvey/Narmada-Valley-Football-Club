"use client";

import React, { HTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  className, 
  hover = false, 
  glass = false, 
  children, 
  ...props 
}) => {
  const baseStyles = "rounded-lg overflow-hidden";
  const hoverStyles = hover ? "card-hover cursor-pointer" : "";
  const glassStyles = glass ? "glass" : "bg-white shadow-md";

  return (
    <motion.div
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : undefined}
      className={cn(baseStyles, glassStyles, hoverStyles, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
