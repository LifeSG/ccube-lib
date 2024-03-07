import type { Nullable } from "../../types";
import { ActionInformation } from "./shared";
export declare class FailureData {
    httpStatusCode: string;
    errorMessage: string;
}
/**
 * Request parameters for the failure webhook
 *
 * More info: https://dcubeux.gitbook.io/icecap/documentation/webhooks/failure-action
 */
export declare class FailureWebhookRequestBodyApiDomain<ExtraData = Record<string, unknown>> {
    sessionId: string;
    failedAction: Nullable<ActionInformation>;
    errorDetails: FailureData;
    extraData: Nullable<ExtraData>;
    constructor(props: Readonly<FailureWebhookRequestBodyApiDomain>);
}
