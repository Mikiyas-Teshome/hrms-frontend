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
      city: profileData.city || "Dubai",
      timezone: profileData.timezone || "Asia/Dubai",
      currency: profileData.currency || "AED",
      website: profileData.website || "",
      org_email:  "",
      themeColor: profileData.themeColor || "blue",
    },
  });

  const selectedColor = useWatch({
    control,
    name: "themeColor",
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

      setProfileData(data);

      const profileSaved = companyId && Object.keys(updatePayload).length > 0;

      if (profileSaved) {
        toast({
          title: t("success.title"),
          description: t("success.profileSaved"),
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
            <FormField
              id="city"
              label={t("fields.city")}
              placeholder={t("fields.cityPlaceholder")}
              register={register}
              name="city"
              error={errors.city}
              t={t}
            />

            <TimezoneSelect
              control={control}
              name="timezone"
              label={t("fields.timezone")}
              placeholder={t("fields.timezonePlaceholder")}
              error={errors.timezone}
              t={t}
            />

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
                <FormField
                  id="website"
                  label={`${t("fields.website")} ${t("fields.websiteOptional")}`}
                  placeholder={t("fields.websitePlaceholder")}
                  register={register}
                  name="website"
                  error={errors.website}
                  t={t}
                />

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
      </div>

      <OnboardingFormActions 
        onBack={onBack}
        backLabel={t("actions.back")}
        continueLabel={t("actions.continue")}
        continueLabelShort={t("actions.continueShort")}
        isSubmitting={isSubmitting || (mounted && isLoadingProfile)}
      />
    </form>
  );
}
