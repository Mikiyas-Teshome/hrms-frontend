'use client';

import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Download,
    Info,
    UploadCloud,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    FileSpreadsheet,
    ArrowRight,
    CornerDownRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { useImportAttendanceRecord } from '@/features/attendance/hooks/useAttendance';
import { AttendanceStatus } from '@/features/attendance/attendance.types';
import {
    generateAttendanceTemplate,
    parseAttendanceExcel,
    ParsedAttendanceRow,
} from '@/lib/attendance-excel-template-generator';
import {
    fetchAllPaginatedAttendance,
    buildAttendanceRecordIndex,
} from '@/lib/fetch-all-paginated-attendance';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ImportAttendanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    startDate?: string;
    endDate?: string;
}

type ImportPhase = 'SELECT' | 'PREVIEW' | 'IMPORTING' | 'SUMMARY';

const ImportAttendanceModal: React.FC<ImportAttendanceModalProps> = ({
    open,
    onOpenChange,
    startDate,
    endDate,
}) => {
    const { t } = useTranslation('dashboard');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: employeesData, isLoading: employeesLoading } = useEmployees();
    const updateMutation = useImportAttendanceRecord();

    const [phase, setPhase] = useState<ImportPhase>('SELECT');
    const [, setFileName] = useState('');
    const [parsedRows, setParsedRows] = useState<ParsedAttendanceRow[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState<{
        success: string[];
        failed: { name: string; error: string }[];
    }>({ success: [], failed: [] });
    const [isDragging, setIsDragging] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const employees = (employeesData || []).filter((e) => e.userId && e.email);

    const getTemplateMetadata = async () => {
        const filter =
            startDate || endDate
                ? { startDate, endDate }
                : undefined;

        const records = await fetchAllPaginatedAttendance(filter);
        const index = buildAttendanceRecordIndex(records);

        return {
            employees: employees.map((e) => ({
                label: `${e.firstName} ${e.lastName}`,
                email: e.email,
                userId: e.userId!,
            })),
            statuses: Object.values(AttendanceStatus).map((value) => ({
                label: value,
                value,
            })),
            recordIndex: index,
            startDate,
            endDate,
        };
    };

    const handleDownloadTemplate = async () => {
        setIsDownloadingTemplate(true);
        try {
            const metadata = await getTemplateMetadata();
            const blob = await generateAttendanceTemplate(metadata);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `Bekur_Attendance_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast({
                title: t('attendance.importDownloadSuccess', 'Template Downloaded'),
                description: t(
                    'attendance.importDownloadSuccessDesc',
                    'Template includes active employees and attendance statuses.',
                ),
                variant: 'success',
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Something went wrong.';
            toast({
                title: t('attendance.importDownloadError', 'Failed to generate template'),
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsDownloadingTemplate(false);
        }
    };

    const processFile = async (file: File) => {
        setFileName(file.name);
        try {
            const metadata = await getTemplateMetadata();
            const rows = await parseAttendanceExcel(file, metadata);
            if (rows.length === 0) {
                toast({
                    title: t('attendance.importEmptyFile', 'Empty Template'),
                    description: t(
                        'attendance.importEmptyFileDesc',
                        'No valid data rows found in the uploaded file.',
                    ),
                    variant: 'destructive',
                });
                return;
            }
            setParsedRows(rows);
            setPhase('PREVIEW');
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to read the Excel file. Please use the original template.';
            toast({
                title: t('attendance.importParseError', 'Parsing Failed'),
                description: message,
                variant: 'destructive',
            });
            setFileName('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            processFile(file);
        } else {
            toast({
                title: t('attendance.importInvalidFile', 'Invalid File'),
                description: t(
                    'attendance.importInvalidFileDesc',
                    'Please upload a valid Excel spreadsheet (.xlsx or .xls).',
                ),
                variant: 'destructive',
            });
        }
    };

    const handleChooseFile = () => fileInputRef.current?.click();

    const handleImport = async () => {
        const validRows = parsedRows.filter((r) => r.isValid && r.recordId && r.status);
        if (validRows.length === 0) return;

        setPhase('IMPORTING');
        setProgress({ current: 0, total: validRows.length });

        const successList: string[] = [];
        const failedList: { name: string; error: string }[] = [];

        for (let i = 0; i < validRows.length; i++) {
            const row = validRows[i];
            setProgress({ current: i + 1, total: validRows.length });

            try {
                await updateMutation.mutateAsync({
                    recordId: row.recordId!,
                    status: row.status!,
                    clockIn: row.clockIn,
                    clockOut: row.clockOut,
                    remarks: row.remarks,
                });
                successList.push(`${row.employeeEmail} (${row.dateKey})`);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Update failed.';
                failedList.push({
                    name: `${row.employeeEmail} (${row.dateKey})`,
                    error: message,
                });
            }
        }

        await queryClient.invalidateQueries({ queryKey: ['attendance'] });
        setResults({ success: successList, failed: failedList });
        setPhase('SUMMARY');
    };

    const resetModal = () => {
        setPhase('SELECT');
        setFileName('');
        setParsedRows([]);
        setProgress({ current: 0, total: 0 });
        setResults({ success: [], failed: [] });
    };

    const handleCloseChange = (openVal: boolean) => {
        if (!openVal) resetModal();
        onOpenChange(openVal);
    };

    const validCount = parsedRows.filter((r) => r.isValid).length;
    const invalidCount = parsedRows.length - validCount;

    return (
        <Dialog open={open} onOpenChange={handleCloseChange}>
            <DialogContent
                className={cn(
                    'p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl transition-all duration-300 [&>button]:hidden',
                    phase === 'PREVIEW' ? 'max-w-4xl' : 'max-w-145',
                )}
            >
                <DialogHeader className="bg-muted/40 h-14 px-6 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <DialogTitle className="text-base font-bold text-foreground">
                            {t('attendance.importTitle', 'Import Attendance Data')}
                        </DialogTitle>
                    </div>
                    {phase === 'SELECT' && (
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isDownloadingTemplate || employeesLoading}
                            onClick={handleDownloadTemplate}
                            className="h-9 px-4 text-xs bg-primary/10 hover:bg-primary/20 text-primary font-bold flex items-center gap-2 border-none rounded-xl transition-all"
                        >
                            {isDownloadingTemplate ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            {t('attendance.downloadTemplate', 'Download Template')}
                        </Button>
                    )}
                </DialogHeader>

                {phase === 'SELECT' && (
                    <div className="p-6 space-y-6">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleChooseFile}
                            className={cn(
                                'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200',
                                isDragging
                                    ? 'border-primary bg-primary/5 scale-[0.99]'
                                    : 'border-border hover:border-primary/60 hover:bg-muted/30',
                            )}
                        >
                            <div className="p-4 bg-primary/5 rounded-2xl text-primary mb-4">
                                <UploadCloud className="h-8 w-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1">
                                {t('attendance.importDragTitle', 'Drag and drop your spreadsheet here')}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                {t('attendance.importDragSubtitle', 'Supports .xlsx and .xls file formats')}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 px-6 font-semibold rounded-xl text-xs hover:bg-muted transition-all"
                            >
                                {t('attendance.chooseFile', 'Choose File')}
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".xlsx,.xls"
                            />
                        </div>

                        <div className="flex gap-3.5 p-4 bg-primary/5 border border-primary/10 rounded-2xl text-foreground/80 items-start">
                            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-foreground">
                                    {t('attendance.importInstructionsTitle', 'Import Instructions')}
                                </h4>
                                <p className="text-xs leading-[1.4] text-muted-foreground">
                                    {t(
                                        'attendance.importInstructionsDesc',
                                        'Use the template to update existing attendance records for the selected date range. Rows without a matching record will be skipped.',
                                    )}
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-row justify-end gap-3 border-t pt-5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleCloseChange(false)}
                                className="h-10 px-5 border-border text-foreground/80 hover:text-foreground font-semibold rounded-xl"
                            >
                                {t('attendance.cancel', 'Cancel')}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {phase === 'PREVIEW' && (
                    <div className="p-6 space-y-6 flex flex-col max-h-[75vh]">
                        <div className="grid grid-cols-3 gap-4 shrink-0">
                            <div className="p-3 bg-muted/40 rounded-xl border border-border flex flex-col">
                                <span className="text-xs text-muted-foreground">
                                    {t('attendance.importTotalRows', 'Total Entries')}
                                </span>
                                <span className="text-xl font-extrabold text-foreground">{parsedRows.length}</span>
                            </div>
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex flex-col">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                    {t('attendance.importValidRows', 'Ready for Import')}
                                </span>
                                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {validCount}
                                </span>
                            </div>
                            <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 flex flex-col">
                                <span className="text-xs text-rose-600 dark:text-rose-400">
                                    {t('attendance.importInvalidRows', 'Contains Errors')}
                                </span>
                                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                                    {invalidCount}
                                </span>
                            </div>
                        </div>

                        {invalidCount > 0 && (
                            <div className="flex gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl items-start shrink-0">
                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-600 dark:text-amber-400 leading-[1.4]">
                                    {t(
                                        'attendance.importWarningDesc',
                                        'Some rows contain errors. You can import valid rows only; invalid entries will be skipped.',
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto border border-border rounded-xl min-h-62.5 max-h-87.5">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
                                    <tr>
                                        <th className="p-3 text-xs font-bold text-muted-foreground w-12 text-center">#</th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground w-20">
                                            {t('attendance.status', 'Status')}
                                        </th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground">
                                            {t('attendance.employee', 'Employee')}
                                        </th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground">
                                            {t('attendance.date', 'Date')}
                                        </th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground">
                                            {t('attendance.importValidation', 'Validation')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {parsedRows.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className={cn('hover:bg-muted/20', !row.isValid && 'bg-rose-500/2')}
                                        >
                                            <td className="p-3 text-xs font-semibold text-muted-foreground text-center">
                                                {idx + 1}
                                            </td>
                                            <td className="p-3">
                                                {row.isValid ? (
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold w-fit uppercase">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Ready
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 text-[10px] font-bold w-fit uppercase">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Fix
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-xs font-semibold text-foreground">
                                                {row.employeeEmail || (
                                                    <span className="italic text-muted-foreground">Blank</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {row.dateKey || row.date || '-'}
                                            </td>
                                            <td className="p-3 text-xs">
                                                {row.isValid ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                        {t(
                                                            'attendance.importRowReady',
                                                            'Ready to update existing record',
                                                        )}
                                                    </span>
                                                ) : (
                                                    <ul className="list-none space-y-0.5">
                                                        {row.errors.map((err, eIdx) => (
                                                            <li
                                                                key={eIdx}
                                                                className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1"
                                                            >
                                                                <CornerDownRight className="h-3 w-3 shrink-0" />
                                                                {err}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <DialogFooter className="flex flex-row justify-between gap-3 border-t pt-5 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetModal}
                                className="h-10 px-5 border-border text-foreground/80 hover:text-foreground font-semibold rounded-xl"
                            >
                                {t('attendance.importBack', 'Upload Different File')}
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleCloseChange(false)}
                                    className="h-10 px-5 border-border text-foreground/80 hover:text-foreground font-semibold rounded-xl"
                                >
                                    {t('attendance.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleImport}
                                    disabled={validCount === 0}
                                    className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    {t('attendance.importSubmit', 'Update Valid Rows')}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                )}

                {phase === 'IMPORTING' && (
                    <div className="p-8 space-y-6 flex flex-col items-center justify-center text-center">
                        <div className="relative p-6 bg-primary/5 rounded-full text-primary animate-pulse mb-2">
                            <Loader2 className="h-12 w-12 animate-spin" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-2 w-full">
                            <h3 className="text-base font-bold text-foreground">
                                {t('attendance.importingTitle', 'Updating Attendance...')}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-85 mx-auto leading-relaxed">
                                {t(
                                    'attendance.importingDesc',
                                    'Processing updates sequentially. Please keep this modal open.',
                                )}
                            </p>
                        </div>
                        <div className="w-full max-w-90 space-y-2 mt-4">
                            <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                <span>Progress</span>
                                <span>
                                    {progress.current} of {progress.total}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 rounded-full"
                                    style={{
                                        width: `${(progress.current / progress.total) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {phase === 'SUMMARY' && (
                    <div className="p-6 space-y-6 max-h-[75vh] flex flex-col">
                        <div className="text-center space-y-1.5 shrink-0">
                            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">
                                {t('attendance.importCompleteTitle', 'Import Finished')}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {t(
                                    'attendance.importCompleteDesc',
                                    'Review the results breakdown below.',
                                )}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="p-3 bg-emerald-500/3 rounded-xl border border-emerald-500/10 flex flex-col text-center">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                                    {t('attendance.importSuccessCount', 'Updated Successfully')}
                                </span>
                                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {results.success.length}
                                </span>
                            </div>
                            <div className="p-3 bg-rose-500/3 rounded-xl border border-rose-500/10 flex flex-col text-center">
                                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1">
                                    {t('attendance.importFailedCount', 'Failed')}
                                </span>
                                <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                    {results.failed.length}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 max-h-62.5">
                            {results.failed.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        {t('attendance.importFailedLog', 'Failed Updates')} ({results.failed.length})
                                    </h4>
                                    <div className="border border-rose-500/20 bg-rose-500/2 rounded-xl p-3 space-y-2 max-h-35 overflow-y-auto">
                                        {results.failed.map((fail, fIdx) => (
                                            <div
                                                key={fIdx}
                                                className="text-xs flex flex-col border-b border-rose-500/10 pb-2 last:border-b-0 last:pb-0"
                                            >
                                                <span className="font-semibold text-foreground">{fail.name}</span>
                                                <span className="text-muted-foreground mt-0.5">{fail.error}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.success.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        {t('attendance.importSuccessLog', 'Updated')} ({results.success.length})
                                    </h4>
                                    <div className="border border-emerald-500/20 bg-emerald-500/2 rounded-xl p-3 space-y-1.5 max-h-30 overflow-y-auto">
                                        {results.success.map((succ, sIdx) => (
                                            <div
                                                key={sIdx}
                                                className="text-xs text-muted-foreground flex items-center gap-1.5"
                                            >
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                <span>{succ}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="flex flex-row justify-end gap-3 border-t pt-5 shrink-0">
                            <Button
                                type="button"
                                onClick={() => handleCloseChange(false)}
                                className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md"
                            >
                                {t('attendance.done', 'Done')}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImportAttendanceModal;
