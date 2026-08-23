// 과제 요구사항의 네트워크 지연(200~800ms)·실패율(15%) 시뮬레이션 값.
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 800;
const FAILURE_RATE = 0.15;

export async function simulateNetworkDelay(): Promise<void> {
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    await new Promise((resolve) => setTimeout(resolve, delay));
}

export function shouldSimulateFailure(): boolean {
    return Math.random() < FAILURE_RATE;
}
