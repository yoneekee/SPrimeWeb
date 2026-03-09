/**
 * PDF生成・ダウンロード用カスタムフック
 * @react-pdf/renderer の pdf() を使ってBlobを生成しダウンロード
 */
import { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { SlipPdfDocument } from "@/components/pdf";
import type { PdfDocumentData } from "@/components/pdf";
import { toast } from "sonner";

export const usePdfDownload = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPdf = useCallback(async (data: PdfDocumentData, fileName?: string) => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<SlipPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `${data.docNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDFをダウンロードしました", { description: a.download });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("PDF生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadMultiplePdfs = useCallback(async (items: PdfDocumentData[]) => {
    setIsGenerating(true);
    try {
      for (const data of items) {
        const blob = await pdf(<SlipPdfDocument data={data} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.docNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success(`${items.length}件のPDFをダウンロードしました`);
    } catch (err) {
      console.error("Batch PDF generation failed:", err);
      toast.error("PDF一括生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { downloadPdf, downloadMultiplePdfs, isGenerating };
};
