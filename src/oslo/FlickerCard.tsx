import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";
import { X } from "lucide-react";

export interface FlickerCardProps extends HTMLAttributes<HTMLDivElement> {
  image?: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  title?: string;
  subtitle?: string;
  badge?: ReactNode;
  cta?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  footerLabel?: string;
  footerDescription?: string;
  footerIcon?: ReactNode;
  footerAction?: ReactNode;
}

export const FlickerCard = forwardRef<HTMLDivElement, FlickerCardProps>(
  (
    {
      image,
      imageClassName: imgClass,
      imageStyle,
      title,
      subtitle,
      badge,
      cta,
      onAction,
      onDismiss,
      footerLabel,
      footerDescription,
      footerIcon,
      footerAction,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col rounded-3xl overflow-hidden",
          "h-full w-full shadow-[0px_8px_32px_rgba(0,0,0,0.35)]",
          className,
        )}
        {...props}
      >
        {/* Background image */}
        {image && (
          <img
            src={image}
            alt=""
            className={cn("absolute inset-0 w-full h-full object-cover", !imageStyle && (imgClass || "object-center"))}
            style={imageStyle}
          />
        )}

        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative flex flex-col flex-1 z-10 p-4">
          {/* Header: title + dismiss */}
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {title && (
                <h3
                  className="font-heading font-black text-[40px] leading-[40px] tracking-[var(--oslo-tracking-tighter)] text-white whitespace-pre-line"
                  style={{ fontSize: 'calc(40px * var(--ec-title-scale, 1))', lineHeight: 'calc(40px * var(--ec-title-scale, 1))' }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className="font-body text-[16px] leading-[24px] text-white/90 mt-1"
                  style={{ fontSize: 'calc(16px * var(--ec-subtitle-scale, 1))', lineHeight: 'calc(24px * var(--ec-subtitle-scale, 1))' }}
                >
                  {subtitle}
                </p>
              )}
              {badge}
            </div>
            {onDismiss && (
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                className="size-8 flex items-center justify-center shrink-0"
                aria-label="Dismiss"
              >
                <X size={16} className="text-white/80" />
              </button>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-end justify-between gap-3">
            {/* Left: icon + label or bottom label */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {footerIcon && (
                <div className="shrink-0 size-10 rounded-full overflow-hidden">
                  {footerIcon}
                </div>
              )}
              {(footerLabel || footerDescription) && (
                <div className="min-w-0">
                  {footerLabel && (
                    <span className="block font-body text-xs leading-4 text-white/80 whitespace-pre-line">
                      {footerLabel}
                    </span>
                  )}
                  {footerDescription && (
                    <span className="block font-body text-base leading-[var(--oslo-leading-md)] text-white/80 truncate">
                      {footerDescription}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: CTA button or custom action */}
            {cta && (
              <button
                onClick={(e) => { e.stopPropagation(); onAction?.(); }}
                className="px-4 py-2 min-h-10 rounded-full bg-white/70 backdrop-blur-[8px] font-label font-medium text-black shrink-0 flex items-center"
                style={{
                  fontSize: 'calc(0.875rem * var(--ec-cta-scale, 1))',
                  lineHeight: 'calc(1.25rem * var(--ec-cta-scale, 1))',
                }}
              >
                {cta}
              </button>
            )}
            {footerAction}
          </div>
        </div>

        {children}
      </div>
    );
  },
);

FlickerCard.displayName = "FlickerCard";
