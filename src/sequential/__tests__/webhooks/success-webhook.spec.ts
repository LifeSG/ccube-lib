import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { SuccessWebhookRequestApiDomain } from "../../webhooks";

describe("SuccessWebhookRequestApiDomain", () => {
    it("should pass validation with all fields", () => {
        const dto: SuccessWebhookRequestApiDomain = {
            sessionId: "session-id",
            sessionData: { "action-1-key": "action-data" },
            extraData: { data: "extra-data" },
        };
        const domain = plainToInstance(SuccessWebhookRequestApiDomain, dto);
        expect(validateSync(domain)).toHaveLength(0);
    });

    it("should pass validation without optional fields", () => {
        const dto: SuccessWebhookRequestApiDomain = {
            sessionId: "session-id",
        };
        const domain = plainToInstance(SuccessWebhookRequestApiDomain, dto);
        expect(validateSync(domain)).toHaveLength(0);
    });
});
