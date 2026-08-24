import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Candidate } from "@/lib/candidates";
import type { StageId } from "@/lib/stages";
import { STAGES } from "@/lib/stages";
import { useCardMoves } from "./useCardMoves";

const DEBOUNCE_MS = 500;

function card(id: string, stageId: StageId, order: number): Candidate {
    return { id, name: id, stageId, order } as Candidate;
}

// Board가 하는 일(목록 보관 + 스테이지별 그룹핑)을 최소한으로 흉내낸 테스트 하네스.
// 훅은 이 두 가지만 있으면 동작하므로 렌더링 없이 이동 로직만 떼어 검증할 수 있다.
function setup(initial: Candidate[]) {
    const store = { current: [...initial] };
    const writeCandidates = (next: Candidate[]) => {
        store.current = next;
    };

    const groupByStage = () => {
        const grouped = {} as Record<StageId, Candidate[]>;
        for (const stage of STAGES) {
            grouped[stage.id] = store.current
                .filter((c) => c.stageId === stage.id)
                .sort((a, b) => a.order - b.order);
        }
        return grouped;
    };

    const view = renderHook(() =>
        useCardMoves({
            candidatesRef: store,
            writeCandidates,
            candidatesByStage: groupByStage(),
        }),
    );

    return {
        ...view,
        store,
        // 지금 저장소에 들어 있는 해당 카드의 상태를 꺼내 본다.
        find: (id: string) => store.current.find((c) => c.id === id)!,
    };
}

/** 서버가 요청받은 대로 저장해줬다고 응답하는 성공 목. */
function mockFetchSuccess() {
    return vi.fn(async (url: string, init: RequestInit) => {
        const id = String(url).split("/").pop()!;
        const body = JSON.parse(String(init.body));
        return {
            ok: true,
            json: async () => ({
                id,
                name: id,
                stageId: body.stageId,
                // 서버가 확정한 order라고 가정(클라이언트 추정값과 달라도 되는지 확인용).
                order: 4242,
            }),
        };
    });
}

/** 항상 500을 돌려주는 실패 목. */
function mockFetchFailure() {
    return vi.fn(async () => ({ ok: false, json: async () => ({}) }));
}

