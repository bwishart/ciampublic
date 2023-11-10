export interface UserNotificationDetails {
    authId: string;
    signatureId?: string;
    pushId?: string;
    status?: string;
    expiryTime?: any;
    additionalData?: additionalData[];
    message?: string;
    title?: string;
    key?: string;
}

export interface additionalData {
    name: string;
    value: string;
}

export interface QRcodeDetails {
    code: string;
    accountName: string;
    registrationUri: string;
    version: {
        number: string;
        platform: string;
    };
}
