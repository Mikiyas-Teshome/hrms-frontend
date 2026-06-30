"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar' || i18n.language === 'he';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="min-w-45">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={index}
              disabled={action.disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!action.disabled) {
                  action.onClick?.(e);
                }
              }}
              className={cn(
                "flex items-center cursor-pointer gap-2",
                action.isDanger && "text-destructive"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "w-4 h-4",
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
