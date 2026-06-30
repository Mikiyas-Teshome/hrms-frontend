"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface VerificationSuccessProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  redirectTo?: string;
}

export function VerificationSuccess({
  title,
  subtitle,
  buttonLabel,
  redirectTo,
}: VerificationSuccessProps = {}) {
  const { t } = useTranslation("verification");
  const router = useRouter();
  const { isAuthenticated, reloadSession } = useAuth();

  const handleProceed = async () => {
    if (isAuthenticated) {
      await reloadSession();
    }

    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
      <div className="flex flex-col items-center justify-center p-4">
          <div
              className="flex flex-col items-start bg-background p-6 gap-8"
              style={{ width: '400px' }}
          >
              <div className="flex flex-col items-start gap-4 self-stretch">
                  <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                      <path
                          d="M29.3334 14.7745V16.0011C29.3318 18.8764 28.4007 21.674 26.6792 23.9769C24.9576 26.2798 22.5378 27.9644 19.7806 28.7797C17.0233 29.5949 14.0764 29.497 11.3794 28.5006C8.68232 27.5041 6.37962 25.6626 4.8147 23.2505C3.24977 20.8385 2.50647 17.9852 2.69565 15.1162C2.88483 12.2472 3.99636 9.51622 5.86445 7.33055C7.73255 5.14488 10.2571 3.62163 13.0617 2.98798C15.8662 2.35433 18.8004 2.64424 21.4268 3.81446M12.0001 14.6676L16.0001 18.6676L29.3334 5.33431"
                          stroke="#22C55E"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                      />
                  </svg>

                  <div className="flex flex-col items-start gap-2 self-stretch">
                      <h1 className="self-stretch text-xl md:text-[32px] text-foreground font-semibold leading-[130%] text-start">
                          {title ?? t('success.title')}
                      </h1>

                      {(subtitle ?? t('success.subtitle')) && (
                          <p className="self-stretch text-base text-muted-foreground font-normal leading-5 text-start">
                              {subtitle ?? t('success.subtitle')}
                          </p>
                      )}
                  </div>
              </div>

              <Button onClick={handleProceed} className="w-full h-9">
                  {buttonLabel ?? t('success.button')}
              </Button>
          </div>
      </div>
  );
}
