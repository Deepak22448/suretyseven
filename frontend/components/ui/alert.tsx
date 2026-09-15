import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-md px-3.5 py-2.5 text-sm", {
  variants: {
    variant: {
      default: "bg-muted text-foreground",
      destructive: "bg-destructive-bg text-destructive",
      success: "bg-success-bg text-success",
    },
  },
  defaultVariants: { variant: "default" },
});

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("font-semibold", className)} {...props} />,
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("mt-1", className)} {...props} />,
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
