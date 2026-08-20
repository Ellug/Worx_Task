import { NextResponse } from "next/server";
import { getCandidates } from "@/lib/server/candidate-store";
import {
    shouldSimulateFailure,
    simulateNetworkDelay,
} from "@/lib/server/simulate-network";

export async function GET() {
    await simulateNetworkDelay();

    if (shouldSimulateFailure()) {
        return NextResponse.json(
            { message: "지원자 목록을 불러오지 못했습니다." },
            { status: 500 },
        );
    }

    return NextResponse.json(getCandidates());
}
