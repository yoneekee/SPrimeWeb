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
import { Plus, Search, Pencil, Warehouse } from "lucide-react";

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
  { locId: 1, locName: "본사 제1창고", locType: "FACTORY", typeName: "공장", postalCode: "150-0002", address: "東京都渋谷区渋谷1-2-3 本社ビルB1F", contactInfo: "03-1234-5678", isActive: true, remarks: "클린룸 환경 (Class 1000)" },
  { locId: 2, locName: "본사 제2창고", locType: "FACTORY", typeName: "공장", postalCode: "150-0002", address: "東京都渋谷区渋谷1-2-3 本社ビル1F", contactInfo: "03-1234-5679", isActive: true, remarks: "일반 자재 보관" },
  { locId: 3, locName: "시부야 물류센터", locType: "STORE", typeName: "매장", postalCode: "150-0041", address: "東京都渋谷区神南2-5-10", contactInfo: "03-9876-5432", isActive: true, remarks: "출하 전 스테이징 전용" },
  { locId: 4, locName: "평택 FAB 납품거점", locType: "VENDOR", typeName: "거래처", postalCode: "", address: "경기도 평택시 삼남면 삼성로 1길 30", contactInfo: "031-000-0000", isActive: true, remarks: "삼성전자 평택캠퍼스" },
  { locId: 5, locName: "운송중 (적송)", locType: "TRANSIT", typeName: "적송", postalCode: "", address: "운송 중", contactInfo: "-", isActive: true, remarks: "적송품 계정 관리용 가상 거점" },
  { locId: 6, locName: "오사카 지점 창고", locType: "FACTORY", typeName: "공장", postalCode: "530-0001", address: "大阪府大阪市北区梅田3-1-1", contactInfo: "06-1111-2222", isActive: false, remarks: "2024.01 폐쇄" },
];

const TYPE_OPTIONS = [
  { code: "FACTORY", name: "공장 (FACTORY)" },
  { code: "STORE", name: "매장 (STORE)" },
  { code: "TRANSIT", name: "적송 (TRANSIT)" },
  { code: "VENDOR", name: "거래처 (VENDOR)" },
];

const WarehouseMaster = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const openNew = () => { setEditingLoc(null); setDialogOpen(true); };
  const openEdit = (loc: Location) => { setEditingLoc(loc); setDialogOpen(true); };

  const filtered = typeFilter === "all" ? mockLocations : mockLocations.filter(l => l.locType === typeFilter);

  return (
    <ERPLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">창고거점 마스터</h1>
            <p className="text-xs text-muted-foreground mt-0.5">창고, 매장, 적송 등 거점 정보 등록 및 관리</p>
          </div>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs" onClick={openNew}>
            <Plus className="w-3.5 h-3.5" /> 거점 신규 등록
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardContent className="px-4 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">거점명</label>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1 h-8">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-28" placeholder="거점명 검색" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">거점 유형</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 text-xs border-border w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground">
                <Search className="w-3 h-3" /> 조회
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location List */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-primary" />
              창고거점 일람
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground ml-1">{filtered.length}건</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-16">거점ID</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">거점 명칭</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">거점 유형</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">주소</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">사용 여부</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">수정</TableHead>
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
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">운영중</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">폐쇄</Badge>
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
          <DialogContent className="sm:max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold text-foreground">
                {editingLoc ? "거점 정보 수정" : "거점 신규 등록"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">거점 명칭 <span className="text-destructive">*</span></Label>
                  <Input defaultValue={editingLoc?.locName || ""} className="h-8 text-xs border-border" placeholder="예: 본사 제1창고" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">거점 유형 <span className="text-destructive">*</span></Label>
                  <Select defaultValue={editingLoc?.locType || ""}>
                    <SelectTrigger className="h-8 text-xs border-border">
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map(t => <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">우편번호 (〒)</Label>
                  <Input defaultValue={editingLoc?.postalCode || ""} className="h-8 text-xs border-border" placeholder="000-0000" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">담당자 연락처</Label>
                  <Input defaultValue={editingLoc?.contactInfo || ""} className="h-8 text-xs border-border" placeholder="03-XXXX-XXXX" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">주소</Label>
                <Input defaultValue={editingLoc?.address || ""} className="h-8 text-xs border-border" placeholder="상세 주소 입력" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">사용 여부</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">폐쇄</span>
                  <Switch defaultChecked={editingLoc?.isActive ?? true} />
                  <span className="text-xs text-foreground">운영중</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">비고</Label>
                <Textarea defaultValue={editingLoc?.remarks || ""} className="text-xs border-border min-h-[60px]" placeholder="특이사항 기록 (위험물 보관 여부 등)" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setDialogOpen(false)}>취소</Button>
              <Button size="sm" className="text-xs bg-primary text-primary-foreground" onClick={() => setDialogOpen(false)}>
                {editingLoc ? "수정 저장" : "등록"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
};

export default WarehouseMaster;
