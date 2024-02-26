import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { SessionStatus, UserLoginType } from "../common";
import { GetSessionResponseDataApiDomain } from "../get-session";

describe("get-session", () => {
    describe("GetSessionResponseDataApiDomain", () => {
        it("should pass validation with all fields", () => {
            const dto: GetSessionResponseDataApiDomain = {
                sessionId: "session-id",
                sessionData: { action: { data: "action-data" } },
                extraData: { valid: true },
                userIdentifiers: {
                    uinfin: "S1234567D",
                    loginType: UserLoginType.SP,
                },
                status: SessionStatus.INCOMPLETE,
            };
            const domain = plainToInstance(
                GetSessionResponseDataApiDomain,
                dto
            );
            expect(validateSync(domain)).toHaveLength(0);
        });

        it("should pass validation without optional fields", () => {
            const dto: GetSessionResponseDataApiDomain = {
                sessionId: "session-id",
                sessionData: { action: { data: "action-data" } },
                status: SessionStatus.INCOMPLETE,
            };
            const domain = plainToInstance(
                GetSessionResponseDataApiDomain,
                dto
            );
            expect(validateSync(domain)).toHaveLength(0);
        });

        describe("sessionId", () => {
            it("should fail for mandatory field", () => {
                const dto: GetSessionResponseDataApiDomain = {
                    sessionId: undefined as any,
                    sessionData: { action: { data: "action-data" } },
                    status: SessionStatus.INCOMPLETE,
                };
                const domain = plainToInstance(
                    GetSessionResponseDataApiDomain,
                    dto
                );
                expect(validateSync(domain)).toHaveLength(1);
            });

            it.each([1, ""])("should fail for invalid input", (input: any) => {
                const dto: GetSessionResponseDataApiDomain = {
                    sessionId: input,
                    sessionData: { action: { data: "action-data" } },
                    status: SessionStatus.INCOMPLETE,
                };
                const domain = plainToInstance(
                    GetSessionResponseDataApiDomain,
                    dto
                );
                expect(validateSync(domain)).toHaveLength(1);
            });
        });

        describe("sessionData", () => {
            it.each([undefined, 1, []])(
                "should fail for invalid input",
                (input: any) => {
                    const dto: GetSessionResponseDataApiDomain = {
                        sessionId: "session-id",
                        sessionData: input,
                        status: SessionStatus.INCOMPLETE,
                    };
                    const domain = plainToInstance(
                        GetSessionResponseDataApiDomain,
                        dto
                    );
                    expect(validateSync(domain)).toHaveLength(1);
                }
            );
        });

        describe("extraData", () => {
            it.each([1, []])("should fail for invalid input", (input: any) => {
                const dto: GetSessionResponseDataApiDomain = {
                    sessionId: "session-id",
                    sessionData: { action: { data: "action-data" } },
                    status: SessionStatus.INCOMPLETE,
                    extraData: input,
                };
                const domain = plainToInstance(
                    GetSessionResponseDataApiDomain,
                    dto
                );
                expect(validateSync(domain)).toHaveLength(1);
            });
        });

        describe("userIdentifiers", () => {
            it.each([1, []])("should fail for invalid input", (input: any) => {
                const dto: GetSessionResponseDataApiDomain = {
                    sessionId: "session-id",
                    sessionData: { action: { data: "action-data" } },
                    status: SessionStatus.INCOMPLETE,
                    userIdentifiers: input,
                };
                const domain = plainToInstance(
                    GetSessionResponseDataApiDomain,
                    dto
                );
                expect(validateSync(domain)).toHaveLength(1);
            });
        });

        describe("status", () => {
            it.each([undefined, 1])(
                "should fail for invalid input",
                (input: any) => {
                    const dto: GetSessionResponseDataApiDomain = {
                        sessionId: "session-id",
                        sessionData: { action: { data: "action-data" } },
                        status: input,
                    };
                    const domain = plainToInstance(
                        GetSessionResponseDataApiDomain,
                        dto
                    );
                    expect(validateSync(domain)).toHaveLength(1);
                }
            );
        });
    });
});
