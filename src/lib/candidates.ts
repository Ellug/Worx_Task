import type { StageId } from "./stages";

export interface Candidate {
  id: string;
  name: string;
  position: string;
  appliedAt: string;
  stageId: StageId;
  email: string;
  phone: string;
  note: string;
}

// mock API(candidate-store)의 초기 시드 데이터.
export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "김도윤",
    position: "프론트엔드 엔지니어",
    appliedAt: "2026-07-28",
    stageId: "document-review",
    email: "doyoon.kim@example.com",
    phone: "010-1234-5678",
    note: "React/TypeScript 4년차, 대규모 SPA 리팩토링 경험 보유.",
  },
  {
    id: "c2",
    name: "이서연",
    position: "백엔드 엔지니어",
    appliedAt: "2026-07-25",
    stageId: "document-review",
    email: "seoyeon.lee@example.com",
    phone: "010-2345-6789",
    note: "분산 시스템/메시지 큐 설계 경험, Kotlin·Spring 주력.",
  },
  {
    id: "c3",
    name: "박지훈",
    position: "프로덕트 디자이너",
    appliedAt: "2026-07-20",
    stageId: "interview",
    email: "jihoon.park@example.com",
    phone: "010-3456-7890",
    note: "0-1 프로덕트 디자인 경험 다수, 디자인 시스템 구축 리드.",
  },
  {
    id: "c4",
    name: "최민서",
    position: "프론트엔드 엔지니어",
    appliedAt: "2026-07-15",
    stageId: "offer",
    email: "minseo.choi@example.com",
    phone: "010-4567-8901",
    note: "웹 성능 최적화 및 접근성 개선 프로젝트 다수 진행.",
  },
  {
    id: "c5",
    name: "정하은",
    position: "데이터 엔지니어",
    appliedAt: "2026-07-10",
    stageId: "final-accepted",
    email: "haeun.jung@example.com",
    phone: "010-5678-9012",
    note: "실시간 데이터 파이프라인 구축, Kafka/Airflow 운영 경험.",
  },
  {
    id: "c6",
    name: "장우진",
    position: "백엔드 엔지니어",
    appliedAt: "2026-07-05",
    stageId: "rejected",
    email: "woojin.jang@example.com",
    phone: "010-6789-0123",
    note: "인증 도메인 근무 경험, 이번 포지션과 요구 스택 불일치로 보류.",
  },
];
