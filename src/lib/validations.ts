import * as z from 'zod';

export const PHONE_REGEX = /^\+\d{1,4}\d{7,14}$/;

export const phoneValidation = (errorMsg: string) => 
    z.string()
     .min(1, errorMsg)
     .regex(PHONE_REGEX, errorMsg);

export const optionalPhoneValidation = (errorMsg: string) =>
    z.string()
     .optional()
     .refine(val => !val || PHONE_REGEX.test(val), errorMsg);

export const numericValidation = (errorMsg: string) =>
    z.string()
     .refine(val => !val || /^\d+$/.test(val), errorMsg);

export const futureDateValidation = (errorMsg: string) =>
    z.any()
     .refine(val => {
         if (!val) return true;
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         return new Date(val) > today;
     }, errorMsg);

export const pastDateValidation = (errorMsg: string) =>
    z.any()
     .refine(val => {
         if (!val) return true;
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         return new Date(val) < today;
     }, errorMsg);

export const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z\d]{4,30}$/;
export const SWIFT_REGEX = /^[A-Z]{6}[A-Z\d]{2}([A-Z\d]{3})?$/;

export const ibanValidation = (errorMsg: string) =>
    z.string()
     .refine(val => !val || IBAN_REGEX.test(val), errorMsg);

export const swiftValidation = (errorMsg: string) =>
    z.string()
     .refine(val => !val || SWIFT_REGEX.test(val), errorMsg);
