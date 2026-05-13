import type { AppPermission, Role, Role as AppRole } from '@/features/roles/roles.types';

export interface LoginInput {
    identifier: string;
    password?: string;
}

export interface LoginWith2FAInput {
    identifier: string;
    password?: string;
    twoFactorCode?: string;
    backupCode?: string;
}

export interface RegisterInput {
    companyId?: string | null;
    department?: string | null;
    email: string;
    firstName?: string;
    gccId?: string | null;
    invitationToken: string;
    lastName?: string;
    password: string;
    phoneNumber?: string | null;
    position?: string | null;
    role?: string | null;
}

export interface RegisterTenantSuperAdminInput {
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    invitationToken?: string;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface ForgotPasswordInput {
    email: string;
}

export interface ResetPasswordInput {
    email: string;
    newPassword: string;
    token: string;
}

export interface RefreshTokenInput {
    refreshToken: string;
}

export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    roleProfile?: Role | null;
    status: string;
    companyId: string;
    department?: string | null;
    phoneNumber?: string | null;
    position?: string | null;
    isEmailVerified: boolean;
    onboardingComplete: boolean;
    lastLoginAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    expiresIn: number;
    message?: string;
    refreshToken: string;
    requires2FA?: boolean;
    user: UserResponse;
}

export interface CreateInvitationInput {
    email: string;
    firstName?: string | null;
    gccId?: string | null;
    lastName?: string | null;
    ouId?: string | null;
    password?: string | null;
    role?: string | null;
    roleId?: string | null;
}

export interface BulkInvitationInput {
    invitations: CreateInvitationInput[];
}

export interface InvitationResponse {
    companyId: string;
    createdAt: string;
    email: string;
    expiresAt: string;
    id: string;
    role?: string | null;
    status: string;
    token: string;
}

export interface BulkInvitationError {
    email: string;
    error: string;
}

export interface BulkInvitationResponse {
    failedCount: number;
    failedInvitations: BulkInvitationError[];
    successfulCount: number;
    successfulInvitations: InvitationResponse[];
}

export interface UserSessionType {
    createdAt: string;
    deviceInfo?: string | null;
    ipAddress?: string | null;
    lastActivity: string;
    sessionId: string;
    userAgent?: string | null;
    userId: string;
}

export interface Enable2FAInput {
    code: string;
}

export interface TwoFASetupResponse {
    qrCodeUrl: string;
    secret: string;
}

export interface BackupCodesResponse {
    backupCodes: string[];
}

export interface UpdateUserInput {
    canDelegateAccess?: boolean | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
}

export interface UpdateOnboardingCompleteInput {
    onboardingComplete: boolean;
    userId?: string;
}

export interface SignupInput {
    companyName: string;
    email: string;
    firstName: string;
    gccId?: string | null;
    lastName: string;
    password: string;
    planId: string;
}

export interface OnboardingResponse {
    checkoutUrl?: string | null;
    companyId?: string | null;
    onboardingId: string;
    requiresPayment?: boolean;
    status?: string | null;
    stripeSessionId?: string | null;
}

export interface VerifyOnboardingInput {
    code: string;
    email: string;
}

export interface ResendFreeOnboardingOtpInput {
    email: string;
}

export interface UpdateCompanyInput {
    address?: string | null;
    city?: string | null;
    country?: string | null;
    description?: string | null;
    email?: string | null;
    industry?: string | null;
    logoUrl?: string | null;
    name?: string | null;
    phoneNumber?: string | null;
    postalCode?: string | null;
    size?: string | null;
    slug?: string | null;
    state?: string | null;
    themeColor?: string | null;
    website?: string | null;
}

export interface CompanyResponse {
    id: string;
    name: string;
    slug: string;
    status: string;
    tier: string;
    industry?: string | null;
    website?: string | null;
    description?: string | null;
    logo?: string | null;
    themeColor?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
    size?: string | null;
    currentEmployees: number;
    maxEmployees: number;
    createdAt: string;
    updatedAt: string;
}

export type { AppPermission, AppRole };
