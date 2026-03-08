import { useState } from "react";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Send,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  Receipt,
  AlertTriangle,
  Plus,
  Search,
  FileText,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "작성중 (Draft)", color: "bg-muted text-muted-foreground" },
  S01: { label: "신청중 (Pending)", color: "bg-info/20 text-info" },
  A00: { label: "승인중 (In-Review)", color: "bg-warning/20 text-warning" },
  A01: { label: "승인완료 (Approved)", color: "bg-success/20 text-success" },
  A02: { label: "부인 (Rejected)", color: "bg-destructive/20 text-destructive" },
  T01: { label: "적송중 (Transit)", color: "bg-info/20 text-info" },
  T02: { label: "출고완료 (Delivered)", color: "bg-primary/20 text-primary" },
  T03: { label: "매출확정 (Invoiced)", color: "bg-success/20 text-success" },
  T04: { label: "재고조정 (Adjusted)", color: "bg-warning/20 text-warning" },
};

interface ShipmentItem {
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

interface WorkflowEntry {
  stepNo: number;
  status: string;
  empName: string;
  role: string;
  comment: string;
  procAt: string;
}

const mockItems: ShipmentItem[] = [
  {
    id: 1,
    itemCode: "FIN-ETCH-500",
    itemName: "플라즈마 에칭 장비 PE-500",
    stockQty: 12,
    shipQty: 3,
    unitPrice: 45000000,
    salesAmount: 135000000,
    inTransit: true,
    lotNo: "LOT-FIN-2024-001",
  },
  {
    id: 2,
    itemCode: "FIN-CVD-300",
    itemName: "CVD 증착기 CV-300",
    stockQty: 8,
    shipQty: 1,
    unitPrice: 78000000,
    salesAmount: 78000000,
    inTransit: true,
    lotNo: "LOT-FIN-2024-002",
  },
  {
    id: 3,
    itemCode: "SEMI-CHUCK-01",
    itemName: "정밀 웨이퍼 척 모듈",
    stockQty: 45,
    shipQty: 10,
    unitPrice: 3200000,
    salesAmount: 32000000,
    inTransit: false,
    lotNo: "LOT-SM-2024-015",
  },
];

const mockWorkflow: WorkflowEntry[] = [
  { stepNo: 1, status: "출고신청", empName: "정수현", role: "신청자", comment: "삼성전자 평택 FAB 납품 건", procAt: "2024-03-10 09:00:00" },
  { stepNo: 2, status: "승인", empName: "박지영", role: "승인자(1차)", comment: "재고 확인 완료, 승인", procAt: "2024-03-10 11:30:00" },
  { stepNo: 3, status: "승인", empName: "이동훈", role: "승인자(2차)", comment: "출고 승인", procAt: "2024-03-10 14:00:00" },
  { stepNo: 4, status: "배송시작", empName: "최유진", role: "물류담당", comment: "운송업체: 대한통운 / 송장번호: DHL-240311-0891", procAt: "2024-03-11 08:30:00" },
];

const ShipmentManagement = () => {
  const [currentStatus, setCurrentStatus] = useState("T01");
  const [slipList] = useState([
    { slipNo: "SHP20240310-001", date: "2024-03-10", customer: "삼성전자(주)", status: "T01", totalAmount: "245,000,000" },
    { slipNo: "SHP20240308-002", date: "2024-03-08", customer: "SK하이닉스(주)", status: "T03", totalAmount: "156,000,000" },
    { slipNo: "SHP20240306-001", date: "2024-03-06", customer: "도쿄일렉트론(주)", status: "T02", totalAmount: "89,500,000" },
    { slipNo: "SHP20240303-003", date: "2024-03-03", customer: "TSMC Japan", status: "T04", totalAmount: "12,800,000" },
  ]);
  const [selectedSlip, setSelectedSlip] = useState("SHP20240310-001");

  const statusInfo = STATUS_MAP[currentStatus] || STATUS_MAP.S00;

  const isButtonActive = (btn: string) => {
    switch (btn) {
      case "apply": return currentStatus === "S00";
      case "approve": return currentStatus === "A00";
      case "reject": return currentStatus === "A00";
      case "transit": return currentStatus === "A01";
      case "delivered": return currentStatus === "T01";
      case "invoiced": return currentStatus === "T02";
      case "adjust": return true; // 어느 단계에서든 가능
      default: return false;
    }
  };

  const statusFlow = ["S00", "S01", "A00", "A01", "T01", "T02", "T03"];

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">출고 및 재고조정</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              완제품 출고 신청부터 매출 확정 및 재고 조정까지의 전체 프로세스를 관리합니다
            </p>
          </div>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" />
            신규 출고전표
          </Button>
        </div>

        {/* Top: Slip List + Action Buttons */}
        <div className="grid grid-cols-12 gap-4">
          {/* Slip List */}
          <Card className="col-span-12 lg:col-span-4 border-border bg-card">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">출고 전표 목록</CardTitle>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-24"
                    placeholder="전표번호 검색"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <div className="space-y-1 max-h-[180px] overflow-y-auto">
                {slipList.map((slip) => {
                  const st = STATUS_MAP[slip.status];
                  return (
                    <div
                      key={slip.slipNo}
                      onClick={() => setSelectedSlip(slip.slipNo)}
                      className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-xs ${
                        selectedSlip === slip.slipNo
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-secondary border border-transparent"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-medium text-foreground">{slip.slipNo}</div>
                        <div className="text-muted-foreground">{slip.date} · {slip.customer}</div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${st?.color || ""}`}>
                          {st?.label.split(" ")[0] || slip.status}
                        </Badge>
                        <div className="text-muted-foreground">¥{slip.totalAmount}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Panel */}
          <Card className="col-span-12 lg:col-span-8 border-border bg-card">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">워크플로우 액션</CardTitle>
                <Badge className={`text-xs px-2.5 py-0.5 ${statusInfo.color}`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={isButtonActive("apply") ? "default" : "outline"} disabled={!isButtonActive("apply")} className="gap-1.5 text-xs">
                  <Send className="w-3.5 h-3.5" /> 출고신청
                </Button>
                <Button size="sm" variant={isButtonActive("approve") ? "default" : "outline"} disabled={!isButtonActive("approve")} className="gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 승인
                </Button>
                <Button size="sm" variant={isButtonActive("reject") ? "destructive" : "outline"} disabled={!isButtonActive("reject")} className="gap-1.5 text-xs">
                  <XCircle className="w-3.5 h-3.5" /> 부인
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button size="sm" variant={isButtonActive("transit") ? "default" : "outline"} disabled={!isButtonActive("transit")} className="gap-1.5 text-xs">
                  <Truck className="w-3.5 h-3.5" /> 배송시작(적송)
                </Button>
                <Button size="sm" variant={isButtonActive("delivered") ? "default" : "outline"} disabled={!isButtonActive("delivered")} className="gap-1.5 text-xs">
                  <PackageCheck className="w-3.5 h-3.5" /> 출고종료
                </Button>
                <Button size="sm" variant={isButtonActive("invoiced") ? "default" : "outline"} disabled={!isButtonActive("invoiced")} className="gap-1.5 text-xs">
                  <Receipt className="w-3.5 h-3.5" /> 매출확정
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-warning/50 text-warning hover:bg-warning/10">
                  <AlertTriangle className="w-3.5 h-3.5" /> 재고조정
                </Button>
              </div>

              {/* Status Flow */}
              <div className="mt-4 flex items-center gap-1 text-[10px] text-muted-foreground overflow-x-auto pb-1">
                {statusFlow.map((code, i) => (
                  <div key={code} className="flex items-center gap-1 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded font-mono ${
                      code === currentStatus
                        ? "bg-primary text-primary-foreground font-bold"
                        : statusFlow.indexOf(code) < statusFlow.indexOf(currentStatus)
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {code}
                    </span>
                    {i < statusFlow.length - 1 && <span className="text-muted-foreground/40">→</span>}
                  </div>
                ))}
                <span className="text-muted-foreground/40 mx-1">|</span>
                <span className={`px-1.5 py-0.5 rounded font-mono ${
                  currentStatus === "T04" ? "bg-warning/20 text-warning font-bold" : "bg-muted text-muted-foreground"
                }`}>T04</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slip Header */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              전표 헤더 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">전표번호</label>
                <Input value="SHP20240310-001" readOnly className="h-8 text-xs font-mono bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">전표상태</label>
                <div className="h-8 flex items-center">
                  <Badge className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">출고희망일</label>
                <Input type="date" defaultValue="2024-03-15" disabled={currentStatus !== "S00"} className="h-8 text-xs border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">고객사 명</label>
                <Input value="삼성전자(주) 평택캠퍼스" readOnly={currentStatus !== "S00"} className="h-8 text-xs border-border" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">배송지 주소</label>
                <Input value="경기도 평택시 삼남면 삼성로 1길 30 (FAB동 B2F)" readOnly={currentStatus !== "S00"} className="h-8 text-xs border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">출발지 창고</label>
                <Select disabled={currentStatus !== "S00"}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="본사 제1창고" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wh1">본사 제1창고</SelectItem>
                    <SelectItem value="wh2">본사 제2창고</SelectItem>
                    <SelectItem value="wh3">시부야 물류센터</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">총 출고금액</label>
                <Input value="¥245,000,000" readOnly className="h-8 text-xs font-mono bg-muted/50 border-border text-primary font-semibold" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Items */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">상세 품목 일람</CardTitle>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" disabled={currentStatus !== "S00"}>
                <Plus className="w-3 h-3" /> 품목 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">품목코드</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">품목명</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">현재고</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">출고수량</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">단가</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">매출금액</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">적송여부</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">LOT번호</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockItems.map((item) => (
                    <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                      <TableCell className="px-3 py-2 text-xs font-mono text-primary">{item.itemCode}</TableCell>
                      <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{item.itemName}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono">
                        <span className={item.stockQty <= 10 ? "text-warning" : "text-success"}>
                          {item.stockQty.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{item.shipQty.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">¥{item.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">¥{item.salesAmount.toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        <Checkbox checked={item.inTransit} disabled={currentStatus !== "T01"} className="border-border" />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">{item.lotNo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30">
              <span className="text-xs text-muted-foreground">합계</span>
              <span className="text-sm font-mono font-bold text-primary">
                ¥{mockItems.reduce((sum, d) => sum + d.salesAmount, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Workflow History */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold">워크플로우 이력</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-16 text-center">순번</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">작업상황</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">작업자</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">권한/직무</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">코멘트</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">처리일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockWorkflow.map((wf) => (
                  <TableRow key={wf.stepNo} className="border-border hover:bg-secondary/50">
                    <TableCell className="px-3 py-2 text-xs text-center font-mono text-muted-foreground">{wf.stepNo}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                        {wf.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{wf.empName}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-muted-foreground">{wf.role}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">{wf.comment}</TableCell>
                    <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">{wf.procAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
};

export default ShipmentManagement;
