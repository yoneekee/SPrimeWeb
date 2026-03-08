import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import ItemSelectModal, { CatalogItem } from "@/components/erp/ItemSelectModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ShipmentDetailItem {
  id: number;
  itemCode: string;
  itemName: string;
  stockQty: number;
  shipQty: number;
  unitPrice: number;
  salesAmount: number;
  inTransit: boolean;
  lotNo: string;
}

const PRODUCT_CATALOG: CatalogItem[] = [
  { code: "FIN-ETCH-500", name: "プラズマエッチング装置 PE-500", stockQty: 12, unit: "EA", price: 45000000 },
  { code: "FIN-CVD-300", name: "CVD成膜装置 CV-300", stockQty: 8, unit: "EA", price: 78000000 },
  { code: "FIN-SPUT-200", name: "スパッタリング装置 SP-200", stockQty: 5, unit: "EA", price: 62000000 },
  { code: "SEMI-CHUCK-01", name: "精密ウェーハチャックモジュール", stockQty: 45, unit: "EA", price: 3200000 },
  { code: "SEMI-ALIGN-02", name: "自動アライメントモジュール AL-02", stockQty: 30, unit: "EA", price: 5600000 },
  { code: "FIN-CMP-100", name: "CMP研磨装置 CM-100", stockQty: 3, unit: "EA", price: 95000000 },
  { code: "SEMI-VALVE-05", name: "超高真空バルブ UV-05", stockQty: 120, unit: "EA", price: 850000 },
  { code: "FIN-CLEAN-400", name: "洗浄装置 CL-400", stockQty: 6, unit: "EA", price: 38000000 },
];

const CUSTOMERS = [
  { value: "tel", label: "東京エレクトロン(株)" },
  { value: "screen", label: "SCREEN HD(株)" },
  { value: "disco", label: "ディスコ(株)" },
  { value: "tsmc", label: "TSMC Japan" },
  { value: "renesas", label: "ルネサス(株)" },
];

const WAREHOUSES = [
  { value: "wh1", label: "本社 第1倉庫" },
  { value: "wh2", label: "本社 第2倉庫" },
  { value: "wh3", label: "渋谷物流センター" },
  { value: "wh4", label: "大阪物流センター" },
];

const generateSlipNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `SHP${y}${m}${d}-${seq}`;
};

