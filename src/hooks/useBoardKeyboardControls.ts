"use client";

import { useCallback, useEffect, useState } from "react";
import type { Candidate } from "@/lib/candidates";
import { STAGES, type StageId } from "@/lib/stages";

interface UseBoardKeyboardControlsOptions {
    candidatesByStage: Record<StageId, Candidate[]>;
    onMoveToStage: (
        candidateId: string,
        stageId: StageId,
        sourceIndex: number,
    ) => void;
    onOpenDetail: (candidateId: string) => void;
    enabled: boolean;
}

const HANDLED_KEYS = new Set([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "q",
    "e",
    " ",
]);

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

// 방향키/이동/상세보기 "입력"을 해석해 focusedCandidateId(선택 카드)를 옮기거나
// onMoveToStage/onOpenDetail "액션"을 호출하는 역할만 담당한다. 실제로 카드를
// 어떻게 옮기고 저장하는지는 몰라도 되게 해서, 드래그앤드롭과 동일한 액션 함수를
// 공유하고 나중에 다른 입력 방식이 추가돼도 이 훅만 바뀌도록 분리했다.
export function useBoardKeyboardControls({
    candidatesByStage,
    onMoveToStage,
    onOpenDetail,
    enabled,
}: UseBoardKeyboardControlsOptions) {
    const [focusedCandidateId, setFocusedCandidateId] = useState<string | null>(
        null,
    );

    const locate = useCallback(
        (candidateId: string | null) => {
            if (!candidateId) return null;
            for (let stageIndex = 0; stageIndex < STAGES.length; stageIndex++) {
                const list = candidatesByStage[STAGES[stageIndex].id] ?? [];
                const cardIndex = list.findIndex((c) => c.id === candidateId);
                if (cardIndex !== -1) return { stageIndex, cardIndex };
            }
            return null;
        },
        [candidatesByStage],
    );

    const focusFirstAvailable = useCallback(() => {
        for (const stage of STAGES) {
            const list = candidatesByStage[stage.id] ?? [];
            if (list.length > 0) {
                setFocusedCandidateId(list[0].id);
                return;
            }
        }
    }, [candidatesByStage]);

    // 선택 카드가 화면 밖으로 나가지 않도록 컬럼 내 이동, 컬럼 전환, q/e로 다른
    // 컬럼으로 실제로 옮겨진 경우 모두 스크롤을 따라오게 한다. focusedCandidateId만
    // 의존성으로 두면 q/e 이동(아이디는 그대로, 위치만 바뀜)을 놓치므로, 선택 카드의
    // 실제 위치(stageIndex/cardIndex)도 함께 추적한다.
    const focusedLocation = locate(focusedCandidateId);
    useEffect(() => {
        if (!focusedCandidateId) return;
        const el = document.querySelector(
            `[data-candidate-id="${focusedCandidateId}"]`,
        );
        el?.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: "smooth",
        });
    }, [
        focusedCandidateId,
        focusedLocation?.stageIndex,
        focusedLocation?.cardIndex,
    ]);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (isTypingTarget(event.target)) return;

            const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
            if (!HANDLED_KEYS.has(key)) return;

            const location = locate(focusedCandidateId);
            if (!location) {
                if (key.startsWith("Arrow")) {
                    event.preventDefault();
                    focusFirstAvailable();
                }
                return;
            }

            const { stageIndex, cardIndex } = location;
            const currentList = candidatesByStage[STAGES[stageIndex].id] ?? [];

            switch (key) {
                case "ArrowUp":
                    event.preventDefault();
                    if (cardIndex > 0) {
                        setFocusedCandidateId(currentList[cardIndex - 1].id);
                    }
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    if (cardIndex < currentList.length - 1) {
                        setFocusedCandidateId(currentList[cardIndex + 1].id);
                    }
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    for (let i = stageIndex - 1; i >= 0; i--) {
                        const list = candidatesByStage[STAGES[i].id] ?? [];
                        if (list.length > 0) {
                            setFocusedCandidateId(
                                list[Math.min(cardIndex, list.length - 1)].id,
                            );
                            break;
                        }
                    }
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    for (let i = stageIndex + 1; i < STAGES.length; i++) {
                        const list = candidatesByStage[STAGES[i].id] ?? [];
                        if (list.length > 0) {
                            setFocusedCandidateId(
                                list[Math.min(cardIndex, list.length - 1)].id,
                            );
                            break;
                        }
                    }
                    break;
                case "q":
                    event.preventDefault();
                    if (stageIndex > 0) {
                        onMoveToStage(
                            currentList[cardIndex].id,
                            STAGES[stageIndex - 1].id,
                            cardIndex,
                        );
                    }
                    break;
                case "e":
                    event.preventDefault();
                    if (stageIndex < STAGES.length - 1) {
                        onMoveToStage(
                            currentList[cardIndex].id,
                            STAGES[stageIndex + 1].id,
                            cardIndex,
                        );
                    }
                    break;
                case " ":
                    event.preventDefault();
                    onOpenDetail(currentList[cardIndex].id);
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [
        enabled,
        focusedCandidateId,
        candidatesByStage,
        locate,
        focusFirstAvailable,
        onMoveToStage,
        onOpenDetail,
    ]);

    return { focusedCandidateId };
}
