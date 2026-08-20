import { NextResponse, type NextRequest } from "next/server";
import { reorderCandidate } from "@/lib/server/candidate-store";
import { shouldSimulateFailure, simulateNetworkDelay } from "@/lib/server/simulate-network";
import { isStageId } from "@/lib/stages";

function isNullableId(value: unknown): value is string | null {
    return value === null || typeof value === "string";
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const stageId = body?.stageId;
    const beforeId = body?.beforeId ?? null;
    const afterId = body?.afterId ?? null;

    if (
        typeof stageId !== "string" ||
        !isStageId(stageId) ||
        !isNullableId(beforeId) ||
        !isNullableId(afterId)
    ) {
        return NextResponse.json(
            { message: "유효하지 않은 요청입니다." },
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

    const updated = reorderCandidate(id, stageId, beforeId, afterId);

    if (!updated) {
        return NextResponse.json(
            { message: "지원자를 찾을 수 없습니다." },
            { status: 404 },
        );
    }

    return NextResponse.json(updated);
}
