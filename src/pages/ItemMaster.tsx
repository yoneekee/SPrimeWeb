import { useState } from "react";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Pencil, Box, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

interface Item {
  itemId: number;
  itemCode: string;
  itemName: string;
  itemType: string;
  typeName: string;
  spec: string;
  unit: string;
  stdPrice: number;
  planQty: number;
  stockQty: number;
  safetyStock: number;
  acctCode: string;
  isActive: boolean;
}

const mockItems: Item[] = [
  { itemId: 1, itemCode: "RAW-WAFER-300", itemName: "シリコンウェーハ 300mm", itemType: "RAW", typeName: "原材料", spec: "300mm / P-type", unit: "EA", stdPrice: 85000, planQty: 200, stockQty: 300, safetyStock: 100, acctCode: "1101", isActive: true },
  { itemId: 2, itemCode: "RAW-CHEM-AZ", itemName: "フォトレジスト AZ-5214", itemType: "RAW", typeName: "原材料", spec: "1L / UV-grade", unit: "EA", stdPrice: 120000, planQty: 50, stockQty: 80, safetyStock: 30, acctCode: "1101", isActive: true },
  { itemId: 3, itemCode: "RAW-GAS-N2", itemName: "高純度窒素ガス（N2）", itemType: "RAW", typeName: "原材料", spec: "99.999% / 47L", unit: "SET", stdPrice: 45000, planQty: 20, stockQty: 15, safetyStock: 20, acctCode: "1101", isActive: true },
  { itemId: 4, itemCode: "SEMI-CHAMBER-01", itemName: "真空チャンバーモジュール", itemType: "SEMI", typeName: "半製品", spec: "SUS316L / Φ500", unit: "EA", stdPrice: 3500000, planQty: 5, stockQty: 8, safetyStock: 3, acctCode: "1102", isActive: true },
  { itemId: 5, itemCode: "SEMI-RF-GEN", itemName: "RF発生器ユニット", itemType: "SEMI", typeName: "半製品", spec: "13.56MHz / 3kW", unit: "EA", stdPrice: 8200000, planQty: 5, stockQty: 3, safetyStock: 2, acctCode: "1102", isActive: true },
  { itemId: 6, itemCode: "FIN-ETCH-500", itemName: "プラズマエッチング装置 PE-500", itemType: "FIN", typeName: "完成品", spec: "Standard Config", unit: "SET", stdPrice: 45000000, planQty: 0, stockQty: 2, safetyStock: 1, acctCode: "1103", isActive: true },
  { itemId: 7, itemCode: "FIN-CVD-300", itemName: "CVD成膜装置 CV-300", itemType: "FIN", typeName: "完成品", spec: "Standard Config", unit: "SET", stdPrice: 78000000, planQty: 0, stockQty: 8, safetyStock: 2, acctCode: "1103", isActive: true },
  { itemId: 8, itemCode: "RAW-ORING-VT", itemName: "バイトン Oリング（Φ300）", itemType: "RAW", typeName: "原材料", spec: "Viton / Φ300", unit: "EA", stdPrice: 15000, planQty: 0, stockQty: 25, safetyStock: 50, acctCode: "1101", isActive: false },
];

const TYPE_OPTIONS = [
  { code: "RAW", name: "原材料" },
  { code: "SEMI", name: "半製品" },
  { code: "FIN", name: "完成品" },
];

const UNIT_OPTIONS = ["EA", "SET", "KG", "BOX", "L"];

const ACCT_OPTIONS = [
  { code: "1101", name: "原材料" },
  { code: "1102", name: "半製品（仕掛品）" },
  { code: "1103", name: "完成品（製品）" },
];

