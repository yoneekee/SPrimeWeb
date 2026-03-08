import { useState } from "react";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileDown, FileText, Eye, Printer, CheckCircle2, Clock } from "lucide-react";

interface DocItem {
  slipNo: string;
  partner: string;
  itemSummary: string;
  totalAmount: number;
  taxAmount: number;
  issueDate: string;
  printed: boolean;
}

const mockPO: DocItem[] = [
  { slipNo: "PO-20240309-001", partner: "도쿄반도체(주)", itemSummary: "실리콘 웨이퍼 300mm 외 2건", totalAmount: 75350000, taxAmount: 7535000, issueDate: "2024-03-09", printed: true },
  { slipNo: "PO-20240307-002", partner: "오사카정밀(주)", itemSummary: "바이톤 O-링 외 1건", totalAmount: 12800000, taxAmount: 1280000, issueDate: "2024-03-07", printed: false },
  { slipNo: "PO-20240305-001", partner: "나고야소재(주)", itemSummary: "SUS316L 스테인리스 판재", totalAmount: 34200000, taxAmount: 3420000, issueDate: "2024-03-05", printed: true },
  { slipNo: "PO-20240301-003", partner: "도쿄반도체(주)", itemSummary: "RF 전력 제어 PCB 외 3건", totalAmount: 28900000, taxAmount: 2890000, issueDate: "2024-03-01", printed: false },
];

const mockInvoice: DocItem[] = [
  { slipNo: "INV-20240311-001", partner: "삼성전자(주)", itemSummary: "플라즈마 에칭 장비 PE-500 외 2건", totalAmount: 269500000, taxAmount: 26950000, issueDate: "2024-03-11", printed: true },
  { slipNo: "INV-20240308-002", partner: "SK하이닉스(주)", itemSummary: "CVD 증착기 CV-300", totalAmount: 171600000, taxAmount: 17160000, issueDate: "2024-03-08", printed: true },
  { slipNo: "INV-20240306-001", partner: "도쿄일렉트론(주)", itemSummary: "정밀 웨이퍼 척 모듈 외 1건", totalAmount: 98450000, taxAmount: 9845000, issueDate: "2024-03-06", printed: false },
];

