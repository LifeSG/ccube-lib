import { Type } from "class-transformer";
import {
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import type { Nullable } from "../../types";
import { CustomRedirectConfig } from "../common/config";

export class CreateSessionRequestBodyApiDomain {
    @IsObject()
    @IsOptional()
    extraData?: Nullable<Record<string, unknown>>;

    @Type(() => CustomRedirectConfig)
    @ValidateNested()
    @IsOptional()
    customRedirectConfig?: Nullable<CustomRedirectConfig>;

    constructor(props: Readonly<CreateSessionRequestBodyApiDomain>) {
        Object.assign(this, props);
    }
}

export class CreateSessionResponseDataApiDomain {
    @IsString()
    @IsNotEmpty()
    redirectUrl: string;

    @IsString()
    @IsNotEmpty()
    sessionId: string;

    constructor(props: Readonly<CreateSessionResponseDataApiDomain>) {
        Object.assign(this, props);
    }
}
