import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ERPLayout from "@/components/erp/ERPLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Cpu,
  Database,
  Factory,
  FileText,
  Layers,
  Package,
  Shield,
  TrendingUp,
  Workflow,
  BookOpen,
  Server,
  Code2,
  CloudCog,
  BarChart3,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusCodes = [
  { group: "Common", code: "S00", nameEn: "Draft", nameJp: "作成中", desc: "伝票起案の作成段階（初期状態）", role: "申請者" },
  { group: "Common", code: "S01", nameEn: "Pending", nameJp: "申請中", desc: "決裁要求処理完了（申請中）", role: "申請者" },
  { group: "Common", code: "A00", nameEn: "In-Review", nameJp: "承認中", desc: "決裁権者による審査進行中", role: "承認者" },
  { group: "Common", code: "A01", nameEn: "Approved", nameJp: "承認済", desc: "最終承認完了", role: "承認者" },
  { group: "Common", code: "A02", nameEn: "Rejected", nameJp: "否認中", desc: "決裁却下（伝票無効化）", role: "承認者" },
  { group: "Production", code: "P00", nameEn: "Returning", nameJp: "差戻中", desc: "申請者へ修正依頼", role: "製造・購買担当者" },
  { group: "Production", code: "P01", nameEn: "Quoted", nameJp: "見積中", desc: "見積確定および予定在庫確保", role: "製造・購買担当者" },
  { group: "Production", code: "P02", nameEn: "Ordered", nameJp: "発注済", desc: "発注確定 [借] 未着品 / [貸] 未払金", role: "製造・購買担当者" },
  { group: "Production", code: "P03", nameEn: "Partial", nameJp: "分納中", desc: "分納入庫進行（数量のみ記録）", role: "製造・購買担当者" },
  { group: "Production", code: "P04", nameEn: "Received", nameJp: "入庫済", desc: "最終入庫完了（買掛金確定）", role: "製造・購買担当者" },
  { group: "Inspection", code: "I00", nameEn: "Accepted", nameJp: "検収済", desc: "最終検収合格。実在庫反映", role: "検収担当者" },
  { group: "Logistics", code: "T01", nameEn: "Transit", nameJp: "積送中", desc: "製品出荷および配送開始", role: "製造・購買担当者" },
  { group: "Logistics", code: "T02", nameEn: "Delivered", nameJp: "出庫済", desc: "顧客引渡完了。実在庫差引", role: "製造・購買担当者" },
  { group: "Logistics", code: "T03", nameEn: "Invoiced", nameJp: "売上済", desc: "売上確定", role: "製造・購買担当者" },
  { group: "Logistics", code: "T04", nameEn: "Adjusted", nameJp: "在庫調整済", desc: "在庫減耗・増額調整", role: "製造・購買担当者" },
];

const accountCodes = [
  { category: "資産", name: "原材料", code: "1101", desc: "外部から購入した基礎部品および原材料" },
  { category: "資産", name: "半製品", code: "1102", desc: "組立中のモジュールや加工された中間部品" },
  { category: "資産", name: "完成品", code: "1103", desc: "最終検収が完了した販売用装置" },
  { category: "資産", name: "未着品", code: "1104", desc: "発注後まだ倉庫に到着していない輸送中資産" },
  { category: "資産", name: "積送品", code: "1105", desc: "顧客へ配送中だがまだ売上認識前の資産" },
  { category: "資産", name: "売掛金", code: "1106", desc: "製品販売後まだ回収していない債権" },
  { category: "負債", name: "買掛金", code: "2101", desc: "原材料入庫後まだ支払っていない債務" },
  { category: "負債", name: "未払金", code: "2102", desc: "一般経費や発注段階で発生する一時的債務" },
  { category: "収益", name: "売上高", code: "4101", desc: "装置販売およびサービス提供収益" },
  { category: "費用", name: "売上原価", code: "5101", desc: "販売された製品の製造原価" },
  { category: "費用", name: "棚卸減耗損", code: "5102", desc: "検収不合格や破損による在庫損失" },
];

const techStack = [
  { icon: Code2, label: "Frontend", value: "TypeScript, React, React Query" },
  { icon: Server, label: "Backend", value: "C# (.NET Core), Entity Framework Core" },
  { icon: Database, label: "Database", value: "PostgreSQL (Read Committed)" },
  { icon: CloudCog, label: "Infrastructure", value: "Azure Cloud Services" },
];

