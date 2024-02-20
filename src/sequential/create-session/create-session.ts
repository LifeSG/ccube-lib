import { Nullable } from "src/types";

export class CustomRedirectConfig {
    cancelRedirectUrl?: Nullable<string>;
}

export class CreateSessionRequestApiDomain {
    extraData?: Record<string, unknown>;

    customRedirectConfig?: Nullable<CustomRedirectConfig>;

    constructor(props: Readonly<CreateSessionRequestApiDomain>) {
        Object.assign(this, props);
    }
}

export class CreateSessionResponseDataApiDomain {
    redirectUrl: string;

    sessionId: string;

    constructor(props: Readonly<CreateSessionResponseDataApiDomain>) {
        Object.assign(this, props);
    }
}

export class CreateSessionResponseApiDomain {
    data: CreateSessionResponseDataApiDomain;

    constructor(props: Readonly<CreateSessionResponseApiDomain>) {
        Object.assign(this, props);
    }
}
