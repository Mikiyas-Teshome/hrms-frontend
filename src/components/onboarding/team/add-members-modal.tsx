"use client";

import * as React from "react";
import { Search, PlusCircle, MinusCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { translateRole, translateTeamTitle } from "@/components/onboarding/utils/team-i18n";

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  initialAssigned?: Employee[];
  allEmployees: Employee[];
  onSave: (assignedIds: string[]) => void;
}

export function AddMembersModal({
  isOpen,
  onClose,
  teamName,
  initialAssigned = [],
  allEmployees,
  onSave,
}: AddMembersModalProps) {
  const { t, i18n } = useTranslation("addMembers");
  const isRtl = i18n.language === "ar";
  const displayTeamName = translateTeamTitle(t, teamName);

  const [search, setSearch] = React.useState("");
  const [assignedIds, setAssignedIds] = React.useState<string[]>(
    initialAssigned.map((e) => e.id)
  );

  const unassigned = allEmployees.filter(
    (e) => !assignedIds.includes(e.id) && 
    (e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      translateRole(t, e.role).toLowerCase().includes(search.toLowerCase()))
  );

  const assigned = allEmployees.filter((e) => assignedIds.includes(e.id));

  const handleAdd = (id: string) => {
    setAssignedIds((prev) => [...prev, id]);
  };

  const handleRemove = (id: string) => {
    setAssignedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleSave = () => {
    onSave(assignedIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-212.5 p-0 overflow-hidden rounded-[16px] border border-border shadow-sm">
        <DialogHeader className="px-6 py-6 border-b border-border bg-card flex flex-row items-center justify-between sm:text-start rtl:sm:text-end">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-[16px] font-bold text-foreground">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("description")}
            </DialogDescription>
          </div>
          <p className="text-[14px] font-normal text-muted-foreground">
            {t("teamContext", { name: displayTeamName })}
          </p>
        </DialogHeader>

        <div className="p-6 bg-muted/30">
          <div className={cn(
            "flex flex-col items-center gap-4 md:flex-row",
            isRtl && "md:flex-row-reverse"
          )}>
            <div className="flex-1 w-full rounded-[12px] border border-border bg-card overflow-hidden shadow-none h-70 flex flex-col">
              <div className="flex items-center justify-between border-b border-border p-4 gap-4">
                <span className="text-[14px] font-medium text-foreground shrink-0">
                  {t("unassigned", { count: unassigned.length })}
                </span>
                <div className="relative grow max-w-60">
                  <Search className="absolute inset-is-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="h-9 ps-9 text-[12px] bg-card border border-border rounded-lg shadow-none font-normal placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border custom-scrollbar">
                {unassigned.length > 0 ? (
                  unassigned.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="space-y-0.5 text-start rtl:text-end">
                        <p className="text-[14px] font-bold text-foreground">{emp.name}</p>
                        <p className="text-[12px] font-normal text-muted-foreground">{translateRole(t, emp.role)}</p>
                      </div>
                      <Button
                        onClick={() => handleAdd(emp.id)}
                        variant="ghost"
                        size="icon"
                        className="size-8 text-primary hover:text-primary/90 hover:bg-primary/10 rounded-full"
                      >
                        <PlusCircle className="size-5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <p className="text-[14px] font-medium">{t("noEmployees")}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-center p-2 opacity-50 text-muted-foreground">
              {isRtl ? (
                <ArrowLeft className="size-6" />
              ) : (
                <ArrowRight className="size-6" />
              )}
            </div>

            <div className="flex-1 w-full rounded-[12px] border border-border bg-card overflow-hidden shadow-none h-70 flex flex-col">
              <div className="border-b border-border p-4">
                <span className="text-[14px] font-medium text-foreground">
                  {t("assigned", { count: assigned.length })}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border custom-scrollbar">
                {assigned.length > 0 ? (
                  assigned.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-4">
                      <div className="space-y-0.5 text-start rtl:text-end">
                        <p className="text-[14px] font-bold text-foreground">{emp.name}</p>
                        <p className="text-[12px] font-normal text-muted-foreground">{translateRole(t, emp.role)}</p>
                      </div>
                      <Button
                        onClick={() => handleRemove(emp.id)}
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-500/90"
                      >
                        <MinusCircle className="size-5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-20">
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-6 border-t border-border bg-card gap-4 sm:justify-between rtl:flex-row-reverse rounded-b-[16px]">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 px-8 rounded-lg font-medium border-border text-primary hover:bg-muted"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            className="h-10 px-8 rounded-lg font-medium bg-primary text-primary-foreground shadow-none border-none hover:bg-primary/90"
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
