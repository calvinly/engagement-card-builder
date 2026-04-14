import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

export interface BottomNavProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export interface BottomNavItemProps
  extends HTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: ReactNode;
}

export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-end",
          "px-4 pb-[var(--safe-area-bottom,env(safe-area-inset-bottom,8px))] pt-2",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "flex items-center justify-around gap-4 w-full max-w-[400px]",
            "bg-bg-base rounded-full p-2",
            "shadow-[0px_2px_8px_0px_rgba(5,55,130,0.04),0px_4px_4px_0px_rgba(5,55,130,0.04),0px_4px_20px_0px_rgba(5,55,130,0.08)]",
          )}
        >
          {children}
        </div>
      </nav>
    );
  },
);

BottomNav.displayName = "BottomNav";

export const BottomNavItem = forwardRef<HTMLButtonElement, BottomNavItemProps>(
  ({ icon, label, active = false, badge, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 min-w-[64px] w-[72px] px-2 py-1 rounded-full",
          "transition-colors duration-[--oslo-duration-fast]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
          active
            ? "bg-bg-muted text-content-base"
            : "text-content-muted hover:text-content-base",
          className,
        )}
        {...props}
      >
        <div className="relative [&>svg]:size-5">
          {icon}
          {badge && (
            <span className="absolute -top-1 -right-1">{badge}</span>
          )}
        </div>
        <span
          className={cn(
            "text-[12px] leading-[16px]",
            active ? "font-medium" : "font-normal",
          )}
        >
          {label}
        </span>
      </button>
    );
  },
);

BottomNavItem.displayName = "BottomNavItem";
