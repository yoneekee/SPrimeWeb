import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Plus,
  Search,
  FileDown,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "작성중", color: "bg-muted text-muted-foreground" },
  S01: { label: "신청중", color: "bg-info/20 text-info" },
  A01: { label: "승인완료", color: "bg-success/20 text-success" },
  P02: { label: "발주완료", color: "bg-primary/20 text-primary" },
  P03: { label: "분납중", color: "bg-info/20 text-info" },
  P04: { label: "입고완료", color: "bg-success/20 text-success" },
  I00: { label: "검수완료", color: "bg-success/20 text-success" },
};

interface SlipItem {
  slipNo: string;
  targetItem: string;
  targetQty: number;
  status: string;
  date: string;
  selected: boolean;
}

interface BomItem {
  level: number;
  itemCode: string;
  itemName: string;
  requiredQty: number;
  totalQty: number;
  lossRate: number;
  stockQty: number;
  shortage: number;
  warehouse: string;
}

const mockSlips: SlipItem[] = [
  { slipNo: "SLP20240307-001", targetItem: "플라즈마 에칭 장비 PE-500", targetQty: 5, status: "P03", date: "2024-03-07", selected: false },
  { slipNo: "SLP20240305-003", targetItem: "CVD 증착기 CV-300", targetQty: 3, status: "A01", date: "2024-03-05", selected: false },
  { slipNo: "SLP20240304-002", targetItem: "정밀 웨이퍼 척 모듈 WC-100", targetQty: 20, status: "I00", date: "2024-03-04", selected: false },
  { slipNo: "SLP20240301-001", targetItem: "스퍼터링 시스템 SP-200", targetQty: 2, status: "S00", date: "2024-03-01", selected: false },
];

const mockBom: BomItem[] = [
  { level: 0, itemCode: "FIN-ETCH-500", itemName: "플라즈마 에칭 장비 PE-500", requiredQty: 1, totalQty: 5, lossRate: 0, stockQty: 2, shortage: -3, warehouse: "본사 제1창고" },
  { level: 1, itemCode: "SEMI-CHAMBER-01", itemName: "진공 챔버 모듈", requiredQty: 1, totalQty: 5, lossRate: 2, stockQty: 8, shortage: 3, warehouse: "본사 제1창고" },
  { level: 2, itemCode: "RAW-STEEL-SUS", itemName: "SUS316L 스테인리스 판재", requiredQty: 4, totalQty: 20.4, lossRate: 2, stockQty: 50, shortage: 29.6, warehouse: "본사 제2창고" },
  { level: 2, itemCode: "RAW-ORING-VT", itemName: "바이톤 O-링 (Φ300)", requiredQty: 8, totalQty: 40, lossRate: 0, stockQty: 25, shortage: -15, warehouse: "본사 제1창고" },
  { level: 1, itemCode: "SEMI-RF-GEN", itemName: "RF 발생기 유닛", requiredQty: 1, totalQty: 5, lossRate: 0, stockQty: 3, shortage: -2, warehouse: "본사 제1창고" },
  { level: 2, itemCode: "RAW-PCB-RF01", itemName: "RF 전력 제어 PCB", requiredQty: 2, totalQty: 10, lossRate: 3, stockQty: 15, shortage: 5, warehouse: "시부야 물류센터" },
  { level: 2, itemCode: "RAW-CAP-HV", itemName: "고압 세라믹 커패시터", requiredQty: 12, totalQty: 60, lossRate: 1, stockQty: 40, shortage: -20, warehouse: "본사 제2창고" },
  { level: 1, itemCode: "SEMI-WAFER-01", itemName: "실리콘 웨이퍼 300mm (테스트용)", requiredQty: 10, totalQty: 50, lossRate: 5, stockQty: 300, shortage: 250, warehouse: "본사 제1창고" },
  { level: 1, itemCode: "SEMI-GAS-SYS", itemName: "가스 공급 시스템", requiredQty: 1, totalQty: 5, lossRate: 0, stockQty: 6, shortage: 1, warehouse: "본사 제1창고" },
  { level: 2, itemCode: "RAW-VALVE-APC", itemName: "APC 밸브 (자동압력제어)", requiredQty: 3, totalQty: 15, lossRate: 0, stockQty: 10, shortage: -5, warehouse: "본사 제2창고" },
  { level: 2, itemCode: "RAW-PIPE-EP", itemName: "EP 처리 SUS 배관 (1/4\")", requiredQty: 6, totalQty: 30, lossRate: 0, stockQty: 80, shortage: 50, warehouse: "본사 제2창고" },
];

