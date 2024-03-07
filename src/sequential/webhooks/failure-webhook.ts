import { Type } from "class-transformer";
import {
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import type { Nullable } from "../../types";
import { ActionInformation } from "./shared";

export class FailureData {
    @IsString()
    public httpStatusCode: string;

    @IsString()
    public errorMessage: string;
}

/**
 * Request parameters for the failure webhook
 *
 * More info: https://dcubeux.gitbook.io/icecap/documentation/webhooks/failure-action
 */
export class FailureWebhookRequestBodyApiDomain<
    ExtraData = Record<string, unknown>,
> {
    @IsString()
    public sessionId: string;

    @Type(() => ActionInformation)
    @ValidateNested()
    @IsOptional()
    public failedAction: Nullable<ActionInformation>;

    @Type(() => FailureData)
    @ValidateNested()
    public errorDetails: FailureData;

    @IsObject()
    @IsOptional()
    // eslint-disable-next-line no-undef
    public extraData: Nullable<ExtraData>;

    constructor(props: Readonly<FailureWebhookRequestBodyApiDomain>) {
        Object.assign(this, props);
    }
}
