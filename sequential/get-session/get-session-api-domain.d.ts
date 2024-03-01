import type { Nullable } from "../../types";
import { SessionStatus, UserIdentifiers } from "../common";
export declare class GetSessionResponseDataApiDomain {
    sessionId: string;
    sessionData: Record<string, Nullable<unknown>>;
    extraData?: Nullable<Record<string, unknown>>;
    userIdentifiers?: Nullable<UserIdentifiers>;
    status: SessionStatus;
    constructor(props: Readonly<GetSessionResponseDataApiDomain>);
}
