import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { UserLoginType } from "../../common";
import { CustomActionWebhookRequestBodyApiDomain } from "../../webhooks";

describe("CustomActionWebhookRequestBodyApiDomain", () => {
    it("should pass validation with all fields", () => {
        const dto: CustomActionWebhookRequestBodyApiDomain = {
            sessionId: "session-id",
            sessionData: { "action-1-key": "action-data" },
            extraData: { data: "extra-data" },
            flowAction: {
                name: "action name",
                key: "action-key",
            },
            userIdentifiers: {
                loginType: UserLoginType.SP,
            },
            userData: {
                myinfo: {},
                myinfoBusiness: {},
            },
        };
        const domain = plainToInstance(
            CustomActionWebhookRequestBodyApiDomain,
            dto
        );
        expect(validateSync(domain)).toHaveLength(0);
    });

    it("should pass validation without optional fields", () => {
        const dto: CustomActionWebhookRequestBodyApiDomain = {
            sessionId: "session-id",
            flowAction: {
                name: "action name",
                key: "action-key",
            },
        };
        const domain = plainToInstance(
            CustomActionWebhookRequestBodyApiDomain,
            dto
        );
        expect(validateSync(domain)).toHaveLength(0);
    });
});
