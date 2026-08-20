# PROMPTS.md

작성 규칙은 [CONVENTION.md](./CONVENTION.md) 참고.

## [base] 문서 규칙 수립

### 프롬프트 1 (CLAUDE CODE)
```
지원자 채용 파이프라인 보드를 만들거야.
서류검토 - 면접 - 처우협의 - 최종합격 / 불합격 순이고, 지원자 카드를 단계간 이동하며 관리할거야
데이터가 제공되는 mock API(또는 로컬 mock 서버)를 통해 읽고 쓸 건데 실제 백엔드는 없어.

진행 방식은 기능 단위로 구현하고 커밋하는 방식이야. 요구사항을 기능 단위로 쪼개 점진적으로 커밋할거야. 커밋 히스토리를 남겨야해.
커밋 메시지 컨벤션은
feat(stage-move): 카드 단계 이동 + mock API 저장
- 드래그 대신 액션 버튼 방식 선택
- AI 초안은 로컬 상태만 갱신 -> API persist 누락, 직접 보완

type(scope): 요약 + 본문에 무엇을 왜
type은 feat/fix/refactor/test/docs/chore 형태로
커밋 메시지에 AI 초안을 어떻게 손봤는지 포함시키면 좋아

이걸 기본으로 일단 CONVENTION.md 를 만들어서 작업 기준으로 삼아

PROMPTS.md
프롬프트와 그에 대한 리뷰(검증)을 모두 md 파일로 남길거야. 기능 단위와 같은 순서로 정리해서 커밋과 기록이 1:1로 대응되게 정리할거야

## [stage-move] 카드 단계 이동

### 프롬프트 1
(AI에 준 지시 - 요약 아닌 실제 문구)

### AI 출력 요지
(무엇을 내놓았나)

### 리뷰 / 검증
- 무엇이 문제였나 (틀림, 비효율, 요구 누락)
- 어떻게 알아챘나 (직접 재현, 테스트, 정독)
- 그대로 채택 / 수정 / 기각 -> 어떤 판단을 왜 했나
- 수정했다면 어떻게 고쳤나

이런 형태로 고칠건데, 매 요청시 너가 갱신 가능한 부분은 갱신하고, 내가 직접 입력해야하는 부분은 간단 정리 혹은 공란으로 놔둬

DECISIONS.md 설계 결정 기록 문서도 관리할거야
상태 관리 방식, 낙관적 업데이트 롤백 전략, 폴더 구조, 라이브러리 선택 등 주요 결정 3~5개
AI 제안 중 채택/기각한 것과 이유. 못 끝낸 기능과 그 이유

설계 결정을 기록하는 곳이니 매 설계가 결정될 때마다 초안만 작성해
초안을 기반으로 내가 추가로 수정할테니

동작하는 코드 + README.md (설치 실행 명령 1~2줄, 선택한 스택 mockAPI방식 명시)
PROMPTS.md, DECISIONS.md 를 repo 최상단에 배치할거야
배포링크를 README에 추후에 추가할거야

우선 이걸 위한 베이스 작업을 진행할거야
기능은 아직 구현하지 말고 md문서와 규칙부터 기본적으로 수렴해
기능 구현은 내가 단위별로 명령할거야
```

### AI 출력 요지
- CONVENTION.md(커밋 컨벤션), PROMPTS.md(프롬프트-리뷰 기록 템플릿), DECISIONS.md(설계 결정 기록 틀) 신규 작성
- README.md를 create-next-app 기본 안내에서 프로젝트 소개 + 설치/실행 + 문서 링크로 교체
- `docs(base)` 커밋으로 반영

### 리뷰 / 검증
- PROMPTS.md에 "작성 규칙" 절을 그대로 넣어, 컨벤션(규칙) 성격의 내용이 기록용 문서에 섞임. 또한 사용자가 실제로 준 최초 지시 원문이 PROMPTS.md에 기록되지 않음
- 생성 된 문서 정독
- 작성 규칙은 CONVENTION.md 소관이 맞고, PROMPTS.md는 프롬프트-리뷰 기록 전용으로 유지하는 게 문서 역할 분리에 맞기에 수정 결정
- PROMPTS.md의 "작성 규칙" 절을 삭제하고 CONVENTION.md에 "PROMPTS.md 작성 규칙" 절로 이동, PROMPTS.md [base] 섹션에 최초 프롬프트 원문을 프롬프트 1로 추가


### 프롬프트 2 (CLAUDE CODE)
> PROMPTS.md에 내 최초 명령을 기재해
> 현재 PROMPTS.md에 정리돼있는 작성규칙은 컨벤션 md로 이동시켜

### AI 출력 요지
- PROMPTS.md의 "작성 규칙" 절을 삭제하고 CONVENTION.md에 "PROMPTS.md 작성 규칙" 절로 이동
- PROMPTS.md에 [base] 섹션을 추가하고, 최초 요구사항(프롬프트 1)과 이번 지시(프롬프트 2)를 실제 문구 그대로 기록

