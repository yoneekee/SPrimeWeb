import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  Truck,
  PackageCheck,
  Receipt,
  AlertTriangle,
  Plus,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatusFlowStepper from "@/components/erp/StatusFlowStepper";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "作成中 (Draft)", color: "bg-muted text-muted-foreground" },
  S01: { label: "申請中 (Pending)", color: "bg-info/20 text-info" },
  A00: { label: "承認中 (In-Review)", color: "bg-warning/20 text-warning" },
  A01: { label: "承認済 (Approved)", color: "bg-success/20 text-success" },
  A02: { label: "否認 (Rejected)", color: "bg-destructive/20 text-destructive" },
  T01: { label: "積送中 (Transit)", color: "bg-info/20 text-info" },
  T02: { label: "出庫済 (Delivered)", color: "bg-primary/20 text-primary" },
  T03: { label: "売上確定 (Invoiced)", color: "bg-success/20 text-success" },
  T04: { label: "在庫調整 (Adjusted)", color: "bg-warning/20 text-warning" },
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
    itemName: "プラズマエッチング装置 PE-500",
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
    itemName: "CVD成膜装置 CV-300",
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
    itemName: "精密ウェーハチャックモジュール",
    stockQty: 45,
    shipQty: 10,
    unitPrice: 3200000,
    salesAmount: 32000000,
    inTransit: false,
    lotNo: "LOT-SM-2024-015",
  },
];

const mockWorkflow: WorkflowEntry[] = [
  { stepNo: 1, status: "出庫申請", empName: "高橋 修平", role: "申請者", comment: "東京エレクトロン 川崎FAB 納品案件", procAt: "2024-03-10 09:00:00" },
  { stepNo: 2, status: "承認", empName: "佐藤 花子", role: "承認者（1次）", comment: "在庫確認完了、承認", procAt: "2024-03-10 11:30:00" },
  { stepNo: 3, status: "承認", empName: "鈴木 一郎", role: "承認者（2次）", comment: "出庫承認", procAt: "2024-03-10 14:00:00" },
  { stepNo: 4, status: "配送開始", empName: "山田 優子", role: "物流担当", comment: "運送業者: ヤマト運輸 / 送り状番号: YMT-240311-0891", procAt: "2024-03-11 08:30:00" },
];

