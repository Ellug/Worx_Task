"use client";

import { useState, type DragEvent } from "react";
import type { Candidate } from "@/lib/candidates";
import { STAGES, STAGE_BADGE_TONE_CLASSNAME } from "@/lib/stages";

interface CandidateCardProps {
    candidate: Candidate;
    isMoving?: boolean;
    isFocused?: boolean;
    onOpenDetail?: (candidateId: string) => void;
    onDropBefore?: (draggedCandidateId: string) => void;
    onDropAfter?: (draggedCandidateId: string) => void;
}

export function CandidateCard({
    candidate,
    isMoving = false,
    isFocused = false,
    onOpenDetail,
    onDropBefore,
    onDropAfter,
}: CandidateCardProps) {
    const stage = STAGES.find((s) => s.id === candidate.stageId);
    const [dropZone, setDropZone] = useState<"before" | "after" | null>(null);

    const handleDragStart = (event: DragEvent<HTMLElement>) => {
        event.dataTransfer.setData("text/plain", candidate.id);
        event.dataTransfer.effectAllowed = "move";
    };

    // 이 카드 자신이 아직 이동 중(서버 응답 대기)이면 위치가 확정되지 않은
    // 상태라 다른 카드의 beforeId/afterId 기준점으로 쓰일 수 없다. 이벤트를
    // 그대로 흘려보내(stopPropagation 생략) 상위 Column의 핸들러가 대신
    // "컬럼 끝에 삽입"으로 처리하도록 한다.
    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        if (isMoving) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDropZone(event.clientY < midpoint ? "before" : "after");
    };

    const handleDragLeave = (event: DragEvent<HTMLElement>) => {
        if (isMoving) return;
        event.stopPropagation();
        setDropZone(null);
    };

    const handleDrop = (event: DragEvent<HTMLElement>) => {
        if (isMoving) return;
        event.preventDefault();
        event.stopPropagation();
        const draggedId = event.dataTransfer.getData("text/plain");
        const zone = dropZone;
        setDropZone(null);
        if (!draggedId || draggedId === candidate.id) return;

        if (zone === "before") {
            onDropBefore?.(draggedId);
        } else {
            onDropAfter?.(draggedId);
        }
    };

    return (
        <article
            data-candidate-id={candidate.id}
            draggable={!isMoving}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => onOpenDetail?.(candidate.id)}
            aria-busy={isMoving}
            className={`rounded-md border border-zinc-200 bg-white p-3 shadow-sm transition-opacity dark:border-zinc-800 dark:bg-zinc-950 ${
                isMoving ? "cursor-wait opacity-60" : "cursor-grab active:cursor-grabbing"
            } ${dropZone === "before" ? "border-t-2 border-t-blue-500" : ""} ${
                dropZone === "after" ? "border-b-2 border-b-blue-500" : ""
            } ${isFocused ? "ring-2 ring-yellow-400 ring-offset-1 dark:ring-offset-zinc-950" : ""}`}
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {candidate.name}
                </h3>
                {stage && (
                    <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STAGE_BADGE_TONE_CLASSNAME[stage.tone]}`}
                    >
                        {stage.name}
                    </span>
                )}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {candidate.position}
            </p>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                지원일 {candidate.appliedAt}
            </p>
            {isMoving && (
                <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-600">
                    저장 중…
                </p>
            )}
        </article>
    );
}
