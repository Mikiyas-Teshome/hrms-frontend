'use client';

import { CircleCheck, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaveRequestDisplayStatus } from '@/types/leave-requests';

export function LeaveRequestStatusBadge({ status }: { status: LeaveRequestDisplayStatus }) {
  const isApproved = status === 'Approved';
  const isIntermediate = status === 'HR approved' || status === 'Manager approved';

  return (
    <div
      className={cn(
        'flex flex-row items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold w-fit',
        'bg-card border-border text-foreground',
      )}
    >
      {isApproved ? (
        <CircleCheck className="w-3 h-3 text-[#22C55E]" strokeWidth={1.25} />
      ) : isIntermediate ? (
        <Loader className="w-3 h-3 text-[#D97706]" strokeWidth={1.25} />
      ) : (
        <Loader className="w-3 h-3 text-foreground" strokeWidth={1.25} />
      )}
      <span>{status}</span>
    </div>
  );
}
