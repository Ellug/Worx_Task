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

export const STAGE_DOT_TONE_CLASSNAME: Record<StageTone, string> = {
  default: "bg-zinc-400 dark:bg-zinc-500",
  success: "bg-emerald-500",
  reject: "bg-rose-500",
};

export const STAGE_BADGE_TONE_CLASSNAME: Record<StageTone, string> = {
  default: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  reject: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};
