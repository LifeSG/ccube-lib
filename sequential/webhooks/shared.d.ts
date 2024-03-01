import type { Nullable } from "../../types";
export declare class ActionWebhookRequestBodyApiDomain<ExtraData = Record<string, unknown>, SessionData = Record<string, Nullable<unknown>>> {
    sessionId: string;
    sessionData?: Nullable<SessionData>;
    extraData?: Nullable<ExtraData>;
}
export declare class ActionInformation {
    name: string;
    key: string;
}
