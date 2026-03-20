/* eslint-disable react-refresh/only-export-components */
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Gradient primary — the flagship CTA button
        default:
          "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm shadow-primary/30 hover:shadow-md hover:shadow-primary/40 hover:brightness-110 hover:-translate-y-0.5",
        // Outlined with hover glow
        outline:
          "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/40 hover:-translate-y-0.5",
        // Subtle filled secondary
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70 hover:-translate-y-0.5",
        // Ghost hover with accent
        ghost:
          "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        // Destructive with glow
        destructive:
          "bg-gradient-to-br from-destructive to-destructive/80 text-white shadow-sm shadow-destructive/30 hover:shadow-md hover:shadow-destructive/40 hover:brightness-110 hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-4",
        xs:      "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm:      "h-8 gap-1 rounded-md px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg:      "h-11 gap-2 px-5 text-base rounded-xl",
        icon:    "size-9 rounded-lg",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11 rounded-xl",
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
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
