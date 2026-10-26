import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };

export function ParliamentIcon(props: Props) {
  return <svg viewBox="0 0 64 54" {...base} {...props}><path d="M3 48h58M5 45V28h18v-5h18v5h18v17M24 23c0-9 3-14 8-17 5 3 8 8 8 17M32 2v7M21 28v17m22-17v17M28 45V34a4 4 0 0 1 8 0v11M10 33v7m6-7v7m32-7v7m6-7v7M5 28l3-8 3 8m42 0 3-8 3 8M27 23v5m5-5v5m5-5v5M3 51h58" /></svg>;
}
export function ArrowIcon(props: Props) { return <svg viewBox="0 0 24 24" {...base} {...props}><path d="M4 12h15m-6-6 6 6-6 6" /></svg>; }
export function PinIcon(props: Props) { return <svg viewBox="0 0 24 24" {...base} {...props}><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2.3" /></svg>; }
export function LookIcon(props: Props) { return <svg viewBox="0 0 24 24" {...base} {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>; }
export function WalkIcon(props: Props) { return <svg viewBox="0 0 24 24" {...base} {...props}><circle cx="14" cy="4" r="2" /><path d="m7 21 4-7m6 7-3-8 1-6-4 2-3 4m7-6 2 5 4 1M11 14l-1-4" /></svg>; }
export function SettingsIcon(props: Props) { return <svg viewBox="0 0 24 24" {...base} {...props}><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2.5" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="2.5" fill="currentColor" stroke="none" /></svg>; }
export function CloseIcon(props: Props) { return <svg viewBox="0 0 24 24" {...base} {...props}><path d="m6 6 12 12M6 18 18 6" /></svg>; }
export function DoorIcon(props: Props) { return <svg viewBox="0 0 24 24" {...base} {...props}><path d="M5 21V3h13v18M3 21h18M9 21V7l9-4M14 13h.01" /></svg>; }
export function CompassIcon(props: Props) { return <svg viewBox="0 0 40 40" {...base} {...props}><circle cx="20" cy="20" r="16" opacity=".5" /><path d="m20 7 5 13-5-2-5 2 5-13Z" fill="currentColor" /><path d="m20 33-5-13 5 2 5-2-5 13Z" opacity=".4" /></svg>; }
export function SunIcon(props: Props) { return <svg viewBox="0 0 24 24" {...base} {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></svg>; }
