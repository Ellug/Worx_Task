import { Board } from "@/components/board/Board";
import { getCandidates } from "@/lib/server/candidate-store";

// mock API 저장소를 매 요청마다 다시 읽어야 새로고침 시 최신 상태가 반영된다.
export const dynamic = "force-dynamic";

export default function Home() {
  const candidates = getCandidates();

  return (
    <div className="flex h-full flex-col font-sans">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          채용 파이프라인 보드
        </h1>
      </header>
      <main className="min-h-0 flex-1">
        <Board initialCandidates={candidates} />
      </main>
    </div>
  );
}
