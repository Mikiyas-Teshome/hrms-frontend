'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Sun, CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { LeaveRequest } from '@/types/leave-requests';
import { useToast } from '@/hooks/use-toast';
import { useActOnApproval } from '@/features/approval/hooks/useApproval';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useLeaveRequestReview } from '@/features/leave-request/hooks/useLeaveRequest';
import { useRequestLeaveAmendment } from '@/features/leave-request/hooks/useLeaveRequest';
import { formatLeaveDuration } from './leave-request.util';
import RequestForChangeSheet from './RequestForChangeSheet';
import { format } from 'date-fns';

interface ReviewRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LeaveRequest | null;
}

const APPROVER_ROLE_LABELS: Record<string, string> = {
  line_manager: 'Line manager',
  dept_manager: 'Department manager',
  hr: 'HR',
};

const ReviewRequestSheet: React.FC<ReviewRequestSheetProps> = ({ open, onOpenChange, request }) => {
  const { t, i18n } = useTranslation('dashboard');
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { hasPermission } = usePermissions();
  const [isActing, setIsActing] = React.useState(false);
  const [isRequestChangeOpen, setIsRequestChangeOpen] = React.useState(false);
  const isRTL = i18n.language === 'ar';

  const canApprovePermission = hasPermission('leave_requests:approve');

  const { data: review, isLoading: isReviewLoading } = useLeaveRequestReview(
    request?.id ?? '',
    open && !!request?.id,
  );
  const { mutateAsync: actOnApproval } = useActOnApproval();
  const { mutateAsync: requestAmendment, isPending: isAmending } = useRequestLeaveAmendment();

  const pendingApproval = (review?.approvals ?? []).find(
    (approval) => approval.status?.toLowerCase() === 'pending',
  );
  const showApprovalActions =
    canApprovePermission && Boolean(review?.canCurrentUserApprove) && Boolean(review?.canApprove);
  const hasPendingAmendment = (review?.amendments ?? []).some(
    (amendment) => amendment.status === 'pending',
  );

  const handleApprovalAction = async (status: 'approved' | 'rejected') => {
    if (!review?.id || !profile?.id) return;
    setIsActing(true);
    try {
      await actOnApproval({
        requestId: review.id,
        approverId: profile.id,
        approverRole: pendingApproval?.approverRole ?? 'hr',
        status,
      });
      toast({
        title:
          status === 'approved'
            ? t('leaveRequests.review.approveSuccess', 'Request approved')
            : t('leaveRequests.review.rejectSuccess', 'Request rejected'),
        variant: 'success',
      });
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('leaveRequests.review.actionErrorDesc');
      toast({
        title: t('leaveRequests.review.actionError', 'Action failed'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsActing(false);
    }
  };

  const handleRequestChangeSend = async (values: {
    acceptedFrom: Date;
    acceptedTo: Date;
    comment: string;
  }) => {
    if (!review?.id) return;
    try {
      await requestAmendment({
        requestId: review.id,
        proposedStart: format(values.acceptedFrom, 'yyyy-MM-dd'),
        proposedEnd: format(values.acceptedTo, 'yyyy-MM-dd'),
        comment: values.comment,
      });
      toast({
        title: t('leaveRequests.review.requestChangeSent', 'Request for change sent'),
        variant: 'success',
      });
      setIsRequestChangeOpen(false);
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('leaveRequests.review.actionErrorDesc');
      toast({
        title: t('leaveRequests.review.actionError', 'Action failed'),
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (!request) return null;

  const displayStatus = review?.displayStatus ?? request.status;
  const employeeName = review?.employeeName ?? request.employeeName;
  const requestType = review?.leavePolicyName ?? request.requestType;
  const duration =
    review != null
      ? formatLeaveDuration(review.startDate, review.endDate, review.totalDays, i18n.language)
      : request.duration;
  const reason = review?.reason ?? request.reason;
  const snapshot = review?.leaveBalanceSnapshot;

  const renderStatusBadge = (status: string) => {
    let Icon = CircleCheck;
    let iconClass = 'text-[#22C55E]';

    if (status === 'Manager approved' || status === 'HR approved') {
      Icon = Sun;
      iconClass = 'text-[#D97706]';
    } else if (status === 'Pending' || status === 'pending') {
      Icon = Sun;
      iconClass = 'text-muted-foreground';
    } else if (status === 'Changes requested' || status === 'changes_requested') {
      Icon = Sun;
      iconClass = 'text-[#D97706]';
    } else if (status === 'Rejected' || status === 'rejected') {
      Icon = CircleX;
      iconClass = 'text-[#EF4444]';
    }

    const label =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');

    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit bg-background border border-border rounded-lg">
        <Icon className={cn('w-3 h-3', iconClass)} strokeWidth={1.5} />
        <span className="text-[12px] font-semibold text-foreground leading-4">{label}</span>
      </div>
    );
  };

  const approvalRows = (review?.approvals ?? []).map((approval) => ({
    role: APPROVER_ROLE_LABELS[approval.approverRole] ?? approval.approverRole,
    status:
      approval.status.charAt(0).toUpperCase() + approval.status.slice(1).toLowerCase(),
  }));

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={isRTL ? 'left' : 'right'}
          showCloseButton={false}
          className="w-full sm:max-w-200 p-0 flex flex-col h-full border-0 shadow-2xl bg-background focus:outline-none"
        >
          <SheetHeader className="px-10 py-6">
            <div className="flex flex-row items-center justify-between">
              <SheetTitle className="text-2xl font-bold text-foreground leading-8">
                {t('leaveRequests.review.title', 'Review request')}
              </SheetTitle>
              <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-foreground/80 h-9 w-11 flex justify-center items-center">
                <X className="h-5 w-5" strokeWidth={1.33} />
              </SheetClose>
            </div>
          </SheetHeader>

          <Separator className="bg-border" />

          <div className="flex-1 overflow-y-auto no-scrollbar px-10 py-6 space-y-8">
            {isReviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-foreground">{employeeName}</p>
                  {review?.employeeJobTitle && (
                    <p className="text-sm text-muted-foreground">{review.employeeJobTitle}</p>
                  )}
                  {review?.employeeDepartment && (
                    <p className="text-sm text-muted-foreground">{review.employeeDepartment}</p>
                  )}
                </div>

                <div className="bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                  <div className="bg-card-header-background h-12.5 px-6 flex items-center">
                    <h3 className="font-semibold text-sm text-foreground">
                      {t('leaveRequests.review.detailsTitle', 'Request details')}
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          label: t('leaveRequests.review.requestType', 'Leave type'),
                          value: requestType,
                        },
                        {
                          label: t('leaveRequests.review.duration', 'Duration'),
                          value: duration,
                        },
                        {
                          label: t('leaveRequests.review.status', 'Status'),
                          value: renderStatusBadge(displayStatus),
                          isComponent: true,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-start p-4 gap-3 border border-border rounded-lg w-full"
                        >
                          <span className="text-[12px] leading-4 text-muted-foreground font-normal">
                            {item.label}
                          </span>
                          {item.isComponent ? (
                            <div>{item.value}</div>
                          ) : (
                            <span className="text-[14px] leading-none text-foreground font-medium">
                              {item.value as string}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {reason && (
                      <div className="mt-3 flex flex-col items-start p-4 gap-3 border border-border rounded-lg w-full">
                        <span className="text-[12px] leading-4 text-muted-foreground font-normal">
                          {t('leaveRequests.review.reason', 'Reason')}
                        </span>
                        <span className="text-[14px] leading-relaxed text-foreground font-medium">
                          {reason}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {snapshot && (
                  <div className="bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                    <div className="bg-card-header-background h-12.5 px-6 flex items-center">
                      <h3 className="font-semibold text-sm text-foreground">
                        {t('leaveRequests.review.leaveSummary', 'Leave summary')}
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          label: t('leaveRequests.review.totalBalance', 'Total balance'),
                          value: snapshot.allocatedDays + snapshot.carriedForwardDays,
                        },
                        {
                          label: t('leaveRequests.review.usedBalance', 'Used balance'),
                          value: snapshot.usedDays,
                        },
                        {
                          label: t('leaveRequests.review.remainingBalance', 'Remaining balance'),
                          value: snapshot.remainingDays,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex flex-col items-start p-4 gap-2 border border-border rounded-lg"
                        >
                          <span className="text-[12px] text-muted-foreground">{item.label}</span>
                          <span className="text-[14px] font-semibold text-foreground">
                            {item.value}{' '}
                            {item.value === 1
                              ? t('leaveRequests.review.day', 'day')
                              : t('leaveRequests.review.days', 'days')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {approvalRows.length > 0 && (
                  <div className="bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                    <div className="bg-card-header-background h-12.5 px-6 flex items-center">
                      <h3 className="font-semibold text-sm text-foreground">
                        {t('leaveRequests.review.approvalStatus', 'Approval status')}
                      </h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {approvalRows.map((row, index) => (
                        <div
                          key={index}
                          className="flex flex-row items-center justify-between border border-border rounded-lg px-4 py-3"
                        >
                          <span className="text-sm font-medium text-foreground">{row.role}</span>
                          {renderStatusBadge(row.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(review?.attachments?.length ?? 0) > 0 && (
                  <div className="bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                    <div className="bg-card-header-background h-12.5 px-6 flex items-center">
                      <h3 className="font-semibold text-sm text-foreground">
                        {t('leaveRequests.review.attachments', 'Attachments')}
                      </h3>
                    </div>
                    <div className="p-6 space-y-2">
                      {review?.attachments?.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm text-primary underline underline-offset-2"
                        >
                          {attachment.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {(review?.amendments?.length ?? 0) > 0 && (
                  <div className="bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                    <div className="bg-card-header-background h-12.5 px-6 flex items-center">
                      <h3 className="font-semibold text-sm text-foreground">
                        {t('leaveRequests.review.amendments', 'Amendments')}
                      </h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {review?.amendments?.map((amendment) => (
                        <div key={amendment.id} className="border border-border rounded-lg p-3 space-y-2">
                          <div className="text-sm text-foreground font-medium">{amendment.status}</div>
                          <div className="text-xs text-muted-foreground">{new Date(amendment.proposedStart).toLocaleDateString()} - {new Date(amendment.proposedEnd).toLocaleDateString()}</div>
                          <div className="text-sm text-foreground">{amendment.comment}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {showApprovalActions && (
            <div className="flex flex-row items-center justify-end gap-4 pt-4 pb-10 px-10 w-full border-t border-border">
              <button
                type="button"
                className="text-primary hover:text-primary/80 font-medium text-sm px-4 py-2"
                disabled={hasPendingAmendment}
                onClick={() => {
                  if (hasPendingAmendment) return;
                  onOpenChange(false);
                  setIsRequestChangeOpen(true);
                }}
              >
                {t('leaveRequests.review.actions.requestChange', 'Request for change')}
              </button>

              <Button
                variant="destructive"
                className="h-9 min-w-25 px-4 font-medium rounded-lg"
                onClick={() => handleApprovalAction('rejected')}
                disabled={isActing || isReviewLoading}
              >
                {isActing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('leaveRequests.review.actions.reject', 'Reject')}
              </Button>

              <Button
                className="h-9 min-w-25 px-4 font-medium rounded-lg"
                onClick={() => handleApprovalAction('approved')}
                disabled={isActing || isReviewLoading}
              >
                {isActing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('leaveRequests.review.actions.approve', 'Approve')}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <RequestForChangeSheet
        open={isRequestChangeOpen}
        onOpenChange={setIsRequestChangeOpen}
        onBack={() => {
          setIsRequestChangeOpen(false);
          onOpenChange(true);
        }}
        onSubmit={handleRequestChangeSend}
        isSubmitting={isAmending}
      />
    </>
  );
};

export default ReviewRequestSheet;
