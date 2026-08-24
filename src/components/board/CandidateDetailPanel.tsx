"use client";

import { useEffect, useRef } from "react";
import type { Candidate } from "@/lib/candidates";
import { STAGES, STAGE_BADGE_TONE_CLASSNAME } from "@/lib/stages";

interface CandidateDetailPanelProps {
    candidate: Candidate;
    onClose: () => void;
}

export function CandidateDetailPanel({
    candidate,
    onClose,
}: CandidateDetailPanelProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLElement>(null);
    const stage = STAGES.find((s) => s.id === candidate.stageId);

    // 패널이 열리면 닫기 버튼으로 포커스를 옮긴다.
    // (닫힌 뒤 원래 카드로 돌아가는 것은 useBoardKeyboardControls가 처리한다.)
    useEffect(() => {
        closeButtonRef.current?.focus();
    }, [candidate.id]);

    // Esc로 닫고, Tab은 패널 안에서만 순환하도록 가둔다.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }
            if (event.key !== "Tab") return;

            const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (!focusables || focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <>
            <div
                aria-hidden
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/30"
            />
            <aside
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={`${candidate.name} 상세 정보`}
                className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:w-1/2"
            >
                <header className="flex items-start justify-between gap-2 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                    <div>
                        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                            {candidate.name}
                        </h2>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                            {candidate.position}
                        </p>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="닫기"
                        className="rounded p-1 text-lg leading-none text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        ×
                    </button>
                </header>

                <dl className="flex-1 space-y-4 px-5 py-5 text-sm">
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            현재 단계
                        </dt>
                        <dd className="mt-1">
                            {stage && (
                                <span
                                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_BADGE_TONE_CLASSNAME[stage.tone]}`}
                                >
                                    {stage.name}
                                </span>
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            지원일
                        </dt>
                        <dd className="mt-1 text-zinc-700 dark:text-zinc-300">
                            {candidate.appliedAt}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            이메일
                        </dt>
                        <dd className="mt-1 text-zinc-700 dark:text-zinc-300">
                            {candidate.email}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            연락처
                        </dt>
                        <dd className="mt-1 text-zinc-700 dark:text-zinc-300">
                            {candidate.phone}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            학력
                        </dt>
                        <dd className="mt-1 text-zinc-700 dark:text-zinc-300">
                            {candidate.education}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            경력
                        </dt>
                        <dd className="mt-1 text-zinc-700 dark:text-zinc-300">
                            {candidate.experience}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            자기소개서
                        </dt>
                        <dd className="mt-1 leading-relaxed text-zinc-700 dark:text-zinc-300">
                            {candidate.coverLetter}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            이력서
                        </dt>
                        <dd className="mt-1">
                            <a
                                href={candidate.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                이력서 보기 ↗
                            </a>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-zinc-400 dark:text-zinc-600">
                            메모
                        </dt>
                        <dd className="mt-1 leading-relaxed text-zinc-700 dark:text-zinc-300">
                            {candidate.note}
                        </dd>
                    </div>
                </dl>
            </aside>
        </>
    );
}
