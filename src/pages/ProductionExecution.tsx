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
  S00: { label: "作成中 (Draft)", color: "bg-muted text-muted-foreground" },
  S01: { label: "申請中 (Pending)", color: "bg-info/20 text-info" },
  A00: { label: "承認中 (In-Review)", color: "bg-warning/20 text-warning" },
  A01: { label: "承認済 (Approved)", color: "bg-success/20 text-success" },
  A02: { label: "否認 (Rejected)", color: "bg-destructive/20 text-destructive" },
  P00: { label: "差戻中 (Returning)", color: "bg-warning/20 text-warning" },
  P01: { label: "見積中 (Quoted)", color: "bg-primary/20 text-primary" },
  P02: { label: "発注済 (Ordered)", color: "bg-primary/20 text-primary" },
  P03: { label: "分納中 (Partial)", color: "bg-info/20 text-info" },
  P04: { label: "入庫済 (Received)", color: "bg-success/20 text-success" },
  I00: { label: "検収済 (Accepted)", color: "bg-success/20 text-success" },
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
    itemName: "シリコンウェーハ 300mm",
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
    itemName: "フォトレジスト AZ-5214",
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
    itemName: "高純度窒素ガス (N₂)",
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
  { stepNo: 1, status: "申請", empName: "田中 太郎", role: "申請者", comment: "ウェーハおよび化学材料の緊急発注依頼", procAt: "2024-03-07 09:15:00" },
  { stepNo: 2, status: "承認", empName: "佐藤 花子", role: "承認者（1次）", comment: "承認します", procAt: "2024-03-07 10:30:00" },
  { stepNo: 3, status: "承認", empName: "鈴木 一郎", role: "承認者（2次）", comment: "数量確認完了、承認", procAt: "2024-03-07 14:20:00" },
  { stepNo: 4, status: "見積", empName: "山田 優子", role: "製造担当", comment: "東京半導体(株) 見積受領完了", procAt: "2024-03-08 11:00:00" },
  { stepNo: 5, status: "発注", empName: "山田 優子", role: "製造担当", comment: "発注確定 - PO#240308-001", procAt: "2024-03-09 09:00:00" },
  { stepNo: 6, status: "分納入庫", empName: "山田 優子", role: "製造担当", comment: "第1回分納: ウェーハ 300EA 入庫", procAt: "2024-03-12 15:30:00" },
];

