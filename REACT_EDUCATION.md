# S-Prime ERP 프로젝트 — React 개발 교육자료

> **대상**: React를 처음 접하는 개발자  
> **목표**: 이 문서 하나로 본 프로젝트의 모든 코드를 읽고, 수정하고, 새 기능을 추가할 수 있는 수준까지 도달  
> **기술 스택**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## 목차

1. [React란 무엇인가](#1-react란-무엇인가)
2. [핵심 문법: JSX](#2-핵심-문법-jsx)
3. [컴포넌트 — React의 기본 단위](#3-컴포넌트--react의-기본-단위)
4. [Props — 컴포넌트에 데이터 전달하기](#4-props--컴포넌트에-데이터-전달하기)
5. [State — 화면을 바꾸는 데이터](#5-state--화면을-바꾸는-데이터)
6. [이벤트 처리](#6-이벤트-처리)
7. [조건부 렌더링과 리스트 렌더링](#7-조건부-렌더링과-리스트-렌더링)
8. [useEffect — 부수 효과 처리](#8-useeffect--부수-효과-처리)
9. [useRef — DOM 직접 접근](#9-useref--dom-직접-접근)
10. [Context API — 전역 상태 관리](#10-context-api--전역-상태-관리)
11. [커스텀 Hook](#11-커스텀-hook)
12. [React Router — 페이지 이동](#12-react-router--페이지-이동)
13. [TypeScript 기초 (React에서 쓰는 만큼)](#13-typescript-기초)
14. [Tailwind CSS — 스타일링](#14-tailwind-css--스타일링)
15. [shadcn/ui — UI 컴포넌트 라이브러리](#15-shadcnui--ui-컴포넌트-라이브러리)
16. [프로젝트 구조 완전 해부](#16-프로젝트-구조-완전-해부)
17. [앱 부팅 순서 (main → App → 페이지)](#17-앱-부팅-순서)
18. [인증 시스템 상세 분석](#18-인증-시스템-상세-분석)
19. [테마(다크/라이트) 시스템 분석](#19-테마-시스템-분석)
20. [레이아웃 시스템 분석](#20-레이아웃-시스템-분석)
21. [실전: 새 페이지 추가하기](#21-실전-새-페이지-추가하기)
22. [실전: 새 컴포넌트 만들기](#22-실전-새-컴포넌트-만들기)
23. [자주 하는 실수와 해결법](#23-자주-하는-실수와-해결법)
24. [부록: 유용한 패턴 모음](#24-부록-유용한-패턴-모음)

---

## 1. React란 무엇인가

React는 **UI(사용자 인터페이스)를 만들기 위한 JavaScript 라이브러리**입니다.

### 핵심 철학

```
전통적 웹 개발:
  HTML 파일 → CSS 파일 → JS 파일 (각각 분리)

React 개발:
  컴포넌트 = HTML + CSS + JS (하나로 합침)
```

React는 화면을 **"컴포넌트"라는 작은 블록**으로 나눠서 만듭니다.  
레고처럼 작은 블록을 조립해서 전체 화면을 구성한다고 생각하면 됩니다.

### 본 프로젝트에서의 예시

```
대시보드 페이지 (Index.tsx)
├── ERPLayout        ← 전체 틀 (사이드바 + 헤더)
│   ├── ERPSidebar   ← 왼쪽 메뉴
│   └── 헤더 바       ← 상단 바 (알림, 사용자 메뉴)
├── KPICard × 4      ← 숫자 카드 4개
├── DashboardChart   ← 차트
├── CompanyNews      ← 뉴스
├── InventoryStatus  ← 재고 현황
└── ...
```

---

## 2. 핵심 문법: JSX

JSX는 **JavaScript 안에서 HTML처럼 쓸 수 있는 문법**입니다.

### 기본 규칙

```tsx
// ✅ JSX 문법 (React에서 사용)
const element = <h1 className="title">안녕하세요</h1>;

// ❌ 일반 HTML (React에서는 이렇게 안 씀)
// <h1 class="title">안녕하세요</h1>
```

### JSX에서 반드시 알아야 할 차이점

| HTML | JSX (React) | 이유 |
|------|-------------|------|
| `class="..."` | `className="..."` | `class`는 JS 예약어 |
| `for="..."` | `htmlFor="..."` | `for`는 JS 예약어 |
| `<br>` | `<br />` | 모든 태그는 반드시 닫아야 함 |
| `<img>` | `<img />` | 셀프 클로징 태그 필수 |
| `style="color: red"` | `style={{ color: "red" }}` | 객체로 전달 |
| `onclick="fn()"` | `onClick={fn}` | camelCase + 중괄호 |

### JSX 안에서 JavaScript 사용하기: 중괄호 `{}`

```tsx
const name = "田中";
const count = 5;

return (
  <div>
    {/* 변수 출력 */}
    <p>이름: {name}</p>
    
    {/* 연산 */}
    <p>총 {count * 100}원</p>
    
    {/* 조건 */}
    <p>{count > 0 ? "있음" : "없음"}</p>
    
    {/* 함수 호출 */}
    <p>오늘: {new Date().toLocaleDateString()}</p>
  </div>
);
```

**규칙**: `{}` 중괄호 안에는 어떤 JavaScript 표현식이든 넣을 수 있습니다.

### 프로젝트 실제 코드 (Index.tsx)

```tsx
<div className="data-text text-[11px] text-muted-foreground">
  最終更新: {new Date().toLocaleString("ja-JP")}
  {/*         ↑ 중괄호 안에서 JS 실행 → 현재 날짜를 일본어로 표시 */}
</div>
```

---

## 3. 컴포넌트 — React의 기본 단위

컴포넌트는 **화면의 한 조각을 담당하는 함수**입니다.

### 컴포넌트 만드는 법

```tsx
// KPICard.tsx — 가장 기본적인 컴포넌트
const KPICard = () => {
  return (
    <div className="bg-card p-4 rounded-lg">
      <div className="text-2xl font-bold">12,345</div>
      <div className="text-xs text-muted-foreground">월간 생산량</div>
    </div>
  );
};

export default KPICard;
//     ↑ 다른 파일에서 이 컴포넌트를 사용할 수 있게 내보내기
```

### 컴포넌트 사용하는 법

```tsx
// Index.tsx — 다른 파일에서 가져와서 HTML 태그처럼 사용
import KPICard from "@/components/erp/KPICard";

const Index = () => {
  return (
    <div>
      <KPICard />   {/* ← HTML 태그처럼 사용! */}
      <KPICard />   {/* ← 여러 번 재사용 가능! */}
    </div>
  );
};
```

### 중요 규칙

1. **컴포넌트 이름은 반드시 대문자로 시작** (`KPICard` ✅, `kpiCard` ❌)
2. **return 안에는 반드시 하나의 최상위 태그만** 있어야 함
3. **파일 하나에 컴포넌트 하나**가 원칙 (이 프로젝트의 컨벤션)

```tsx
// ❌ 잘못된 예 — 최상위 태그가 2개
return (
  <h1>제목</h1>
  <p>내용</p>
);

// ✅ 올바른 예 — 하나의 div로 감싸기
return (
  <div>
    <h1>제목</h1>
    <p>내용</p>
  </div>
);

// ✅ 또는 빈 태그(Fragment)로 감싸기 — DOM에 불필요한 div를 추가하지 않음
return (
  <>
    <h1>제목</h1>
    <p>내용</p>
  </>
);
```

---

## 4. Props — 컴포넌트에 데이터 전달하기

Props(Properties)는 **부모 컴포넌트가 자식 컴포넌트에게 전달하는 데이터**입니다.  
함수의 매개변수와 같은 개념입니다.

### 기본 사용법

```tsx
// 부모 (Index.tsx) — 데이터를 전달하는 쪽
<KPICard title="월간 생산량" value="12,345" trend="up" />
<KPICard title="재고 회전율" value="4.8회" trend="up" />
//       ↑ 같은 컴포넌트에 다른 데이터를 전달 → 다른 결과!
```

```tsx
// 자식 (KPICard.tsx) — 데이터를 받는 쪽
interface KPICardProps {       // ← TypeScript: props의 타입 정의
  title: string;               //    "title은 문자열이다"
  value: string;
  trend?: "up" | "down";       //    ?는 선택적(optional) = 안 넘겨도 됨
}

const KPICard = ({ title, value, trend }: KPICardProps) => {
//               ↑ 구조 분해 할당: props 객체에서 필요한 것만 꺼냄
  return (
    <div>
      <div className="text-2xl">{value}</div>
      <div className="text-xs">{title}</div>
    </div>
  );
};
```

### 프로젝트 실제 코드 (KPICard.tsx 전체)

```tsx
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

// 1단계: Props 타입 정의
interface KPICardProps {
  title: string;          // 카드 제목
  value: string;          // 표시할 값
  change?: string;        // 변동률 (선택적)
  trend?: "up" | "down";  // 상승/하락 (선택적)
  icon: LucideIcon;       // 아이콘 컴포넌트 자체를 props로 전달!
  delay?: number;         // 애니메이션 딜레이 (선택적, 기본값 0)
}

// 2단계: Props 받아서 사용
const KPICard = ({ title, value, change, trend, icon: Icon, delay = 0 }: KPICardProps) => {
//                                                 ↑ 이름 변경   ↑ 기본값 설정
//               icon을 Icon으로 이름 변경 (컴포넌트는 대문자여야 하므로)
  return (
    <div className="card-glow border-glow rounded-lg bg-card p-4 animate-slide-up"
         style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-primary" />
          {/* ↑ props로 받은 아이콘을 컴포넌트로 사용 */}
        </div>
        {change && (
        // ↑ change가 존재할 때만 렌더링 (&&는 단축 조건부 렌더링)
          <div className={`flex items-center gap-1 text-xs ${
            trend === "up" ? "text-success" : "text-destructive"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="data-text text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
    </div>
  );
};

export default KPICard;
```

### children — 특수한 Props

`children`은 컴포넌트 태그 **사이에** 넣는 내용입니다.

```tsx
// ERPLayout.tsx — children을 받는 컴포넌트
interface ERPLayoutProps {
  children: React.ReactNode;  // 어떤 JSX든 받을 수 있음
}

const ERPLayout = ({ children }: ERPLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full">
      <ERPSidebar />         {/* 항상 표시되는 사이드바 */}
      <main className="flex-1">
        {children}            {/* ← 여기에 전달받은 내용이 들어감 */}
      </main>
    </div>
  );
};
```

```tsx
// Index.tsx — children을 전달하는 쪽
const Index = () => {
  return (
    <ERPLayout>
      {/* ↓ 이 모든 내용이 ERPLayout의 {children} 위치에 들어감 */}
      <h1>전체 대시보드</h1>
      <KPICard title="월간 생산량" value="12,345" />
    </ERPLayout>
  );
};
```

> 비유: `ERPLayout`은 **액자**이고, `children`은 **액자에 넣을 그림**입니다.  
> 액자(레이아웃)는 항상 같고, 그림(내용)만 페이지마다 바뀝니다.

---

## 5. State — 화면을 바꾸는 데이터

**State(상태)는 React에서 가장 중요한 개념**입니다.

> 핵심 원리: **State가 바뀌면 화면이 자동으로 다시 그려진다(리렌더링)**

### useState — 가장 기본적인 상태 관리

```tsx
import { useState } from "react";

const Counter = () => {
  // useState(초기값)  →  [현재값, 값을바꾸는함수]
  const [count, setCount] = useState(0);
  //     ↑ 현재값   ↑ 업데이트 함수   ↑ 초기값

  return (
    <div>
      <p>횟수: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      {/*                    ↑ setCount를 호출하면 count가 바뀌고, 화면이 자동 업데이트 */}
    </div>
  );
};
```

### 일반 변수 vs State — 왜 State를 써야 하는가?

```tsx
// ❌ 일반 변수 — 값이 바뀌어도 화면이 안 바뀜!
let count = 0;
const handleClick = () => {
  count = count + 1;  // 값은 바뀌지만 React가 모름 → 화면 그대로
};

// ✅ State — 값이 바뀌면 화면이 자동으로 바뀜!
const [count, setCount] = useState(0);
const handleClick = () => {
  setCount(count + 1);  // React에게 "값이 바뀌었어!" 알림 → 화면 업데이트
};
```

### 다양한 State 타입

```tsx
// 문자열 State
const [username, setUsername] = useState("");

// 불리언 State (true/false)
const [showPw, setShowPw] = useState(false);

// 배열 State
const [notifications, setNotifications] = useState([
  { id: "1", title: "승인완료", read: false },
  { id: "2", title: "재고부족", read: true },
]);

// 객체 State
const [settingsForm, setSettingsForm] = useState({
  displayName: "",
  phone: "",
  department: "",
});
```

### State 업데이트 규칙 (매우 중요!)

```tsx
// 🔴 State를 직접 수정하면 절대 안 됨!!
notifications[0].read = true;            // ❌ 직접 수정 → 화면 안 바뀜
settingsForm.displayName = "새 이름";     // ❌ 직접 수정 → 화면 안 바뀜

// 🟢 반드시 set 함수를 통해 "새 객체/배열"을 전달해야 함
setNotifications(prev =>
  prev.map(n => n.id === "1" ? { ...n, read: true } : n)
  //                           ↑ 스프레드 연산자로 복사 후 수정
);

setSettingsForm(prev => ({ ...prev, displayName: "새 이름" }));
//                        ↑ 기존 값 복사 + displayName만 덮어쓰기
```

### 프로젝트 실제 사례 (Login.tsx)

```tsx
const Login = () => {
  // 여러 개의 State를 선언
  const [username, setUsername] = useState("");    // 입력한 ID
  const [password, setPassword] = useState("");    // 입력한 PW
  const [showPw, setShowPw] = useState(false);     // 비밀번호 보이기 토글
  const [error, setError] = useState("");          // 에러 메시지
  const [loading, setLoading] = useState(false);   // 로딩 상태

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();          // 폼 기본 제출 동작 방지
    setError("");                // 에러 초기화
    
    if (!username || !password) {
      setError("IDとパスワードを入力してください。");
      return;                    // 여기서 중단
    }
    
    setLoading(true);            // 로딩 시작 → 버튼이 "ログイン中..."으로 바뀜
    const ok = await login(username, password);
    setLoading(false);           // 로딩 끝
    
    if (ok) {
      navigate("/", { replace: true });   // 성공 → 대시보드로 이동
    } else {
      setError("ログインに失敗しました。");  // 실패 → 에러 표시
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        {/* ↑ 사용자가 타이핑할 때마다 setUsername 호출 → username State 업데이트 → 화면 갱신 */}
      />
      
      <Button disabled={loading}>
        {loading ? "ログイン中..." : "ログイン"}
        {/* ↑ loading State에 따라 버튼 텍스트가 바뀜 */}
      </Button>
      
      {error && <p className="text-destructive">{error}</p>}
      {/* ↑ error가 빈 문자열이면 안 보이고, 있으면 빨간 글씨로 표시 */}
    </form>
  );
};
```

### State 업데이트의 "이전 값" 패턴

이전 값을 기반으로 업데이트할 때는 **콜백 패턴**을 사용합니다.

```tsx
// ✅ 권장: 이전 값을 기반으로 업데이트
setNotifications(prev => prev.map(n => ({ ...n, read: true })));
//               ↑ prev는 현재 최신 값을 보장

// ⚠️ 주의: 동시 업데이트 시 문제 발생 가능
setCount(count + 1);  // count가 오래된 값일 수 있음
setCount(prev => prev + 1);  // ✅ 항상 최신 값 보장
```

---

## 6. 이벤트 처리

### 기본 이벤트

```tsx
// 클릭 이벤트
<button onClick={() => console.log("클릭!")}>클릭</button>

// 입력 이벤트 (타이핑할 때마다)
<input onChange={(e) => setUsername(e.target.value)} />
//                ↑ 이벤트 객체    ↑ 입력된 값

// 폼 제출 이벤트
<form onSubmit={(e) => {
  e.preventDefault();   // 페이지 새로고침 방지 (React에서 필수!)
  handleSubmit();
}}>
```

### 이벤트 핸들러 패턴

```tsx
// 패턴 1: 인라인 함수 (간단한 로직)
<button onClick={() => setShowPw(!showPw)}>토글</button>

// 패턴 2: 별도 함수 정의 (복잡한 로직)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // 복잡한 로직...
};
<form onSubmit={handleSubmit}>

// 패턴 3: 파라미터가 필요한 경우
<button onClick={() => handleDetail(slip)}>상세보기</button>
//               ↑ 화살표 함수로 감싸서 파라미터 전달
```

### 프로젝트 실제 사례 (ERPLayout.tsx — 알림 클릭)

```tsx
{notifications.map((n) => (
  <div
    key={n.id}
    onClick={() =>
      // 클릭한 알림만 read: true로 변경
      setNotifications(prev =>
        prev.map(item => item.id === n.id ? { ...item, read: true } : item)
      )
    }
  >
    <span>{n.title}</span>
    <p>{n.message}</p>
  </div>
))}
```

---

## 7. 조건부 렌더링과 리스트 렌더링

### 조건부 렌더링 — 조건에 따라 다르게 보여주기

```tsx
// 패턴 1: && 연산자 (있으면 보여줌, 없으면 안 보여줌)
{error && <p className="text-destructive">{error}</p>}
// error가 빈 문자열("")이면 → false → 아무것도 안 보임
// error가 "에러!"이면 → true → <p> 태그 렌더링

// 패턴 2: 삼항 연산자 (둘 중 하나를 보여줌)
{loading ? "ログイン中..." : "ログイン"}
// loading이 true면 → "ログイン中..."
// loading이 false면 → "ログイン"

// 패턴 3: 삼항 + 컴포넌트
{theme === "dark"
  ? <Moon className="w-3.5 h-3.5" />
  : <Sun className="w-3.5 h-3.5" />
}

// 패턴 4: 복잡한 조건 → 변수에 저장
const statusInfo = slip.slipType === "PROD" ? PROD_STATUS_MAP : SHIP_STATUS_MAP;
```

### 리스트 렌더링 — 배열을 화면에 표시하기

```tsx
// 배열.map()으로 각 요소를 JSX로 변환
const fruits = ["사과", "배", "포도"];

return (
  <ul>
    {fruits.map((fruit, index) => (
      <li key={index}>{fruit}</li>
      {/* ↑ key는 필수! React가 각 요소를 구별하는 데 사용 */}
    ))}
  </ul>
);
```

### key의 중요성

```tsx
// ✅ 고유한 ID를 key로 사용 (최선)
{notifications.map(n => (
  <div key={n.id}>{n.title}</div>
))}

// ⚠️ index를 key로 사용 (차선 — 순서가 바뀔 수 있는 리스트에서는 비추천)
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ❌ key를 안 쓰면 — 경고 발생 + 성능 문제
{items.map(item => (
  <div>{item.name}</div>  // key 없음 → Warning!
))}
```

### 프로젝트 실제 사례 (SlipListPage.tsx — 테이블 렌더링)

```tsx
<TableBody>
  {paged.map((slip) => (
    <TableRow key={slip.slipNo}>                   {/* ← 전표번호를 key로 */}
      <TableCell>{slip.slipNo}</TableCell>
      <TableCell>
        <Badge className={statusInfo.color}>       {/* ← 상태에 따라 색상 변경 */}
          {statusInfo.label}
        </Badge>
      </TableCell>
      <TableCell>
        ¥{slip.totalAmount.toLocaleString()}        {/* ← 숫자를 통화 형식으로 */}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

## 8. useEffect — 부수 효과 처리

`useEffect`는 **컴포넌트가 화면에 나타나거나 업데이트될 때 실행할 코드**를 정의합니다.

### 기본 패턴 3가지

```tsx
import { useEffect } from "react";

// 패턴 1: 컴포넌트가 처음 나타날 때 1번만 실행
useEffect(() => {
  console.log("컴포넌트가 마운트됨!");
  // API 호출, 이벤트 리스너 등록 등
}, []);  // ← 빈 배열 = "의존성 없음" = 처음 1번만

// 패턴 2: 특정 값이 바뀔 때마다 실행
useEffect(() => {
  console.log("theme이 바뀜:", theme);
}, [theme]);  // ← theme이 바뀔 때마다 실행

// 패턴 3: 정리(cleanup) 함수 포함
useEffect(() => {
  const handler = (e: MouseEvent) => { /* ... */ };
  document.addEventListener("mousedown", handler);
  
  return () => {  // ← 정리 함수: 컴포넌트가 사라질 때 실행
    document.removeEventListener("mousedown", handler);
  };
}, []);
```

### 의존성 배열 완전 이해

```
useEffect(() => { ... }, [a, b])

┌─────────────────────────────────────────────────────┐
│  의존성 배열    │  실행 시점                          │
├─────────────────┼───────────────────────────────────│
│  없음 (생략)    │  매 렌더링마다 (거의 안 씀)         │
│  []            │  처음 마운트 시 1번만                │
│  [a]           │  처음 + a가 바뀔 때마다              │
│  [a, b]        │  처음 + a 또는 b가 바뀔 때마다       │
└─────────────────────────────────────────────────────┘
```

### 프로젝트 실제 사례 1: 테마 적용 (use-theme.tsx)

```tsx
useEffect(() => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");      // <html>에 "dark" 클래스 추가
  } else {
    root.classList.remove("dark");   // "dark" 클래스 제거
  }
  localStorage.setItem("s-prime-theme", theme);  // 브라우저에 저장
}, [theme]);
// ↑ theme이 바뀔 때마다 실행 → dark 클래스 토글 + 저장
```

### 프로젝트 실제 사례 2: 외부 클릭 감지 (ERPLayout.tsx)

```tsx
useEffect(() => {
  const handler = (e: MouseEvent) => {
    // 알림 패널 바깥을 클릭하면 닫기
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setNotifOpen(false);
    }
  };
  
  if (notifOpen || userMenuOpen) {
    document.addEventListener("mousedown", handler);  // 이벤트 등록
  }
  
  return () => document.removeEventListener("mousedown", handler);  // 정리
}, [notifOpen, userMenuOpen]);
// ↑ notifOpen이나 userMenuOpen이 바뀔 때마다 재설정
```

---

## 9. useRef — DOM 직접 접근

`useRef`는 **실제 DOM 요소에 직접 접근**하거나, **렌더링에 영향을 주지 않는 값**을 저장할 때 사용합니다.

```tsx
import { useRef } from "react";

// DOM 요소 참조
const panelRef = useRef<HTMLDivElement>(null);

return (
  <div ref={panelRef}>  {/* ← 이 div의 실제 DOM에 접근 가능 */}
    알림 패널
  </div>
);

// 사용 예: 이 div 바깥 클릭을 감지
if (panelRef.current && !panelRef.current.contains(e.target)) {
  // panelRef.current = 실제 <div> DOM 요소
  setNotifOpen(false);
}
```

### State vs Ref 차이

```
┌──────────────┬──────────────────────────┬────────────────────────┐
│              │  useState                │  useRef                │
├──────────────┼──────────────────────────┼────────────────────────┤
│ 값 변경 시   │  화면 다시 그림 (리렌더링) │  화면 안 바뀜           │
│ 용도         │  화면에 보여야 하는 데이터  │  DOM 접근, 타이머 ID   │
│ 접근 방법    │  count                    │  ref.current           │
└──────────────┴──────────────────────────┴────────────────────────┘
```

---

## 10. Context API — 전역 상태 관리

### 문제: Props 전달의 한계 (Props Drilling)

```
App
├── ERPLayout        ← user 정보 필요
│   ├── Header       ← user 정보 필요
│   │   └── UserMenu ← user 정보 필요  ← 여기서 쓰려면 위에서 계속 전달해야 함!
│   └── Sidebar
└── Login            ← login 함수 필요
```

Props로만 전달하면 **중간 컴포넌트들이 자신은 쓰지도 않는 데이터를 계속 넘겨야** 합니다.

### 해결: Context API — 어디서든 바로 접근

```
AuthContext (전역 저장소)
  ↓ 값 제공 (Provider)
App
├── ERPLayout → useAuth()로 바로 접근!
│   ├── Header → useAuth()로 바로 접근!
│   └── Sidebar
└── Login → useAuth()로 바로 접근!
```

### Context 만드는 3단계

```tsx
// src/hooks/use-auth.tsx — 전체 코드 분석

import { createContext, useContext, useState, ReactNode } from "react";

// ===== 1단계: Context 생성 =====
// "이런 형태의 데이터가 공유될 거야" 라고 선언
interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
//                 ↑ 초기값은 null (Provider 밖에서 접근 시 에러 처리용)


// ===== 2단계: Provider 컴포넌트 생성 =====
// 실제 데이터와 함수를 관리하고 하위 컴포넌트에 제공
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // sessionStorage에서 초기값 복원 (새로고침해도 로그인 유지)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("erp_logged_in") === "true";
  });
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = sessionStorage.getItem("erp_user");
    return saved ? JSON.parse(saved) : null;
  });

  // 로그인 함수
  const login = async (username: string, password: string): Promise<boolean> => {
    if (username && password) {
      const u = { name: username, email: username };
      setUser(u);
      setIsLoggedIn(true);
      sessionStorage.setItem("erp_logged_in", "true");
      sessionStorage.setItem("erp_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    sessionStorage.removeItem("erp_logged_in");
    sessionStorage.removeItem("erp_user");
  };

  // value에 공유할 모든 데이터와 함수를 담아서 제공
  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


// ===== 3단계: 커스텀 Hook으로 쉽게 접근 =====
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  //    ↑ AuthProvider 밖에서 사용하면 에러 (실수 방지)
  return ctx;
};
```

### Provider 설정 (main.tsx)

```tsx
// main.tsx — 앱 전체를 Provider로 감싸기
createRoot(document.getElementById("root")!).render(
  <ThemeProvider>          {/* ← 테마 Context */}
    <AuthProvider>         {/* ← 인증 Context */}
      <App />              {/* ← 이 안의 모든 컴포넌트에서 useAuth() 사용 가능 */}
    </AuthProvider>
  </ThemeProvider>
);
```

### 사용하는 쪽 (어떤 컴포넌트에서든)

```tsx
// Login.tsx
const Login = () => {
  const { login } = useAuth();  // ← login 함수만 꺼내서 사용
  // ...
};

// ERPLayout.tsx
const ERPLayout = () => {
  const { user, logout } = useAuth();  // ← user 정보와 logout 함수 사용
  // ...
  <p>{user?.name || "ユーザー"}</p>
};

// App.tsx (보호 라우트)
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();  // ← 로그인 여부 확인
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
```

---

## 11. 커스텀 Hook

커스텀 Hook은 **"use"로 시작하는 재사용 가능한 로직 함수**입니다.

### 이 프로젝트의 커스텀 Hook들

| Hook | 파일 | 역할 |
|------|------|------|
| `useAuth` | `src/hooks/use-auth.tsx` | 로그인/로그아웃/사용자 정보 |
| `useTheme` | `src/hooks/use-theme.tsx` | 다크/라이트 모드 전환 |
| `useSidebar` | `src/components/ui/sidebar.tsx` | 사이드바 열기/닫기 |

### 커스텀 Hook을 쓰는 이유

```tsx
// ❌ 커스텀 Hook 없이 — 매번 같은 코드를 반복
const ComponentA = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("...");
  const { user } = ctx;
};

const ComponentB = () => {
  const ctx = useContext(AuthContext);  // 또 반복...
  if (!ctx) throw new Error("...");    // 또 반복...
  const { user } = ctx;
};

// ✅ 커스텀 Hook으로 — 한 줄로 끝
const ComponentA = () => {
  const { user } = useAuth();  // 깔끔!
};

const ComponentB = () => {
  const { user } = useAuth();  // 동일하게 깔끔!
};
```

---

## 12. React Router — 페이지 이동

이 프로젝트는 **React Router v6**을 사용해서 URL에 따라 다른 페이지를 보여줍니다.

### 라우트 설정 (App.tsx)

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const App = () => (
  <BrowserRouter>           {/* ← URL 변경 감지 시작 */}
    <Routes>                {/* ← 라우트 목록 시작 */}
      {/* 공개 라우트 */}
      <Route path="/login" element={<Login />} />
      
      {/* 보호 라우트 — 로그인 필수 */}
      <Route path="/" element={
        <ProtectedRoute><Index /></ProtectedRoute>
      } />
      <Route path="/production/execution" element={
        <ProtectedRoute><ProductionExecution /></ProtectedRoute>
      } />
      
      {/* 404 — 위의 어떤 경로에도 안 맞을 때 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
```

### 페이지 이동하는 방법 2가지

```tsx
import { useNavigate } from "react-router-dom";

const MyComponent = () => {
  const navigate = useNavigate();
  
  // 방법 1: 프로그래밍 방식 (버튼 클릭, 로직 후)
  const handleClick = () => {
    navigate("/production/execution");           // 이동
    navigate("/login", { replace: true });       // 이동 (뒤로가기 불가)
    navigate(-1);                                // 뒤로가기
  };
  
  // 방법 2: Link 컴포넌트 (일반 링크)
  // import { Link } from "react-router-dom";
  // <Link to="/production">생산 페이지</Link>
};
```

### 현재 URL 정보 가져오기

```tsx
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  
  console.log(location.pathname);  // "/production/execution"
  
  // 현재 페이지에 따라 메뉴 활성화
  const isActive = (path: string) => location.pathname.startsWith(path);
};
```

### 보호 라우트 패턴 (ProtectedRoute)

```tsx
// 로그인하지 않은 사용자를 로그인 페이지로 리다이렉트
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
    //     ↑ 로그인 안 됨 → 로그인 페이지로 강제 이동
  }
  
  return <>{children}</>;
  //     ↑ 로그인 됨 → 정상적으로 페이지 표시
};
```

---

## 13. TypeScript 기초

TypeScript는 **JavaScript에 타입(Type)을 추가한 언어**입니다.  
"이 변수에는 문자열만 넣을 수 있어"처럼 규칙을 정해서 실수를 미리 잡아줍니다.

### 기본 타입

```tsx
// 변수 타입
const name: string = "田中";
const count: number = 42;
const isActive: boolean = true;

// 배열 타입
const names: string[] = ["田中", "佐藤"];
const counts: number[] = [1, 2, 3];

// 함수 타입
const greet = (name: string): string => {
  return `Hello, ${name}`;
};
//             ↑ 매개변수 타입    ↑ 반환 타입
```

### interface — 객체의 형태 정의

```tsx
// interface 정의
interface SlipRecord {
  slipNo: string;                    // 필수 속성
  slipType: "PROD" | "SHIP";        // 리터럴 유니언: 둘 중 하나만 가능
  date: string;
  totalAmount: number;
  handler?: string;                  // ? = 선택적 속성 (없어도 됨)
}

// 사용
const slip: SlipRecord = {
  slipNo: "SLP20240307-001",
  slipType: "PROD",          // "PROD" 또는 "SHIP"만 가능
  date: "2024-03-07",
  totalAmount: 68750000,
  // handler는 없어도 OK (선택적)
};
```

### React에서 자주 쓰는 타입

```tsx
// Props 타입 정의
interface MyComponentProps {
  title: string;
  count: number;
  onClick: () => void;                    // 반환값 없는 함수
  onChange: (value: string) => void;       // string 매개변수를 받는 함수
  icon: React.ElementType;                // React 컴포넌트를 props로 전달할 때
  children: React.ReactNode;              // JSX 요소
  style?: React.CSSProperties;            // 인라인 스타일 (선택적)
}

// 이벤트 타입
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setUsername(e.target.value);
};

// useState에서 타입
const [user, setUser] = useState<{ name: string } | null>(null);
//                                ↑ 제네릭: State의 타입을 명시
```

### Record 타입 — 키-값 매핑

```tsx
// 프로젝트 실제 사례: 상태 코드별 라벨과 색상 매핑
const PROD_STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "作成中", color: "bg-muted text-muted-foreground" },
  S01: { label: "申請中", color: "bg-info/20 text-info" },
  A01: { label: "承認済", color: "bg-success/20 text-success" },
};

// Record<KeyType, ValueType> = "키가 string이고 값이 { label, color }인 객체"
```

### 타입을 모르겠을 때

1. **마우스를 올려보기**: VSCode에서 변수에 마우스를 올리면 타입이 나옴
2. **에러 메시지 읽기**: TypeScript 에러는 "이 타입이 저 타입에 안 맞아"라는 뜻
3. **`any` 사용**: 정 모르겠으면 `any`로 일단 넘어가기 (비추천이지만 동작은 함)

```tsx
const something: any = "아무거나 다 넣을 수 있음";  // 비상용
```

---

## 14. Tailwind CSS — 스타일링

Tailwind CSS는 **미리 정의된 클래스를 조합해서 스타일을 적용하는 방식**입니다.

### CSS vs Tailwind 비교

```css
/* 전통 CSS */
.card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
```

```tsx
/* Tailwind — 클래스 이름으로 직접 스타일 적용 */
<div className="bg-white rounded-lg p-4 flex items-center gap-3">
```

### 자주 쓰는 Tailwind 클래스

```
┌─── 레이아웃 ───┐
│ flex           │  display: flex
│ flex-col       │  flex-direction: column
│ items-center   │  align-items: center
│ justify-between│  justify-content: space-between
│ gap-3          │  gap: 12px (4px × 3)
│ grid           │  display: grid
│ grid-cols-4    │  4열 그리드
└────────────────┘

┌─── 간격 ───────┐          ※ 단위: 1 = 4px
│ p-4            │  padding: 16px (전체)
│ px-3           │  padding-left/right: 12px
│ py-2           │  padding-top/bottom: 8px
│ mt-4           │  margin-top: 16px
│ mb-2           │  margin-bottom: 8px
│ space-y-4      │  자식 요소 사이 세로 간격 16px
└────────────────┘

┌─── 크기 ───────┐
│ w-9            │  width: 36px
│ h-9            │  height: 36px
│ w-full         │  width: 100%
│ min-h-screen   │  min-height: 100vh
│ max-w-md       │  max-width: 28rem
└────────────────┘

┌─── 텍스트 ─────┐
│ text-xs        │  font-size: 14px (이 프로젝트에서 재정의됨)
│ text-sm        │  font-size: 16px (이 프로젝트에서 재정의됨)
│ text-lg        │  font-size: 18px
│ text-2xl       │  font-size: 24px
│ font-bold      │  font-weight: bold
│ font-semibold  │  font-weight: 600
│ truncate       │  긴 텍스트 잘라서 "..." 표시
│ line-clamp-2   │  2줄까지만 표시
└────────────────┘

┌─── 색상 (시맨틱 토큰) ────────┐
│ text-foreground              │  기본 텍스트 색
│ text-muted-foreground        │  보조 텍스트 색
│ text-primary                 │  강조 색 (틸 계열)
│ text-destructive             │  빨간색 (에러/위험)
│ text-success                 │  초록색 (성공)
│ text-warning                 │  노란색 (경고)
│ bg-background                │  기본 배경색
│ bg-card                      │  카드 배경색
│ bg-secondary                 │  보조 배경색
│ bg-primary/10                │  primary 색상 10% 투명도
│ border-border                │  기본 테두리 색
└──────────────────────────────┘
```

### ⚠️ 절대 직접 색상을 쓰지 말 것!

```tsx
// ❌ 금지! 하드코딩 색상
<div className="bg-white text-black border-gray-200">

// ✅ 올바름! 시맨틱 토큰 사용
<div className="bg-card text-foreground border-border">
//   ↑ 다크모드에서 자동으로 색상이 바뀜!
```

### 반응형 디자인

```tsx
// sm: 640px+, md: 768px+, lg: 1024px+
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 4열 */}
</div>

// 모바일에서 숨기기
<div className="hidden sm:flex">
  {/* 640px 미만에서 숨김, 이상에서 flex로 표시 */}
</div>
```

### 동적 클래스 (조건에 따라 스타일 변경)

```tsx
// 방법 1: 템플릿 리터럴
<div className={`px-4 py-2 rounded-md ${
  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
}`}>

// 방법 2: cn() 유틸리티 (이 프로젝트에서 제공)
import { cn } from "@/lib/utils";

<Button className={cn(
  "h-8 w-full text-left text-xs",
  !dateFrom && "text-muted-foreground"   // dateFrom이 없으면 회색
)}>
```

### 디자인 토큰 시스템 (index.css)

```css
/* 모든 색상은 HSL 값으로 CSS 변수로 정의됨 */
:root {
  --primary: 185 72% 38%;           /* 라이트 모드 primary 색상 */
  --background: 210 20% 96%;
}
.dark {
  --primary: 185 72% 48%;           /* 다크 모드에서 자동 변경 */
  --background: 220 20% 7%;
}

/* tailwind.config.ts에서 이 변수를 Tailwind 클래스로 연결 */
/* → bg-primary, text-primary 등으로 사용 가능 */
```

---

## 15. shadcn/ui — UI 컴포넌트 라이브러리

shadcn/ui는 **미리 만들어진 고품질 UI 컴포넌트**들의 모음입니다.  
`src/components/ui/` 폴더에 모든 컴포넌트 소스코드가 있습니다.

### 자주 쓰는 컴포넌트

```tsx
// 버튼
import { Button } from "@/components/ui/button";
<Button variant="default">기본</Button>
<Button variant="outline">테두리만</Button>
<Button variant="ghost">투명</Button>
<Button variant="destructive">삭제</Button>
<Button size="sm">작은 버튼</Button>
<Button disabled={loading}>로딩 중이면 비활성화</Button>

// 입력 필드
import { Input } from "@/components/ui/input";
<Input placeholder="입력해주세요" value={text} onChange={(e) => setText(e.target.value)} />

// 라벨
import { Label } from "@/components/ui/label";
<Label htmlFor="username">사용자 ID</Label>

// 카드
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
<Card>
  <CardHeader><CardTitle>제목</CardTitle></CardHeader>
  <CardContent>내용</CardContent>
</Card>

// 테이블
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>번호</TableHead>
      <TableHead>이름</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>001</TableCell>
      <TableCell>田中</TableCell>
    </TableRow>
  </TableBody>
</Table>

// 뱃지 (상태 라벨)
import { Badge } from "@/components/ui/badge";
<Badge className="bg-success/20 text-success">승인완료</Badge>

// 셀렉트 (드롭다운)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
<Select value={filter} onValueChange={setFilter}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="all">전체</SelectItem>
    <SelectItem value="PROD">생산</SelectItem>
  </SelectContent>
</Select>

// 다이얼로그 (모달)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>설정</DialogTitle></DialogHeader>
    <p>모달 내용</p>
  </DialogContent>
</Dialog>

// 탭
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">탭 1</TabsTrigger>
    <TabsTrigger value="tab2">탭 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">탭 1 내용</TabsContent>
  <TabsContent value="tab2">탭 2 내용</TabsContent>
</Tabs>
```

### 아이콘 (lucide-react)

```tsx
import { Factory, Bell, Search, User, Sun, Moon, ChevronDown } from "lucide-react";

<Factory className="w-4 h-4 text-primary" />
// className으로 크기와 색상을 자유롭게 조절
```

아이콘 목록: https://lucide.dev/icons

---

## 16. 프로젝트 구조 완전 해부

```
src/
├── main.tsx                    # 앱 시작점 (Provider 설정)
├── App.tsx                     # 라우팅 설정 (URL → 페이지 매핑)
├── index.css                   # 전역 스타일 + 디자인 토큰 (CSS 변수)
│
├── hooks/                      # 커스텀 Hook (전역 상태 관리)
│   ├── use-auth.tsx            #   로그인/로그아웃/사용자 정보
│   ├── use-theme.tsx           #   다크/라이트 모드
│   └── use-mobile.tsx          #   모바일 여부 감지
│
├── pages/                      # 페이지 컴포넌트 (URL과 1:1 대응)
│   ├── Login.tsx               #   /login
│   ├── Index.tsx               #   / (대시보드)
│   ├── ProductionExecution.tsx  #   /production/execution
│   ├── ShipmentManagement.tsx   #   /production/shipping
│   ├── SlipListPage.tsx        #   /production/slips
│   ├── FinancialStatements.tsx  #   /documents/finance
│   ├── BomProductionSlip.tsx    #   /documents/bom
│   ├── InvoiceManagement.tsx    #   /documents/invoice
│   ├── EmployeeMaster.tsx      #   /master/employee
│   ├── ItemMaster.tsx          #   /master/item
│   ├── WarehouseMaster.tsx     #   /master/warehouse
│   ├── CompanyIntro.tsx        #   /company
│   └── NotFound.tsx            #   404
│
├── components/
│   ├── erp/                    # 비즈니스 컴포넌트 (ERP 전용)
│   │   ├── ERPLayout.tsx       #   전체 레이아웃 (사이드바 + 헤더)
│   │   ├── ERPSidebar.tsx      #   사이드바 메뉴
│   │   ├── KPICard.tsx         #   KPI 숫자 카드
│   │   ├── DashboardChart.tsx  #   차트
│   │   ├── StatusFlowStepper.tsx  # 상태 플로우 스텝퍼
│   │   └── ...
│   │
│   └── ui/                     # 공통 UI 컴포넌트 (shadcn/ui)
│       ├── button.tsx          #   ※ 직접 수정하는 경우는 드뭄
│       ├── input.tsx           #   ※ 필요시 variant 추가 정도
│       ├── card.tsx
│       ├── table.tsx
│       └── ...
│
├── lib/
│   └── utils.ts                # 유틸리티 함수 (cn 등)
│
└── test/                       # 테스트 파일
```

---

## 17. 앱 부팅 순서

사용자가 브라우저에서 앱을 열었을 때 코드가 실행되는 순서:

```
① index.html
   └→ <div id="root"></div>     ← React가 여기에 그림

② main.tsx
   └→ createRoot(document.getElementById("root")!).render(
        <ThemeProvider>          ← 테마 Context 제공 시작
          <AuthProvider>         ← 인증 Context 제공 시작
            <App />              ← 앱 본체
          </AuthProvider>
        </ThemeProvider>
      );

③ App.tsx
   └→ BrowserRouter 시작 → URL 확인
      └→ URL이 "/" →  ProtectedRoute 확인
          └→ isLoggedIn === false → Navigate to "/login"
          └→ isLoggedIn === true  → <Index /> 렌더링

④ Index.tsx (또는 해당 페이지)
   └→ <ERPLayout>              ← 사이드바 + 헤더 표시
        └→ 페이지 내용 렌더링
      </ERPLayout>
```

### 로그인 → 대시보드 전체 흐름

```
1. 사용자가 앱 열기 → URL "/"
2. ProtectedRoute에서 isLoggedIn 확인 → false
3. "/login"으로 리다이렉트
4. Login 페이지 렌더링
5. 사용자가 ID/PW 입력 후 로그인 버튼 클릭
6. handleSubmit 실행 → login(username, password) 호출
7. AuthProvider에서 state 업데이트:
   - setUser({ name, email })
   - setIsLoggedIn(true)
   - sessionStorage에 저장
8. navigate("/", { replace: true }) → URL "/"로 이동
9. ProtectedRoute에서 isLoggedIn 확인 → true
10. Index 페이지 렌더링 (대시보드)
```

---

## 18. 인증 시스템 상세 분석

### 데이터 흐름도

```
sessionStorage (브라우저 저장소)
  ↕ 읽기/쓰기
AuthProvider (Context)
  │
  ├─ isLoggedIn: boolean
  ├─ user: { name, email } | null
  ├─ login(): 로그인 실행 → state 업데이트 + sessionStorage 저장
  └─ logout(): 로그아웃 → state 초기화 + sessionStorage 삭제
  │
  ↓ useAuth() Hook으로 접근
  │
  ├── Login.tsx           → login() 호출
  ├── ERPLayout.tsx       → user 표시, logout() 호출
  └── ProtectedRoute      → isLoggedIn 확인
```

### sessionStorage vs localStorage

```
┌──────────────────┬────────────────────────┬──────────────────────┐
│                  │ sessionStorage (현재 사용)│ localStorage         │
├──────────────────┼────────────────────────┼──────────────────────┤
│ 유효 기간        │ 탭을 닫으면 삭제         │ 영구 (직접 삭제 전까지)│
│ 용도             │ 로그인 세션              │ 테마 설정             │
│ 보안             │ 탭 간 공유 안 됨         │ 모든 탭에서 공유       │
└──────────────────┴────────────────────────┴──────────────────────┘
```

> 이 프로젝트에서는:
> - **로그인 정보** → `sessionStorage` (탭 닫으면 로그아웃)
> - **테마 설정** → `localStorage` (영구 저장)

---

## 19. 테마 시스템 분석

### 동작 원리

```
1. ThemeProvider에서 theme state 관리 ("dark" | "light")
2. theme이 바뀌면 useEffect가 실행:
   - <html> 태그에 "dark" 클래스 추가/제거
3. index.css에서:
   - :root { --primary: 밝은 색 }        ← light 모드
   - .dark { --primary: 어두운 색 }       ← dark 모드
4. Tailwind가 CSS 변수를 참조:
   - bg-primary → hsl(var(--primary))
   → .dark이 있으면 어두운 값, 없으면 밝은 값이 자동 적용
```

### 테마 색상 커스터마이징

색상을 변경하려면 `src/index.css`의 CSS 변수만 수정하면 됩니다.

```css
:root {
  --primary: 185 72% 38%;        /* ← 이 값만 바꾸면 primary 색상 전체 변경 */
}
.dark {
  --primary: 185 72% 48%;        /* ← 다크 모드용 */
}
```

---

## 20. 레이아웃 시스템 분석

### ERPLayout 구조

```
ERPLayout
├── SidebarProvider              ← 사이드바 상태 관리 (열림/닫힘)
│   ├── ERPSidebar               ← 왼쪽 사이드바
│   └── 메인 영역
│       ├── header               ← 상단 바 (검색, 테마, 알림, 사용자)
│       │   ├── SidebarTrigger   ← 사이드바 토글 버튼 (☰)
│       │   ├── 검색 바
│       │   ├── 테마 토글 버튼
│       │   ├── 알림 벨 + 드롭다운
│       │   └── 사용자 아이콘 + 드롭다운
│       └── main                 ← {children} 이 여기에 표시됨
└── Settings Dialog              ← 설정 모달 (사이드바 밖에 위치)
```

### 사이드바의 호버 자동 열기/닫기

```tsx
// ERPSidebar.tsx
const handleMouseEnter = () => {
  if (collapsed) {                        // 접혀있을 때만
    hoverTimeoutRef.current = setTimeout(() => {
      toggleSidebar();                    // 200ms 후 열기
    }, 200);
  }
};

const handleMouseLeave = () => {
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current); // 타이머 취소
  }
  if (!collapsed) {
    toggleSidebar();                       // 접기
  }
};
```

---

## 21. 실전: 새 페이지 추가하기

**"품질관리 (Quality Control)" 페이지를 추가한다고 가정**

### Step 1: 페이지 파일 생성

```tsx
// src/pages/QualityControl.tsx
import ERPLayout from "@/components/erp/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QualityControl = () => {
  return (
    <ERPLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">品質管理</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            品質検査および不良管理
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold">検査一覧</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground">検査データがここに表示されます</p>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
};

export default QualityControl;
```

### Step 2: App.tsx에 라우트 추가

```tsx
// App.tsx
import QualityControl from "./pages/QualityControl";  // ← 추가

// Routes 안에 추가
<Route path="/production/quality" element={
  <ProtectedRoute><QualityControl /></ProtectedRoute>
} />
```

### Step 3: 사이드바에 메뉴 추가

```tsx
// ERPSidebar.tsx — production의 children 배열에 추가
{
  id: "production",
  label: "生産・製造",
  icon: Factory,
  path: "/production",
  children: [
    // ... 기존 항목들 ...
    { id: "prod-quality", label: "品質管理", icon: ClipboardCheck, path: "/production/quality" },
    //                                          ↑ lucide-react에서 import 필요
  ],
},
```

---

## 22. 실전: 새 컴포넌트 만들기

**재사용 가능한 "StatusBadge" 컴포넌트를 만든다고 가정**

```tsx
// src/components/erp/StatusBadge.tsx

import { Badge } from "@/components/ui/badge";

// 1. Props 타입 정의
interface StatusBadgeProps {
  status: string;
  statusMap: Record<string, { label: string; color: string }>;
}

// 2. 컴포넌트 구현
const StatusBadge = ({ status, statusMap }: StatusBadgeProps) => {
  const info = statusMap[status] || {
    label: status,
    color: "bg-muted text-muted-foreground"
  };

  return (
    <Badge className={`text-[10px] font-medium ${info.color}`}>
      {info.label}
    </Badge>
  );
};

export default StatusBadge;

// 3. 사용하는 쪽
// import StatusBadge from "@/components/erp/StatusBadge";
// <StatusBadge status="A01" statusMap={PROD_STATUS_MAP} />
```

---

## 23. 자주 하는 실수와 해결법

### 실수 1: State를 직접 수정

```tsx
// ❌ 이렇게 하면 화면이 안 바뀜!
const [items, setItems] = useState(["a", "b"]);
items.push("c");  // 직접 수정 → 리렌더링 안 됨

// ✅ 새 배열을 만들어야 함
setItems([...items, "c"]);           // 스프레드 + 추가
setItems(prev => [...prev, "c"]);    // 콜백 패턴 (더 안전)
```

### 실수 2: useEffect 무한 루프

```tsx
// ❌ 의존성 배열 없이 state를 변경하면 무한 루프!
useEffect(() => {
  setCount(count + 1);  // state 변경 → 리렌더링 → useEffect 다시 실행 → 무한!
});

// ✅ 의존성 배열을 정확히 지정
useEffect(() => {
  setCount(prev => prev + 1);
}, []);  // 빈 배열 = 처음 한 번만
```

### 실수 3: 리스트에 key 누락

```tsx
// ❌ 콘솔에 Warning 발생
{items.map(item => <div>{item.name}</div>)}

// ✅ 고유한 key 추가
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

### 실수 4: 이벤트 핸들러에서 즉시 실행

```tsx
// ❌ 렌더링 시 즉시 실행됨!
<button onClick={handleClick(id)}>클릭</button>

// ✅ 화살표 함수로 감싸기
<button onClick={() => handleClick(id)}>클릭</button>
```

### 실수 5: 비동기 State 업데이트 후 바로 접근

```tsx
// ❌ setCount 직후에 count는 아직 이전 값!
setCount(5);
console.log(count);  // 아직 이전 값 출력!

// ✅ useEffect로 변경 후 처리
useEffect(() => {
  console.log("count가 바뀜:", count);
}, [count]);
```

### 실수 6: 색상 하드코딩

```tsx
// ❌ 다크 모드에서 깨짐!
<div className="bg-white text-black">

// ✅ 시맨틱 토큰 사용
<div className="bg-card text-foreground">
```

---

## 24. 부록: 유용한 패턴 모음

### 패턴 1: 필터링 + 페이지네이션 (SlipListPage.tsx 패턴)

```tsx
const [filter, setFilter] = useState("all");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

// 1. 필터 적용
const filtered = allData.filter(item => {
  if (filter !== "all" && item.type !== filter) return false;
  return true;
});

// 2. 페이지네이션 적용
const totalPages = Math.ceil(filtered.length / itemsPerPage);
const paged = filtered.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

// 3. 필터 변경 시 1페이지로 리셋
const handleFilterChange = (value: string) => {
  setFilter(value);
  setCurrentPage(1);  // ← 중요!
};
```

### 패턴 2: 폼 State 관리 (객체 하나로)

```tsx
const [form, setForm] = useState({
  name: "",
  email: "",
  department: "",
});

// 하나의 핸들러로 모든 필드 처리
const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm(prev => ({ ...prev, [field]: e.target.value }));
};

<Input value={form.name} onChange={handleChange("name")} />
<Input value={form.email} onChange={handleChange("email")} />
```

### 패턴 3: 드롭다운/패널 외부 클릭 닫기

```tsx
const [open, setOpen] = useState(false);
const panelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  if (open) document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, [open]);

return (
  <div ref={panelRef}>
    <button onClick={() => setOpen(v => !v)}>열기</button>
    {open && <div>패널 내용</div>}
  </div>
);
```

### 패턴 4: 숫자 포맷팅 (일본 엔화)

```tsx
// 통화 포맷
const formatted = `¥${amount.toLocaleString()}`;
// 68750000 → "¥68,750,000"

// 퍼센트
const percent = `${(rate * 100).toFixed(1)}%`;
```

### 패턴 5: 날짜 포맷팅 (date-fns)

```tsx
import { format } from "date-fns";

format(new Date(), "yyyy/MM/dd");      // "2024/03/07"
format(new Date(), "yyyy-MM-dd");       // "2024-03-07"
new Date().toLocaleString("ja-JP");     // "2024/3/7 14:30:00"
```

### 패턴 6: 상태 코드 매핑

```tsx
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "作成中", color: "bg-muted text-muted-foreground" },
  A01: { label: "承認済", color: "bg-success/20 text-success" },
};

// 사용
const info = STATUS_MAP[statusCode] || { label: "不明", color: "bg-muted text-muted-foreground" };
<Badge className={info.color}>{info.label}</Badge>
```

---

## 빠른 참조 카드

### import 경로 규칙

```tsx
import Something from "@/components/erp/Something";  // @/ = src/ 폴더
import { Button } from "@/components/ui/button";      // shadcn 컴포넌트
import { useAuth } from "@/hooks/use-auth";           // 커스텀 Hook
import { cn } from "@/lib/utils";                     // 유틸리티
import { Factory } from "lucide-react";               // 아이콘
import { format } from "date-fns";                    // 날짜 라이브러리
import { useNavigate } from "react-router-dom";       // 라우터
```

### 컴포넌트 작성 템플릿

```tsx
// src/components/erp/MyComponent.tsx

import { useState } from "react";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const [value, setValue] = useState("");

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {/* 내용 */}
    </div>
  );
};

export default MyComponent;
```

### 페이지 작성 템플릿

```tsx
// src/pages/MyPage.tsx

import ERPLayout from "@/components/erp/ERPLayout";

const MyPage = () => {
  return (
    <ERPLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">ページタイトル</h1>
          <p className="text-xs text-muted-foreground mt-0.5">説明文</p>
        </div>
        {/* 페이지 내용 */}
      </div>
    </ERPLayout>
  );
};

export default MyPage;
```

---

> **이 문서를 다 읽었다면**, 프로젝트의 어떤 파일이든 열어서 코드를 이해할 수 있을 것입니다.  
> 모르는 것이 나오면 해당 섹션을 다시 찾아보세요. 실전에서 반복적으로 보다 보면 자연스럽게 익숙해집니다.
