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
import { Plus, Search, Pencil, Users, ChevronLeft, ChevronRight } from "lucide-react";

interface Employee {
  empId: number;
  loginId: string;
  empName: string;
  deptCode: string;
  deptName: string;
  roleType: string;
  roleName: string;
  email: string;
  isActive: boolean;
  remarks: string;
}

const mockEmployees: Employee[] = [
  { empId: 1001, loginId: "tanaka.t", empName: "田中 太郎", deptCode: "MFG1", deptName: "製造1課", roleType: "PROD", roleName: "製造担当", email: "tanaka.t@sprime.co.jp", isActive: true, remarks: "" },
  { empId: 1002, loginId: "suzuki.h", empName: "鈴木 花子", deptCode: "MGT", deptName: "経営管理課", roleType: "APPROVER", roleName: "承認者", email: "suzuki.h@sprime.co.jp", isActive: true, remarks: "一次承認権限" },
  { empId: 1003, loginId: "sato.k", empName: "佐藤 健一", deptCode: "MGT", deptName: "経営管理課", roleType: "APPROVER", roleName: "承認者", email: "sato.k@sprime.co.jp", isActive: true, remarks: "二次承認権限" },
  { empId: 1004, loginId: "yamada.y", empName: "山田 裕子", deptCode: "MFG2", deptName: "製造2課", roleType: "PROD", roleName: "製造担当", email: "yamada.y@sprime.co.jp", isActive: true, remarks: "" },
  { empId: 1005, loginId: "ito.m", empName: "伊藤 真一", deptCode: "LOG", deptName: "物流課", roleType: "PROD", roleName: "物流担当", email: "ito.m@sprime.co.jp", isActive: true, remarks: "" },
  { empId: 1006, loginId: "watanabe.r", empName: "渡辺 涼介", deptCode: "QC", deptName: "品質管理課", roleType: "INSP", roleName: "検収担当", email: "watanabe.r@sprime.co.jp", isActive: true, remarks: "" },
  { empId: 1007, loginId: "kobayashi.a", empName: "小林 明", deptCode: "MFG1", deptName: "製造1課", roleType: "PROD", roleName: "製造担当", email: "kobayashi.a@sprime.co.jp", isActive: false, remarks: "2024.02 退職" },
];

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [deptFilter, setDeptFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const openNew = () => { setEditingEmp(null); setDialogOpen(true); };
  const openEdit = (emp: Employee) => { setEditingEmp(emp); setDialogOpen(true); };

  const filtered = deptFilter === "all" ? mockEmployees : mockEmployees.filter(e => e.deptCode === deptFilter);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
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
                  <input className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-28" placeholder="社員番号または氏名" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">部署</label>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="h-8 text-xs border-border w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {DEPT_OPTIONS.map(d => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground">
                <Search className="w-3 h-3" /> 照会
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              社員一覧
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
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">編集</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((emp) => (
                  <TableRow key={emp.empId} className="border-border hover:bg-secondary/50">
                    <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">{emp.empId}</TableCell>
                    <TableCell className="px-3 py-2 text-xs font-mono text-primary">{emp.loginId}</TableCell>
                    <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{emp.empName}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-foreground">{emp.deptName}</TableCell>
                    <TableCell className="px-3 py-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                        emp.roleType === "APPROVER" ? "border-warning/50 text-warning" :
                        emp.roleType === "INSP" ? "border-info/50 text-info" :
                        "border-primary/50 text-primary"
                      }`}>
                        {emp.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {emp.isActive ? (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">在籍</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">退職</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEdit(emp)}>
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
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
                <SelectTrigger className="h-7 w-16 text-xs border-border">
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
                {editingEmp ? "社員情報編集" : "社員新規登録"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">ログインID <span className="text-destructive">*</span></Label>
                  <Input defaultValue={editingEmp?.loginId || ""} disabled={!!editingEmp} className="h-8 text-xs border-border" placeholder="例: tanaka.t" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">パスワード <span className="text-destructive">*</span></Label>
                  <Input type="password" className="h-8 text-xs border-border" placeholder={editingEmp ? "変更時のみ入力" : "パスワード入力"} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">氏名 <span className="text-destructive">*</span></Label>
                <Input defaultValue={editingEmp?.empName || ""} className="h-8 text-xs border-border" placeholder="社員氏名" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">部署コード <span className="text-destructive">*</span></Label>
                  <Select defaultValue={editingEmp?.deptCode || ""}>
                    <SelectTrigger className="h-8 text-xs border-border">
                      <SelectValue placeholder="部署選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPT_OPTIONS.map(d => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">権限種別 <span className="text-destructive">*</span></Label>
                  <Select defaultValue={editingEmp?.roleType || ""}>
                    <SelectTrigger className="h-8 text-xs border-border">
                      <SelectValue placeholder="権限選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map(r => <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">メールアドレス</Label>
                <Input defaultValue={editingEmp?.email || ""} className="h-8 text-xs border-border" placeholder="email@sprime.co.jp" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">在籍状態</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">退職</span>
                  <Switch defaultChecked={editingEmp?.isActive ?? true} />
                  <span className="text-xs text-foreground">在籍</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">備考</Label>
                <Textarea defaultValue={editingEmp?.remarks || ""} className="text-xs border-border min-h-[60px]" placeholder="特記事項を記入" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setDialogOpen(false)}>キャンセル</Button>
              <Button size="sm" className="text-xs bg-primary text-primary-foreground" onClick={() => setDialogOpen(false)}>
                {editingEmp ? "更新保存" : "登録"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
};

export default EmployeeMaster;