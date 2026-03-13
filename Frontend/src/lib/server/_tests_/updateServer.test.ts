import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateServer } from "../server-api";

vi.stubGlobal("fetch", vi.fn());

describe("updateServer", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("calls API with PUT and correct body", async () => {
        const mockResponse = { id: "1", server_name: "Updated Server" };

        const mockedFetch = fetch as unknown as ReturnType<typeof vi.fn>;

        mockedFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const patch = { server_name: "Updated Server" };

        const result = await updateServer("1", patch);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/servers/1"),
            expect.objectContaining({
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            })
        );

        expect(result).toEqual(mockResponse);
    });

});