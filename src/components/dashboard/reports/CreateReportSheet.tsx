'use client';

import React, { useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/FormSelect';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import { useCreateCustomReport, useCustomReportFilterOptions } from '@/features/reports/reports.hooks';
import {
  CreateCustomReportInput,
  CustomReportAggregation,
  CustomReportChartConfigInput,
  CustomReportDataSource,
  CustomReportDimension,
  CustomReportField,
  CustomReportMeasure,
  CustomReportTimeGrain,
  CustomReportVisualization,
} from '@/features/reports/reports.types';
import { buildDefaultChartConfig } from '@/features/reports/reports.utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface CreateReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const sanitizeOuId = (value: string): string | undefined =>
  value === 'all' || !value ? undefined : value;

const normalizeDataSourceValue = (value: string): CustomReportDataSource =>
  value.toLowerCase() as CustomReportDataSource;

const normalizeFieldValue = (value: string): CustomReportField =>
  value.toLowerCase() as CustomReportField;

const TablePreview = () => (
  <svg width="56" height="46" viewBox="0 0 56 46" fill="none" aria-hidden>
    <rect x="0.5" y="0.5" width="55" height="45" rx="2" className="fill-muted stroke-border" />
    <rect x="3" y="3" width="50" height="7" rx="1" className="fill-border" />
    <rect x="3" y="12" width="50" height="5" rx="1" className="fill-border/50" />
    <rect x="3" y="19" width="50" height="5" rx="1" className="fill-border/50" />
    <rect x="3" y="26" width="50" height="5" rx="1" className="fill-border/50" />
    <rect x="3" y="33" width="50" height="5" rx="1" className="fill-border/50" />
    <line x1="21" y1="3" x2="21" y2="38" className="stroke-border" strokeWidth="0.5" />
    <line x1="38" y1="3" x2="38" y2="38" className="stroke-border" strokeWidth="0.5" />
  </svg>
);

const PiePreview = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
    <path d="M28 28 L28 4 A24 24 0 0 1 50.4 40 Z" fill="#EA580C" />
    <path d="M28 28 L50.4 40 A24 24 0 0 1 9 47.6 Z" fill="#F59E0B" />
    <path d="M28 28 L9 47.6 A24 24 0 0 1 6.2 14.8 Z" fill="#164E63" />
    <path d="M28 28 L6.2 14.8 A24 24 0 0 1 28 4 Z" fill="#0D9488" />
    <circle cx="28" cy="28" r="9" className="fill-card" />
  </svg>
);

