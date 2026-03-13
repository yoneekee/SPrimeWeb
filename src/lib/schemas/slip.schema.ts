/**
 * Slip (伝票) validation schemas
 * Covers: Production, Shipment, BOM slip creation forms
 */
import { z } from "zod";

// ── Production Slip Header ──
export const productionSlipSchema = z.object({
  reqDate: z.string().min(1, "申請日は必須項目です"),
  vendor: z.string().min(1, "希望発注先を選択してください"),
  remark: z.string().max(500, "備考は500文字以内で入力してください").optional(),
});

export type ProductionSlipFormValues = z.infer<typeof productionSlipSchema>;

// ── Shipment Slip Header ──
export const shipmentSlipSchema = z.object({
  shipDate: z.string().min(1, "出庫希望日は必須項目です"),
  customer: z.string().min(1, "得意先を選択してください"),
  deliveryAddr: z.string().max(200, "配送先住所は200文字以内で入力してください").optional(),
  warehouse: z.string().min(1, "出発地倉庫を選択してください"),
  remark: z.string().max(500, "備考は500文字以内で入力してください").optional(),
});

export type ShipmentSlipFormValues = z.infer<typeof shipmentSlipSchema>;

// ── BOM Slip Header ──
export const bomSlipSchema = z.object({
  reqDate: z.string().min(1, "作成日付は必須項目です"),
  selectedProduct: z.string().min(1, "生産対象の完成品を選択してください"),
  targetQty: z.coerce.number().min(1, "生産目標数は1以上である必要があります"),
  remark: z.string().max(500, "備考は500文字以内で入力してください").optional(),
});

export type BomSlipFormValues = z.infer<typeof bomSlipSchema>;
