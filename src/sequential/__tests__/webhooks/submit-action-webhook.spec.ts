import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { SubmitActionWebhookRequestBodyApiDomain } from "../../webhooks";

describe("SubmitActionWebhookRequestBodyApiDomain", () => {
    it("should pass validation with all fields", () => {
        const dto: SubmitActionWebhookRequestBodyApiDomain = {
            sessionId: "session-id",
            sessionData: { "action-1-key": "action-data" },
            extraData: { data: "extra-data" },
            flowAction: {
                name: "action 2 name",
                key: "action-2-key",
            },
            actionData: { field: "value" },
            serviceConfigName: "v0.0.1",
            currentServiceConfigName: "v0.0.2",
        };
        const domain = plainToInstance(
            SubmitActionWebhookRequestBodyApiDomain,
            dto
        );
        expect(validateSync(domain)).toHaveLength(0);
    });

    it("should pass validation without optional fields", () => {
        const dto: SubmitActionWebhookRequestBodyApiDomain = {
            sessionId: "session-id",
            flowAction: {
                name: "action name",
                key: "action-key",
            },
            actionData: { field: "value" },
            serviceConfigName: "v0.0.1",
            currentServiceConfigName: "v0.0.2",
        };
        const domain = plainToInstance(
            SubmitActionWebhookRequestBodyApiDomain,
            dto
        );
        expect(validateSync(domain)).toHaveLength(0);
    });
});
