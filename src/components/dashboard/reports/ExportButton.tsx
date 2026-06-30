import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportReport, ExportFormat } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
    data: any[];
    columns: { header: string; key: string; render?: (item: any) => string }[];
    filename: string;
    className?: string;
    onServerExport?: (format: 'csv' | 'pdf' | 'xlsx') => Promise<void>;
    serverExportLabel?: string;
}

export const ExportButton = ({
    data,
    columns,
    filename,
    className,
    onServerExport,
    serverExportLabel = 'Export full report',
}: ExportButtonProps) => {
    const { toast } = useToast();

    const handleExport = async (format: ExportFormat) => {
        try {
            await exportReport({
                data,
                columns,
                filename,
                format,
            });
            toast({
                title: 'Export Successful',
                description: `The report has been exported as ${format.toUpperCase()}.`,
            });
        } catch (error) {
            console.error('Export failed:', error);
            toast({
                variant: 'destructive',
                title: 'Export Failed',
                description: 'An error occurred while generating the report.',
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`h-10 gap-2 border-primary text-primary hover:bg-primary/5 transition-colors ${className}`}
                >
                    <Download className="h-4 w-4" />
                    Export report
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={() => handleExport('csv')}
                    className="cursor-pointer gap-2"
                >
                    <FileJson className="h-4 w-4 text-muted-foreground" />
                    Export page as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleExport('pdf')}
                    className="cursor-pointer gap-2"
                >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Export page as PDF
                </DropdownMenuItem>
                {onServerExport && (
                    <>
                        <DropdownMenuItem
                            onClick={() => onServerExport('csv')}
                            className="cursor-pointer gap-2"
                        >
                            <Download className="h-4 w-4 text-muted-foreground" />
                            {serverExportLabel} (CSV)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onServerExport('xlsx')}
                            className="cursor-pointer gap-2"
                        >
                            <Download className="h-4 w-4 text-muted-foreground" />
                            {serverExportLabel} (Excel)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onServerExport('pdf')}
                            className="cursor-pointer gap-2"
                        >
                            <Download className="h-4 w-4 text-muted-foreground" />
                            {serverExportLabel} (PDF)
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
