interface BoardStatusProps {
    message: string;
    onRetry?: () => void;
}

// 보드 영역을 대신 채우는 로딩·에러 표시. 재시도 핸들러가 있으면 버튼도 같이 보여준다.
export function BoardStatus({ message, onRetry }: BoardStatusProps) {
    const tone = onRetry
        ? "text-zinc-500 dark:text-zinc-400"
        : "text-zinc-400 dark:text-zinc-600";

    return (
        <div
            className={`flex h-full flex-col items-center justify-center gap-3 text-sm ${tone}`}
        >
            <p>{message}</p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    다시 시도
                </button>
            )}
        </div>
    );
}
