"use client"

import type * as React from "react"
import {
  Form as AriaForm,
  TextField as AriaTextField,
  Label as AriaLabel,
  Input as AriaInput,
  FieldError as AriaFieldError,
  TextArea as AriaTextArea,
  composeRenderProps,
} from "react-aria-components"
import { cn } from "@/lib/utils"

// Form Component
export function Form<T extends object>({ className, ...props }: React.ComponentProps<typeof AriaForm<T>>) {
  return <AriaForm className={cn("space-y-4", className)} {...props} />
}

// Label Component
export function Label({ className, ...props }: React.ComponentProps<typeof AriaLabel>) {
  return (
    <AriaLabel
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  )
}

// Input Component
export function Input({ className, ...props }: React.ComponentProps<typeof AriaInput>) {
  return (
    <AriaInput
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

// TextArea Component
export function TextArea({ className, ...props }: React.ComponentProps<typeof AriaTextArea>) {
  return (
    <AriaTextArea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

// TextField Component (combines Label, Input/TextArea, FieldError)
export function TextField({ className, children, ...props }: React.ComponentProps<typeof AriaTextField>) {
  return (
    <AriaTextField className={cn("flex flex-col", className)} {...props}>
      {children}
    </AriaTextField>
  )
}

// FieldError Component
export function FieldError({ className, ...props }: React.ComponentProps<typeof AriaFieldError>) {
  return (
    <AriaFieldError
      className={composeRenderProps(className, (className, renderProps) =>
        cn(
          "text-sm font-medium text-destructive",
          renderProps.isInvalid ? "animate-in fade-in" : "hidden", // Only show when invalid
          className,
        ),
      )}
      {...props}
    />
  )
}
