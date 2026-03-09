/**
 * 전표 관련 타입 정의
 * C# 백엔드 DTO와 매핑되는 TypeScript 인터페이스
 */

// 전표 타입
export type SlipType = "PROD" | "SHIP" | "BOM";

// 전표 상태 코드
export type SlipStatusCode = 
  | "S00" | "S01"           // 작성/신청
  | "A00" | "A01" | "A02"   // 승인 프로세스
  | "P00" | "P01" | "P02" | "P03" | "P04"  // 생산 프로세스
  | "I00"                   // 검수 완료
  | "T01" | "T02" | "T03" | "T04";  // 출고 프로세스

// 전표 목록 레코드
export interface SlipRecord {
  slipNo: string;
  slipType: SlipType;
  typeName: string;
  date: string;
  requester: string;
  department: string;
  approver: string;
  handler: string;
  status: SlipStatusCode;
  partner: string;
  totalAmount: number;
  itemCount: number;
}

// 전표 상세 정보
export interface SlipDetail extends SlipRecord {
  deliveryDate?: string;
  deliveryAddress?: string;
  note?: string;
  items: SlipItem[];
  history: SlipHistory[];
}

// 전표 품목
export interface SlipItem {
  id: number;
  itemCode: string;
  itemName: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  note?: string;
  warehouse?: string;
}

// 전표 이력
export interface SlipHistory {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  statusFrom: SlipStatusCode;
  statusTo: SlipStatusCode;
  note?: string;
}

// 전표 생성 요청
export interface CreateSlipRequest {
  slipType: SlipType;
  date: string;
  requester: string;
  department: string;
  partner: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  note?: string;
  items: CreateSlipItemRequest[];
}

// 전표 품목 생성 요청
export interface CreateSlipItemRequest {
  itemCode: string;
  itemName: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  note?: string;
  warehouse?: string;
}

// 전표 업데이트 요청
export interface UpdateSlipRequest {
  slipNo: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  note?: string;
  items?: CreateSlipItemRequest[];
}

// 전표 상태 변경 요청
export interface ChangeSlipStatusRequest {
  slipNo: string;
  newStatus: SlipStatusCode;
  note?: string;
}

// 전표 검색 필터
export interface SlipSearchFilter {
  slipType?: SlipType;
  status?: SlipStatusCode;
  dateFrom?: string;
  dateTo?: string;
  requester?: string;
  department?: string;
  partner?: string;
  searchText?: string;
  page?: number;
  pageSize?: number;
}
