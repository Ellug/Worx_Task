import type { Candidate } from "@/lib/candidates";
import { STAGES } from "@/lib/stages";
import { CandidateCard } from "./CandidateCard";
import { Column } from "./Column";

interface BoardProps {
  candidates: Candidate[];
}

export function Board({ candidates }: BoardProps) {
  return (
    <div className="flex h-full items-start gap-4 overflow-x-auto p-6">
      {STAGES.map((stage) => (
        <Column key={stage.id} stage={stage}>
          {candidates
            .filter((candidate) => candidate.stageId === stage.id)
            .map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
        </Column>
      ))}
    </div>
  );
}
