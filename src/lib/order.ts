import type { Candidate } from "./candidates";
import { ORDER_GAP } from "./candidates";

// 두 이웃의 order 중간값을 계산한다. 소수점이 소진돼 더 못 쪼개면 null(충돌).
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

// fromIndex부터 direction 방향으로 훑어, 이동 중이 아닌 첫 카드를 기준점으로 찾는다.
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

// targetOrder가 들어갈 자리의 앞/뒤 이웃 id를 찾는다(undo가 옛 위치를 복원할 때 사용).
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
