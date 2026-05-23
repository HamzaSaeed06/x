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
          <label htmlFor={id} className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[var(--neutral-400)] pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm shadow-sm transition-all placeholder:text-[var(--neutral-400)] focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              icon ? "pl-10" : "pl-3",
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
