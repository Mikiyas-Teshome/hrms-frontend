'use client';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { CircleMinus, Edit2, Plus, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface PayrollComponent {
    id: string;
    name: string;
    desc: string;
    enabled: boolean;
}

interface PayrollComponentsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialAllowances: PayrollComponent[];
    initialDeductions: PayrollComponent[];
    onSave: (data: { allowances: PayrollComponent[]; deductions: PayrollComponent[] }) => void;
}

export function PayrollComponentsModal({
    isOpen,
    onOpenChange,
    initialAllowances,
    initialDeductions,
    onSave,
}: PayrollComponentsModalProps) {
    const { t } = useTranslation('payrollComponentsModal');
    const [allowances, setAllowances] = useState<PayrollComponent[]>(initialAllowances);
    const [deductions, setDeductions] = useState<PayrollComponent[]>(initialDeductions);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', desc: '' });
    const [isAdding, setIsAdding] = useState<'allowance' | 'deduction' | null>(null);

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen && !prevIsOpen) {
        setPrevIsOpen(true);
        setAllowances(initialAllowances);
        setDeductions(initialDeductions);
        setEditingId(null);
        setIsAdding(null);
        setEditForm({ name: '', desc: '' });
    } else if (!isOpen && prevIsOpen) {
        setPrevIsOpen(false);
    }

    const handleToggle = (id: string, type: 'allowance' | 'deduction') => {
        const setter = type === 'allowance' ? setAllowances : setDeductions;
        const list = type === 'allowance' ? allowances : deductions;
        setter(list.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
    };

    const handleEdit = (item: PayrollComponent) => {
        setEditingId(item.id);
        setEditForm({ name: item.name, desc: item.desc });
        setIsAdding(null);
    };

    const handleSaveEdit = (type: 'allowance' | 'deduction') => {
        const setter = type === 'allowance' ? setAllowances : setDeductions;
        const list = type === 'allowance' ? allowances : deductions;

        if (editingId) {
            setter(list.map((item) => (item.id === editingId ? { ...item, ...editForm } : item)));
        } else if (isAdding) {
            const newItem: PayrollComponent = {
                id: `comp-${allowances.length + deductions.length}-${editForm.name.toLowerCase().replace(/\s+/g, '-')}`,
                ...editForm,
                enabled: true,
            };
            setter([...list, newItem]);
        }

        setEditingId(null);
        setIsAdding(null);
        setEditForm({ name: '', desc: '' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setIsAdding(null);
        setEditForm({ name: '', desc: '' });
    };

    const renderComponentList = (list: PayrollComponent[], type: 'allowance' | 'deduction') => (
        <div className="space-y-4">
            {list.map((item) => (
                <div key={item.id}>
                    {editingId === item.id ? (
                        <div className="rounded-2xl border bg-muted/30 p-5 space-y-5">
                            <div className="space-y-2.5">
                                <Label className="text-xs font-bold text-foreground block rtl:text-end">
                                    {t('form.title')}
                                </Label>
                                <Input
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, name: e.target.value })
                                    }
                                    placeholder={t('form.titlePlaceholder')}
                                    className="h-11 rounded-xl bg-background text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-xs font-bold text-foreground block rtl:text-end">
                                    {t('form.rule')}
                                </Label>
                                <Input
                                    value={editForm.desc}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, desc: e.target.value })
                                    }
                                    placeholder={t('form.rulePlaceholder')}
                                    className="h-11 rounded-xl bg-background text-sm font-medium"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 rtl:flex-row-reverse">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="h-10 px-6 rounded-xl border-border/60"
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(type)}
                                    className="h-10 px-8 rounded-xl bg-primary hover:bg-primary/90"
                                >
                                    {t('save')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-2xl border border-border/60 p-5 hover:bg-muted/30 transition-colors rtl:flex-row-reverse">
                            <div className="flex items-center gap-4 rtl:flex-row-reverse">
                                <Checkbox
                                    checked={item.enabled}
                                    onCheckedChange={() => handleToggle(item.id, type)}
                                    className="size-5 rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <div className="rtl:text-end">
                                    <p
                                        className={cn(
                                            'text-[15px] font-bold text-foreground',
                                            !item.enabled &&
                                                'text-muted-foreground line-through opacity-70',
                                        )}
                                    >
                                        {item.name}
                                    </p>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                className="size-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
                            >
                                <Edit2 className="size-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            ))}
            {isAdding === type && (
                <div className="rounded-2xl border bg-muted/30 p-5 space-y-5">
                    <div className="space-y-2.5">
                        <Label className="text-xs font-bold text-foreground block rtl:text-end">
                            {t('form.title')}
                        </Label>
                        <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder={t('form.titlePlaceholder')}
                            className="h-11 rounded-xl bg-background text-sm font-medium"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <Label className="text-xs font-bold text-foreground block rtl:text-end">
                            {t('form.rule')}
                        </Label>
                        <Input
                            value={editForm.desc}
                            onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                            placeholder={t('form.rulePlaceholder')}
                            className="h-11 rounded-xl bg-background text-sm font-medium"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2 rtl:flex-row-reverse">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="h-10 px-6 rounded-xl border-border/60"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleSaveEdit(type)}
                            className="h-10 px-8 rounded-xl bg-primary hover:bg-primary/90"
                        >
                            {t('save')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl gap-0 p-0 overflow-hidden sm:rounded-[2rem] border border-border shadow-2xl">
                <DialogHeader className="flex flex-row items-center justify-between px-8 py-6 rtl:flex-row-reverse space-y-0">
                    <DialogTitle className="text-lg font-bold text-foreground rtl:text-end">
                        {t('title')}
                    </DialogTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-auto gap-2 p-0 text-sm font-bold text-primary hover:bg-transparent hover:text-primary/80"
                            >
                                <Plus className="size-4" />
                                {t('addComponent')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-40 rounded-xl border border-border p-1"
                        >
                            <DropdownMenuItem
                                onClick={() => setIsAdding('allowance')}
                                className="h-9 gap-2 rounded-md px-2 text-sm text-foreground"
                            >
                                <Wallet className="size-4 text-muted-foreground" />
                                {t('allowances')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsAdding('deduction')}
                                className="h-9 gap-2 rounded-md px-2 text-sm text-foreground"
                            >
                                <CircleMinus className="size-4 text-muted-foreground" />
                                {t('deductions')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </DialogHeader>

                <Separator className="bg-muted" />

                <div className="grid min-h-112.5 grid-cols-1 divide-y overflow-y-auto scrollbar-hide md:grid-cols-2 md:divide-x md:divide-y-0 rtl:md:divide-x-reverse max-h-[60vh]">
                    <div className="p-8 space-y-6">
                        <h3 className="text-sm font-bold text-muted-foreground rtl:text-end uppercase tracking-widest">
                            {t('allowances')}
                        </h3>
                        {renderComponentList(allowances, 'allowance')}
                    </div>

                    <div className="p-8 space-y-6">
                        <h3 className="text-sm font-bold text-muted-foreground rtl:text-end uppercase tracking-widest">
                            {t('deductions')}
                        </h3>
                        {renderComponentList(deductions, 'deduction')}
                    </div>
                </div>

                <Separator className="bg-muted" />

                <div className="flex items-center justify-between px-8 py-6 rtl:flex-row-reverse bg-background">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-11 px-8 text-sm font-bold rounded-xl border-border/60 hover:bg-muted"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            onSave({ allowances, deductions });
                            onOpenChange(false);
                        }}
                        className="h-11 px-12 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90"
                    >
                        {t('save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
