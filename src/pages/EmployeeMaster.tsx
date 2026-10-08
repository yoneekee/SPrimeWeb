/**
 * EmployeeMaster — 社員マスタ管理画面
 * - localStorage 永続化 (employeeStore)
 * - 擬似 API 遅延 + Toast + 削除確認モーダル
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
import { Plus, Search, Pencil, Users, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { employeeSchema, employeeEditSchema, type EmployeeFormValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { employeeStore, type EmployeeRow } from "@/services/master-store";
import { useEmployees } from "@/hooks/use-master-store";

const DEPT_OPTIONS = [
  { code: "MFG1", name: "製造1課" },
  { code: "MFG2", name: "製造2課" },
  { code: "MGT", name: "経営管理課" },
  { code: "LOG", name: "物流課" },
  { code: "QC", name: "品質管理課" },
  { code: "ACC", name: "経理課" },
];

const ROLE_OPTIONS = [
  { code: "APPROVER", name: "承認者" },
  { code: "PROD", name: "製造担当" },
  { code: "INSP", name: "検収担当" },
];

const EmployeeMaster = () => {
  const { data: employees, loading } = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeRow | null>(null);
  const [deptFilter, setDeptFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const isEditing = !!editingEmp;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(isEditing ? employeeEditSchema : employeeSchema),
    defaultValues: { loginId: "", password: "", empName: "", deptCode: "", roleType: "", email: "", isActive: true, remarks: "" },
    mode: "onChange",
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid }, reset } = form;

  const openNew = () => {
    setEditingEmp(null);
    reset({ loginId: "", password: "", empName: "", deptCode: "", roleType: "", email: "", isActive: true, remarks: "" });
    setDialogOpen(true);
  };

  const openEdit = (emp: EmployeeRow) => {
    setEditingEmp(emp);
    reset({ loginId: emp.loginId, password: "", empName: emp.empName, deptCode: emp.deptCode, roleType: emp.roleType, email: emp.email, isActive: emp.isActive, remarks: emp.remarks });
    setDialogOpen(true);
  };

  const onFormSubmit = async (data: EmployeeFormValues) => {
    setSubmitting(true);
    const deptName = DEPT_OPTIONS.find(d => d.code === data.deptCode)?.name ?? "";
    const roleName = ROLE_OPTIONS.find(r => r.code === data.roleType)?.name ?? "";
    try {
      if (isEditing && editingEmp) {
        await employeeStore.update(editingEmp.empId, {
          loginId: data.loginId, empName: data.empName,
          deptCode: data.deptCode, deptName,
          roleType: data.roleType, roleName,
          email: data.email ?? "", isActive: data.isActive,
          remarks: data.remarks ?? "",
        });
        toast.success("社員情報を更新しました");
      } else {
        await employeeStore.create({
          loginId: data.loginId, empName: data.empName,
          deptCode: data.deptCode, deptName,
          roleType: data.roleType, roleName,
          email: data.email ?? "", isActive: data.isActive,
          remarks: data.remarks ?? "",
        });
        toast.success("社員を登録しました");
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
      await employeeStore.remove(deleteTarget.empId);
      toast.success(`「${deleteTarget.empName}」を削除しました`);
      setDeleteTarget(null);
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    return employees
      .filter(e => deptFilter === "all" || e.deptCode === deptFilter)
      .filter(e => !kw || e.loginId.toLowerCase().includes(kw) || e.empName.toLowerCase().includes(kw) || String(e.empId).includes(kw));
  }, [employees, deptFilter, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <ERPLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">社員マスタ</h1>
            <p className="text-xs text-muted-foreground mt-0.5">社員情報の登録および権限管理</p>
          </div>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs" onClick={openNew}>
            <Plus className="w-3.5 h-3.5" /> 社員新規追加
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardContent className="px-4 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">社員番号/氏名</label>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1 h-8">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-36"
                    placeholder="社員番号または氏名"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">部署</label>
                <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs border-border w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {DEPT_OPTIONS.map(d => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> 社員一覧
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground ml-1">{filtered.length}名</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">社員番号</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">ログインID</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">氏名</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">部署名</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">権限種別</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">在籍状態</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`} className="border-border">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
                {!loading && paged.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">該当する社員がありません</TableCell></TableRow>
                )}
                {!loading && paged.map((emp) => (
                  <TableRow key={emp.empId} className="border-border hover:bg-secondary/50">
                    <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">{emp.empId}</TableCell>
                    <TableCell className="px-3 py-2 text-xs font-mono text-primary">{emp.loginId}</TableCell>
                    <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{emp.empName}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-foreground">{emp.deptName}</TableCell>
                    <TableCell className="px-3 py-2">
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0",
                        emp.roleType === "APPROVER" ? "border-warning/50 text-warning" :
                        emp.roleType === "INSP" ? "border-info/50 text-info" : "border-primary/50 text-primary"
                      )}>{emp.roleName}</Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {emp.isActive
                        ? <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">在籍</Badge>
                        : <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">退職</Badge>}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label="編集" onClick={() => openEdit(emp)}>
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label="削除" onClick={() => setDeleteTarget(emp)}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                {filtered.length}件中 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)}件
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
                {isEditing ? "社員情報編集" : "社員新規登録"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">ログインID <span className="text-destructive">*</span></Label>
                  <Input {...register("loginId")} disabled={isEditing} className={cn("h-8 text-xs border-border", errors.loginId && "border-destructive ring-1 ring-destructive")} placeholder="例: tanaka.t" />
                  <FormError message={errors.loginId?.message} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">パスワード {!isEditing && <span className="text-destructive">*</span>}</Label>
                  <Input type="password" {...register("password")} className={cn("h-8 text-xs border-border", errors.password && "border-destructive ring-1 ring-destructive")} placeholder={isEditing ? "変更時のみ入力" : "パスワード入力"} />
                  <FormError message={errors.password?.message} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">氏名 <span className="text-destructive">*</span></Label>
                <Input {...register("empName")} className={cn("h-8 text-xs border-border", errors.empName && "border-destructive ring-1 ring-destructive")} placeholder="社員氏名" />
                <FormError message={errors.empName?.message} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">部署コード <span className="text-destructive">*</span></Label>
                  <Select value={watch("deptCode")} onValueChange={(v) => setValue("deptCode", v, { shouldValidate: true })}>
                    <SelectTrigger className={cn("h-8 text-xs border-border", errors.deptCode && "border-destructive ring-1 ring-destructive")}>
                      <SelectValue placeholder="部署選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPT_OPTIONS.map(d => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.deptCode?.message} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">権限種別 <span className="text-destructive">*</span></Label>
                  <Select value={watch("roleType")} onValueChange={(v) => setValue("roleType", v, { shouldValidate: true })}>
                    <SelectTrigger className={cn("h-8 text-xs border-border", errors.roleType && "border-destructive ring-1 ring-destructive")}>
                      <SelectValue placeholder="権限選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map(r => <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.roleType?.message} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">メールアドレス</Label>
                <Input {...register("email")} className={cn("h-8 text-xs border-border", errors.email && "border-destructive ring-1 ring-destructive")} placeholder="email@sprime.co.jp" />
                <FormError message={errors.email?.message} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">在籍状態</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">退職</span>
                  <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
                  <span className="text-xs text-foreground">在籍</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">備考</Label>
                <Textarea {...register("remarks")} className={cn("text-xs border-border min-h-[60px]", errors.remarks && "border-destructive")} placeholder="特記事項を記入" />
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
              <AlertDialogTitle className="text-sm">社員の削除確認</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                「{deleteTarget?.empName}」(社員番号 {deleteTarget?.empId}) を削除します。<br />
                関連する伝票履歴は残りますが、社員マスタから削除されます。
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

export default EmployeeMaster;
