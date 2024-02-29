import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from "class-validator";
import type { Nullable } from "../../types";

export enum SessionStatus {
    SUCCESS = "success",
    INCOMPLETE = "incomplete",
    EDIT = "edit",
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

export class UserData {
    @IsObject()
    @IsOptional()
    public myinfo?: Partial<Record<string, unknown>>;

    @IsObject()
    @IsOptional()
    public myinfoBusiness?: Partial<Record<string, unknown>>;
}
