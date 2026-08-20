"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Candidate } from "@/lib/candidates";
import { computeOrderBetween } from "@/lib/order";
import { STAGES, type StageId } from "@/lib/stages";
import { useCandidateFilter } from "@/hooks/useCandidateFilter";
import { CandidateDetailPanel } from "./CandidateDetailPanel";
import { Column } from "./Column";
import { ErrorToast } from "./ErrorToast";
import { FilterBar } from "./FilterBar";

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

  const selectedCandidate = useMemo(
    () => candidates.find((c) => c.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId],
  );

  const dismissError = useCallback(() => setError(null), []);
  const closeDetail = useCallback(() => setSelectedCandidateId(null), []);

  // candidateId 하나의 이동만 낙관적으로 반영/롤백한다. 전체 스냅샷을 쓰지 않는 이유:
  // 다른 카드가 동시에 이동 중일 때, 이 카드의 실패가 그 카드의 성공까지
  // 되돌려버리는 걸 막기 위해서다. movingIds는 Set이라 여러 카드가 동시에
  // "이동 중" 상태를 가질 수 있고, 각 카드는 자기 자신의 요청이 끝나기 전까지만
  // draggable이 꺼진다(Column/CandidateCard 참고).
  const moveCandidate = useCallback(
    async (
      candidateId: string,
      nextStageId: StageId,
      beforeId: string | null,
      afterId: string | null,
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

      setCandidates((prev) => {
        const current = prev.find((c) => c.id === candidateId);
        if (!current) return prev;
        snapshot = current;
        snapshotName = current.name;

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
        <div className="flex h-full items-start gap-4 overflow-x-auto p-6">
          {STAGES.map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              candidates={filteredCandidates
                .filter((candidate) => candidate.stageId === stage.id)
                .sort((a, b) => a.order - b.order)}
              movingIds={movingIds}
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
