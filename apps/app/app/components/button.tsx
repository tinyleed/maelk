import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
  variant?: "default" | "primary";
};

export function Button({ asChild = false, className = "", variant = "default", ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  const classes = ["button", variant === "primary" ? "primary" : "", className]
    .filter(Boolean)
    .join(" ");

  return <Component className={classes} {...props} />;
}
