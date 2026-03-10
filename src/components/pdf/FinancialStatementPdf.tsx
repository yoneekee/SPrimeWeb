/**
 * 財務諸表PDF（B/S・P/L）
 */
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles as s, colors } from "./pdf-styles";

interface AccountRow {
  code: string;
  name: string;
  amount: number;
  ratio: number;
}

interface Section {
  title: string;
  items: AccountRow[];
  subtotalLabel: string;
  subtotalAmount: number;
  color?: string;
}

export interface FinancialPdfData {
  reportType: "bs" | "pl";
  title: string;
  period: string;
  sections: Section[];
  grandTotalLabel: string;
  grandTotalAmount: number;
}

const COMPANY = {
  name: "S-Prime Corp.",
  address: "〒150-0002 東京都渋谷区",
  tel: "TEL: 03-XXXX-XXXX",
};

const fmtJPY = (n: number) => `¥${n.toLocaleString()}`;

const FinancialStatementPdf = ({ data }: { data: FinancialPdfData }) => (
  <Document>
    <Page size="A4" style={s.page}>
      {/* Title */}
      <Text style={s.docTitle}>{data.title}</Text>
      <Text style={s.docSubtitle}>
        {data.reportType === "bs" ? "BALANCE SHEET" : "PROFIT & LOSS STATEMENT"}
      </Text>

      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Text style={s.headerLabel}>照会期間:</Text>
            <Text style={s.headerValue}>{data.period}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Text style={s.headerLabel}>発行日:</Text>
            <Text style={s.headerValue}>
              {new Date().toISOString().slice(0, 10)}
            </Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <Text style={s.companyName}>{COMPANY.name}</Text>
          <Text style={s.headerLabel}>{COMPANY.address}</Text>
          <Text style={s.headerLabel}>{COMPANY.tel}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={s.table}>
        {/* Header Row */}
        <View style={s.tableHeader}>
          <Text style={[s.thCell, { width: "12%" }]}>コード</Text>
          <Text style={[s.thCell, { width: "38%" }]}>勘定科目</Text>
          <Text style={[s.thCell, { width: "30%", textAlign: "right" }]}>金額（JPY）</Text>
          <Text style={[s.thCell, { width: "20%", textAlign: "right" }]}>構成比</Text>
        </View>

        {data.sections.map((section, si) => (
          <View key={si}>
            {/* Section Header */}
            <View style={[s.tableRow, { backgroundColor: colors.background }]}>
              <Text style={[s.tdCell, { fontWeight: 700, width: "100%" }]}>
                {section.title}
              </Text>
            </View>
            {/* Items */}
            {section.items.map((item, ii) => (
              <View key={ii} style={s.tableRow}>
                <Text style={[s.tdCellMuted, { width: "12%" }]}>{item.code}</Text>
                <Text style={[s.tdCell, { width: "38%" }]}>{item.name}</Text>
                <Text style={[s.tdCellMono, { width: "30%", textAlign: "right" }]}>
                  {fmtJPY(item.amount)}
                </Text>
                <Text style={[s.tdCellMuted, { width: "20%", textAlign: "right" }]}>
                  {item.ratio.toFixed(1)}%
                </Text>
              </View>
            ))}
            {/* Section Subtotal */}
            <View style={[s.tableRow, { backgroundColor: colors.background }]}>
              <Text style={[s.tdCell, { width: "12%" }]} />
              <Text style={[s.tdCell, { width: "38%", fontWeight: 700 }]}>
                {section.subtotalLabel}
              </Text>
              <Text style={[s.tdCellMono, { width: "30%", textAlign: "right", fontWeight: 700 }]}>
                {fmtJPY(section.subtotalAmount)}
              </Text>
              <Text style={[s.tdCellMuted, { width: "20%", textAlign: "right" }]}>—</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Grand Total */}
      <View style={s.grandTotalRow}>
        <Text style={s.grandTotalLabel}>{data.grandTotalLabel}</Text>
        <Text style={s.grandTotalValue}>{fmtJPY(data.grandTotalAmount)}</Text>
      </View>

      {/* Seal */}
      <View style={s.footer}>
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

export default FinancialStatementPdf;
