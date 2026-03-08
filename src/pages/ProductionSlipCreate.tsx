import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ERPLayout from "@/components/erp/ERPLayout";
import ItemSelectModal, { CatalogItem } from "@/components/erp/ItemSelectModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface NewDetailItem {
  id: number;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  orderQty: number;
  unitPrice: number;
  supplyAmount: number;
  lotNo: string;
}

const ITEM_CATALOG: CatalogItem[] = [
  { code: "SEMI-WAFER-01", name: "シリコンウェーハ 300mm", spec: "300mm / P-type", unit: "EA", price: 85000 },
  { code: "SEMI-WAFER-02", name: "シリコンウェーハ 200mm", spec: "200mm / N-type", unit: "EA", price: 62000 },
  { code: "SEMI-CHEM-03", name: "フォトレジスト AZ-5214", spec: "1L / UV-grade", unit: "EA", price: 120000 },
  { code: "SEMI-CHEM-04", name: "現像液 AZ-300MIF", spec: "5L / TMAH", unit: "EA", price: 95000 },
  { code: "SEMI-GAS-07", name: "高純度窒素ガス (N₂)", spec: "99.999% / 47L", unit: "SET", price: 45000 },
  { code: "SEMI-GAS-08", name: "高純度アルゴンガス (Ar)", spec: "99.9999% / 47L", unit: "SET", price: 78000 },
  { code: "SEMI-PART-10", name: "石英ボート 6インチ", spec: "6\" / 25slot", unit: "EA", price: 350000 },
  { code: "SEMI-PART-11", name: "O-Ring (Viton)", spec: "ID200 x 5.0", unit: "EA", price: 12000 },
];

const generateSlipNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `SLP${y}${m}${d}-${seq}`;
};

const ProductionSlipCreate = () => {
  const navigate = useNavigate();
  const [slipNo] = useState(generateSlipNo());
  const [reqDate, setReqDate] = useState(new Date().toISOString().split("T")[0]);
  const [requester] = useState("田中 太郎");
  const [department] = useState("製造1課");
  const [vendor, setVendor] = useState("");
  const [remark, setRemark] = useState("");
  const [details, setDetails] = useState<NewDetailItem[]>([]);
  const [nextId, setNextId] = useState(1);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const addItem = (catalogItem: CatalogItem) => {
    const existing = details.find((d) => d.itemCode === catalogItem.code);
    if (existing) {
      toast.error("既に追加済みの品目です。");
      return;
    }
    setDetails((prev) => [
      ...prev,
      {
        id: nextId,
        itemCode: catalogItem.code,
        itemName: catalogItem.name,
        spec: catalogItem.spec || "",
        unit: catalogItem.unit,
        orderQty: 1,
        unitPrice: catalogItem.price,
        supplyAmount: catalogItem.price,
        lotNo: "",
      },
    ]);
    setNextId((n) => n + 1);
    toast.success(`${catalogItem.name} を追加しました`);
  };

  const removeItem = (id: number) => {
    setDetails((prev) => prev.filter((d) => d.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    setDetails((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, orderQty: qty, supplyAmount: qty * d.unitPrice }
          : d
      )
    );
  };

  const updateLot = (id: number, lot: string) => {
    setDetails((prev) =>
      prev.map((d) => (d.id === id ? { ...d, lotNo: lot } : d))
    );
  };

  const totalAmount = details.reduce((sum, d) => sum + d.supplyAmount, 0);

  const handleSave = () => {
    if (details.length === 0) {
      toast.error("1件以上の品目を追加してください。");
      return;
    }
    toast.success("伝票を保存しました（作成中ステータス）");
    navigate("/production/execution");
  };

  const handleSubmit = () => {
    if (details.length === 0) {
      toast.error("1件以上の品目を追加してください。");
      return;
    }
    if (!vendor) {
      toast.error("希望発注先を選択してください。");
      return;
    }
    toast.success("伝票を申請しました");
    navigate("/production/execution");
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
              onClick={() => navigate("/production/execution")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              一覧
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-bold text-foreground">新規伝票作成</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                原材料調達のための新規伝票を作成します
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-muted text-muted-foreground text-xs px-2.5 py-0.5">
              作成中 (Draft)
            </Badge>
          </div>
        </div>

        {/* Header Info */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              伝票ヘッダ情報
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票番号</label>
                <Input value={slipNo} readOnly className="h-8 text-xs font-mono bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">申請日</label>
                <Input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="h-8 text-xs border-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">申請者（部署）</label>
                <Input value={`${requester}（${department}）`} readOnly className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">希望発注先</label>
                <Select value={vendor} onValueChange={setVendor}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="発注先を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokyo">東京半導体(株)</SelectItem>
                    <SelectItem value="osaka">大阪精密(株)</SelectItem>
                    <SelectItem value="nagoya">名古屋素材(株)</SelectItem>
                    <SelectItem value="screen">SCREEN HD(株)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 md:col-span-3 space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">備考</label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="伝票に関する備考事項を入力してください"
                  className="text-xs border-border min-h-[60px] resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">合計金額</label>
                <Input
                  value={`¥${totalAmount.toLocaleString()}`}
                  readOnly
                  className="h-8 text-xs font-mono bg-muted/50 border-border text-primary font-semibold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Item Add Button */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">品目追加</CardTitle>
              <Button
                size="sm"
                onClick={() => setIsItemModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                品目選択
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Item Select Modal */}
        <ItemSelectModal
          open={isItemModalOpen}
          onOpenChange={setIsItemModalOpen}
          items={ITEM_CATALOG}
          onSelect={addItem}
          selectedCodes={details.map((d) => d.itemCode)}
          title="原材料品目選択"
        />

        {/* Detail Items */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                明細品目一覧
                {details.length > 0 && (
                  <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                    {details.length}件
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {details.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">品目を検索して追加してください</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目コード</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目名</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">規格</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">単位</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">発注数量</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">単価</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">供給価額</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">LOT番号</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((item) => (
                        <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                          <TableCell className="px-3 py-2 text-xs font-mono text-primary">{item.itemCode}</TableCell>
                          <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{item.itemName}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-muted-foreground">{item.spec}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-center text-muted-foreground">{item.unit}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">
                            <Input
                              type="number"
                              min={1}
                              value={item.orderQty}
                              onChange={(e) => updateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                              className="h-6 w-20 text-xs text-right border-border ml-auto"
                            />
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                            ¥{item.unitPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                            ¥{item.supplyAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs">
                            <Input
                              value={item.lotNo}
                              onChange={(e) => updateLot(item.id, e.target.value)}
                              placeholder="LOT-"
                              className="h-6 w-28 text-xs font-mono border-border"
                            />
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30">
                  <span className="text-xs text-muted-foreground">合計</span>
                  <span className="text-sm font-mono font-bold text-primary">
                    ¥{totalAmount.toLocaleString()}
                  </span>
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
            onClick={() => navigate("/production/execution")}
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
            申請
          </Button>
        </div>
      </div>
    </ERPLayout>
  );
};

export default ProductionSlipCreate;
