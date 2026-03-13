import { describe, it, expect } from "vitest";
import { buildServerQueryParams } from "../../server-api";

describe("buildServerQueryParams", () => {

    it("ignores ALL filters", () => {
        const params = buildServerQueryParams({
            location: "ALL",
            status: "ALL",
        });

        expect(params.get("location")).toBeNull();
        expect(params.get("status")).toBeNull();
    });

    it("adds valid filters", () => {
        const params = buildServerQueryParams({
            status: "Operation",
            power: "Power On",
        });

        expect(params.get("status")).toBe("Operation");
        expect(params.get("power")).toBe("Power On");
    });

    it("sets default pagination", () => {
        const params = buildServerQueryParams({});

        expect(params.get("page")).toBe("1");
        expect(params.get("limit")).toBe("50");
    });

});