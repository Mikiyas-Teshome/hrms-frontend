'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Download, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateReportSheet from './CreateReportSheet';
import ViewCustomReportSheet from './ViewCustomReportSheet';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { ExportButton } from './ExportButton';
import { useToast } from '@/hooks/use-toast';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import {
    useCustomReports,
    useDeleteCustomReport,
    useExportCustomReport,
    useRunCustomReport,
} from '@/features/reports/reports.hooks';
import { CustomReportListItem } from '@/features/reports/reports.types';
import { format } from 'date-fns';

const CustomReportsPage = () => {
    const { t } = useTranslation(['dashboard']);
    const { toast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewReportId, setViewReportId] = useState('');
    const [viewReportName, setViewReportName] = useState('');
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<CustomReportListItem | null>(null);

    const { companyOuId, derivedCompanyOuId } = useLeaveCompanyOuId();
    const effectiveCompanyOuId = companyOuId || derivedCompanyOuId || undefined;

    const listFilters = useMemo(
        () => ({
            page: currentPage,
            limit: pageSize,
            search: searchValue || undefined,
            companyOuId: effectiveCompanyOuId,
        }),
        [currentPage, pageSize, searchValue, effectiveCompanyOuId],
    );

    const { data: listData, isLoading, refetch } = useCustomReports(listFilters);
    const deleteMutation = useDeleteCustomReport();
    const exportMutation = useExportCustomReport();
    const {
        data: runResult,
        isLoading: isRunning,
        isError: isRunError,
    } = useRunCustomReport(viewReportId, isViewOpen && !!viewReportId);

    const tableRows = useMemo(
        () =>
            (listData?.items ?? []).map((item) => ({
                ...item,
                lastRun: item.lastRunAt
                    ? format(new Date(item.lastRunAt), 'MMM d, yyyy')
                    : '—',
            })),
        [listData?.items],
    );

    const columns: ColumnConfig<(typeof tableRows)[number]>[] = [
        { key: 'name', label: 'Report name', sortable: true },
        { key: 'dataSource', label: 'Data source', sortable: true },
        { key: 'filtersSummary', label: 'Filters', sortable: false },
        { key: 'lastRun', label: 'Last run', sortable: true },
        { key: 'createdByName', label: 'Created by', sortable: true },
    ];

    const exportColumns = [
        { header: 'Report Name', key: 'name' },
        { header: 'Data Source', key: 'dataSource' },
        { header: 'Filters', key: 'filtersSummary' },
        { header: 'Last Run', key: 'lastRun' },
        { header: 'Created By', key: 'createdByName' },
    ];

    const handleView = (item: CustomReportListItem) => {
        setViewReportId(item.id);
        setViewReportName(item.name);
        setIsViewOpen(true);
    };

    const handleViewOpenChange = (open: boolean) => {
        setIsViewOpen(open);
        if (!open) {
            setViewReportId('');
            setViewReportName('');
        }
    };

    const handleDeleteClick = (item: CustomReportListItem) => {
        setReportToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!reportToDelete?.id) return;

        try {
            await deleteMutation.mutateAsync(reportToDelete.id);
            setIsDeleteModalOpen(false);
            setReportToDelete(null);
            toast({ title: t('reports.custom.deleteSuccess') });
            void refetch();
        } catch {
            toast({ variant: 'destructive', title: t('reports.custom.deleteFailed') });
        }
    };

    const handleExport = async (id: string, formatType: 'csv' | 'xlsx' | 'pdf') => {
        try {
            const result = await exportMutation.mutateAsync({ id, format: formatType });
            const binary = atob(result.content);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i += 1) {
                bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: result.mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.fileName;
            link.click();
            URL.revokeObjectURL(url);
            toast({ title: 'Export successful', description: result.fileName });
            void refetch();
        } catch {
            toast({ variant: 'destructive', title: 'Export failed' });
        }
    };

    const renderRowActions = (item: (typeof tableRows)[number]) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleView(item)}>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>View</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => handleExport(item.id, 'csv')}
                >
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span>Export</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(item)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <CreateReportSheet
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onCreated={() => void refetch()}
            />
            <ViewCustomReportSheet
                open={isViewOpen}
                onOpenChange={handleViewOpenChange}
                reportName={viewReportName}
                result={runResult}
                isLoading={isRunning}
                isError={isRunError}
            />
            {isDeleteModalOpen ? (
                <ConfirmationModal
                    open={isDeleteModalOpen}
                    onOpenChange={(open) => {
                        setIsDeleteModalOpen(open);
                        if (!open) {
                            setReportToDelete(null);
                        }
                    }}
                    title={t('reports.custom.deleteConfirmTitle')}
                    message={t('reports.custom.deleteConfirmMessage', { name: reportToDelete?.name ?? '' })}
                    onConfirm={handleConfirmDelete}
                    confirmLabel={t('reports.custom.delete')}
                    isLoading={deleteMutation.isPending}
                    variant="danger"
                />
            ) : null}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('reports.custom.title')}
                </h1>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 h-9 rounded-lg transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('reports.custom.createReport')}</span>
                </Button>
            </div>

            <div className="w-full">
                <UniversalDataTable
                    data={tableRows}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={(value) => {
                        setSearchValue(value);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder="Search reports"
                    showFilter
                    currentPage={currentPage}
                    totalPages={listData?.totalPages ?? 1}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    isLoading={isLoading}
                    renderRowActions={renderRowActions}
                    renderHeaderActions={
                        <ExportButton
                            data={tableRows}
                            columns={exportColumns}
                            filename="Custom_Reports_List"
                        />
                    }
                    totalItems={listData?.total ?? 0}
                />
            </div>
        </div>
    );
};

export default CustomReportsPage;
