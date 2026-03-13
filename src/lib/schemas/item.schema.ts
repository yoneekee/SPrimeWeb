/**
 * Item Master (品目マスタ) validation schema
 */
import { z } from "zod";

export const itemSchema = z.object({
  itemCode: z
    .string()
    .min(1, "品目コードは必須項目です")
    .max(30, "品目コードは30文字以内で入力してください")
    .regex(/^[A-Z0-9-]+$/, "品目コードは大文字英数字とハイフンのみ使用可能です"),
  itemType: z.string().min(1, "品目分類を選択してください"),
  itemName: z
    .string()
    .min(1, "品目名称は必須項目です")
    .max(200, "品目名称は200文字以内で入力してください"),
  spec: z.string().max(500, "規格は500文字以内で入力してください").optional(),
  unit: z.string().min(1, "管理単位を選択してください"),
  stdPrice: z.coerce
    .number({ invalid_type_error: "数値を入力してください" })
    .min(0, "標準単価は0以上で入力してください"),
  safetyStock: z.coerce
    .number({ invalid_type_error: "数値を入力してください" })
    .min(0, "安全在庫量は0以上で入力してください")
    .optional(),
  acctCode: z.string().min(1, "勘定科目を選択してください"),
  isActive: z.boolean().default(true),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
