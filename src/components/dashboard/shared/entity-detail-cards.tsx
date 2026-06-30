'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DetailSectionCardProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  delayClassName?: string;
};

export function DetailSectionCard({
  title,
  children,
  action,
  className,
  delayClassName = 'duration-300',
}: DetailSectionCardProps) {
  return (
    <div
      className={cn(
        'border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-2',
        delayClassName,
        className,
      )}
    >
      <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{title}</h3>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-6 bg-white dark:bg-zinc-950/40">{children}</div>
    </div>
  );
}

type DetailFieldProps = {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function DetailField({ label, value, children, className }: DetailFieldProps) {
  return (
    <div
      className={cn(
        'border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200',
        className,
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
        {children ?? (value !== undefined && value !== null && value !== '' ? value : '—')}
      </div>
    </div>
  );
}

type DetailFieldGridProps = {
  children: ReactNode;
  columns?: 1 | 2;
};

export function DetailFieldGrid({ children, columns = 2 }: DetailFieldGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
      )}
    >
      {children}
    </div>
  );
}
