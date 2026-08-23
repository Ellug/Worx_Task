"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type RefObject,
} from "react";
import type { Candidate } from "@/lib/candidates";
import {
    computeOrderBetween,
    findNeighborsForOrder,
    findStableNeighborId,
} from "@/lib/order";
import type { StageId } from "@/lib/stages";

// 연속 이동을 하나로 합치기 위한 디바운스 대기 시간.
const MOVE_DEBOUNCE_MS = 500;

interface MoveHistoryEntry {
    candidateId: string;
    previousStageId: StageId;
    previousOrder: number;
}

interface MoveIntent {
    stageId: StageId;
    beforeId: string | null;
    afterId: string | null;
}

interface StagePosition {
    stageId: StageId;
    order: number;
}

// 카드 한 장의 연속 이동 한 묶음(버스트) 상태.
interface CardMoveState {
    pending: MoveIntent | null;     // 아직 서버로 보내지 않은 최종 목적지
    inFlight: boolean;              // PATCH 진행 중 여부
    historyOrigin: StagePosition;   // 버스트 시작 전 위치
    confirmed: StagePosition;       // 서버가 마지막으로 확정해준 위치
    name: string;
    recordHistory: boolean;         // undo 때문에 발생한 이동이면 false — 되돌리기가 다시 히스토리에 쌓이지 않게 한다.
    timer: ReturnType<typeof setTimeout> | null;
}

interface UseCardMovesOptions {
    candidatesRef: RefObject<Candidate[]>;
    writeCandidates: (next: Candidate[]) => void;
    candidatesByStage: Record<StageId, Candidate[]>;
}

