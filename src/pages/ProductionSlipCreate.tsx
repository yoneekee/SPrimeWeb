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
} from "lucide-react";
import { toast } from "sonner";

interface NewDetailItem {
  id: number;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  orderQty: number;
  unitPrice: number;
  supplyAmount: number;
  lotNo: string;
}

const ITEM_CATALOG = [
  { code: "SEMI-WAFER-01", name: "실리콘 웨이퍼 300mm", spec: "300mm / P-type", unit: "EA", price: 85000 },
  { code: "SEMI-WAFER-02", name: "실리콘 웨이퍼 200mm", spec: "200mm / N-type", unit: "EA", price: 62000 },
  { code: "SEMI-CHEM-03", name: "포토레지스트 AZ-5214", spec: "1L / UV-grade", unit: "EA", price: 120000 },
  { code: "SEMI-CHEM-04", name: "현상액 AZ-300MIF", spec: "5L / TMAH", unit: "EA", price: 95000 },
  { code: "SEMI-GAS-07", name: "고순도 질소가스 (N2)", spec: "99.999% / 47L", unit: "SET", price: 45000 },
  { code: "SEMI-GAS-08", name: "고순도 아르곤가스 (Ar)", spec: "99.9999% / 47L", unit: "SET", price: 78000 },
  { code: "SEMI-PART-10", name: "석영 보트 6인치", spec: "6\" / 25slot", unit: "EA", price: 350000 },
  { code: "SEMI-PART-11", name: "O-Ring (Viton)", spec: "ID200 x 5.0", unit: "EA", price: 12000 },
];

const generateSlipNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `SLP${y}${m}${d}-${seq}`;
};

const ProductionSlipCreate = () => {
  const navigate = useNavigate();
  const [slipNo] = useState(generateSlipNo());
  const [reqDate, setReqDate] = useState(new Date().toISOString().split("T")[0]);
  const [requester] = useState("김민수");
  const [department] = useState("제조1팀");
  const [vendor, setVendor] = useState("");
  const [remark, setRemark] = useState("");
  const [details, setDetails] = useState<NewDetailItem[]>([]);
  const [nextId, setNextId] = useState(1);
  const [itemSearch, setItemSearch] = useState("");

  const filteredCatalog = ITEM_CATALOG.filter(
    (item) =>
      item.code.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const addItem = (catalogItem: typeof ITEM_CATALOG[0]) => {
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
        spec: catalogItem.spec,
        unit: catalogItem.unit,
        orderQty: 1,
        unitPrice: catalogItem.price,
        supplyAmount: catalogItem.price,
        lotNo: "",
      },
    ]);
    setNextId((n) => n + 1);
    setItemSearch("");
  };

  const removeItem = (id: number) => {
    setDetails((prev) => prev.filter((d) => d.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    setDetails((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, orderQty: qty, supplyAmount: qty * d.unitPrice }
          : d
      )
    );
  };

  const updateLot = (id: number, lot: string) => {
    setDetails((prev) =>
      prev.map((d) => (d.id === id ? { ...d, lotNo: lot } : d))
    );
  };

  const totalAmount = details.reduce((sum, d) => sum + d.supplyAmount, 0);

  const handleSave = () => {
    if (details.length === 0) {
      toast.error("최소 1개 이상의 품목을 추가해주세요.");
      return;
    }
    toast.success("전표가 저장되었습니다 (작성중 상태)");
    navigate("/production/execution");
  };

  const handleSubmit = () => {
    if (details.length === 0) {
      toast.error("최소 1개 이상의 품목을 추가해주세요.");
      return;
    }
    if (!vendor) {
      toast.error("희망발주처를 선택해주세요.");
      return;
    }
    toast.success("전표가 신청되었습니다");
    navigate("/production/execution");
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
              onClick={() => navigate("/production/execution")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              목록
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-bold text-foreground">신규 전표 작성</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                원재료 조달을 위한 신규 전표를 작성합니다
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-muted text-muted-foreground text-xs px-2.5 py-0.5">
              작성중 (Draft)
            </Badge>
          </div>
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
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">신청일자</label>
                <Input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="h-8 text-xs border-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">신청자(부서)</label>
                <Input value={`${requester} (${department})`} readOnly className="h-8 text-xs bg-muted/50 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">희망발주처</label>
                <Select value={vendor} onValueChange={setVendor}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue placeholder="발주처 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokyo">도쿄반도체(주)</SelectItem>
                    <SelectItem value="osaka">오사카정밀(주)</SelectItem>
                    <SelectItem value="samsung">삼성전자(주)</SelectItem>
                    <SelectItem value="sk">SK하이닉스(주)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 md:col-span-3 space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">비고</label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="전표에 대한 비고사항을 입력하세요"
                  className="text-xs border-border min-h-[60px] resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">총 합계금액</label>
                <Input
                  value={`¥${totalAmount.toLocaleString()}`}
                  readOnly
                  className="h-8 text-xs font-mono bg-muted/50 border-border text-primary font-semibold"
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
                        <span className="text-[10px] text-muted-foreground">{item.spec}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{item.unit}</span>
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
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {details.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">품목을 검색하여 추가해주세요</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">품목코드</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">품목명</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">규격</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">단위</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">발주수량</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">단가</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">공급가액</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">LOT번호</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((item) => (
                        <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                          <TableCell className="px-3 py-2 text-xs font-mono text-primary">{item.itemCode}</TableCell>
                          <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{item.itemName}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-muted-foreground">{item.spec}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-center text-muted-foreground">{item.unit}</TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right">
                            <Input
                              type="number"
                              min={1}
                              value={item.orderQty}
                              onChange={(e) => updateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                              className="h-6 w-20 text-xs text-right border-border ml-auto"
                            />
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                            ¥{item.unitPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">
                            ¥{item.supplyAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-xs">
                            <Input
                              value={item.lotNo}
                              onChange={(e) => updateLot(item.id, e.target.value)}
                              placeholder="LOT-"
                              className="h-6 w-28 text-xs font-mono border-border"
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
                      ))}
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
            onClick={() => navigate("/production/execution")}
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
            신청
          </Button>
        </div>
      </div>
    </ERPLayout>
  );
};

export default ProductionSlipCreate;
