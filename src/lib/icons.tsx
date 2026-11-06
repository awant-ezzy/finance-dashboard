import { createElement } from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Wallet,
  Gift,
  TrendingUp,
  Laptop,
  Ellipsis,
  Home,
  Plane,
  Dumbbell,
  Baby,
  PawPrint,
  Zap,
  Droplets,
  Wifi,
  PiggyBank,
  CreditCard,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  film: Film,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  wallet: Wallet,
  gift: Gift,
  "trending-up": TrendingUp,
  laptop: Laptop,
  ellipsis: Ellipsis,
  home: Home,
  plane: Plane,
  dumbbell: Dumbbell,
  baby: Baby,
  "paw-print": PawPrint,
  zap: Zap,
  droplets: Droplets,
  wifi: Wifi,
  "piggy-bank": PiggyBank,
  "credit-card": CreditCard,
};

export const iconChoices = Object.keys(iconMap);

export function getIcon(name?: string | null): LucideIcon {
  if (!name) return Ellipsis;
  return iconMap[name] ?? Ellipsis;
}

/**
 * Wrapper component so we don't create components during render
 * (keeps React Compiler happy). Usage: <Icon name="utensils" className="w-4 h-4" />
 */
export function Icon({
  name,
  ...props
}: { name?: string | null } & LucideProps) {
  return createElement(getIcon(name), props) as React.ReactElement;
}

