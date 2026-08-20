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
    ...STAGE_JUMP_KEYS,
]);

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

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
        onUndo,
    ]);

    return { focusedCandidateId };
}
