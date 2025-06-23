"use client"

import type * as React from "react"
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  composeRenderProps,
} from "react-aria-components"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Re-export MenuTrigger for convenience
export { AriaMenuTrigger as MenuTrigger }

// Menu Component
export function Menu<T extends object>({ className, ...props }: React.ComponentProps<typeof AriaMenu<T>>) {
  return (
    <AriaPopover
      placement="bottom start"
      className={cn(
        "w-full max-w-[--trigger-width] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        "data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[entering]:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
        className,
      )}
    >
      <AriaMenu className="p-1 outline-none" {...props} />
    </AriaPopover>
  )
}

// MenuItem Component
export function MenuItem<T extends object>({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AriaMenuItem<T>>) {
  return (
    <AriaMenuItem
      className={composeRenderProps(className, (className) =>
        cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className,
        ),
      )}
      {...props}
    >
      {composeRenderProps(children, (children) => (
        <>
          {children}
          {props.href && ( // Add a visual indicator for links
            <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </>
      ))}
    </AriaMenuItem>
  )
}
