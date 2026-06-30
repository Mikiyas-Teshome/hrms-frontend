'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';

type LoadingRow = {
  id: string;
};

interface EmployeeDocumentsSelfViewLoadingProps {
  showUploadButton?: boolean;
}

const EmployeeDocumentsSelfViewLoading = ({
  showUploadButton = false,
}: EmployeeDocumentsSelfViewLoadingProps) => {
  const { t } = useTranslation(['dashboard', 'document']);

  const columns: ColumnConfig<LoadingRow>[] = useMemo(
    () => [
      {
        key: 'category',
        label: t('documentData.employeeDocuments.table.category'),
      },
      {
        key: 'documentName',
        label: t('documentData.employeeDocuments.table.documentName'),
      },
      {
        key: 'expiryDate',
        label: t('documentData.employeeDocuments.table.expiryDate'),
      },
      {
        key: 'compliance',
        label: t('documentData.employeeDocuments.table.compliance'),
      },
      {
        key: 'approvalState',
        label: t('employeeDocuments.table.approval', { ns: 'document' }),
      },
    ],
    [t],
  );

  return (
    <div className="flex w-full flex-col gap-8 duration-500 animate-in fade-in">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold leading-8 tracking-tight text-foreground">
          {t('employeeDocuments.myDocuments.title', { ns: 'document' })}
        </h1>
        {showUploadButton ? <Skeleton className="h-9 w-40 rounded-lg" /> : null}
      </div>

      <div className="w-full">
        <UniversalDataTable
          data={[]}
          columns={columns}
          getRowId={(item) => item.id}
          currentPage={1}
          totalPages={1}
          pageSize={10}
          onPageChange={() => undefined}
          onPageSizeChange={() => undefined}
          renderRowActions={() => null}
          isLoading
          showSearch={false}
          showFilter={false}
        />
      </div>
    </div>
  );
};

export default EmployeeDocumentsSelfViewLoading;
