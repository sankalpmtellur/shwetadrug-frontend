import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-surface-strong text-primary hover:bg-surface-strong/80",
    ghost: "bg-transparent text-muted hover:bg-surface-soft",
    danger: "bg-error text-white hover:bg-error/90",
  };

  return (
    <button
      className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font700 font-semibold transition focus-ring disabled:cursor-not-allowed disabled:opacity-60", variants[variant], className)}
      {...props}
    />
  );
}
