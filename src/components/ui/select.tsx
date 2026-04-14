import { forwardRef, type SelectHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const selectVariants = cva(
  "flex w-full appearance-none rounded-md bg-surface px-3 py-2 pr-10 text-body-sm text-foreground transition-colors duration-150 ease-snappy focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default:
          "border border-input focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25",
        error:
          "border border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/25",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

type SelectVariants = VariantProps<typeof selectVariants>;

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    SelectVariants {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, state, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(selectVariants({ state, className }))}
          ref={ref}
          aria-invalid={state === "error" || undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
      </div>
    );
  }
);

Select.displayName = "Select";
