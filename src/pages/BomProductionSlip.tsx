import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  FileDown,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { usePdfDownload } from "@/hooks/use-pdf-download";
import type { PdfDocumentData } from "@/components/pdf";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "作成中", color: "bg-muted text-muted-foreground" },
  S01: { label: "申請中", color: "bg-info/20 text-info" },
  A01: { label: "承認済", color: "bg-success/20 text-success" },
  P02: { label: "発注済", color: "bg-primary/20 text-primary" },
  P03: { label: "分納中", color: "bg-info/20 text-info" },
  P04: { label: "入庫完了", color: "bg-success/20 text-success" },
  I00: { label: "検収完了", color: "bg-success/20 text-success" },
};

interface SlipItem {
  slipNo: string;
  targetItem: string;
  targetQty: number;
  status: string;
  date: string;
  selected: boolean;
}

interface BomItem {
  level: number;
  itemCode: string;
  itemName: string;
  requiredQty: number;
  totalQty: number;
  lossRate: number;
  stockQty: number;
  shortage: number;
  warehouse: string;
}

const mockSlips: SlipItem[] = [
  { slipNo: "SLP20240307-001", targetItem: "プラズマエッチング装置 PE-500", targetQty: 5, status: "P03", date: "2024-03-07", selected: false },
  { slipNo: "SLP20240305-003", targetItem: "CVD成膜装置 CV-300", targetQty: 3, status: "A01", date: "2024-03-05", selected: false },
  { slipNo: "SLP20240304-002", targetItem: "精密ウェーハチャックモジュール WC-100", targetQty: 20, status: "I00", date: "2024-03-04", selected: false },
  { slipNo: "SLP20240301-001", targetItem: "スパッタリングシステム SP-200", targetQty: 2, status: "S00", date: "2024-03-01", selected: false },
];

const mockBom: BomItem[] = [
  { level: 0, itemCode: "FIN-ETCH-500", itemName: "プラズマエッチング装置 PE-500", requiredQty: 1, totalQty: 5, lossRate: 0, stockQty: 2, shortage: -3, warehouse: "本社 第1倉庫" },
  { level: 1, itemCode: "SEMI-CHAMBER-01", itemName: "真空チャンバーモジュール", requiredQty: 1, totalQty: 5, lossRate: 2, stockQty: 8, shortage: 3, warehouse: "本社 第1倉庫" },
  { level: 2, itemCode: "RAW-STEEL-SUS", itemName: "SUS316L ステンレス板材", requiredQty: 4, totalQty: 20.4, lossRate: 2, stockQty: 50, shortage: 29.6, warehouse: "本社 第2倉庫" },
  { level: 2, itemCode: "RAW-ORING-VT", itemName: "バイトン Oリング（Φ300）", requiredQty: 8, totalQty: 40, lossRate: 0, stockQty: 25, shortage: -15, warehouse: "本社 第1倉庫" },
  { level: 1, itemCode: "SEMI-RF-GEN", itemName: "RF発生器ユニット", requiredQty: 1, totalQty: 5, lossRate: 0, stockQty: 3, shortage: -2, warehouse: "本社 第1倉庫" },
  { level: 2, itemCode: "RAW-PCB-RF01", itemName: "RF電力制御PCB", requiredQty: 2, totalQty: 10, lossRate: 3, stockQty: 15, shortage: 5, warehouse: "渋谷物流センター" },
  { level: 2, itemCode: "RAW-CAP-HV", itemName: "高圧セラミックコンデンサ", requiredQty: 12, totalQty: 60, lossRate: 1, stockQty: 40, shortage: -20, warehouse: "本社 第2倉庫" },
  { level: 1, itemCode: "SEMI-WAFER-01", itemName: "シリコンウェーハ 300mm（テスト用）", requiredQty: 10, totalQty: 50, lossRate: 5, stockQty: 300, shortage: 250, warehouse: "本社 第1倉庫" },
  { level: 1, itemCode: "SEMI-GAS-SYS", itemName: "ガス供給システム", requiredQty: 1, totalQty: 5, lossRate: 0, stockQty: 6, shortage: 1, warehouse: "本社 第1倉庫" },
  { level: 2, itemCode: "RAW-VALVE-APC", itemName: "APCバルブ（自動圧力制御）", requiredQty: 3, totalQty: 15, lossRate: 0, stockQty: 10, shortage: -5, warehouse: "本社 第2倉庫" },
  { level: 2, itemCode: "RAW-PIPE-EP", itemName: "EP処理SUS配管（1/4\"）", requiredQty: 6, totalQty: 30, lossRate: 0, stockQty: 80, shortage: 50, warehouse: "本社 第2倉庫" },
];