const ShipmentSlipCreate = () => {
  const navigate = useNavigate();
  const [slipNo] = useState(generateSlipNo());
  const [shipDate, setShipDate] = useState(new Date().toISOString().split("T")[0]);
  const [requester] = useState("高橋 修平");
  const [department] = useState("物流課");
  const [customer, setCustomer] = useState("");
  const [deliveryAddr, setDeliveryAddr] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [remark, setRemark] = useState("");
  const [details, setDetails] = useState<ShipmentDetailItem[]>([]);
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
        stockQty: catalogItem.stockQty || 0,
        shipQty: 1,
        unitPrice: catalogItem.price,
        salesAmount: catalogItem.price,
        inTransit: true,
        lotNo: "",
      },
    ]);
    setNextId((n) => n + 1);
    toast.success(`${catalogItem.name} を追加しました`);
  };

  const removeItem = (id: number) => {
    setDetails((prev) => prev.filter((d) => d.id !== id));
  };

  const updateShipQty = (id: number, qty: number) => {
    setDetails((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, shipQty: qty, salesAmount: qty * d.unitPrice }
          : d
      )
    );
  };

  const updateLot = (id: number, lot: string) => {
    setDetails((prev) =>
      prev.map((d) => (d.id === id ? { ...d, lotNo: lot } : d))
    );
  };

  const updateTransit = (id: number, checked: boolean) => {
    setDetails((prev) =>
      prev.map((d) => (d.id === id ? { ...d, inTransit: checked } : d))
    );
  };

  const totalAmount = details.reduce((sum, d) => sum + d.salesAmount, 0);
  const hasStockWarning = details.some((d) => d.shipQty > d.stockQty);

  const handleSave = () => {
    if (details.length === 0) {
      toast.error("1件以上の品目を追加してください。");
      return;
    }
    toast.success("出庫伝票を保存しました（作成中ステータス）");
    navigate("/production/shipping");
  };

  const handleSubmit = () => {
    if (details.length === 0) {
      toast.error("1件以上の品目を追加してください。");
      return;
    }
    if (!customer) {
      toast.error("得意先を選択してください。");
      return;
    }
    if (!warehouse) {
      toast.error("出発地倉庫を選択してください。");
      return;
    }
    if (hasStockWarning) {
      toast.error("出庫数量が実在庫を超過する品目があります。");
      return;
    }
    toast.success("出庫伝票を申請しました");
    navigate("/production/shipping");
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
              onClick={() => navigate("/production/shipping")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              一覧
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-bold text-foreground">新規出庫伝票作成</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                完成品出庫のための新規伝票を作成します
              </p>
            </div>
          </div>
          <Badge className="bg-muted text-muted-foreground text-xs px-2.5 py-0.5">
            作成中 (Draft)
          </Badge>
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
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">出庫希望日</label>
                <Input
                  type="date"
                  value={shipDate}
                  onChange={(e) => setShipDate(e.target.value)}
                  className="h-8 text-xs border-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">申請者（部署）</label>
                <Input value={`${requester}（${department}）`} readOnly className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">得意先</label>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="得意先を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMERS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">配送先住所</label>
                <Input
                  value={deliveryAddr}
                  onChange={(e) => setDeliveryAddr(e.target.value)}
                  placeholder="配送先住所を入力してください"
                  className="h-8 text-xs border-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">出発地倉庫</label>
                <Select value={warehouse} onValueChange={setWarehouse}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="倉庫を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSES.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">出庫合計金額</label>
                <Input
                  value={`¥${totalAmount.toLocaleString()}`}
                  readOnly
                  className="h-8 text-xs font-mono bg-muted/50 border-border text-primary font-semibold"
                />
              </div>
              <div className="col-span-2 md:col-span-4 space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">備考</label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="出庫伝票に関する備考事項を入力してください"
                  className="text-xs border-border min-h-[60px] resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Item Add */}
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

        <ItemSelectModal
          open={isItemModalOpen}
          onOpenChange={setIsItemModalOpen}
          items={PRODUCT_CATALOG}
          onSelect={addItem}
          selectedCodes={details.map((d) => d.itemCode)}
          showStock={true}
          title="出庫品目選択"
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
              {hasStockWarning && (
                <div className="flex items-center gap-1.5 text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px]">在庫不足品目あり</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {details.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">出庫する品目を検索して追加してください</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目コード</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目名</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">実在庫</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">出庫数量</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">単価</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">売上金額</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">積送対象</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">LOT番号</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((item) => {
                        const overStock = item.shipQty > item.stockQty;
                        return (
                          <TableRow key={item.id} className={`border-border hover:bg-secondary/50 ${overStock ? "bg-destructive/5" : ""}`}>
                            <TableCell className="px-3 py-2 text-xs font-mono text-primary">{item.itemCode}</TableCell>
                            <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{item.itemName}</TableCell>
                            <TableCell className="px-3 py-2 text-xs text-right font-mono">
                              <span className={item.stockQty <= 5 ? "text-warning" : "text-success"}>
                                {item.stockQty.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-right">
                              <div className="flex items-center justify-end gap-1">
                                {overStock && <AlertTriangle className="w-3 h-3 text-destructive" />}
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.shipQty}
                                  onChange={(e) => updateShipQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                                  className={`h-6 w-20 text-xs text-right border-border ml-auto ${overStock ? "border-destructive text-destructive" : ""}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                              ¥{item.unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                              ¥{item.salesAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-center">
                              <Checkbox
                                checked={item.inTransit}
                                onCheckedChange={(checked) => updateTransit(item.id, !!checked)}
                                className="border-border"
                              />
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs">
                              <Input
                                value={item.lotNo}
                                onChange={(e) => updateLot(item.id, e.target.value)}
                                placeholder="LOT-"
                                className="h-6 w-32 text-xs font-mono border-border"
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
                        );
                      })}
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
            onClick={() => navigate("/production/shipping")}
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
            出庫申請
          </Button>
        </div>
      </div>
    </ERPLayout>
  );
};

export default ShipmentSlipCreate;
