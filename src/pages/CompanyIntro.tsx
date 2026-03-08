import { useState } from "react";
import ERPLayout from "@/components/erp/ERPLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  { group: "Common", code: "S00", nameEn: "Draft", nameJp: "作成中", desc: "전표 기안 작성 단계 (초기 상태)", role: "신청자" },
  { group: "Common", code: "S01", nameEn: "Pending", nameJp: "申請中", desc: "결재 요청 처리 완료 (신청 중)", role: "신청자" },
  { group: "Common", code: "A00", nameEn: "In-Review", nameJp: "承認中", desc: "결재권자 검토 진행 중", role: "승인자" },
  { group: "Common", code: "A01", nameEn: "Approved", nameJp: "承認済", desc: "최종 승인 완료", role: "승인자" },
  { group: "Common", code: "A02", nameEn: "Rejected", nameJp: "否認中", desc: "결재 거부 (전표 무효화)", role: "승인자" },
  { group: "Production", code: "P00", nameEn: "Returning", nameJp: "差戻中", desc: "신청자에게 수정 요청", role: "제조 및 구매 담당자" },
  { group: "Production", code: "P01", nameEn: "Quoted", nameJp: "見積中", desc: "견적 확정 및 예상 재고 확보", role: "제조 및 구매 담당자" },
  { group: "Production", code: "P02", nameEn: "Ordered", nameJp: "発注済", desc: "발주 확정 [차] 미착품 / [대] 미지급금", role: "제조 및 구매 담당자" },
  { group: "Production", code: "P03", nameEn: "Partial", nameJp: "分納中", desc: "분납 입고 진행 (수량만 기록)", role: "제조 및 구매 담당자" },
  { group: "Production", code: "P04", nameEn: "Received", nameJp: "入庫済", desc: "최종 입고 완료 (매입채무 확정)", role: "제조 및 구매 담당자" },
  { group: "Inspection", code: "I00", nameEn: "Accepted", nameJp: "検収済", desc: "최종 검수 합격. 실재고 반영", role: "검수 담당자" },
  { group: "Logistics", code: "T01", nameEn: "Transit", nameJp: "積送中", desc: "제품 출하 및 배송 시작", role: "제조 및 구매 담당자" },
  { group: "Logistics", code: "T02", nameEn: "Delivered", nameJp: "出庫済", desc: "고객사 인도 완료. 실재고 차감", role: "제조 및 구매 담당자" },
  { group: "Logistics", code: "T03", nameEn: "Invoiced", nameJp: "売上済", desc: "매출 확정", role: "제조 및 구매 담당자" },
  { group: "Logistics", code: "T04", nameEn: "Adjusted", nameJp: "在庫調整済", desc: "재고 감모/증액 조정", role: "제조 및 구매 담당자" },
];

