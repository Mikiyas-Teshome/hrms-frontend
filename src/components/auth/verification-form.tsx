"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { verifyOnboarding, resendFreeOnboardingOtp } from "@/features/auth/auth.actions";
import { useToast } from "@/hooks/use-toast";

export function VerificationForm() {
  const { t } = useTranslation("verification");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedEmail = localStorage.getItem("onboarding_email");
    if (storedEmail) {
        setEmail(storedEmail);
    }
  }, []);

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
        try {
            const result = await verifyOnboarding({
                code: otp,
                email: email
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            const response = result.data;

            if (response.status === "COMPLETED") {
                localStorage.removeItem("onboarding_email");
                if (response.companyId) {
                    localStorage.setItem("onboarding_company_id", response.companyId);
                }
                router.push("/verify-success");
            } else if (response.checkoutUrl) {
                localStorage.removeItem("onboarding_email");
                router.push(response.checkoutUrl);
            } else {
                localStorage.removeItem("onboarding_email");
                router.push("/verify-success");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t("errors.verificationFailed"));
        }
    });
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    
    setIsResending(true);
    setError(null);
    try {
        const result = await resendFreeOnboardingOtp({ email });
        if (!result.success) {
            setError(result.error);
            return;
        }
        toast({
            title: t("resendSuccessTitle") || "OTP Resent",
            description: t("resendSuccessDescription") || "A new verification code has been sent to your email.",
        });
    } catch {
        setError(t("errors.resendFailed") || "Failed to resend code");
    } finally {
        setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden border-border bg-background shadow-sm ring-1 ring-border sm:rounded-xl">
        <CardHeader className="space-y-1 pb-8 pt-10 text-center sm:px-8 sm:text-start">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-12 text-foreground sm:px-8 rtl:text-end">
          <div className="space-y-6">
            {error && (
                <div className="p-3 text-sm rounded bg-destructive/10 text-destructive border border-destructive/20">
                    {error}
                </div>
            )}
            <div className="space-y-3">
              <label className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 rtl:text-end block">
                {t("label")}
              </label>
              <div className="flex h-16 w-full items-center justify-center sm:justify-start">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  containerClassName="gap-2"
                >
                  <InputOTPGroup className="gap-2 rtl:flex-row-reverse">
                    <InputOTPSlot index={0} className="sm:size-14" />
                    <InputOTPSlot index={1} className="sm:size-14" />
                    <InputOTPSlot index={2} className="sm:size-14" />
                    <InputOTPSlot index={3} className="sm:size-14" />
                    <InputOTPSlot index={4} className="sm:size-14" />
                    <InputOTPSlot index={5} className="sm:size-14" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground rtl:text-end">
                {t("hint")}
              </p>
            </div>

            <Button 
              onClick={handleVerify} 
              size="lg"
              className="w-full"
              disabled={otp.length !== 6 || isPending}
            >
              {isPending ? t("verifying") : t("submit")}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t("resendPrompt")}{" "}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isResending ? t("resending") || "Resending..." : t("resendLink")}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

  );
}