const ShipmentManagement = () => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState("T01");
  const [slipList] = useState([
    { slipNo: "SHP20240310-001", date: "2024-03-10", customer: "東京エレクトロン(株)", status: "T01", totalAmount: "245,000,000" },
    { slipNo: "SHP20240308-002", date: "2024-03-08", customer: "SCREEN HD(株)", status: "T03", totalAmount: "156,000,000" },
    { slipNo: "SHP20240306-001", date: "2024-03-06", customer: "ディスコ(株)", status: "T02", totalAmount: "89,500,000" },
    { slipNo: "SHP20240303-003", date: "2024-03-03", customer: "TSMC Japan", status: "T04", totalAmount: "12,800,000" },
  ]);
  const [selectedSlip, setSelectedSlip] = useState("SHP20240310-001");

  const [actionModal, setActionModal] = useState<{
    open: boolean;
    type: "approve" | "reject" | null;
  }>({ open: false, type: null });
  const [actionMessage, setActionMessage] = useState("");

  const statusInfo = STATUS_MAP[currentStatus] || STATUS_MAP.S00;

  const isButtonActive = (btn: string) => {
    switch (btn) {
      case "apply": return currentStatus === "S00";
      case "approve": return currentStatus === "A00";
      case "reject": return currentStatus === "A00";
      case "transit": return currentStatus === "A01";
      case "delivered": return currentStatus === "T01";
      case "invoiced": return currentStatus === "T02";
      case "adjust": return true;
      default: return false;
    }
  };

  const getActionTitle = (type: "approve" | "reject" | null) => {
    switch (type) {
      case "approve": return "承認";
      case "reject": return "否認";
      default: return "";
    }
  };

  const getActionDescription = (type: "approve" | "reject" | null) => {
    switch (type) {
      case "approve": return "該当出庫伝票を承認します。承認メッセージを入力してください。";
      case "reject": return "該当出庫伝票を否認します。否認理由を入力してください。";
      default: return "";
    }
  };

  const handleActionConfirm = () => {
    console.log(`Action: ${actionModal.type}, Message: ${actionMessage}`);
    setActionModal({ open: false, type: null });
    setActionMessage("");
  };

  const openActionModal = (type: "approve" | "reject") => {
    setActionModal({ open: true, type });
    setActionMessage("");
  };

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">出庫および在庫調整</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              完成品出庫申請から売上確定および在庫調整までの全プロセスを管理します
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/production/shipping/new")} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-3.5 h-3.5" />
            新規出庫伝票
          </Button>
        </div>

        {/* Top: Slip List + Action Buttons */}
        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-12 lg:col-span-4 border-border bg-card">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">出庫伝票一覧</CardTitle>
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
                  <Send className="w-3.5 h-3.5" /> 出庫申請
                </Button>
                <Button size="sm" variant={isButtonActive("approve") ? "default" : "outline"} disabled={!isButtonActive("approve")} onClick={() => openActionModal("approve")} className="gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 承認
                </Button>
                <Button size="sm" variant={isButtonActive("reject") ? "destructive" : "outline"} disabled={!isButtonActive("reject")} onClick={() => openActionModal("reject")} className="gap-1.5 text-xs">
                  <XCircle className="w-3.5 h-3.5" /> 否認
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button size="sm" variant={isButtonActive("transit") ? "default" : "outline"} disabled={!isButtonActive("transit")} className="gap-1.5 text-xs">
                  <Truck className="w-3.5 h-3.5" /> 配送開始（積送）
                </Button>
                <Button size="sm" variant={isButtonActive("delivered") ? "default" : "outline"} disabled={!isButtonActive("delivered")} className="gap-1.5 text-xs">
                  <PackageCheck className="w-3.5 h-3.5" /> 出庫完了
                </Button>
                <Button size="sm" variant={isButtonActive("invoiced") ? "default" : "outline"} disabled={!isButtonActive("invoiced")} className="gap-1.5 text-xs">
                  <Receipt className="w-3.5 h-3.5" /> 売上確定
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-warning/50 text-warning hover:bg-warning/10">
                  <AlertTriangle className="w-3.5 h-3.5" /> 在庫調整
                </Button>
              </div>

              <StatusFlowStepper
                steps={[
                  { code: "S00", label: "作成中" },
                  { code: "S01", label: "申請中" },
                  { code: "A00", label: "承認中" },
                  { code: "A01", label: "承認済" },
                  { code: "T01", label: "積送中" },
                  { code: "T02", label: "出庫済" },
                  { code: "T03", label: "売上確定" },
                ]}
                currentStatus={currentStatus}
                extraStep={{ code: "T04", label: "在庫調整" }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Slip Header */}
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
                <Input value="SHP20240310-001" readOnly className="h-8 text-xs font-mono bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票ステータス</label>
                <div className="h-8 flex items-center">
                  <Badge className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">出庫希望日</label>
                <Input type="date" defaultValue="2024-03-15" disabled={currentStatus !== "S00"} className="h-8 text-xs border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">得意先名</label>
                <Input value="東京エレクトロン(株) 川崎事業所" readOnly={currentStatus !== "S00"} className="h-8 text-xs border-border" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">配送先住所</label>
                <Input value="〒212-0032 神奈川県川崎市幸区新川崎7-1" readOnly={currentStatus !== "S00"} className="h-8 text-xs border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">出発地倉庫</label>
                <Select disabled={currentStatus !== "S00"}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="本社 第1倉庫" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wh1">本社 第1倉庫</SelectItem>
                    <SelectItem value="wh2">本社 第2倉庫</SelectItem>
                    <SelectItem value="wh3">渋谷物流センター</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">出庫合計金額</label>
                <Input value="¥245,000,000" readOnly className="h-8 text-xs font-mono bg-muted/50 border-border text-primary font-semibold" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Items */}
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
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">実在庫</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">出庫数量</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">単価</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">売上金額</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">積送対象</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">LOT番号</TableHead>
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
              <span className="text-xs text-muted-foreground">合計</span>
              <span className="text-sm font-mono font-bold text-primary">
                ¥{mockItems.reduce((sum, d) => sum + d.salesAmount, 0).toLocaleString()}
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

        {/* Action Modal */}
        <Dialog open={actionModal.open} onOpenChange={(open) => setActionModal({ open, type: open ? actionModal.type : null })}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionModal.type === "approve" && <CheckCircle2 className="w-5 h-5 text-success" />}
                {actionModal.type === "reject" && <XCircle className="w-5 h-5 text-destructive" />}
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
                  placeholder={actionModal.type === "approve" ? "承認メッセージを入力してください..." : "否認理由を入力してください..."}
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

export default ShipmentManagement;
