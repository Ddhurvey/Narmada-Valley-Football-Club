"use client";

import React, { HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(baseStyles, glassStyles, hoverStyles, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
