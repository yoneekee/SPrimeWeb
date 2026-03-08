import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import ItemSelectModal, { CatalogItem } from "@/components/erp/ItemSelectModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ShipmentDetailItem {
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

const PRODUCT_CATALOG = [
  { code: "FIN-ETCH-500", name: "플라즈마 에칭 장비 PE-500", stockQty: 12, unit: "EA", price: 45000000 },
  { code: "FIN-CVD-300", name: "CVD 증착기 CV-300", stockQty: 8, unit: "EA", price: 78000000 },
  { code: "FIN-SPUT-200", name: "스퍼터링 장비 SP-200", stockQty: 5, unit: "EA", price: 62000000 },
  { code: "SEMI-CHUCK-01", name: "정밀 웨이퍼 척 모듈", stockQty: 45, unit: "EA", price: 3200000 },
  { code: "SEMI-ALIGN-02", name: "자동 정렬 모듈 AL-02", stockQty: 30, unit: "EA", price: 5600000 },
  { code: "FIN-CMP-100", name: "CMP 연마 장비 CM-100", stockQty: 3, unit: "EA", price: 95000000 },
  { code: "SEMI-VALVE-05", name: "초고진공 밸브 UV-05", stockQty: 120, unit: "EA", price: 850000 },
  { code: "FIN-CLEAN-400", name: "세정 장비 CL-400", stockQty: 6, unit: "EA", price: 38000000 },
];

const CUSTOMERS = [
  { value: "tel", label: "東京エレクトロン(株)" },
  { value: "screen", label: "SCREEN HD(株)" },
  { value: "disco", label: "ディスコ(株)" },
  { value: "tsmc", label: "TSMC Japan" },
  { value: "renesas", label: "ルネサス(株)" },
];

const WAREHOUSES = [
  { value: "wh1", label: "본사 제1창고" },
  { value: "wh2", label: "본사 제2창고" },
  { value: "wh3", label: "시부야 물류센터" },
  { value: "wh4", label: "오사카 물류센터" },
];

const generateSlipNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `SHP${y}${m}${d}-${seq}`;
};

