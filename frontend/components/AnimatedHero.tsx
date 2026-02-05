"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  children,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax effect on scroll
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrolled = window.scrollY;
      heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background */}
      <div
        ref={heroRef}
        className="absolute inset-0"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : "linear-gradient(135deg, #1a1f71 0%, #0a0e27 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      >
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Animated particles */}
      {/* Content - ALWAYS VISIBLE */}
      <div className="absolute inset-0 flex items-center" style={{ zIndex: 10 }}>
        <div className="container-custom w-full">
          <div className="max-w-4xl">
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 font-display"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                color: '#ffffff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                position: 'relative',
                zIndex: 11
              }}
            >
              {title}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-2xl"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                color: '#e5e7eb',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                position: 'relative',
                zIndex: 11
              }}
            >
              {subtitle}
            </motion.p>
            {children && (
              <motion.div 
                className="flex gap-4 flex-wrap"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative', zIndex: 11 }}
              >
                {children}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        style={{ zIndex: 10 }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-2">
          <motion.div
            className="w-1 h-3 bg-white rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedHero;
