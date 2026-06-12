/**
 * ItemMaster — 品目マスタ管理画面
 * 原材料・半製品・完成品の品目情報登録および在庫管理
 *
 * - Validation: zod + react-hook-form (日本語エラーメッセージ)
 * - データ層: localStorage 永続化の itemStore (擬似バックエンド)
 * - UX: 初回ロード時スケルトン、保存/削除に 300〜500ms 遅延 + Toast
 */
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ERPLayout from "@/components/erp/ERPLayout";
import { FormError } from "@/components/erp/FormError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Box, AlertTriangle, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { itemSchema, type ItemFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { itemStore, type ItemRow } from "@/services/master-store";
import { useItems } from "@/hooks/use-master-store";

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

type SortKey = "latest" | "priceDesc" | "priceAsc" | "stockAsc" | "nameAsc";

const ItemMaster = () => {
  const { data: items, loading } = useItems();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemRow | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ItemRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const isEditing = !!editingItem;

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { itemCode: "", itemType: "", itemName: "", spec: "", unit: "", stdPrice: 0, safetyStock: 0, acctCode: "", isActive: true },
    mode: "onChange",
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid }, reset } = form;

  const openNew = () => {
    setEditingItem(null);
    reset({ itemCode: "", itemType: "", itemName: "", spec: "", unit: "", stdPrice: 0, safetyStock: 0, acctCode: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (item: ItemRow) => {
    setEditingItem(item);
    reset({ itemCode: item.itemCode, itemType: item.itemType, itemName: item.itemName, spec: item.spec, unit: item.unit, stdPrice: item.stdPrice, safetyStock: item.safetyStock, acctCode: item.acctCode, isActive: item.isActive });
    setDialogOpen(true);
  };

  const onFormSubmit = async (data: ItemFormValues) => {
    setSubmitting(true);
    const typeName = TYPE_OPTIONS.find(t => t.code === data.itemType)?.name ?? "";
    try {
      if (isEditing && editingItem) {
        await itemStore.update(editingItem.itemId, { ...data, typeName, planQty: editingItem.planQty, stockQty: editingItem.stockQty });
        toast.success("品目情報を更新しました");
      } else {
        await itemStore.create({ ...data, typeName, planQty: 0, stockQty: 0, safetyStock: data.safetyStock ?? 0 });
        toast.success("品目を登録しました");
      }
      setDialogOpen(false);
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await itemStore.remove(deleteTarget.itemId);
      toast.success(`「${deleteTarget.itemName}」を削除しました`);
      setDeleteTarget(null);
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    return items
      .filter(i => typeFilter === "all" || i.itemType === typeFilter)
      .filter(i => !kw || i.itemCode.toLowerCase().includes(kw) || i.itemName.toLowerCase().includes(kw));
  }, [items, typeFilter, searchText]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortKey) {
      case "priceDesc": return arr.sort((a, b) => b.stdPrice - a.stdPrice);
      case "priceAsc":  return arr.sort((a, b) => a.stdPrice - b.stdPrice);
      case "stockAsc":  return arr.sort((a, b) => a.stockQty - b.stockQty);
      case "nameAsc":   return arr.sort((a, b) => a.itemName.localeCompare(b.itemName, "ja"));
      default: return arr; // latest = ストア追加順 (新規が先頭)
    }
  }, [filtered, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paged = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                  <input
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-40"
                    placeholder="コードまたは品目名"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目分類</label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs border-border w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">並べ替え</label>
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <SelectTrigger className="h-8 text-xs border-border w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">最新順</SelectItem>
                    <SelectItem value="priceDesc">単価が高い順</SelectItem>
                    <SelectItem value="priceAsc">単価が安い順</SelectItem>
                    <SelectItem value="stockAsc">在庫が少ない順</SelectItem>
                    <SelectItem value="nameAsc">品目名（あ→ん）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Item List */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Box className="w-4 h-4 text-primary" /> 品目一覧
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground ml-1">{sorted.length}件</Badge>
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
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`sk-${i}`} className="border-border">
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {!loading && paged.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">該当する品目がありません</TableCell></TableRow>
                  )}
                  {!loading && paged.map((item) => {
                    const belowSafety = item.stockQty < item.safetyStock;
                    return (
                      <TableRow key={item.itemId} className="border-border hover:bg-secondary/50">
                        <TableCell className="px-3 py-2 text-xs font-mono text-primary">{item.itemCode}</TableCell>
                        <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{item.itemName}</TableCell>
                        <TableCell className="px-3 py-2">
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0",
                            item.itemType === "RAW" ? "border-info/50 text-info" :
                            item.itemType === "SEMI" ? "border-warning/50 text-warning" : "border-success/50 text-success"
                          )}>{item.typeName}</Badge>
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
                          {item.isActive
                            ? <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">使用中</Badge>
                            : <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">廃番</Badge>}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEdit(item)}>
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setDeleteTarget(item)}>
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">表示件数</span>
              <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="h-7 w-20 text-xs border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5件</SelectItem>
                  <SelectItem value="10">10件</SelectItem>
                  <SelectItem value="15">15件</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {sorted.length}件中 {sorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sorted.length)}件
              </span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs" onClick={() => setCurrentPage(page)}>{page}</Button>
                ))}
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="w-3.5 h-3.5" /></Button>
              </div>
            )}
          </div>
        </Card>

        {/* Detail Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-foreground">
                {isEditing ? "品目情報編集" : "品目新規登録"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目コード <span className="text-destructive">*</span></Label>
                  <Input {...register("itemCode")} disabled={isEditing} className={cn("h-8 text-xs border-border font-mono", errors.itemCode && "border-destructive ring-1 ring-destructive")} placeholder="例: SEMI-CHB-001" />
                  <FormError message={errors.itemCode?.message} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目分類 <span className="text-destructive">*</span></Label>
                  <Select value={watch("itemType")} onValueChange={(v) => setValue("itemType", v, { shouldValidate: true })}>
                    <SelectTrigger className={cn("h-8 text-xs border-border", errors.itemType && "border-destructive ring-1 ring-destructive")}>
                      <SelectValue placeholder="分類選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.itemType?.message} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">品目名称 <span className="text-destructive">*</span></Label>
                <Input {...register("itemName")} className={cn("h-8 text-xs border-border", errors.itemName && "border-destructive ring-1 ring-destructive")} placeholder="品目名入力" />
                <FormError message={errors.itemName?.message} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">詳細規格</Label>
                <Textarea {...register("spec")} className={cn("text-xs border-border min-h-[50px]", errors.spec && "border-destructive")} placeholder="寸法、材質、電圧など" />
                <FormError message={errors.spec?.message} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">管理単位 <span className="text-destructive">*</span></Label>
                  <Select value={watch("unit")} onValueChange={(v) => setValue("unit", v, { shouldValidate: true })}>
                    <SelectTrigger className={cn("h-8 text-xs border-border", errors.unit && "border-destructive ring-1 ring-destructive")}>
                      <SelectValue placeholder="単位" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.unit?.message} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">標準単価 <span className="text-destructive">*</span></Label>
                  <Input type="number" {...register("stdPrice", { valueAsNumber: true })} className={cn("h-8 text-xs border-border", errors.stdPrice && "border-destructive ring-1 ring-destructive")} placeholder="0" />
                  <FormError message={errors.stdPrice?.message} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">安全在庫量</Label>
                  <Input type="number" {...register("safetyStock", { valueAsNumber: true })} className={cn("h-8 text-xs border-border", errors.safetyStock && "border-destructive ring-1 ring-destructive")} placeholder="0" />
                  <FormError message={errors.safetyStock?.message} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">基本勘定科目 <span className="text-destructive">*</span></Label>
                <Select value={watch("acctCode")} onValueChange={(v) => setValue("acctCode", v, { shouldValidate: true })}>
                  <SelectTrigger className={cn("h-8 text-xs border-border", errors.acctCode && "border-destructive ring-1 ring-destructive")}>
                    <SelectValue placeholder="勘定科目選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCT_OPTIONS.map(a => <SelectItem key={a.code} value={a.code}>{a.code}: {a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormError message={errors.acctCode?.message} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">使用状態</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">廃番</span>
                  <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
                  <span className="text-xs text-foreground">使用中</span>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setDialogOpen(false)}>キャンセル</Button>
                <Button type="submit" size="sm" disabled={!isValid || submitting} className="text-xs bg-primary text-primary-foreground disabled:opacity-50 gap-1.5">
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  {submitting ? "保存中..." : isEditing ? "更新保存" : "登録"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sm">品目の削除確認</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                「{deleteTarget?.itemName}」({deleteTarget?.itemCode}) を削除します。<br />
                この操作は取り消せません。よろしいですか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs" disabled={deleting}>キャンセル</AlertDialogCancel>
              <AlertDialogAction className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5" disabled={deleting} onClick={(e) => { e.preventDefault(); confirmDelete(); }}>
                {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                {deleting ? "削除中..." : "削除する"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ERPLayout>
  );
};

export default ItemMaster;
