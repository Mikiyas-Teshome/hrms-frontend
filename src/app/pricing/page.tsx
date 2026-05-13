import { PublicHeader } from '@/components/common/public-header';
import { PricingPlans } from '@/components/onboarding/pricing/pricing-plans';

export default function PricingPage() {
    return (
        <main className="min-h-screen gap-16">
            <PublicHeader />
            <div className="mt-12">
                <PricingPlans />
            </div>
        </main>
    );
}
