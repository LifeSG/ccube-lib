import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import type { Nullable } from "../../types";
import { UserData, UserIdentifiers } from "../common";
import { ActionInformation, ActionWebhookRequestBodyApiDomain } from "./shared";

/**
 * Request parameters for the custom action webhook
 *
 * More info: https://dcubeux.gitbook.io/icecap/documentation/webhooks/custom-action
 */
export class CustomActionWebhookRequestBodyApiDomain<
    ExtraData = Record<string, unknown>,
    SessionData = Record<string, Nullable<unknown>>,
> extends ActionWebhookRequestBodyApiDomain<ExtraData, SessionData> {
    @Type(() => ActionInformation)
    @ValidateNested()
    public flowAction: ActionInformation;

    @Type(() => UserIdentifiers)
    @ValidateNested()
    @IsOptional()
    public userIdentifiers?: Nullable<UserIdentifiers>;

    @Type(() => UserData)
    @ValidateNested()
    @IsOptional()
    public userData?: Nullable<UserData>;

    constructor(props: Readonly<CustomActionWebhookRequestBodyApiDomain>) {
        super();
        Object.assign(this, props);
    }
}
