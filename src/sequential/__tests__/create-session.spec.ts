import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import {
    CreateSessionRequestBodyApiDomain,
    CreateSessionResponseDataApiDomain,
} from "../create-session";

describe("create-session", () => {
    describe("CreateSessionRequestBodyApiDomain", () => {
        it("should pass validation with all fields", () => {
            const dto: CreateSessionRequestBodyApiDomain = {
                extraData: { valid: true },
                customRedirectConfig: {
                    cancelRedirectUrl: "https://www.google.com",
                },
            };
            const domain = plainToInstance(
                CreateSessionRequestBodyApiDomain,
                dto
            );
            expect(validateSync(domain)).toHaveLength(0);
        });

        it("should pass validation without optional fields", () => {
            const dto: CreateSessionRequestBodyApiDomain = {
                extraData: null,
                customRedirectConfig: null,
            };
            const domain = plainToInstance(
                CreateSessionRequestBodyApiDomain,
                dto
            );
            expect(validateSync(domain)).toHaveLength(0);
        });

        describe("extraData", () => {
            it.each([1, []])("should fail for invalid input", (input: any) => {
                const dto: CreateSessionRequestBodyApiDomain = {
                    extraData: input,
                };
                const domain = plainToInstance(
                    CreateSessionRequestBodyApiDomain,
                    dto
                );
                expect(validateSync(domain)).toHaveLength(1);
            });
        });

        describe("customRedirectConfig", () => {
            it("should validate nested fields", () => {
                const dto: CreateSessionRequestBodyApiDomain = {
                    customRedirectConfig: { cancelRedirectUrl: "" },
                };
                const domain = plainToInstance(
                    CreateSessionRequestBodyApiDomain,
                    dto
                );
                expect(validateSync(domain)).toHaveLength(1);
            });
        });
    });

    describe("CreateSessionResponseDataApiDomain", () => {
        it("should pass validation with all fields", () => {
            const dto: CreateSessionResponseDataApiDomain = {
                redirectUrl: "https://www.life.gov.sg",
                sessionId: "session-id",
            };
            const domain = plainToInstance(
                CreateSessionResponseDataApiDomain,
                dto
            );
            expect(validateSync(domain)).toHaveLength(0);
        });

        describe("redirectUrl", () => {
            it.each([1, ""])("should fail for invalid input", (input: any) => {
                const dto: CreateSessionResponseDataApiDomain = {
                    redirectUrl: input,
                    sessionId: "session-id",
                };
                const domain = plainToInstance(
                    CreateSessionResponseDataApiDomain,
                    dto
                );
                expect(validateSync(domain)).toHaveLength(1);
            });
        });

        describe("sessionId", () => {
            it.each([1, ""])("should fail for invalid input", (input: any) => {
                const dto: CreateSessionResponseDataApiDomain = {
                    redirectUrl: input,
                    sessionId: "session-id",
                };
                const domain = plainToInstance(
                    CreateSessionResponseDataApiDomain,
                    dto
                );
                expect(validateSync(domain)).toHaveLength(1);
            });
        });
    });
});
