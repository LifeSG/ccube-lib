import type { Nullable } from "../../types";
import { CustomRedirectConfig } from "../common/config";
export declare class CreateSessionRequestBodyApiDomain {
    extraData?: Nullable<Record<string, unknown>>;
    customRedirectConfig?: Nullable<CustomRedirectConfig>;
    constructor(props: Readonly<CreateSessionRequestBodyApiDomain>);
}
export declare class CreateSessionResponseDataApiDomain {
    redirectUrl: string;
    sessionId: string;
    constructor(props: Readonly<CreateSessionResponseDataApiDomain>);
}
