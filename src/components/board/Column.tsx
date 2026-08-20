"use client";

import { useState, type DragEvent } from "react";
import type { Candidate } from "@/lib/candidates";
import { STAGE_DOT_TONE_CLASSNAME, type Stage } from "@/lib/stages";
import { CandidateCard } from "./CandidateCard";

interface ColumnProps {
    stage: Stage;
    candidates: Candidate[];
    movingId: string | null;
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
    movingId,
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

        // 카드 위에 직접 놓인 경우는 CandidateCard가 stopPropagation으로 처리하므로,
        // 여기까지 도달하는 건 컬럼의 빈 영역(마지막 카드 아래)에 놓인 경우다.
        const lastCandidate = candidates[candidates.length - 1];
        onDropCandidate(candidateId, lastCandidate ? lastCandidate.id : null, null);
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
                            isMoving={movingId === candidate.id}
                            onOpenDetail={onOpenDetail}
                            onDropBefore={(draggedId) =>
                                onDropCandidate(
                                    draggedId,
                                    index > 0 ? candidates[index - 1].id : null,
                                    candidate.id,
                                )
                            }
                            onDropAfter={(draggedId) =>
                                onDropCandidate(
                                    draggedId,
                                    candidate.id,
                                    index < candidates.length - 1
                                        ? candidates[index + 1].id
                                        : null,
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
