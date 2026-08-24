import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    // 테스트에서도 "@/lib/order" 같은 tsconfig 경로 별칭을 그대로 쓰기 위해 필요.
    resolve: { tsconfigPaths: true },
    test: {
        // 훅 테스트는 브라우저 API(document 등)가 필요하므로 jsdom으로 흉내낸다.
        environment: "jsdom",
        include: ["src/**/*.test.{ts,tsx}"],
    },
});
