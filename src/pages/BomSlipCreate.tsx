import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

// 完成品カタログ（BOM対象）
const FINISHED_PRODUCTS = [
  { code: "FIN-ETCH-500", name: "プラズマエッチング装置 PE-500" },
  { code: "FIN-CVD-300", name: "CVD成膜装置 CV-300" },
  { code: "FIN-SPUT-200", name: "スパッタリングシステム SP-200" },
  { code: "FIN-CMP-100", name: "CMP研磨装置 CM-100" },
  { code: "FIN-CLEAN-400", name: "洗浄装置 CL-400" },
];

// BOMデータ（完成品別下位部品ツリー）
const BOM_DATA: Record<string, BomNode[]> = {
  "FIN-ETCH-500": [
    { level: 1, itemCode: "SEMI-CHAMBER-01", itemName: "真空チャンバーモジュール", requiredQty: 1, lossRate: 2, stockQty: 8, warehouse: "本社 第1倉庫" },
    { level: 2, itemCode: "RAW-STEEL-SUS", itemName: "SUS316L ステンレス板材", requiredQty: 4, lossRate: 2, stockQty: 50, warehouse: "本社 第2倉庫" },
    { level: 2, itemCode: "RAW-ORING-VT", itemName: "バイトン Oリング（Φ300）", requiredQty: 8, lossRate: 0, stockQty: 25, warehouse: "本社 第1倉庫" },
    { level: 1, itemCode: "SEMI-RF-GEN", itemName: "RF発生器ユニット", requiredQty: 1, lossRate: 0, stockQty: 3, warehouse: "本社 第1倉庫" },
    { level: 2, itemCode: "RAW-PCB-RF01", itemName: "RF電力制御PCB", requiredQty: 2, lossRate: 3, stockQty: 15, warehouse: "渋谷物流センター" },
    { level: 2, itemCode: "RAW-CAP-HV", itemName: "高圧セラミックコンデンサ", requiredQty: 12, lossRate: 1, stockQty: 40, warehouse: "本社 第2倉庫" },
    { level: 1, itemCode: "SEMI-GAS-SYS", itemName: "ガス供給システム", requiredQty: 1, lossRate: 0, stockQty: 6, warehouse: "本社 第1倉庫" },
    { level: 2, itemCode: "RAW-VALVE-APC", itemName: "APCバルブ（自動圧力制御）", requiredQty: 3, lossRate: 0, stockQty: 10, warehouse: "本社 第2倉庫" },
  ],
  "FIN-CVD-300": [
    { level: 1, itemCode: "SEMI-HEATER-01", itemName: "加熱チャンバーモジュール", requiredQty: 1, lossRate: 1, stockQty: 5, warehouse: "本社 第1倉庫" },
    { level: 2, itemCode: "RAW-QUARTZ-01", itemName: "石英チューブ（Φ200）", requiredQty: 2, lossRate: 5, stockQty: 12, warehouse: "本社 第2倉庫" },
    { level: 2, itemCode: "RAW-HEATER-EL", itemName: "SiCヒーティングエレメント", requiredQty: 6, lossRate: 2, stockQty: 20, warehouse: "本社 第1倉庫" },
    { level: 1, itemCode: "SEMI-GAS-MIX", itemName: "ガス混合ユニット", requiredQty: 1, lossRate: 0, stockQty: 4, warehouse: "本社 第1倉庫" },
    { level: 2, itemCode: "RAW-MFC-01", itemName: "MFC（マスフローコントローラ）", requiredQty: 4, lossRate: 0, stockQty: 18, warehouse: "渋谷物流センター" },
  ],
  "FIN-SPUT-200": [
    { level: 1, itemCode: "SEMI-TARGET-01", itemName: "スパッタターゲットモジュール", requiredQty: 1, lossRate: 0, stockQty: 7, warehouse: "本社 第1倉庫" },
    { level: 2, itemCode: "RAW-TI-DISK", itemName: "チタンディスク（Φ300）", requiredQty: 1, lossRate: 0, stockQty: 10, warehouse: "本社 第2倉庫" },
    { level: 2, itemCode: "RAW-MAG-ASY", itemName: "マグネトロンアセンブリ", requiredQty: 1, lossRate: 0, stockQty: 4, warehouse: "本社 第1倉庫" },
    { level: 1, itemCode: "SEMI-PUMP-TMP", itemName: "ターボ分子ポンプユニット", requiredQty: 1, lossRate: 0, stockQty: 3, warehouse: "本社 第1倉庫" },
  ],
};

interface BomNode {
  level: number;
  itemCode: string;
  itemName: string;
  requiredQty: number;
  lossRate: number;
  stockQty: number;
  warehouse: string;
}

interface ExpandedBomRow extends BomNode {
  totalQty: number;
  shortage: number;
}

const generateSlipNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `BOM${y}${m}${d}-${seq}`;
};

