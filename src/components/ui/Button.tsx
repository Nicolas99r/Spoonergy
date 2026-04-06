import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "outline" | "ghost" | "pill";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", onMouseEnter, onMouseLeave, ...props }, ref) => {
    
    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-800 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-zinc-50 text-zinc-900 shadow hover:bg-zinc-50/90": variant === "default",
            "border border-zinc-800 bg-transparent shadow-sm hover:bg-zinc-800 hover:text-zinc-50": variant === "outline",
            "hover:bg-zinc-800 hover:text-zinc-50": variant === "ghost",
            "rounded-full bg-zinc-50 text-zinc-900 shadow px-8 py-3 text-lg hover:bg-zinc-200": variant === "pill",
            "h-9 px-4 py-2": size === "default" && variant !== "pill",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.5 }}
        onMouseEnter={(e) => {
            if (variant === "pill") {
                const event = new CustomEvent('cta-hover', { detail: { isHovered: true } });
                window.dispatchEvent(event);
            }
            if (onMouseEnter) onMouseEnter(e as any);
        }}
        onMouseLeave={(e) => {
            if (variant === "pill") {
                const event = new CustomEvent('cta-hover', { detail: { isHovered: false } });
                window.dispatchEvent(event);
            }
            if (onMouseLeave) onMouseLeave(e as any);
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
