"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Candidate } from "@/lib/candidates";

// 지원자 목록의 조회·보관만 담당한다. 카드 이동은 useCardMoves가 맡는다.
export function useCandidates() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    // setState 실행 시점에 기대지 않고 항상 최신 목록을 읽기 위한 ref.
    const candidatesRef = useRef<Candidate[]>([]);

    // 목록을 바꿀 때 ref와 렌더링용 state를 함께 맞춘다.
    const writeCandidates = useCallback((next: Candidate[]) => {
        candidatesRef.current = next;
        setCandidates(next);
    }, []);

    // 초기 목록을 불러온다. retryLoad가 reloadKey를 바꿔 재시도를 트리거한다.
    useEffect(() => {
        let cancelled = false;

        fetch("/api/candidates")
            .then((response) => {
                if (!response.ok) throw new Error("지원자 목록 조회 실패");
                return response.json() as Promise<Candidate[]>;
            })
            .then((data) => {
                if (cancelled) return;
                candidatesRef.current = data;
                setCandidates(data);
                setLoadError(null);
            })
            .catch(() => {
                if (cancelled) return;
                setLoadError("지원자 목록을 불러오지 못했습니다. 다시 시도해주세요.");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const retryLoad = useCallback(() => {
        setIsLoading(true);
        setLoadError(null);
        setReloadKey((key) => key + 1);
    }, []);

    return {
        candidates,
        candidatesRef,
        writeCandidates,
        isLoading,
        loadError,
        retryLoad,
    };
}
