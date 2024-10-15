"use client";
import React from "react";
import { motion } from "framer-motion";

export const LoadingIcon: React.FC = () => {
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const dotVariants = {
    animate: {
      scale: [1, 1.5, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center w-12 h-12"
      variants={containerVariants}
      animate="animate"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-[#19473f] rounded-full mx-1"
          variants={dotVariants}
          animate="animate"
          style={{ animationDelay: `${index * 0.2}s` }}
        />
      ))}
    </motion.div>
  );
};

LoadingIcon.displayName = "LoadingIcon";