const ShipmentSlipCreate = () => {
  const navigate = useNavigate();
  const [slipNo] = useState(generateSlipNo());
  const [shipDate, setShipDate] = useState(new Date().toISOString().split("T")[0]);
  const [requester] = useState("정수현");
  const [department] = useState("물류팀");
  const [customer, setCustomer] = useState("");
  const [deliveryAddr, setDeliveryAddr] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [remark, setRemark] = useState("");
  const [details, setDetails] = useState<ShipmentDetailItem[]>([]);
  const [nextId, setNextId] = useState(1);
  const [itemSearch, setItemSearch] = useState("");

  const filteredCatalog = PRODUCT_CATALOG.filter(
    (item) =>
      item.code.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const addItem = (catalogItem: typeof PRODUCT_CATALOG[0]) => {
    const existing = details.find((d) => d.itemCode === catalogItem.code);
    if (existing) {
      toast.error("이미 추가된 품목입니다.");
      return;
    }
    setDetails((prev) => [
      ...prev,
      {
        id: nextId,
        itemCode: catalogItem.code,
        itemName: catalogItem.name,
        stockQty: catalogItem.stockQty,
        shipQty: 1,
        unitPrice: catalogItem.price,
        salesAmount: catalogItem.price,
        inTransit: true,
        lotNo: "",
      },
    ]);
    setNextId((n) => n + 1);
    setItemSearch("");
  };

  const removeItem = (id: number) => {
    setDetails((prev) => prev.filter((d) => d.id !== id));
  };

  const updateShipQty = (id: number, qty: number) => {
    setDetails((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, shipQty: qty, salesAmount: qty * d.unitPrice }
          : d
      )
    );
  };

  const updateLot = (id: number, lot: string) => {
    setDetails((prev) =>
      prev.map((d) => (d.id === id ? { ...d, lotNo: lot } : d))
    );
  };

  const updateTransit = (id: number, checked: boolean) => {
    setDetails((prev) =>
      prev.map((d) => (d.id === id ? { ...d, inTransit: checked } : d))
    );
  };

  const totalAmount = details.reduce((sum, d) => sum + d.salesAmount, 0);
  const hasStockWarning = details.some((d) => d.shipQty > d.stockQty);

  const handleSave = () => {
    if (details.length === 0) {
      toast.error("최소 1개 이상의 품목을 추가해주세요.");
      return;
    }
    toast.success("출고 전표가 저장되었습니다 (작성중 상태)");
    navigate("/production/shipping");
  };

  const handleSubmit = () => {
    if (details.length === 0) {
      toast.error("최소 1개 이상의 품목을 추가해주세요.");
      return;
    }
    if (!customer) {
      toast.error("고객사를 선택해주세요.");
      return;
    }
    if (!warehouse) {
      toast.error("출발지 창고를 선택해주세요.");
      return;
    }
    if (hasStockWarning) {
      toast.error("출고수량이 현재고를 초과하는 품목이 있습니다.");
      return;
    }
    toast.success("출고 전표가 신청되었습니다");
    navigate("/production/shipping");
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
              onClick={() => navigate("/production/shipping")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              목록
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-bold text-foreground">신규 출고전표 작성</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                완제품 출고를 위한 신규 전표를 작성합니다
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
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">출고희망일</label>
                <Input
                  type="date"
                  value={shipDate}
                  onChange={(e) => setShipDate(e.target.value)}
                  className="h-8 text-xs border-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">신청자(부서)</label>
                <Input value={`${requester} (${department})`} readOnly className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">고객사</label>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="고객사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMERS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">배송지 주소</label>
                <Input
                  value={deliveryAddr}
                  onChange={(e) => setDeliveryAddr(e.target.value)}
                  placeholder="배송지 주소를 입력하세요"
                  className="h-8 text-xs border-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">출발지 창고</label>
                <Select value={warehouse} onValueChange={setWarehouse}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="창고 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSES.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">총 출고금액</label>
                <Input
                  value={`¥${totalAmount.toLocaleString()}`}
                  readOnly
                  className="h-8 text-xs font-mono bg-muted/50 border-border text-primary font-semibold"
                />
              </div>
              <div className="col-span-2 md:col-span-4 space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">비고</label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="출고 전표에 대한 비고사항을 입력하세요"
                  className="text-xs border-border min-h-[60px] resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Item Search & Add */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold">품목 검색 및 추가</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1.5 flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                  placeholder="품목코드 또는 품목명으로 검색..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>
            </div>
            {itemSearch && (
              <div className="border border-border rounded-md overflow-hidden max-h-[180px] overflow-y-auto">
                {filteredCatalog.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  filteredCatalog.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => addItem(item)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-secondary cursor-pointer border-b border-border last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-primary">{item.code}</span>
                        <span className="text-xs font-medium text-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground">재고: {item.stockQty}</span>
                        <span className="text-xs font-mono text-foreground">¥{item.price.toLocaleString()}</span>
                        <Plus className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Items */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                상세 품목 일람
                {details.length > 0 && (
                  <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                    {details.length}건
                  </Badge>
                )}
              </CardTitle>
              {hasStockWarning && (
                <div className="flex items-center gap-1.5 text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px]">재고 부족 품목 있음</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {details.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">출고할 품목을 검색하여 추가해주세요</p>
              </div>
            ) : (
              <>
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
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((item) => {
                        const overStock = item.shipQty > item.stockQty;
                        return (
                          <TableRow key={item.id} className={`border-border hover:bg-secondary/50 ${overStock ? "bg-destructive/5" : ""}`}>
                            <TableCell className="px-3 py-2 text-xs font-mono text-primary">{item.itemCode}</TableCell>
                            <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{item.itemName}</TableCell>
                            <TableCell className="px-3 py-2 text-xs text-right font-mono">
                              <span className={item.stockQty <= 5 ? "text-warning" : "text-success"}>
                                {item.stockQty.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-right">
                              <div className="flex items-center justify-end gap-1">
                                {overStock && <AlertTriangle className="w-3 h-3 text-destructive" />}
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.shipQty}
                                  onChange={(e) => updateShipQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                                  className={`h-6 w-20 text-xs text-right border-border ml-auto ${overStock ? "border-destructive text-destructive" : ""}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                              ¥{item.unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                              ¥{item.salesAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-center">
                              <Checkbox
                                checked={item.inTransit}
                                onCheckedChange={(checked) => updateTransit(item.id, !!checked)}
                                className="border-border"
                              />
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs">
                              <Input
                                value={item.lotNo}
                                onChange={(e) => updateLot(item.id, e.target.value)}
                                placeholder="LOT-"
                                className="h-6 w-32 text-xs font-mono border-border"
                              />
                            </TableCell>
                            <TableCell className="px-3 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30">
                  <span className="text-xs text-muted-foreground">합계</span>
                  <span className="text-sm font-mono font-bold text-primary">
                    ¥{totalAmount.toLocaleString()}
                  </span>
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
            onClick={() => navigate("/production/shipping")}
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
            출고신청
          </Button>
        </div>
      </div>
    </ERPLayout>
  );
};

export default ShipmentSlipCreate;
