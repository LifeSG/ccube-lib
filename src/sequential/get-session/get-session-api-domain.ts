import {
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from "class-validator";
import type { Nullable } from "../../types";
import { SessionStatus, UserIdentifiers } from "../common";

export class GetSessionResponseDataApiDomain {
    @IsString()
    @IsNotEmpty()
    public sessionId: string;

    @IsObject()
    public sessionData: Record<string, Nullable<unknown>>;

    @IsObject()
    @IsOptional()
    public extraData?: Nullable<Record<string, unknown>>;

    @IsObject()
    @IsOptional()
    public userIdentifiers?: Nullable<UserIdentifiers>;

    @IsEnum(SessionStatus)
    public status: SessionStatus;

    constructor(props: Readonly<GetSessionResponseDataApiDomain>) {
        Object.assign(this, props);
    }
}
