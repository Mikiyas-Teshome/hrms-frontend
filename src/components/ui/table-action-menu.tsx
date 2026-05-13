"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface TableAction {
  label: string;
  icon?: React.ElementType;
  onClick?: (e: React.MouseEvent) => void;
  isDanger?: boolean;
  disabled?: boolean;
}

export interface TableActionMenuProps {
  actions: TableAction[];
}

export function TableActionMenu({ actions }: TableActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-50.25 p-3 rounded-md border border-border shadow-sm flex flex-col gap-1.5 bg-popover text-popover-foreground">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={index}
              variant={action.isDanger ? "destructive" : "default"}
              onClick={(e) => {
                if (!action.disabled) {
                  action.onClick?.(e);
                }
              }}
              disabled={action.disabled}
              className={cn(
                "h-10 px-2 text-[16px] font-medium cursor-pointer rounded-md",
                action.isDanger ? "text-destructive" : "text-popover-foreground"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 rtl:ml-3",
                    action.isDanger ? "text-current" : "text-muted-foreground"
                  )}
                />
              )}
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
