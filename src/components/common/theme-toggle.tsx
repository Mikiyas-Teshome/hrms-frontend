"use client";

import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/use-is-client";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <Sun className="h-4 w-4 text-muted-foreground opacity-0" />
        <div className="h-6 w-11 bg-muted animate-pulse rounded-full" />
        <Moon className="h-4 w-4 text-muted-foreground opacity-0" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch
        checked={resolvedTheme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}