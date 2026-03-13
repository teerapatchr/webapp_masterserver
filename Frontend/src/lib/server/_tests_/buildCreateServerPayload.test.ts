import { describe, it, expect } from "vitest";
import { buildCreateServerPayload } from "../buildCreateServerPayload";

type TestForm = Record<string, string>;

describe("buildCreateServerPayload", () => {
    it("converts empty strings to undefined", () => {
        const form: TestForm = {
            server_name: "",
            ip_address: "",
        };

        const payload = buildCreateServerPayload(form);

        expect(payload.server_name).toBeUndefined();
        expect(payload.ip_address).toBeUndefined();
    });

    it("keeps valid values", () => {
        const form: TestForm = {
            server_name: "PTTEP-SRV-01",
            ip_address: "10.10.1.1",
        };

        const payload = buildCreateServerPayload(form);

        expect(payload.server_name).toBe("PTTEP-SRV-01");
        expect(payload.ip_address).toBe("10.10.1.1");
    });
});