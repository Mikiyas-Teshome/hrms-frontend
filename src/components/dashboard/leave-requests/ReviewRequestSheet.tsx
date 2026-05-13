/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Sun, CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { LeaveRequest } from '@/types/leave-requests';
import RequestForChangeSheet from './RequestForChangeSheet';
import { useCancelLeaveRequest } from '@/features/leave-request/hooks/useLeaveRequest';
import { useToast } from '@/hooks/use-toast';

interface ReviewRequestSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: LeaveRequest | null;
}

const ReviewRequestSheet: React.FC<ReviewRequestSheetProps> = ({ open, onOpenChange, request }) => {
    const { t, i18n } = useTranslation('dashboard');
    const { toast } = useToast();
    const [isRequestChangeOpen, setIsRequestChangeOpen] = React.useState(false);
    const [isCancelling, setIsCancelling] = React.useState(false);
    const isRTL = i18n.language === 'ar';

    const { mutateAsync: cancelLeaveRequest } = useCancelLeaveRequest();

    const handleReject = async () => {
        if (!request?.id) return;
        setIsCancelling(true);
        try {
            await cancelLeaveRequest(request.id);
            toast({
                title: t('leaveRequests.review.cancelSuccess', 'Request rejected'),
                description: t(
                    'leaveRequests.review.cancelSuccessDesc',
                    'Leave request has been rejected/cancelled.',
                ),
                variant: 'success',
            });
            onOpenChange(false);
        } catch (error: any) {
            console.error('Failed to cancel leave request:', error);
            toast({
                title: t('leaveRequests.review.cancelError', 'Action failed'),
                description:
                    error?.message ||
                    t('leaveRequests.review.cancelErrorDesc', 'An unexpected error occurred.'),
                variant: 'destructive',
            });
        } finally {
            setIsCancelling(false);
        }
    };

    if (!request) return null;

    const renderStatusBadge = (status: LeaveRequest['status']) => {
        let Icon = CircleCheck;
        let iconClass = 'text-[#22C55E]';
        const label = status;

        if (status === 'Manager approved') {
            Icon = Sun;
            iconClass = 'text-[#D97706]';
        } else if (status === 'Pending') {
            Icon = Sun;
            iconClass = 'text-muted-foreground';
        } else if (status === 'Rejected') {
            Icon = CircleX;
            iconClass = 'text-[#EF4444]';
        }

        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit bg-background border border-border rounded-lg">
                <Icon className={cn('w-3 h-3', iconClass)} strokeWidth={1.5} />
                <span className="text-[12px] font-semibold text-foreground leading-4">{label}</span>
            </div>
        );
    };

    // Mock history data based on design
    const history = [
        { name: 'Paityn Botosh', role: 'Team manager', status: 'Approved' },
        { name: 'Maria Vaccaro', role: 'HR manager', status: 'Pending' },
        { name: 'Lydia Aminoff (you)', role: 'Admin', status: 'Pending' },
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRTL ? 'left' : 'right'}
                showCloseButton={false}
                className="w-full sm:max-w-200 p-0 flex flex-col h-full border-0 shadow-2xl bg-background focus:outline-none"
            >
                {/* Header matching Frame 122 */}
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
                    {/* Request Details Section */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                            <div className="bg-card-header-background h-12.5 px-6 flex items-center">
                                <h3 className="font-semibold text-sm text-foreground">
                                    {t('leaveRequests.review.detailsTitle', 'Request details')}
                                </h3>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Info Boxes matching Background+Border */}
                                    {[
                                        {
                                            label: t(
                                                'leaveRequests.review.requestedBy',
                                                'Requested by',
                                            ),
                                            value: request.employeeName,
                                        },
                                        {
                                            label: t(
                                                'leaveRequests.review.requestType',
                                                'Request type',
                                            ),
                                            value: request.requestType,
                                        },
                                        {
                                            label: t('leaveRequests.review.from', 'From'),
                                            value: request.leaveFrom,
                                        },
                                        {
                                            label: t('leaveRequests.review.to', 'To'),
                                            value: request.leaveTo,
                                        },
                                        {
                                            label: t(
                                                'leaveRequests.review.leaveBalance',
                                                'Leave balance',
                                            ),
                                            value: '15 days',
                                        }, // Mock balance
                                        {
                                            label: t('leaveRequests.review.status', 'Status'),
                                            value: renderStatusBadge(request.status),
                                            isComponent: true,
                                        },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="box-sizing-border-box flex flex-col items-start p-4 gap-3 border border-border rounded-lg min-h-19 w-full"
                                        >
                                            <span className="text-[12px] leading-4 text-muted-foreground font-normal">
                                                {item.label}
                                            </span>
                                            {item.isComponent ? (
                                                <div className="-mt-1.5">{item.value}</div>
                                            ) : (
                                                <span className="text-[14px] leading-none text-foreground font-medium">
                                                    {item.value as string}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {request.reason && (
                                    <div className="mt-3 box-sizing-border-box flex flex-col items-start p-4 gap-3 border border-border rounded-lg w-full">
                                        <span className="text-[12px] leading-4 text-muted-foreground font-normal">
                                            {t('leaveRequests.review.reason', 'Reason')}
                                        </span>
                                        <span className="text-[14px] leading-relaxed text-foreground font-medium wrap-break-word whitespace-pre-wrap">
                                            {request.reason}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Request History Section */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden mb-8">
                            <div className="bg-card-header-background h-12.5 px-6 flex items-center">
                                <h3 className="font-semibold text-sm text-foreground">
                                    {t('leaveRequests.review.historyTitle', 'Request history')}
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left rtl:text-right">
                                    <tbody>
                                        {history.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-border last:border-0 h-13.25"
                                            >
                                                <td className="px-6 py-2 text-sm text-foreground font-normal w-1/3">
                                                    {item.name}
                                                </td>
                                                <td className="px-2 py-2 text-sm text-foreground font-normal w-1/3">
                                                    {item.role}
                                                </td>
                                                <td className="px-2 py-2 w-1/3">
                                                    {renderStatusBadge(item.status as any)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer Section Component-wise */}
                    <div className="flex flex-row items-center justify-end gap-6 pt-4 pb-10 w-full">
                        <button
                            className="text-primary hover:text-primary/80 font-medium text-sm px-4 py-2"
                            onClick={() => {
                                onOpenChange(false);
                                setIsRequestChangeOpen(true);
                            }}
                        >
                            {t('leaveRequests.review.actions.requestChange', 'Request for change')}
                        </button>

                        <Button
                            variant="destructive"
                            className="h-9 min-w-25 px-4 font-medium rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
                            onClick={handleReject}
                            disabled={isCancelling}
                        >
                            {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('leaveRequests.review.actions.reject', 'Reject')}
                        </Button>

                        <Button
                            className="h-9 min-w-25 px-4 font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                            onClick={() => console.log('Approve')}
                        >
                            {t('leaveRequests.review.actions.approve', 'Approve')}
                        </Button>
                    </div>
                </div>
            </SheetContent>

            <RequestForChangeSheet
                open={isRequestChangeOpen}
                onOpenChange={setIsRequestChangeOpen}
                onBack={() => {
                    setIsRequestChangeOpen(false);
                    onOpenChange(true);
                }}
            />
        </Sheet>
    );
};

export default ReviewRequestSheet;
