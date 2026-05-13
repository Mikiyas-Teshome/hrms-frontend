import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
    return (
        <Card className="overflow-hidden rounded-2xl border-none shadow-none ring-1 ring-border p-0 gap-0">
            <CardHeader className="px-6 py-6 bg-muted/50 rounded-t-2xl border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">{children}</CardContent>
        </Card>
    );
}