// 카드 이동의 낙관적 반영·디바운스 전송·실패 롤백·undo를 담당한다. UI를 모른다.
export function useCardMoves({
    candidatesRef,
    writeCandidates,
    candidatesByStage,
}: UseCardMovesOptions) {
    const [movingIds, setMovingIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);

    const moveStateRef = useRef<Map<string, CardMoveState>>(new Map());

    const dismissError = useCallback(() => setError(null), []);

    // 이동 대기/전송 중인 카드 집합을 렌더링용 state로 내보낸다.
    const syncMovingIds = useCallback(() => {
        setMovingIds(new Set(moveStateRef.current.keys()));
    }, []);

    // 이웃 카드가 그사이 사라지거나 다른 단계로 옮겨졌는지 발신 직전에 재검증한다.
    const resolveIntent = useCallback(
        (candidateId: string, intent: MoveIntent): MoveIntent => {
            const isValid = (id: string | null) =>
                id !== null &&
                id !== candidateId &&
                candidatesRef.current.some(
                    (c) => c.id === id && c.stageId === intent.stageId,
                );

            let beforeId = isValid(intent.beforeId) ? intent.beforeId : null;
            const afterId = isValid(intent.afterId) ? intent.afterId : null;

            if (!beforeId && !afterId) {
                const targetList = candidatesRef.current
                    .filter(
                        (c) => c.stageId === intent.stageId && c.id !== candidateId,
                    )
                    .sort((a, b) => a.order - b.order);
                beforeId =
                    targetList.length > 0
                        ? targetList[targetList.length - 1].id
                        : null;
            }

            return { stageId: intent.stageId, beforeId, afterId };
        },
        [candidatesRef],
    );

    // 카드 하나의 대기 중인 이동을 서버로 보내고, 그사이 쌓인 다음 의도를 이어서 처리한다.
    const flushMove = useCallback(
        async (candidateId: string) => {
            const state = moveStateRef.current.get(candidateId);
            if (!state || state.inFlight || !state.pending) return;

            if (state.timer) {
                clearTimeout(state.timer);
                state.timer = null;
            }

            state.inFlight = true;

            try {
                while (state.pending) {
                    const intent = state.pending;
                    state.pending = null;

                    const response = await fetch(`/api/candidates/${candidateId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(resolveIntent(candidateId, intent)),
                    });

                    if (!response.ok) {
                        throw new Error("단계 변경 저장 실패");
                    }

                    const updated: Candidate = await response.json();
                    state.confirmed = {
                        stageId: updated.stageId,
                        order: updated.order,
                    };
                    // 더 최신 의도가 이미 쌓여 있으면 이 응답은 낡은 결과이므로 화면엔 안 그린다.
                    if (!state.pending) {
                        writeCandidates(
                            candidatesRef.current.map((c) =>
                                c.id === candidateId ? updated : c,
                            ),
                        );
                    }
                }

                if (state.recordHistory) {
                    setMoveHistory((prev) => [
                        ...prev,
                        {
                            candidateId,
                            previousStageId: state.historyOrigin.stageId,
                            previousOrder: state.historyOrigin.order,
                        },
                    ]);
                }

                moveStateRef.current.delete(candidateId);
                syncMovingIds();
            } catch {
                const { stageId, order } = state.confirmed;
                const revertedToOrigin =
                    stageId === state.historyOrigin.stageId &&
                    order === state.historyOrigin.order;

                moveStateRef.current.delete(candidateId);
                syncMovingIds();
                writeCandidates(
                    candidatesRef.current.map((c) =>
                        c.id === candidateId ? { ...c, stageId, order } : c,
                    ),
                );
                setError(
                    revertedToOrigin
                        ? `${state.name}님의 단계 변경을 저장하지 못했습니다. 원래 단계로 되돌렸습니다.`
                        : `${state.name}님의 단계 변경을 저장하지 못했습니다. 마지막으로 저장된 단계로 되돌렸습니다.`,
                );
            }
        },
        [candidatesRef, resolveIntent, writeCandidates, syncMovingIds],
    );

    // 낙관적 업데이트는 입력 즉시 반영하고, 서버 요청만 미뤄서 연속 이동을 하나로 합친다.
    const requestMove = useCallback(
        (
            candidateId: string,
            nextStageId: StageId,
            beforeId: string | null,
            afterId: string | null,
            recordHistory: boolean = true,
        ) => {
            const current = candidatesRef.current.find((c) => c.id === candidateId);
            if (!current) return;

            setError(null);

            let state = moveStateRef.current.get(candidateId);
            if (!state) {
                // 새 버스트 시작. 지금 위치가 서버가 확정해준 마지막 위치다.
                state = {
                    pending: null,
                    inFlight: false,
                    historyOrigin: { stageId: current.stageId, order: current.order },
                    confirmed: { stageId: current.stageId, order: current.order },
                    name: current.name,
                    recordHistory,
                    timer: null,
                };
                moveStateRef.current.set(candidateId, state);
            }

            const siblings = candidatesRef.current
                .filter((c) => c.stageId === nextStageId && c.id !== candidateId)
                .sort((a, b) => a.order - b.order);
            const beforeOrder = beforeId
                ? (siblings.find((c) => c.id === beforeId)?.order ?? null)
                : null;
            const afterOrder = afterId
                ? (siblings.find((c) => c.id === afterId)?.order ?? null)
                : null;
            const optimisticOrder =
                computeOrderBetween(beforeOrder, afterOrder) ??
                afterOrder ??
                (beforeOrder ?? 0) + 1;

            writeCandidates(
                candidatesRef.current.map((c) =>
                    c.id === candidateId
                        ? { ...c, stageId: nextStageId, order: optimisticOrder }
                        : c,
                ),
            );

            state.pending = { stageId: nextStageId, beforeId, afterId };
            if (state.timer) clearTimeout(state.timer);
            state.timer = setTimeout(() => {
                const latest = moveStateRef.current.get(candidateId);
                if (latest) latest.timer = null;
                flushMove(candidateId);
            }, MOVE_DEBOUNCE_MS);

            syncMovingIds();
        },
        [candidatesRef, writeCandidates, syncMovingIds, flushMove],
    );

    // 페이지 이탈 시 아직 안 보낸 이동을 keepalive 요청으로 흘려보낸다.
    useEffect(() => {
        const moveStates = moveStateRef.current;

        const flushPendingOnExit = () => {
            for (const [candidateId, state] of moveStates) {
                if (!state.pending) continue;
                const body = JSON.stringify(
                    resolveIntent(candidateId, state.pending),
                );
                state.pending = null;
                fetch(`/api/candidates/${candidateId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body,
                    keepalive: true,
                }).catch(() => {});
            }
        };

        window.addEventListener("pagehide", flushPendingOnExit);
        return () => {
            window.removeEventListener("pagehide", flushPendingOnExit);
            for (const state of moveStates.values()) {
                if (state.timer) clearTimeout(state.timer);
            }
        };
    }, [resolveIntent]);

    // 상대 위치(sourceIndex)를 대상 컬럼 길이에 맞춰 클램프해 같은 자리쯤에 넣는다.
    const moveCandidateToStage = useCallback(
        (candidateId: string, stageId: StageId, sourceIndex: number) => {
            const busyIds = new Set(moveStateRef.current.keys());
            const targetList = candidatesByStage[stageId] ?? [];
            const targetIndex = Math.min(sourceIndex, targetList.length);
            const beforeId = findStableNeighborId(
                targetList,
                busyIds,
                targetIndex - 1,
                -1,
            );
            const afterId = findStableNeighborId(
                targetList,
                busyIds,
                targetIndex,
                1,
            );
            requestMove(candidateId, stageId, beforeId, afterId);
        },
        [candidatesByStage, requestMove],
    );

    const canUndo =
        moveHistory.length > 0 &&
        !movingIds.has(moveHistory[moveHistory.length - 1].candidateId);

    // 마지막 이동을 스택에서 꺼내 그 이전 위치로 되돌린다.
    const undo = useCallback(() => {
        const last = moveHistory[moveHistory.length - 1];
        if (!last || moveStateRef.current.has(last.candidateId)) return;

        const busyIds = new Set(moveStateRef.current.keys());
        const targetList = (candidatesByStage[last.previousStageId] ?? []).filter(
            (c) => c.id !== last.candidateId,
        );
        const { beforeId, afterId } = findNeighborsForOrder(
            targetList,
            last.previousOrder,
            busyIds,
        );

        setMoveHistory((prev) => prev.slice(0, -1));
        requestMove(
            last.candidateId,
            last.previousStageId,
            beforeId,
            afterId,
            false,
        );
    }, [moveHistory, candidatesByStage, requestMove]);

    return {
        movingIds,
        error,
        dismissError,
        requestMove,
        moveCandidateToStage,
        canUndo,
        undo,
    };
}
