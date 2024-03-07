import type { Nullable } from "../../types";
import { UserData, UserIdentifiers } from "../common";
import { ActionInformation, ActionWebhookRequestBodyApiDomain } from "./shared";
/**
 * Request parameters for the custom action webhook
 *
 * More info: https://dcubeux.gitbook.io/icecap/documentation/webhooks/custom-action
 */
export declare class CustomActionWebhookRequestBodyApiDomain<ExtraData = Record<string, unknown>, SessionData = Record<string, Nullable<unknown>>> extends ActionWebhookRequestBodyApiDomain<ExtraData, SessionData> {
    flowAction: ActionInformation;
    userIdentifiers?: Nullable<UserIdentifiers>;
    userData?: Nullable<UserData>;
    constructor(props: Readonly<CustomActionWebhookRequestBodyApiDomain>);
}
