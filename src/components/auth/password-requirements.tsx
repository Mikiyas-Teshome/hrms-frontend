"use client";

import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequirementProps {
  label: string;
  met: boolean;
}

const Requirement = ({ label, met }: RequirementProps) => (
    <div className="flex items-center gap-2 text-xs font-normal">
        <div
            className={cn(
                'flex size-4 items-center justify-center rounded-[4px] border transition-colors',
                met ? 'border-primary bg-primary text-primary-foreground' : 'border border-border',
            )}
        >
            {met && <Check className="size-3" />}
        </div>
        <span className={cn(met ? 'text-primary' : 'text-foreground/80')}>{label}</span>
    </div>
);

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { t } = useTranslation("onboarding");

  const requirements = [
      {
          label: t('reqChars'),
          met: password.length >= 6,
      },
      {
          label: t('reqUppercase'),
          met: /[A-Z]/.test(password),
      },
      {
          label: t('reqLowercase'),
          met: /[a-z]/.test(password),
      },
      {
          label: t('reqSpecial'),
          met: /[0-9!@#$%^&*(),.?":{}|<> ]/.test(password),
      },
  ];

  return (
      <div className="space-y-3 pt-1">
          <p className="text-sm leading-5 font-normal text-muted-foreground">
              {t('passwordRequirements')}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {requirements.map((req, index) => (
                  <Requirement key={index} label={req.label} met={req.met} />
              ))}
          </div>
      </div>
  );
}
