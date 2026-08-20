import { ORDER_GAP } from "./candidates";

// beforeOrder와 afterOrder 사이에 끼워 넣을 새 order를 계산한다.
// 두 값의 중간을 더 이상 정밀하게 표현할 수 없으면(충돌) null을 반환한다.
// 서버(candidate-store)와 클라이언트(Board의 낙관적 업데이트)가 동일한 로직을 공유한다.
export function computeOrderBetween(
  beforeOrder: number | null,
  afterOrder: number | null,
): number | null {
  if (beforeOrder === null && afterOrder === null) {
    return ORDER_GAP;
  }

  if (beforeOrder === null) {
    const candidate = afterOrder! / 2;
    return candidate > 0 && candidate < afterOrder! ? candidate : null;
  }

  if (afterOrder === null) {
    return beforeOrder + ORDER_GAP;
  }

  const mid = (beforeOrder + afterOrder) / 2;
  return mid > beforeOrder && mid < afterOrder ? mid : null;
}
