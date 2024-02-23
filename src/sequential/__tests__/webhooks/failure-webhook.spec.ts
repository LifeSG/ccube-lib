import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { FailureWebhookRequestBodyApiDomain } from "../../webhooks";

describe("FailureWebhookRequestBodyApiDomain", () => {
    it("should pass validation with all fields", () => {
        const dto: FailureWebhookRequestBodyApiDomain = {
            sessionId: "session-id",
            failedAction: {
                name: "action name",
                key: "action-key",
            },
            errorDetails: {
                httpStatusCode: "400",
                errorMessage: "Unknown",
            },
            extraData: { data: "extra-data" },
        };
        const domain = plainToInstance(FailureWebhookRequestBodyApiDomain, dto);
        expect(validateSync(domain)).toHaveLength(0);
    });

    it("should pass validation without optional fields", () => {
        const dto: FailureWebhookRequestBodyApiDomain = {
            sessionId: "session-id",
            failedAction: null,
            errorDetails: {
                httpStatusCode: "400",
                errorMessage: "Unknown",
            },
            extraData: null,
        };
        const domain = plainToInstance(FailureWebhookRequestBodyApiDomain, dto);
        expect(validateSync(domain)).toHaveLength(0);
    });
});
