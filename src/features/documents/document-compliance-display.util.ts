import {
    DocumentApprovalState,
    DocumentComplianceStatus,
} from './documents.types';

export type DocumentComplianceMeta = {
    label: string;
    className: string;
    dotClassName: string;
};

type ComplianceLabels = {
    compliant: string;
    nearExpiry: string;
    missing: string;
    expired: string;
    rejected: string;
};

export function resolveDocumentComplianceMeta(
    status: DocumentComplianceStatus | undefined,
    approvalState: DocumentApprovalState | undefined,
    labels: ComplianceLabels,
): DocumentComplianceMeta {
    if (approvalState === DocumentApprovalState.REJECTED) {
        return {
            label: labels.rejected,
            className: 'bg-red-500/10 text-red-600 border-red-500/20',
            dotClassName: 'bg-red-500',
        };
    }

    switch (status) {
        case DocumentComplianceStatus.COMPLIANT:
            return {
                label: labels.compliant,
                className: 'bg-green-500/10 text-green-600 border-green-500/20',
                dotClassName: 'bg-green-500',
            };
        case DocumentComplianceStatus.NEAR_EXPIRE:
            return {
                label: labels.nearExpiry,
                className: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
                dotClassName: 'bg-amber-500',
            };
        case DocumentComplianceStatus.MISSING:
            return {
                label: labels.missing,
                className: 'bg-red-500/10 text-red-600 border-red-500/20',
                dotClassName: 'bg-red-500',
            };
        case DocumentComplianceStatus.EXPIRED:
        default:
            return {
                label: labels.expired,
                className: 'bg-red-500/10 text-red-600 border-red-500/20',
                dotClassName: 'bg-red-500',
            };
    }
}

export function getDocumentComplianceLabels(
    t: (key: string, options?: { ns?: string }) => string,
): ComplianceLabels {
    return {
        compliant: t('employeeDocuments.compliance.compliant', { ns: 'document' }),
        nearExpiry: t('employeeDocuments.compliance.nearExpiry', { ns: 'document' }),
        missing: t('employeeDocuments.compliance.missing', { ns: 'document' }),
        expired: t('employeeDocuments.compliance.expired', { ns: 'document' }),
        rejected: t('employeeDocuments.compliance.rejected', { ns: 'document' }),
    };
}
