"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/FormField";
import { organizationProfileSchema, type OrganizationProfileValues } from "@/components/onboarding/schemas/organization-profile";
import { FormSection } from "@/components/onboarding/shared/form-section";
import { UploadBox } from "@/components/onboarding/shared/upload-box";
import { cn } from "@/lib/utils";
import { useBrandColor } from "@/components/providers/brand-color-provider";
import { ORGANIZATION_THEME_COLORS, type ThemeColorId } from "@/constants/colors";
import { OnboardingFormActions } from "@/components/onboarding/shared/onboarding-form-actions";
import { useProfile, useUpdateTenantProfile } from "@/features/auth/hooks/useAuth";
import type { UpdateCompanyInput } from "@/features/auth/auth.types";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/components/onboarding/context/OnboardingContext";
import { TimezoneSelect } from "@/components/ui/TimezoneSelect";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import {useUpdateCompanySmtp } from "@/features/company/hooks/useCompany";
import { getUserFacingErrorMessage } from "@/lib/parse-api-error";
import { uploadLogo } from "@/features/documents/documents.actions";
import { normalizeWebsiteUrl } from "@/features/settings/settings.utils";

interface OrganizationProfileFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

export function OrganizationProfileForm({ onNext, onBack }: OrganizationProfileFormProps) {
  const { t } = useTranslation("organizationProfile");

  const { updateBrandColor } = useBrandColor();
  const { toast } = useToast();

  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const companyId = profile?.companyId ?? "";
  const updateTenantMutation = useUpdateTenantProfile();
  const updateCompanySmtpMutation = useUpdateCompanySmtp();

  const { setProfileData, profileData } = useOnboarding();
  const [mounted, setMounted] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoCleared, setLogoCleared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<OrganizationProfileValues>({
    resolver: zodResolver(organizationProfileSchema) as any,
    defaultValues: {
      city: profileData.city || "",
      timezone: profileData.timezone || "",
      currency: profileData.currency || "",
      website: profileData.website || "",
      org_email:  "",
      themeColor: profileData.themeColor || "blue",
      smtpHost: profileData.smtpHost || "",
      smtpPort: profileData.smtpPort || "",
      smtpEmail: profileData.smtpEmail || "",
      smtpUsername: profileData.smtpUsername || "",
      smtpPassword: profileData.smtpPassword || "",
      smtpSecure: profileData.smtpSecure ?? false,
    },
  });

  const selectedColor = useWatch({
    control,
    name: "themeColor",
  });

  const smtpSecureValue = useWatch({
    control,
    name: "smtpSecure",
  });

  useEffect(() => {
    if (selectedColor) {
      updateBrandColor(selectedColor as ThemeColorId);
    }
  }, [selectedColor, updateBrandColor]);

  const themeColors = ORGANIZATION_THEME_COLORS.map(color => ({
    ...color,
    label: t(`fields.colors.${color.id}`)
  }));

  const onSubmit = async (data: OrganizationProfileValues) => {
    setIsSubmitting(true);
    try {
      let resolvedLogoUrl: string | null | undefined;

      if (logoCleared) {
        resolvedLogoUrl = null;
      } else if (pendingLogoFile) {
        const body = new FormData();
        body.append("file", pendingLogoFile);
        const uploadResult = await uploadLogo(body);
        if (uploadResult.error || !uploadResult.url) {
          throw new Error(uploadResult.error ?? t("errors.logoUploadFailed", "Logo upload failed"));
        }
        resolvedLogoUrl = uploadResult.url;
      }

      const updatePayload: UpdateCompanyInput = {
        ...(data.city && { city: data.city }),
        ...(data.website?.trim() && { website: normalizeWebsiteUrl(data.website) }),
        ...(data.themeColor && { themeColor: data.themeColor }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.currency && { currency: data.currency }),
        ...(resolvedLogoUrl !== undefined && { logoUrl: resolvedLogoUrl }),
      };

      if (companyId && Object.keys(updatePayload).length > 0) {
        await updateTenantMutation.mutateAsync({
          id: companyId,
          input: updatePayload,
        });
      }

      const hasSmtpConfig =
        Boolean(data.smtpHost?.trim()) &&
        Boolean(data.smtpPort) &&
        Boolean(data.smtpEmail?.trim());

      if (companyId && hasSmtpConfig) {
        await updateCompanySmtpMutation.mutateAsync({
          id: companyId,
          input: {
            host: data.smtpHost!.trim(),
            port: Number(data.smtpPort),
            fromEmail: data.smtpEmail!.trim(),
            username: data.smtpUsername?.trim() || data.smtpEmail!.trim(),
            password: data.smtpPassword ?? "",
            secure: data.smtpSecure === true,
          },
        });
      }

      setProfileData(data);

      const profileSaved = companyId && Object.keys(updatePayload).length > 0;
      const smtpSaved = companyId && hasSmtpConfig;

      if (profileSaved || smtpSaved) {
        toast({
          title: t("success.title"),
          description: t(
            profileSaved && smtpSaved
              ? "success.profileAndSmtpSaved"
              : smtpSaved
                ? "success.smtpSaved"
                : "success.profileSaved",
          ),
        });
      }

      setPendingLogoFile(null);
      setLogoCleared(false);

      if (onNext) {
        onNext();
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: t("errors.failedToUpdate"),
        description: getUserFacingErrorMessage(
          error,
          t("errors.checkYourConnection"),
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-4xl space-y-12">
      <div className="space-y-2.5">
        <FormSection title={t("sections.locationAndTime")}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {/* City */}
            <FormField
              id="city"
              label={t("fields.city")}
              placeholder={t("fields.cityPlaceholder")}
              register={register}
              name="city"
              error={errors.city}
              t={t}
            />

            {/* Time zone */}
            <TimezoneSelect
              control={control}
              name="timezone"
              label={t("fields.timezone")}
              placeholder={t("fields.timezonePlaceholder")}
              error={errors.timezone}
              t={t}
            />

            {/* Currency */}
            <CurrencySelect
              control={control}
              name="currency"
              label={t("fields.currency")}
              placeholder={t("fields.currencyPlaceholder")}
              error={errors.currency}
              t={t}
            />
          </div>
        </FormSection>

        <FormSection title={t("sections.companyBranding")}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground rtl:text-end block">{t("fields.logo")}</Label>
                <UploadBox
                  deferUpload
                  onFileSelect={(file) => {
                    setPendingLogoFile(file);
                    setLogoCleared(false);
                  }}
                  onClear={() => {
                    setPendingLogoFile(null);
                    setLogoCleared(true);
                  }}
                  onUploadError={(err) =>
                    toast({
                      variant: "destructive",
                      title: t("errors.logoUploadFailed", "Logo upload failed"),
                      description: err,
                    })
                  }
                />
              </div>

              <div className="space-y-6">
                {/* Website */}
                <FormField
                  id="website"
                  label={`${t("fields.website")} ${t("fields.websiteOptional")}`}
                  placeholder={t("fields.websitePlaceholder")}
                  register={register}
                  name="website"
                  error={errors.website}
                  t={t}
                />

                {/* Email */}
                <FormField
                  id="org_email"
                  label={`${t("fields.email")} ${t("fields.emailOptional")}`}
                  placeholder={t("fields.emailPlaceholder")}
                  register={register}
                  name="org_email"
                  error={errors.org_email}
                  t={t}
                />
              </div>
            </div>

            {/* Theme Color */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground block">
                {t("fields.themeColor")}
              </Label>
              <div className="flex flex-wrap gap-4 rtl:flex-row-reverse">
                {themeColors.map((color) => {
                  const isSelected = selectedColor === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setValue("themeColor", color.id, { shouldValidate: true })}
                      className="flex flex-col items-center gap-1.5 group outline-none"
                    >
                      <div
                        className={cn(
                          "w-[111.67px] h-10.75 rounded-[9px] flex items-center justify-center transition-all p-px",
                          isSelected ? "border-2" : "border-2 border-transparent"
                        )}
                        style={isSelected ? { borderColor: color.value } : undefined}
                      >
                        <div
                          className="w-full h-full rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-white/10"
                          style={{ backgroundColor: color.value }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-[12px] leading-5 transition-colors",
                          isSelected ? "text-foreground font-semibold" : "text-muted-foreground font-normal"
                        )}
                      >
                        {color.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.themeColor && (
                <p className="text-xs text-destructive rtl:text-end">{t(`errors.${errors.themeColor.message}`)}</p>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title={t("sections.smtpConfiguration", "Email (SMTP) configuration")}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {/* Server address */}
            <FormField
              id="smtpHost"
              label={t("fields.smtpHost", "Server address")}
              placeholder="smtp.example.com"
              register={register}
              name="smtpHost"
              error={errors.smtpHost}
              t={t}
            />

            {/* Server port */}
            <FormField
              id="smtpPort"
              label={t("fields.smtpPort", "Server port")}
              placeholder="587"
              register={register}
              name="smtpPort"
              error={errors.smtpPort}
              t={t}
            />

            {/* E-mail account */}
            <FormField
              id="smtpEmail"
              label={t("fields.smtpEmail", "E-mail account")}
              placeholder="Someone@gmail.com"
              register={register}
              name="smtpEmail"
              error={errors.smtpEmail}
              t={t}
            />

            {/* User name (Optional) */}
            <FormField
              id="smtpUsername"
              label={t("fields.smtpUsername", "User name (Optional)")}
              placeholder="user@example.com"
              register={register}
              name="smtpUsername"
              error={errors.smtpUsername}
              t={t}
            />

            {/* Password */}
            <FormField
              id="smtpPassword"
              label={t("fields.smtpPassword", "Password")}
              placeholder="************"
              type="password"
              register={register}
              name="smtpPassword"
              error={errors.smtpPassword}
              t={t}
            />

            {/* Encryption */}
            <div className="space-y-3">
              <Label className="text-sm font-medium leading-5 text-foreground block">
                {t("fields.encryption", "Encryption")}
              </Label>
              <div className="flex items-center gap-6 mt-2 h-9">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={smtpSecureValue === true}
                    onChange={() => setValue("smtpSecure", true)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>SSL/TLS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={smtpSecureValue === false}
                    onChange={() => setValue("smtpSecure", false)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>STARTTLS</span>
                </label>
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      {/* Action Buttons */}
      <OnboardingFormActions 
        onBack={onBack}
        backLabel={t("actions.back")}
        continueLabel={t("actions.continue")}
        isSubmitting={isSubmitting || (mounted && isLoadingProfile)}
      />
    </form>
  );
}
