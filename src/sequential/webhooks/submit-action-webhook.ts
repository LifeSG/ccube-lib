import { Type } from "class-transformer";
import { IsObject, IsString, ValidateNested } from "class-validator";
import type { Nullable } from "../../types";
import { ActionInformation, ActionWebhookRequestBodyApiDomain } from "./shared";

/**
 * Request parameters for the ui action webhook
 *
 * More info: https://dcubeux.gitbook.io/icecap/documentation/webhooks/submit-action
 */
export class SubmitActionWebhookRequestBodyApiDomain<
    ExtraData = Record<string, unknown>,
    SessionData = Record<string, Nullable<unknown>>,
> extends ActionWebhookRequestBodyApiDomain<ExtraData, SessionData> {
    @Type(() => ActionInformation)
    @ValidateNested()
    public flowAction: ActionInformation;

    @IsObject()
    public actionData: Record<string, unknown>;

    @IsString()
    public serviceConfigName: string;

    @IsString()
    public currentServiceConfigName: string;

    constructor(props: Readonly<SubmitActionWebhookRequestBodyApiDomain>) {
        super();
        Object.assign(this, props);
    }
}
