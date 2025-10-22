"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SwitchProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled, id, className, ...props }, ref) => {
    function toggle(e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) {
      e.preventDefault()
      if (disabled) return
      onCheckedChange?.(!checked)
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
      if (e.key === "Enter" || e.key === " ") {
        toggle(e)
      }
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        id={id}
        onClick={toggle}
        onKeyDown={onKeyDown}
        ref={ref}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-input bg-input transition-[color,box-shadow,transform] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-xs ring-0 transition-transform translate-x-0",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export default Switch