beforeEach(() => {
    // 실제로 500ms를 기다리지 않도록 타이머를 가짜로 바꾼다.
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

/**
 * 디바운스를 만료시켜 대기 중인 요청을 보내고, 그 응답 처리까지 끝낸다.
 * advanceTimersByTimeAsync는 타이머를 진행시키면서 사이사이 promise도 흘려보내므로
 * fetch 응답을 받아 state를 갱신하는 지점까지 한 번에 도달한다.
 */
async function flushDebounce() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
}

describe("useCardMoves - 낙관적 업데이트", () => {
    it("입력 즉시 화면 상태를 먼저 바꾼다(서버 응답 전)", () => {
        const fetchMock = mockFetchSuccess();
        vi.stubGlobal("fetch", fetchMock);

        const h = setup([card("a", "document-review", 1000)]);

        act(() => {
            h.result.current.requestMove("a", "interview", null, null);
        });

        // 아직 디바운스가 끝나지 않아 요청은 나가지도 않았는데
        expect(fetchMock).not.toHaveBeenCalled();
        // 화면용 상태는 이미 옮겨져 있어야 한다.
        expect(h.find("a").stageId).toBe("interview");
    });

    it("성공하면 서버가 확정한 값으로 동기화한다", async () => {
        vi.stubGlobal("fetch", mockFetchSuccess());

        const h = setup([card("a", "document-review", 1000)]);

        act(() => {
            h.result.current.requestMove("a", "interview", null, null);
        });
        await flushDebounce();

        // 목이 돌려준 order(4242)로 덮어써졌는지 = 서버 응답을 반영했는지
        expect(h.find("a").order).toBe(4242);
        expect(h.find("a").stageId).toBe("interview");
    });
});

describe("useCardMoves - 실패 시 롤백", () => {
    it("저장에 실패하면 원래 위치로 되돌리고 에러를 노출한다", async () => {
        vi.stubGlobal("fetch", mockFetchFailure());

        const h = setup([card("a", "document-review", 1000)]);

        act(() => {
            h.result.current.requestMove("a", "interview", null, null);
        });
        // 낙관적으로 먼저 옮겨진 상태를 한 번 확인하고
        expect(h.find("a").stageId).toBe("interview");

        await flushDebounce();

        // 실패 후에는 출발 지점으로 정확히 복귀해야 한다.
        expect(h.find("a").stageId).toBe("document-review");
        expect(h.find("a").order).toBe(1000);
        expect(h.result.current.error).toContain("저장하지 못했습니다");
    });

    it("실패한 이동은 undo 스택에 쌓이지 않는다", async () => {
        vi.stubGlobal("fetch", mockFetchFailure());

        const h = setup([card("a", "document-review", 1000)]);

        act(() => {
            h.result.current.requestMove("a", "interview", null, null);
        });
        await flushDebounce();

        expect(h.find("a").stageId).toBe("document-review");
        // 되돌릴 "성공한 이동"이 없으므로 undo는 비활성이어야 한다.
        expect(h.result.current.canUndo).toBe(false);
    });

    it("한 카드의 실패가 다른 카드의 성공을 되돌리지 않는다", async () => {
        // a는 성공, b는 실패하도록 분기하는 목.
        vi.stubGlobal(
            "fetch",
            vi.fn(async (url: string, init: RequestInit) => {
                const id = String(url).split("/").pop()!;
                if (id === "b") return { ok: false, json: async () => ({}) };
                const body = JSON.parse(String(init.body));
                return {
                    ok: true,
                    json: async () => ({
                        id,
                        name: id,
                        stageId: body.stageId,
                        order: 4242,
                    }),
                };
            }),
        );

        const h = setup([
            card("a", "document-review", 1000),
            card("b", "document-review", 2000),
        ]);

        act(() => {
            h.result.current.requestMove("a", "interview", null, null);
            h.result.current.requestMove("b", "interview", null, null);
        });
        await flushDebounce();

        expect(h.find("b").stageId).toBe("document-review");
        // b가 실패해 롤백되는 동안에도 a의 성공은 그대로 남아야 한다.
        expect(h.find("a").stageId).toBe("interview");
    });
});

describe("useCardMoves - 연속 입력 병합과 undo", () => {
    it("연속 이동은 마지막 목적지 하나로 합쳐 한 번만 요청한다", async () => {
        const fetchMock = mockFetchSuccess();
        vi.stubGlobal("fetch", fetchMock);

        const h = setup([card("a", "document-review", 1000)]);

        // 디바운스가 끝나기 전에 세 번 연속 이동
        act(() => {
            h.result.current.requestMove("a", "interview", null, null);
            h.result.current.requestMove("a", "offer", null, null);
            h.result.current.requestMove("a", "final-accepted", null, null);
        });
        await flushDebounce();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        // 중간 단계가 아니라 마지막 의도만 전송되어야 한다.
        const sentBody = JSON.parse(String(fetchMock.mock.calls[0][1].body));
        expect(sentBody.stageId).toBe("final-accepted");
    });

    it("성공한 이동은 undo로 원래 단계에 되돌린다", async () => {
        vi.stubGlobal("fetch", mockFetchSuccess());

        const h = setup([card("a", "document-review", 1000)]);

        act(() => {
            h.result.current.requestMove("a", "interview", null, null);
        });
        await flushDebounce();

        expect(h.result.current.canUndo).toBe(true);

        act(() => {
            h.result.current.undo();
        });
        await flushDebounce();

        expect(h.find("a").stageId).toBe("document-review");
        // undo 자체가 다시 히스토리에 쌓이면 무한 왕복이 되므로 비어 있어야 한다.
        expect(h.result.current.canUndo).toBe(false);
    });

    it("undo가 실패하면 기록이 남아 다시 시도할 수 있다", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        // 1) 원래 이동은 성공시켜 히스토리를 하나 만든다.
        fetchMock.mockImplementation(mockFetchSuccess());
        const h = setup([card("a", "document-review", 1000)]);

        act(() => {
            h.result.current.requestMove("a", "interview", null, null);
        });
        await flushDebounce();
        expect(h.result.current.canUndo).toBe(true);

        // 2) undo 요청만 실패시킨다.
        fetchMock.mockImplementation(mockFetchFailure());
        act(() => {
            h.result.current.undo();
        });
        await flushDebounce();

        // 되돌리기가 저장되지 않았으므로 카드는 옮겨진 자리에 그대로 있고,
        // 기록도 남아 있어야 다시 시도할 수 있다.
        expect(h.find("a").stageId).toBe("interview");
        expect(h.result.current.canUndo).toBe(true);

        // 3) 다시 시도하면 이번엔 성공해서 되돌아간다.
        fetchMock.mockImplementation(mockFetchSuccess());
        act(() => {
            h.result.current.undo();
        });
        await flushDebounce();

        expect(h.find("a").stageId).toBe("document-review");
        expect(h.result.current.canUndo).toBe(false);
    });
});