### 리뷰 / 검증
- 템플릿의 불필요한 문구 포함.
- 문서 정독.
- 템플릿은 가독성을 해치기 때문에 직접 수정

### 프롬프트 3 (CLAUDE CODE)
> 템플릿의 문구를 그대로 쓰지 마. 들어갈 내용의 지침이잖아. 내가 수정한 부분을 따라.
> PROMPTS와 DECISIONS는 최종 내용만 남아야 하기 때문에
> 템플릿을 포함한 안내 내용은 모두 CONVENTION.md로 이관해

### AI 출력 요지
- CONVENTION.md의 "PROMPTS.md 작성 규칙" / "DECISIONS.md 작성 규칙" 절에 각 문서의 목적 설명과 항목 템플릿을 옮기고, 템플릿은 그대로 옮겨 적는 문구가 아니라 지침이라는 점을 명시
- PROMPTS.md에서 안내 문단과 "항목 템플릿" 절을 삭제하고 CONVENTION.md 링크만 남김
- DECISIONS.md에서 안내 문단과 결정 항목 템플릿을 삭제하고 CONVENTION.md 링크만 남김, 프로젝트 고유 내용(다루어야 할 주요 결정 체크리스트 등)은 유지

### 리뷰 / 검증
- 기본적인 문서 컨벤션 형태 확인. 현상 유지.


### 프롬프트 4 (CODEX)
> 현재 디렉토리의 [CONVENTION.md](CONVENTION.md) [DECISIONS.md](DECISIONS.md) [PROMPTS.md](PROMPTS.md) 와 프로젝트 구조를 우선 파악해
> 콜르도와 병렬작업을 진행할 준비만 할거야. 코드의 작성은 하지말고 파악해서 메모리에만 올려서 작업 준비 상태만 만들어놔

### AI 출력 요지
- 코드 변경 없이 현재 구조 조회 완료

### 리뷰 / 검증
- 변경 없음

## [board-layout] 보드/컬럼 기본 구조

### 프롬프트 1 (CLAUDE CODE)
> 기능 구현을 시작할거야
> 지원자 카드를 단계별로 이동하기 위한 베이스인 보드와 컬럼을 메인 페이지상에 구현할거야.
> 컴포넌트 단위로 설계해서 적용해.
> 여기에 들어갈 카드가 후에 구현될 예정인 걸 고려해서 최초 구현 진행해

### AI 출력 요지
- `src/lib/stages.ts`: 단계 정의(서류검토/면접/처우협의/최종합격/불합격) + `Stage` 타입 신규 작성
- `src/components/board/Column.tsx`: 단계별 컬럼 컴포넌트. `children`(카드)이 없으면 빈 상태 문구를 보여주고, `children` 개수로 카운트 배지를 자동 계산해 추후 카드 컴포넌트를 children으로 넣기만 하면 되도록 설계
- `src/components/board/Board.tsx`: `STAGES`를 순회하며 `Column`을 가로 스크롤 레이아웃으로 렌더링
- `src/app/page.tsx`, `src/app/layout.tsx`: 메인 페이지에 Board 배치, 보드가 뷰포트를 채우도록 레이아웃/메타데이터 조정
- `npm run lint`·`tsc --noEmit` 통과 확인, dev 서버 기동 후 Playwright로 스크린샷 검증(5개 컬럼과 빈 상태 문구 정상 렌더링, 콘솔 에러 없음)

### 리뷰 / 검증
- 기본적인 UI 구조와 컴포넌트 책임 분리 정상 적용 확인

## [candidate-card] 지원자 카드 컴포넌트

### 프롬프트 1 (CLAUDE CODE)
> 카드 컴포넌트 작성을 진행해. 카드에는 이름, 직무, 지원일, 현재 단계가 표시되도록 작성해

### AI 출력 요지
- `src/lib/candidates.ts`: `Candidate` 타입(이름/직무/지원일/현재 단계) 신규 작성 + 화면 확인용 임시 샘플 데이터(`SAMPLE_CANDIDATES`) 6건 추가 (mock API 방식이 정해지기 전까지 로컬 데이터로만 사용)
- `src/components/board/CandidateCard.tsx`: 이름, 직무, 지원일, 현재 단계(색상 배지)를 표시하는 카드 컴포넌트 신규 작성
- `src/lib/stages.ts`: Column에 있던 단계별 색상 매핑을 `STAGE_DOT_TONE_CLASSNAME`/`STAGE_BADGE_TONE_CLASSNAME`으로 옮겨 Column과 CandidateCard가 함께 재사용하도록 정리
- `src/components/board/Board.tsx`: `candidates` prop을 받아 단계별로 필터링해 각 Column의 children으로 CandidateCard를 렌더링
- `src/app/page.tsx`: `SAMPLE_CANDIDATES`를 Board에 전달해 실제 카드가 보이도록 연결
- `npm run lint`·`tsc --noEmit` 통과 확인, dev 서버 기동 후 Playwright로 스크린샷 검증(카드별 이름/직무/지원일/단계 배지 정상 렌더링, 컬럼 카운트 배지 자동 반영 확인)

