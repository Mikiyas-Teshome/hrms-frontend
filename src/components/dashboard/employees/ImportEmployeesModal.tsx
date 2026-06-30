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
    CornerDownRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
    BULK_INVITE_MAX_ROWS,
    useEmployeeImportMetadata,
} from '@/features/employee/hooks/useEmployeeImportMetadata';
import { useInviteEmployees } from '@/features/employee/hooks/useEmployee';
import { 
    generateEmployeeTemplate, 
    parseEmployeeExcel, 
    ParsedEmployeeRow 
} from '@/lib/excel-template-generator';
import { useToast } from '@/hooks/use-toast';

interface ImportEmployeesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type ImportPhase = 'SELECT' | 'PREVIEW' | 'IMPORTING' | 'SUMMARY';

const ImportEmployeesModal: React.FC<ImportEmployeesModalProps> = ({ open, onOpenChange }) => {
    const { t } = useTranslation('employees');
    const { toast } = useToast();

    const {
        metadata,
        isLoading: metadataLoading,
        isReady,
        hasContracts,
        hasSalaryStructures,
    } = useEmployeeImportMetadata();
    const inviteEmployeesMutation = useInviteEmployees();

    const [phase, setPhase] = useState<ImportPhase>('SELECT');
    const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
    const [results, setResults] = useState<{ success: string[]; failed: { name: string; error: string }[] }>({
        success: [],
        failed: []
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = async () => {
        if (!isReady) {
            toast({
                title: t('downloadError', 'Failed to generate template'),
                description: t(
                    'importPrerequisitesMissing',
                    'Set up at least one company with contracts and salary structures before downloading the template.',
                ),
                variant: 'destructive',
            });
            return;
        }

        setIsDownloadingTemplate(true);
        try {
            const blob = await generateEmployeeTemplate(metadata);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bekur_Employee_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast({
                title: t('downloadSuccess', 'Template Downloaded'),
                description: t('downloadSuccessDesc', 'Dynamic template generated with active companies, org units, and roles.'),
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Something went wrong, please try again.';
            console.error('Failed to generate template:', error);
            toast({
                title: t('downloadError', 'Failed to generate template'),
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsDownloadingTemplate(false);
        }
    };

    const processFile = async (file: File) => {
        if (!isReady) {
            toast({
                title: 'Import Unavailable',
                description: t(
                    'importPrerequisitesMissing',
                    'Set up at least one company with contracts and salary structures before importing employees.',
                ),
                variant: 'destructive',
            });
            return;
        }

        try {
            const rows = await parseEmployeeExcel(file, metadata);
            
            if (rows.length === 0) {
                toast({
                    title: 'Empty Template',
                    description: 'No valid data rows found in the uploaded file.',
                    variant: 'destructive',
                });
                return;
            }

            setParsedRows(rows);
            setPhase('PREVIEW');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to read the Excel file. Please use the original template.';
            console.error('File parsing failed:', error);
            toast({
                title: 'Parsing Failed',
                description: message,
                variant: 'destructive',
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            processFile(file);
        } else {
            toast({
                title: 'Invalid File',
                description: 'Please upload a valid Excel spreadsheet (.xlsx or .xls).',
                variant: 'destructive',
            });
        }
    };

    const handleChooseFile = () => {
        if (!isReady) {
            toast({
                title: 'Import Unavailable',
                description: t(
                    'importPrerequisitesMissing',
                    'Set up at least one company with contracts and salary structures before importing employees.',
                ),
                variant: 'destructive',
            });
            return;
        }
        fileInputRef.current?.click();
    };

    const handleImport = async () => {
        const validRows = parsedRows.filter((row) => row.isValid);
        if (validRows.length === 0) return;

        if (validRows.length > BULK_INVITE_MAX_ROWS) {
            toast({
                title: t('importLimitExceeded', 'Import limit exceeded'),
                description: t(
                    'importLimitExceededDesc',
                    'You can import up to {{max}} employees at once. Remove extra rows and try again.',
                    { max: BULK_INVITE_MAX_ROWS },
                ),
                variant: 'destructive',
            });
            return;
        }

        setPhase('IMPORTING');

        try {
            const result = await inviteEmployeesMutation.mutateAsync({
                employees: validRows.map((row) => ({
                    email: row.email,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    ouId: row.ouId,
                    roleId: row.role,
                    gccId: row.gccid,
                    employmentType: row.employmentType,
                    contractId: row.contractId!,
                    jobTitle: row.jobTitle,
                    salary: row.salary,
                    salaryStructureId: row.salaryStructureId,
                })),
            });

            const rowByEmail = new Map(validRows.map((row) => [row.email.toLowerCase(), row]));
            const successList = result.successfulInvitations.map((invitation) => {
                const row = rowByEmail.get(invitation.email.toLowerCase());
                return row
                    ? `${row.firstName} ${row.lastName} (${invitation.email})`
                    : invitation.email;
            });
            const failedList = result.failedInvitations.map((failure) => {
                const row = rowByEmail.get(failure.email.toLowerCase());
                return {
                    name: row ? `${row.firstName} ${row.lastName}` : failure.email,
                    error: failure.reason,
                };
            });

            setResults({ success: successList, failed: failedList });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Bulk invitation request failed.';
            setResults({
                success: [],
                failed: validRows.map((row) => ({
                    name: `${row.firstName} ${row.lastName}`,
                    error: message,
                })),
            });
        }

        setPhase('SUMMARY');
    };

    const resetModal = () => {
        setPhase('SELECT');
        setParsedRows([]);
        setResults({ success: [], failed: [] });
    };

    const handleCloseChange = (openVal: boolean) => {
        if (!openVal) {
            resetModal();
        }
        onOpenChange(openVal);
    };

    const validCount = parsedRows.filter((row) => row.isValid).length;
    const invalidCount = parsedRows.length - validCount;
    const exceedsImportLimit = validCount > BULK_INVITE_MAX_ROWS;

    return (
        <Dialog open={open} onOpenChange={handleCloseChange}>
            <DialogContent 
                className={cn(
                    "p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl transition-all duration-300 [&>button]:hidden",
                    phase === 'PREVIEW' ? "max-w-4xl" : "max-w-145"
                )}
            >
                <DialogHeader className="bg-muted/40 h-14 px-6 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <DialogTitle className="text-base font-bold text-foreground">
                            {t('importEmployeesData')}
                        </DialogTitle>
                    </div>
                    {phase === 'SELECT' && (
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isDownloadingTemplate || metadataLoading || !isReady}
                            onClick={handleDownloadTemplate}
                            className="h-9 px-4 text-xs bg-primary/10 hover:bg-primary/20 text-primary font-bold flex items-center gap-2 border-none rounded-xl transition-all"
                        >
                            {isDownloadingTemplate ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            {t('downloadSampleTemplate')}
                        </Button>
                    )}
                </DialogHeader>

                {phase === 'SELECT' && (
                    <div className="p-6 space-y-6">
                        {!metadataLoading && !isReady && (
                            <div className="flex gap-3.5 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-foreground/80 items-start">
                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-foreground">
                                        {t('importSetupRequired', 'Setup required before import')}
                                    </h4>
                                    <p className="text-xs leading-[1.4] text-muted-foreground">
                                        {!hasContracts && !hasSalaryStructures
                                            ? t(
                                                'importNoContractsOrSalaryStructures',
                                                'Create contracts and salary structures for your companies before using bulk import.',
                                            )
                                            : !hasContracts
                                                ? t(
                                                    'importNoContracts',
                                                    'Create at least one contract for your companies before using bulk import.',
                                                )
                                                : t(
                                                    'importNoSalaryStructures',
                                                    'Create at least one salary structure for your companies before using bulk import.',
                                                )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleChooseFile}
                            className={cn(
                                "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200",
                                isDragging 
                                    ? "border-primary bg-primary/5 scale-[0.99]" 
                                    : "border-border hover:border-primary/60 hover:bg-muted/30",
                                !isReady && !metadataLoading && "opacity-60 cursor-not-allowed",
                            )}
                        >
                            <div className="p-4 bg-primary/5 rounded-2xl text-primary mb-4">
                                <UploadCloud className="h-8 w-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-1">
                                {t('dragDropTitle', 'Drag and drop your spreadsheet here')}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                {t('dragDropSubtitle', 'Supports .xlsx and .xls file formats')}
                            </p>
                            <Button 
                                type="button"
                                variant="outline"
                                disabled={metadataLoading || !isReady}
                                className="h-9 px-6 font-semibold rounded-xl text-xs hover:bg-muted transition-all"
                            >
                                {t('chooseFile')}
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
                                    {t('importantNote', 'Import Instructions')}
                                </h4>
                                <p className="text-xs leading-[1.4] text-muted-foreground">
                                    {t('importDescription', 'Downloading and using our dynamic template guarantees error-free matches. The template embeds live validation dropdowns directly inside columns based on active system values.')}
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
                                {t('cancel')}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {phase === 'PREVIEW' && (
                    <div className="p-6 space-y-6 flex flex-col max-h-[75vh]">
                        <div className="grid grid-cols-3 gap-4 shrink-0">
                            <div className="p-3 bg-muted/40 rounded-xl border border-border flex flex-col">
                                <span className="text-xs text-muted-foreground">{t('totalRows', 'Total Entries')}</span>
                                <span className="text-xl font-extrabold text-foreground">{parsedRows.length}</span>
                            </div>
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex flex-col">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">{t('validRows', 'Ready for Import')}</span>
                                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{validCount}</span>
                            </div>
                            <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 flex flex-col">
                                <span className="text-xs text-rose-600 dark:text-rose-400">{t('invalidRows', 'Contains Errors')}</span>
                                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{invalidCount}</span>
                            </div>
                        </div>

                        {exceedsImportLimit && (
                            <div className="flex gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl items-start shrink-0">
                                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-600 dark:text-rose-400 leading-[1.4]">
                                    {t(
                                        'importLimitExceededDesc',
                                        'You can import up to {{max}} employees at once. Remove extra rows and try again.',
                                        { max: BULK_INVITE_MAX_ROWS },
                                    )}
                                </p>
                            </div>
                        )}

                        {invalidCount > 0 && (
                            <div className="flex gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl items-start shrink-0">
                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-600 dark:text-amber-400 leading-[1.4]">
                                    {t('warningAlertDesc', 'Some rows contain formatting errors or unrecognized selection options. You can continue importing the valid rows; invalid entries will be skipped automatically.')}
                                </p>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto border border-border rounded-xl min-h-62.5 max-h-87.5">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
                                    <tr>
                                        <th className="p-3 text-xs font-bold text-muted-foreground w-12 text-center">#</th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground w-20">{t('status', 'Status')}</th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground">{t('name', 'Name')}</th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground">{t('email', 'Email')}</th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground">{t('jobTitle', 'Job Title')}</th>
                                        <th className="p-3 text-xs font-bold text-muted-foreground">{t('validationErrors', 'Validation Audit / Remarks')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {parsedRows.map((row, idx) => (
                                        <tr key={idx} className={cn("hover:bg-muted/20", !row.isValid && "bg-rose-500/2")}>
                                            <td className="p-3 text-xs font-semibold text-muted-foreground text-center">{idx + 1}</td>
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
                                                {row.firstName || row.lastName ? `${row.firstName} ${row.lastName}` : <span className="italic text-muted-foreground">Blank</span>}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">{row.email || <span className="italic text-muted-foreground">Blank</span>}</td>
                                            <td className="p-3 text-xs text-muted-foreground">{row.jobTitle || '-'}</td>
                                            <td className="p-3 text-xs">
                                                {row.isValid ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Valid row structure ready to invite</span>
                                                ) : (
                                                    <ul className="list-none space-y-0.5">
                                                        {row.errors.map((err, eIdx) => (
                                                            <li key={eIdx} className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
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
                                {t('back', 'Upload Different File')}
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleCloseChange(false)}
                                    className="h-10 px-5 border-border text-foreground/80 hover:text-foreground font-semibold rounded-xl"
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleImport}
                                    disabled={validCount === 0 || exceedsImportLimit || inviteEmployeesMutation.isPending}
                                    className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    {t('importValidRows', 'Invite Ready Employees')}
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
                                {t('sendingInvites', 'Inviting Employees...')}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-85 mx-auto leading-relaxed">
                                {t(
                                    'bulkInviteProgress',
                                    'Sending invitations in a single batch. Please keep this modal open until the process completes.',
                                )}
                            </p>
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
                                {t('importComplete', 'Import Process Finished')}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                We finished sending the invites. Review the results breakdown below.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="p-3 bg-emerald-500/3 rounded-xl border border-emerald-500/10 flex flex-col text-center">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Invited Successfully</span>
                                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{results.success.length}</span>
                            </div>
                            <div className="p-3 bg-rose-500/3 rounded-xl border border-rose-500/10 flex flex-col text-center">
                                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1">Invites Failed</span>
                                <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{results.failed.length}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 max-h-62.5">
                            {results.failed.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Failed Invitations Log ({results.failed.length})
                                    </h4>
                                    <div className="border border-rose-500/20 bg-rose-500/2 rounded-xl p-3 space-y-2 max-h-35 overflow-y-auto">
                                        {results.failed.map((fail, fIdx) => (
                                            <div key={fIdx} className="text-xs flex flex-col border-b border-rose-500/10 pb-2 last:border-b-0 last:pb-0">
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
                                        Successfully Invited ({results.success.length})
                                    </h4>
                                    <div className="border border-emerald-500/20 bg-emerald-500/2 rounded-xl p-3 space-y-1.5 max-h-30 overflow-y-auto">
                                        {results.success.map((succ, sIdx) => (
                                            <div key={sIdx} className="text-xs text-muted-foreground flex items-center gap-1.5">
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
                                {t('done', 'Done')}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImportEmployeesModal;
