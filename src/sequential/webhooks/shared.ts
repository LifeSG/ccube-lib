import { IsObject, IsOptional, IsString } from "class-validator";
import type { Nullable } from "../../types";

export class ActionWebhookRequestBodyApiDomain<
    ExtraData = Record<string, unknown>,
    SessionData = Record<string, Nullable<unknown>>,
> {
    @IsString()
    public sessionId: string;

    @IsObject()
    @IsOptional()
    public sessionData?: Nullable<SessionData>;

    @IsObject()
    @IsOptional()
    public extraData?: Nullable<ExtraData>;
}

export class ActionInformation {
    @IsString()
    public name: string;

    @IsString()
    public key: string;
}
