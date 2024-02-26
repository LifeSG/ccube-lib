import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";
import type { Nullable } from "../../types";

export enum SessionStatus {
    SUCCESS = "success",
    INCOMPLETE = "incomplete",
}

export enum UserLoginType {
    SP = "singpass",
    CP = "corppass",
    GUEST = "guest",
    WOGAAD = "wogaad",
}

export class UserIdentifiers {
    @IsEnum(UserLoginType)
    public loginType: UserLoginType;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    public uinfin?: Nullable<string>;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    public uen?: Nullable<string>;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    public mobileNumber?: Nullable<string>;

    @IsEmail()
    @IsOptional()
    public emailAddress?: Nullable<string>;
}
