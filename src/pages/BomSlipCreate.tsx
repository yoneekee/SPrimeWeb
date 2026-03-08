import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

// 완제품 카탈로그 (BOM 대상)
const FINISHED_PRODUCTS = [
  { code: "FIN-ETCH-500", name: "플라즈마 에칭 장비 PE-500" },
  { code: "FIN-CVD-300", name: "CVD 증착기 CV-300" },
  { code: "FIN-SPUT-200", name: "스퍼터링 시스템 SP-200" },
  { code: "FIN-CMP-100", name: "CMP 연마 장비 CM-100" },
  { code: "FIN-CLEAN-400", name: "세정 장비 CL-400" },
];

// BOM 데이터 (완제품별 하위 부품 트리)
const BOM_DATA: Record<string, BomNode[]> = {
  "FIN-ETCH-500": [
    { level: 1, itemCode: "SEMI-CHAMBER-01", itemName: "진공 챔버 모듈", requiredQty: 1, lossRate: 2, stockQty: 8, warehouse: "본사 제1창고" },
    { level: 2, itemCode: "RAW-STEEL-SUS", itemName: "SUS316L 스테인리스 판재", requiredQty: 4, lossRate: 2, stockQty: 50, warehouse: "본사 제2창고" },
    { level: 2, itemCode: "RAW-ORING-VT", itemName: "바이톤 O-링 (Φ300)", requiredQty: 8, lossRate: 0, stockQty: 25, warehouse: "본사 제1창고" },
    { level: 1, itemCode: "SEMI-RF-GEN", itemName: "RF 발생기 유닛", requiredQty: 1, lossRate: 0, stockQty: 3, warehouse: "본사 제1창고" },
    { level: 2, itemCode: "RAW-PCB-RF01", itemName: "RF 전력 제어 PCB", requiredQty: 2, lossRate: 3, stockQty: 15, warehouse: "시부야 물류센터" },
    { level: 2, itemCode: "RAW-CAP-HV", itemName: "고압 세라믹 커패시터", requiredQty: 12, lossRate: 1, stockQty: 40, warehouse: "본사 제2창고" },
    { level: 1, itemCode: "SEMI-GAS-SYS", itemName: "가스 공급 시스템", requiredQty: 1, lossRate: 0, stockQty: 6, warehouse: "본사 제1창고" },
    { level: 2, itemCode: "RAW-VALVE-APC", itemName: "APC 밸브 (자동압력제어)", requiredQty: 3, lossRate: 0, stockQty: 10, warehouse: "본사 제2창고" },
  ],
  "FIN-CVD-300": [
    { level: 1, itemCode: "SEMI-HEATER-01", itemName: "히팅 챔버 모듈", requiredQty: 1, lossRate: 1, stockQty: 5, warehouse: "본사 제1창고" },
    { level: 2, itemCode: "RAW-QUARTZ-01", itemName: "석영 튜브 (Φ200)", requiredQty: 2, lossRate: 5, stockQty: 12, warehouse: "본사 제2창고" },
    { level: 2, itemCode: "RAW-HEATER-EL", itemName: "SiC 히팅 엘리먼트", requiredQty: 6, lossRate: 2, stockQty: 20, warehouse: "본사 제1창고" },
    { level: 1, itemCode: "SEMI-GAS-MIX", itemName: "가스 혼합 유닛", requiredQty: 1, lossRate: 0, stockQty: 4, warehouse: "본사 제1창고" },
    { level: 2, itemCode: "RAW-MFC-01", itemName: "MFC (Mass Flow Controller)", requiredQty: 4, lossRate: 0, stockQty: 18, warehouse: "시부야 물류센터" },
  ],
  "FIN-SPUT-200": [
    { level: 1, itemCode: "SEMI-TARGET-01", itemName: "스퍼터 타겟 모듈", requiredQty: 1, lossRate: 0, stockQty: 7, warehouse: "본사 제1창고" },
    { level: 2, itemCode: "RAW-TI-DISK", itemName: "티타늄 디스크 (Φ300)", requiredQty: 1, lossRate: 0, stockQty: 10, warehouse: "본사 제2창고" },
    { level: 2, itemCode: "RAW-MAG-ASY", itemName: "마그네트론 어셈블리", requiredQty: 1, lossRate: 0, stockQty: 4, warehouse: "본사 제1창고" },
    { level: 1, itemCode: "SEMI-PUMP-TMP", itemName: "터보분자펌프 유닛", requiredQty: 1, lossRate: 0, stockQty: 3, warehouse: "본사 제1창고" },
  ],
};

interface BomNode {
  level: number;
  itemCode: string;
  itemName: string;
  requiredQty: number;
  lossRate: number;
  stockQty: number;
  warehouse: string;
}

interface ExpandedBomRow extends BomNode {
  totalQty: number;
  shortage: number;
}

const generateSlipNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `BOM${y}${m}${d}-${seq}`;
};

