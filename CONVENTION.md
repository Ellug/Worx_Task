# CONVENTION.md

이 프로젝트의 커밋/작업 진행 방식을 정의합니다.

## 진행 방식

- 요구사항을 기능 단위로 쪼개서 점진적으로 구현하고, 기능 단위마다 커밋한다.
- 커밋 히스토리 자체가 작업 기록이 되도록 유지한다 (스쿼시/리라이트 지양).
- 커밋 1개는 [PROMPTS.md](./PROMPTS.md)의 섹션 1개와 1:1로 대응된다.

## 커밋 메시지 형식

```
type(scope): 요약

- 무엇을 했는지 / 왜 그렇게 했는지
- AI 초안을 어떻게 검토·보완했는지 (그대로 채택했다면 그 사실도 명시)
```

### type

| type | 의미 |
| --- | --- |
| feat | 새로운 기능 |
| fix | 버그 수정 |
| refactor | 동작 변경 없는 코드 개선 |
| test | 테스트 추가/수정 |
| docs | 문서 변경 |
| chore | 빌드/설정/의존성 등 잡무 |

### scope

기능 단위 식별자. [PROMPTS.md](./PROMPTS.md)의 섹션 제목 `## [scope] 기능 설명` 과 동일한 값을 사용해서,
커밋과 프롬프트 기록이 1:1로 대응되게 한다.

예: `stage-move`, `candidate-card`, `mock-api`

### 본문 규칙

- "무엇을 왜" 했는지 남긴다.
- AI가 만든 초안을 그대로 썼는지, 어떤 부분을 검토해서 고쳤는지 최소 한 줄은 남긴다.

### 예시

```
feat(stage-move): 카드 단계 이동 + mock API 저장

- 드래그 대신 액션 버튼 방식 선택
- AI 초안은 로컬 상태만 갱신 -> API persist 누락, 직접 보완
```

## 커밋 단위 기준

- 하나의 커밋은 하나의 scope(기능)에 대응한다.
- 문서 정비(CONVENTION/PROMPTS/DECISIONS/README)는 `docs` 또는 `chore`로 별도 커밋한다.
- 여러 기능을 한 커밋에 섞지 않는다.

## 연관 문서

- [PROMPTS.md](./PROMPTS.md): 기능별 프롬프트와 리뷰/검증 기록 (커밋과 1:1 대응)
- [DECISIONS.md](./DECISIONS.md): 설계 결정 기록
- [README.md](./README.md): 실행 방법 및 스택 안내
