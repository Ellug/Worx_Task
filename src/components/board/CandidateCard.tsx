"use client";

import type { DragEvent } from "react";
import type { Candidate } from "@/lib/candidates";
import { STAGES, STAGE_BADGE_TONE_CLASSNAME } from "@/lib/stages";

interface CandidateCardProps {
  candidate: Candidate;
  isMoving?: boolean;
  onOpenDetail?: (candidateId: string) => void;
}

export function CandidateCard({
  candidate,
  isMoving = false,
  onOpenDetail,
}: CandidateCardProps) {
  const stage = STAGES.find((s) => s.id === candidate.stageId);

  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.setData("text/plain", candidate.id);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <article
      draggable={!isMoving}
      onDragStart={handleDragStart}
      onClick={() => onOpenDetail?.(candidate.id)}
      aria-busy={isMoving}
      className={`rounded-md border border-zinc-200 bg-white p-3 shadow-sm transition-opacity dark:border-zinc-800 dark:bg-zinc-950 ${
        isMoving ? "cursor-wait opacity-60" : "cursor-grab active:cursor-grabbing"
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
      {isMoving && (
        <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-600">
          저장 중…
        </p>
      )}
    </article>
  );
}
