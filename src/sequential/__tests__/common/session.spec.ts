import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { UserIdentifiers, UserLoginType } from "../../common";

describe("UserIdentifiers", () => {
    it("should pass validation with all fields", () => {
        const dto: UserIdentifiers = {
            loginType: UserLoginType.SP,
            uinfin: "S1234567D",
            uen: "UEN123456789",
            mobileNumber: "98889888",
            emailAddress: "test@example.com",
        };
        const domain = plainToInstance(UserIdentifiers, dto);
        expect(validateSync(domain)).toHaveLength(0);
    });

    it("should pass validation without optional fields", () => {
        const dto: UserIdentifiers = {
            loginType: UserLoginType.SP,
        };
        const domain = plainToInstance(UserIdentifiers, dto);
        expect(validateSync(domain)).toHaveLength(0);
    });

    describe("loginType", () => {
        it.each([undefined, 1, "", "invalid"])(
            "should fail for invalid input",
            (input: any) => {
                const dto: UserIdentifiers = {
                    loginType: input,
                };
                const domain = plainToInstance(UserIdentifiers, dto);
                expect(validateSync(domain)).toHaveLength(1);
            }
        );
    });

    describe("uinfin", () => {
        it.each([1, ""])("should fail for invalid input", (input: any) => {
            const dto: UserIdentifiers = {
                loginType: UserLoginType.SP,
                uinfin: input,
            };
            const domain = plainToInstance(UserIdentifiers, dto);
            expect(validateSync(domain)).toHaveLength(1);
        });
    });

    describe("uen", () => {
        it.each([1, ""])("should fail for invalid input", (input: any) => {
            const dto: UserIdentifiers = {
                loginType: UserLoginType.SP,
                uen: input,
            };
            const domain = plainToInstance(UserIdentifiers, dto);
            expect(validateSync(domain)).toHaveLength(1);
        });
    });

    describe("mobileNumber", () => {
        it.each([1, ""])("should fail for invalid input", (input: any) => {
            const dto: UserIdentifiers = {
                loginType: UserLoginType.SP,
                mobileNumber: input,
            };
            const domain = plainToInstance(UserIdentifiers, dto);
            expect(validateSync(domain)).toHaveLength(1);
        });
    });

    describe("emailAddress", () => {
        it.each([1, "", "invalid"])(
            "should fail for invalid input",
            (input: any) => {
                const dto: UserIdentifiers = {
                    loginType: UserLoginType.SP,
                    emailAddress: input,
                };
                const domain = plainToInstance(UserIdentifiers, dto);
                expect(validateSync(domain)).toHaveLength(1);
            }
        );
    });
});
