"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tenantRegistrationSchema, type TenantRegistrationFormValues } from "@/features/auth/schemas/tenant-registration-schema";
import { PasswordRequirements } from "./password-requirements";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { PasswordField } from "@/components/ui/PasswordField";
import { FormField } from '@/components/ui/FormField';
import { Building, Scroll, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerTenantSuperAdmin } from "@/features/auth/auth.actions";
import { useState } from "react";

interface TenantSuperAdminRegistrationFormProps {
  invitationToken?: string;
  initialEmail?: string;
  title?: string;
}

export function TenantSuperAdminRegistrationForm({ invitationToken, initialEmail = "someone@example.com", title }: TenantSuperAdminRegistrationFormProps) {
  const { t, i18n } = useTranslation("onboarding");
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TenantRegistrationFormValues>({
    resolver: zodResolver(tenantRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: initialEmail,
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const onSubmit = async (data: TenantRegistrationFormValues) => {
    setServerError(null);
    try {
        const result = await registerTenantSuperAdmin({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            invitationToken: invitationToken || '',
        });

        if (!result.success) {
            setServerError(result.error);
            return;
        }

        router.push('/create-company-success');
    } catch {
        setServerError(t('errorSubmitting'));
    }
  };

  const isRTL = i18n.language === "ar";

  return (
      <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-125 space-y-3">
              <div className="bg-primary py-4 px-6 flex justify-between items-center gap-6 text-white rounded-[12px] space-x-4 rtl:space-x-reverse">
                  <div className="flex items-center gap-3 w-full max-w-50">
                      <div className="bg-background/20 p-2.5 rounded-xl">
                          <Building size={16} className="text-white" />
                      </div>
                      <div className="space-y-0.5">
                          <p className="text-sm font-normal opacity-80 leading-none">
                              {t('organization')}
                          </p>
                          <p className="text-[17px] font-medium leading-tight">Bekur tech</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 w-full max-w-50">
                      <div className="bg-white/20 p-2.5 rounded-xl">
                          <Scroll size={16} className="text-white" />
                      </div>
                      <div className="space-y-0.5">
                          <p className="text-[13px] font-normal opacity-80 leading-none">
                              {t('invitedBy')}
                          </p>
                          <p className="text-[17px] font-medium leading-tight">HRMS admin</p>
                      </div>
                  </div>
              </div>
              <Card className="overflow-hidden border-none shadow-lg rounded-[12px]">
                  <CardContent className="p-6 space-y-3">
                      <div className="space-y-2">
                          <h1 className="text-xl font-semibold text-card-foreground">
                              {title || t('welcomeTitle')}
                          </h1>
                          <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                              {t('welcomeSubtitle')}
                          </p>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                          {serverError && (
                              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
                                  {serverError}
                              </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                              <FormField
                                  id="firstName"
                                  name="firstName"
                                  label={t('firstName')}
                                  register={register}
                                  error={errors.firstName}
                                  placeholder={t('firstNamePlaceholder')}
                                  t={t}
                              />
                              <FormField
                                  id="lastName"
                                  name="lastName"
                                  label={t('lastName')}
                                  register={register}
                                  error={errors.lastName}
                                  placeholder={t('lastNamePlaceholder')}
                                  t={t}
                              />
                          </div>

                          <div className="space-y-3">
                              <Label
                                  htmlFor="email"
                                  className="text-sm font-medium text-foreground"
                              >
                                  {t('businessEmail')}
                              </Label>
                              <div className="relative">
                                  <Input
                                      id="email"
                                      {...register('email')}
                                      readOnly
                                      disabled
                                      className="h-9 border-border rounded-[8px] text-foreground pr-24 rtl:pl-24 rtl:pr-4"
                                  />
                                  <div
                                      className={cn(
                                          'absolute top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 bg-[#EBFAE8] text-[#1EB354] rounded-full text-sm leading-5',
                                          isRTL ? 'left-3' : 'right-3',
                                      )}
                                  >
                                      <Check size={14} strokeWidth={3} />
                                      {t('verified')}
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <PasswordField
                                  id="password"
                                  name="password"
                                  label={t('password')}
                                  register={register}
                                  error={errors.password}
                                  t={t}
                              />
                              <PasswordRequirements password={passwordValue} />
                          </div>

                          <PasswordField
                              id="confirmPassword"
                              name="confirmPassword"
                              label={t('confirmPassword')}
                              register={register}
                              error={errors.confirmPassword}
                              t={t}
                          />

                          <div className="">
                              <Button type="submit" className="w-full h-9" disabled={isSubmitting}>
                                  {isSubmitting ? t('submitting') : t('submit')}
                              </Button>
                          </div>
                      </form>

                      <div className="text-sm font-normal text-foreground leading-relaxed">
                          <p>
                              {t('termsText')}{' '}
                              <Link
                                  href="/terms"
                                  className="text-[#136DEC] font-normal text-sm underline"
                              >
                                  {t('termsLink')}
                              </Link>{' '}
                              {t('privacyText')}{' '}
                              <Link
                                  href="/privacy"
                                  className="text-[#136DEC] font-normal text-sm underline"
                              >
                                  {t('privacyLink')}
                              </Link>
                          </p>
                      </div>
                  </CardContent>
              </Card>

              {/* Language Switcher */}
              <div className="flex justify-end pr-2">
                  <LanguageSwitcher />
              </div>
          </div>
      </div>
  );
}
