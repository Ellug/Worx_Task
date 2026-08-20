import { INITIAL_CANDIDATES, ORDER_GAP, type Candidate } from "@/lib/candidates";
import type { StageId } from "@/lib/stages";

// 페이지(page.tsx)와 API 라우트가 dev 모드(Turbopack)에서 서로 다른 모듈
// 인스턴스로 번들링돼 모듈 스코프 변수로는 상태가 공유되지 않는다.
// globalThis에 저장해 재평가되어도 같은 저장소를 참조하도록 한다.
declare global {
    var __candidateStore: Candidate[] | undefined;
}

// 스토어가 처음 초기화될 때, 시드 데이터의 기존 순서("이전 값")를 기준으로
// 스테이지별 order를 깔끔한 간격으로 재배정한다. 장기간 운영되며 잦은 이동으로
// order 값이 점점 촘촘한 소수가 되는 걸 매 부팅 시점마다 리셋하는 효과가 있다.
function normalizeOrders(candidates: Candidate[]): void {
    const byStage = new Map<StageId, Candidate[]>();

    for (const candidate of candidates) {
        const bucket = byStage.get(candidate.stageId);
        if (bucket) {
            bucket.push(candidate);
        } else {
            byStage.set(candidate.stageId, [candidate]);
        }
    }

    for (const bucket of byStage.values()) {
        bucket
            .sort((a, b) => a.order - b.order)
            .forEach((candidate, index) => {
                candidate.order = (index + 1) * ORDER_GAP;
            });
    }
}

// 특정 스테이지 하나만 현재 order 기준으로 재정렬한다. 두 이웃 사이 간격이
// 부동소수점 정밀도 한계에 닿아 더 이상 중간값을 계산할 수 없을 때(충돌) 호출된다.
function rebalanceStage(candidates: Candidate[], stageId: StageId): void {
    candidates
        .filter((candidate) => candidate.stageId === stageId)
        .sort((a, b) => a.order - b.order)
        .forEach((candidate, index) => {
            candidate.order = (index + 1) * ORDER_GAP;
        });
}

// beforeOrder와 afterOrder 사이에 끼워 넣을 새 order를 계산한다.
// 두 값의 중간을 더 이상 정밀하게 표현할 수 없으면(충돌) null을 반환해
// 호출부가 재정렬 후 재계산하도록 한다.
function computeOrderBetween(
    beforeOrder: number | null,
    afterOrder: number | null,
): number | null {
    if (beforeOrder === null && afterOrder === null) {
        return ORDER_GAP;
    }

    if (beforeOrder === null) {
        const candidate = afterOrder! / 2;
        return candidate > 0 && candidate < afterOrder! ? candidate : null;
    }

    if (afterOrder === null) {
        return beforeOrder + ORDER_GAP;
    }

    const mid = (beforeOrder + afterOrder) / 2;
    return mid > beforeOrder && mid < afterOrder ? mid : null;
}

function getStore(): Candidate[] {
    if (
        !globalThis.__candidateStore ||
        globalThis.__candidateStore.length !== INITIAL_CANDIDATES.length
    ) {
        globalThis.__candidateStore = INITIAL_CANDIDATES.map((candidate) => ({
            ...candidate,
            skills: [...candidate.skills],
        }));
        normalizeOrders(globalThis.__candidateStore);
    }

    return globalThis.__candidateStore;
}

export function getCandidates(): Candidate[] {
    return [...getStore()]
        .sort((a, b) => a.order - b.order)
        .map((candidate) => ({ ...candidate, skills: [...candidate.skills] }));
}

// candidateId를 stageId 컬럼의 beforeId/afterId 사이(둘 중 하나 또는 둘 다
// null이면 각각 컬럼의 시작/끝/전체)로 옮긴다. beforeId/afterId가 가리키는
// 카드가 없으면(오래된 참조 등) 해당 경계를 null로 취급해 안전하게 처리한다.
export function reorderCandidate(
    id: string,
    stageId: StageId,
    beforeId: string | null,
    afterId: string | null,
): Candidate | null {
    const store = getStore();
    const candidate = store.find((item) => item.id === id);
    if (!candidate) return null;

    const before = beforeId
        ? (store.find((item) => item.id === beforeId) ?? null)
        : null;
    const after = afterId
        ? (store.find((item) => item.id === afterId) ?? null)
        : null;

    let newOrder = computeOrderBetween(before?.order ?? null, after?.order ?? null);

    if (newOrder === null) {
        rebalanceStage(store, stageId);
        const freshBefore = beforeId
            ? (store.find((item) => item.id === beforeId) ?? null)
            : null;
        const freshAfter = afterId
            ? (store.find((item) => item.id === afterId) ?? null)
            : null;
        newOrder =
            computeOrderBetween(freshBefore?.order ?? null, freshAfter?.order ?? null) ??
            ORDER_GAP;
    }

    candidate.stageId = stageId;
    candidate.order = newOrder;
    return { ...candidate, skills: [...candidate.skills] };
}
