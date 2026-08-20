import { INITIAL_CANDIDATES, type Candidate } from "@/lib/candidates";
import type { StageId } from "@/lib/stages";

// 페이지(page.tsx)와 API 라우트가 dev 모드(Turbopack)에서 서로 다른 모듈
// 인스턴스로 번들링돼 모듈 스코프 변수로는 상태가 공유되지 않는다.
// globalThis에 저장해 재평가되어도 같은 저장소를 참조하도록 한다.
declare global {
  var __candidateStore: Candidate[] | undefined;
}

function getStore(): Candidate[] {
  globalThis.__candidateStore ??= INITIAL_CANDIDATES.map((candidate) => ({
    ...candidate,
  }));
  return globalThis.__candidateStore;
}

export function getCandidates(): Candidate[] {
  return getStore().map((candidate) => ({ ...candidate }));
}

export function updateCandidateStage(
  id: string,
  stageId: StageId,
): Candidate | null {
  const candidate = getStore().find((item) => item.id === id);
  if (!candidate) return null;

  candidate.stageId = stageId;
  return { ...candidate };
}
