/**
 * Centralized Zod validation schemas for all ERP entities.
 * All error messages are in Japanese (日本語) for end-user clarity.
 * 
 * Usage:
 *   import { productionSlipSchema } from "@/lib/schemas";
 *   const form = useForm({ resolver: zodResolver(productionSlipSchema) });
 */

export * from "./slip.schema";
export * from "./employee.schema";
export * from "./item.schema";
