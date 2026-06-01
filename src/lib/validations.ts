import * as z from 'zod';

/**
 * Common regex for international phone numbers:
 * - Must start with +
 * - Followed by 1-4 digits for country code
 * - Followed by 7-14 digits for the number
 */
export const PHONE_REGEX = /^\+\d{1,4}\d{7,14}$/;

/**
 * Reusable phone validation schema
 * @param errorMsg - The error message to display if validation fails
 */
export const phoneValidation = (errorMsg: string) => 
    z.string()
     .min(1, errorMsg)
     .regex(PHONE_REGEX, errorMsg);

/**
 * Optional phone validation (validates format only if not empty)
 */
export const optionalPhoneValidation = (errorMsg: string) =>
    z.string()
     .optional()
     .refine(val => !val || PHONE_REGEX.test(val), errorMsg);

/**
 * Validates that a string contains only numbers (e.g. for Postal Codes)
 */
export const numericValidation = (errorMsg: string) =>
    z.string()
     .refine(val => !val || /^\d+$/.test(val), errorMsg);

/**
 * Validates that a date is in the future
 */
export const futureDateValidation = (errorMsg: string) =>
    z.any()
     .refine(val => {
         if (!val) return true;
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         return new Date(val) > today;
     }, errorMsg);

/**
 * Validates that a date is in the past
 */
export const pastDateValidation = (errorMsg: string) =>
    z.any()
     .refine(val => {
         if (!val) return true;
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         return new Date(val) < today;
     }, errorMsg);

/**
 * Common Bank Regexes
 */
export const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z\d]{4,30}$/;
export const SWIFT_REGEX = /^[A-Z]{6}[A-Z\d]{2}([A-Z\d]{3})?$/;

export const ibanValidation = (errorMsg: string) =>
    z.string()
     .refine(val => !val || IBAN_REGEX.test(val), errorMsg);

export const swiftValidation = (errorMsg: string) =>
    z.string()
     .refine(val => !val || SWIFT_REGEX.test(val), errorMsg);
