import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { CustomRedirectConfig } from "../../common";

describe("CustomRedirectConfig", () => {
    it("should pass validation with all fields", () => {
        const dto: CustomRedirectConfig = {
            cancelRedirectUrl: "",
        };
        const domain = plainToInstance(CustomRedirectConfig, dto);
        expect(validateSync(domain)).toHaveLength(1);
    });

    it("should pass validation without optional fields", () => {
        const dto: CustomRedirectConfig = {
            cancelRedirectUrl: null,
        };
        const domain = plainToInstance(CustomRedirectConfig, dto);
        expect(validateSync(domain)).toHaveLength(0);
    });

    describe("cancelRedirectUrl", () => {
        it.each([
            1,
            "",
            "http://www.google.com",
            "https://google",
            "google.com",
            "ssh://google.com",
        ])("should fail for invalid input", (input: any) => {
            const dto: CustomRedirectConfig = {
                cancelRedirectUrl: input,
            };
            const domain = plainToInstance(CustomRedirectConfig, dto);
            expect(validateSync(domain)).toHaveLength(1);
        });
    });
});
