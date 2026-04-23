// From upstream design system (deep imports to avoid pulling in all components)
export { cn } from "@oslo/design-system/utils/cn";
export { BottomNav, BottomNavItem } from "@oslo/design-system/components/BottomNav";
export type { BottomNavProps, BottomNavItemProps } from "@oslo/design-system/components/BottomNav";

// Local overrides (customized sizing — remove once upstream defaults are updated)
export { CollectionDeck } from "./CollectionDeck";
export type { CollectionDeckProps } from "./CollectionDeck";
export { FlickerCard } from "./FlickerCard";
export type { FlickerCardProps } from "./FlickerCard";
