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
  education: string;
  experience: string;
  coverLetter: string;
  resumeUrl: string;
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
    education: "한양대학교 컴퓨터공학과 졸업 (2018~2022)",
    experience: "스타트업 A사 프론트엔드 개발자 2년 (React, TypeScript)",
    coverLetter:
      "사용자 경험을 최우선으로 생각하며 프론트엔드 개발을 해왔습니다. 대규모 SPA 리팩토링 프로젝트를 주도하며 성능 최적화와 코드 품질 개선에 기여했습니다. 새로운 기술을 빠르게 학습하고 팀에 적용하는 것을 즐깁니다.",
    resumeUrl: "https://example.com/resumes/c1-kimdoyoon.pdf",
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
    education: "고려대학교 소프트웨어학과 졸업 (2017~2021)",
    experience: "B사 백엔드 개발자 3년 (Kotlin, Spring, Kafka)",
    coverLetter:
      "분산 시스템과 대용량 트래픽 처리에 관심이 많아 메시지 큐 기반 아키텍처를 설계하고 운영해왔습니다. 장애 대응 경험을 바탕으로 안정적인 서비스 운영에 자신 있습니다.",
    resumeUrl: "https://example.com/resumes/c2-leeseoyeon.pdf",
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
    education: "국민대학교 시각디자인학과 졸업 (2015~2019)",
    experience: "C사 프로덕트 디자이너 4년 (0-1 프로덕트, 디자인 시스템 구축)",
    coverLetter:
      "사용자 리서치부터 프로토타이핑까지 전 과정에 참여하며 데이터 기반 의사결정을 중요하게 생각합니다. 여러 프로덕트의 디자인 시스템을 구축하며 일관된 사용자 경험을 만드는 데 기여했습니다.",
    resumeUrl: "https://example.com/resumes/c3-parkjihoon.pdf",
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
    education: "이화여자대학교 컴퓨터공학과 졸업 (2016~2020)",
    experience: "D사 프론트엔드 개발자 3년 (웹 접근성, 성능 최적화)",
    coverLetter:
      "모든 사용자가 불편함 없이 서비스를 이용할 수 있도록 웹 접근성 개선에 힘써왔습니다. Core Web Vitals 지표 개선 프로젝트를 통해 페이지 로딩 속도를 40% 단축한 경험이 있습니다.",
    resumeUrl: "https://example.com/resumes/c4-choiminseo.pdf",
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
    education: "연세대학교 산업공학과 졸업 (2016~2020)",
    experience: "E사 데이터 엔지니어 3년 (Kafka, Airflow, 실시간 파이프라인)",
    coverLetter:
      "실시간 데이터 파이프라인을 설계하고 운영하며 데이터 품질과 안정성을 최우선으로 생각해왔습니다. 대용량 데이터 처리 경험을 바탕으로 효율적인 데이터 인프라를 구축하는 데 자신 있습니다.",
    resumeUrl: "https://example.com/resumes/c5-junghaeun.pdf",
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
    education: "성균관대학교 정보통신공학과 졸업 (2014~2018)",
    experience: "F사 백엔드 개발자 5년 (인증/인가 도메인)",
    coverLetter:
      "인증 및 보안 도메인에서 오랜 기간 근무하며 안전한 서비스 설계에 대한 전문성을 쌓아왔습니다. 다양한 인증 프로토콜 구현 경험이 있습니다.",
    resumeUrl: "https://example.com/resumes/c6-jangwoojin.pdf",
  },
];
