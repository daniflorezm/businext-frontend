import { forwardRef, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const inputVariants = cva(
  "flex w-full rounded-md bg-surface px-3 py-2 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors duration-150 ease-snappy file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default:
          "border border-input focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25",
        error:
          "border border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/25",
        success:
          "border border-success focus-visible:border-success focus-visible:ring-2 focus-visible:ring-success/25",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

type InputVariants = VariantProps<typeof inputVariants>;

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    InputVariants {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ state, className }))}
        ref={ref}
        aria-invalid={state === "error" || undefined}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