const InvoiceManagement = () => {
  const [docType, setDocType] = useState<"po" | "invoice">("po");
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const docs = docType === "po" ? mockPO : mockInvoice;

  const toggleCheck = (slipNo: string) => {
    setCheckedDocs((prev) =>
      prev.includes(slipNo) ? prev.filter((s) => s !== slipNo) : [...prev, slipNo]
    );
  };

  const toggleAll = () => {
    if (checkedDocs.length === docs.length) {
      setCheckedDocs([]);
    } else {
      setCheckedDocs(docs.map((d) => d.slipNo));
    }
  };

  // PDF preview mock detail items
  const previewItems = docType === "po"
    ? [
        { name: "실리콘 웨이퍼 300mm", spec: "300mm / P-type", qty: 500, unit: "EA", price: 85000, amount: 42500000 },
        { name: "포토레지스트 AZ-5214", spec: "1L / UV-grade", qty: 200, unit: "EA", price: 120000, amount: 24000000 },
        { name: "고순도 질소가스 (N2)", spec: "99.999% / 47L", qty: 50, unit: "SET", price: 45000, amount: 2250000 },
      ]
    : [
        { name: "플라즈마 에칭 장비 PE-500", spec: "Standard", qty: 3, unit: "SET", price: 45000000, amount: 135000000 },
        { name: "CVD 증착기 CV-300", spec: "Standard", qty: 1, unit: "SET", price: 78000000, amount: 78000000 },
        { name: "정밀 웨이퍼 척 모듈", spec: "Φ300", qty: 10, unit: "EA", price: 3200000, amount: 32000000 },
      ];

  const previewSubtotal = previewItems.reduce((s, i) => s + i.amount, 0);
  const previewTax = Math.floor(previewSubtotal * 0.1);
  const previewTotal = previewSubtotal + previewTax;

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div>
          <h1 className="text-lg font-bold text-foreground">청구서 / 발주서</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            발주서(PO) 및 청구서(Invoice)를 조회하고 PDF로 출력합니다
          </p>
        </div>

        {/* Search & Action */}
        <Card className="border-border bg-card">
          <CardContent className="px-4 py-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">문서 유형</label>
                <RadioGroup value={docType} onValueChange={(v) => { setDocType(v as "po" | "invoice"); setCheckedDocs([]); setSelectedDoc(null); }} className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="po" id="po" />
                    <Label htmlFor="po" className="text-xs cursor-pointer">발주서 (PO / 発注書)</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="invoice" id="invoice" />
                    <Label htmlFor="invoice" className="text-xs cursor-pointer">청구서 (Invoice / 請求書)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">조회 기간</label>
                <div className="flex items-center gap-2">
                  <Input type="date" defaultValue="2024-03-01" className="h-8 text-xs border-border w-32" />
                  <span className="text-xs text-muted-foreground">~</span>
                  <Input type="date" defaultValue="2024-03-31" className="h-8 text-xs border-border w-32" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">거래처 검색</label>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1 h-8">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-32" placeholder="거래처명 입력" />
                </div>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                  <Search className="w-3.5 h-3.5" /> 조회
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={checkedDocs.length === 0}>
                  <FileDown className="w-3.5 h-3.5" /> PDF 일괄출력 ({checkedDocs.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-4">
          {/* Document List */}
          <Card className="col-span-12 lg:col-span-7 border-border bg-card">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {docType === "po" ? "발주서 일람" : "청구서 일람"}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground ml-1">{docs.length}건</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="h-8 px-3 w-10">
                      <Checkbox checked={checkedDocs.length === docs.length && docs.length > 0} onCheckedChange={toggleAll} className="border-border" />
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">전표번호</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">거래처</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">품목 요약</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">총 금액 (税込)</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">발행상태</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">출력</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((doc) => (
                    <TableRow
                      key={doc.slipNo}
                      onClick={() => setSelectedDoc(doc.slipNo)}
                      className={`border-border cursor-pointer transition-colors ${selectedDoc === doc.slipNo ? "bg-primary/5" : "hover:bg-secondary/50"}`}
                    >
                      <TableCell className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={checkedDocs.includes(doc.slipNo)} onCheckedChange={() => toggleCheck(doc.slipNo)} className="border-border" />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs font-mono text-primary">{doc.slipNo}</TableCell>
                      <TableCell className="px-3 py-2 text-xs font-medium text-foreground">{doc.partner}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[160px]">{doc.itemSummary}</TableCell>
                      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">¥{(doc.totalAmount + doc.taxAmount).toLocaleString()}</TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        {doc.printed ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" /> 출력완료
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning border-warning/30">
                            <Clock className="w-3 h-3 mr-0.5" /> 미출력
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc.slipNo); }}>
                            <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Printer className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* PDF Preview */}
          <Card className="col-span-12 lg:col-span-5 border-border bg-card">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold">
                {docType === "po" ? "発注書 미리보기" : "請求書 미리보기"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {selectedDoc ? (
                <div className="border border-border rounded-md bg-background p-4 space-y-4 text-xs">
                  {/* Document Header */}
                  <div className="text-center">
                    <h2 className="text-base font-bold text-foreground tracking-widest">
                      {docType === "po" ? "発 注 書" : "請 求 書"}
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {docType === "po" ? "PURCHASE ORDER" : "INVOICE"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-muted-foreground">문서번호: </span>
                        <span className="font-mono text-foreground">{selectedDoc}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">발행일: </span>
                        <span className="text-foreground">2024年03月09日</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1.5">
                      <div className="font-medium text-foreground">S-Prime Corp.</div>
                      <div className="text-muted-foreground">〒150-0002 東京都渋谷区</div>
                      <div className="text-muted-foreground">TEL: 03-XXXX-XXXX</div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-2">
                    <div className="font-medium text-foreground mb-1">
                      {docType === "po"
                        ? "도쿄반도체(주) 御中"
                        : "삼성전자(주) 御中"}
                    </div>
                    {docType === "invoice" && (
                      <div className="text-muted-foreground text-[10px]">
                        下記の通りご請求申し上げます。お支払い期限: 2024年04月30日
                      </div>
                    )}
                  </div>

                  {/* Items Table */}
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-[10px] h-6 px-2">品目</TableHead>
                        <TableHead className="text-[10px] h-6 px-2">規格</TableHead>
                        <TableHead className="text-[10px] h-6 px-2 text-right">数量</TableHead>
                        <TableHead className="text-[10px] h-6 px-2 text-right">単価</TableHead>
                        <TableHead className="text-[10px] h-6 px-2 text-right">金額</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewItems.map((item, i) => (
                        <TableRow key={i} className="border-border hover:bg-transparent">
                          <TableCell className="px-2 py-1 text-[10px] text-foreground">{item.name}</TableCell>
                          <TableCell className="px-2 py-1 text-[10px] text-muted-foreground">{item.spec}</TableCell>
                          <TableCell className="px-2 py-1 text-[10px] text-right font-mono">{item.qty}</TableCell>
                          <TableCell className="px-2 py-1 text-[10px] text-right font-mono">¥{item.price.toLocaleString()}</TableCell>
                          <TableCell className="px-2 py-1 text-[10px] text-right font-mono">¥{item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Totals */}
                  <div className="border-t border-border pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">小計 (税抜)</span>
                      <span className="font-mono text-foreground">¥{previewSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">消費税 (10%)</span>
                      <span className="font-mono text-foreground">¥{previewTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-border pt-1">
                      <span className="text-foreground">合計金額 (税込)</span>
                      <span className="font-mono text-primary">¥{previewTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-border pt-2 text-[10px] text-muted-foreground">
                    {docType === "po" ? (
                      <>
                        <div>納期: 2024年03月20日</div>
                        <div>納品場所: 本社 第1倉庫</div>
                        <div>支払条件: 月末締め翌月末払い</div>
                        <div className="mt-2 text-right">
                          <span className="border border-dashed border-muted-foreground/50 rounded px-3 py-1">印</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>振込先: みずほ銀行 渋谷支店 普通 1234567</div>
                        <div>口座名義: エスプライム株式会社</div>
                        <div className="mt-2 text-right">
                          <span className="border border-dashed border-muted-foreground/50 rounded px-3 py-1">印</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-xs text-muted-foreground">
                  좌측 일람에서 문서를 선택하면 미리보기가 표시됩니다
                </div>
              )}

              {selectedDoc && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="gap-1.5 text-xs flex-1 bg-primary text-primary-foreground">
                    <Printer className="w-3.5 h-3.5" /> PDF 다운로드
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ERPLayout>
  );
};

export default InvoiceManagement;
