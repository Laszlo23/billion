import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border border-white/20 bg-[linear-gradient(140deg,#ff7a18,#ff3d00)] text-primary-foreground shadow-[0_14px_26px_-14px_rgba(255,122,24,0.55),0_8px_18px_-14px_rgba(255,61,0,0.5)] hover:-translate-y-0.5 hover:scale-[1.03]",
        premium:
          "relative border border-white/20 bg-[linear-gradient(140deg,#ff7a18,#ff3d00)] text-primary-foreground shadow-[0_14px_28px_-14px_rgba(255,122,24,0.58),0_10px_20px_-14px_rgba(255,61,0,0.52)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:ring-1 before:ring-white/14 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_18px_34px_-14px_rgba(255,122,24,0.7),0_12px_22px_-14px_rgba(255,61,0,0.6)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-cyan-300/35 bg-slate-900/60 text-slate-100 shadow-[0_10px_20px_-16px_rgba(2,6,14,0.72)] hover:-translate-y-0.5 hover:scale-[1.03] hover:border-cyan-300/60 hover:bg-slate-900/85 hover:text-slate-50",
        secondary:
          "border border-slate-500/45 bg-slate-800/70 text-secondary-foreground hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-slate-800/85",
        success:
          "border border-emerald-300/35 bg-[linear-gradient(140deg,rgba(16,185,129,0.95),rgba(5,150,105,0.9))] text-white shadow-[0_14px_28px_-14px_rgba(16,185,129,0.72)] hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_18px_32px_-12px_rgba(16,185,129,0.86)]",
        ghost:
          "text-slate-200 hover:bg-slate-800/65 hover:text-slate-100 dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        hero: "h-12 w-full rounded-xl px-6 text-base font-semibold md:h-11 md:w-auto md:text-sm",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
