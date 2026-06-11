import type { HTMLAttributes } from "react";
import type { VariantProps } from "./badge-variants";

const variantClass: Record<string, string> = {
  blue: "b-blue",
  violet: "b-violet",
  teal: "b-teal",
  green: "b-green",
  amber: "b-amber",
  red: "b-red",
  gray: "b-gray",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: VariantProps;
}

export function Badge({
  variant = "gray",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={`badge ${variantClass[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}

export type { VariantProps as BadgeVariant };
