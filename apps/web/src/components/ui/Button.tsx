/**
 * Button — hub02-crm reference component
 * --------------------------------------
 * Proves the token system end-to-end. Consumes CSS variables defined in
 * `src/styles/tokens.css`. No external deps; uses React 19 `ref` as prop.
 *
 * Variants: primary | secondary | ghost | danger
 * Sizes:    sm (24px) | md (28px, default) | lg (32px)
 *
 * Keyboard / a11y:
 *  - Native <button>: Space / Enter activate by default.
 *  - Focus ring via :focus-visible from globals.css.
 *  - When `loading`, button is `aria-busy` and `disabled`.
 *  - Destructive variant pairs color with label (never icon-only without aria-label).
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-[6px] " +
  "font-medium select-none whitespace-nowrap " +
  "transition-[background,border-color,color,box-shadow,transform] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "active:translate-y-[0.5px]";

const sizes: Record<Size, string> = {
  sm: "h-6 px-2 text-[12px] rounded-[var(--radius-sm)]",
  md: "h-7 px-3 text-[13px] rounded-[var(--radius-md)]",
  lg: "h-8 px-4 text-[14px] rounded-[var(--radius-md)]",
};

// Variants use CSS vars directly via arbitrary values so they always
// follow the live theme (dark/light) without a JS theme switcher.
const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-accent-fg)] " +
    "hover:bg-[var(--color-accent-hover)] " +
    "shadow-[0_1px_0_oklch(0%_0_0/0.2)_inset]",
  secondary:
    "bg-[var(--color-surface-2)] text-[var(--color-fg)] " +
    "border border-[var(--color-border)] " +
    "hover:bg-[color-mix(in_oklch,var(--color-surface-2)_80%,var(--color-fg)_8%)] " +
    "hover:border-[var(--color-border-strong)]",
  ghost:
    "bg-transparent text-[var(--color-fg-muted)] " +
    "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-danger-fg)] " +
    "hover:brightness-110",
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    leadingIcon,
    trailingIcon,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cx(base, sizes[size], variants[variant], className)}
      style={{ transitionDuration: "var(--duration-fast)", transitionTimingFunction: "var(--ease-out)" }}
      {...rest}
    >
      {loading ? (
        <Spinner />
      ) : (
        leadingIcon && <span aria-hidden className="-ml-0.5 inline-flex">{leadingIcon}</span>
      )}
      <span>{children}</span>
      {trailingIcon && !loading && (
        <span aria-hidden className="-mr-0.5 inline-flex">{trailingIcon}</span>
      )}
    </button>
  );
});

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin"
      style={{ animationDuration: "650ms" }}
    />
  );
}

export default Button;
