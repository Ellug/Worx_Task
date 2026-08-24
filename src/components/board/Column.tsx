"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import type { Candidate } from "@/lib/candidates";
import { findStableNeighborId } from "@/lib/order";
import { STAGE_DOT_TONE_CLASSNAME, type Stage } from "@/lib/stages";
import { CandidateCard } from "./CandidateCard";

interface ColumnProps {
    stage: Stage;
    candidates: Candidate[];
    movingIds: Set<string>;
    focusedCandidateId: string | null;
    tabbableCandidateId: string | null;
    onFocusCandidate: (candidateId: string) => void;
    onOpenDetail: (candidateId: string) => void;
    onDropCandidate: (
        candidateId: string,
        beforeId: string | null,
        afterId: string | null,
    ) => void;
}

export function Column({
    stage,
    candidates,
    movingIds,
    focusedCandidateId,
    tabbableCandidateId,
    onFocusCandidate,
    onOpenDetail,
    onDropCandidate,
}: ColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    // CandidateCard의 memo가 안 깨지도록 콜백은 고정하고, 최신 값은 ref로 읽는다.
    const latestRef = useRef({ candidates, movingIds, onDropCandidate });

    useEffect(() => {
        latestRef.current = { candidates, movingIds, onDropCandidate };
    });

    // 카드 위/아래 절반 드롭을 실제 beforeId/afterId 쌍으로 변환한다.
    const handleDropRelative = useCallback(
        (
            draggedId: string,
            targetId: string,
            zone: "before" | "after",
        ) => {
            const {
                candidates: list,
                movingIds: busy,
                onDropCandidate: drop,
            } = latestRef.current;
            const index = list.findIndex((c) => c.id === targetId);
            if (index === -1) return;

            if (zone === "before") {
                drop(
                    draggedId,
                    findStableNeighborId(list, busy, index - 1, -1),
                    targetId,
                );
            } else {
                drop(
                    draggedId,
                    targetId,
                    findStableNeighborId(list, busy, index + 1, 1),
                );
            }
        },
        [],
    );

    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    // 카드가 아닌 컬럼의 빈 영역에 드롭하면 맨 끝에 삽입한다.
    const handleDrop = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        const candidateId = event.dataTransfer.getData("text/plain");
        if (!candidateId) return;

        const anchorId = findStableNeighborId(
            candidates,
            movingIds,
            candidates.length - 1,
            -1,
        );
        onDropCandidate(candidateId, anchorId, null);
    };

    return (
        <section
            aria-label={stage.name}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex h-full w-72 shrink-0 flex-col rounded-lg border bg-zinc-50 transition-colors dark:bg-zinc-900 ${
                isDragOver
                    ? "border-blue-400 dark:border-blue-500"
                    : "border-zinc-200 dark:border-zinc-800"
            }`}
        >
            <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    <span
                        aria-hidden
                        className={`h-2 w-2 rounded-full ${STAGE_DOT_TONE_CLASSNAME[stage.tone]}`}
                    />
                    {stage.name}
                </h2>
                <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {candidates.length}
                </span>
            </header>
            <div
                role={candidates.length > 0 ? "listbox" : undefined}
                aria-label={
                    candidates.length > 0 ? `${stage.name} 지원자 목록` : undefined
                }
                className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3"
            >
                {candidates.length > 0 ? (
                    candidates.map((candidate) => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            isMoving={movingIds.has(candidate.id)}
                            isFocused={focusedCandidateId === candidate.id}
                            isTabbable={tabbableCandidateId === candidate.id}
                            onFocusCandidate={onFocusCandidate}
                            onOpenDetail={onOpenDetail}
                            onDropRelative={handleDropRelative}
                        />
                    ))
                ) : (
                    <p className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
                        지원자 카드가 없습니다
                    </p>
                )}
            </div>
        </section>
    );
}
