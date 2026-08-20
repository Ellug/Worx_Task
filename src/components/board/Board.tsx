"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Candidate } from "@/lib/candidates";
import {
    computeOrderBetween,
    findNeighborsForOrder,
    findStableNeighborId,
} from "@/lib/order";
import { STAGES, type StageId } from "@/lib/stages";
import { useBoardKeyboardControls } from "@/hooks/useBoardKeyboardControls";
import { useCandidateFilter } from "@/hooks/useCandidateFilter";
import { CandidateDetailPanel } from "./CandidateDetailPanel";
import { Column } from "./Column";
import { ErrorToast } from "./ErrorToast";
import { FilterBar } from "./FilterBar";

interface MoveHistoryEntry {
    candidateId: string;
    previousStageId: StageId;
    previousOrder: number;
}

export function Board() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [movingIds, setMovingIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState<
        string | null
    >(null);
    const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/candidates")
            .then((response) => {
                if (!response.ok) throw new Error("지원자 목록 조회 실패");
                return response.json() as Promise<Candidate[]>;
            })
            .then((data) => {
                if (cancelled) return;
                setCandidates(data);
                setLoadError(null);
            })
            .catch(() => {
                if (cancelled) return;
                setLoadError("지원자 목록을 불러오지 못했습니다. 다시 시도해주세요.");
            })
            .finally(() => {
                if (!cancelled) setIsLoadingList(false);
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const retryLoad = useCallback(() => {
        setIsLoadingList(true);
        setLoadError(null);
        setReloadKey((key) => key + 1);
    }, []);

    const {
        nameQuery,
        setNameQuery,
        allPositions,
        selectedPositions,
        togglePosition,
        filteredCandidates,
    } = useCandidateFilter(candidates);

    // 컬럼별로 필터링 + order 정렬까지 끝낸 목록. Column 렌더링과 키보드 이동
    // ("컬럼 끝에 삽입" 위치 계산) 둘 다 이 결과를 그대로 재사용한다.
    const candidatesByStage = useMemo(() => {
        const grouped: Record<StageId, Candidate[]> = {} as Record<
            StageId,
            Candidate[]
        >;
        for (const stage of STAGES) {
            grouped[stage.id] = filteredCandidates
                .filter((candidate) => candidate.stageId === stage.id)
                .sort((a, b) => a.order - b.order);
        }
        return grouped;
    }, [filteredCandidates]);

    const selectedCandidate = useMemo(
        () => candidates.find((c) => c.id === selectedCandidateId) ?? null,
        [candidates, selectedCandidateId],
    );

    const dismissError = useCallback(() => setError(null), []);
    const closeDetail = useCallback(() => setSelectedCandidateId(null), []);

    // candidateId 하나의 이동만 낙관적으로 반영/롤백
    const moveCandidate = useCallback(
        async (
            candidateId: string,
            nextStageId: StageId,
            beforeId: string | null,
            afterId: string | null,
            recordHistory: boolean = true,
        ) => {
            let alreadyMoving = false;
            setMovingIds((prev) => {
                if (prev.has(candidateId)) {
                    alreadyMoving = true;
                    return prev;
                }
                const next = new Set(prev);
                next.add(candidateId);
                return next;
            });
            if (alreadyMoving) return;

            setError(null);

            let snapshot: Candidate | null = null;
            let snapshotName = "지원자";
            let snapshotStageId: StageId | null = null;
            let snapshotOrder = 0;

            setCandidates((prev) => {
                const current = prev.find((c) => c.id === candidateId);
                if (!current) return prev;
                snapshot = current;
                snapshotName = current.name;
                snapshotStageId = current.stageId;
                snapshotOrder = current.order;

                const siblings = prev
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

                return prev.map((c) =>
                    c.id === candidateId
                        ? { ...c, stageId: nextStageId, order: optimisticOrder }
                        : c,
                );
            });

            try {
                const response = await fetch(`/api/candidates/${candidateId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stageId: nextStageId, beforeId, afterId }),
                });

                if (!response.ok) {
                    throw new Error("단계 변경 저장 실패");
                }

                const updated: Candidate = await response.json();
                setCandidates((prev) =>
                    prev.map((c) => (c.id === candidateId ? updated : c)),
                );
                if (recordHistory && snapshotStageId) {
                    setMoveHistory((prev) => [
                        ...prev,
                        {
                            candidateId,
                            previousStageId: snapshotStageId!,
                            previousOrder: snapshotOrder,
                        },
                    ]);
                }
            } catch {
                setCandidates((prev) =>
                    snapshot
                        ? prev.map((c) => (c.id === candidateId ? snapshot! : c))
                        : prev,
                );
                setError(
                    `${snapshotName}님의 단계 변경을 저장하지 못했습니다. 다시 시도해주세요.`,
                );
            } finally {
                setMovingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(candidateId);
                    return next;
                });
            }
        },
        [],
    );

    // 상대 위치(sourceIndex)를 대상 컬럼 길이에 맞춰 클램프해 같은 자리쯤에 넣는다.
    const moveCandidateToStage = useCallback(
        (candidateId: string, stageId: StageId, sourceIndex: number) => {
            const targetList = candidatesByStage[stageId] ?? [];
            const targetIndex = Math.min(sourceIndex, targetList.length);
            const beforeId = findStableNeighborId(
                targetList,
                movingIds,
                targetIndex - 1,
                -1,
            );
            const afterId = findStableNeighborId(
                targetList,
                movingIds,
                targetIndex,
                1,
            );
            moveCandidate(candidateId, stageId, beforeId, afterId);
        },
        [candidatesByStage, movingIds, moveCandidate],
    );

    const canUndo =
        moveHistory.length > 0 &&
        !movingIds.has(moveHistory[moveHistory.length - 1].candidateId);

    const handleUndo = useCallback(() => {
        const last = moveHistory[moveHistory.length - 1];
        if (!last || movingIds.has(last.candidateId)) return;

        const targetList = (candidatesByStage[last.previousStageId] ?? []).filter(
            (c) => c.id !== last.candidateId,
        );
        const { beforeId, afterId } = findNeighborsForOrder(
            targetList,
            last.previousOrder,
            movingIds,
        );

        setMoveHistory((prev) => prev.slice(0, -1));
        moveCandidate(
            last.candidateId,
            last.previousStageId,
            beforeId,
            afterId,
            false,
        );
    }, [moveHistory, movingIds, candidatesByStage, moveCandidate]);

    const { focusedCandidateId } = useBoardKeyboardControls({
        candidatesByStage,
        onMoveToStage: moveCandidateToStage,
        onOpenDetail: setSelectedCandidateId,
        onUndo: handleUndo,
        enabled: !selectedCandidate,
    });

    if (isLoadingList) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
                지원자 목록을 불러오는 중…
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                <p>{loadError}</p>
                <button
                    type="button"
                    onClick={retryLoad}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <FilterBar
                nameQuery={nameQuery}
                onNameQueryChange={setNameQuery}
                positions={allPositions}
                selectedPositions={selectedPositions}
                onTogglePosition={togglePosition}
            />
            <div className="relative min-h-0 flex-1">
                <button
                    type="button"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="absolute right-4 top-4 z-30 rounded-md border border-zinc-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    실행 취소 (Ctrl+Z)
                </button>
                <div className="flex h-full items-start gap-4 overflow-x-auto p-6">
                    {STAGES.map((stage) => (
                        <Column
                            key={stage.id}
                            stage={stage}
                            candidates={candidatesByStage[stage.id] ?? []}
                            movingIds={movingIds}
                            focusedCandidateId={focusedCandidateId}
                            onOpenDetail={setSelectedCandidateId}
                            onDropCandidate={(candidateId, beforeId, afterId) =>
                                moveCandidate(candidateId, stage.id, beforeId, afterId)
                            }
                        />
                    ))}
                </div>
                {error && <ErrorToast message={error} onDismiss={dismissError} />}
            </div>
            {selectedCandidate && (
                <CandidateDetailPanel
                    candidate={selectedCandidate}
                    onClose={closeDetail}
                />
            )}
        </div>
    );
}
