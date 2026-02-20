import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "hover" | "neon" | "subtle";
  glow?: "cyan" | "pink" | "purple" | "none";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = "none", children, ...props }, ref) => {
    const baseClasses = "rounded-2xl backdrop-blur-xl border transition-all duration-300";
    
    const variantClasses = {
      default: "bg-card/40 border-border/50",
      hover: "bg-card/40 border-border/50 hover:border-primary/50 hover:shadow-glow cursor-pointer",
      neon: "bg-card/30 border-primary/30 shadow-glow",
      subtle: "bg-card/20 border-border/30",
    };

    const glowClasses = {
      cyan: "neon-glow-cyan",
      pink: "neon-glow-pink",
      purple: "neon-glow-purple",
      none: "",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          glowClasses[glow],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
