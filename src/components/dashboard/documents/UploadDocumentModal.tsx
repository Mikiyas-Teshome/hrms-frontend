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
import { CalendarIcon, Upload } from 'lucide-react';

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadDocumentModal = ({ open, onOpenChange }: UploadDocumentModalProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-bold">Upload a new document</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-6 pt-2 pb-6">
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Document info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="employee" className="text-sm font-medium">Employee</Label>
                <Input id="employee" placeholder="Search or select employee" className="h-10" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                <Select defaultValue="passport">
                  <SelectTrigger id="type" className="h-10">
                    <SelectValue placeholder="Passport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="id">ID Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="expiryDate" className="text-sm font-medium">Expiry date</Label>
                <div className="relative">
                  <Input id="expiryDate" placeholder="DD/MM/YYYY" className="h-10 pl-10" />
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="file" className="text-sm font-medium">Select file</Label>
                <div className="relative">
                  <Input id="file" type="file" className="hidden" />
                  <div className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-background border rounded-md border-input ring-offset-background cursor-pointer">
                    <span className="text-muted-foreground">No file chosen</span>
                    <span className="text-foreground font-medium underline underline-offset-4">Choose file</span>
                  </div>
                </div>
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

export default UploadDocumentModal;
