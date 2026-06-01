'use client';

import { useState, useRef, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SAMPLE_NOTIFICATIONS, type Notification } from '@/data/notifications';

type Tab = 'all' | 'read' | 'unread';

interface NotificationPanelProps {
    open: boolean;
    onClose: () => void;
    align?: 'left' | 'right';
}

export function NotificationPanel({ open, onClose, align = 'right' }: NotificationPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const filtered = notifications.filter((n) => {
        if (activeTab === 'read') return n.read;
        if (activeTab === 'unread') return !n.read;
        return true;
    });

    const handleRefresh = () => {
        // TODO: refetch from API
        setNotifications([...SAMPLE_NOTIFICATIONS]);
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((item) => (item.id === id ? { ...item, read: true } : item))
        );
    };

    const TABS: { id: Tab; label: string; count?: number }[] = [
        { id: 'all', label: 'All', count: notifications.length },
        { id: 'read', label: 'Read' },
        { id: 'unread', label: 'Unread' },
    ];

    return (
        <div
            ref={panelRef}
            className={cn(
                'absolute top-[calc(100%+14px)] z-50 flex flex-col',
                'w-[372px] max-h-[668px]',
                'bg-background border border-border/60',
                'shadow-[0px_0px_10px_rgba(0,0,0,0.12)] rounded-xl',
                'animate-in fade-in-0 slide-in-from-top-2 duration-150',
                align === 'right' ? 'right-0' : 'left-0'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-0">
                <h2 className="text-lg font-bold text-foreground leading-8">Notifications</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={handleRefresh}
                >
                    <RefreshCcw className="h-5 w-5" strokeWidth={1.33} />
                </Button>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-3">
                <div className="flex items-center gap-0.5 bg-muted p-[3px] rounded-[10px]">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all',
                                activeTab === tab.id
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span
                                    className={cn(
                                        'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[11px] font-semibold leading-none',
                                        activeTab === tab.id
                                            ? 'bg-foreground text-background'
                                            : 'bg-transparent text-muted-foreground'
                                    )}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification list */}
            <div className="flex flex-col gap-1.5 px-4 py-3 overflow-y-auto max-h-[544px] scrollbar-none">
                {filtered.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    filtered.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={cn(
                                'flex flex-col gap-2 p-3 rounded-[10px] border border-border cursor-pointer transition-colors',
                                !n.read
                                    ? 'bg-muted/60 hover:bg-muted'
                                    : 'bg-background hover:bg-muted/30'
                            )}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-foreground leading-4 line-clamp-1">
                                    {n.title}
                                </span>
                                <p className="text-xs text-muted-foreground leading-4 line-clamp-2">
                                    {n.body}
                                </p>
                            </div>
                            <span
                                className={cn(
                                    'text-xs leading-4',
                                    !n.read ? 'text-foreground/70 font-medium' : 'text-muted-foreground'
                                )}
                            >
                                {n.time}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