const BomSlipCreate = () => {
  const navigate = useNavigate();
  const [slipNo] = useState(generateSlipNo());
  const [reqDate, setReqDate] = useState(new Date().toISOString().split("T")[0]);
  const [requester] = useState("김민수");
  const [department] = useState("제조1팀");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [targetQty, setTargetQty] = useState(1);
  const [remark, setRemark] = useState("");

  // BOM 전개 결과
  const bomRows: ExpandedBomRow[] = (() => {
    if (!selectedProduct) return [];
    const nodes = BOM_DATA[selectedProduct] || [];
    return nodes.map((node) => {
      const totalQty = parseFloat((node.requiredQty * targetQty * (1 + node.lossRate / 100)).toFixed(1));
      return {
        ...node,
        totalQty,
        shortage: node.stockQty - totalQty,
      };
    });
  })();

  const shortageCount = bomRows.filter((r) => r.shortage < 0).length;
  const sufficientCount = bomRows.filter((r) => r.shortage >= 0).length;
  const productInfo = FINISHED_PRODUCTS.find((p) => p.code === selectedProduct);

  const handleSave = () => {
    if (!selectedProduct) {
      toast.error("생산 대상 완제품을 선택해주세요.");
      return;
    }
    if (targetQty < 1) {
      toast.error("생산 목표량은 1 이상이어야 합니다.");
      return;
    }
    toast.success("BOM 생산전표가 저장되었습니다 (작성중 상태)");
    navigate("/documents/bom");
  };

  const handleSubmit = () => {
    if (!selectedProduct) {
      toast.error("생산 대상 완제품을 선택해주세요.");
      return;
    }
    if (targetQty < 1) {
      toast.error("생산 목표량은 1 이상이어야 합니다.");
      return;
    }
    if (shortageCount > 0) {
      toast.warning(`부족 부품이 ${shortageCount}건 있습니다. 그래도 신청하시겠습니까?`);
    }
    toast.success("BOM 생산전표가 신청되었습니다");
    navigate("/documents/bom");
  };

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/documents/bom")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              목록
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-bold text-foreground">신규 BOM 생산전표 작성</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                완제품 생산 계획을 수립하고 BOM 기반 부품 과부족을 확인합니다
              </p>
            </div>
          </div>
          <Badge className="bg-muted text-muted-foreground text-xs px-2.5 py-0.5">
            작성중 (Draft)
          </Badge>
        </div>

        {/* Header Info */}
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
                <Input value={slipNo} readOnly className="h-8 text-xs font-mono bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">작성일자</label>
                <Input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="h-8 text-xs border-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">기안자(부서)</label>
                <Input value={`${requester} (${department})`} readOnly className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">생산 목표량</label>
                <Input
                  type="number"
                  min={1}
                  value={targetQty}
                  onChange={(e) => setTargetQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-8 text-xs border-border font-mono"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">생산 대상 완제품</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="완제품을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {FINISHED_PRODUCTS.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        <span className="font-mono text-primary mr-2">{p.code}</span>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">비고</label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="생산 전표에 대한 비고사항을 입력하세요"
                  className="text-xs border-border min-h-[60px] resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BOM Expansion Result */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                BOM 전개 결과
                {productInfo && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-primary">
                    {productInfo.code}
                  </Badge>
                )}
              </CardTitle>
              {bomRows.length > 0 && (
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-3 h-3" /> 충족 {sufficientCount}건
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="w-3 h-3" /> 부족 {shortageCount}건
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {!selectedProduct ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Layers className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">생산 대상 완제품을 선택하면 BOM이 자동 전개됩니다</p>
              </div>
            ) : bomRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">해당 완제품의 BOM 데이터가 없습니다</p>
              </div>
            ) : (
              <>
                {/* 완제품 요약 */}
                <div className="px-4 py-2.5 bg-primary/5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary">L0</Badge>
                    <span className="text-xs font-mono text-primary">{selectedProduct}</span>
                    <span className="text-xs font-bold text-foreground">{productInfo?.name}</span>
                  </div>
                  <span className="text-xs font-mono text-foreground">목표: {targetQty}대</span>
                </div>

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
                      {bomRows.map((item, idx) => (
                        <TableRow key={idx} className="border-border hover:bg-secondary/50">
                          <TableCell className="px-3 py-2">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                              item.level === 1 ? "border-info/50 text-info" : "border-muted-foreground/50 text-muted-foreground"
                            }`}>
                              L{item.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs font-mono text-primary" style={{ paddingLeft: `${12 + item.level * 16}px` }}>
                            <span className="text-muted-foreground/40 mr-1">└</span>
                            {item.itemCode}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-foreground">{item.itemName}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">{item.requiredQty}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-muted-foreground">
                            {item.lossRate > 0 ? `${item.lossRate}%` : "-"}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono font-medium text-foreground">
                            {item.totalQty.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                            {item.stockQty.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {item.shortage >= 0 ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                              )}
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
                    <span className="text-muted-foreground">부품 총 {bomRows.length}건</span>
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="w-3 h-3" /> 부족 {shortageCount}건
                    </span>
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3 h-3" /> 충족 {sufficientCount}건
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/documents/bom")}
            className="gap-1.5 text-xs"
          >
            취소
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="gap-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            임시저장
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-3.5 h-3.5" />
            생산 신청
          </Button>
        </div>
      </div>
    </ERPLayout>
  );
};

export default BomSlipCreate;
