export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type AnnouncementAudience = 'company' | 'department';

export interface AnnouncementRecord {
  id: string;
  companyId: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  audience: AnnouncementAudience;
  departmentOuId?: string | null;
  publishedAt?: string | null;
  expiresAt?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  audience?: AnnouncementAudience;
  departmentOuId?: string;
  expiresAt?: string;
}