### 리뷰 / 검증
- 카드 UI 요구사항 표시 확인

## [stage-move] 카드 단계 이동 (드래그앤드롭 + mock API 저장 + 낙관적 업데이트)

### 프롬프트 1 (CLAUDE CODE)
> 카드를 드래그앤 드롭으로 단계를 이동할 수 있고, 이동한 데이터를 mock API에 저장해서 새로고침 후에도 유지하도록 해.
> 여기서 낙관적 업데이트 적용이 필요해. 이동시 UI를 먼저 반영하고, API 실패시 원상복구 + 사용자 피드백을 주도록 설정해.
> 지연 및 실패 시뮬레이션에 대한 건 개발 완료후에 진행할테니 기능 구현만 진행해

### AI 출력 요지
- Mock API: `src/app/api/candidates/[id]/route.ts` (PATCH)로 단계 변경을 저장, 상태는 `src/lib/server/candidate-store.ts`에 보관
- 드래그앤드롭: 네이티브 HTML5 DnD(draggable + dragstart/dragover/drop)로 구현, 별도 라이브러리 미도입
- 상태 관리: Board(client component)가 candidates 배열을 useState로 소유, page.tsx(Server Component)는 초기 데이터만 store에서 직접 읽어 전달
- 낙관적 업데이트: 드롭 즉시 로컬 state 변경 → PATCH 요청 → 실패 시 이동 전 단계로 롤백 + ErrorToast로 대상자 이름과 실패 사실 안내(자동 닫힘/수동 닫기 모두 지원)
- 이동 중인 카드는 draggable 비활성화 + "저장 중…" 표시로 같은 카드 중복 드래그 방지
- `npm run lint`·`tsc --noEmit` 통과 확인, 정상 이동 후 새로고침해도 유지되는지 검증 완료.

### 리뷰 / 검증
- 정상 작동 확인.
- 현재 md 문서에 지나치게 불필요한 정보를 클로드가 직접 작성하는 이슈가 확인 됨. 하지만 남은 시간을 고려해 이 이상 컨벤션을 수정하지 않고 우선 기능 개발 속행.

## [board-filter] 보드 필터 UI (이름 검색 + 직무 체크박스)

### 프롬프트 1 (CLAUDE CODE)
> 보드 위쪽에 필터 기능을 만들거야
> 우선 필터 UI를 구성해
> 컨테이너 컴포넌트 먼저 정의하고, 내부에 이름 검색 역할을 검색창과, 직무별 필터를 위한 체크박스를 구현할거야
>
> 인풋창, 체크박스에 대한 필터를 공통처리해야하니 로직을 외부로 빼는 게 좋다고 생각하는데
> 이런 구조가 데이터가 200~1000건 이상인 경우에 대응하기에 지연 없이 동작하도록 구성하기 적합한지 우선 판단하고, 적합한 구조면 진행해
> 부적합하다 판단하면 이유랑 근거, 대안을 나한테 제시하고

### AI 출력 요지
- 구조 판단: 필터 로직(이름 검색 + 직무 체크박스)을 컴포넌트 밖 커스텀 훅으로 분리하는 방향은 200~1000건 규모에 적합하다고 판단. 근거: 필터 predicate 자체가 O(n)이라 N=1000, 1000회 반복 벤치마크에서 1회당 평균 0.055ms로 연산 비용이 사실상 무시할 수준(node -e 벤치마크로 직접 측정), 진짜 병목은 필터링이 아니라 리렌더링이라 `useMemo`로 파생 리스트를 감싸고 검색어에 `useDeferredValue`를 적용하면 됨. 가상화는 이번 규모에선 불필요.
- `src/hooks/useCandidateFilter.ts`: candidates 배열을 받아 nameQuery/selectedPositions state, 직무 목록(allPositions), 파생된 filteredCandidates(useMemo)를 반환하는 훅으로 필터 로직을 UI와 분리
- `src/components/board/FilterBar.tsx`: 이름 검색 input(`type="search"`)과 직무별 체크박스(`fieldset`)를 담은 컨테이너 컴포넌트, 상태는 상위(Board)에서 controlled로 주입
- `src/components/board/Board.tsx`: useCandidateFilter를 사용해 FilterBar를 보드 상단에 배치하고, 컬럼에는 filteredCandidates만 전달 (카운트 배지도 필터 결과에 자동 반영)
- `npm run lint`·`tsc --noEmit` 통과 확인, Playwright로 이름 검색(6건→1건)과 직무 체크박스(6건→2건, 대상자 이름까지) 필터링이 정확히 동작하는지 직접 검증

### 리뷰 / 검증
- 필터 정상 작동 확인
- 데이터가 많은 상태에서의 검증은 기능완성 이후 추후 예정
