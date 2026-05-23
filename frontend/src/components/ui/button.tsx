import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all",
        destructive:
          "bg-red-600 text-white border-2 border-red-800 shadow-[4px_4px_0px_0px_rgba(153,27,27,1)] hover:bg-red-700 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(153,27,27,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(153,27,27,1)] transition-all",
        outline:
          "border-2 border-neutral-900 bg-white text-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all",
        secondary:
          "bg-neutral-100 text-neutral-900 border-2 border-neutral-300 hover:bg-neutral-200 hover:border-neutral-900 transition-all",
        ghost: 
          "hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 border-2 border-transparent hover:border-neutral-200",
        link: 
          "text-neutral-900 underline-offset-4 hover:underline p-0 h-auto border-0 shadow-none",
        // E-commerce specific variants
        "hero-cta":
          "bg-white text-neutral-900 px-8 py-3.5 text-sm font-bold tracking-wide border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300",
        "add-to-cart":
          "bg-neutral-900 text-white px-6 py-3 font-bold tracking-wide border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all",
        "buy-now":
          "bg-neutral-900 text-white px-6 py-3 font-bold tracking-wide border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all",
        "icon-square":
          "w-10 h-10 p-0 bg-white border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-neutral-900 hover:bg-neutral-100 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all",
        "icon-circle":
          "w-10 h-10 p-0 rounded-full bg-white shadow-md border-2 border-neutral-200 hover:border-neutral-900 hover:shadow-lg hover:scale-105 transition-all",
      },
      size: {
        default: "h-10 px-5 py-2.5 rounded-none",
        sm: "h-9 px-4 py-2 text-xs rounded-none",
        lg: "h-12 px-8 py-3 text-base rounded-none",
        xl: "h-14 px-10 py-4 text-base rounded-none",
        icon: "h-10 w-10 rounded-none p-0",
        "icon-sm": "h-8 w-8 rounded-none p-0",
        "icon-lg": "h-12 w-12 rounded-none p-0",
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
