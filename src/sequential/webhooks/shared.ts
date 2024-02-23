import { IsObject, IsOptional, IsString } from "class-validator";
import type { Nullable } from "../../types";

export class ActionWebhookRequestBodyApiDomain {
    @IsString()
    public sessionId: string;

    @IsObject()
    @IsOptional()
    public sessionData?: Nullable<Record<string, Nullable<unknown>>>;

    @IsObject()
    @IsOptional()
    public extraData?: Nullable<Record<string, unknown>>;
}

export class ActionInformation {
    @IsString()
    public name: string;

    @IsString()
    public key: string;
}
