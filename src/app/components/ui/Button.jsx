import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-out select-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary:
          "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white border border-white/20 shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5",
        liquid:
          "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white border border-white/30 shadow-[0_8px_20px_-4px_rgba(99,102,241,0.45),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:from-indigo-500 hover:to-purple-500 hover:-translate-y-0.5",
        glass:
          "glass-pill text-indigo-700 dark:text-indigo-300 border border-indigo-300/40 dark:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        danger:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-red-500/20 hover:-translate-y-0.5",
        success:
          "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-green-500/20 hover:-translate-y-0.5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-5 py-2.5 text-base gap-2.5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      loading = false,
      loadingText,
      disabled = false,
      icon: Icon,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current mr-2" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {Icon && <Icon className="w-4 h-4 flex-shrink-0 mr-2" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
