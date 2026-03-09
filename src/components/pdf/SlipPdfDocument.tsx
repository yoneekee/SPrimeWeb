/**
 * 汎用PDF文書コンポーネント
 * 全伝票タイプ（PO/Invoice/Production/Shipment/BOM）で共通使用
 */
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles as s, colWidths } from "./pdf-styles";
import { PdfDocumentData, docTypeLabels } from "./pdf-types";

interface SlipPdfDocumentProps {
  data: PdfDocumentData;
}

const COMPANY = {
  name: "S-Prime Corp.",
  address: "〒150-0002 東京都渋谷区",
  tel: "TEL: 03-XXXX-XXXX",
};

const SlipPdfDocument = ({ data }: SlipPdfDocumentProps) => {
  const labels = docTypeLabels[data.docType];
  const w = colWidths.item5;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Title */}
        <Text style={s.docTitle}>{labels.ja}</Text>
        <Text style={s.docSubtitle}>{labels.en}</Text>

        {/* Header Info */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Text style={s.headerLabel}>文書番号:</Text>
              <Text style={s.headerValue}>{data.docNo}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Text style={s.headerLabel}>発行日:</Text>
              <Text style={s.headerValue}>{data.issueDate}</Text>
            </View>
            {data.requester && (
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Text style={s.headerLabel}>起案者:</Text>
                <Text style={s.headerValue}>{data.requester}</Text>
              </View>
            )}
            {data.department && (
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Text style={s.headerLabel}>部門:</Text>
                <Text style={s.headerValue}>{data.department}</Text>
              </View>
            )}
          </View>
          <View style={s.headerRight}>
            <Text style={s.companyName}>{COMPANY.name}</Text>
            <Text style={s.headerLabel}>{COMPANY.address}</Text>
            <Text style={s.headerLabel}>{COMPANY.tel}</Text>
          </View>
        </View>

        {/* Partner */}
        <View style={s.partnerSection}>
          <Text style={s.partnerName}>{data.partner} 御中</Text>
          {data.partnerAddress && (
            <Text style={s.partnerNote}>{data.partnerAddress}</Text>
          )}
          {data.docType === "invoice" && data.paymentDueDate && (
            <Text style={s.partnerNote}>
              下記の通りご請求申し上げます。お支払い期限: {data.paymentDueDate}
            </Text>
          )}
        </View>

        {/* Items Table */}
        <View style={s.table}>
          {/* Header */}
          <View style={s.tableHeader}>
            <Text style={[s.thCell, { width: w.name }]}>品目</Text>
            <Text style={[s.thCell, { width: w.spec }]}>規格</Text>
            <Text style={[s.thCell, { width: w.qty, textAlign: "right" }]}>数量</Text>
            <Text style={[s.thCell, { width: w.price, textAlign: "right" }]}>単価</Text>
            <Text style={[s.thCell, { width: w.amount, textAlign: "right" }]}>金額</Text>
          </View>
          {/* Rows */}
          {data.items.map((item, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.tdCell, { width: w.name }]}>{item.name}</Text>
              <Text style={[s.tdCellMuted, { width: w.spec }]}>{item.spec}</Text>
              <Text style={[s.tdCellMono, { width: w.qty, textAlign: "right" }]}>
                {item.qty.toLocaleString()} {item.unit}
              </Text>
              <Text style={[s.tdCellMono, { width: w.price, textAlign: "right" }]}>
                ¥{item.unitPrice.toLocaleString()}
              </Text>
              <Text style={[s.tdCellMono, { width: w.amount, textAlign: "right" }]}>
                ¥{item.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>小計（税抜）</Text>
            <Text style={s.totalValue}>¥{data.subtotal.toLocaleString()}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>
              消費税（{Math.round(data.taxRate * 100)}%）
            </Text>
            <Text style={s.totalValue}>¥{data.taxAmount.toLocaleString()}</Text>
          </View>
          <View style={s.grandTotalRow}>
            <Text style={s.grandTotalLabel}>合計金額（税込）</Text>
            <Text style={s.grandTotalValue}>
              ¥{data.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Footer — type-specific */}
        <View style={s.footer}>
          {data.deliveryDate && (
            <Text style={s.footerText}>納期: {data.deliveryDate}</Text>
          )}
          {data.deliveryAddress && (
            <Text style={s.footerText}>納品場所: {data.deliveryAddress}</Text>
          )}
          {data.paymentTerms && (
            <Text style={s.footerText}>支払条件: {data.paymentTerms}</Text>
          )}
          {data.bankInfo && (
            <Text style={s.footerText}>振込先: {data.bankInfo}</Text>
          )}
          {data.accountName && (
            <Text style={s.footerText}>口座名義: {data.accountName}</Text>
          )}
          {data.note && (
            <Text style={s.footerText}>備考: {data.note}</Text>
          )}
          <Text style={s.sealBox}>印</Text>
        </View>

        {/* Page Footer */}
        <View style={s.pageFooter} fixed>
          <Text>{COMPANY.name}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

export default SlipPdfDocument;
