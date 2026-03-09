import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getSlipStatusLabel, getSlipStatusStyle, SLIP_STATUS_CONFIG } from "@/lib/slip-utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, FileText, ChevronLeft, ChevronRight, ExternalLink, ListFilter,
} from "lucide-react";

// --- Status configuration (from slip-utils) ---

// --- Mock Data ---
interface SlipRecord {
  slipNo: string;
  slipType: "PROD" | "SHIP";
  typeName: string;
  date: string;
  requester: string;
  department: string;
  approver: string;
  handler: string;
  status: string;
  partner: string;
  totalAmount: number;
  itemCount: number;
}

const mockSlips: SlipRecord[] = [
  { slipNo: "SLP20240307-001", slipType: "PROD", typeName: "製造購買", date: "2024-03-07", requester: "田中 太郎", department: "製造1課", approver: "佐藤 花子", handler: "山田 優子", status: "P03", partner: "東京半導体(株)", totalAmount: 68750000, itemCount: 3 },
  { slipNo: "SLP20240305-003", slipType: "PROD", typeName: "製造購買", date: "2024-03-05", requester: "佐藤 花子", department: "品質管理課", approver: "鈴木 一郎", handler: "高橋 健太", status: "A01", partner: "大阪精密工業(株)", totalAmount: 12300000, itemCount: 2 },
  { slipNo: "SLP20240304-002", slipType: "PROD", typeName: "製造購買", date: "2024-03-04", requester: "鈴木 一郎", department: "製造2課", approver: "田中 太郎", handler: "山田 優子", status: "I00", partner: "名古屋電子(株)", totalAmount: 95200000, itemCount: 5 },
  { slipNo: "SLP20240301-001", slipType: "PROD", typeName: "製造購買", date: "2024-03-01", requester: "田中 太郎", department: "製造1課", approver: "-", handler: "-", status: "S00", partner: "-", totalAmount: 0, itemCount: 0 },
  { slipNo: "SLP20240228-005", slipType: "PROD", typeName: "製造購買", date: "2024-02-28", requester: "高橋 健太", department: "資材課", approver: "佐藤 花子", handler: "高橋 健太", status: "P04", partner: "東京半導体(株)", totalAmount: 23400000, itemCount: 4 },
  { slipNo: "SLP20240227-002", slipType: "PROD", typeName: "製造購買", date: "2024-02-27", requester: "佐藤 花子", department: "品質管理課", approver: "鈴木 一郎", handler: "-", status: "A02", partner: "九州ケミカル(株)", totalAmount: 8900000, itemCount: 1 },
  { slipNo: "SLP20240226-004", slipType: "PROD", typeName: "製造購買", date: "2024-02-26", requester: "鈴木 一郎", department: "製造2課", approver: "田中 太郎", handler: "山田 優子", status: "P02", partner: "大阪精密工業(株)", totalAmount: 41600000, itemCount: 3 },
  { slipNo: "SLP20240225-001", slipType: "PROD", typeName: "製造購買", date: "2024-02-25", requester: "田中 太郎", department: "製造1課", approver: "佐藤 花子", handler: "山田 優子", status: "I00", partner: "東京半導体(株)", totalAmount: 55000000, itemCount: 2 },
  { slipNo: "SHP20240310-001", slipType: "SHIP", typeName: "出庫", date: "2024-03-10", requester: "高橋 修平", department: "物流課", approver: "佐藤 花子", handler: "山田 優子", status: "T01", partner: "東京エレクトロン(株)", totalAmount: 245000000, itemCount: 3 },
  { slipNo: "SHP20240308-002", slipType: "SHIP", typeName: "出庫", date: "2024-03-08", requester: "高橋 修平", department: "物流課", approver: "鈴木 一郎", handler: "高橋 健太", status: "T03", partner: "SCREEN HD(株)", totalAmount: 156000000, itemCount: 2 },
  { slipNo: "SHP20240306-001", slipType: "SHIP", typeName: "出庫", date: "2024-03-06", requester: "山田 優子", department: "営業課", approver: "田中 太郎", handler: "高橋 修平", status: "T02", partner: "ディスコ(株)", totalAmount: 89500000, itemCount: 1 },
  { slipNo: "SHP20240303-003", slipType: "SHIP", typeName: "出庫", date: "2024-03-03", requester: "佐藤 花子", department: "品質管理課", approver: "鈴木 一郎", handler: "山田 優子", status: "T04", partner: "TSMC Japan", totalAmount: 12800000, itemCount: 2 },
  { slipNo: "SHP20240228-002", slipType: "SHIP", typeName: "出庫", date: "2024-02-28", requester: "高橋 修平", department: "物流課", approver: "佐藤 花子", handler: "高橋 健太", status: "T03", partner: "キヤノン(株)", totalAmount: 178200000, itemCount: 4 },
  { slipNo: "SHP20240225-001", slipType: "SHIP", typeName: "出庫", date: "2024-02-25", requester: "山田 優子", department: "営業課", approver: "田中 太郎", handler: "山田 優子", status: "A01", partner: "ニコン(株)", totalAmount: 67400000, itemCount: 2 },
  { slipNo: "SLP20240222-003", slipType: "PROD", typeName: "製造購買", date: "2024-02-22", requester: "山田 優子", department: "資材課", approver: "佐藤 花子", handler: "高橋 健太", status: "S01", partner: "東京半導体(株)", totalAmount: 15750000, itemCount: 2 },
  { slipNo: "SHP20240222-004", slipType: "SHIP", typeName: "出庫", date: "2024-02-22", requester: "高橋 健太", department: "物流課", approver: "鈴木 一郎", handler: "高橋 修平", status: "T02", partner: "アドバンテスト(株)", totalAmount: 34600000, itemCount: 1 },
  { slipNo: "SLP20240220-002", slipType: "PROD", typeName: "製造購買", date: "2024-02-20", requester: "高橋 健太", department: "資材課", approver: "田中 太郎", handler: "山田 優子", status: "P01", partner: "名古屋電子(株)", totalAmount: 33200000, itemCount: 3 },
  { slipNo: "SHP20240218-003", slipType: "SHIP", typeName: "出庫", date: "2024-02-18", requester: "山田 優子", department: "営業課", approver: "佐藤 花子", handler: "高橋 修平", status: "A02", partner: "東京エレクトロン(株)", totalAmount: 91300000, itemCount: 3 },
  { slipNo: "SLP20240218-001", slipType: "PROD", typeName: "製造購買", date: "2024-02-18", requester: "佐藤 花子", department: "品質管理課", approver: "鈴木 一郎", handler: "高橋 健太", status: "A01", partner: "大阪精密工業(株)", totalAmount: 27800000, itemCount: 2 },
  { slipNo: "SLP20240215-004", slipType: "PROD", typeName: "製造購買", date: "2024-02-15", requester: "鈴木 一郎", department: "製造2課", approver: "田中 太郎", handler: "山田 優子", status: "I00", partner: "東京半導体(株)", totalAmount: 62100000, itemCount: 4 },
];