const accountCodes = [
  { category: "자산", name: "원재료 (原材料)", code: "1101", desc: "외부에서 구매한 기초 부품 및 원재료" },
  { category: "자산", name: "반제품 (半製品)", code: "1102", desc: "조립 중인 모듈이나 가공된 중간 부품" },
  { category: "자산", name: "완제품 (完成品)", code: "1103", desc: "최종 검수가 끝난 판매용 장비" },
  { category: "자산", name: "미착품 (未着品)", code: "1104", desc: "발주 후 아직 창고에 도착하지 않은 운송 중 자산" },
  { category: "자산", name: "적송품 (積送品)", code: "1105", desc: "고객사로 배송 중이나 아직 매출 인식 전인 자산" },
  { category: "자산", name: "매출채권 (売掛金)", code: "1106", desc: "제품 판매 후 아직 받지 못한 돈" },
  { category: "부채", name: "매입채무 (買掛金)", code: "2101", desc: "원재료 입고 후 아직 지급하지 않은 돈" },
  { category: "부채", name: "미지급금 (未払金)", code: "2102", desc: "일반 경비나 발주 단계에서 발생하는 일시적 채무" },
  { category: "수익", name: "매출 (売上)", code: "4101", desc: "장비 판매 및 서비스 제공 수익" },
  { category: "비용", name: "매출원가 (売上原価)", code: "5101", desc: "판매된 제품의 제조 원가" },
  { category: "비용", name: "재고감모손실 (棚卸減耗損)", code: "5102", desc: "검수 불합격이나 파손으로 인한 재고 손실" },
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
    { name: "slip_no", type: "VARCHAR(20)", constraint: "PK", desc: "전표 번호 (예: SLP20240307-001)" },
    { name: "slip_date", type: "DATE", constraint: "NOT NULL", desc: "전표 작성일" },
    { name: "request_emp_id", type: "INTEGER", constraint: "FK", desc: "기안자 ID (Employees 참조)" },
    { name: "status_code", type: "VARCHAR(10)", constraint: "FK", desc: "현재 전표 상태 (Common_Codes 참조)" },
    { name: "slip_type", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "전표 구분 (PRODUCTION: 생산/구매, SHIPMENT: 출고)" },
    { name: "from_loc_id", type: "INTEGER", constraint: "-", desc: "출발지 거점 ID" },
    { name: "to_loc_id", type: "INTEGER", constraint: "-", desc: "도착지 거점 ID" },
    { name: "total_amount", type: "NUMERIC(18,2)", constraint: "-", desc: "전표 총 합계 금액" },
    { name: "remarks", type: "TEXT", constraint: "-", desc: "비고(특이사항)" },
    { name: "is_printed1", type: "INTEGER", constraint: "DEFAULT 0", desc: "서류 출력 여부 0(청구서미출력) 1(청구서출력)" },
    { name: "is_printed2", type: "INTEGER", constraint: "DEFAULT 2", desc: "서류 출력 여부 2(발주서미출력) 3(발주서출력)" },
    { name: "partner_id", type: "INTEGER", constraint: "FK", desc: "거래처 ID (거래처 마스터 참조)" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "기안자 ID (Employees 참조)" },
    { name: "uodate_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  tran_detail_history: [
    { name: "detail_id", type: "SERIAL", constraint: "PK", desc: "상세 행 고유 번호" },
    { name: "slip_no", type: "VARCHAR(20)", constraint: "FK", desc: "부모 전표 번호 (Headers 참조)" },
    { name: "item_id", type: "INTEGER", constraint: "NOT NULL", desc: "품목 ID" },
    { name: "order_qty", type: "NUMERIC(12,2)", constraint: "-", desc: "발주(신청) 수량" },
    { name: "inbound_qty", type: "NUMERIC(12,2)", constraint: "-", desc: "실제 입고 수량" },
    { name: "unit_price", type: "NUMERIC(18,2)", constraint: "-", desc: "단가" },
    { name: "supply_amount", type: "NUMERIC(18,2)", constraint: "-", desc: "공급가액 (수량 * 단가)" },
    { name: "lot_no", type: "VARCHAR(30)", constraint: "-", desc: "반도체 부품 LOT 번호" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "기안자 ID (Employees 참조)" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  stock_spec_history: [
    { name: "receiving_id", type: "SERIAL", constraint: "PK", desc: "입고 명세 고유 번호" },
    { name: "slip_no", type: "VARCHAR(20)", constraint: "FK (slip_headers)", desc: "원천 전표 번호" },
    { name: "detail_id", type: "INTEGER", constraint: "FK (slip_details)", desc: "전표 상세 행 참조" },
    { name: "receive_date", type: "DATE", constraint: "NOT NULL", desc: "실제 입고 일자" },
    { name: "receive_qty", type: "NUMERIC(12,2)", constraint: "NOT NULL", desc: "이번 입고 수량" },
    { name: "receive_amount", type: "NUMERIC(18,2)", constraint: "-", desc: "이번 입고 금액 (수량 × 단가)" },
    { name: "lot_no", type: "VARCHAR(30)", constraint: "-", desc: "입고 LOT 번호 (배치별 추적용)" },
    { name: "loc_id", type: "INTEGER", constraint: "FK (locations)", desc: "입고 거점 ID" },
    { name: "inspect_note", type: "VARCHAR(255)", constraint: "-", desc: "입고 시 특이사항 (외관 손상 등)" },
    { name: "proc_emp_id", type: "INTEGER", constraint: "FK (employees)", desc: "입고 처리자 ID" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "기안자 ID (Employees 참조)" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  workflow: [
    { name: "wf_id", type: "SERIAL", constraint: "PK", desc: "워크플로우 기록 ID" },
    { name: "slip_no", type: "VARCHAR(20)", constraint: "FK", desc: "대상 전표 번호" },
    { name: "proc_emp_id", type: "INTEGER", constraint: "FK", desc: "처리자 ID (Employees 참조)" },
    { name: "proc_status", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "처리 상태 (승인, 반려, 부인 등)" },
    { name: "proc_comment", type: "TEXT", constraint: "-", desc: "반려 사유 혹은 승인 의견" },
    { name: "proc_at", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "처리 일시" },
    { name: "step_no", type: "INTEGER", constraint: "-", desc: "결재 순서 (1차, 2차 등)" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  bom_spec: [
    { name: "bom_id", type: "SERIAL", constraint: "PK", desc: "BOM 행 고유 번호" },
    { name: "parent_item_id", type: "INTEGER", constraint: "FK (items)", desc: "산출 품목 (반제품/완제품)" },
    { name: "child_item_id", type: "INTEGER", constraint: "FK (items)", desc: "투입 품목 (원재료/반제품)" },
    { name: "required_qty", type: "NUMERIC(12,4)", constraint: "NOT NULL", desc: "1단위 생산 시 필요 수량" },
    { name: "loss_rate", type: "NUMERIC(5,2)", constraint: "DEFAULT 0", desc: "로스율 (%)" },
    { name: "sort_order", type: "INTEGER", constraint: "-", desc: "투입 순서 (공정 순서)" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "사용 여부" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  account_entry: [
    { name: "journal_id", type: "SERIAL", constraint: "PK", desc: "분개 고유 번호" },
    { name: "slip_no", type: "VARCHAR(20)", constraint: "FK", desc: "원천 수불 전표 번호" },
    { name: "shiwake_code", type: "VARCHAR(1)", constraint: "NOT NULL", desc: "차변(0) 대변(1) 기타(9)" },
    { name: "account_code", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "계정과목 코드" },
    { name: "amount", type: "NUMERIC(18,2)", constraint: "DEFAULT 0", desc: "금액" },
    { name: "entry_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "분개 발생 일시" },
    { name: "description", type: "VARCHAR(255)", constraint: "-", desc: "적요 (내용 요약)" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  item_mst: [
    { name: "item_id", type: "SERIAL", constraint: "PK", desc: "품목 고유 번호" },
    { name: "item_code", type: "VARCHAR(20)", constraint: "UNIQUE", desc: "품목 코드 (예: SEMI-CHAMBER-01)" },
    { name: "item_name", type: "VARCHAR(100)", constraint: "NOT NULL", desc: "품목 명칭" },
    { name: "item_type", type: "VARCHAR(10)", constraint: "-", desc: "분류 (RAW, SEMI, FIN)" },
    { name: "spec", type: "VARCHAR(100)", constraint: "-", desc: "상세 규격/사양" },
    { name: "unit", type: "VARCHAR(10)", constraint: "-", desc: "관리 단위 (EA, SET, KG)" },
    { name: "std_price", type: "NUMERIC(18,2)", constraint: "-", desc: "표준 단가 (원가 계산용)" },
    { name: "plan_qty", type: "NUMERIC(12,2)", constraint: "DEFAULT 0", desc: "예상재고 (견적~입고 전 단계)" },
    { name: "stock_qty", type: "NUMERIC(12,2)", constraint: "DEFAULT 0", desc: "실재고 (검수 완료된 실제 수량)" },
    { name: "acct_code", type: "VARCHAR(10)", constraint: "-", desc: "기본 계정코드 (1101:원재료 등)" },
    { name: "safety_stock", type: "NUMERIC(12,2)", constraint: "DEFAULT 0", desc: "안전 재고량 (발주점 관리용)" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "사용 여부 (단종 품목 처리)" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  warehouse_mst: [
    { name: "loc_id", type: "SERIAL", constraint: "PK", desc: "거점 고유 번호" },
    { name: "loc_name", type: "VARCHAR(50)", constraint: "NOT NULL", desc: "거점 명칭 (예: 본사 창고, 시부야 매장)" },
    { name: "loc_type", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "거점 유형 (FACTORY, STORE, TRANSIT, VENDOR)" },
    { name: "postal_code", type: "VARCHAR(10)", constraint: "-", desc: "우편번호 (일본 7자리 〒 대응)" },
    { name: "address", type: "VARCHAR(255)", constraint: "-", desc: "주소 정보" },
    { name: "contact_info", type: "VARCHAR(50)", constraint: "-", desc: "담당자 연락처 (전화번호 등)" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "사용 여부 (비활성 시 선택 불가)" },
    { name: "remarks", type: "TEXT", constraint: "-", desc: "비고 (거점 특이사항 기록)" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  customer_mst: [
    { name: "partner_id", type: "SERIAL", constraint: "PK", desc: "거래처 고유 번호" },
    { name: "partner_code", type: "VARCHAR(20)", constraint: "UNIQUE", desc: "거래처 코드" },
    { name: "partner_name", type: "VARCHAR(100)", constraint: "NOT NULL", desc: "거래처 명칭" },
    { name: "partner_type", type: "VARCHAR(10)", constraint: "NOT NULL", desc: "구분 (SUPPLIER: 매입처, CUSTOMER: 매출처, BOTH: 겸용)" },
    { name: "postal_code", type: "VARCHAR(10)", constraint: "-", desc: "우편번호" },
    { name: "address", type: "VARCHAR(255)", constraint: "-", desc: "주소" },
    { name: "contact_name", type: "VARCHAR(50)", constraint: "-", desc: "담당자 성명" },
    { name: "contact_tel", type: "VARCHAR(20)", constraint: "-", desc: "연락처" },
    { name: "bank_info", type: "VARCHAR(255)", constraint: "-", desc: "은행 계좌 정보 (청구서 출력용)" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "사용 여부" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  emp_mst: [
    { name: "emp_id", type: "SERIAL", constraint: "PK", desc: "직원 고유 번호" },
    { name: "login_id", type: "VARCHAR(20)", constraint: "UNIQUE", desc: "로그인 아이디" },
    { name: "password", type: "VARCHAR(255)", constraint: "NOT NULL", desc: "암호화된 비밀번호" },
    { name: "emp_name", type: "VARCHAR(50)", constraint: "NOT NULL", desc: "성명" },
    { name: "dept_code", type: "VARCHAR(10)", constraint: "-", desc: "부서 코드" },
    { name: "role_type", type: "VARCHAR(10)", constraint: "-", desc: "권한 (APPROVER, PROD, INSP)" },
    { name: "is_active", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "재직 여부" },
    { name: "email", type: "VARCHAR(100)", constraint: "-", desc: "이메일 주소 (알림 수신용)" },
    { name: "remarks", type: "TEXT", constraint: "-", desc: "비고 (특이사항 기록)" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
  general_mst: [
    { name: "code_id", type: "VARCHAR(10)", constraint: "PK", desc: "코드 아이디 (예: S00)" },
    { name: "group_code", type: "VARCHAR(20)", constraint: "NOT NULL", desc: "그룹 분류" },
    { name: "code_name", type: "VARCHAR(50)", constraint: "-", desc: "명칭" },
    { name: "sort_order", type: "INTEGER", constraint: "-", desc: "출력 순서" },
    { name: "is_use", type: "BOOLEAN", constraint: "DEFAULT TRUE", desc: "사용 여부" },
    { name: "create_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "등록 일시" },
    { name: "create_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
    { name: "update_date", type: "TIMESTAMP", constraint: "DEFAULT NOW()", desc: "수정 일시 (최초 등록은 등록 일시)" },
    { name: "update_user", type: "INTEGER", constraint: "-", desc: "로그인 유저" },
  ],
};

const tableList = [
  { name: "tran_history", desc: "수불이력 (전표 기본 정보)" },
  { name: "tran_detail_history", desc: "수불상세 (전표 내 상세 품목)" },
  { name: "stock_spec_history", desc: "입고명세 (분납 입고 이력)" },
  { name: "workflow", desc: "워크플로우 (전표 별 승인)" },
  { name: "bom_spec", desc: "BOM (부품 구성표)" },
  { name: "account_entry", desc: "회계 분개" },
  { name: "item_mst", desc: "품목 마스터" },
  { name: "warehouse_mst", desc: "창고거점 마스터" },
  { name: "customer_mst", desc: "거래처 마스터" },
  { name: "emp_mst", desc: "직원 마스터" },
  { name: "general_mst", desc: "범용 마스터" },
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
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

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
              반도체 정밀 부품 및 장비 제조업의 특성을 반영하여, <strong className="text-foreground">원재료 조달부터 BOM 기반의 생산, 최종 제품 출고에 이르는 전 과정을 통합 관리</strong>하는 시스템입니다. 
              전표 기반의 승인 프로세스를 통한 업무 통제, 실시간 수불 추적, 비즈니스 트랜잭션과 회계 분개의 자동 연동을 통한 데이터 정합성 확보를 목표로 합니다.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={Layers}>기술 스택</SectionTitle>
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
            <SectionTitle icon={TrendingUp}>주요 기능 요건</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                icon: Factory,
                title: "구매 및 제조 실행",
                items: [
                  "BOM 기반 자동 전개 — 완제품 생산 시 하위 부품 자동 추출, 과부족 시각화",
                  "Partial Delivery — 분납 시 이력 누적, 최종 입고 시 매입채무 확정 분개",
                ],
              },
              {
                icon: Package,
                title: "물류 및 출고 관리",
                items: [
                  "적송 재고(In-Transit) 관리 — '적송품' 계정 별도 관리로 자산 정합성 유지",
                  "FIFO 기반 LOT 추적 — 반도체 부품 선입선출 LOT 지정 출고",
                ],
              },
              {
                icon: BarChart3,
                title: "회계 연동 및 리포팅",
                items: [
                  "자동 분개 엔진 — 전표 상태 변경 트리거에 따라 분개 자동 생성",
                  "재무제표 Export — B/S, P/L 일본 표준 양식 및 PDF 출력",
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
            <SectionTitle icon={Workflow}>비즈니스 워크플로우</SectionTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["step1","step2","step3","step4"]} className="w-full">
              <AccordionItem value="step1">
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">1</Badge>
                    신청 및 승인
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pl-8">
                  <p>• <strong className="text-foreground">신청:</strong> 로그인 유저가 전표 작성 (신청중)</p>
                  <p>• <strong className="text-foreground">승인:</strong> 지정된 승인 자격자들이 모두 승인해야 다음 단계 진입</p>
                  <p>• <strong className="text-foreground">부인:</strong> 승인자 중 한 명이라도 거절 시 전표 종료</p>
                  <p>• <strong className="text-foreground">반려:</strong> 승인 완료 후 발주 전 제조담당자가 수정 요청</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="step2">
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">2</Badge>
                    제조/구매 실행
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pl-8">
                  <p>• <strong className="text-foreground">견적:</strong> 예상재고 증가 (입고 예정 수량 확보)</p>
                  <p>• <strong className="text-foreground">발주:</strong> [차변] 미착품 / [대변] 미지급금</p>
                  <p>• <strong className="text-foreground">분납:</strong> 워크플로우 이력에 기록 누적</p>
                  <p>• <strong className="text-foreground">입고:</strong> (누계 == 발주량) 시 [차] 원재료 / [대] 매입채무 확정</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="step3">
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">3</Badge>
                    검수 및 수불 완료
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pl-8">
                  <p>• <strong className="text-foreground">검수:</strong> 예상재고 차감, 실제재고 증감 반영</p>
                  <p>• 수불 이력 테이블에 최종 '입고 완료' 트랜잭션 기록</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="step4">
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">4</Badge>
                    재무제표 반영 및 서류 출력
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pl-8">
                  <p>검수 종료 후 재무제표에 반영 및 각종 서류(청구서, 발주서) 출력 가능</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Status Codes */}
        <Card>
          <CardHeader className="pb-3">
            <SectionTitle icon={Shield}>전표 상태 코드 정의</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-[11px] font-semibold w-20">구분</TableHead>
                    <TableHead className="text-[11px] font-semibold w-16">코드</TableHead>
                    <TableHead className="text-[11px] font-semibold w-24">상태 (EN)</TableHead>
                    <TableHead className="text-[11px] font-semibold w-20">상태 (JP)</TableHead>
                    <TableHead className="text-[11px] font-semibold">비즈니스 정의</TableHead>
                    <TableHead className="text-[11px] font-semibold w-32">담당자</TableHead>
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
            <SectionTitle icon={FileText}>회계 계정과목</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="text-[11px] font-semibold w-16">구분</TableHead>
                    <TableHead className="text-[11px] font-semibold w-40">계정과목</TableHead>
                    <TableHead className="text-[11px] font-semibold w-16">코드</TableHead>
                    <TableHead className="text-[11px] font-semibold">설명</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountCodes.map((a) => (
                    <TableRow key={a.code}>
                      <TableCell className="text-[11px]">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            a.category === "자산" ? "border-primary/30 text-primary" :
                            a.category === "부채" ? "border-destructive/30 text-destructive" :
                            a.category === "수익" ? "border-success/30 text-success" :
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
            <SectionTitle icon={Database}>데이터베이스 설계</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg border border-border/50 bg-secondary/30">
              <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                트랜잭션 무결성
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                검수 종료(I00) 및 매출 확정(T03) 시, 다중 테이블(수량, 이력, 분개) 업데이트를 단일 트랜잭션으로 묶어 원자성(Atomicity) 보장
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-secondary/30">
              <h3 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                Concurrency Control
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                재고 차감 시 비관적 잠금(Pessimistic Lock) 및 item_id 정렬 순서에 따른 잠금 획득으로 데드락 방지 및 데이터 정확도 확보
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
            <SectionTitle icon={BookOpen}>화면 정의</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "8.1", title: "제품 생산 및 실행", desc: "생산 기안 ~ 최종 검수까지의 전체 수명 주기 관리", path: "/production/execution" },
                { id: "8.2", title: "출고 및 재고조정", desc: "출고 신청 ~ 매출확정/재고조정의 수명 주기 관리", path: "/production/shipping" },
                { id: "8.3", title: "재무제표 조회", desc: "B/S, P/L 조회 및 PDF 출력", path: "/documents/finance" },
                { id: "8.4", title: "BOM 생산전표", desc: "BOM 기반 생산 전표 조회 및 출력", path: "/documents/bom" },
                { id: "8.5", title: "청구서/발주서", desc: "발주서(PO), 청구서(Invoice) 조회 및 PDF 출력", path: "/documents/invoice" },
                { id: "8.6", title: "직원 마스터", desc: "직원 등록/수정 및 권한 관리", path: "/master/employee" },
                { id: "8.7", title: "품목 마스터", desc: "원재료/반제품/완제품 등록/수정", path: "/master/item" },
                { id: "8.8", title: "창고거점 마스터", desc: "창고, 거점 등록/수정", path: "/master/warehouse" },
              ].map((screen) => (
                <div
                  key={screen.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-default"
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
            © 2024 S-Prime Corp. — 반도체 정밀 기기 제조 및 통합 재고 관리 시스템
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
                    <TableHead className="text-[10px] font-semibold">컬럼명</TableHead>
                    <TableHead className="text-[10px] font-semibold">데이터 타입</TableHead>
                    <TableHead className="text-[10px] font-semibold">제약</TableHead>
                    <TableHead className="text-[10px] font-semibold">설명</TableHead>
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
                            col.constraint === "FK" ? "border-warning/40 text-warning" :
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
    </ERPLayout>
  );
};

export default CompanyIntro;
