/**
 * Explicit icon map — replaces `import * as Icons from "lucide-react"`.
 *
 * Wildcard imports pull the entire lucide library (~1500 icons, ~80-120 KB gzipped)
 * into the bundle and break tree-shaking.  This map only includes the exact icons
 * referenced by data-driven components (site.ts solutions & industries).
 */
import {
  Monitor,
  Hand,
  Projector,
  Wifi,
  Cable,
  GraduationCap,
  Building2,
  Briefcase,
  Landmark,
  HeartPulse,
  Video,
} from "lucide-react";
import type { ElementType } from "react";

const iconMap: Record<string, ElementType> = {
  Monitor,
  Hand,
  Projector,
  Wifi,
  Cable,
  GraduationCap,
  Building2,
  Briefcase,
  Landmark,
  HeartPulse,
  Video,
};

/** Resolve a Lucide icon name (string) to the component.  Falls back to Monitor. */
export function resolveIcon(name: string): ElementType {
  return iconMap[name] ?? Monitor;
}
