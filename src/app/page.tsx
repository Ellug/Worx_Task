import { Board } from "@/components/board/Board";
import { SAMPLE_CANDIDATES } from "@/lib/candidates";

export default function Home() {
  return (
    <div className="flex h-full flex-col font-sans">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          채용 파이프라인 보드
        </h1>
      </header>
      <main className="min-h-0 flex-1">
        <Board candidates={SAMPLE_CANDIDATES} />
      </main>
    </div>
  );
}
