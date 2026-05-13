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
import { Textarea } from '@/components/ui/textarea';

interface AddCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCategorySheet = ({ open, onOpenChange }: AddCategorySheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-bold">Add document category</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-8 p-6 pt-2 pb-6">
          {/* Basic info */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Basic info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="categoryName">Category name</Label>
                <Input id="categoryName" placeholder="Enter category name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="categoryType">Type</Label>
                <Select defaultValue="identification">
                  <SelectTrigger id="categoryType">
                    <SelectValue placeholder="Identification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identification">Identification</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Add description" className="min-h-[100px]" />
            </div>
          </div>

          {/* Requirement rules */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-foreground">Requirement rules</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch id="required" defaultChecked />
                <Label htmlFor="required" className="font-medium cursor-pointer">Required document</Label>
              </div>
              <div className="flex flex-col gap-1.5 w-[240px]">
                <Label htmlFor="appliedTo" className="text-xs text-muted-foreground uppercase font-semibold">Applied to</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="appliedTo" className="h-9">
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>
                    <SelectItem value="specific">Specific department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch id="expiryRequired" defaultChecked />
                <Label htmlFor="expiryRequired" className="font-medium cursor-pointer">Expiry date required</Label>
              </div>
              <div className="flex flex-col gap-1.5 w-[240px]">
                <Label htmlFor="expiryReminder" className="text-xs text-muted-foreground uppercase font-semibold">Expiry Reminder</Label>
                <Select defaultValue="7-days">
                  <SelectTrigger id="expiryReminder" className="h-9">
                    <SelectValue placeholder="7 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7-days">7 days</SelectItem>
                    <SelectItem value="15-days">15 days</SelectItem>
                    <SelectItem value="30-days">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch id="requireApproval" defaultChecked />
              <Label htmlFor="requireApproval" className="font-medium cursor-pointer">Require Approval</Label>
            </div>
          </div>

          {/* Compliance Behavior */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Compliance Behavior</h3>
            <div className="flex gap-12">
              <div className="flex items-center gap-3">
                <Switch id="affectsCompliance" defaultChecked />
                <Label htmlFor="affectsCompliance" className="font-medium cursor-pointer">Affects compliance status</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="criticalDocument" defaultChecked />
                <Label htmlFor="criticalDocument" className="font-medium cursor-pointer">Critical document</Label>
              </div>
            </div>
          </div>

          {/* Validation rules */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Validation rules</h3>
            <div className="flex flex-col gap-3">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Allowed File Types</Label>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="pdf" defaultChecked />
                  <Label htmlFor="pdf" className="text-sm font-normal">PDF</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="jpeg" defaultChecked />
                  <Label htmlFor="jpeg" className="text-sm font-normal">JPEG</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="png" defaultChecked />
                  <Label htmlFor="png" className="text-sm font-normal">PNG</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="doc" defaultChecked />
                  <Label htmlFor="doc" className="text-sm font-normal">DOC</Label>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-[240px]">
              <Label htmlFor="maxSize">Max file size</Label>
              <div className="relative">
                <Input id="maxSize" placeholder="0" className="pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">MB</span>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4 px-6 pb-8 bg-transparent flex flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-w-[100px] border-primary text-primary hover:bg-primary/5 hover:text-primary">
            Cancel
          </Button>
          <Button className="min-w-[150px] bg-primary text-primary-foreground hover:bg-primary/90">
            Create Category
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddCategorySheet;
