"use client";

import { useCallback, useState } from "react";
import type { Candidate } from "@/lib/candidates";
import { STAGES, type StageId } from "@/lib/stages";
import { CandidateCard } from "./CandidateCard";
import { Column } from "./Column";
import { ErrorToast } from "./ErrorToast";

interface BoardProps {
  initialCandidates: Candidate[];
}

export function Board({ initialCandidates }: BoardProps) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dismissError = useCallback(() => setError(null), []);

  const moveCandidate = useCallback(
    async (candidateId: string, nextStageId: StageId) => {
      const target = candidates.find((c) => c.id === candidateId);
      if (!target || target.stageId === nextStageId) return;

      const previousStageId = target.stageId;

      setError(null);
      setMovingId(candidateId);
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, stageId: nextStageId } : c,
        ),
      );

      try {
        const response = await fetch(`/api/candidates/${candidateId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stageId: nextStageId }),
        });

        if (!response.ok) {
          throw new Error("단계 변경 저장 실패");
        }
      } catch {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, stageId: previousStageId } : c,
          ),
        );
        setError(
          `${target.name}님의 단계 변경을 저장하지 못했습니다. 다시 시도해주세요.`,
        );
      } finally {
        setMovingId(null);
      }
    },
    [candidates],
  );

  return (
    <div className="relative h-full">
      <div className="flex h-full items-start gap-4 overflow-x-auto p-6">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            onDropCandidate={(candidateId) =>
              moveCandidate(candidateId, stage.id)
            }
          >
            {candidates
              .filter((candidate) => candidate.stageId === stage.id)
              .map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isMoving={movingId === candidate.id}
                />
              ))}
          </Column>
        ))}
      </div>
      {error && <ErrorToast message={error} onDismiss={dismissError} />}
    </div>
  );
}