const BomProductionSlip = () => {
  const navigate = useNavigate();
  const [selectedSlip, setSelectedSlip] = useState("SLP20240307-001");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkedSlips, setCheckedSlips] = useState<string[]>([]);
  
  const { downloadPdf, downloadMultiplePdfs, isGenerating } = usePdfDownload();

  const toggleCheck = (slipNo: string) => {
    setCheckedSlips((prev) =>
      prev.includes(slipNo) ? prev.filter((s) => s !== slipNo) : [...prev, slipNo]
    );
  };

  const getLevelIndent = (level: number) => `${level * 20}px`;

  const getShortageIcon = (shortage: number) => {
    if (shortage >= 0) return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />;
  };

  // Convert BOM data to PDF format
  const convertBomToPdfData = (slipNo: string): PdfDocumentData => {
    const slip = mockSlips.find((s) => s.slipNo === slipNo);
    if (!slip) throw new Error("Slip not found");

    // Convert BOM items to PDF line items
    const pdfItems = mockBom.map((bomItem) => ({
      name: `${"  ".repeat(bomItem.level)}${bomItem.itemName}`,
      spec: `Lv${bomItem.level} / ${bomItem.itemCode}`,
      qty: bomItem.totalQty,
      unit: "EA",
      unitPrice: 0, // BOM doesn't have unit price
      amount: 0,
      warehouse: bomItem.warehouse,
      note: `所要量:${bomItem.requiredQty} / 在庫:${bomItem.stockQty} / 過不足:${bomItem.shortage >= 0 ? '+' : ''}${bomItem.shortage}`,
    }));

    return {
      docType: "bom",
      docNo: slipNo,
      issueDate: slip.date.replace(/-/g, "年").replace(/年(\d+)$/, "年$1日").replace(/年(\d+)-/, "年$1月"),
      partner: "社内生産",
      items: pdfItems,
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,
      note: `対象品目: ${slip.targetItem} / 生産目標数: ${slip.targetQty}`,
    };
  };

  const handleDownloadPdf = () => {
    const pdfData = convertBomToPdfData(selectedSlip);
    downloadPdf(pdfData);
  };

  const handleBatchDownload = () => {
    const pdfDataList = checkedSlips.map(convertBomToPdfData);
    downloadMultiplePdfs(pdfDataList);
  };

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">BOM生産伝票</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              BOM基準の生産伝票を照会し、部品の過不足状況を確認します
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1.5 text-xs" 
              disabled={checkedSlips.length === 0 || isGenerating}
              onClick={handleBatchDownload}
            >
              <FileDown className="w-3.5 h-3.5" /> 一括出力 ({checkedSlips.length})
            </Button>
            <Button size="sm" onClick={() => navigate("/documents/bom/new")} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
              <Plus className="w-3.5 h-3.5" /> 新規生産起案
            </Button>
          </div>
        </div>

        {/* Search Filters */}
        <Card className="border-border bg-card">
          <CardContent className="px-4 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票番号</label>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1 h-8">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-28" placeholder="伝票番号検索" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">生産品目</label>
                <Input className="h-8 text-xs border-border w-40" placeholder="品目名検索" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">期間</label>
                <div className="flex items-center gap-2">
                  <DatePicker value="2024-03-01" className="w-32" />
                  <span className="text-xs text-muted-foreground">~</span>
                  <DatePicker value="2024-03-31" className="w-32" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">ステータス</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs border-border w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    <SelectItem value="S00">作成中</SelectItem>
                    <SelectItem value="A01">承認済</SelectItem>
                    <SelectItem value="P03">分納中</SelectItem>
                    <SelectItem value="I00">検収完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground">
                <Search className="w-3 h-3" /> 照会
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Slip List */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              生産伝票一覧
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-10"></TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">伝票番号</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">対象品目</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">生産目標数</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">現在ステータス</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">作成日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSlips.map((slip) => {
                  const st = STATUS_MAP[slip.status];
                  const isSelected = selectedSlip === slip.slipNo;
                  return (
                    <TableRow
                      key={slip.slipNo}
                      onClick={() => setSelectedSlip(slip.slipNo)}
                      className={`border-border cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-secondary/50"}`}
                    >
                      <TableCell className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checkedSlips.includes(slip.slipNo)}
                          onCheckedChange={() => toggleCheck(slip.slipNo)}
                          className="border-border"
                        />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-primary flex items-center gap-1.5">
                        {isSelected ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                        {slip.slipNo}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{slip.targetItem}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{slip.targetQty.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${st?.color || ""}`}>
                          {st?.label || slip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">{slip.date}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* BOM Detail */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                BOM明細内訳
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-primary">{selectedSlip}</Badge>
              </CardTitle>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3 h-3" /> 充足</span>
                <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="w-3 h-3" /> 不足</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-14">Lvl</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目コード</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目名称</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">単位所要量</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">ロス率</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">総必要数量</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">現在実在庫</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">過不足</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">倉庫位置</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBom.map((item, idx) => (
                    <TableRow key={idx} className={`border-border hover:bg-secondary/50 ${item.level === 0 ? "bg-primary/5" : ""}`}>
                      <TableCell className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                          item.level === 0 ? "border-primary/50 text-primary" : item.level === 1 ? "border-info/50 text-info" : "border-muted-foreground/50 text-muted-foreground"
                        }`}>
                          L{item.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-primary" style={{ paddingLeft: `${12 + item.level * 20}px` }}>
                        {item.level > 0 && <span className="text-muted-foreground/40 mr-1">└</span>}
                        {item.itemCode}
                      </TableCell>
                      <TableCell className={`px-3 py-2 text-xs ${item.level === 0 ? "font-bold text-foreground" : "text-foreground"}`}>
                        {item.itemName}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{item.requiredQty}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-muted-foreground">{item.lossRate > 0 ? `${item.lossRate}%` : "-"}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono font-medium text-foreground">{item.totalQty.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{item.stockQty.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getShortageIcon(item.shortage)}
                          <span className={`text-xs font-mono font-medium ${item.shortage >= 0 ? "text-success" : "text-destructive"}`}>
                            {item.shortage >= 0 ? `+${item.shortage}` : item.shortage}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-muted-foreground">{item.warehouse}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">部品 計 {mockBom.filter(b => b.level > 0).length}件</span>
                <span className="flex items-center gap-1 text-destructive">
                  <MinusCircle className="w-3 h-3" />
                  不足 {mockBom.filter(b => b.shortage < 0).length}件
                </span>
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="w-3 h-3" />
                  充足 {mockBom.filter(b => b.shortage >= 0).length}件
                </span>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <FileDown className="w-3 h-3" /> PDF出力
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
};

export default BomProductionSlip;