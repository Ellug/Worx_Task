import type { Candidate } from "./candidates";
import { ORDER_GAP } from "./candidates";

// beforeOrder와 afterOrder 사이에 끼워 넣을 새 order를 계산한다.
// 두 값의 중간을 더 이상 정밀하게 표현할 수 없으면(충돌) null을 반환한다.
// 서버(candidate-store)와 클라이언트(Board의 낙관적 업데이트)가 동일한 로직을 공유한다.
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

// fromIndex에서 direction 방향으로 훑어, 아직 이동 중(movingIds)이 아닌 첫 카드의
// id를 반환한다. 이동 중인 카드는 서버에 자기 자신의 위치가 아직 확정되지 않은
// 상태라, beforeId/afterId 기준점으로 참조하면 서버가 그 카드의 예전 순서값을
// 기준으로 계산해버려 엉뚱한 위치에 꽂힐 수 있다. 드래그앤드롭(Column)과 키보드
// 이동(useBoardKeyboardControls)이 "컬럼 끝에 삽입" 계산에 동일하게 사용한다.
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
