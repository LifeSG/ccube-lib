import type { Nullable } from "../../types";
import { ActionWebhookRequestBodyApiDomain } from "./shared";
/**
 * Request parameters for the success webhook
 *
 * More info: https://dcubeux.gitbook.io/icecap/documentation/webhooks/success-action
 */
export declare class SuccessWebhookRequestApiDomain<ExtraData = Record<string, unknown>, SessionData = Record<string, Nullable<unknown>>> extends ActionWebhookRequestBodyApiDomain<ExtraData, SessionData> {
    constructor(props: Readonly<SuccessWebhookRequestApiDomain>);
}
