import { IsOptional, IsUrl } from "class-validator";
import type { Nullable } from "../../types";

export class CustomRedirectConfig {
    @IsUrl({ validate_length: false, protocols: ["https"] })
    @IsOptional()
    public cancelRedirectUrl?: Nullable<string>;
}
