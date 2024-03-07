import type { Nullable } from "../../types";
import { ActionInformation, ActionWebhookRequestBodyApiDomain } from "./shared";
/**
 * Request parameters for the ui action webhook
 *
 * More info: https://dcubeux.gitbook.io/icecap/documentation/webhooks/submit-action
 */
export declare class SubmitActionWebhookRequestBodyApiDomain<ExtraData = Record<string, unknown>, SessionData = Record<string, Nullable<unknown>>> extends ActionWebhookRequestBodyApiDomain<ExtraData, SessionData> {
    flowAction: ActionInformation;
    actionData: Record<string, unknown>;
    serviceConfigName: string;
    currentServiceConfigName: string;
    constructor(props: Readonly<SubmitActionWebhookRequestBodyApiDomain>);
}
