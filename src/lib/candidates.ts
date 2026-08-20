import type { StageId } from "./stages";

export interface Candidate {
  id: string;
  name: string;
  position: string;
  appliedAt: string;
  stageId: StageId;
}

// mock API(candidate-store)의 초기 시드 데이터.
export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "김도윤",
    position: "프론트엔드 엔지니어",
    appliedAt: "2026-07-28",
    stageId: "document-review",
  },
  {
    id: "c2",
    name: "이서연",
    position: "백엔드 엔지니어",
    appliedAt: "2026-07-25",
    stageId: "document-review",
  },
  {
    id: "c3",
    name: "박지훈",
    position: "프로덕트 디자이너",
    appliedAt: "2026-07-20",
    stageId: "interview",
  },
  {
    id: "c4",
    name: "최민서",
    position: "프론트엔드 엔지니어",
    appliedAt: "2026-07-15",
    stageId: "offer",
  },
  {
    id: "c5",
    name: "정하은",
    position: "데이터 엔지니어",
    appliedAt: "2026-07-10",
    stageId: "final-accepted",
  },
  {
    id: "c6",
    name: "장우진",
    position: "백엔드 엔지니어",
    appliedAt: "2026-07-05",
    stageId: "rejected",
  },
];
