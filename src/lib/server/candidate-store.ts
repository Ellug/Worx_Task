import { INITIAL_CANDIDATES, ORDER_GAP, type Candidate } from "@/lib/candidates";
import { computeOrderBetween } from "@/lib/order";
import type { StageId } from "@/lib/stages";

declare global {
    var __candidateStore: Candidate[] | undefined;
}

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

function rebalanceStage(candidates: Candidate[], stageId: StageId): void {
    candidates
        .filter((candidate) => candidate.stageId === stageId)
        .sort((a, b) => a.order - b.order)
        .forEach((candidate, index) => {
            candidate.order = (index + 1) * ORDER_GAP;
        });
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