const REQUESTER_OPTIONS = [...new Set(mockSlips.map(s => s.requester))];
const APPROVER_OPTIONS = [...new Set(mockSlips.map(s => s.approver).filter(a => a !== "-"))];
const HANDLER_OPTIONS = [...new Set(mockSlips.map(s => s.handler).filter(h => h !== "-"))];
const STATUS_OPTIONS = Object.entries(SLIP_STATUS_CONFIG).map(([code, config]) => ({ code, label: config.label }));

const SlipListPage = () => {
  const navigate = useNavigate();

  // Filter state
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requesterFilter, setRequesterFilter] = useState("all");
  const [approverFilter, setApproverFilter] = useState("all");
  const [handlerFilter, setHandlerFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [searchText, setSearchText] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Apply filters
  const filtered = mockSlips.filter((s) => {
    if (typeFilter !== "all" && s.slipType !== typeFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (requesterFilter !== "all" && s.requester !== requesterFilter) return false;
    if (approverFilter !== "all" && s.approver !== approverFilter) return false;
    if (handlerFilter !== "all" && s.handler !== handlerFilter) return false;
    if (dateFrom && s.date < format(dateFrom, "yyyy-MM-dd")) return false;
    if (dateTo && s.date > format(dateTo, "yyyy-MM-dd")) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!s.slipNo.toLowerCase().includes(q) && !s.partner.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setRequesterFilter("all");
    setApproverFilter("all");
    setHandlerFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearchText("");
    setCurrentPage(1);
  };

  const handleDetail = (slip: SlipRecord) => {
    if (slip.slipType === "PROD") {
      navigate("/production/execution");
    } else {
      navigate("/production/shipping");
    }
  };

  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-foreground">生産出庫伝票一覧</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            製造購買および出庫に関する全伝票を横断的に検索・照会します
          </p>
        </div>

        {/* Search Filters */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-primary" />
              検索条件
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Slip Type */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票区分</label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    <SelectItem value="PROD">製造購買</SelectItem>
                    <SelectItem value="SHIP">出庫</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票ステータス</label>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.code} value={s.code}>{s.label} ({s.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">依頼日（FROM）</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-8 w-full justify-start text-left text-xs font-normal border-border", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1.5 h-3 w-3" />
                      {dateFrom ? format(dateFrom, "yyyy/MM/dd") : "日付選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setCurrentPage(1); }} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">依頼日（TO）</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-8 w-full justify-start text-left text-xs font-normal border-border", !dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1.5 h-3 w-3" />
                      {dateTo ? format(dateTo, "yyyy/MM/dd") : "日付選択"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setCurrentPage(1); }} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Requester */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">依頼者</label>
                <Select value={requesterFilter} onValueChange={(v) => { setRequesterFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {REQUESTER_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Approver */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">承認者</label>
                <Select value={approverFilter} onValueChange={(v) => { setApproverFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {APPROVER_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Handler */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">購買/製造担当</label>
                <Select value={handlerFilter} onValueChange={(v) => { setHandlerFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 text-xs border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全件</SelectItem>
                    {HANDLER_OPTIONS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Text Search */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">伝票番号/取引先</label>
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 h-8">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <input
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                    placeholder="キーワード検索"
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground">
                <Search className="w-3 h-3" /> 照会
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={resetFilters}>
                条件リセット
              </Button>
              <span className="text-xs text-muted-foreground ml-auto">
                検索結果: <strong className="text-foreground">{filtered.length}</strong>件
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Slip List Table */}
        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              依頼伝票一覧
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground ml-1">{filtered.length}件</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 w-16">詳細</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">伝票番号</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">区分</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">依頼日</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">依頼者</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">部署</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">取引先</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">承認者</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3">担当者</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-center">ステータス</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">品目数</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground h-8 px-3 text-right">合計金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12 text-muted-foreground text-sm">
                        該当する伝票がありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((slip) => (
                      <TableRow key={slip.slipNo} className="border-border hover:bg-secondary/50">
                        <TableCell className="px-3 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2 gap-1"
                            onClick={() => handleDetail(slip)}
                          >
                            <ExternalLink className="w-3 h-3" />
                            詳細
                          </Button>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs font-mono text-primary font-medium">{slip.slipNo}</TableCell>
                        <TableCell className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                            slip.slipType === "PROD" ? "border-info/50 text-info" : "border-warning/50 text-warning"
                          }`}>
                            {slip.typeName}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground font-mono">{slip.date}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-foreground">{slip.requester}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground">{slip.department}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-foreground">{slip.partner}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground">{slip.approver}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground">{slip.handler}</TableCell>
                        <TableCell className="px-3 py-2 text-center">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getSlipStatusStyle(slip.status)}`}>
                            {getSlipStatusLabel(slip.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono text-muted-foreground">{slip.itemCount}</TableCell>
                        <TableCell className="px-3 py-2 text-xs text-right font-mono text-foreground">¥{slip.totalAmount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">表示件数</span>
              <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="h-7 w-20 text-xs border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5件</SelectItem>
                  <SelectItem value="10">10件</SelectItem>
                  <SelectItem value="15">15件</SelectItem>
                  <SelectItem value="20">20件</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {filtered.length}件中 {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filtered.length)}件
              </span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ERPLayout>
  );
};

export default SlipListPage;
