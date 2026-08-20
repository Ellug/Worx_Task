"use client";

interface FilterBarProps {
    nameQuery: string;
    onNameQueryChange: (value: string) => void;
    positions: string[];
    selectedPositions: Set<string>;
    onTogglePosition: (position: string) => void;
}

export function FilterBar({
    nameQuery,
    onNameQueryChange,
    positions,
    selectedPositions,
    onTogglePosition,
}: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-4 border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
            <label className="flex items-center gap-2">
                <span className="sr-only">이름 검색</span>
                <input
                    type="search"
                    value={nameQuery}
                    onChange={(event) => onNameQueryChange(event.target.value)}
                    placeholder="이름으로 검색"
                    className="w-56 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
            </label>
            {positions.length > 0 && (
                <fieldset className="flex flex-wrap items-center gap-3">
                    <legend className="sr-only">직무 필터</legend>
                    {positions.map((position) => (
                        <label
                            key={position}
                            className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400"
                        >
                            <input
                                type="checkbox"
                                checked={selectedPositions.has(position)}
                                onChange={() => onTogglePosition(position)}
                                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
                            />
                            {position}
                        </label>
                    ))}
                </fieldset>
            )}
        </div>
    );
}
