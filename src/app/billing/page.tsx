import { PublicHeader } from '@/components/common/public-header';
import { BillingForm } from '@/components/onboarding/billing/billing-form';

export default function BillingPage() {
    return (
        <main className="min-h-screen bg-background">
            <PublicHeader showLanguage={true} />
            <div className="mt-12">
                <BillingForm />
            </div>
        </main>
    );
}
