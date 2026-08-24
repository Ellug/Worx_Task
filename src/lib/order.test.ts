import { describe, expect, it } from "vitest";
import type { Candidate } from "./candidates";
import { ORDER_GAP } from "./candidates";
import {
    computeOrderBetween,
    findNeighborsForOrder,
    findStableNeighborId,
} from "./order";

// 테스트에 필요한 필드(id, order)만 채운 가짜 카드. 나머지는 이 로직이 보지 않는다.
function card(id: string, order: number): Candidate {
    return { id, order } as Candidate;
}

describe("computeOrderBetween", () => {
    it("두 이웃 사이의 중간값을 반환한다", () => {
        expect(computeOrderBetween(1000, 2000)).toBe(1500);
    });

    it("앞뒤가 모두 없으면(빈 컬럼) 기본 간격을 반환한다", () => {
        expect(computeOrderBetween(null, null)).toBe(ORDER_GAP);
    });

    it("맨 앞에 넣을 때는 뒤 이웃의 절반을 쓴다", () => {
        expect(computeOrderBetween(null, 1000)).toBe(500);
    });

    it("맨 뒤에 넣을 때는 앞 이웃에 기본 간격을 더한다", () => {
        expect(computeOrderBetween(1000, null)).toBe(1000 + ORDER_GAP);
    });

    it("같은 자리에 반복해 끼워 넣으면 결국 null을 반환해 재정렬을 요청한다", () => {
        // 같은 카드 바로 뒤에 계속 드롭하는 실사용 시나리오. 중간값이 한쪽으로
        // 수렴하다 double 정밀도가 소진되는 지점이 반드시 온다.
        let before = 1000;
        const after = 2000;
        let result: number | null = null;
        let inserts = 0;

        while (inserts < 200) {
            result = computeOrderBetween(before, after);
            if (result === null) break;
            before = result;
            inserts += 1;
        }

        expect(result).toBeNull();
        // 무한정 버티지 않고 현실적인 횟수 안에 충돌을 알린다는 것도 함께 확인.
        expect(inserts).toBeLessThan(200);
    });

    it("같은 값 사이도 쪼갤 수 없으므로 null을 반환한다", () => {
        expect(computeOrderBetween(1000, 1000)).toBeNull();
    });
});

describe("findStableNeighborId", () => {
    const list = [card("a", 1000), card("b", 2000), card("c", 3000)];

    it("이동 중인 카드가 없으면 시작 위치의 카드를 그대로 쓴다", () => {
        expect(findStableNeighborId(list, new Set(), 1, -1)).toBe("b");
    });

    it("이동 중인 카드는 건너뛰고 그 다음 안정된 카드를 찾는다", () => {
        expect(findStableNeighborId(list, new Set(["b"]), 1, -1)).toBe("a");
    });

    it("방향 끝까지 전부 이동 중이면 기준점이 없으므로 null", () => {
        expect(findStableNeighborId(list, new Set(["a", "b"]), 1, -1)).toBeNull();
    });

    it("범위를 벗어난 인덱스에서 시작하면 null", () => {
        expect(findStableNeighborId(list, new Set(), 3, 1)).toBeNull();
    });
});

describe("findNeighborsForOrder", () => {
    const list = [card("a", 1000), card("b", 2000), card("c", 3000)];

    it("목표 order를 감싸는 앞뒤 이웃을 찾는다", () => {
        expect(findNeighborsForOrder(list, 2500, new Set())).toEqual({
            beforeId: "b",
            afterId: "c",
        });
    });

    it("맨 앞 자리면 앞 이웃이 없다", () => {
        expect(findNeighborsForOrder(list, 500, new Set())).toEqual({
            beforeId: null,
            afterId: "a",
        });
    });

    it("맨 뒤 자리면 뒤 이웃이 없다", () => {
        expect(findNeighborsForOrder(list, 9999, new Set())).toEqual({
            beforeId: "c",
            afterId: null,
        });
    });

    it("이동 중인 카드는 기준점에서 제외한다", () => {
        expect(findNeighborsForOrder(list, 2500, new Set(["b"]))).toEqual({
            beforeId: "a",
            afterId: "c",
        });
    });
});
