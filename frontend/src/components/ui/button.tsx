import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline:
          "border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
        ghost: 
          "hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900",
        link: 
          "text-neutral-900 underline-offset-4 hover:underline p-0 h-auto",
        // E-commerce specific variants
        "hero-cta":
          "bg-white text-neutral-900 px-8 py-3.5 text-sm font-bold tracking-wide hover:bg-neutral-100 shadow-lg hover:shadow-xl transition-all duration-300",
        "add-to-cart":
          "bg-neutral-900 text-white px-6 py-3 font-bold tracking-wide hover:bg-neutral-800 shadow-md hover:shadow-lg",
        "buy-now":
          "bg-neutral-900 text-white px-6 py-3 font-bold tracking-wide hover:bg-neutral-800 shadow-lg hover:shadow-xl",
        "icon-square":
          "w-10 h-10 p-0 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 rounded-lg",
        "icon-circle":
          "w-10 h-10 p-0 rounded-full bg-white shadow-md border border-neutral-100 hover:shadow-lg hover:scale-105",
      },
      size: {
        default: "h-10 px-5 py-2.5 rounded-lg",
        sm: "h-9 px-4 py-2 text-xs rounded-md",
        lg: "h-12 px-8 py-3 text-base rounded-lg",
        xl: "h-14 px-10 py-4 text-base rounded-xl",
        icon: "h-10 w-10 rounded-lg p-0",
        "icon-sm": "h-8 w-8 rounded-md p-0",
        "icon-lg": "h-12 w-12 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
