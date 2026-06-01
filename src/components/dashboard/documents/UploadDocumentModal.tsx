'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { uploadEmployeeDocument, fetchDocumentCategories } from '@/features/documents/documents.actions';
import { fetchEmployeeDirectory } from '@/features/employee/employee.actions';
import { DocumentCategory } from '@/features/documents/documents.types';
import { EmployeeDirectoryEntry } from '@/features/employee/employee.types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSelect } from '@/components/ui/FormSelect';

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded?: () => void;
}

interface UploadDocumentFormValues {
  categoryId: string;
}

const UploadDocumentModal = ({ open, onOpenChange, onUploaded }: UploadDocumentModalProps) => {
  const { t } = useTranslation('document');
  const { control, setValue } = useForm<UploadDocumentFormValues>({
    defaultValues: {
      categoryId: '',
    },
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState(t('uploadDocumentModal.file.noFileChosen'));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeDirectoryEntry[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      const [employeeResult, categoryResult] = await Promise.all([
        fetchEmployeeDirectory(),
        fetchDocumentCategories(),
      ]);
      if (isMounted) {
        setEmployees(employeeResult);
        setCategories(categoryResult);
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        id: employee.id,
        label: `${employee.firstName} ${employee.lastName}`.trim(),
      })),
    [employees],
  );

  const visibleEmployeeOptions = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase();
    if (!query) {
      return employeeOptions.slice(0, 3);
    }
    return employeeOptions.filter((employee) => employee.label.toLowerCase().includes(query));
  }, [employeeOptions, employeeSearch]);

  const selectedEmployeeLabel = useMemo(
    () => employeeOptions.find((employee) => employee.id === selectedEmployeeId)?.label,
    [employeeOptions, selectedEmployeeId],
  );

  const handleEmployeeOpenChange = (open: boolean) => {
    setEmployeeOpen(open);
    if (!open) {
      setEmployeeSearch('');
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file?.name || t('uploadDocumentModal.file.noFileChosen'));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await uploadEmployeeDocument(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      form.reset();
      setFileName(t('uploadDocumentModal.file.noFileChosen'));
      setSelectedEmployeeId('');
      setSelectedCategoryId('');
      setValue('categoryId', '');
      onOpenChange(false);
      onUploaded?.();
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="text-2xl font-bold">{t('uploadDocumentModal.title')}</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-6 p-6 pt-2 pb-6">
            <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                {t('uploadDocumentModal.sections.documentInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">{t('uploadDocumentModal.fields.employee')}</Label>
                  <input type="hidden" name="ownerId" value={selectedEmployeeId} />
                  <Popover open={employeeOpen} onOpenChange={handleEmployeeOpenChange}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={employeeOpen}
                        disabled={isLoadingOptions}
                        className={cn(
                          'w-full justify-between font-normal h-10 px-4 rounded-[8px] bg-background border border-input',
                          !selectedEmployeeId && 'text-muted-foreground',
                        )}
                      >
                        {selectedEmployeeLabel || t('uploadDocumentModal.placeholders.selectEmployee')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder={t('uploadDocumentModal.placeholders.searchEmployee')}
                          value={employeeSearch}
                          onValueChange={setEmployeeSearch}
                        />
                        <CommandList className="max-h-[240px]">
                          <CommandEmpty>{t('uploadDocumentModal.empty.noEmployeeFound')}</CommandEmpty>
                          <CommandGroup>
                            {visibleEmployeeOptions.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.label}
                                onSelect={() => {
                                  setSelectedEmployeeId(employee.id);
                                  setEmployeeOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedEmployeeId === employee.id ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                {employee.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <input type="hidden" name="categoryId" value={selectedCategoryId} />
                <FormSelect
                  id="category"
                  label={t('uploadDocumentModal.fields.category')}
                  placeholder={t('uploadDocumentModal.placeholders.selectCategory')}
                  control={control}
                  name="categoryId"
                  options={categories.map((category) => ({ label: category.name, value: category.id }))}
                  t={t}
                  disabled={isLoadingOptions}
                  onChange={setSelectedCategoryId}
                  containerClassName="flex flex-col gap-2"
                />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="expiryDate" className="text-sm font-medium">
                    {t('uploadDocumentModal.fields.expiryDate')}
                  </Label>
                  <div className="relative">
                    <Input id="expiryDate" name="expiryDate" type="date" className="h-10 pl-10" />
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="file" className="text-sm font-medium">
                    {t('uploadDocumentModal.fields.selectFile')}
                  </Label>
                  <div className="relative">
                    <Input
                      ref={fileInputRef}
                      id="file"
                      name="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleChooseFile}
                      className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-background border rounded-md border-input ring-offset-background"
                    >
                      <span className="text-muted-foreground truncate">{fileName}</span>
                      <span className="text-foreground font-medium underline underline-offset-4">
                        {t('uploadDocumentModal.file.chooseFile')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          </div>

          <SheetFooter className="mt-4 px-6 pb-8 bg-transparent flex flex-row justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="min-w-[100px] border-primary text-primary hover:bg-primary/5 hover:text-primary"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[150px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending
                ? t('uploadDocumentModal.actions.uploading')
                : t('uploadDocumentModal.actions.uploadDocument')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default UploadDocumentModal;
