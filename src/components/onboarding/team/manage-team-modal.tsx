"use client";

import * as React from "react";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmModal } from "@/components/onboarding/shared/delete-confirm-modal";
import { cn } from "@/lib/utils";
import { Edit2, MinusCircle } from "lucide-react";
import { translateDepartment, translateTeamTitle } from "@/components/onboarding/utils/team-i18n";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: {
    title: string;
    department: string;
    members: TeamMember[];
  };
  onSave: (data: any) => void;
}

export function ManageTeamModal({
  isOpen,
  onClose,
  team,
  onSave,
}: ManageTeamModalProps) {
  const { t, i18n } = useTranslation(["manageTeam", "deleteConfirm"]);
  const isRtl = i18n.language === "ar";
  const displayTeamTitle = translateTeamTitle(t, team.title);

  const [teamDraft, setTeamDraft] = React.useState({
    title: team.title,
    department: team.department,
    members: team.members,
  });

  const [memberToDelete, setMemberToDelete] = React.useState<TeamMember | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const handleMemberRoleChange = (id: string, newRole: string) => {
    setTeamDraft((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === id ? { ...m, role: newRole } : m
      ),
    }));
  };

  const handleRemoveClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      setTeamDraft((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== memberToDelete.id),
      }));
      setMemberToDelete(null);
    }
  };

  const handleSave = () => {
    onSave(teamDraft);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-250 p-0 overflow-hidden rounded-[16px] border border-border shadow-sm">
        <DialogHeader className="px-6 py-6 border-b border-border bg-card sm:text-start rtl:sm:text-end">
          <DialogTitle className="text-[16px] font-bold text-foreground">
            {t("title", { defaultValue: "Manage team" })}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 bg-card">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-foreground rtl:text-end block">
                {t("teamName")}
              </Label>
              <div className="relative">
                <Input
                  value={teamDraft.title}
                  onChange={(e) => setTeamDraft({ ...teamDraft, title: e.target.value })}
                  className={cn(
                    "h-[40px] rounded-lg border-border bg-card text-[14px] font-normal text-foreground shadow-none",
                    isRtl ? "ps-10" : "pe-10"
                  )}
                />
                <Edit2 className={cn(
                    "absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
                  isRtl ? "left-3" : "right-3"
                )} />
              </div>
            </div>
            <div className="space-y-2">
                <Label className="text-[14px] font-medium text-foreground rtl:text-end block">
                {t("department")}
              </Label>
              <Select
                value={teamDraft.department}
                onValueChange={(val) => setTeamDraft({ ...teamDraft, department: val })}
              >
                <SelectTrigger className="h-[40px] rounded-lg border-border bg-card text-[14px] font-normal text-foreground shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">{t("departments.engineering")}</SelectItem>
                  <SelectItem value="Sales">{t("departments.sales")}</SelectItem>
                  <SelectItem value="Marketing">{t("departments.marketing")}</SelectItem>
                  <SelectItem value="Design">{t("departments.design")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-none flex flex-col">
            <div className="overflow-auto custom-scrollbar max-h-55">
              <table className="w-full text-start border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="px-4 py-3 text-start text-[14px] font-medium text-foreground rtl:text-end w-1/4">
                      {t("table.name")}
                    </th>
                    <th className="px-4 py-3 text-start text-[14px] font-medium text-foreground rtl:text-end w-1/3">
                      {t("table.email")}
                    </th>
                    <th className="px-4 py-3 text-start text-[14px] font-medium text-foreground rtl:text-end w-1/5">
                      {t("table.role")}
                    </th>
                    <th className="px-4 py-3 text-start text-[14px] font-medium text-foreground rtl:text-end w-1/5">
                      {t("table.department")}
                    </th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teamDraft.members.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-4 text-[14px] font-normal text-foreground">
                        {member.name}
                      </td>
                      <td className="px-4 py-4 text-[14px] font-normal text-foreground">
                        {member.email}
                      </td>
                      <td className="px-4 py-4">
                        <Select
                          value={member.role}
                          onValueChange={(val) => handleMemberRoleChange(member.id, val)}
                        >
                          <SelectTrigger className="h-9 w-35 rounded-[6px] border-border bg-card text-[14px] font-normal shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Manager">{t("roles.manager")}</SelectItem>
                            <SelectItem value="Member">{t("roles.member")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-4 text-[14px] font-normal text-foreground">
                        {translateDepartment(t, member.department)}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          onClick={() => handleRemoveClick(member)}
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-500/90"
                        >
                          <MinusCircle className="size-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between border-t border-border px-4 py-3 sm:flex-row bg-card overflow-x-auto min-h-14">
              <span className="text-[14px] font-normal text-muted-foreground">
                {t("table.rowsSelected", { count: 0, total: teamDraft.members.length })}
              </span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-foreground">{t("table.rowsPerPage")}</span>
                  <Select defaultValue="10">
                    <SelectTrigger className="h-8 w-17.5 border-border rounded-[6px] text-[14px] font-normal text-foreground shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-medium text-foreground whitespace-nowrap">
                    {t("table.pageCounter", { current: 1, total: 1 })}
                  </span>
                  <Pagination className="w-auto mx-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationFirst className="size-8 rounded-[6px] border-border bg-card opacity-50 cursor-not-allowed shadow-none" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationPrevious className="size-8 rounded-[6px] border-border bg-card opacity-50 cursor-not-allowed shadow-none" text="" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext className="size-8 rounded-[6px] border-border bg-card opacity-50 cursor-not-allowed shadow-none" text="" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLast className="size-8 rounded-[6px] border-border bg-card opacity-50 cursor-not-allowed shadow-none" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-6 bg-card gap-4 sm:justify-between rtl:flex-row-reverse rounded-b-[16px]">
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={t("deleteConfirm:message", { team: displayTeamTitle })}
        isRtl={isRtl}
      />
    </Dialog>
  );
}
