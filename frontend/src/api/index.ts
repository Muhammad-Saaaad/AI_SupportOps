import { createHttpApi } from "./http";
import { createMockApi } from "./mock";
export const dataMode =
  import.meta.env.VITE_DATA_MODE === "api" ? "api" : "mock";
let storage: Storage | undefined;
try {
  storage = window.localStorage;
} catch {
  /* Storage can be disabled by the browser. */
}
export const api =
  dataMode === "api"
    ? createHttpApi(
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
      )
    : createMockApi(storage);
