'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { useDashboardQuickSearch } from '@/components/dashboard/layout/use-dashboard-quick-search';

type DashboardQuickSearchProps = {
    isRTL?: boolean;
    className?: string;
};

export function DashboardQuickSearch({ isRTL = false, className }: DashboardQuickSearchProps) {
    const { t } = useTranslation('dashboard');
    const router = useRouter();
    const { groupedItems, isReady } = useDashboardQuickSearch();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleSelect = React.useCallback(
        (url: string) => {
            setOpen(false);
            setQuery('');
            router.push(url);
        },
        [router],
    );

    const handleQueryChange = React.useCallback((value: string) => {
        setQuery(value);
        setOpen(true);
    }, []);

    const isTargetInsideSearch = React.useCallback((target: EventTarget | null) => {
        if (!(target instanceof Node)) {
            return false;
        }

        return !!containerRef.current?.contains(target);
    }, []);

    return (
        <Command
            shouldFilter
            loop
            value={query}
            onValueChange={handleQueryChange}
            filter={(value, search, keywords) => {
                if (!search.trim()) {
                    return 1;
                }

                const haystack = [value, ...(keywords ?? [])].join(' ').toLowerCase();
                return haystack.includes(search.toLowerCase()) ? 1 : 0;
            }}
            className="overflow-visible bg-transparent"
        >
            <Popover open={open} onOpenChange={setOpen} modal={false}>
                <PopoverAnchor asChild>
                    <div ref={containerRef} className={cn('relative w-87.5', className)}>
                        <Search
                            className={cn(
                                'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none',
                                isRTL ? 'right-3' : 'left-3',
                            )}
                            strokeWidth={1.33}
                        />
                        <CommandPrimitive.Input
                            disabled={!isReady}
                            placeholder={t('header.searchPlaceholder')}
                            aria-label={t('header.searchPlaceholder')}
                            aria-expanded={open}
                            aria-controls="dashboard-quick-search-list"
                            role="combobox"
                            onFocus={() => setOpen(true)}
                            onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                    event.preventDefault();
                                    setOpen(false);
                                }
                            }}
                            className={cn(
                                'flex h-9 w-full rounded-lg border border-border bg-background text-foreground shadow-xs text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
                                isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3',
                            )}
                        />
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    side="bottom"
                    align={isRTL ? 'end' : 'start'}
                    sideOffset={6}
                    className="z-100 w-87.5 overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-md"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onCloseAutoFocus={(event) => event.preventDefault()}
                    onPointerDownOutside={(event) => {
                        if (isTargetInsideSearch(event.target)) {
                            event.preventDefault();
                        }
                    }}
                    onInteractOutside={(event) => {
                        if (isTargetInsideSearch(event.target)) {
                            event.preventDefault();
                        }
                    }}
                >
                    <CommandList id="dashboard-quick-search-list" className="max-h-72">
                        <CommandEmpty className="py-6 text-sm text-muted-foreground">
                            {t('header.quickSearchEmpty')}
                        </CommandEmpty>
                        {groupedItems.map(({ group, items }) => (
                            <CommandGroup key={group} heading={group}>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.title}
                                        keywords={item.searchValue.split(' ')}
                                        onSelect={() => handleSelect(item.url)}
                                        className="cursor-pointer px-3 py-2"
                                    >
                                        {item.icon ? (
                                            <item.icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground rtl:ml-2 rtl:mr-0" />
                                        ) : null}
                                        <span>{item.title}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </PopoverContent>
            </Popover>
        </Command>
    );
}
