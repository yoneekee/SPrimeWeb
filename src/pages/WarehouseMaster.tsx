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
import { Plus, Search, Pencil, Warehouse, ChevronLeft, ChevronRight } from "lucide-react";

interface Location {
  locId: number;
  locName: string;
  locType: string;
  typeName: string;
  postalCode: string;
  address: string;
  contactInfo: string;
  isActive: boolean;
  remarks: string;
}

const mockLocations: Location[] = [
  { locId: 1, locName: "本社 第1倉庫", locType: "FACTORY", typeName: "工場", postalCode: "150-0002", address: "東京都渋谷区渋谷1-2-3 本社ビルB1F", contactInfo: "03-1234-5678", isActive: true, remarks: "クリーンルーム環境（Class 1000）" },
  { locId: 2, locName: "本社 第2倉庫", locType: "FACTORY", typeName: "工場", postalCode: "150-0002", address: "東京都渋谷区渋谷1-2-3 本社ビル1F", contactInfo: "03-1234-5679", isActive: true, remarks: "一般資材保管" },
  { locId: 3, locName: "渋谷物流センター", locType: "STORE", typeName: "倉庫", postalCode: "150-0041", address: "東京都渋谷区神南2-5-10", contactInfo: "03-9876-5432", isActive: true, remarks: "出荷前ステージング専用" },
  { locId: 4, locName: "平沢FAB納品拠点", locType: "VENDOR", typeName: "取引先", postalCode: "", address: "京畿道平沢市三南面サムスンロ1キル30", contactInfo: "031-000-0000", isActive: true, remarks: "サムスン電子 平沢キャンパス" },
  { locId: 5, locName: "輸送中（積送）", locType: "TRANSIT", typeName: "積送", postalCode: "", address: "輸送中", contactInfo: "-", isActive: true, remarks: "積送品勘定管理用仮想拠点" },
  { locId: 6, locName: "大阪支店倉庫", locType: "FACTORY", typeName: "工場", postalCode: "530-0001", address: "大阪府大阪市北区梅田3-1-1", contactInfo: "06-1111-2222", isActive: false, remarks: "2024.01 閉鎖" },
];

const TYPE_OPTIONS = [
  { code: "FACTORY", name: "工場（FACTORY）" },
  { code: "STORE", name: "倉庫（STORE）" },
  { code: "TRANSIT", name: "積送（TRANSIT）" },
  { code: "VENDOR", name: "取引先（VENDOR）" },
];

const WarehouseMaster = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const openNew = () => { setEditingLoc(null); setDialogOpen(true); };
  const openEdit = (loc: Location) => { setEditingLoc(loc); setDialogOpen(true); };

  const filtered = typeFilter === "all" ? mockLocations : mockLocations.filter(l => l.locType === typeFilter);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <ERPLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">倉庫拠点マスタ</h1>
            <p className="text-xs text-muted-foreground mt-0.5">倉庫・倉庫・積送など拠点情報の登録および管理</p>
          </div>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs" onClick={openNew}>
            <Plus className="w-3.5 h-3.5" /> 拠点新規登録
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardContent className="px-4 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">拠点名</label>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1 h-8">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-28" placeholder="拠点名検索" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">拠点種別</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 text-xs border-border w-32">
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

        {/* Location List */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-primary" />
              倉庫拠点一覧
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground ml-1">{filtered.length}件</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-16">拠点ID</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">拠点名称</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">拠点種別</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">住所</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">使用状態</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">編集</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((loc) => (
                    <TableRow key={loc.locId} className="border-border hover:bg-secondary/50">
                      <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">{loc.locId}</TableCell>
                      <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{loc.locName}</TableCell>
                      <TableCell className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                          loc.locType === "FACTORY" ? "border-primary/50 text-primary" :
                          loc.locType === "STORE" ? "border-info/50 text-info" :
                          loc.locType === "TRANSIT" ? "border-warning/50 text-warning" :
                          "border-success/50 text-success"
                        }`}>
                          {loc.typeName}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[250px]">{loc.address}</TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        {loc.isActive ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">稼働中</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">閉鎖</Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEdit(loc)}>
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-foreground">
                {editingLoc ? "拠点情報編集" : "拠点新規登録"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">拠点名称 <span className="text-destructive">*</span></Label>
                  <Input defaultValue={editingLoc?.locName || ""} className="h-8 text-xs border-border" placeholder="例: 本社 第1倉庫" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">拠点種別 <span className="text-destructive">*</span></Label>
                  <Select defaultValue={editingLoc?.locType || ""}>
                    <SelectTrigger className="h-8 text-xs border-border">
                      <SelectValue placeholder="種別選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">郵便番号（〒）</Label>
                  <Input defaultValue={editingLoc?.postalCode || ""} className="h-8 text-xs border-border" placeholder="000-0000" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">担当者連絡先</Label>
                  <Input defaultValue={editingLoc?.contactInfo || ""} className="h-8 text-xs border-border" placeholder="03-XXXX-XXXX" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">住所</Label>
                <Input defaultValue={editingLoc?.address || ""} className="h-8 text-xs border-border" placeholder="詳細住所入力" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">使用状態</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">閉鎖</span>
                  <Switch defaultChecked={editingLoc?.isActive ?? true} />
                  <span className="text-xs text-foreground">稼働中</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">備考</Label>
                <Textarea defaultValue={editingLoc?.remarks || ""} className="text-xs border-border min-h-[60px]" placeholder="特記事項を記入（危険物保管有無など）" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setDialogOpen(false)}>キャンセル</Button>
              <Button size="sm" className="text-xs bg-primary text-primary-foreground" onClick={() => setDialogOpen(false)}>
                {editingLoc ? "更新保存" : "登録"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
};

export default WarehouseMaster;