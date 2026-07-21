import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "default" | "strong" | "subtle";
};

export function GlassPanel({ children, className, variant = "default", ...rest }: Props) {
  const util = variant === "strong" ? "glass-strong" : variant === "subtle" ? "glass-subtle" : "glass";
  return (
    <div
      {...rest}
      className={cn(util, "relative overflow-hidden", className)}
      style={{ borderRadius: "var(--radius-panel)", ...rest.style }}
    >
      {children}
    </div>
  );
}

export function GlassCard({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn("glass relative overflow-hidden", className)}
      style={{ borderRadius: "var(--radius-card)", ...rest.style }}
    >
      {children}
    </div>
  );
}
