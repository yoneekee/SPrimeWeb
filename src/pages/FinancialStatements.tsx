import { useState } from "react";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileDown, FileText, TrendingUp, TrendingDown } from "lucide-react";

// B/S mock data
const bsAssets = [
  { code: "1101", name: "原材料", amount: 128500000, ratio: 18.2 },
  { code: "1102", name: "半製品（仕掛品）", amount: 95200000, ratio: 13.5 },
  { code: "1103", name: "製品（完成品）", amount: 312000000, ratio: 44.2 },
  { code: "1104", name: "未着品", amount: 45600000, ratio: 6.5 },
  { code: "1105", name: "積送品", amount: 78300000, ratio: 11.1 },
  { code: "1106", name: "売掛金", amount: 46200000, ratio: 6.5 },
];

const bsLiabilities = [
  { code: "2101", name: "買掛金", amount: 89400000, ratio: 62.3 },
  { code: "2102", name: "未払金", amount: 54100000, ratio: 37.7 },
];

// P/L mock data
const plRevenue = [
  { code: "4101", name: "売上高", amount: 542000000, ratio: 100.0 },
];

const plExpenses = [
  { code: "5101", name: "売上原価", amount: 378500000, ratio: 69.8 },
  { code: "5102", name: "棚卸減耗損", amount: 4200000, ratio: 0.8 },
];

