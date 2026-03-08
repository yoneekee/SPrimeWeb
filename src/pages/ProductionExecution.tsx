import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileCheck,
  Truck,
  PackageCheck,
  ClipboardCheck,
  Plus,
  Search,
  FileText,
} from "lucide-react";
import StatusFlowStepper from "@/components/erp/StatusFlowStepper";

// --- Mock Data ---
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "작성중 (Draft)", color: "bg-muted text-muted-foreground" },
  S01: { label: "신청중 (Pending)", color: "bg-info/20 text-info" },
  A00: { label: "승인중 (In-Review)", color: "bg-warning/20 text-warning" },
  A01: { label: "승인완료 (Approved)", color: "bg-success/20 text-success" },
  A02: { label: "부인 (Rejected)", color: "bg-destructive/20 text-destructive" },
  P00: { label: "반려중 (Returning)", color: "bg-warning/20 text-warning" },
  P01: { label: "견적중 (Quoted)", color: "bg-primary/20 text-primary" },
  P02: { label: "발주완료 (Ordered)", color: "bg-primary/20 text-primary" },
  P03: { label: "분납중 (Partial)", color: "bg-info/20 text-info" },
  P04: { label: "입고완료 (Received)", color: "bg-success/20 text-success" },
  I00: { label: "검수완료 (Accepted)", color: "bg-success/20 text-success" },
};

interface DetailItem {
  id: number;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  orderQty: number;
  inboundTotal: number;
  currentInbound: number;
  unitPrice: number;
  supplyAmount: number;
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

const mockDetails: DetailItem[] = [
  {
    id: 1,
    itemCode: "SEMI-WAFER-01",
    itemName: "실리콘 웨이퍼 300mm",
    spec: "300mm / P-type",
    unit: "EA",
    orderQty: 500,
    inboundTotal: 300,
    currentInbound: 0,
    unitPrice: 85000,
    supplyAmount: 42500000,
    lotNo: "LOT-2024-0301",
  },
  {
    id: 2,
    itemCode: "SEMI-CHEM-03",
    itemName: "포토레지스트 AZ-5214",
    spec: "1L / UV-grade",
    unit: "EA",
    orderQty: 200,
    inboundTotal: 200,
    currentInbound: 0,
    unitPrice: 120000,
    supplyAmount: 24000000,
    lotNo: "LOT-2024-0302",
  },
  {
    id: 3,
    itemCode: "SEMI-GAS-07",
    itemName: "고순도 질소가스 (N2)",
    spec: "99.999% / 47L",
    unit: "SET",
    orderQty: 50,
    inboundTotal: 30,
    currentInbound: 0,
    unitPrice: 45000,
    supplyAmount: 2250000,
    lotNo: "",
  },
];

const mockWorkflow: WorkflowEntry[] = [
  { stepNo: 1, status: "신청", empName: "김민수", role: "신청자", comment: "웨이퍼 및 화학 재료 긴급 발주 요청", procAt: "2024-03-07 09:15:00" },
  { stepNo: 2, status: "승인", empName: "박지영", role: "승인자(1차)", comment: "승인합니다", procAt: "2024-03-07 10:30:00" },
  { stepNo: 3, status: "승인", empName: "이동훈", role: "승인자(2차)", comment: "수량 확인 완료, 승인", procAt: "2024-03-07 14:20:00" },
  { stepNo: 4, status: "견적", empName: "최유진", role: "제조담당", comment: "도쿄반도체(주) 견적 접수 완료", procAt: "2024-03-08 11:00:00" },
  { stepNo: 5, status: "발주", empName: "최유진", role: "제조담당", comment: "발주 확정 - PO#240308-001", procAt: "2024-03-09 09:00:00" },
  { stepNo: 6, status: "분납입고", empName: "최유진", role: "제조담당", comment: "1차 분납: 웨이퍼 300EA 입고", procAt: "2024-03-12 15:30:00" },
];

const ProductionExecution = () => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState("P03");
  const [slipList] = useState([
    { slipNo: "SLP20240307-001", date: "2024-03-07", requester: "김민수", status: "P03", totalAmount: "68,750,000" },
    { slipNo: "SLP20240305-003", date: "2024-03-05", requester: "박지영", status: "A01", totalAmount: "12,300,000" },
    { slipNo: "SLP20240304-002", date: "2024-03-04", requester: "이동훈", status: "I00", totalAmount: "95,200,000" },
    { slipNo: "SLP20240301-001", date: "2024-03-01", requester: "김민수", status: "S00", totalAmount: "0" },
  ]);
  const [selectedSlip, setSelectedSlip] = useState("SLP20240307-001");

