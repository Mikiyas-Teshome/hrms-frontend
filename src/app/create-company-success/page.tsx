import { CompanySuccess } from '@/components/onboarding/company-success/company-success';
import { PublicHeader } from '@/components/common/public-header';

export default function CreateCompanySuccessPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-1 flex flex-col">
                <CompanySuccess />
            </main>
        </div>
    );
}
