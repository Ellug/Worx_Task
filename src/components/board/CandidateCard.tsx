"use client";

import { memo, useState, type DragEvent } from "react";
import type { Candidate } from "@/lib/candidates";
import { STAGES, STAGE_BADGE_TONE_CLASSNAME } from "@/lib/stages";

interface CandidateCardProps {
    candidate: Candidate;
    // 로빙 탭인덱스: 보드 전체에서 이 카드 하나만 Tab으로 진입 가능하다.
    isTabbable?: boolean;
    onFocusCandidate?: (candidateId: string) => void;
    onOpenDetail?: (candidateId: string) => void;
    onDropRelative?: (
        draggedCandidateId: string,
        targetCandidateId: string,
        zone: "before" | "after",
    ) => void;
}

function CandidateCardComponent({
    candidate,
    isTabbable = false,
    onFocusCandidate,
    onOpenDetail,
    onDropRelative,
}: CandidateCardProps) {
    const stage = STAGES.find((s) => s.id === candidate.stageId);
    const [dropZone, setDropZone] = useState<"before" | "after" | null>(null);

    const handleDragStart = (event: DragEvent<HTMLElement>) => {
        event.dataTransfer.setData("text/plain", candidate.id);
        event.dataTransfer.effectAllowed = "move";
    };

    // 커서가 카드 상단/하단 절반 중 어디 있는지로 삽입 방향을 미리 보여준다.
    const handleDragOver = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        setDropZone(event.clientY < midpoint ? "before" : "after");
    };

    const handleDragLeave = (event: DragEvent<HTMLElement>) => {
        event.stopPropagation();
        setDropZone(null);
    };

    const handleDrop = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const draggedId = event.dataTransfer.getData("text/plain");
        const zone = dropZone;
        setDropZone(null);
        if (!draggedId || draggedId === candidate.id) return;

        onDropRelative?.(
            draggedId,
            candidate.id,
            zone === "before" ? "before" : "after",
        );
    };

    return (
        <article
            data-candidate-id={candidate.id}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => onOpenDetail?.(candidate.id)}
            onFocus={() => onFocusCandidate?.(candidate.id)}
            tabIndex={isTabbable ? 0 : -1}
            aria-label={`${candidate.name}, ${candidate.position}, ${stage?.name ?? ""}`}
            className={`cursor-grab rounded-md border border-zinc-200 bg-white p-3 shadow-sm transition-opacity focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-offset-zinc-950 ${
                dropZone === "before" ? "border-t-2 border-t-blue-500" : ""
            } ${
                dropZone === "after" ? "border-b-2 border-b-blue-500" : ""
            }`}
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
        </article>
    );
}

// 1,000장 규모에서 카드 1장 이동 시 나머지 전체가 재렌더되는 걸 막기 위한 memo.
export const CandidateCard = memo(CandidateCardComponent);
