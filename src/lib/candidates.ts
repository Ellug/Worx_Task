import { STAGES, type StageId } from "./stages";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stageId: StageId;
  appliedAt: string;
  note: string;
  education: string;
  experience: string;
  coverLetter: string;
  resumeUrl: string;
  experienceYears: number;
  location: string;
  skills: string[];
}

const FAMILY_NAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];

const FIRST_NAMES = [
  "민준",
  "서연",
  "도윤",
  "지우",
  "하은",
  "예준",
  "수빈",
  "현우",
  "지민",
  "서준",
];

const POSITIONS = [
  "프론트엔드 개발자",
  "백엔드 개발자",
  "풀스택 개발자",
  "프로덕트 디자이너",
  "데이터 분석가",
  "프로덕트 매니저",
  "QA 엔지니어",
  "DevOps 엔지니어",
];

const SKILL_SETS = [
  ["React", "TypeScript", "Next.js"],
  ["Node.js", "TypeScript", "PostgreSQL"],
  ["Python", "FastAPI", "Docker"],
  ["Figma", "사용자 조사", "프로토타이핑"],
  ["SQL", "Python", "Tableau"],
  ["Agile", "제품 분석", "로드맵"],
  ["Playwright", "Jest", "테스트 자동화"],
  ["AWS", "Kubernetes", "Terraform"],
];

const LOCATIONS = [
  "서울",
  "경기",
  "인천",
  "대전",
  "부산",
  "대구",
];

const UNIVERSITIES = [
  "서울대학교 컴퓨터공학과",
  "연세대학교 산업공학과",
  "고려대학교 소프트웨어학과",
  "성균관대학교 정보통신공학과",
  "한양대학교 전자공학과",
  "이화여자대학교 디자인학과",
];

const STAGE_IDS = STAGES.map(({ id }) => id);

export const MOCK_CANDIDATE_COUNT = 1000;

function formatAppliedAt(index: number) {
  const date = new Date(Date.UTC(2026, 0, 1 + (index % 180)));

  return date.toISOString().slice(0, 10);
}

export function createMockCandidates(count = MOCK_CANDIDATE_COUNT): Candidate[] {
  const normalizedCount = Math.max(0, Math.floor(count));

  return Array.from({ length: normalizedCount }, (_, index) => {
    const sequence = index + 1;
    const familyName = FAMILY_NAMES[index % FAMILY_NAMES.length];
    const firstName =
      FIRST_NAMES[Math.floor(index / FAMILY_NAMES.length) % FIRST_NAMES.length];
    const positionIndex = index % POSITIONS.length;
    const experienceYears = index % 11;
    const name = `${familyName}${firstName}`;
    const position = POSITIONS[positionIndex];

    return {
      id: `candidate-${String(sequence).padStart(4, "0")}`,
      name,
      email: `candidate${String(sequence).padStart(4, "0")}@example.com`,
      phone: `010-${String(1000 + sequence).slice(-4)}-${String(2000 + sequence).slice(-4)}`,
      position,
      stageId: STAGE_IDS[index % STAGE_IDS.length],
      appliedAt: formatAppliedAt(index),
      note: `${position} 지원자. ${experienceYears === 0 ? "신입" : `${experienceYears}년`} 경력과 ${LOCATIONS[index % LOCATIONS.length]} 근무 희망을 보유하고 있습니다.`,
      education: `${UNIVERSITIES[index % UNIVERSITIES.length]} 졸업`,
      experience:
        experienceYears === 0
          ? "신입 지원자"
          : `${experienceYears}년차 ${position} 경력`,
      coverLetter: `${name}님은 ${position} 포지션에 지원했습니다. 문제를 구조적으로 해결하고 팀과 적극적으로 협업하는 것을 중요하게 생각합니다.`,
      resumeUrl: `/mock-resumes/candidate-${String(sequence).padStart(4, "0")}.pdf`,
      experienceYears,
      location: LOCATIONS[index % LOCATIONS.length],
      skills: [...SKILL_SETS[positionIndex]],
    };
  });
}

export const INITIAL_CANDIDATES = createMockCandidates();
export const MOCK_CANDIDATES = INITIAL_CANDIDATES;
