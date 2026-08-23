"use client";

import { useCandidates } from "@/hooks/useCandidates";
import { BoardStatus } from "./BoardStatus";
import { BoardView } from "./BoardView";

// 목록 로딩 상태에 따라 무엇을 보여줄지만 결정한다. 보드 자체는 BoardView가 그린다.
export function Board() {
    const {
        candidates,
        candidatesRef,
        writeCandidates,
        isLoading,
        loadError,
        retryLoad,
    } = useCandidates();

    if (isLoading) {
        return <BoardStatus message="지원자 목록을 불러오는 중…" />;
    }

    if (loadError) {
        return <BoardStatus message={loadError} onRetry={retryLoad} />;
    }

    return (
        <BoardView
            candidates={candidates}
            candidatesRef={candidatesRef}
            writeCandidates={writeCandidates}
        />
    );
}
