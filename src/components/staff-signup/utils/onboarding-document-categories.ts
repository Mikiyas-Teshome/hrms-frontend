import {
    DocumentCategory,
    DocumentCategoryAppliedTo,
} from '@/features/documents/documents.types';

export function filterOnboardingDocumentCategories(
    categories: DocumentCategory[],
    options?: { nationality?: string | null; residenceCountry?: string | null; departmentOuId?: string | null },
): DocumentCategory[] {
    const nationality = options?.nationality?.trim().toUpperCase() ?? '';
    const residenceCountry = options?.residenceCountry?.trim().toUpperCase() ?? '';
    const isForeignEmployee =
        nationality.length > 0 &&
        residenceCountry.length > 0 &&
        nationality !== residenceCountry;

    return categories.filter((category) => {
        if (category.status !== 'active') {
            return false;
        }
        if (category.appliedTo === DocumentCategoryAppliedTo.ALL_EMPLOYEES) {
            return true;
        }
        if (category.appliedTo === DocumentCategoryAppliedTo.FOREIGN_EMPLOYEE) {
            return isForeignEmployee;
        }
        if (category.appliedTo === DocumentCategoryAppliedTo.DEPARTMENT_SPECIFIC) {
            if (options?.departmentOuId && category.organizationUnitIds?.length) {
                return category.organizationUnitIds.includes(options.departmentOuId);
            }
            return true;
        }
        return false;
    });
}

const FILE_TYPE_ACCEPT: Record<string, string> = {
    PDF: '.pdf,application/pdf',
    JPEG: '.jpg,.jpeg,image/jpeg',
    PNG: '.png,image/png',
    DOC: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function buildAcceptString(allowedFileTypes: string[]): string {
    const parts = allowedFileTypes
        .map((type) => FILE_TYPE_ACCEPT[type.toUpperCase()])
        .filter(Boolean);
    return parts.length > 0 ? parts.join(',') : '.pdf,.jpg,.jpeg,.png,.doc,.docx';
}

export function validateCategoryFile(
    file: File,
    category: DocumentCategory,
): string | null {
    const maxMb = category.maxFileSizeMb ?? 10;
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
        return `File must be under ${maxMb} MB.`;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mime = file.type.toLowerCase();
    const allowed = category.allowedFileTypes.map((type) => type.toUpperCase());

    const extensionAllowed =
        (allowed.includes('PDF') && extension === 'pdf') ||
        (allowed.includes('JPEG') && (extension === 'jpg' || extension === 'jpeg')) ||
        (allowed.includes('PNG') && extension === 'png') ||
        (allowed.includes('DOC') && (extension === 'doc' || extension === 'docx'));

    const mimeAllowed =
        (allowed.includes('PDF') && mime === 'application/pdf') ||
        (allowed.includes('JPEG') && mime === 'image/jpeg') ||
        (allowed.includes('PNG') && mime === 'image/png') ||
        (allowed.includes('DOC') &&
            (mime === 'application/msword' ||
                mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));

    if (!extensionAllowed && !mimeAllowed) {
        return `Allowed file types: ${allowed.join(', ')}.`;
    }

    return null;
}
