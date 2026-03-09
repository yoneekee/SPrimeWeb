/**
 * 共通PDFスタイル定義
 * @react-pdf/renderer用のStyleSheetオブジェクト
 * フォントはNoto Sans JPを使用（日本語対応）
 */
import { StyleSheet, Font } from "@react-pdf/renderer";

// 日本語フォント登録（Google Fonts CDN）
Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-400-normal.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-700-normal.ttf",
      fontWeight: 700,
    },
  ],
});

export const colors = {
  primary: "#0e7c86",       // hsl(185 72% 38%)
  foreground: "#1e2a33",    // hsl(220 20% 14%)
  muted: "#6b7a8a",         // hsl(215 12% 46%)
  border: "#d1d8e0",        // hsl(214 16% 85%)
  background: "#f5f7f9",    // hsl(210 20% 96%)
  white: "#ffffff",
  success: "#1a9960",
  warning: "#f59e0b",
};

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    padding: 40,
    color: colors.foreground,
    backgroundColor: colors.white,
  },

  // Document Header
  docTitle: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 2,
    color: colors.foreground,
  },
  docSubtitle: {
    fontSize: 8,
    textAlign: "center",
    color: colors.muted,
    marginBottom: 20,
  },

  // Header Info Row
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "column",
    gap: 3,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 3,
  },
  headerLabel: {
    fontSize: 8,
    color: colors.muted,
  },
  headerValue: {
    fontSize: 9,
    color: colors.foreground,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.foreground,
  },

  // Partner Section
  partnerSection: {
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 10,
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.foreground,
    marginBottom: 3,
  },
  partnerNote: {
    fontSize: 7,
    color: colors.muted,
  },

  // Table
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderBottom: `1px solid ${colors.border}`,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `0.5px solid ${colors.border}`,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  thCell: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.muted,
    textTransform: "uppercase" as const,
  },
  tdCell: {
    fontSize: 8,
    color: colors.foreground,
  },
  tdCellMono: {
    fontSize: 8,
    color: colors.foreground,
    fontFamily: "NotoSansJP",
  },
  tdCellMuted: {
    fontSize: 8,
    color: colors.muted,
  },

  // Totals
  totalsSection: {
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 8,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 8,
    color: colors.muted,
  },
  totalValue: {
    fontSize: 9,
    color: colors.foreground,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 4,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.foreground,
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
  },

  // Footer
  footer: {
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 8,
    marginTop: 4,
  },
  footerText: {
    fontSize: 7,
    color: colors.muted,
    marginBottom: 2,
  },
  sealBox: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.muted,
    borderRadius: 3,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 8,
    fontSize: 9,
    color: colors.muted,
  },

  // Page Footer
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: colors.muted,
  },
});

// Column width helpers (percentage-based)
export const colWidths = {
  // For item tables (5 columns)
  item5: {
    name: "30%",
    spec: "20%",
    qty: "12%",
    price: "18%",
    amount: "20%",
  },
  // For item tables (6 columns with warehouse)
  item6: {
    name: "25%",
    spec: "17%",
    qty: "10%",
    price: "16%",
    amount: "17%",
    warehouse: "15%",
  },
};
