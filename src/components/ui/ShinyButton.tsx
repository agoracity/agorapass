"use client";

import { motion, type AnimationProps } from "framer-motion";

import { cn } from "@/lib/utils";

const animationProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 10,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as AnimationProps;

interface ShinyButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface ShinyButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ShinyButton = ({ children, className, onClick, disabled }: ShinyButtonProps) => {
  return (
    <motion.button
      {...animationProps}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-[box-shadow] duration-300 ease-in-out hover:shadow",
        "bg-green-500 hover:bg-green-600 text-white",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className="relative block h-full w-full text-sm uppercase tracking-wide"
        style={{
          maskImage:
            "linear-gradient(-75deg, rgba(255,255,255,0.8) calc(var(--x) + 20%), transparent calc(var(--x) + 30%), rgba(255,255,255,0.8) calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          maskComposite: "exclude",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,rgba(255,255,255,0.1)_calc(var(--x)+20%),rgba(255,255,255,0.3)_calc(var(--x)+25%),rgba(255,255,255,0.1)_calc(var(--x)+100%))] p-px"
      ></span>
    </motion.button>
  );
};

export default ShinyButton;
