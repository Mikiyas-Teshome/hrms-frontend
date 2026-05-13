import { Building2 } from "lucide-react";
import { CompanyDetailsForm } from '@/components/onboarding/create-company/company-details-form';

export default function CreateCompanyPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Building2 className="size-7 text-gray-900" />
          <span className="text-2xl font-bold tracking-tight text-gray-900">HRMS</span>
        </div>
      </header>

      <CompanyDetailsForm />
    </main>
  );
}
