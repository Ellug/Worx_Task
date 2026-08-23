"use client";

import { useEffect } from "react";

interface ErrorToastProps {
    message: string;
    onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
    // 4초 후 자동으로 닫는다.
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    return (
        <div
            role="alert"
            className="fixed bottom-6 right-6 flex max-w-sm items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
        >
            <span className="flex-1">{message}</span>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="닫기"
                className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200"
            >
                ×
            </button>
        </div>
    );
}
