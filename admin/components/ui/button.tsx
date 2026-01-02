import { cn } from "@/lib/utils"
import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border-transparent",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
            outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-slate-100/50 hover:text-slate-900",
            link: "text-primary underline-offset-4 hover:underline",
        }
        const sizes = {
            default: "h-12 px-6 py-3 text-[15px]", // Taller and slightly larger text
            sm: "h-10 rounded-xl px-4 text-xs",
            lg: "h-14 rounded-2xl px-8 text-lg",
            icon: "h-12 w-12",
        }
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96]", // Added active scale animation
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

