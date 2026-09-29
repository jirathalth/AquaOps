import { describe, expect, it } from "vitest";
import { getSafeReturnTo } from "@/lib/redirect";

describe("getSafeReturnTo", () => { it("accepts internal paths", () => { expect(getSafeReturnTo("/sales/orders?status=pending")).toBe("/sales/orders?status=pending"); }); it("rejects open redirects and login loops", () => { expect(getSafeReturnTo("//evil.example")).toBe("/dashboard"); expect(getSafeReturnTo("https://evil.example")).toBe("/dashboard"); expect(getSafeReturnTo("/login")).toBe("/dashboard"); }); });
