import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {icon && <span className="inline-flex text-neutral-500 scale-90">{icon}</span>}
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={id}
            type={type}
            className={cn(
              "flex h-11 w-full rounded-none border-2 border-neutral-900 bg-white px-3 py-2 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-neutral-400 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-3",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
