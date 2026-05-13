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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface AddInsuranceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddInsuranceSheet = ({ open, onOpenChange }: AddInsuranceSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-bold">Add an insurance coverage</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-8 p-6 pt-2 pb-6">
          {/* Insurance info */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Insurance info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="insuranceName">Insurance name</Label>
                <Input id="insuranceName" placeholder="Enter insurance name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="provider">Insurance provider</Label>
                <Input id="provider" placeholder="Enter provider name" />
              </div>
            </div>
          </div>

          {/* Coverage details */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Coverage details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="coverageType">Coverage type</Label>
                <Select>
                  <SelectTrigger id="coverageType">
                    <SelectValue placeholder="Health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="life">Life</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="coverageAmount">Coverage amount</Label>
                <Input id="coverageAmount" placeholder="Enter amount" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="assignment">Assignment</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="assignment">
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>
                    <SelectItem value="department">By department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="renewalType">Renewal Type</Label>
                <Select defaultValue="yearly">
                  <SelectTrigger id="renewalType">
                    <SelectValue placeholder="Yearly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Switch id="dependents" />
                <Label htmlFor="dependents" className="font-medium">Dependents Coverage</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="maxDependents">Max dependents</Label>
                <Select defaultValue="4">
                  <SelectTrigger id="maxDependents">
                    <SelectValue placeholder="4" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="spouse" />
                  <Label htmlFor="spouse" className="text-sm font-normal">Spouse</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="children" />
                  <Label htmlFor="children" className="text-sm font-normal">Children</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="parents" />
                  <Label htmlFor="parents" className="text-sm font-normal">Parents</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="siblings" />
                  <Label htmlFor="siblings" className="text-sm font-normal">Siblings</Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Included services</Label>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="hospitalization" />
                  <Label htmlFor="hospitalization" className="text-sm font-normal">Hospitalization</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="outpatient" />
                  <Label htmlFor="outpatient" className="text-sm font-normal">Outpatient</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="dental" />
                  <Label htmlFor="dental" className="text-sm font-normal">Dental</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="vision" />
                  <Label htmlFor="vision" className="text-sm font-normal">Vision</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility Rules */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Eligibility Rules</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="employmentType">Employment type</Label>
                <Select defaultValue="full-time">
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Full time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full time</SelectItem>
                    <SelectItem value="part-time">Part time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="minTenure">Minimum tenure</Label>
                <Select defaultValue="3-months">
                  <SelectTrigger id="minTenure">
                    <SelectValue placeholder="3 months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="3-months">3 months</SelectItem>
                    <SelectItem value="6-months">6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="employerContribution">Employer Contribution</Label>
                <Select defaultValue="100">
                  <SelectTrigger id="employerContribution">
                    <SelectValue placeholder="100%" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="employeeContribution">Employee Contribution</Label>
                <Select defaultValue="0">
                  <SelectTrigger id="employeeContribution">
                    <SelectValue placeholder="0%" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4 px-6 pb-8 bg-transparent flex flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-w-[100px] border-primary text-primary hover:bg-primary/5 hover:text-primary">
            Cancel
          </Button>
          <Button className="min-w-[150px] bg-primary text-primary-foreground hover:bg-primary/90">
            Save insurance
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddInsuranceSheet;