const ProductionExecution = () => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState("P03");
  const [slipList] = useState([
    { slipNo: "SLP20240307-001", date: "2024-03-07", requester: "田中 太郎", status: "P03", totalAmount: "68,750,000" },
    { slipNo: "SLP20240305-003", date: "2024-03-05", requester: "佐藤 花子", status: "A01", totalAmount: "12,300,000" },
    { slipNo: "SLP20240304-002", date: "2024-03-04", requester: "鈴木 一郎", status: "I00", totalAmount: "95,200,000" },
    { slipNo: "SLP20240301-001", date: "2024-03-01", requester: "田中 太郎", status: "S00", totalAmount: "0" },
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
      case "approve": return "承認";
      case "reject": return "否認";
      case "return": return "差戻";
      default: return "";
    }
  };

  const getActionDescription = (type: "approve" | "reject" | "return" | null) => {
    switch (type) {
      case "approve": return "該当伝票を承認します。承認メッセージを入力してください。";
      case "reject": return "該当伝票を否認します。否認理由を入力してください。";
      case "return": return "該当伝票を差戻します。差戻理由を入力してください。";
      default: return "";
    }
  };

  const handleActionConfirm = () => {
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
            <h1 className="text-lg font-bold text-foreground">製品生産および実行</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              原材料調達から検収完了までの全生産プロセスを管理します
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/production/execution/new")} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" />
            新規伝票
          </Button>
        </div>

        {/* Top: Slip List + Action Buttons */}
        <div className="grid grid-cols-12 gap-4">
          {/* Slip List */}
          <Card className="col-span-12 lg:col-span-4 border-border bg-card">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">伝票一覧</CardTitle>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-24"
                    placeholder="伝票番号検索"
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
                <CardTitle className="text-sm font-semibold">ワークフローアクション</CardTitle>
                <Badge className={`text-xs px-2.5 py-0.5 ${statusInfo.color}`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={isButtonActive("apply") ? "default" : "outline"} disabled={!isButtonActive("apply")} className="gap-1.5 text-xs">
                  <Send className="w-3.5 h-3.5" /> 申請
                </Button>
                <Button size="sm" variant={isButtonActive("approve") ? "default" : "outline"} disabled={!isButtonActive("approve")} onClick={() => openActionModal("approve")} className="gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 承認
                </Button>
                <Button size="sm" variant={isButtonActive("reject") ? "destructive" : "outline"} disabled={!isButtonActive("reject")} onClick={() => openActionModal("reject")} className="gap-1.5 text-xs">
                  <XCircle className="w-3.5 h-3.5" /> 否認
                </Button>
                <Button size="sm" variant={isButtonActive("return") ? "outline" : "outline"} disabled={!isButtonActive("return")} onClick={() => openActionModal("return")} className="gap-1.5 text-xs border-warning/50 text-warning hover:bg-warning/10">
                  <RotateCcw className="w-3.5 h-3.5" /> 差戻
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button size="sm" variant={isButtonActive("order") ? "default" : "outline"} disabled={!isButtonActive("order")} className="gap-1.5 text-xs">
                  <FileCheck className="w-3.5 h-3.5" /> 発注確定
                </Button>
                <Button size="sm" variant={isButtonActive("partial") ? "default" : "outline"} disabled={!isButtonActive("partial")} className="gap-1.5 text-xs">
                  <Truck className="w-3.5 h-3.5" /> 分納登録
                </Button>
                <Button size="sm" variant={isButtonActive("receive") ? "default" : "outline"} disabled={!isButtonActive("receive")} className="gap-1.5 text-xs">
                  <PackageCheck className="w-3.5 h-3.5" /> 入庫完了
                </Button>
                <Button size="sm" variant={isButtonActive("inspect") ? "default" : "outline"} disabled={!isButtonActive("inspect")} className="gap-1.5 text-xs">
                  <ClipboardCheck className="w-3.5 h-3.5" /> 検収完了
                </Button>
              </div>

              <StatusFlowStepper
                steps={[
                  { code: "S00", label: "作成中" },
                  { code: "S01", label: "申請中" },
                  { code: "A00", label: "承認中" },
                  { code: "A01", label: "承認済" },
                  { code: "P01", label: "見積中" },
                  { code: "P02", label: "発注済" },
                  { code: "P03", label: "分納中" },
                  { code: "P04", label: "入庫済" },
                  { code: "I00", label: "検収済" },
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
              伝票ヘッダ情報
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票番号</label>
                <Input value="SLP20240307-001" readOnly className="h-8 text-xs font-mono bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票ステータス</label>
                <div className="h-8 flex items-center">
                  <Badge className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">申請日</label>
                <Input type="date" defaultValue="2024-03-07" disabled={currentStatus !== "S00"} className="h-8 text-xs border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">申請者（部署）</label>
                <Input value="田中 太郎（製造1課）" readOnly className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">希望発注先</label>
                <Select disabled={currentStatus !== "P01"}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="東京半導体(株)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokyo">東京半導体(株)</SelectItem>
                    <SelectItem value="osaka">大阪精密(株)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">確定発注先</label>
                <Input value="東京半導体(株)" readOnly={currentStatus !== "P02"} className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">合計金額</label>
                <Input value="¥68,750,000" readOnly className="h-8 text-xs font-mono bg-muted/50 border-border text-primary font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">備考</label>
                <Input defaultValue="Q2 生産ライン増設関連 緊急資材" disabled={!["S00", "S01", "P01", "P02"].includes(currentStatus)} className="h-8 text-xs border-border" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Items Grid */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">明細品目一覧</CardTitle>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" disabled={currentStatus !== "S00"}>
                <Plus className="w-3 h-3" /> 品目追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目コード</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">品目名</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">規格</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">単位</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">発注数量</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">入庫累計</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">今回入庫</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">単価</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">供給価額</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">LOT番号</TableHead>
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
              <span className="text-xs text-muted-foreground">合計</span>
              <span className="text-sm font-mono font-bold text-primary">
                ¥{mockDetails.reduce((sum, d) => sum + d.supplyAmount, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Workflow History */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold">ワークフロー履歴</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-16 text-center">順番</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">処理状況</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">処理者</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">権限・職務</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">コメント</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">処理日時</TableHead>
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
                <label className="text-xs font-medium text-muted-foreground">メッセージ</label>
                <Textarea
                  placeholder={actionModal.type === "approve" ? "承認メッセージを入力してください..." : "理由を入力してください..."}
                  value={actionMessage}
                  onChange={(e) => setActionMessage(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setActionModal({ open: false, type: null })}>
                キャンセル
              </Button>
              <Button
                variant={actionModal.type === "reject" ? "destructive" : "default"}
                onClick={handleActionConfirm}
                className={actionModal.type === "return" ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
              >
                {getActionTitle(actionModal.type)} 確認
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
};

export default ProductionExecution;
