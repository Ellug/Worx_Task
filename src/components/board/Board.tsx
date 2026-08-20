"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Candidate } from "@/lib/candidates";
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
    const [movingId, setMovingId] = useState<string | null>(null);
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

    const moveCandidate = useCallback(
        async (
            candidateId: string,
            nextStageId: StageId,
            beforeId: string | null,
            afterId: string | null,
        ) => {
            const target = candidates.find((c) => c.id === candidateId);
            if (!target) return;

            const previousCandidates = candidates;

            setError(null);
            setMovingId(candidateId);
            setCandidates((prev) => {
                const without = prev.filter((c) => c.id !== candidateId);
                const moved: Candidate = { ...target, stageId: nextStageId };

                let insertIndex = without.length;
                if (afterId) {
                    const idx = without.findIndex((c) => c.id === afterId);
                    if (idx !== -1) insertIndex = idx;
                } else if (beforeId) {
                    const idx = without.findIndex((c) => c.id === beforeId);
                    if (idx !== -1) insertIndex = idx + 1;
                }

                const next = [...without];
                next.splice(insertIndex, 0, moved);
                return next;
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
                    prev.map((c) =>
                        c.id === candidateId ? { ...c, order: updated.order } : c,
                    ),
                );
            } catch {
                setCandidates(previousCandidates);
                setError(
                    `${target.name}님의 단계 변경을 저장하지 못했습니다. 다시 시도해주세요.`,
                );
            } finally {
                setMovingId(null);
            }
        },
        [candidates],
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
                            candidates={filteredCandidates.filter(
                                (candidate) => candidate.stageId === stage.id,
                            )}
                            movingId={movingId}
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