  // Modal state for approval/reject/return actions
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    type: "approve" | "reject" | "return" | null;
  }>({ open: false, type: null });
  const [actionMessage, setActionMessage] = useState("");

  const statusInfo = STATUS_MAP[currentStatus] || STATUS_MAP.S00;

  const isButtonActive = (btn: string) => {
    switch (btn) {
      case "apply": return currentStatus === "S00";
      case "approve": return currentStatus === "A00";
      case "reject": return currentStatus === "A00";
      case "return": return currentStatus === "A01";
      case "order": return currentStatus === "P01";
      case "partial": return currentStatus === "P02" || currentStatus === "P03";
      case "receive": return currentStatus === "P03";
      case "inspect": return currentStatus === "P04";
      default: return false;
    }
  };

  const getActionTitle = (type: "approve" | "reject" | "return" | null) => {
    switch (type) {
      case "approve": return "승인";
      case "reject": return "부인";
      case "return": return "반려";
      default: return "";
    }
  };

  const getActionDescription = (type: "approve" | "reject" | "return" | null) => {
    switch (type) {
      case "approve": return "해당 전표를 승인합니다. 승인 메시지를 입력해주세요.";
      case "reject": return "해당 전표를 부인합니다. 부인 사유를 입력해주세요.";
      case "return": return "해당 전표를 반려합니다. 반려 사유를 입력해주세요.";
      default: return "";
    }
  };

  const handleActionConfirm = () => {
    // Here you would typically send the action to the backend
    console.log(`Action: ${actionModal.type}, Message: ${actionMessage}`);
    setActionModal({ open: false, type: null });
    setActionMessage("");
  };

  const openActionModal = (type: "approve" | "reject" | "return") => {
    setActionModal({ open: true, type });
    setActionMessage("");
  };

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">제품 생산 및 실행</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              원재료 조달부터 검수 완료까지의 전체 생산 프로세스를 관리합니다
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/production/execution/new")} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" />
            신규 전표
          </Button>
        </div>

        {/* Top: Slip List + Action Buttons */}
        <div className="grid grid-cols-12 gap-4">
          {/* Slip List */}
          <Card className="col-span-12 lg:col-span-4 border-border bg-card">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">전표 목록</CardTitle>
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
                        <div className="text-muted-foreground">{slip.date} · {slip.requester}</div>
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
                  <Send className="w-3.5 h-3.5" /> 신청
                </Button>
                <Button size="sm" variant={isButtonActive("approve") ? "default" : "outline"} disabled={!isButtonActive("approve")} onClick={() => openActionModal("approve")} className="gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 승인
                </Button>
                <Button size="sm" variant={isButtonActive("reject") ? "destructive" : "outline"} disabled={!isButtonActive("reject")} onClick={() => openActionModal("reject")} className="gap-1.5 text-xs">
                  <XCircle className="w-3.5 h-3.5" /> 부인
                </Button>
                <Button size="sm" variant={isButtonActive("return") ? "outline" : "outline"} disabled={!isButtonActive("return")} onClick={() => openActionModal("return")} className="gap-1.5 text-xs border-warning/50 text-warning hover:bg-warning/10">
                  <RotateCcw className="w-3.5 h-3.5" /> 반려
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button size="sm" variant={isButtonActive("order") ? "default" : "outline"} disabled={!isButtonActive("order")} className="gap-1.5 text-xs">
                  <FileCheck className="w-3.5 h-3.5" /> 발주확정
                </Button>
                <Button size="sm" variant={isButtonActive("partial") ? "default" : "outline"} disabled={!isButtonActive("partial")} className="gap-1.5 text-xs">
                  <Truck className="w-3.5 h-3.5" /> 분납등록
                </Button>
                <Button size="sm" variant={isButtonActive("receive") ? "default" : "outline"} disabled={!isButtonActive("receive")} className="gap-1.5 text-xs">
                  <PackageCheck className="w-3.5 h-3.5" /> 입고종료
                </Button>
                <Button size="sm" variant={isButtonActive("inspect") ? "default" : "outline"} disabled={!isButtonActive("inspect")} className="gap-1.5 text-xs">
                  <ClipboardCheck className="w-3.5 h-3.5" /> 검수완료
                </Button>
              </div>

              <StatusFlowStepper
                steps={[
                  { code: "S00", label: "작성중" },
                  { code: "S01", label: "신청중" },
                  { code: "A00", label: "승인중" },
                  { code: "A01", label: "승인완료" },
                  { code: "P01", label: "견적중" },
                  { code: "P02", label: "발주완료" },
                  { code: "P03", label: "분납중" },
                  { code: "P04", label: "입고완료" },
                  { code: "I00", label: "검수완료" },
                ]}
                currentStatus={currentStatus}
              />
            </CardContent>
          </Card>
        </div>

        {/* Slip Header Info */}
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
                <Input value="SLP20240307-001" readOnly className="h-8 text-xs font-mono bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">전표상태</label>
                <div className="h-8 flex items-center">
                  <Badge className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">신청일자</label>
                <Input type="date" defaultValue="2024-03-07" disabled={currentStatus !== "S00"} className="h-8 text-xs border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">신청자(부서)</label>
                <Input value="김민수 (제조1팀)" readOnly className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">희망발주처</label>
                <Select disabled={currentStatus !== "P01"}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="도쿄반도체(주)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokyo">도쿄반도체(주)</SelectItem>
                    <SelectItem value="osaka">오사카정밀(주)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">확정발주처</label>
                <Input value="도쿄반도체(주)" readOnly={currentStatus !== "P02"} className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">총 합계금액</label>
                <Input value="¥68,750,000" readOnly className="h-8 text-xs font-mono bg-muted/50 border-border text-primary font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">비고</label>
                <Input defaultValue="Q2 생산라인 증설 관련 긴급 자재" disabled={!["S00", "S01", "P01", "P02"].includes(currentStatus)} className="h-8 text-xs border-border" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Items Grid */}
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
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">규격</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">단위</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">발주수량</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">입고누계</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">이번입고</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">단가</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">공급가액</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">LOT번호</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDetails.map((item) => {
                    const fulfilled = item.inboundTotal >= item.orderQty;
                    return (
                      <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                        <TableCell className="px-3 py-2 text-xs font-mono text-primary">{item.itemCode}</TableCell>
                        <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{item.itemName}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground">{item.spec}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-center text-muted-foreground">{item.unit}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{item.orderQty.toLocaleString()}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono">
                          <span className={fulfilled ? "text-success" : "text-warning"}>
                            {item.inboundTotal.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right">
                          {currentStatus === "P03" ? (
                            <Input
                              type="number"
                              defaultValue={0}
                              className="h-6 w-16 text-xs text-right border-border ml-auto"
                            />
                          ) : (
                            <span className="font-mono text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">¥{item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">¥{item.supplyAmount.toLocaleString()}</TableCell>
                        <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">
                          {item.lotNo || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {/* Total Row */}
            <div className="flex justify-end items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30">
              <span className="text-xs text-muted-foreground">합계</span>
              <span className="text-sm font-mono font-bold text-primary">
                ¥{mockDetails.reduce((sum, d) => sum + d.supplyAmount, 0).toLocaleString()}
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

        {/* Action Modal for Approve/Reject/Return */}
        <Dialog open={actionModal.open} onOpenChange={(open) => setActionModal({ open, type: open ? actionModal.type : null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionModal.type === "approve" && <CheckCircle2 className="w-5 h-5 text-success" />}
                {actionModal.type === "reject" && <XCircle className="w-5 h-5 text-destructive" />}
                {actionModal.type === "return" && <RotateCcw className="w-5 h-5 text-warning" />}
                {getActionTitle(actionModal.type)}
              </DialogTitle>
              <DialogDescription>
                {getActionDescription(actionModal.type)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">메시지</label>
                <Textarea
                  placeholder={actionModal.type === "approve" ? "승인 메시지를 입력하세요..." : "사유를 입력하세요..."}
                  value={actionMessage}
                  onChange={(e) => setActionMessage(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setActionModal({ open: false, type: null })}>
                취소
              </Button>
              <Button
                variant={actionModal.type === "reject" ? "destructive" : "default"}
                onClick={handleActionConfirm}
                className={actionModal.type === "return" ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
              >
                {getActionTitle(actionModal.type)} 확인
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
};

export default ProductionExecution;