interface TableColumn {
  name: string;
  type: string;
  constraint: string;
  desc: string;
}

const tableSchemas: Record<string, TableColumn[]> = {
  tran_history: [
    { name: "slip_no", type: "VARCHAR(20)", constraint: "PK", desc: "伝票番号（例：SLP20240307-001）" },
    { name: "slip_date", type: "DATE", constraint: "NOT NULL", desc: "伝票作成日" },
    { name: "request_emp_id", type: "INTEGER", constraint: "FK", desc: "起案者ID（Employees参照）" },
    { name: "status_code", type: "VARCHAR(10)", constraint: "FK", desc: "現在の伝票状態（Common_Codes参照）" },
    { name: "slip_type", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "伝票区分（PRODUCTION：生産/購買、SHIPMENT：出庫）" },
    { name: "from_loc_id", type: "INTEGER", constraint: "-", desc: "出発地拠点ID" },
    { name: "to_loc_id", type: "INTEGER", constraint: "-", desc: "到着地拠点ID" },
    { name: "total_amount", type: "NUMERIC(18,2)", constraint: "-", desc: "伝票合計金額" },
    { name: "remarks", type: "TEXT", constraint: "-", desc: "備考（特記事項）" },
    { name: "is_printed1", type: "INTEGER", constraint: "DEFAULT 0", desc: "書類出力状況 0(請求書未出力) 1(請求書出力済)" },
    { name: "is_printed2", type: "INTEGER", constraint: "DEFAULT 2", desc: "書類出力状況 2(発注書未出力) 3(発注書出力済)" },
    { name: "partner_id", type: "INTEGER", constraint: "FK", desc: "取引先ID（取引先マスタ参照）" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "起案者ID（Employees参照）" },
    { name: "uodate_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  tran_detail_history: [
    { name: "detail_id", type: "SERIAL", constraint: "PK", desc: "明細行固有番号" },
    { name: "slip_no", type: "VARCHAR(20)", constraint: "FK", desc: "親伝票番号（Headers参照）" },
    { name: "item_id", type: "INTEGER", constraint: "NOT NULL", desc: "品目ID" },
    { name: "order_qty", type: "NUMERIC(12,2)", constraint: "-", desc: "発注（申請）数量" },
    { name: "inbound_qty", type: "NUMERIC(12,2)", constraint: "-", desc: "実入庫数量" },
    { name: "unit_price", type: "NUMERIC(18,2)", constraint: "-", desc: "単価" },
    { name: "supply_amount", type: "NUMERIC(18,2)", constraint: "-", desc: "供給価額（数量×単価）" },
    { name: "lot_no", type: "VARCHAR(30)", constraint: "-", desc: "半導体部品LOT番号" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "起案者ID（Employees参照）" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  stock_spec_history: [
    { name: "receiving_id", type: "SERIAL", constraint: "PK", desc: "入庫明細固有番号" },
    { name: "slip_no", type: "VARCHAR(20)", constraint: "FK (slip_headers)", desc: "元伝票番号" },
    { name: "detail_id", type: "INTEGER", constraint: "FK (slip_details)", desc: "伝票明細行参照" },
    { name: "receive_date", type: "DATE", constraint: "NOT NULL", desc: "実入庫日" },
    { name: "receive_qty", type: "NUMERIC(12,2)", constraint: "NOT NULL", desc: "今回入庫数量" },
    { name: "receive_amount", type: "NUMERIC(18,2)", constraint: "-", desc: "今回入庫金額（数量×単価）" },
    { name: "lot_no", type: "VARCHAR(30)", constraint: "-", desc: "入庫LOT番号（バッチ別追跡用）" },
    { name: "loc_id", type: "INTEGER", constraint: "FK (locations)", desc: "入庫拠点ID" },
    { name: "inspect_note", type: "VARCHAR(255)", constraint: "-", desc: "入庫時特記事項（外観損傷等）" },
    { name: "proc_emp_id", type: "INTEGER", constraint: "FK (employees)", desc: "入庫処理者ID" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "起案者ID（Employees参照）" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  workflow: [
    { name: "wf_id", type: "SERIAL", constraint: "PK", desc: "ワークフロー記録ID" },
    { name: "slip_no", type: "VARCHAR(20)", constraint: "FK", desc: "対象伝票番号" },
    { name: "proc_emp_id", type: "INTEGER", constraint: "FK", desc: "処理者ID（Employees参照）" },
    { name: "proc_status", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "処理状態（承認、差戻、否認等）" },
    { name: "proc_comment", type: "TEXT", constraint: "-", desc: "差戻理由または承認意見" },
    { name: "proc_at", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "処理日時" },
    { name: "step_no", type: "INTEGER", constraint: "-", desc: "決裁順序（1次、2次等）" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  bom_spec: [
    { name: "bom_id", type: "SERIAL", constraint: "PK", desc: "BOM行固有番号" },
    { name: "parent_item_id", type: "INTEGER", constraint: "FK (items)", desc: "産出品目（半製品/完成品）" },
    { name: "child_item_id", type: "INTEGER", constraint: "FK (items)", desc: "投入品目（原材料/半製品）" },
    { name: "required_qty", type: "NUMERIC(12,4)", constraint: "NOT NULL", desc: "1単位生産時の必要数量" },
    { name: "loss_rate", type: "NUMERIC(5,2)", constraint: "DEFAULT 0", desc: "ロス率（%）" },
    { name: "sort_order", type: "INTEGER", constraint: "-", desc: "投入順序（工程順序）" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "使用可否" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  account_entry: [
    { name: "journal_id", type: "SERIAL", constraint: "PK", desc: "仕訳固有番号" },
    { name: "slip_no", type: "VARCHAR(20)", constraint: "FK", desc: "元受払伝票番号" },
    { name: "shiwake_code", type: "VARCHAR(1)", constraint: "NOT NULL", desc: "借方(0) 貸方(1) その他(9)" },
    { name: "account_code", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "勘定科目コード" },
    { name: "amount", type: "NUMERIC(18,2)", constraint: "DEFAULT 0", desc: "金額" },
    { name: "entry_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "仕訳発生日時" },
    { name: "description", type: "VARCHAR(255)", constraint: "-", desc: "摘要（内容要約）" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  item_mst: [
    { name: "item_id", type: "SERIAL", constraint: "PK", desc: "品目固有番号" },
    { name: "item_code", type: "VARCHAR(20)", constraint: "UNIQUE", desc: "品目コード（例：SEMI-CHAMBER-01）" },
    { name: "item_name", type: "VARCHAR(100)", constraint: "NOT NULL", desc: "品目名称" },
    { name: "item_type", type: "VARCHAR(10)", constraint: "-", desc: "分類（RAW, SEMI, FIN）" },
    { name: "spec", type: "VARCHAR(100)", constraint: "-", desc: "詳細規格・仕様" },
    { name: "unit", type: "VARCHAR(10)", constraint: "-", desc: "管理単位（EA, SET, KG）" },
    { name: "std_price", type: "NUMERIC(18,2)", constraint: "-", desc: "標準単価（原価計算用）" },
    { name: "plan_qty", type: "NUMERIC(12,2)", constraint: "DEFAULT 0", desc: "予定在庫（見積～入庫前段階）" },
    { name: "stock_qty", type: "NUMERIC(12,2)", constraint: "DEFAULT 0", desc: "実在庫（検収完了済の実数量）" },
    { name: "acct_code", type: "VARCHAR(10)", constraint: "-", desc: "基本勘定コード（1101：原材料等）" },
    { name: "safety_stock", type: "NUMERIC(12,2)", constraint: "DEFAULT 0", desc: "安全在庫量（発注点管理用）" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "使用可否（廃番品目処理）" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  warehouse_mst: [
    { name: "loc_id", type: "SERIAL", constraint: "PK", desc: "拠点固有番号" },
    { name: "loc_name", type: "VARCHAR(50)", constraint: "NOT NULL", desc: "拠点名称（例：本社倉庫、渋谷店舗）" },
    { name: "loc_type", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "拠点類型（FACTORY, STORE, TRANSIT, VENDOR）" },
    { name: "postal_code", type: "VARCHAR(10)", constraint: "-", desc: "郵便番号（日本7桁〒対応）" },
    { name: "address", type: "VARCHAR(255)", constraint: "-", desc: "住所情報" },
    { name: "contact_info", type: "VARCHAR(50)", constraint: "-", desc: "担当者連絡先（電話番号等）" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "使用可否（無効時は選択不可）" },
    { name: "remarks", type: "TEXT", constraint: "-", desc: "備考（拠点特記事項記録）" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  customer_mst: [
    { name: "partner_id", type: "SERIAL", constraint: "PK", desc: "取引先固有番号" },
    { name: "partner_code", type: "VARCHAR(20)", constraint: "UNIQUE", desc: "取引先コード" },
    { name: "partner_name", type: "VARCHAR(100)", constraint: "NOT NULL", desc: "取引先名称" },
    { name: "partner_type", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "区分（SUPPLIER：仕入先、CUSTOMER：得意先、BOTH：兼用）" },
    { name: "postal_code", type: "VARCHAR(10)", constraint: "-", desc: "郵便番号" },
    { name: "address", type: "VARCHAR(255)", constraint: "-", desc: "住所" },
    { name: "contact_name", type: "VARCHAR(50)", constraint: "-", desc: "担当者氏名" },
    { name: "contact_tel", type: "VARCHAR(20)", constraint: "-", desc: "連絡先" },
    { name: "bank_info", type: "VARCHAR(255)", constraint: "-", desc: "銀行口座情報（請求書出力用）" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "使用可否" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  emp_mst: [
    { name: "emp_id", type: "SERIAL", constraint: "PK", desc: "社員固有番号" },
    { name: "login_id", type: "VARCHAR(20)", constraint: "UNIQUE", desc: "ログインID" },
    { name: "password", type: "VARCHAR(255)", constraint: "NOT NULL", desc: "暗号化パスワード" },
    { name: "emp_name", type: "VARCHAR(50)", constraint: "NOT NULL", desc: "氏名" },
    { name: "dept_code", type: "VARCHAR(10)", constraint: "-", desc: "部署コード" },
    { name: "role_type", type: "VARCHAR(10)", constraint: "-", desc: "権限（APPROVER, PROD, INSP）" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "在職可否" },
    { name: "email", type: "VARCHAR(100)", constraint: "-", desc: "メールアドレス（通知受信用）" },
    { name: "remarks", type: "TEXT", constraint: "-", desc: "備考（特記事項記録）" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
  general_mst: [
    { name: "code_id", type: "VARCHAR(10)", constraint: "PK", desc: "コードID（例：S00）" },
    { name: "group_code", type: "VARCHAR(20)", constraint: "NOT NULL", desc: "グループ分類" },
    { name: "code_name", type: "VARCHAR(50)", constraint: "-", desc: "名称" },
    { name: "sort_order", type: "INTEGER", constraint: "-", desc: "表示順序" },
    { name: "is_use", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "使用可否" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "登録日時" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "更新日時（初回登録時は登録日時）" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "ログインユーザー" },
  ],
};

const tableList = [
  { name: "tran_history", desc: "受払履歴（伝票基本情報）" },
  { name: "tran_detail_history", desc: "受払明細（伝票内明細品目）" },
  { name: "stock_spec_history", desc: "入庫明細（分納入庫履歴）" },
  { name: "workflow", desc: "ワークフロー（伝票別承認）" },
  { name: "bom_spec", desc: "BOM（部品構成表）" },
  { name: "account_entry", desc: "会計仕訳" },
  { name: "item_mst", desc: "品目マスタ" },
  { name: "warehouse_mst", desc: "倉庫拠点マスタ" },
  { name: "customer_mst", desc: "取引先マスタ" },
  { name: "emp_mst", desc: "社員マスタ" },
  { name: "general_mst", desc: "汎用マスタ" },
];

const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h2 className="text-lg font-semibold text-foreground">{children}</h2>
  </div>
);

const CompanyIntro = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [navigateTarget, setNavigateTarget] = useState<{ title: string; path: string } | null>(null);

  return (
    <ERPLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-border p-8">
          <div className="absolute top-4 right-4 opacity-10">
            <Cpu className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <Badge variant="outline" className="mb-3 text-[10px] tracking-widest uppercase border-primary/30 text-primary">
              Enterprise Resource Planning
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              S-PRIME ERP
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              <strong>S</strong>emiconductor <strong>P</strong>recision <strong>R</strong>esource & <strong>I</strong>nventory <strong>M</strong>anagement <strong>E</strong>RP
            </p>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              半導体精密部品および装置製造業の特性を反映し、<strong className="text-foreground">原材料調達からBOM基盤の生産、最終製品出庫に至る全工程を統合管理</strong>するシステムです。
              伝票ベースの承認プロセスによる業務統制、リアルタイム受払追跡、ビジネストランザクションと会計仕訳の自動連動によるデータ整合性確保を目標としています。
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={Layers}>技術スタック</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {techStack.map((t) => (
                <div key={t.label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <t.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Core Features */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={TrendingUp}>主要機能要件</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                icon: Factory,
                title: "購買および製造実行",
                items: [
                  "BOM基盤自動展開 — 完成品生産時に下位部品を自動抽出、過不足の可視化",
                  "分納対応（Partial Delivery） — 分納時に履歴累積、最終入庫時に買掛金確定仕訳",
                ],
              },
              {
                icon: Package,
                title: "物流および出庫管理",
                items: [
                  "積送在庫（In-Transit）管理 — 「積送品」勘定の個別管理により資産整合性を維持",
                  "FIFO基盤LOT追跡 — 半導体部品の先入先出LOT指定出庫",
                ],
              },
              {
                icon: BarChart3,
                title: "会計連動およびレポーティング",
                items: [
                  "自動仕訳エンジン — 伝票ステータス変更トリガーに基づく仕訳自動生成",
                  "財務諸表エクスポート — B/S、P/L 日本標準様式およびPDF出力",
                ],
              },
            ].map((section) => (
              <div key={section.title} className="p-4 rounded-lg border border-border/50 bg-secondary/30">
                <div className="flex items-center gap-2 mb-2">
                  <section.icon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                </div>
                <ul className="space-y-1.5 ml-6">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground list-disc leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Business Workflow */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={Workflow}>ビジネスワークフロー</SectionTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["step1","step2","step3","step4"]} className="w-full">
              <AccordionItem value="step1">
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">1</Badge>
                    申請および承認
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pl-8">
                  <p>• <strong className="text-foreground">申請：</strong> ログインユーザーが伝票作成（申請中）</p>
                  <p>• <strong className="text-foreground">承認：</strong> 指定された承認権限者が全員承認して次のステップへ進行</p>
                  <p>• <strong className="text-foreground">否認：</strong> 承認者のうち一人でも却下した場合、伝票終了</p>
                  <p>• <strong className="text-foreground">差戻：</strong> 承認完了後、発注前に製造担当者が修正依頼</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="step2">
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">2</Badge>
                    製造・購買実行
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pl-8">
                  <p>• <strong className="text-foreground">見積：</strong> 予定在庫増加（入庫予定数量確保）</p>
                  <p>• <strong className="text-foreground">発注：</strong> [借方] 未着品 / [貸方] 未払金</p>
                  <p>• <strong className="text-foreground">分納：</strong> ワークフロー履歴に記録累積</p>
                  <p>• <strong className="text-foreground">入庫：</strong> （累計 == 発注量）の場合 [借] 原材料 / [貸] 買掛金 確定</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="step3">
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">3</Badge>
                    検収および受払完了
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pl-8">
                  <p>• <strong className="text-foreground">検収：</strong> 予定在庫差引、実在庫の増減反映</p>
                  <p>• 受払履歴テーブルに最終「入庫完了」トランザクション記録</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="step4">
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">4</Badge>
                    財務諸表反映および書類出力
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pl-8">
                  <p>検収終了後、財務諸表に反映および各種書類（請求書、発注書）の出力が可能</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Status Codes */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={Shield}>伝票ステータスコード定義</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-[11px] font-semibold w-20">区分</TableHead>
                    <TableHead className="text-[11px] font-semibold w-16">コード</TableHead>
                    <TableHead className="text-[11px] font-semibold w-24">ステータス (EN)</TableHead>
                    <TableHead className="text-[11px] font-semibold w-20">ステータス (JP)</TableHead>
                    <TableHead className="text-[11px] font-semibold">ビジネス定義</TableHead>
                    <TableHead className="text-[11px] font-semibold w-32">担当者</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusCodes.map((s) => (
                    <TableRow key={s.code}>
                      <TableCell className="text-[11px]">
                        <Badge variant="outline" className="text-[9px] font-mono">{s.group}</Badge>
                      </TableCell>
                      <TableCell className="text-[11px] font-mono font-semibold text-primary">{s.code}</TableCell>
                      <TableCell className="text-[11px]">{s.nameEn}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{s.nameJp}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{s.desc}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{s.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Account Codes */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={FileText}>会計勘定科目</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-[11px] font-semibold w-16">区分</TableHead>
                    <TableHead className="text-[11px] font-semibold w-40">勘定科目</TableHead>
                    <TableHead className="text-[11px] font-semibold w-16">コード</TableHead>
                    <TableHead className="text-[11px] font-semibold">説明</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountCodes.map((a) => (
                    <TableRow key={a.code}>
                      <TableCell className="text-[11px]">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            a.category === "資産" ? "border-primary/30 text-primary" :
                            a.category === "負債" ? "border-destructive/30 text-destructive" :
                            a.category === "収益" ? "border-success/30 text-success" :
                            "border-warning/30 text-warning"
                          }`}
                        >
                          {a.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[11px] font-medium">{a.name}</TableCell>
                      <TableCell className="text-[11px] font-mono text-primary">{a.code}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{a.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* DB Architecture */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={Database}>データベース設計</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg border border-border/50 bg-secondary/30">
              <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                トランザクション整合性
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                検収終了（I00）および売上確定（T03）時、複数テーブル（数量、履歴、仕訳）の更新を単一トランザクションで包括し、原子性（Atomicity）を保証
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-secondary/30">
              <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                Concurrency Control
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                在庫差引時に悲観的ロック（Pessimistic Lock）およびitem_idソート順によるロック取得でデッドロック防止とデータ精度を確保
              </p>
            </div>

            {/* Table list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {tableList.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t.name)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/30 hover:bg-primary/10 hover:border-primary/30 transition-colors text-left cursor-pointer"
                >
                  <Database className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-[11px] font-mono text-primary">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground">— {t.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Screen Definitions */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={BookOpen}>画面定義</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "8.1", title: "製品生産および実行", desc: "生産起案～最終検収までの全ライフサイクル管理", path: "/production/execution" },
                { id: "8.2", title: "出庫および在庫調整", desc: "出庫申請～売上確定/在庫調整のライフサイクル管理", path: "/production/shipping" },
                { id: "8.3", title: "財務諸表照会", desc: "B/S、P/L照会およびPDF出力", path: "/documents/finance" },
                { id: "8.4", title: "BOM生産伝票", desc: "BOM基盤の生産伝票照会および出力", path: "/documents/bom" },
                { id: "8.5", title: "請求書・発注書", desc: "発注書（PO）、請求書（Invoice）照会およびPDF出力", path: "/documents/invoice" },
                { id: "8.6", title: "社員マスタ", desc: "社員登録・修正および権限管理", path: "/master/employee" },
                { id: "8.7", title: "品目マスタ", desc: "原材料/半製品/完成品の登録・修正", path: "/master/item" },
                { id: "8.8", title: "倉庫拠点マスタ", desc: "倉庫、拠点の登録・修正", path: "/master/warehouse" },
              ].map((screen) => (
                <div
                  key={screen.id}
                  onClick={() => setNavigateTarget({ title: screen.title, path: screen.path })}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <Badge variant="outline" className="text-[10px] font-mono mt-0.5 flex-shrink-0">{screen.id}</Badge>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{screen.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{screen.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-[11px] text-muted-foreground">
            © 2024 S-Prime Corp. — 半導体精密機器製造および統合在庫管理システム
          </p>
        </div>
      </div>

      {/* Table Schema Modal */}
      <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              {selectedTable}
              <Badge variant="outline" className="text-[9px] ml-1">
                {tableList.find((t) => t.name === selectedTable)?.desc}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedTable && tableSchemas[selectedTable] && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-[10px] font-semibold">カラム名</TableHead>
                    <TableHead className="text-[10px] font-semibold">データ型</TableHead>
                    <TableHead className="text-[10px] font-semibold">制約</TableHead>
                    <TableHead className="text-[10px] font-semibold">説明</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableSchemas[selectedTable].map((col) => (
                    <TableRow key={col.name}>
                      <TableCell className="text-[11px] font-mono text-primary font-medium">{col.name}</TableCell>
                      <TableCell className="text-[11px] font-mono text-muted-foreground">{col.type}</TableCell>
                      <TableCell className="text-[11px]">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            col.constraint === "PK" ? "border-primary/40 text-primary" :
                            col.constraint.startsWith("FK") ? "border-warning/40 text-warning" :
                            col.constraint === "NOT NULL" ? "border-destructive/40 text-destructive" :
                            "text-muted-foreground"
                          }`}
                        >
                          {col.constraint}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{col.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Navigate Confirm Dialog */}
      <Dialog open={!!navigateTarget} onOpenChange={(open) => !open && setNavigateTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">該当画面に遷移しますか？</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">{navigateTarget?.title}</strong> 画面に遷移します。
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setNavigateTarget(null)}>キャンセル</Button>
            <Button size="sm" onClick={() => { if (navigateTarget) navigate(navigateTarget.path); setNavigateTarget(null); }}>遷移</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ERPLayout>
  );
};

export default CompanyIntro;
