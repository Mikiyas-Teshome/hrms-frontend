'use client';

import React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';

interface CreateReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Inline SVG chart previews
const TablePreview = () => (
  <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
    <rect x="0.5" y="0.5" width="55" height="45" rx="2" fill="#F8F9FA" stroke="#E5E7EB"/>
    <rect x="3" y="3" width="50" height="7" rx="1" fill="#E2E8F0"/>
    <rect x="3" y="12" width="50" height="5" rx="1" fill="#F1F5F9"/>
    <rect x="3" y="19" width="50" height="5" rx="1" fill="#F1F5F9"/>
    <rect x="3" y="26" width="50" height="5" rx="1" fill="#F1F5F9"/>
    <rect x="3" y="33" width="50" height="5" rx="1" fill="#F1F5F9"/>
    <line x1="21" y1="3" x2="21" y2="38" stroke="#E5E7EB" strokeWidth="0.5"/>
    <line x1="38" y1="3" x2="38" y2="38" stroke="#E5E7EB" strokeWidth="0.5"/>
  </svg>
);

const PiePreview = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <path d="M28 28 L28 4 A24 24 0 0 1 50.4 40 Z" fill="#EA580C"/>
    <path d="M28 28 L50.4 40 A24 24 0 0 1 9 47.6 Z" fill="#F59E0B"/>
    <path d="M28 28 L9 47.6 A24 24 0 0 1 6.2 14.8 Z" fill="#0F172A"/>
    <path d="M28 28 L6.2 14.8 A24 24 0 0 1 28 4 Z" fill="#0D9488"/>
    <circle cx="28" cy="28" r="9" fill="white"/>
  </svg>
);

