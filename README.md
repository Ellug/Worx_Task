# 채용 파이프라인 보드

채용 담당자가 지원자를 채용 단계별로 관리하는 보드입니다.
단계는 `서류검토 - 면접 - 처우협의 - 최종합격 / 불합격` 순이며, 지원자 카드를 단계 간 이동하며 관리합니다.
실제 백엔드는 없고, mock API(또는 로컬 mock 서버)를 통해 데이터를 읽고 씁니다.

## 스택

- Next.js (App Router) / React / TypeScript
- Tailwind CSS

## 설치 및 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

## 배포

[https://worx-task.vercel.app/](https://worx-task.vercel.app/)

## 프로젝트 문서

- 필수 문서
  - [PROMPTS.md](./PROMPTS.md): 기능 단위 AI 프롬프트와 리뷰/검증 기록
  - [DECISIONS.md](./DECISIONS.md): 설계 결정 기록

- 작업 컨벤션 정의 문서
  - [CONVENTION.md](./CONVENTION.md): 커밋 메시지 규칙 및 작업 진행 방식