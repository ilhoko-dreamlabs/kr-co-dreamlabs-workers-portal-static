# Portal v2 wireframes

## Desktop — home

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ DREAMLABS WORKERS     Workers  WorkerOps  Ecosystem  Learn   [Worker 찾기] │
├────────────────────────────────────────────────────────────────────────────┤
│ WORKER PORTAL                                                              │
│ 어디로 가야 할지 바로 찾는 Worker Portal                                   │
│ 역할별 Worker, 운영 서비스와 사용 자료를 한곳에서 연결합니다.               │
│ [Worker 찾기]  [WorkerOps 이해하기]             [Worker ecosystem diagram] │
├────────────────────────────────────────────────────────────────────────────┤
│ 빠른 시작                                                                  │
│ [Workers]       [Worker Meet]       [Manual]         [DreamLabs Assets]     │
├────────────────────────────────────────────────────────────────────────────┤
│ Worker 찾기                                             [모든 Worker 보기] │
│ [ 이름·역할·업무 검색________________________________ ] [역할] [접근]     │
│                                                                            │
│ [Worker card]             [Worker card]             [Worker card]          │
│ 목적 · 대상 · 접근표시    목적 · 대상 · 접근표시    목적 · 대상 · 접근표시 │
│ [열기] [가이드]           [열기] [가이드]           [열기] [가이드]        │
├────────────────────────────────────────────────────────────────────────────┤
│ WorkerOps ecosystem                                                        │
│ [Worker Host] ─ [Gateway] ─ [Worker Meet]         [왜 WorkerOps인가]       │
│       └──────── Manual · Assets ─────────┘          [운영 장면 보기]        │
│ Connected systems: [HR System · 조직/역할 정보]                             │
├────────────────────────────────────────────────────────────────────────────┤
│ 무엇을 하려 하나요?                                                        │
│ 업무 실행 | 회의/협업 | 사용법 | 자산 찾기 | 제품/구조 이해                │
├────────────────────────────────────────────────────────────────────────────┤
│ Portal은 공개 정적 디렉터리입니다. 연결된 서비스는 로그인이 필요할 수 있음 │
│ Link review date · Portal source revision · About                          │
└────────────────────────────────────────────────────────────────────────────┘
```

## Desktop — Worker directory

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Workers                                                                    │
│ 역할과 업무로 찾고, 접근 방식을 확인한 뒤 Worker를 엽니다.                  │
│ [검색________________________________________]                              │
│ [전체] [Development] [Sales] [Support]     [로그인] [접근 제어]            │
├────────────────────────────────────────────────────────────────────────────┤
│ 8개 결과                                                                   │
│ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐       │
│ │ Worker name [LOGIN]│ │ Worker name [AUTH] │ │ Worker name [AUTH] │       │
│ │ purpose            │ │ purpose            │ │ purpose            │       │
│ │ audience · review  │ │ audience · review  │ │ audience · review  │       │
│ │ [열기] [가이드]    │ │ [열기] [가이드]    │ │ [열기] [가이드]    │       │
│ └────────────────────┘ └────────────────────┘ └────────────────────┘       │
├────────────────────────────────────────────────────────────────────────────┤
│ 원하는 Worker가 없나요?  [Worker Host 이해하기] [Manual에서 찾기]          │
└────────────────────────────────────────────────────────────────────────────┘
```

## Mobile — home

```text
┌──────────────────────────────┐
│ DREAMLABS WORKERS       [☰]  │
├──────────────────────────────┤
│ WORKER PORTAL                │
│ 어디로 가야 할지            │
│ 바로 찾는 Worker Portal      │
│ [Worker 찾기              ]  │
│ [WorkerOps 이해하기       ]  │
├──────────────────────────────┤
│ 빠른 시작                   │
│ [Workers]      [Meet]        │
│ [Manual]       [Assets]      │
├──────────────────────────────┤
│ Worker 찾기                  │
│ [검색____________________]   │
│ [전체][개발][영업][지원] →   │
│ ┌──────────────────────────┐ │
│ │ Worker name      [LOGIN] │ │
│ │ 한 줄 목적               │ │
│ │ [열기]        [가이드]   │ │
│ └──────────────────────────┘ │
│ [모든 Worker 보기]           │
├──────────────────────────────┤
│ WorkerOps ecosystem          │
│ 1. Worker Host               │
│ 2. Worker Gateway            │
│ 3. Worker Meet               │
│ 4. Manual / Assets           │
│ Connected: HR System         │
├──────────────────────────────┤
│ 공개 정적 Portal · 접근 안내 │
└──────────────────────────────┘
```

## Empty and failure states

| State | Message | Recovery |
|---|---|---|
| no search results | `조건에 맞는 Worker를 찾지 못했습니다.` | clear filters, open Manual |
| directory load failure | `링크 목록을 불러오지 못했습니다.` | static quick links remain visible, retry button |
| catalog stale | `링크 검토일이 지났습니다.` | no health implication; show review date |
| item unavailable | `현재 Portal에서 이 링크를 제공하지 않습니다.` | open ecosystem explanation or support guide |
| 404 | `찾는 Portal 페이지가 없습니다.` | Workers, WorkerOps, Learn shortcuts |

## Visual state language

- blue: primary navigation/action;
- cyan: guide/reference resource;
- amber: sign-in or access attention;
- gray: explanation-only or owner-review;
- red: only an actual Portal validation failure, never an assumed Worker state.
