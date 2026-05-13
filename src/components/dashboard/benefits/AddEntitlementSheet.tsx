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

interface AddEntitlementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddEntitlementSheet = ({ open, onOpenChange }: AddEntitlementSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-bold">Add an entitlement</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-8 p-6 pt-2 pb-6">
          {/* Basic info */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Basic info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="entitlementName">Entitlement name</Label>
                <Input id="entitlementName" placeholder="Enter entitlement name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue="bonus">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Bonus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Entitlement details */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Entitlement details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="valueDefinition">Value definition</Label>
                <Select defaultValue="fixed">
                  <SelectTrigger id="valueDefinition">
                    <SelectValue placeholder="Fixed amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select defaultValue="yearly">
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Yearly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="one-time">One time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="accessBasedOn">Access based on</Label>
                <Select defaultValue="role">
                  <SelectTrigger id="accessBasedOn">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="tenure">Tenure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="assignment">Assignment</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="assignment">
                    <SelectValue placeholder="All employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employee</SelectItem>
                    <SelectItem value="specific">Specific segment</SelectItem>
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
            Save entitlement
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddEntitlementSheet;
