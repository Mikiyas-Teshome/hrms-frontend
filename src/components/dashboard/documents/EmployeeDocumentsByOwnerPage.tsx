'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, MoreVertical, Eye, Trash2, Download, CheckCircle2, XCircle, PencilLine, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateString } from '@/lib/date-utils';
import EmployeeDocumentDetailSheet from './EmployeeDocumentDetailSheet';
import UploadEmployeeDocumentSheet from './UploadEmployeeDocumentSheet';
import DocumentRejectModal from './DocumentRejectModal';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import {
  deleteEmployeeDocument,
  fetchDocumentCategories,
  replaceEmployeeDocumentFile,
  updateEmployeeDocument,
} from '@/features/documents/documents.actions';
import {
  getDocumentComplianceLabels,
  resolveDocumentComplianceMeta,
} from '@/features/documents/document-compliance-display.util';
import {
  DocumentApprovalState,
  DocumentCategory,
  DocumentComplianceStatus,
  EmployeeDocumentRow,
} from '@/features/documents/documents.types';
import {
  employeeDocumentQueryKeys,
  useEmployeeDocumentsPaged,
} from '@/features/documents/hooks/useEmployeeDocuments';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
  canCreateEmployeeDocument,
  canUploadDocumentsForOthers,
  isDocumentsOwnScopeOnly,
} from '@/features/documents/document-permission.util';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import EmployeeDocumentsSelfViewLoading from './EmployeeDocumentsSelfViewLoading';
import { downloadEmployeeDocumentFile } from '@/features/documents/document-file-open.util';

interface EmployeeDocumentsByOwnerPageProps {
  ownerId: string;
  isSelfView?: boolean;
  ownerDisplayName?: string;
}

type DocumentModalState = {
  selectedDocId: string | null;
  open: boolean;
  mode: 'view' | 'edit';
};

const defaultModalState: DocumentModalState = {
  selectedDocId: null,
  open: false,
  mode: 'view',
};

