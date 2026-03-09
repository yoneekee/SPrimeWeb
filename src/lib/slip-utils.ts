/**
 * 전표(Slip) 상태 관련 유틸리티 함수
 * 
 * 사용법:
 *   import { getSlipStatusLabel, getSlipStatusStyle, getSlipFlowSteps } from "@/lib/slip-utils";
 * 
 *   <Badge className={getSlipStatusStyle(status)}>{getSlipStatusLabel(status)}</Badge>
 * 
 * API 연동 시:
 *   SLIP_STATUS_CONFIG를 API 응답으로 교체하거나,
 *   각 함수 내부를 API 호출로 변경
 */

// ========================================
// 상태 정의 (나중에 API로 교체 가능)
// ========================================

export interface SlipStatusConfig {
  label: string;      // 일본어 레이블
  style: string;      // Tailwind 클래스 (Badge용)
  category: "draft" | "pending" | "approved" | "rejected" | "processing" | "complete";
}

/**
 * 전표 상태 코드 → 설정 매핑
 * TODO: API 연동 시 이 객체를 서버에서 받아오거나 동적으로 구성
 */
export const SLIP_STATUS_CONFIG: Record<string, SlipStatusConfig> = {
  // 공통 - 작성/신청/승인 단계
  S00: { label: "作成中", style: "bg-muted text-muted-foreground", category: "draft" },
  S01: { label: "申請中", style: "bg-warning/20 text-warning", category: "pending" },
  A00: { label: "承認中", style: "bg-info/20 text-info", category: "pending" },
  A01: { label: "承認済", style: "bg-success/20 text-success", category: "approved" },
  A02: { label: "否認", style: "bg-destructive/20 text-destructive", category: "rejected" },

  // 생산 전표 전용
  P00: { label: "差戻中", style: "bg-warning/20 text-warning", category: "pending" },
  P01: { label: "見積中", style: "bg-info/20 text-info", category: "processing" },
  P02: { label: "発注済", style: "bg-primary/20 text-primary", category: "processing" },
  P03: { label: "分納中", style: "bg-accent/20 text-accent-foreground", category: "processing" },
  P04: { label: "入庫済", style: "bg-success/20 text-success", category: "processing" },
  I00: { label: "検収済", style: "bg-success text-success-foreground", category: "complete" },

  // 출고 전표 전용
  T01: { label: "積送中", style: "bg-info/20 text-info", category: "processing" },
  T02: { label: "出庫済", style: "bg-primary/20 text-primary", category: "processing" },
  T03: { label: "売上確定", style: "bg-success text-success-foreground", category: "complete" },
  T04: { label: "在庫調整", style: "bg-warning/20 text-warning", category: "processing" },
};

// ========================================
// 헬퍼 함수들
// ========================================

/**
 * 상태 코드 → 일본어 레이블
 */
export function getSlipStatusLabel(statusCode: string): string {
  return SLIP_STATUS_CONFIG[statusCode]?.label ?? statusCode;
}

/**
 * 상태 코드 → Badge 스타일 클래스
 */
export function getSlipStatusStyle(statusCode: string): string {
  return SLIP_STATUS_CONFIG[statusCode]?.style ?? "bg-muted text-muted-foreground";
}

/**
 * 상태 코드 → 카테고리 (draft, pending, approved, rejected, processing, complete)
 */
export function getSlipStatusCategory(statusCode: string): SlipStatusConfig["category"] {
  return SLIP_STATUS_CONFIG[statusCode]?.category ?? "draft";
}

/**
 * 상태 코드 → 전체 설정 반환
 */
export function getSlipStatusConfig(statusCode: string): SlipStatusConfig | undefined {
  return SLIP_STATUS_CONFIG[statusCode];
}

// ========================================
// StatusFlowStepper용 steps 정의
// ========================================

export interface StatusStep {
  code: string;
  label: string;
}

/**
 * 생산 전표 기본 플로우
 */
export const PRODUCTION_FLOW_STEPS: StatusStep[] = [
  { code: "S00", label: "作成中" },
  { code: "S01", label: "申請中" },
  { code: "A00", label: "承認中" },
  { code: "A01", label: "承認済" },
  { code: "P01", label: "見積中" },
  { code: "P02", label: "発注済" },
  { code: "P03", label: "分納中" },
  { code: "P04", label: "入庫済" },
  { code: "I00", label: "検収済" },
];

/**
 * 출고 전표 기본 플로우
 */
export const SHIPMENT_FLOW_STEPS: StatusStep[] = [
  { code: "S00", label: "作成中" },
  { code: "S01", label: "申請中" },
  { code: "A00", label: "承認中" },
  { code: "A01", label: "承認済" },
  { code: "T01", label: "積送中" },
  { code: "T02", label: "出庫済" },
  { code: "T03", label: "売上確定" },
];

/**
 * 출고 전표 추가 단계 (재고조정)
 */
export const SHIPMENT_EXTRA_STEP: StatusStep = { code: "T04", label: "在庫調整" };

/**
 * 전표 타입에 따른 플로우 스텝 반환
 */
export function getSlipFlowSteps(slipType: "PROD" | "SHIP"): StatusStep[] {
  return slipType === "PROD" ? PRODUCTION_FLOW_STEPS : SHIPMENT_FLOW_STEPS;
}

/**
 * 전표 타입에 따른 추가 스텝 반환 (없으면 undefined)
 */
export function getSlipExtraStep(slipType: "PROD" | "SHIP"): StatusStep | undefined {
  return slipType === "SHIP" ? SHIPMENT_EXTRA_STEP : undefined;
}

// ========================================
// 전표 번호 생성
// ========================================

/**
 * 전표 번호 생성 (prefix에 따라 SLP/SHP/BOM 등)
 * 형식: {PREFIX}YYYYMMDD-{seq}
 * 
 * 사용 예:
 *   generateSlipNumber("SLP")  → "SLP20240307-001"
 *   generateSlipNumber("SHP")  → "SHP20240307-123"
 *   generateSlipNumber("BOM")  → "BOM20240307-045"
 * 
 * TODO: 백엔드 연동 시 실제 시퀀스를 API에서 받아올 것
 */
export function generateSlipNumber(prefix: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `${prefix}${y}${m}${d}-${seq}`;
}

// ========================================
// 상태 판별 유틸리티
// ========================================

/**
 * 완료된 상태인지 확인
 */
export function isSlipComplete(statusCode: string): boolean {
  return getSlipStatusCategory(statusCode) === "complete";
}

/**
 * 편집 가능한 상태인지 확인 (작성중만)
 */
export function isSlipEditable(statusCode: string): boolean {
  return statusCode === "S00";
}

/**
 * 취소/부인된 상태인지 확인
 */
export function isSlipRejected(statusCode: string): boolean {
  return getSlipStatusCategory(statusCode) === "rejected";
}

/**
 * 승인 대기 상태인지 확인
 */
export function isSlipPending(statusCode: string): boolean {
  return getSlipStatusCategory(statusCode) === "pending";
}
