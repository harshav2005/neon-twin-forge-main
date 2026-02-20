import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const animeButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-semibold tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-glow hover:scale-105 active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground hover:shadow-glow-pink hover:scale-105 active:scale-95",
        accent:
          "bg-accent text-accent-foreground hover:shadow-glow-purple hover:scale-105 active:scale-95",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-glow-sm",
        "outline-secondary":
          "border-2 border-secondary bg-transparent text-secondary hover:bg-secondary/10 hover:shadow-glow-pink",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        glass:
          "glass-card text-foreground hover:border-primary/50 hover:shadow-glow-sm",
        neon:
          "relative overflow-hidden bg-gradient-neon text-primary-foreground before:absolute before:inset-0 before:bg-gradient-neon before:opacity-0 before:transition-opacity hover:before:opacity-30 hover:shadow-glow-lg hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm rounded-xl",
        sm: "h-9 px-4 text-xs rounded-lg",
        lg: "h-14 px-8 text-base rounded-2xl",
        xl: "h-16 px-10 text-lg rounded-2xl",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface AnimeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animeButtonVariants> {
  asChild?: boolean;
}

const AnimeButton = React.forwardRef<HTMLButtonElement, AnimeButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(animeButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
AnimeButton.displayName = "AnimeButton";

export { AnimeButton, animeButtonVariants };