const EmployeeDocumentsByOwnerPage = ({
  ownerId,
  isSelfView: isSelfViewProp,
  ownerDisplayName,
}: EmployeeDocumentsByOwnerPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation(['dashboard', 'document']);
  const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  const isRtl = i18n.language === 'ar' || i18n.language === 'he';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [modalState, setModalState] = useState<DocumentModalState>(defaultModalState);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSessionKey, setUploadSessionKey] = useState(0);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [documentToReject, setDocumentToReject] = useState<{
    id: string;
    documentName: string;
  } | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { hasPermission, hasScope, isSystemAdmin } = usePermissions();
  const isOwnScopeOnly = isDocumentsOwnScopeOnly(hasScope, isSystemAdmin);
  const canUploadForOthers = canUploadDocumentsForOthers(hasScope, isSystemAdmin);
  const isSelfView = isSelfViewProp ?? isOwnScopeOnly;
  const canCreateDocument = canCreateEmployeeDocument(hasPermission, hasScope, isSystemAdmin);
  const myProfileQuery = useMyEmployeeProfile({
    enabled: isOwnScopeOnly || isSelfView || canCreateDocument,
  });
  const isViewingOwnDocuments =
    isSelfView ||
    (myProfileQuery.data?.id != null && myProfileQuery.data.id === ownerId);
  const showUploadButton = canCreateDocument && (isViewingOwnDocuments || canUploadForOthers);
  const canUpdateDocument = hasPermission('documents:update');
  const canDeleteDocument = hasPermission('documents:delete');
  const canApproveDocument = hasPermission('documents:approve') && !isSelfView;
  const isCompanyScopeEditor =
    isSystemAdmin ||
    hasScope('documents', 'update', 'company') ||
    hasScope('documents', 'update', 'department') ||
    hasScope('documents', 'update', 'all');

  const listParams = useMemo(
    () => ({
      page: currentPage,
      size: pageSize,
      filter: { ownerId },
    }),
    [currentPage, pageSize, ownerId],
  );

  const listQuery = useEmployeeDocumentsPaged(listParams);
  const documents = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data]);
  const totalItems = listQuery.data?.metaData.total ?? 0;
  const totalPages = listQuery.data?.metaData.totalPages ?? 0;

  const ownerName =
    ownerDisplayName ||
    searchParams.get('name')?.trim() ||
    documents[0]?.ownerName ||
    t('employeeDocuments.ownerPage.unnamedEmployee', { ns: 'document' });

  useEffect(() => {
    if (!isOwnScopeOnly || isSelfViewProp || myProfileQuery.isLoading) {
      return;
    }
    const myEmployeeId = myProfileQuery.data?.id;
    if (!myEmployeeId || myEmployeeId === ownerId) {
      return;
    }
    const name = myProfileQuery.data
      ? `${myProfileQuery.data.firstName} ${myProfileQuery.data.lastName}`.trim()
      : '';
    const params = new URLSearchParams();
    if (name) {
      params.set('name', name);
    }
    const query = params.toString();
    router.replace(
      `/dashboard/documents/employee-documents/${myEmployeeId}${query ? `?${query}` : ''}`,
    );
  }, [
    isOwnScopeOnly,
    isSelfViewProp,
    ownerId,
    myProfileQuery.data,
    myProfileQuery.isLoading,
    router,
  ]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(async () => {
      const categoryResult = await fetchDocumentCategories();
      if (isMounted) {
        setCategories(categoryResult);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const canEditDocument = useCallback(
    (item: { approvalState?: DocumentApprovalState }) => {
      if (!canUpdateDocument) {
        return false;
      }
      if (isCompanyScopeEditor) {
        return true;
      }
      return (
        item.approvalState === DocumentApprovalState.PENDING ||
        item.approvalState === DocumentApprovalState.REJECTED
      );
    },
    [canUpdateDocument, isCompanyScopeEditor],
  );

  const refreshDocuments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: employeeDocumentQueryKeys.paged(listParams) });
    queryClient.invalidateQueries({ queryKey: ['employee-document-owners-paged'] });
    queryClient.invalidateQueries({ queryKey: employeeDocumentQueryKeys.stats });
  }, [listParams, queryClient]);

  const complianceLabels = useMemo(() => getDocumentComplianceLabels(t), [t]);

  const getComplianceMeta = useCallback(
    (status?: DocumentComplianceStatus, approvalState?: DocumentApprovalState) =>
      resolveDocumentComplianceMeta(status, approvalState, complianceLabels),
    [complianceLabels],
  );

  const getApprovalLabel = useCallback((state?: DocumentApprovalState) => {
    if (!state) {
      return '-';
    }
    switch (state) {
      case DocumentApprovalState.PENDING:
        return t('employeeDocuments.approval.pending', { ns: 'document' });
      case DocumentApprovalState.APPROVED:
        return t('employeeDocuments.approval.approved', { ns: 'document' });
      case DocumentApprovalState.REJECTED:
        return t('employeeDocuments.approval.rejected', { ns: 'document' });
      default:
        return state;
    }
  }, [t]);

  const tableRows = useMemo(
    () =>
      documents.map((doc) => ({
        id: doc.id,
        category: doc.categoryName,
        documentName: doc.documentName,
        expiryDate: doc.expiryDate ? formatDateString(doc.expiryDate, dateLocale) : '-',
        complianceStatus: doc.compliance,
        compliance: getComplianceMeta(doc.compliance, doc.approvalState).label,
        approvalState: doc.approvalState,
        uploadedBy: doc.uploadedBy,
      })),
    [documents, dateLocale, getComplianceMeta],
  );

  const documentById = useMemo(() => {
    const map = new Map<string, EmployeeDocumentRow>();
    for (const doc of documents) {
      map.set(doc.id, doc);
    }
    return map;
  }, [documents]);

  const columns: ColumnConfig<(typeof tableRows)[number]>[] = useMemo(() => {
    const baseColumns: ColumnConfig<(typeof tableRows)[number]>[] = [
      {
        key: 'category',
        label: t('documentData.employeeDocuments.table.category'),
      },
      {
        key: 'documentName',
        label: t('documentData.employeeDocuments.table.documentName'),
        render: (item) => (
          <div className="max-w-57.5 truncate" title={item.documentName}>
            {item.documentName}
          </div>
        ),
      },
      {
        key: 'expiryDate',
        label: t('documentData.employeeDocuments.table.expiryDate'),
      },
      {
        key: 'compliance',
        label: t('documentData.employeeDocuments.table.compliance'),
        render: (item) => {
          const meta = getComplianceMeta(item.complianceStatus, item.approvalState);
          return (
            <Badge variant="outline" className={meta.className}>
              <div className={`mr-1.5 h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
              {meta.label}
            </Badge>
          );
        },
      },
      {
        key: 'approvalState',
        label: t('employeeDocuments.table.approval', { ns: 'document' }),
        render: (item) => <span>{getApprovalLabel(item.approvalState)}</span>,
      },
    ];

    if (!isSelfView) {
      baseColumns.push({
        key: 'uploadedBy',
        label: t('documentData.employeeDocuments.table.uploadedBy'),
      });
    }

    return baseColumns;
  }, [getApprovalLabel, getComplianceMeta, isSelfView, t]);

  const handleOpenView = (id: string) => {
    if (!documentById.get(id)) {
      return;
    }
    setModalState({ selectedDocId: id, open: true, mode: 'view' });
  };

  const handleOpenEdit = (id: string) => {
    if (!documentById.get(id)) {
      return;
    }
    setModalState({ selectedDocId: id, open: true, mode: 'edit' });
  };

  const handleDownload = async (id: string) => {
    const document = documentById.get(id);
    if (!document) {
      return;
    }
    const ok = await downloadEmployeeDocumentFile(id, document.documentName);
    if (!ok) {
      console.error('Failed to download document file');
    }
  };

  const handleDocumentApproval = async (
    id: string,
    approvalState: DocumentApprovalState,
    rejectionReason?: string,
  ) => {
    const result = await updateEmployeeDocument(id, { approvalState, rejectionReason });
    if (!result.success) {
      console.error(result.error);
      return false;
    }
    refreshDocuments();
    return true;
  };

  const handleConfirmReject = async (rejectionReason?: string) => {
    if (!documentToReject) {
      return;
    }
    setIsRejecting(true);
    try {
      const ok = await handleDocumentApproval(
        documentToReject.id,
        DocumentApprovalState.REJECTED,
        rejectionReason,
      );
      if (ok) {
        setDocumentToReject(null);
      }
    } finally {
      setIsRejecting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) {
      return;
    }
    setIsDeleting(true);
    try {
      const result = await deleteEmployeeDocument(documentToDelete);
      if (!result.success) {
        console.error(result.error);
        return;
      }
      refreshDocuments();
      setDocumentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedModalDocument = useMemo(
    () => (modalState.selectedDocId ? documentById.get(modalState.selectedDocId) ?? null : null),
    [documentById, modalState.selectedDocId],
  );

  const renderRowActions = (item: (typeof tableRows)[number]) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleOpenView(item.id)}>
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>{t('employeeDocuments.actions.view', { ns: 'document' })}</span>
        </DropdownMenuItem>
        {canEditDocument(item) && (
          <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleOpenEdit(item.id)}>
            <PencilLine className="h-4 w-4 text-muted-foreground" />
            <span>{t('employeeDocuments.actions.edit', { ns: 'document' })}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handleDownload(item.id)}>
          <Download className="h-4 w-4 text-muted-foreground" />
          <span>{t('employeeDocuments.actions.download', { ns: 'document' })}</span>
        </DropdownMenuItem>
        {canApproveDocument && item.approvalState === DocumentApprovalState.PENDING && (
          <>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => handleDocumentApproval(item.id, DocumentApprovalState.APPROVED)}
            >
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span>{t('employeeDocuments.approval.approved', { ns: 'document' })}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              onClick={() =>
                setDocumentToReject({ id: item.id, documentName: item.documentName })
              }
            >
              <XCircle className="h-4 w-4" />
              <span>{t('employeeDocuments.approval.rejected', { ns: 'document' })}</span>
            </DropdownMenuItem>
          </>
        )}
        {canDeleteDocument && !isSelfView && (
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            onClick={() => setDocumentToDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('employeeDocuments.actions.delete', { ns: 'document' })}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isOwnScopeOnly && !isSelfViewProp && myProfileQuery.isLoading) {
    return <EmployeeDocumentsSelfViewLoading showUploadButton={showUploadButton} />;
  }

  return (
    <div className="flex w-full flex-col gap-8 duration-500 animate-in fade-in">
      <UploadEmployeeDocumentSheet
        key={uploadSessionKey}
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUploaded={refreshDocuments}
        defaultOwnerId={ownerId}
      />

      <DocumentRejectModal
        open={documentToReject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDocumentToReject(null);
          }
        }}
        documentName={documentToReject?.documentName}
        onConfirm={handleConfirmReject}
        isLoading={isRejecting}
      />

      <ConfirmationModal
        open={documentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDocumentToDelete(null);
          }
        }}
        title={t('employeeDocuments.actions.deleteConfirmTitle', { ns: 'document' })}
        message={t('employeeDocuments.actions.deleteConfirmMessage', { ns: 'document' })}
        confirmLabel={t('employeeDocuments.actions.delete', { ns: 'document' })}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      <EmployeeDocumentDetailSheet
        open={modalState.open}
        onOpenChange={(nextOpen) => setModalState((prev) => ({ ...prev, open: nextOpen }))}
        document={selectedModalDocument}
        mode={modalState.mode}
        categories={categories}
        dateLocale={dateLocale}
        isCompanyScopeEditor={isCompanyScopeEditor}
        canEdit={selectedModalDocument ? canEditDocument(selectedModalDocument) : false}
        onEdit={() => {
          if (modalState.selectedDocId) {
            handleOpenEdit(modalState.selectedDocId);
          }
        }}
        onSave={async ({ id, categoryId, expiryDate, replaceFile }) => {
          if (replaceFile) {
            const formData = new FormData();
            formData.append('file', replaceFile);
            const replaceResult = await replaceEmployeeDocumentFile(id, formData);
            if (!replaceResult.success) {
              console.error(replaceResult.error);
              return false;
            }
          }
          const input: Record<string, string> = {};
          if (isCompanyScopeEditor && categoryId) {
            input.categoryId = categoryId;
          }
          if (expiryDate) {
            input.expiryDate = expiryDate;
          }
          if (Object.keys(input).length > 0) {
            const result = await updateEmployeeDocument(id, input);
            if (!result.success) {
              console.error(result.error);
              return false;
            }
          }
          refreshDocuments();
          return true;
        }}
        getComplianceMeta={getComplianceMeta}
        getApprovalLabel={getApprovalLabel}
      />

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-4">
          {!isSelfView && (
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-fit gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => router.push('/dashboard/documents/employee-documents')}
            >
              <BackIcon className="h-4 w-4" />
              <span>{t('employeeDocuments.ownerPage.back', { ns: 'document' })}</span>
            </Button>
          )}

          <h1 className="text-2xl font-bold leading-8 tracking-tight text-foreground">
            {isSelfView
              ? t('employeeDocuments.myDocuments.title', { ns: 'document' })
              : t('employeeDocuments.ownerPage.title', { ns: 'document', name: ownerName })}
          </h1>
        </div>

        {showUploadButton && (
          <Button
            onClick={() => {
              setUploadSessionKey((current) => current + 1);
              setIsUploadModalOpen(true);
            }}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-white transition-all hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>
              {isViewingOwnDocuments
                ? t('employeeDocuments.myDocuments.uploadDocument', { ns: 'document' })
                : t('documentData.employeeDocuments.uploadDocument')}
            </span>
          </Button>
        )}
      </div>

      <div className="w-full">
        <UniversalDataTable
          data={tableRows}
          columns={columns}
          getRowId={(item) => item.id}
          currentPage={currentPage}
          totalPages={Math.max(1, totalPages)}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalItems={totalItems}
          renderRowActions={renderRowActions}
          onRowClick={(item) => handleOpenView(item.id)}
          isLoading={listQuery.isLoading}
          showSearch={false}
          showFilter={false}
          emptyMessage={
            isSelfView
              ? t('employeeDocuments.myDocuments.empty', { ns: 'document' })
              : t('employeeDocuments.ownerPage.empty', { ns: 'document' })
          }
        />
      </div>
    </div>
  );
};

export default EmployeeDocumentsByOwnerPage;