const LinePreview = () => (
  <svg width="64" height="46" viewBox="0 0 64 46" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35"/>
        <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F97316" stopOpacity="0.25"/>
        <stop offset="100%" stopColor="#F97316" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <path d="M4 36 Q16 10 24 22 Q32 34 42 12 Q50 4 60 18 L60 46 L4 46 Z" fill="url(#lg1)"/>
    <path d="M4 36 Q16 10 24 22 Q32 34 42 12 Q50 4 60 18" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M4 40 Q18 28 28 32 Q40 36 52 24 Q57 20 60 26 L60 46 L4 46 Z" fill="url(#lg2)"/>
    <path d="M4 40 Q18 28 28 32 Q40 36 52 24 Q57 20 60 26" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const BarPreview = () => (
  <svg width="64" height="50" viewBox="0 0 64 50" fill="none">
    <rect x="3" y="22" width="10" height="26" rx="2" fill="#EA580C"/>
    <rect x="15" y="8" width="10" height="40" rx="2" fill="#EA580C"/>
    <rect x="27" y="16" width="10" height="32" rx="2" fill="#EA580C"/>
    <rect x="39" y="4" width="10" height="44" rx="2" fill="#EA580C"/>
    <rect x="51" y="14" width="10" height="34" rx="2" fill="#EA580C"/>
  </svg>
);

const CreateReportSheet = ({ open, onOpenChange }: CreateReportSheetProps) => {
  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent className="sm:max-w-150 overflow-y-auto p-0">
              <SheetHeader className="p-6 pb-2">
                  <SheetTitle className="text-2xl font-bold">Create a custom report</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 p-6 pt-4 pb-0">
                  {/* Basic info */}
                  <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
                      <h3 className="text-sm font-semibold text-foreground">Basic info</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                              <Label htmlFor="reportName">Report name</Label>
                              <Input id="reportName" className="bg-background h-10" />
                          </div>
                          <div className="flex flex-col gap-2">
                              <Label htmlFor="dataSource">Data source</Label>
                              <Select defaultValue="identification">
                                  <SelectTrigger id="dataSource" className="bg-background h-10">
                                      <SelectValue placeholder="Identification" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="identification">Identification</SelectItem>
                                      <SelectItem value="payroll">Payroll</SelectItem>
                                      <SelectItem value="leave">Leave</SelectItem>
                                      <SelectItem value="employees">Employees</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                      <div className="flex flex-col gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                              id="description"
                              placeholder="Add description"
                              className="bg-background min-h-22.5 resize-none"
                          />
                      </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
                      <h3 className="text-sm font-semibold text-foreground">Filters</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                              <Label htmlFor="level">Level</Label>
                              <Select defaultValue="company">
                                  <SelectTrigger id="level" className="bg-background h-10">
                                      <SelectValue placeholder="Company" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="company">Company</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="flex flex-col gap-2">
                              <Label htmlFor="division">Devision</Label>
                              <Select defaultValue="abc">
                                  <SelectTrigger id="division" className="bg-background h-10">
                                      <SelectValue placeholder="ABC engineering" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="abc">ABC engineering</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="flex flex-col gap-2">
                              <Label htmlFor="subdivision">Sub-division</Label>
                              <Select defaultValue="engineering">
                                  <SelectTrigger id="subdivision" className="bg-background h-10">
                                      <SelectValue placeholder="Engineering" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="engineering">Engineering</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="flex flex-col gap-2">
                              <Label htmlFor="department">Department</Label>
                              <Select defaultValue="frontend">
                                  <SelectTrigger id="department" className="bg-background h-10">
                                      <SelectValue placeholder="Front-end" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="frontend">Front-end</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="flex flex-col gap-2">
                              <Label htmlFor="dateRange">Date range</Label>
                              <div className="relative">
                                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                      id="dateRange"
                                      placeholder="Mar 20, 2026- Mar 21, 2026"
                                      className="bg-background h-10 pl-10"
                                  />
                              </div>
                          </div>
                          <div className="flex flex-col gap-2">
                              <Label htmlFor="empType">Employee type</Label>
                              <Select defaultValue="all">
                                  <SelectTrigger id="empType" className="bg-background h-10">
                                      <SelectValue placeholder="All" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="all">All</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                      </div>
                  </div>

                  {/* Report fields */}
                  <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
                      <h3 className="text-sm font-semibold text-foreground">Report fields</h3>
                      <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                          {[
                              'Name',
                              'Department',
                              'Location',
                              'Salary',
                              'Attendance',
                              'Payroll',
                              'Benefits',
                              'Compliance',
                          ].map((field) => (
                              <div key={field} className="flex items-center gap-2">
                                  <Checkbox id={`field-${field.toLowerCase()}`} />
                                  <Label
                                      htmlFor={`field-${field.toLowerCase()}`}
                                      className="text-sm font-normal cursor-pointer"
                                  >
                                      {field}
                                  </Label>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Visualization */}
                  <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
                      <h3 className="text-sm font-semibold text-foreground">Visualization</h3>
                      <div className="grid grid-cols-2 gap-3">
                          {/* Table */}
                          <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3">
                              <div className="flex items-center gap-3">
                                  <Checkbox id="viz-table" />
                                  <Label
                                      htmlFor="viz-table"
                                      className="text-sm font-medium cursor-pointer"
                                  >
                                      Table
                                  </Label>
                              </div>
                              <TablePreview />
                          </div>
                          {/* Pie chart */}
                          <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3">
                              <div className="flex items-center gap-3">
                                  <Checkbox id="viz-pie" />
                                  <Label
                                      htmlFor="viz-pie"
                                      className="text-sm font-medium cursor-pointer"
                                  >
                                      Pie chart
                                  </Label>
                              </div>
                              <PiePreview />
                          </div>
                          {/* Line chart */}
                          <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3">
                              <div className="flex items-center gap-3">
                                  <Checkbox id="viz-line" />
                                  <Label
                                      htmlFor="viz-line"
                                      className="text-sm font-medium cursor-pointer"
                                  >
                                      Line chart
                                  </Label>
                              </div>
                              <LinePreview />
                          </div>
                          {/* Bar chart – default selected */}
                          <div className="flex items-center justify-between bg-primary/5 border border-primary/30 rounded-lg px-4 py-3">
                              <div className="flex items-center gap-3">
                                  <Checkbox
                                      id="viz-bar"
                                      defaultChecked
                                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                  <Label
                                      htmlFor="viz-bar"
                                      className="text-sm font-medium cursor-pointer"
                                  >
                                      Bar chart
                                  </Label>
                              </div>
                              <BarPreview />
                          </div>
                      </div>
                  </div>
              </div>

              <SheetFooter className="mt-2 px-6 pb-8 bg-transparent flex flex-row justify-end gap-3">
                  <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="min-w-25 border-primary text-primary hover:bg-primary/5 hover:text-primary"
                  >
                      Cancel
                  </Button>
                  <Button className="min-w-37.5 bg-primary text-primary-foreground hover:bg-primary/90">
                      Create report
                  </Button>
              </SheetFooter>
          </SheetContent>
      </Sheet>
  );
};

export default CreateReportSheet;
