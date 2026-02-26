import { cn } from "@/lib/utils";

type SurfaceProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "celebrate";
};

export function PremiumSurface({ children, className, variant = "default" }: SurfaceProps) {
  const variantClass =
    variant === "success"
      ? "premium-card-success"
      : variant === "celebrate"
        ? "premium-card-celebrate premium-card-success"
        : "";
  return (
    <div
      className={cn(
        "premium-card p-5 transition-all duration-300 hover:-translate-y-0.5 md:p-6",
        variantClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PremiumSoftSurface({ children, className, variant = "default" }: SurfaceProps) {
  const variantClass =
    variant === "success"
      ? "premium-card-success"
      : variant === "celebrate"
        ? "premium-card-celebrate premium-card-success"
        : "";
  return (
    <div
      className={cn(
        "premium-soft p-5 transition-all duration-300 hover:-translate-y-0.5 md:p-6",
        variantClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

type PremiumChipProps = {
  children: React.ReactNode;
  className?: string;
};

export function PremiumChip({ children, className }: PremiumChipProps) {
  return <span className={cn("premium-chip", className)}>{children}</span>;
}
