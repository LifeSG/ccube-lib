import type { Nullable } from "../../types";
export declare enum SessionStatus {
    SUCCESS = "success",
    INCOMPLETE = "incomplete",
    EDIT = "edit"
}
export declare enum UserLoginType {
    SP = "singpass",
    CP = "corppass",
    GUEST = "guest",
    WOGAAD = "wogaad"
}
export declare class UserIdentifiers {
    loginType: UserLoginType;
    uinfin?: Nullable<string>;
    uen?: Nullable<string>;
    mobileNumber?: Nullable<string>;
    emailAddress?: Nullable<string>;
}
export declare class UserData {
    myinfo?: Partial<Record<string, unknown>>;
    myinfoBusiness?: Partial<Record<string, unknown>>;
}
