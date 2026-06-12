/**
 * WarehouseMaster — 倉庫拠点マスタ
 * - localStorage 永続化 (locationStore)
 * - zod + RHF バリデーション、擬似 API 遅延、削除確認モーダル
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
import { Plus, Search, Pencil, Warehouse, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { warehouseSchema, type WarehouseFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { locationStore, type LocationRow } from "@/services/master-store";
import { useLocations } from "@/hooks/use-master-store";

const TYPE_OPTIONS = [
  { code: "FACTORY", name: "工場（FACTORY）" },
  { code: "STORE", name: "倉庫（STORE）" },
  { code: "TRANSIT", name: "積送（TRANSIT）" },
  { code: "VENDOR", name: "取引先（VENDOR）" },
];

const WarehouseMaster = () => {
  const { data: locations, loading } = useLocations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationRow | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LocationRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const isEditing = !!editingLoc;

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { locName: "", locType: "", postalCode: "", address: "", contactInfo: "", isActive: true, remarks: "" },
    mode: "onChange",
  });
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid }, reset } = form;

  const openNew = () => {
    setEditingLoc(null);
    reset({ locName: "", locType: "", postalCode: "", address: "", contactInfo: "", isActive: true, remarks: "" });
    setDialogOpen(true);
  };

  const openEdit = (loc: LocationRow) => {
    setEditingLoc(loc);
    reset({
      locName: loc.locName, locType: loc.locType,
      postalCode: loc.postalCode ?? "", address: loc.address ?? "",
      contactInfo: loc.contactInfo ?? "", isActive: loc.isActive,
      remarks: loc.remarks ?? "",
    });
    setDialogOpen(true);
  };

  const onFormSubmit = async (data: WarehouseFormValues) => {
    setSubmitting(true);
    const typeName = TYPE_OPTIONS.find(t => t.code === data.locType)?.name.replace(/（.+?）/, "") ?? "";
    try {
      if (isEditing && editingLoc) {
        await locationStore.update(editingLoc.locId, { ...data, typeName, postalCode: data.postalCode ?? "", address: data.address ?? "", contactInfo: data.contactInfo ?? "", remarks: data.remarks ?? "" });
        toast.success("拠点情報を更新しました");
      } else {
        await locationStore.create({ ...data, typeName, postalCode: data.postalCode ?? "", address: data.address ?? "", contactInfo: data.contactInfo ?? "", remarks: data.remarks ?? "" });
        toast.success("拠点を登録しました");
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
      await locationStore.remove(deleteTarget.locId);
      toast.success(`「${deleteTarget.locName}」を削除しました`);
      setDeleteTarget(null);
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    return locations
      .filter(l => typeFilter === "all" || l.locType === typeFilter)
      .filter(l => !kw || l.locName.toLowerCase().includes(kw) || l.address.toLowerCase().includes(kw));
  }, [locations, typeFilter, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
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
                  <input
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-40"
                    placeholder="拠点名・住所で検索"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">拠点種別</label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs border-border w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={`sk-${i}`} className="border-border">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {!loading && paged.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">該当する拠点がありません</TableCell></TableRow>
                  )}
                  {!loading && paged.map((loc) => (
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
                        <div className="flex items-center justify-center gap-0.5">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEdit(loc)}>
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setDeleteTarget(loc)}>
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">表示件数</span>
              <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="h-7 w-20 text-xs border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5件</SelectItem>
                  <SelectItem value="10">10件</SelectItem>
                  <SelectItem value="15">15件</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {filtered.length}件中 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)}件
              </span>
            </div>
            {totalPages > 1 && (
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
            )}
          </div>
        </Card>

        {/* Detail Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-foreground">
                {isEditing ? "拠点情報編集" : "拠点新規登録"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">拠点名称 <span className="text-destructive">*</span></Label>
                  <Input {...register("locName")} className={cn("h-8 text-xs border-border", errors.locName && "border-destructive ring-1 ring-destructive")} placeholder="例: 本社 第1倉庫" />
                  <FormError message={errors.locName?.message} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">拠点種別 <span className="text-destructive">*</span></Label>
                  <Select value={watch("locType")} onValueChange={(v) => setValue("locType", v, { shouldValidate: true })}>
                    <SelectTrigger className={cn("h-8 text-xs border-border", errors.locType && "border-destructive ring-1 ring-destructive")}>
                      <SelectValue placeholder="種別選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.locType?.message} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">郵便番号（〒）</Label>
                  <Input {...register("postalCode")} className={cn("h-8 text-xs border-border", errors.postalCode && "border-destructive ring-1 ring-destructive")} placeholder="000-0000" />
                  <FormError message={errors.postalCode?.message} />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">担当者連絡先</Label>
                  <Input {...register("contactInfo")} className={cn("h-8 text-xs border-border", errors.contactInfo && "border-destructive ring-1 ring-destructive")} placeholder="03-XXXX-XXXX" />
                  <FormError message={errors.contactInfo?.message} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">住所</Label>
                <Input {...register("address")} className={cn("h-8 text-xs border-border", errors.address && "border-destructive ring-1 ring-destructive")} placeholder="詳細住所入力" />
                <FormError message={errors.address?.message} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">使用状態</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">閉鎖</span>
                  <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
                  <span className="text-xs text-foreground">稼働中</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">備考</Label>
                <Textarea {...register("remarks")} className={cn("text-xs border-border min-h-[60px]", errors.remarks && "border-destructive")} placeholder="特記事項を記入（危険物保管有無など）" />
                <FormError message={errors.remarks?.message} />
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
              <AlertDialogTitle className="text-sm">拠点の削除確認</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                「{deleteTarget?.locName}」を削除します。<br />
                関連する在庫データがある場合は事前にご確認ください。
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

export default WarehouseMaster;