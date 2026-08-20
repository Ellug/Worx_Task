import { STAGES } from "@/lib/stages";
import { Column } from "./Column";

export function Board() {
  return (
    <div className="flex h-full items-start gap-4 overflow-x-auto p-6">
      {STAGES.map((stage) => (
        <Column key={stage.id} stage={stage} />
      ))}
    </div>
  );
}
