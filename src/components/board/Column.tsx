import { Children, type ReactNode } from "react";
import type { Stage, StageTone } from "@/lib/stages";

const toneDotClassName: Record<StageTone, string> = {
  default: "bg-zinc-400 dark:bg-zinc-500",
  success: "bg-emerald-500",
  reject: "bg-rose-500",
};

interface ColumnProps {
  stage: Stage;
  children?: ReactNode;
}

export function Column({ stage, children }: ColumnProps) {
  const count = Children.count(children);

  return (
    <section
      aria-label={stage.name}
      className="flex h-full w-72 shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${toneDotClassName[stage.tone]}`}
          />
          {stage.name}
        </h2>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {count}
        </span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {count > 0 ? (
          children
        ) : (
          <p className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
            지원자 카드가 없습니다
          </p>
        )}
      </div>
    </section>
  );
}
