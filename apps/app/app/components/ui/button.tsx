import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-extrabold transition-[background,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--caramel)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cream)] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--line)] bg-[rgba(255,250,241,0.72)] text-[var(--cocoa)] shadow-[0_10px_28px_rgba(53,37,29,0.08)] hover:bg-[var(--cream-strong)]",
        primary:
          "border border-transparent bg-[var(--cocoa)] text-[var(--cream-strong)] shadow-[0_16px_36px_rgba(53,37,29,0.22)] hover:bg-[var(--caramel-dark)]",
        ghost:
          "border border-transparent bg-transparent text-[var(--cocoa-muted)] hover:bg-[rgba(185,120,62,0.12)] hover:text-[var(--cocoa)]",
      },
      size: {
        default: "min-h-11 px-4 py-2",
        sm: "min-h-9 px-3 text-xs",
        lg: "min-h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return <Component className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
