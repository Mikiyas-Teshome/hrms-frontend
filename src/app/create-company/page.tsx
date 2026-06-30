import { PublicHeader } from '@/components/common/public-header';
import { CompanyDetailsForm } from '@/components/onboarding/create-company/company-details-form';

export default function CreateCompanyPage() {
  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <CompanyDetailsForm />
    </main>
  );
}
