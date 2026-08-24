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
    onUndo: () => void;
    enabled: boolean;
}

const STAGE_JUMP_KEYS = new Set(
    STAGES.map((_, index) => String(index + 1)),
);

const HANDLED_KEYS = new Set([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "q",
    "e",
    " ",
    "Enter",
    ...STAGE_JUMP_KEYS,
]);

// 검색창·버튼 등 자체 키 동작이 있는 요소에 포커스가 있으면 보드 단축키를 넘긴다.
function isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    if (target.closest("[data-candidate-id]")) return false;
    return ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName);
}

// 키 입력을 해석만 하고 실제 이동/저장은 모르는 훅. 드래그앤드롭과 같은 액션 함수를 공유한다.
export function useBoardKeyboardControls({
    candidatesByStage,
    onMoveToStage,
    onOpenDetail,
    onUndo,
    enabled,
}: UseBoardKeyboardControlsOptions) {
    const [focusedCandidateId, setFocusedCandidateId] = useState<string | null>(
        null,
    );

    // 선택된 카드의 현재 스테이지/컬럼 내 인덱스를 찾는다.
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

    // 카드 DOM에 실제 포커스를 준다. 선택 상태는 곧 포커스이므로 이 함수가 곧 "선택".
    const focusCard = useCallback((candidateId: string) => {
        document
            .querySelector<HTMLElement>(`[data-candidate-id="${candidateId}"]`)
            ?.focus();
    }, []);

    // 아무 카드에도 포커스가 없을 때 방향키로 보드에 진입하는 경로.
    const focusFirstAvailable = useCallback(() => {
        for (const stage of STAGES) {
            const list = candidatesByStage[stage.id] ?? [];
            if (list.length > 0) {
                focusCard(list[0].id);
                return;
            }
        }
    }, [candidatesByStage, focusCard]);

    const focusedLocation = locate(focusedCandidateId);

    // 카드가 다른 컬럼으로 옮겨지면 React가 노드를 다시 만들어 포커스가 풀린다.
    // 위치가 바뀌었을 때 스크롤을 따라가고, 포커스가 풀려 있었다면 되돌려준다.
    useEffect(() => {
        if (!focusedCandidateId) return;
        const el = document.querySelector<HTMLElement>(
            `[data-candidate-id="${focusedCandidateId}"]`,
        );
        if (!el) return;

        el.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: "smooth",
        });

        // 사용자가 의도적으로 다른 요소(버튼 등)로 포커스를 옮긴 경우에는 빼앗지 않는다.
        const active = document.activeElement;
        const focusWasLost = active === null || active === document.body;
        if (enabled && focusWasLost) {
            el.focus({ preventScroll: true });
        }
    }, [
        enabled,
        focusedCandidateId,
        focusedLocation?.stageIndex,
        focusedLocation?.cardIndex,
    ]);

    // 보드 단축키 전체(방향키·q/e·숫자키·스페이스·Ctrl+Z)를 처리하는 keydown 리스너.
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (isInteractiveTarget(event.target)) return;

            if (
                (event.ctrlKey || event.metaKey) &&
                !event.shiftKey &&
                event.key.toLowerCase() === "z"
            ) {
                event.preventDefault();
                onUndo();
                return;
            }

            const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
            if (!HANDLED_KEYS.has(key)) return;

            // 조작 대상은 "지금 실제로 포커스된 카드"다.
            const focusedEl =
                event.target instanceof HTMLElement
                    ? event.target.closest<HTMLElement>("[data-candidate-id]")
                    : null;
            const activeCardId = focusedEl?.dataset.candidateId ?? null;

            const location = locate(activeCardId);
            if (!location) {
                if (key.startsWith("Arrow")) {
                    event.preventDefault();
                    focusFirstAvailable();
                }
                return;
            }

            const { stageIndex, cardIndex } = location;
            const currentList = candidatesByStage[STAGES[stageIndex].id] ?? [];

            if (STAGE_JUMP_KEYS.has(key)) {
                event.preventDefault();
                const targetIndex = Number(key) - 1;
                if (targetIndex !== stageIndex) {
                    onMoveToStage(
                        currentList[cardIndex].id,
                        STAGES[targetIndex].id,
                        cardIndex,
                    );
                }
                return;
            }

            switch (key) {
                case "ArrowUp":
                    event.preventDefault();
                    if (cardIndex > 0) {
                        focusCard(currentList[cardIndex - 1].id);
                    }
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    if (cardIndex < currentList.length - 1) {
                        focusCard(currentList[cardIndex + 1].id);
                    }
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    for (let i = stageIndex - 1; i >= 0; i--) {
                        const list = candidatesByStage[STAGES[i].id] ?? [];
                        if (list.length > 0) {
                            focusCard(list[Math.min(cardIndex, list.length - 1)].id);
                            break;
                        }
                    }
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    for (let i = stageIndex + 1; i < STAGES.length; i++) {
                        const list = candidatesByStage[STAGES[i].id] ?? [];
                        if (list.length > 0) {
                            focusCard(list[Math.min(cardIndex, list.length - 1)].id);
                            break;
                        }
                    }
                    break;
                case "q":
                    event.preventDefault();
                    onMoveToStage(
                        currentList[cardIndex].id,
                        STAGES[(stageIndex - 1 + STAGES.length) % STAGES.length].id,
                        cardIndex,
                    );
                    break;
                case "e":
                    event.preventDefault();
                    onMoveToStage(
                        currentList[cardIndex].id,
                        STAGES[(stageIndex + 1) % STAGES.length].id,
                        cardIndex,
                    );
                    break;
                case " ":
                case "Enter":
                    event.preventDefault();
                    onOpenDetail(currentList[cardIndex].id);
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [
        enabled,
        candidatesByStage,
        locate,
        focusCard,
        focusFirstAvailable,
        onMoveToStage,
        onOpenDetail,
        onUndo,
    ]);

    return { focusedCandidateId, setFocusedCandidateId };
}
