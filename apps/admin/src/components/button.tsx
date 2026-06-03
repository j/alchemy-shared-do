import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const baseClasses =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 outline-offset-2 focus-visible:outline-2 focus-visible:outline-action disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-action text-white hover:bg-action-hover active:bg-action-active",
  secondary:
    "border border-line bg-surface text-ink hover:bg-panel active:bg-panel active:border-line-strong",
  danger:
    "bg-danger text-white hover:bg-danger-hover active:bg-danger-hover focus-visible:outline-danger",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${baseClasses} ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