const FinancialStatements = () => {
  const [reportType, setReportType] = useState<"bs" | "pl">("bs");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-03-31");
  const [isQueried, setIsQueried] = useState(true);

  const assetTotal = bsAssets.reduce((s, a) => s + a.amount, 0);
  const liabilityTotal = bsLiabilities.reduce((s, a) => s + a.amount, 0);
  const equityTotal = assetTotal - liabilityTotal;
  const revenueTotal = plRevenue.reduce((s, a) => s + a.amount, 0);
  const expenseTotal = plExpenses.reduce((s, a) => s + a.amount, 0);
  const netIncome = revenueTotal - expenseTotal;

  const renderAccountRow = (item: { code: string; name: string; amount: number; ratio: number }, idx: number) => (
    <TableRow key={item.code} className="border-border hover:bg-secondary/50">
      <TableCell className="px-3 py-2 text-xs font-mono text-muted-foreground">{item.code}</TableCell>
      <TableCell className="px-3 py-2 text-xs text-foreground">{item.name}</TableCell>
      <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">¥{item.amount.toLocaleString()}</TableCell>
      <TableCell className="px-3 py-2 text-xs text-right font-mono text-muted-foreground">{item.ratio.toFixed(1)}%</TableCell>
    </TableRow>
  );

  const renderSummaryRow = (label: string, amount: number, highlight?: boolean) => (
    <TableRow className="border-border bg-muted/30 hover:bg-muted/40">
      <TableCell className="px-3 py-2" />
      <TableCell className={`px-3 py-2 text-xs font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{label}</TableCell>
      <TableCell className={`px-3 py-2 text-xs text-right font-mono font-bold ${highlight ? "text-primary" : "text-foreground"}`}>¥{amount.toLocaleString()}</TableCell>
      <TableCell className="px-3 py-2 text-xs text-right font-mono text-muted-foreground">100.0%</TableCell>
    </TableRow>
  );

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div>
          <h1 className="text-lg font-bold text-foreground">財務諸表照会</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            貸借対照表（B/S）および損益計算書（P/L）を照会し、PDFで出力します
          </p>
        </div>

        {/* Search & Action */}
        <Card className="border-border bg-card">
          <CardContent className="px-4 py-4">
            <div className="flex flex-wrap items-end gap-4">
              {/* Date Range */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">照会期間</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs border-border w-36"
                  />
                  <span className="text-xs text-muted-foreground">~</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 text-xs border-border w-36"
                  />
                </div>
              </div>

              {/* Report Type */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">帳票種別</label>
                <RadioGroup
                  value={reportType}
                  onValueChange={(v) => setReportType(v as "bs" | "pl")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="bs" id="bs" />
                    <Label htmlFor="bs" className="text-xs cursor-pointer">貸借対照表（B/S）</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="pl" id="pl" />
                    <Label htmlFor="pl" className="text-xs cursor-pointer">損益計算書（P/L）</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsQueried(true)}>
                  <Search className="w-3.5 h-3.5" /> 照会
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <FileDown className="w-3.5 h-3.5" /> PDF出力
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isQueried && (
          <>
            {/* Summary Cards */}
            {reportType === "bs" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="border-border bg-card">
                  <CardContent className="px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">자산 총계</div>
                    <div className="text-lg font-mono font-bold text-primary">¥{assetTotal.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">부채 총계</div>
                    <div className="text-lg font-mono font-bold text-destructive">¥{liabilityTotal.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">순자산 (자본)</div>
                    <div className="text-lg font-mono font-bold text-success flex items-center gap-1.5">
                      ¥{equityTotal.toLocaleString()}
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="border-border bg-card">
                  <CardContent className="px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">매출 총계</div>
                    <div className="text-lg font-mono font-bold text-primary">¥{revenueTotal.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">비용 총계</div>
                    <div className="text-lg font-mono font-bold text-destructive">¥{expenseTotal.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">당기순이익</div>
                    <div className={`text-lg font-mono font-bold flex items-center gap-1.5 ${netIncome >= 0 ? "text-success" : "text-destructive"}`}>
                      ¥{netIncome.toLocaleString()}
                      {netIncome >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Financial Table */}
            <Card className="border-border bg-card">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {reportType === "bs" ? "대차대조표 (貸借対照表)" : "손익계산서 (損益計算書)"}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-2 text-muted-foreground">
                    {startDate} ~ {endDate}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-20">코드</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">계정과목</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">금액 (JPY)</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right w-24">비율 (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportType === "bs" ? (
                      <>
                        {/* Assets Section */}
                        <TableRow className="border-border bg-primary/5 hover:bg-primary/10">
                          <TableCell colSpan={4} className="px-3 py-1.5 text-xs font-bold text-primary">
                            【자산의 부 (資産の部)】
                          </TableCell>
                        </TableRow>
                        {bsAssets.map(renderAccountRow)}
                        {renderSummaryRow("자산 합계", assetTotal, true)}

                        {/* Liabilities Section */}
                        <TableRow className="border-border bg-destructive/5 hover:bg-destructive/10">
                          <TableCell colSpan={4} className="px-3 py-1.5 text-xs font-bold text-destructive">
                            【부채의 부 (負債の部)】
                          </TableCell>
                        </TableRow>
                        {bsLiabilities.map(renderAccountRow)}
                        {renderSummaryRow("부채 합계", liabilityTotal)}

                        {/* Equity */}
                        <TableRow className="border-border bg-success/5 hover:bg-success/10">
                          <TableCell colSpan={4} className="px-3 py-1.5 text-xs font-bold text-success">
                            【순자산의 부 (純資産の部)】
                          </TableCell>
                        </TableRow>
                        {renderSummaryRow("순자산 합계 (자산 - 부채)", equityTotal, true)}
                      </>
                    ) : (
                      <>
                        {/* Revenue */}
                        <TableRow className="border-border bg-primary/5 hover:bg-primary/10">
                          <TableCell colSpan={4} className="px-3 py-1.5 text-xs font-bold text-primary">
                            【수익의 부 (収益の部)】
                          </TableCell>
                        </TableRow>
                        {plRevenue.map(renderAccountRow)}
                        {renderSummaryRow("수익 합계", revenueTotal, true)}

                        {/* Expenses */}
                        <TableRow className="border-border bg-destructive/5 hover:bg-destructive/10">
                          <TableCell colSpan={4} className="px-3 py-1.5 text-xs font-bold text-destructive">
                            【비용의 부 (費用の部)】
                          </TableCell>
                        </TableRow>
                        {plExpenses.map(renderAccountRow)}
                        {renderSummaryRow("비용 합계", expenseTotal)}

                        {/* Net Income */}
                        <TableRow className="border-border bg-success/5 hover:bg-success/10">
                          <TableCell colSpan={4} className="px-3 py-1.5 text-xs font-bold text-success">
                            【당기순이익 (当期純利益)】
                          </TableCell>
                        </TableRow>
                        {renderSummaryRow("당기순이익 (수익 - 비용)", netIncome, true)}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ERPLayout>
  );
};

export default FinancialStatements;
