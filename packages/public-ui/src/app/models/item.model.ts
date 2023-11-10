export interface CheckoutItem {
    paymentType: string;
    cardNumber: string;
    fullName: string;
    cardExpiration: string;
    securityCode: string;
}

export interface ConsentDescription {
    purposeId: string[];
}
