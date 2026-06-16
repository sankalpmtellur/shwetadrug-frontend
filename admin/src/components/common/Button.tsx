import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "border border-border bg-white text-navy hover:bg-surface-soft",
  ghost: "text-muted hover:bg-surface-soft hover:text-navy",
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-primary/15",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
