"use client";

import { useCallback, useMemo, useState, type RefObject } from "react";
import type { Candidate } from "@/lib/candidates";
import { STAGES, type StageId } from "@/lib/stages";
import { useBoardKeyboardControls } from "@/hooks/useBoardKeyboardControls";
import { useCandidateFilter } from "@/hooks/useCandidateFilter";
import { useCardMoves } from "@/hooks/useCardMoves";
import { CandidateDetailPanel } from "./CandidateDetailPanel";
import { Column } from "./Column";
import { ErrorToast } from "./ErrorToast";
import { FilterBar } from "./FilterBar";

interface BoardViewProps {
    candidates: Candidate[];
    candidatesRef: RefObject<Candidate[]>;
    writeCandidates: (next: Candidate[]) => void;
}

// 목록이 준비된 뒤의 보드 화면. 필터·이동·키보드 조작을 조합해 렌더링한다.
export function BoardView({
    candidates,
    candidatesRef,
    writeCandidates,
}: BoardViewProps) {
    const {
        nameQuery,
        setNameQuery,
        allPositions,
        selectedPositions,
        togglePosition,
        filteredCandidates,
    } = useCandidateFilter(candidates);

    // 컬럼별로 필터·정렬까지 끝낸 목록. Column과 카드 이동이 공유한다.
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

    const {
        movingIds,
        error,
        dismissError,
        requestMove,
        moveCandidateToStage,
        canUndo,
        undo,
    } = useCardMoves({ candidatesRef, writeCandidates, candidatesByStage });

    const [selectedCandidateId, setSelectedCandidateId] = useState<
        string | null
    >(null);

    const selectedCandidate = useMemo(
        () => candidates.find((c) => c.id === selectedCandidateId) ?? null,
        [candidates, selectedCandidateId],
    );

    const closeDetail = useCallback(() => setSelectedCandidateId(null), []);

    const { focusedCandidateId } = useBoardKeyboardControls({
        candidatesByStage,
        onMoveToStage: moveCandidateToStage,
        onOpenDetail: setSelectedCandidateId,
        onUndo: undo,
        enabled: !selectedCandidate,
    });

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
                    onClick={undo}
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
                                requestMove(candidateId, stage.id, beforeId, afterId)
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
