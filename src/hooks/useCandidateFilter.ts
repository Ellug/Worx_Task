import { useCallback, useDeferredValue, useMemo, useState } from "react";
import type { Candidate } from "@/lib/candidates";

export function useCandidateFilter(candidates: Candidate[]) {
    const [nameQuery, setNameQuery] = useState("");
    const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
    // 타이핑 자체는 즉시 반영하고, 무거운 필터 재계산만 낮은 우선순위로 미룬다.
    const deferredNameQuery = useDeferredValue(nameQuery);

    const allPositions = useMemo(
        () => Array.from(new Set(candidates.map((c) => c.position))).sort(),
        [candidates],
    );

    // 이름 검색어와 선택된 직무를 모두 만족하는 지원자만 남긴다.
    const filteredCandidates = useMemo(() => {
        const query = deferredNameQuery.trim().toLowerCase();
        return candidates.filter((candidate) => {
            const matchesName =
                query === "" || candidate.name.toLowerCase().includes(query);
            const matchesPosition =
                selectedPositions.size === 0 ||
                selectedPositions.has(candidate.position);
            return matchesName && matchesPosition;
        });
    }, [candidates, deferredNameQuery, selectedPositions]);

    const togglePosition = useCallback((position: string) => {
        setSelectedPositions((prev) => {
            const next = new Set(prev);
            if (next.has(position)) {
                next.delete(position);
            } else {
                next.add(position);
            }
            return next;
        });
    }, []);

    return {
        nameQuery,
        setNameQuery,
        allPositions,
        selectedPositions,
        togglePosition,
        filteredCandidates,
    };
}
