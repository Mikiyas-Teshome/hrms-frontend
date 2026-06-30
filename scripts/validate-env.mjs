import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  AUTH_SERVICE_URL: z.string().url(),
  CORE_HR_SERVICE_URL: z.string().url(),
  PAYROLL_SERVICE_URL: z.string().url(),
  LEAVE_SERVICE_URL: z.string().url(),
  ATTENDANCE_SERVICE_URL: z.string().url(),
  NOTIFICATION_SERVICE_URL: z.string().url().optional(),
  AUDIT_LOG_SERVICE_URL: z.string().url().optional(),
  DOCUMENT_SERVICE_URL: z.string().url().optional(),
  DOCUMENT_FILE_API_BASE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional(),
  ),
  REPORTING_SERVICE_URL: z.string().url().optional(),
  API_GATEWAY_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_GATEWAY_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 2)
  );
  process.exit(1);
}