const BomSlipCreate = () => {
  const navigate = useNavigate();
  const [slipNo] = useState(generateSlipNo());
  const [reqDate, setReqDate] = useState(new Date().toISOString().split("T")[0]);
  const [requester] = useState("田中 太郎");
  const [department] = useState("製造1課");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [targetQty, setTargetQty] = useState(1);
  const [remark, setRemark] = useState("");

  // BOM展開結果
  const bomRows: ExpandedBomRow[] = (() => {
    if (!selectedProduct) return [];
    const nodes = BOM_DATA[selectedProduct] || [];
    return nodes.map((node) => {
      const totalQty = parseFloat((node.requiredQty * targetQty * (1 + node.lossRate / 100)).toFixed(1));
      return {
        ...node,
        totalQty,
        shortage: node.stockQty - totalQty,
      };
    });
  })();

  const shortageCount = bomRows.filter((r) => r.shortage < 0).length;
  const sufficientCount = bomRows.filter((r) => r.shortage >= 0).length;
  const productInfo = FINISHED_PRODUCTS.find((p) => p.code === selectedProduct);

  const handleSave = () => {
    if (!selectedProduct) {
      toast.error("生産対象の完成品を選択してください。");
      return;
    }
    if (targetQty < 1) {
      toast.error("生産目標数は1以上である必要があります。");
      return;
    }
    toast.success("BOM生産伝票が保存されました（作成中ステータス）");
    navigate("/documents/bom");
  };

  const handleSubmit = () => {
    if (!selectedProduct) {
      toast.error("生産対象の完成品を選択してください。");
      return;
    }
    if (targetQty < 1) {
      toast.error("生産目標数は1以上である必要があります。");
      return;
    }
    if (shortageCount > 0) {
      toast.warning(`不足部品が${shortageCount}件あります。それでも申請しますか？`);
    }
    toast.success("BOM生産伝票が申請されました");
    navigate("/documents/bom");
  };

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/documents/bom")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              一覧
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-bold text-foreground">新規BOM生産伝票作成</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                完成品の生産計画を立案し、BOM基準の部品過不足を確認します
              </p>
            </div>
          </div>
          <Badge className="bg-muted text-muted-foreground text-xs px-2.5 py-0.5">
            作成中（Draft）
          </Badge>
        </div>

        {/* Header Info */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              伝票ヘッダー情報
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票番号</label>
                <Input value={slipNo} readOnly className="h-8 text-xs font-mono bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">作成日付</label>
                <Input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="h-8 text-xs border-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">起案者（部署）</label>
                <Input value={`${requester}（${department}）`} readOnly className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">生産目標数</label>
                <Input
                  type="number"
                  min={1}
                  value={targetQty}
                  onChange={(e) => setTargetQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-8 text-xs border-border font-mono"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">生産対象完成品</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="完成品を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {FINISHED_PRODUCTS.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        <span className="font-mono text-primary mr-2">{p.code}</span>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">備考</label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="生産伝票に関する備考事項を入力してください"
                  className="text-xs border-border min-h-[60px] resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BOM Expansion Result */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                BOM展開結果
                {productInfo && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-primary">
                    {productInfo.code}
                  </Badge>
                )}
              </CardTitle>
              {bomRows.length > 0 && (
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-3 h-3" /> 充足 {sufficientCount}件
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="w-3 h-3" /> 不足 {shortageCount}件
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {!selectedProduct ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Layers className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">生産対象の完成品を選択するとBOMが自動展開されます</p>
              </div>
            ) : bomRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">該当完成品のBOMデータが存在しません</p>
              </div>
            ) : (
              <>
                {/* 完成品サマリー */}
                <div className="px-4 py-2.5 bg-primary/5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary">L0</Badge>
                    <span className="text-xs font-mono text-primary">{selectedProduct}</span>
                    <span className="text-xs font-bold text-foreground">{productInfo?.name}</span>
                  </div>
                  <span className="text-xs font-mono text-foreground">目標: {targetQty}台</span>
                </div>

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
                      {bomRows.map((item, idx) => (
                        <TableRow key={idx} className="border-border hover:bg-secondary/50">
                          <TableCell className="px-3 py-2">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                              item.level === 1 ? "border-info/50 text-info" : "border-muted-foreground/50 text-muted-foreground"
                            }`}>
                              L{item.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs font-mono text-primary" style={{ paddingLeft: `${12 + item.level * 16}px` }}>
                            <span className="text-muted-foreground/40 mr-1">└</span>
                            {item.itemCode}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-foreground">{item.itemName}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{item.requiredQty}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-muted-foreground">
                            {item.lossRate > 0 ? `${item.lossRate}%` : "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono font-medium text-foreground">
                            {item.totalQty.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                            {item.stockQty.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {item.shortage >= 0 ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                              )}
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
                    <span className="text-muted-foreground">部品 計 {bomRows.length}件</span>
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="w-3 h-3" /> 不足 {shortageCount}件
                    </span>
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3 h-3" /> 充足 {sufficientCount}件
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/documents/bom")}
            className="gap-1.5 text-xs"
          >
            キャンセル
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="gap-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            一時保存
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-3.5 h-3.5" />
            生産申請
          </Button>
        </div>
      </div>
    </ERPLayout>
  );
};

export default BomSlipCreate;