const LinePreview = () => (
  <svg width="64" height="46" viewBox="0 0 64 46" fill="none" aria-hidden>
    <defs>
      <linearGradient id="custom-report-lg1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="custom-report-lg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M4 36 Q16 10 24 22 Q32 34 42 12 Q50 4 60 18 L60 46 L4 46 Z" fill="url(#custom-report-lg1)" />
    <path
      d="M4 36 Q16 10 24 22 Q32 34 42 12 Q50 4 60 18"
      stroke="#22C55E"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M4 40 Q18 28 28 32 Q40 36 52 24 Q57 20 60 26 L60 46 L4 46 Z" fill="url(#custom-report-lg2)" />
    <path
      d="M4 40 Q18 28 28 32 Q40 36 52 24 Q57 20 60 26"
      stroke="#F97316"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const BarPreview = () => (
  <svg width="64" height="50" viewBox="0 0 64 50" fill="none" aria-hidden>
    <rect x="3" y="22" width="10" height="26" rx="2" fill="#EA580C" />
    <rect x="15" y="8" width="10" height="40" rx="2" fill="#EA580C" />
    <rect x="27" y="16" width="10" height="32" rx="2" fill="#EA580C" />
    <rect x="39" y="4" width="10" height="44" rx="2" fill="#EA580C" />
    <rect x="51" y="14" width="10" height="34" rx="2" fill="#EA580C" />
  </svg>
);

const VISUALIZATIONS: {
  value: CustomReportVisualization;
  label: string;
  Preview: () => React.JSX.Element;
}[] = [
  { value: 'table', label: 'Table', Preview: TablePreview },
  { value: 'pie', label: 'Pie chart', Preview: PiePreview },
  { value: 'line', label: 'Line chart', Preview: LinePreview },
  { value: 'bar', label: 'Bar chart', Preview: BarPreview },
];

const CreateReportSheet = ({ open, onOpenChange, onCreated }: CreateReportSheetProps) => {
  const { t, i18n } = useTranslation(['dashboard']);
  const { toast } = useToast();
  const createMutation = useCreateCustomReport();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataSource, setDataSource] = useState<CustomReportDataSource>('employees');
  const [selectedFields, setSelectedFields] = useState<CustomReportField[]>(['name', 'department']);
  const [visualization, setVisualization] = useState<CustomReportVisualization>('table');
  const [chartConfig, setChartConfig] = useState<CustomReportChartConfigInput | undefined>(undefined);
  const [selectedCompanyOuId, setSelectedCompanyOuId] = useState('all');
  const [divisionOuId, setDivisionOuId] = useState('all');
  const [subDivisionOuId, setSubDivisionOuId] = useState('all');
  const [departmentOuId, setDepartmentOuId] = useState('all');
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [employeeType, setEmployeeType] = useState('all');
  const [payrollRunId, setPayrollRunId] = useState('');

  const { canSelectCompany, derivedCompanyOuId, companiesData, isLoadingCompanies } = useLeaveCompanyOuId();

  const effectiveCompanyOuId = useMemo(() => {
    if (!canSelectCompany) {
      return derivedCompanyOuId || undefined;
    }
    return selectedCompanyOuId === 'all' ? undefined : selectedCompanyOuId;
  }, [canSelectCompany, derivedCompanyOuId, selectedCompanyOuId]);

  const { data: filterOptions } = useCustomReportFilterOptions(effectiveCompanyOuId);

  const activeDataSource = useMemo(
    () =>
      filterOptions?.dataSources.find(
        (item) => normalizeDataSourceValue(item.value) === normalizeDataSourceValue(dataSource),
      ),
    [filterOptions?.dataSources, dataSource],
  );

  const availableFields = useMemo(
    () =>
      activeDataSource?.fields.map((field) => ({
        ...field,
        value: normalizeFieldValue(field.value),
      })) ?? [],
    [activeDataSource],
  );

  const chartOptions = activeDataSource?.chartOptions;

  const categoricalDimensions = useMemo(
    () => chartOptions?.dimensions.filter((item) => item.value !== 'date') ?? [],
    [chartOptions],
  );

  const resolvedChartConfig = useMemo(() => {
    if (visualization === 'table') {
      return undefined;
    }
    return chartConfig ?? buildDefaultChartConfig(chartOptions, visualization);
  }, [visualization, chartConfig, chartOptions]);

  const selectedMeasureOption = useMemo(
    () => chartOptions?.measures.find((item) => item.value === resolvedChartConfig?.measure),
    [chartOptions, resolvedChartConfig?.measure],
  );

  const availableFieldValues = useMemo(
    () => availableFields.map((field) => field.value),
    [availableFields],
  );
  const [trackedFieldSource, setTrackedFieldSource] = useState('');

  const fieldSourceKey = `${dataSource}:${availableFieldValues.join(',')}`;

  if (availableFieldValues.length && fieldSourceKey !== trackedFieldSource) {
    setTrackedFieldSource(fieldSourceKey);
    setSelectedFields((prev) => {
      const allowed = new Set(availableFieldValues);
      const next = prev.filter((field) => allowed.has(field));
      return next.length ? next : [availableFieldValues[0]];
    });
  }

  const defaultPayrollRunId = filterOptions?.payPeriods?.[0]?.id ?? '';
  const payPeriodsKey = filterOptions?.payPeriods?.map((period) => period.id).join(',') ?? '';
  const [trackedPayPeriodsKey, setTrackedPayPeriodsKey] = useState('');

  if (payPeriodsKey && payPeriodsKey !== trackedPayPeriodsKey) {
    setTrackedPayPeriodsKey(payPeriodsKey);
    setPayrollRunId((prev) => prev || defaultPayrollRunId);
  }

  const cascadedDivisions = useMemo(() => {
    if (!filterOptions?.divisions) return [];
    if (!effectiveCompanyOuId) return filterOptions.divisions;
    return filterOptions.divisions.filter((division) => division.parentId === effectiveCompanyOuId);
  }, [filterOptions, effectiveCompanyOuId]);

  const cascadedSubDivisions = useMemo(() => {
    if (!filterOptions?.subDivisions) return [];
    if (divisionOuId !== 'all') {
      return filterOptions.subDivisions.filter((sub) => sub.parentId === divisionOuId);
    }
    if (effectiveCompanyOuId) {
      const divisionIds = new Set(cascadedDivisions.map((division) => division.id));
      return filterOptions.subDivisions.filter(
        (sub) => sub.parentId && divisionIds.has(sub.parentId),
      );
    }
    return filterOptions.subDivisions;
  }, [filterOptions, divisionOuId, effectiveCompanyOuId, cascadedDivisions]);

  const cascadedDepartments = useMemo(() => {
    if (!filterOptions?.departments) return [];
    if (subDivisionOuId !== 'all') {
      return filterOptions.departments.filter((dept) => dept.parentId === subDivisionOuId);
    }
    if (divisionOuId !== 'all' || effectiveCompanyOuId) {
      const subIds = new Set(cascadedSubDivisions.map((sub) => sub.id));
      return filterOptions.departments.filter(
        (dept) => dept.parentId && subIds.has(dept.parentId),
      );
    }
    return filterOptions.departments;
  }, [filterOptions, subDivisionOuId, divisionOuId, effectiveCompanyOuId, cascadedSubDivisions]);

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyOuId(value);
    setDivisionOuId('all');
    setSubDivisionOuId('all');
    setDepartmentOuId('all');
  };

  const handleDivisionChange = (value: string) => {
    setDivisionOuId(value);
    setSubDivisionOuId('all');
    setDepartmentOuId('all');
  };

  const handleSubDivisionChange = (value: string) => {
    setSubDivisionOuId(value);
    setDepartmentOuId('all');
  };

  const handleDataSourceChange = (value: string) => {
    const nextSource = normalizeDataSourceValue(value);
    setDataSource(nextSource);
    setChartConfig(undefined);
    setVisualization((prev) => {
      if (prev === 'line' && nextSource !== 'attendance' && nextSource !== 'leave') {
        return 'bar';
      }
      return prev;
    });
  };

  const handleVisualizationChange = (next: CustomReportVisualization) => {
    setVisualization(next);
    setChartConfig(undefined);
  };

  const handleMeasureChange = (measure: CustomReportMeasure) => {
    const measureOption = chartOptions?.measures.find((item) => item.value === measure);
    if (!measureOption || !resolvedChartConfig) {
      return;
    }
    setChartConfig({
      ...resolvedChartConfig,
      measure,
      aggregation: measureOption.defaultAggregation,
    });
  };

  const toggleField = (field: CustomReportField, checked: boolean) => {
    setSelectedFields((prev) => {
      if (checked) {
        return prev.includes(field) ? prev : [...prev, field];
      }
      return prev.filter((item) => item !== field);
    });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDataSource('employees');
    setSelectedFields(['name', 'department']);
    setVisualization('table');
    setChartConfig(undefined);
    setSelectedCompanyOuId('all');
    setDivisionOuId('all');
    setSubDivisionOuId('all');
    setDepartmentOuId('all');
    setEmployeeType('all');
    setDateFrom(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setDateTo(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    setPayrollRunId(filterOptions?.payPeriods?.[0]?.id ?? '');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: t('reports.create.toast.nameRequired', 'Report name is required') });
      return;
    }
    if (!selectedFields.length) {
      toast({ variant: 'destructive', title: t('reports.create.toast.fieldRequired', 'Select at least one report field') });
      return;
    }

    if (visualization !== 'table' && !resolvedChartConfig) {
      toast({
        variant: 'destructive',
        title: t('reports.create.toast.chartConfigRequired', 'Configure the chart setup'),
      });
      return;
    }

    if (
      visualization === 'line' &&
      (dataSource === 'attendance' || dataSource === 'leave') &&
      (!dateFrom || !dateTo)
    ) {
      toast({
        variant: 'destructive',
        title: t('reports.create.toast.dateRangeRequired', 'Date range is required for line charts'),
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        dataSource,
        fields: selectedFields,
        visualization,
        chartConfig: visualization === 'table' ? undefined : resolvedChartConfig,
        filters: {
          companyOuId: canSelectCompany ? sanitizeOuId(selectedCompanyOuId) : undefined,
          divisionOuId: sanitizeOuId(divisionOuId),
          subDivisionOuId: sanitizeOuId(subDivisionOuId),
          departmentOuId: sanitizeOuId(departmentOuId),
          dateFrom: dataSource === 'attendance' || dataSource === 'leave' ? dateFrom : undefined,
          dateTo: dataSource === 'attendance' || dataSource === 'leave' ? dateTo : undefined,
          employeeType: employeeType === 'all' ? undefined : (employeeType as CreateCustomReportInput['filters']['employeeType']),
          payrollRunId: dataSource === 'payroll' ? payrollRunId : undefined,
        },
      });
      toast({ title: t('reports.create.toast.created', 'Custom report created') });
      resetForm();
      onOpenChange(false);
      onCreated?.();
    } catch {
      toast({
        variant: 'destructive',
        title: t('reports.create.toast.failed', 'Failed to create report'),
        description: t('reports.create.toast.checkFilters', 'Check filters and try again.'),
      });
    }
  };

  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
          {open ? (
          <SheetContent side={i18n.dir() === 'rtl' ? 'left' : 'right'} className="w-full sm:max-w-[800px] overflow-y-auto p-0 border-none ltr:rounded-l-xl rtl:rounded-r-xl">
              <div className="flex flex-col px-4 sm:px-10 py-6 gap-6 font-['Albert_Sans'] bg-background min-h-full">
                  <SheetHeader className="p-0 text-start">
                      <SheetTitle className="text-[24px] font-bold text-foreground font-['Albert_Sans']">{t('reports.create.title', 'Create a custom report')}</SheetTitle>
                      <SheetDescription className="hidden">
                          {t('reports.create.description', 'Configure the data source, filters, fields, and visualization for your report.')}
                      </SheetDescription>
                  </SheetHeader>

                  <div className="h-px bg-border w-full" />

                  <div className="flex flex-col gap-8">
                      <div className="bg-card border border-border shadow-sm rounded-[12px] flex flex-col pb-4 gap-4 overflow-hidden">
                          <div className="bg-muted h-[50px] px-4 sm:px-6 flex items-center">
                              <h3 className="text-[14px] font-semibold text-foreground">{t('reports.create.basicInfo', 'Basic info')}</h3>
                          </div>
                          <div className="px-4 sm:px-6 flex flex-col gap-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="flex flex-col gap-3">
                                      <Label htmlFor="reportName" className="font-medium text-foreground text-[14px]">{t('reports.create.reportName', 'Report name')}</Label>
                                      <Input
                                          id="reportName"
                                          className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal"
                                          value={name}
                                          onChange={(event) => setName(event.target.value)}
                                      />
                                  </div>
                                  <div className="flex flex-col gap-3">
                                      <Label htmlFor="dataSource" className="font-medium text-foreground text-[14px]">{t('reports.create.dataSource', 'Data source')}</Label>
                                      <FormSelect
                                          id="dataSource"
                                          value={dataSource}
                                          onChange={handleDataSourceChange}
                                          options={(filterOptions?.dataSources ?? []).map(source => ({
                                              label: source.label,
                                              value: normalizeDataSourceValue(source.value),
                                          }))}
                                          placeholder={t('reports.create.selectDataSource', 'Select data source')}
                                          className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground data-[value]:text-foreground"
                                      />
                                  </div>
                              </div>
                              <div className="flex flex-col gap-3">
                                  <Label htmlFor="description" className="font-medium text-foreground text-[14px]">{t('reports.create.descriptionLabel', 'Description')}</Label>
                                  <Textarea
                                      id="description"
                                      placeholder={t('reports.create.addDescription', 'Add description')}
                                      className="bg-background min-h-[64px] border-border shadow-sm rounded-[8px] text-[14px] px-3 py-3 resize-none font-normal placeholder:text-muted-foreground"
                                      value={description}
                                      onChange={(event) => setDescription(event.target.value)}
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="bg-card border border-border shadow-sm rounded-[12px] flex flex-col pb-4 gap-4 overflow-hidden">
                          <div className="bg-muted h-[50px] px-4 sm:px-6 flex items-center">
                              <h3 className="text-[14px] font-semibold text-foreground">{t('reports.create.filters', 'Filters')}</h3>
                          </div>
                          <div className="px-4 sm:px-6 flex flex-col gap-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                  {canSelectCompany && (
                                      <div className="flex flex-col gap-3">
                                          <Label htmlFor="custom-report-company" className="font-medium text-foreground text-[14px]">
                                              {t('reports.create.company', 'Company')}
                                          </Label>
                                          <FormSelect
                                              id="custom-report-company"
                                              value={selectedCompanyOuId}
                                              onChange={handleCompanyChange}
                                              placeholder={
                                                  isLoadingCompanies
                                                      ? t('reports.create.loadingCompanies', 'Loading companies...')
                                                      : t('reports.create.allCompanies', 'All companies')
                                              }
                                              options={[
                                                  {
                                                      label: t('reports.create.allCompanies', 'All companies'),
                                                      value: 'all',
                                                  },
                                                  ...(companiesData?.map((company) => ({
                                                      label: company.name,
                                                      value: company.id,
                                                  })) ?? []),
                                              ]}
                                              className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground data-[value]:text-foreground"
                                          />
                                      </div>
                                  )}
                                  <div className="flex flex-col gap-3">
                                      <Label htmlFor="division" className="font-medium text-foreground text-[14px]">
                                          {t('reports.create.division', 'Division')}
                                      </Label>
                                      <FormSelect
                                          id="division"
                                          value={divisionOuId}
                                          onChange={handleDivisionChange}
                                          placeholder={t('reports.create.allDivisions', 'All divisions')}
                                          options={[
                                              {
                                                  label: t('reports.create.allDivisions', 'All divisions'),
                                                  value: 'all',
                                              },
                                              ...cascadedDivisions.map((division) => ({
                                                  label: division.name,
                                                  value: division.id,
                                              })),
                                          ]}
                                          className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground data-[value]:text-foreground"
                                      />
                                  </div>
                                  <div className="flex flex-col gap-3">
                                      <Label htmlFor="subdivision" className="font-medium text-foreground text-[14px]">
                                          {t('reports.create.subDivision', 'Sub-division')}
                                      </Label>
                                      <FormSelect
                                          id="subdivision"
                                          value={subDivisionOuId}
                                          onChange={handleSubDivisionChange}
                                          placeholder={t('reports.create.allSubDivisions', 'All sub-divisions')}
                                          options={[
                                              {
                                                  label: t('reports.create.allSubDivisions', 'All sub-divisions'),
                                                  value: 'all',
                                              },
                                              ...cascadedSubDivisions.map((subDivision) => ({
                                                  label: subDivision.name,
                                                  value: subDivision.id,
                                              })),
                                          ]}
                                          className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground data-[value]:text-foreground"
                                      />
                                  </div>
                                  <div className="flex flex-col gap-3">
                                      <Label htmlFor="department" className="font-medium text-foreground text-[14px]">
                                          {t('reports.create.department', 'Department')}
                                      </Label>
                                      <FormSelect
                                          id="department"
                                          value={departmentOuId}
                                          onChange={setDepartmentOuId}
                                          placeholder={t('reports.create.allDepartments', 'All departments')}
                                          options={[
                                              {
                                                  label: t('reports.create.allDepartments', 'All departments'),
                                                  value: 'all',
                                              },
                                              ...cascadedDepartments.map((department) => ({
                                                  label: department.name,
                                                  value: department.id,
                                              })),
                                          ]}
                                          className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground data-[value]:text-foreground"
                                      />
                                  </div>

                                  {(dataSource === 'attendance' || dataSource === 'leave') && (
                                      <>
                                          <div className="flex flex-col gap-3">
                                              <Label htmlFor="dateFrom" className="font-medium text-foreground text-[14px]">{t('reports.create.dateFrom', 'Date from')}</Label>
                                              <Input
                                                  id="dateFrom"
                                                  type="date"
                                                  className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground"
                                                  value={dateFrom}
                                                  onChange={(event) => setDateFrom(event.target.value)}
                                              />
                                          </div>
                                          <div className="flex flex-col gap-3">
                                              <Label htmlFor="dateTo" className="font-medium text-foreground text-[14px]">{t('reports.create.dateTo', 'Date to')}</Label>
                                              <Input
                                                  id="dateTo"
                                                  type="date"
                                                  className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground"
                                                  value={dateTo}
                                                  onChange={(event) => setDateTo(event.target.value)}
                                              />
                                          </div>
                                      </>
                                  )}
                                  {dataSource === 'payroll' && (
                                      <div className="flex flex-col gap-3">
                                          <Label className="font-medium text-foreground text-[14px]">{t('reports.create.payPeriod', 'Pay period')}</Label>
                                          <FormSelect
                                              id="payrollRunId"
                                              value={payrollRunId}
                                              onChange={setPayrollRunId}
                                              placeholder={t('reports.create.selectPayPeriod', 'Select pay period')}
                                              options={(filterOptions?.payPeriods ?? []).map(p => ({ label: p.label, value: p.id }))}
                                              className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground data-[value]:text-foreground"
                                          />
                                      </div>
                                  )}
                                  <div className="flex flex-col gap-3">
                                      <Label htmlFor="empType" className="font-medium text-foreground text-[14px]">{t('reports.create.employeeType', 'Employee type')}</Label>
                                      <FormSelect
                                          id="empType"
                                          value={employeeType}
                                          onChange={setEmployeeType}
                                          placeholder={t('reports.create.all', 'All')}
                                          options={[
                                              { label: t('reports.create.all', 'All'), value: 'all' },
                                              { label: t('reports.create.empTypes.fullTime', 'Full time'), value: 'full_time' },
                                              { label: t('reports.create.empTypes.partTime', 'Part time'), value: 'part_time' },
                                              { label: t('reports.create.empTypes.contract', 'Contract'), value: 'contract' },
                                              { label: t('reports.create.empTypes.intern', 'Intern'), value: 'intern' },
                                              { label: t('reports.create.empTypes.consultant', 'Consultant'), value: 'consultant' },
                                          ]}
                                          className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal text-muted-foreground data-[value]:text-foreground"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-card border border-border shadow-sm rounded-[12px] flex flex-col pb-4 gap-4 overflow-hidden">
                          <div className="bg-muted h-[50px] px-4 sm:px-6 flex items-center">
                              <h3 className="text-[14px] font-semibold text-foreground">{t('reports.create.reportFields', 'Report fields')}</h3>
                          </div>
                          <div className="px-4 sm:px-6 py-1">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4">
                                  {availableFields.map((field) => (
                                      <div key={field.value} className="flex items-center gap-3">
                                          <Checkbox
                                              id={`field-${field.value}`}
                                              checked={selectedFields.includes(field.value)}
                                              onCheckedChange={(checked) =>
                                                  toggleField(field.value, checked === true)
                                              }
                                              className="border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground shadow-sm rounded h-4 w-4"
                                          />
                                          <Label
                                              htmlFor={`field-${field.value}`}
                                              className="text-[14px] font-medium text-foreground cursor-pointer"
                                          >
                                              {field.label}
                                          </Label>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="bg-card border border-border shadow-sm rounded-[12px] flex flex-col pb-4 gap-4 overflow-hidden">
                          <div className="bg-muted h-[50px] px-4 sm:px-6 flex items-center">
                              <h3 className="text-[14px] font-semibold text-foreground">{t('reports.create.visualization', 'Visualization')}</h3>
                          </div>
                          <div className="px-4 sm:px-6 flex flex-col gap-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" role="radiogroup" aria-label="Visualization">
                                  {VISUALIZATIONS.map((item) => {
                                      const selected = visualization === item.value;
                                      const inputId = `viz-${item.value}`;
                                      const Preview = item.Preview;
                                      const lineUnsupported =
                                          item.value === 'line' &&
                                          dataSource !== 'attendance' &&
                                          dataSource !== 'leave';

                                      return (
                                          <div
                                              key={item.value}
                                              className={`flex items-center justify-between rounded-[5px] border ltr:pl-4 ltr:pr-6 rtl:pr-4 rtl:pl-6 h-[100px] w-full ${
                                                  selected
                                                      ? 'border-primary bg-card'
                                                      : 'border-border bg-card'
                                              } ${lineUnsupported ? 'opacity-50' : ''}`}
                                          >
                                              <div className="flex items-center gap-3">
                                                  <Checkbox
                                                      id={inputId}
                                                      checked={selected}
                                                      disabled={lineUnsupported}
                                                      onCheckedChange={() => handleVisualizationChange(item.value)}
                                                      className={
                                                          selected
                                                              ? 'data-[state=checked]:bg-primary data-[state=checked]:border-primary border-border rounded-[4px] h-4 w-4'
                                                              : 'border-border shadow-sm rounded-[4px] h-4 w-4'
                                                      }
                                                  />
                                                  <Label
                                                      htmlFor={inputId}
                                                      className="text-[14px] font-medium text-foreground cursor-pointer"
                                                  >
                                                      {t(`reports.create.visualizations.${item.value}`, item.label)}
                                                  </Label>
                                              </div>
                                              <div className="flex items-center justify-center">
                                                  <Preview />
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>

                      {visualization !== 'table' && resolvedChartConfig && chartOptions ? (
                          <div className="bg-card border border-border shadow-sm rounded-[12px] flex flex-col pb-4 gap-4 overflow-hidden">
                              <div className="bg-muted h-[50px] px-4 sm:px-6 flex items-center">
                                  <h3 className="text-[14px] font-semibold text-foreground">
                                      {t('reports.create.chartSetup', 'Chart setup')}
                                  </h3>
                              </div>
                              <div className="px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                  {visualization !== 'line' ? (
                                      <div className="flex flex-col gap-3">
                                          <Label className="font-medium text-foreground text-[14px]">
                                              {t('reports.create.groupBy', 'Group by')}
                                          </Label>
                                          <FormSelect
                                              id="chart-group-by"
                                              value={resolvedChartConfig.groupBy}
                                              onChange={(value) =>
                                                  setChartConfig((prev) => {
                                                      const base =
                                                          prev ??
                                                          buildDefaultChartConfig(chartOptions, visualization);
                                                      return base
                                                          ? { ...base, groupBy: value as CustomReportDimension }
                                                          : prev;
                                                  })
                                              }
                                              options={categoricalDimensions.map((item) => ({
                                                  label: item.label,
                                                  value: item.value,
                                              }))}
                                              className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal"
                                          />
                                      </div>
                                  ) : (
                                      <div className="flex flex-col gap-3">
                                          <Label className="font-medium text-foreground text-[14px]">
                                              {t('reports.create.timeGrain', 'Time grain')}
                                          </Label>
                                          <FormSelect
                                              id="chart-time-grain"
                                              value={resolvedChartConfig.timeGrain ?? 'week'}
                                              onChange={(value) =>
                                                  setChartConfig((prev) => {
                                                      const base =
                                                          prev ??
                                                          buildDefaultChartConfig(chartOptions, visualization);
                                                      return base
                                                          ? {
                                                                ...base,
                                                                groupBy: 'date',
                                                                timeGrain: value as CustomReportTimeGrain,
                                                            }
                                                          : prev;
                                                  })
                                              }
                                              options={[
                                                  { label: t('reports.create.timeGrains.day', 'Day'), value: 'day' },
                                                  { label: t('reports.create.timeGrains.week', 'Week'), value: 'week' },
                                                  { label: t('reports.create.timeGrains.month', 'Month'), value: 'month' },
                                              ]}
                                              className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal"
                                          />
                                      </div>
                                  )}

                                  <div className="flex flex-col gap-3">
                                      <Label className="font-medium text-foreground text-[14px]">
                                          {t('reports.create.measure', 'Measure')}
                                      </Label>
                                      <FormSelect
                                          id="chart-measure"
                                          value={resolvedChartConfig.measure}
                                          onChange={(value) => handleMeasureChange(value as CustomReportMeasure)}
                                          options={chartOptions.measures.map((item) => ({
                                              label: item.label,
                                              value: item.value,
                                          }))}
                                          className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal"
                                      />
                                  </div>

                                  <div className="flex flex-col gap-3">
                                      <Label className="font-medium text-foreground text-[14px]">
                                          {t('reports.create.aggregation', 'Aggregation')}
                                      </Label>
                                      <FormSelect
                                          id="chart-aggregation"
                                          value={resolvedChartConfig.aggregation}
                                          onChange={(value) =>
                                              setChartConfig((prev) => {
                                                  const base =
                                                      prev ??
                                                      buildDefaultChartConfig(chartOptions, visualization);
                                                  return base
                                                      ? { ...base, aggregation: value as CustomReportAggregation }
                                                      : prev;
                                              })
                                          }
                                          options={(selectedMeasureOption?.allowedAggregations ?? []).map((item) => ({
                                              label: t(`reports.create.aggregations.${item}`, item),
                                              value: item,
                                          }))}
                                          className="bg-background h-[36px] border-border shadow-sm rounded-[8px] text-[14px] px-3 font-normal"
                                      />
                                  </div>
                              </div>
                          </div>
                      ) : null}
                  </div>

                  <div className="mt-2 mb-2 flex flex-row justify-end gap-3">
                      <Button
                          variant="outline"
                          onClick={() => onOpenChange(false)}
                          className="h-[36px] min-w-[44px] px-3 border border-border text-foreground hover:bg-muted rounded-[8px] text-[14px] font-medium"
                      >
                          {t('reports.create.cancel', 'Cancel')}
                      </Button>
                      <Button
                          className="h-[36px] px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-[8px] text-[14px] font-medium border-none shadow-none"
                          onClick={handleCreate}
                          disabled={createMutation.isPending}
                      >
                          {t('reports.create.submit', 'Create report')}
                      </Button>
                  </div>
              </div>
          </SheetContent>
          ) : null}
      </Sheet>
  );
};

export default CreateReportSheet;
