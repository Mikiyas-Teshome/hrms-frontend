'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, differenceInSeconds } from 'date-fns';
import { CirclePlay, CircleStop, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
    useAttendanceRecords,
    useClockIn,
    useClockOut,
} from '@/features/attendance/hooks/useAttendance';
import type { ClockOutInput } from '@/features/attendance/attendance.types';

export function AttendanceClock() {
    const { t } = useTranslation('dashboard');
    const { user } = useAuth();
    const { toast } = useToast();

    const [currentTime, setCurrentTime] = useState(new Date());
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const { data: attendanceRecords, refetch: refetchAttendance } = useAttendanceRecords(
        user?.id || '',
        todayStr,
        todayStr,
    );

    const { mutate: doClockIn, isPending: isClockingIn } = useClockIn();
    const { mutate: doClockOut, isPending: isClockingOut } = useClockOut();

    const currentRecord = attendanceRecords?.[0];
    const isClockedIn = !!currentRecord?.clockIn && !currentRecord?.clockOut;
    const hasFinishedDay = !!currentRecord?.clockIn && !!currentRecord?.clockOut;

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate elapsed time as derived state from currentTime
    const elapsedTime = React.useMemo(() => {
        const clockIn = currentRecord?.clockIn;
        const clockOut = currentRecord?.clockOut;

        if (clockIn && !clockOut) {
            const start = new Date(clockIn);
            const diff = differenceInSeconds(currentTime, start);

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;

            return `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return '00:00:00';
    }, [currentRecord?.clockIn, currentRecord?.clockOut, currentTime]);

    const handleClockAction = () => {
        if (isClockedIn) {
            if (!currentRecord?.id) return;
            const clockOutInput: ClockOutInput = {
                recordId: currentRecord.id,
                clockOut: new Date().toISOString(),
            };
            doClockOut(clockOutInput, {
                onSuccess: () => {
                    toast({
                        title: t('attendance.clockOutSuccess', 'Clocked Out'),
                        description: t('attendance.clockOutDesc', 'You have successfully clocked out.'),
                        variant: 'success',
                    });
                    refetchAttendance();
                },
                onError: (err: any) => {
                    toast({
                        title: t('common.error', 'Error'),
                        description: err.message || 'Failed to clock out',
                        variant: 'destructive',
                    });
                },
            });
        } else {
            const clockInInput = {
                userId: user?.id || '',
                date: new Date().toISOString(),
                clockIn: new Date().toISOString(),
            };
            doClockIn(clockInInput, {
                onSuccess: () => {
                    toast({
                        title: t('attendance.clockInSuccess', 'Clocked In'),
                        description: t('attendance.clockInDesc', 'You have successfully clocked in.'),
                        variant: 'success',
                    });
                    refetchAttendance();
                },
                onError: (err: any) => {
                    toast({
                        title: t('common.error', 'Error'),
                        description: err.message || 'Failed to clock in',
                        variant: 'destructive',
                    });
                },
            });
        }
    };

    // For finished day: show total worked time from totalMinutes field
    const finishedTime = hasFinishedDay && currentRecord?.totalMinutes
        ? (() => {
              const h = Math.floor(currentRecord.totalMinutes / 60);
              const m = currentRecord.totalMinutes % 60;
              return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          })()
        : null;

    const displayTime = hasFinishedDay && finishedTime
        ? finishedTime
        : isClockedIn
          ? elapsedTime
          : format(currentTime, 'h:mm a');
    const displayDateLabel = hasFinishedDay
        ? t('attendance.totalTime', 'Total time')
        : isClockedIn
          ? t('attendance.totalTime', 'Total time')
          : format(currentTime, 'MMM d, yyyy');

    return (
        <div className="flex items-center justify-center p-1.5 px-3 gap-3 bg-[#136DEC]/12  dark:bg-sidebar rounded-[12px] h-12 min-w-[218px] transition-all">
            <div className="flex flex-col items-start gap-0.5 min-w-[72px]">
                <span className="text-[14px] font-bold text-foreground leading-tight font-albert-sans">
                    {displayTime}
                </span>
                <span className="text-[12px] font-normal text-[#64748B] dark:text-[#F5F5F580] leading-tight font-albert-sans">
                    {displayDateLabel}
                </span>
            </div>

            <Button
                onClick={handleClockAction}
                disabled={isClockingIn || isClockingOut || hasFinishedDay}
                className={cn(
                    "flex items-center justify-center gap-2 h-9 px-4 rounded-[8px] border-none font-medium text-[14px] font-albert-sans transition-all",
                    isClockedIn 
                        ? "bg-[#DC2626] hover:bg-[#DC2626]/90 text-[#FEF2F2] border border-[#EF4444]"
                        : "bg-brand-600 text-[#FAFAFA]"
                )}
            >
                {isClockingIn || isClockingOut ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : isClockedIn ? (
                    <>
                        <CircleStop className="size-4 text-[#FEF2F2]" strokeWidth={2} />
                        <span>{t('attendance.clockOut', 'Clock Out')}</span>
                    </>
                ) : hasFinishedDay ? (
                    <>
                        <span>{t('attendance.finished', 'Finished')}</span>
                    </>
                ) : (
                    <>
                        <CirclePlay className="size-4 text-[#FAFAFA]" strokeWidth={2} />
                        <span>{t('attendance.clockIn', 'Clock In')}</span>
                    </>
                )}
            </Button>
        </div>
    );
}
