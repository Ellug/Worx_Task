import type { Candidate } from "./candidates";
import { ORDER_GAP } from "./candidates";

export function computeOrderBetween(
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

export function findStableNeighborId(
    candidates: Candidate[],
    movingIds: Set<string>,
    fromIndex: number,
    direction: 1 | -1,
): string | null {
    for (let i = fromIndex; i >= 0 && i < candidates.length; i += direction) {
        if (!movingIds.has(candidates[i].id)) {
            return candidates[i].id;
        }
    }
    return null;
}

export function findNeighborsForOrder(
    candidates: Candidate[],
    targetOrder: number,
    movingIds: Set<string>,
): { beforeId: string | null; afterId: string | null } {
    let beforeId: string | null = null;
    let afterId: string | null = null;

    for (const candidate of candidates) {
        if (movingIds.has(candidate.id)) continue;
        if (candidate.order <= targetOrder) {
            beforeId = candidate.id;
        } else {
            afterId = candidate.id;
            break;
        }
    }

    return { beforeId, afterId };
}
