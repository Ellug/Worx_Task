"use client";

import { useState, type DragEvent } from "react";
import type { Candidate } from "@/lib/candidates";
import { findStableNeighborId } from "@/lib/order";
import { STAGE_DOT_TONE_CLASSNAME, type Stage } from "@/lib/stages";
import { CandidateCard } from "./CandidateCard";

interface ColumnProps {
    stage: Stage;
    candidates: Candidate[];
    movingIds: Set<string>;
    focusedCandidateId: string | null;
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
    onOpenDetail,
    onDropCandidate,
}: ColumnProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

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
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
                {candidates.length > 0 ? (
                    candidates.map((candidate, index) => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            isMoving={movingIds.has(candidate.id)}
                            isFocused={focusedCandidateId === candidate.id}
                            onOpenDetail={onOpenDetail}
                            onDropBefore={(draggedId) =>
                                onDropCandidate(
                                    draggedId,
                                    findStableNeighborId(candidates, movingIds, index - 1, -1),
                                    candidate.id,
                                )
                            }
                            onDropAfter={(draggedId) =>
                                onDropCandidate(
                                    draggedId,
                                    candidate.id,
                                    findStableNeighborId(candidates, movingIds, index + 1, 1),
                                )
                            }
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