const ItemMaster = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const openNew = () => { setEditingItem(null); setDialogOpen(true); };
  const openEdit = (item: Item) => { setEditingItem(item); setDialogOpen(true); };

  const filtered = typeFilter === "all" ? mockItems : mockItems.filter(i => i.itemType === typeFilter);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <ERPLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">品目マスタ</h1>
            <p className="text-xs text-muted-foreground mt-0.5">原材料・半製品・完成品の品目情報登録および在庫管理</p>
          </div>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs" onClick={openNew}>
            <Plus className="w-3.5 h-3.5" /> 品目新規登録
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardContent className="px-4 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目コード/名</label>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1 h-8">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-32" placeholder="コードまたは品目名" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目分類</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 text-xs border-border w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground">
                <Search className="w-3 h-3" /> 照会
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Item List */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Box className="w-4 h-4 text-primary" />
              品目一覧
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground ml-1">{filtered.length}件</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目コード</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目名</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">分類</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">規格</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">予定在庫</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">実在庫</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">標準単価</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">ステータス</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">編集</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((item) => {
                    const belowSafety = item.stockQty < item.safetyStock;
                    return (
                      <TableRow key={item.itemId} className="border-border hover:bg-secondary/50">
                        <TableCell className="px-3 py-2 text-xs font-mono text-primary">{item.itemCode}</TableCell>
                        <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{item.itemName}</TableCell>
                        <TableCell className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                            item.itemType === "RAW" ? "border-info/50 text-info" :
                            item.itemType === "SEMI" ? "border-warning/50 text-warning" :
                            "border-success/50 text-success"
                          }`}>
                            {item.typeName}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground">{item.spec}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono text-muted-foreground">{item.planQty.toLocaleString()}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono">
                          <span className="flex items-center justify-end gap-1">
                            {belowSafety && <AlertTriangle className="w-3 h-3 text-destructive" />}
                            <span className={belowSafety ? "text-destructive font-medium" : "text-foreground"}>{item.stockQty.toLocaleString()}</span>
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">¥{item.stdPrice.toLocaleString()}</TableCell>
                        <TableCell className="px-3 py-2 text-center">
                          {item.isActive ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">使用中</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">廃番</Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEdit(item)}>
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {filtered.length}件中 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)}件
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Detail Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-foreground">
                {editingItem ? "品目情報編集" : "品目新規登録"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目コード <span className="text-destructive">*</span></Label>
                  <Input defaultValue={editingItem?.itemCode || ""} disabled={!!editingItem} className="h-8 text-xs border-border font-mono" placeholder="例: SEMI-CHB-001" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目分類 <span className="text-destructive">*</span></Label>
                  <Select defaultValue={editingItem?.itemType || ""}>
                    <SelectTrigger className="h-8 text-xs border-border">
                      <SelectValue placeholder="分類選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目名称 <span className="text-destructive">*</span></Label>
                <Input defaultValue={editingItem?.itemName || ""} className="h-8 text-xs border-border" placeholder="品目名入力" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">詳細規格</Label>
                <Textarea defaultValue={editingItem?.spec || ""} className="text-xs border-border min-h-[50px]" placeholder="寸法、材質、電圧など" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">管理単位 <span className="text-destructive">*</span></Label>
                  <Select defaultValue={editingItem?.unit || ""}>
                    <SelectTrigger className="h-8 text-xs border-border">
                      <SelectValue placeholder="単位" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">標準単価 <span className="text-destructive">*</span></Label>
                  <Input type="number" defaultValue={editingItem?.stdPrice || ""} className="h-8 text-xs border-border" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">安全在庫量</Label>
                  <Input type="number" defaultValue={editingItem?.safetyStock || ""} className="h-8 text-xs border-border" placeholder="0" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">基本勘定科目 <span className="text-destructive">*</span></Label>
                <Select defaultValue={editingItem?.acctCode || ""}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="勘定科目選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCT_OPTIONS.map(a => <SelectItem key={a.code} value={a.code}>{a.code}: {a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">使用状態</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">廃番</span>
                  <Switch defaultChecked={editingItem?.isActive ?? true} />
                  <span className="text-xs text-foreground">使用中</span>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setDialogOpen(false)}>キャンセル</Button>
              <Button size="sm" className="text-xs bg-primary text-primary-foreground" onClick={() => setDialogOpen(false)}>
                {editingItem ? "更新保存" : "登録"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
};

export default ItemMaster;