import { ActionWebhookRequestBodyApiDomain } from "./shared";

/**
 * Request parameters for the success webhook
 *
 * More info: https://dcubeux.gitbook.io/icecap/documentation/webhooks/success-action
 */
export class SuccessWebhookRequestApiDomain extends ActionWebhookRequestBodyApiDomain {
    constructor(props: Readonly<SuccessWebhookRequestApiDomain>) {
        super();
        Object.assign(this, props);
    }
}
