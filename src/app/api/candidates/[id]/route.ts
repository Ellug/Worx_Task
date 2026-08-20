import { NextResponse, type NextRequest } from "next/server";
import { updateCandidateStage } from "@/lib/server/candidate-store";
import {
  shouldSimulateFailure,
  simulateNetworkDelay,
} from "@/lib/server/simulate-network";
import { isStageId } from "@/lib/stages";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const stageId = body?.stageId;

  if (typeof stageId !== "string" || !isStageId(stageId)) {
    return NextResponse.json(
      { message: "유효하지 않은 단계입니다." },
      { status: 400 },
    );
  }

  await simulateNetworkDelay();

  if (shouldSimulateFailure()) {
    return NextResponse.json(
      { message: "일시적인 오류로 저장에 실패했습니다." },
      { status: 500 },
    );
  }

  const updated = updateCandidateStage(id, stageId);

  if (!updated) {
    return NextResponse.json(
      { message: "지원자를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}
