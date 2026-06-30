'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import {
  useLeaveRequestsByEmployee,
  useCancelLeaveRequest,
  useRespondLeaveAmendment,
} from '@/features/leave-request/hooks/useLeaveRequest';
import CreateLeaveRequestSheet from '@/components/dashboard/leave-requests/CreateLeaveRequestSheet';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { LeaveRequestDisplayStatus } from '@/types/leave-requests';
import { LeaveRequestStatusBadge } from './leave-request-status-badge';
import { Skeleton } from '@/components/ui/skeleton';

export function MyLeaveRequestsTable() {
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('leave_requests:create');
  const canCancel = hasPermission('leave_requests:cancel');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: employeeProfile } = useMyEmployeeProfile();
  const { data: leaveRequests = [], isLoading } = useLeaveRequestsByEmployee(
    employeeProfile?.id ?? '',
  );
  const { mutateAsync: cancelLeaveRequest, isPending: isCancelling } = useCancelLeaveRequest();
  const { mutateAsync: respondAmendment, isPending: isRespondingAmendment } = useRespondLeaveAmendment();

  const handleCancel = async (id: string) => {
    try {
      await cancelLeaveRequest(id);
      toast({
        title: t('leaveRequests.cancelSuccess', 'Request cancelled'),
        variant: 'success',
      });
    } catch {
      toast({
        title: t('leaveRequests.errorTitle', 'Error'),
        description: t('leaveRequests.cancelError', 'Failed to cancel request'),
        variant: 'destructive',
      });
    }
  };

  const handleAmendmentDecision = async (
    amendmentId: string,
    decision: 'accepted' | 'rejected',
  ) => {
    try {
      await respondAmendment({ amendmentId, decision });
      toast({
        title:
          decision === 'accepted'
            ? t('leaveRequests.amendment.acceptSuccess', 'Change accepted')
            : t('leaveRequests.amendment.rejectSuccess', 'Change rejected'),
        variant: 'success',
      });
    } catch {
      toast({
        title: t('leaveRequests.errorTitle', 'Error'),
        description: t('leaveRequests.amendment.actionError', 'Failed to update amendment'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 gap-3">
      <div className="flex flex-row justify-between items-center pb-6">
        <h2
          className="text-2xl font-semibold leading-8 text-foreground tracking-[-0.4px]"
          style={{ letterSpacing: '-0.4px' }}
        >
          {t('employeeDashboard.myLeaveRequests', 'My leave requests')}
        </h2>
        {canCreate && (
          <Button
            variant="ghost"
            className="h-9 px-4 text-sm font-medium text-foreground bg-[#EFF3FA] dark:bg-muted hover:bg-[#dde8f5] dark:hover:bg-muted/80 rounded-lg min-w-[100px]"
            onClick={() => setIsCreateOpen(true)}
          >
            {t('employeeDashboard.requestLeave', 'Request leave')}
          </Button>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-hidden flex-1">
        <div className="flex flex-row bg-[#F5F5F5] dark:bg-muted/40 border-b border-border">
          <div className="flex flex-1 items-center px-2 h-10">
            <span className="text-sm font-medium text-foreground">
              {t('employeeDashboard.leaveFrom', 'Leave from')}
            </span>
          </div>
          <div className="flex flex-1 items-center px-2 h-10">
            <span className="text-sm font-medium text-foreground">
              {t('employeeDashboard.leaveTo', 'Leave to')}
            </span>
          </div>
          <div className="flex w-[146px] items-center px-2 h-10 shrink-0">
            <span className="text-sm font-medium text-foreground">
              {t('leaveRequests.table.status', 'Status')}
            </span>
          </div>
          <div className="flex w-[79px] items-center justify-center px-2 h-10 shrink-0" />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-4 flex-1 rounded-md" />
                <Skeleton className="h-4 flex-1 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            {t('employeeDashboard.noLeaveRequests', 'No leave requests yet')}
          </div>
        ) : (
          leaveRequests.map((row) => (
            <div key={row.id} className="border-b border-border last:border-0">
              <div className="flex flex-row hover:bg-muted/30 transition-colors">
                <div className="flex flex-1 items-center px-2 h-[53px]">
                  <span className="text-sm font-normal text-foreground">
                    {new Date(row.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-1 items-center px-2 h-[53px]">
                  <span className="text-sm font-normal text-foreground">
                    {new Date(row.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex w-[146px] items-center px-2 h-[53px] shrink-0">
                  <LeaveRequestStatusBadge status={row.displayStatus as LeaveRequestDisplayStatus} />
                </div>
                <div className="flex w-[79px] items-center justify-center px-2 h-[53px] shrink-0">
                  {canCancel && (row.status === 'pending' || row.displayStatus === 'Pending') ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive/90"
                      disabled={isCancelling}
                      onClick={() => handleCancel(row.id)}
                    >
                      {t('leaveRequests.cancel', 'Cancel')}
                    </Button>
                  ) : null}
                </div>
              </div>
              {row.hasPendingAmendment && (
                <div className="px-2 pb-3 text-xs text-muted-foreground space-y-2">
                  <div>
                    {t('leaveRequests.amendment.proposedDates', 'Proposed dates')}:{' '}
                    {row.pendingAmendmentProposedStart
                      ? new Date(row.pendingAmendmentProposedStart).toLocaleDateString()
                      : '-'}{' '}
                    -{' '}
                    {row.pendingAmendmentProposedEnd
                      ? new Date(row.pendingAmendmentProposedEnd).toLocaleDateString()
                      : '-'}
                  </div>
                  {row.pendingAmendmentComment && (
                    <div>
                      {t('leaveRequests.amendment.comment', 'Comment')}: {row.pendingAmendmentComment}
                    </div>
                  )}
                  {row.pendingAmendmentId && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-primary border-primary/30 hover:text-primary/90"
                        disabled={isRespondingAmendment}
                        onClick={() =>
                          handleAmendmentDecision(row.pendingAmendmentId!, 'accepted')
                        }
                      >
                        {t('leaveRequests.amendment.accept', 'Accept')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-destructive border-destructive/30 hover:text-destructive/90"
                        disabled={isRespondingAmendment}
                        onClick={() =>
                          handleAmendmentDecision(row.pendingAmendmentId!, 'rejected')
                        }
                      >
                        {t('leaveRequests.amendment.reject', 'Reject')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <div className="h-px bg-border" />
            </div>
          ))
        )}
      </div>

      <CreateLeaveRequestSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