const BomProductionSlip = () => {
  const navigate = useNavigate();
  const [selectedSlip, setSelectedSlip] = useState("SLP20240307-001");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkedSlips, setCheckedSlips] = useState<string[]>([]);

  const toggleCheck = (slipNo: string) => {
    setCheckedSlips((prev) =>
      prev.includes(slipNo) ? prev.filter((s) => s !== slipNo) : [...prev, slipNo]
    );
  };

  const getLevelIndent = (level: number) => `${level * 20}px`;

  const getShortageIcon = (shortage: number) => {
    if (shortage >= 0) return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />;
  };

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">BOM 생산전표</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              BOM 기반 생산 전표를 조회하고 부품 과부족 현황을 확인합니다
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={checkedSlips.length === 0}>
              <FileDown className="w-3.5 h-3.5" /> 일괄 출력 ({checkedSlips.length})
            </Button>
            <Button size="sm" onClick={() => navigate("/documents/bom/new")} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
              <Plus className="w-3.5 h-3.5" /> 신규 생산 기안
            </Button>
          </div>
        </div>

        {/* Search Filters */}
        <Card className="border-border bg-card">
          <CardContent className="px-4 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">전표번호</label>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1 h-8">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-28" placeholder="전표번호 검색" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">생산 품목</label>
                <Input className="h-8 text-xs border-border w-40" placeholder="품목명 검색" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">기간</label>
                <div className="flex items-center gap-2">
                  <Input type="date" defaultValue="2024-03-01" className="h-8 text-xs border-border w-32" />
                  <span className="text-xs text-muted-foreground">~</span>
                  <Input type="date" defaultValue="2024-03-31" className="h-8 text-xs border-border w-32" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">상태</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs border-border w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="S00">작성중</SelectItem>
                    <SelectItem value="A01">승인완료</SelectItem>
                    <SelectItem value="P03">분납중</SelectItem>
                    <SelectItem value="I00">검수완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground">
                <Search className="w-3 h-3" /> 조회
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Slip List */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              생산 전표 일람
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-10"></TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">전표번호</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">목표 품목</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">생산 목표량</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">현재 상태</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">작성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSlips.map((slip) => {
                  const st = STATUS_MAP[slip.status];
                  const isSelected = selectedSlip === slip.slipNo;
                  return (
                    <TableRow
                      key={slip.slipNo}
                      onClick={() => setSelectedSlip(slip.slipNo)}
                      className={`border-border cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-secondary/50"}`}
                    >
                      <TableCell className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={checkedSlips.includes(slip.slipNo)}
                          onCheckedChange={() => toggleCheck(slip.slipNo)}
                          className="border-border"
                        />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-primary flex items-center gap-1.5">
                        {isSelected ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                        {slip.slipNo}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{slip.targetItem}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{slip.targetQty.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${st?.color || ""}`}>
                          {st?.label || slip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">{slip.date}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* BOM Detail */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                BOM 상세 내역
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-primary">{selectedSlip}</Badge>
              </CardTitle>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-3 h-3" /> 충족</span>
                <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="w-3 h-3" /> 부족</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-14">Lvl</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">품목코드</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">품목명칭</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">단위소요량</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">로스율</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">총 필요수량</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">현재 실재고</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">과부족</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">창고위치</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBom.map((item, idx) => (
                    <TableRow key={idx} className={`border-border hover:bg-secondary/50 ${item.level === 0 ? "bg-primary/5" : ""}`}>
                      <TableCell className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                          item.level === 0 ? "border-primary/50 text-primary" : item.level === 1 ? "border-info/50 text-info" : "border-muted-foreground/50 text-muted-foreground"
                        }`}>
                          L{item.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-primary" style={{ paddingLeft: `${12 + item.level * 20}px` }}>
                        {item.level > 0 && <span className="text-muted-foreground/40 mr-1">└</span>}
                        {item.itemCode}
                      </TableCell>
                      <TableCell className={`px-3 py-2 text-xs ${item.level === 0 ? "font-bold text-foreground" : "text-foreground"}`}>
                        {item.itemName}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{item.requiredQty}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-muted-foreground">{item.lossRate > 0 ? `${item.lossRate}%` : "-"}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono font-medium text-foreground">{item.totalQty.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{item.stockQty.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getShortageIcon(item.shortage)}
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
                <span className="text-muted-foreground">부품 총 {mockBom.filter(b => b.level > 0).length}건</span>
                <span className="flex items-center gap-1 text-destructive">
                  <MinusCircle className="w-3 h-3" />
                  부족 {mockBom.filter(b => b.shortage < 0).length}건
                </span>
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="w-3 h-3" />
                  충족 {mockBom.filter(b => b.shortage >= 0).length}건
                </span>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <FileDown className="w-3 h-3" /> PDF 출력
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
};

export default BomProductionSlip;
