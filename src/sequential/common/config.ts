import { IsOptional, IsUrl } from "class-validator";
import type { Nullable } from "../../types";

export class CustomRedirectConfig {
    @IsUrl({
        validate_length: false,
        protocols: ["https"],
        require_protocol: true,
    })
    @IsOptional()
    public cancelRedirectUrl?: Nullable<string>;
}
