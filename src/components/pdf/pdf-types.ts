/**
 * PDF生成用の型定義
 */

export type PdfDocType = "po" | "invoice" | "production" | "shipment" | "bom";

export interface PdfLineItem {
  name: string;
  spec: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
  warehouse?: string;
  lotNo?: string;
  note?: string;
}

export interface PdfDocumentData {
  docType: PdfDocType;
  docNo: string;
  issueDate: string;
  partner: string;
  partnerAddress?: string;
  items: PdfLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  // Optional fields by doc type
  deliveryDate?: string;
  deliveryAddress?: string;
  paymentTerms?: string;
  paymentDueDate?: string;
  bankInfo?: string;
  accountName?: string;
  note?: string;
  requester?: string;
  department?: string;
  approver?: string;
}

export const docTypeLabels: Record<PdfDocType, { ja: string; en: string }> = {
  po: { ja: "発 注 書", en: "PURCHASE ORDER" },
  invoice: { ja: "請 求 書", en: "INVOICE" },
  production: { ja: "生 産 伝 票", en: "PRODUCTION SLIP" },
  shipment: { ja: "出 荷 伝 票", en: "SHIPMENT SLIP" },
  bom: { ja: "B O M 伝 票", en: "BOM SLIP" },
};
