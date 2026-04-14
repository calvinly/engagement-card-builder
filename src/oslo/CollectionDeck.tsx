import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "./cn";

export interface CollectionDeckProps extends HTMLAttributes<HTMLDivElement> {
  cards: ReactNode[];
  dismissThreshold?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}

const TRANSITION_MS = 350;

export const CollectionDeck = forwardRef<HTMLDivElement, CollectionDeckProps>(
  ({ cards, dismissThreshold = 100, activeIndex: controlledIndex, onActiveIndexChange, className, ...props }, ref) => {
    const [internalIndex, setInternalIndex] = useState(0);
    const isControlled = controlledIndex !== undefined;
    const activeIndex = isControlled ? controlledIndex : internalIndex;
    const setActiveIndex = (index: number | ((prev: number) => number)) => {
      const nextIndex = typeof index === "function" ? index(activeIndex) : index;
      if (!isControlled) setInternalIndex(nextIndex);
      onActiveIndexChange?.(nextIndex);
    };
    const total = cards.length;

    // Drag state
    const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
    // "settling" means the card is animating from drag position to its final resting spot
    const [settling, setSettling] = useState<"snap-back" | "send-back" | null>(null);
    const startPos = useRef<{ x: number; y: number } | null>(null);
    const dragging = useRef(false);
    const animating = useRef(false);

    const handlePointerDown = useCallback((e: ReactPointerEvent) => {
      if (animating.current) return;
      startPos.current = { x: e.clientX, y: e.clientY };
      dragging.current = false;
      setDrag({ x: 0, y: 0 });
      setSettling(null);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback((e: ReactPointerEvent) => {
      if (!startPos.current || animating.current) return;
      const dx = e.clientX - startPos.current.x;
      const rawDy = e.clientY - startPos.current.y;
      const dy = Math.min(rawDy, 0);
      dragging.current = true;
      setDrag({ x: dx, y: dy });
    }, []);

    const handlePointerUp = useCallback(() => {
      if (!drag || !startPos.current) {
        startPos.current = null;
        setDrag(null);
        return;
      }

      const distance = Math.sqrt(drag.x * drag.x + drag.y * drag.y);
      startPos.current = null;
      animating.current = true;

      if (distance > dismissThreshold) {
        // Animate the active card to the back position, then advance
        setSettling("send-back");
        setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % total);
          setDrag(null);
          setSettling(null);
          animating.current = false;
        }, TRANSITION_MS);
      } else {
        // Snap back to center
        setSettling("snap-back");
        setDrag({ x: 0, y: 0 });
        setTimeout(() => {
          setDrag(null);
          setSettling(null);
          animating.current = false;
        }, TRANSITION_MS);
      }
    }, [drag, dismissThreshold, total]);

    // Compute the resting position for the card that will go to the back
    // It goes to the "left-behind" position: offset -1 = rotated -8°, shifted left
    const getBackPositionStyle = () => {
      return {
        transform: "translateX(-16px) rotate(-8deg)",
        transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.2, 0, 0, 1)`,
        zIndex: 10,
      };
    };

    const getCardStyle = (index: number) => {
      const offset = ((index - activeIndex) % total + total) % total;
      if (offset === 0) return "z-20 translate-x-0 rotate-0";
      if (offset === total - 1)
        return "z-10 -translate-x-4 -rotate-8";
      if (offset === 1)
        return "z-10 translate-x-4 rotate-8";
      return "z-0 scale-90 opacity-0";
    };

    const getActiveInlineStyle = (): React.CSSProperties | undefined => {
      if (settling === "send-back") {
        return getBackPositionStyle();
      }

      if (settling === "snap-back" && drag) {
        return {
          transform: `translate(0px, 0px) rotate(0deg)`,
          transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.2, 0, 0, 1)`,
        };
      }

      if (!drag) return undefined;

      const rotation = drag.x * 0.08;
      return {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`,
        transition: "none",
      };
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center gap-3 py-3", className)}
        {...props}
      >
        {/* Card stack */}
        <div className="relative w-full h-[425px]">
          {cards.map((card, i) => {
            const isActive = i === activeIndex;

            return (
              <div
                key={i}
                className={cn(
                  "absolute inset-0 flex items-start justify-center",
                  !isActive && `transition-all duration-[${TRANSITION_MS}ms] ease-[--oslo-ease-default]`,
                  isActive && !drag && !settling && `transition-all duration-[${TRANSITION_MS}ms] ease-[--oslo-ease-default]`,
                  getCardStyle(i),
                )}
                style={isActive ? getActiveInlineStyle() : undefined}
                onPointerDown={isActive ? handlePointerDown : undefined}
                onPointerMove={isActive ? handlePointerMove : undefined}
                onPointerUp={isActive ? handlePointerUp : undefined}
                onClick={() => {
                  if (dragging.current || animating.current) return;
                  const offset = ((i - activeIndex) % total + total) % total;
                  if (offset === total - 1 || offset === 1) setActiveIndex(i);
                }}
              >
                <div
                  className={cn(
                    "w-[72%] max-w-[290px] h-full",
                    isActive && "cursor-grab active:cursor-grabbing select-none touch-none",
                  )}
                >
                  {card}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination dots */}
        {total > 1 && (
          <div className="flex gap-2">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (animating.current) return;
                  setActiveIndex(i);
                }}
                className={cn(
                  "size-2 rounded-full transition-colors duration-[--oslo-duration-fast]",
                  i === activeIndex
                    ? "bg-content-base"
                    : "bg-content-muted",
                )}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

CollectionDeck.displayName = "CollectionDeck";
