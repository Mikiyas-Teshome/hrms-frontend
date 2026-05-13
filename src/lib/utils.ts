import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fieldClass = "h-9 w-full min-w-0 rounded-[8px] border border-border bg-card px-4 py-0 text-base transition-all outline-none placeholder:text-muted-foreground focus-visible:border-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10 md:text-sm";

