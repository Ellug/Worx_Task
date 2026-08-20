export type StageId =
  | "document-review"
  | "interview"
  | "offer"
  | "final-accepted"
  | "rejected";

export type StageTone = "default" | "success" | "reject";

export interface Stage {
  id: StageId;
  name: string;
  tone: StageTone;
}

export const STAGES: Stage[] = [
  { id: "document-review", name: "서류검토", tone: "default" },
  { id: "interview", name: "면접", tone: "default" },
  { id: "offer", name: "처우협의", tone: "default" },
  { id: "final-accepted", name: "최종합격", tone: "success" },
  { id: "rejected", name: "불합격", tone: "reject" },
];
