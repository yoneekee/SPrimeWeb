/**
 * Warehouse Master (倉庫拠点マスタ) validation schema
 */
import { z } from "zod";

export const warehouseSchema = z.object({
  locName: z
    .string()
    .min(1, "拠点名称は必須項目です")
    .max(100, "拠点名称は100文字以内で入力してください"),
  locType: z.string().min(1, "拠点種別を選択してください"),
  postalCode: z
    .string()
    .regex(/^(\d{3}-?\d{4})?$/, "郵便番号は「000-0000」形式で入力してください")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200, "住所は200文字以内で入力してください").optional().or(z.literal("")),
  contactInfo: z
    .string()
    .max(50, "連絡先は50文字以内で入力してください")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
  remarks: z.string().max(200, "備考は200文字以内で入力してください").optional().or(z.literal("")),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;