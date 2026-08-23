import { INITIAL_CANDIDATES, ORDER_GAP, type Candidate } from "@/lib/candidates";
import { computeOrderBetween } from "@/lib/order";
import type { StageId } from "@/lib/stages";

// Turbopack이 모듈을 여러 번 재평가해도 살아남는 싱글톤 저장소.
declare global {
    var __candidateStore: Candidate[] | undefined;
}

// 스테이지별로 order를 깔끔한 간격(ORDER_GAP 배수)으로 재배정한다.
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

// 특정 스테이지 하나만 order 충돌 시 재배정한다.
function rebalanceStage(candidates: Candidate[], stageId: StageId): void {
    candidates
        .filter((candidate) => candidate.stageId === stageId)
        .sort((a, b) => a.order - b.order)
        .forEach((candidate, index) => {
            candidate.order = (index + 1) * ORDER_GAP;
        });
}

// 부팅 시 한 번만 시드 데이터로 초기화하고 이후엔 그대로 재사용한다.
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

// 카드를 새 스테이지/순서로 옮긴다. order 충돌 시 그 스테이지만 재배정 후 재계산한다.
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
