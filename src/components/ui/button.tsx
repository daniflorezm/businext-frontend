import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 ease-snappy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98]",
        secondary:
          "bg-surface-raised border border-border text-foreground hover:bg-surface hover:border-primary/50 active:scale-[0.98]",
        danger:
          "bg-danger text-danger-foreground hover:bg-danger/90 active:scale-[0.98]",
        ghost:
          "text-foreground-muted hover:bg-surface-raised hover:text-foreground",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-primary to-accent text-white hover:brightness-110 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-caption",
        md: "h-10 rounded-md px-4 text-body-sm",
        lg: "h-12 rounded-lg px-6 text-body",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
