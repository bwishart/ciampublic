export interface FormFeildInterface {
    key?: string;
    label: string;
    placeholder?: string;
    fieldName: string;
    type?: string;
    readonly?: boolean;
    nooutline?: boolean;
    value?: boolean;
}
export interface ButtonInterface {
    type: string;
    name: string;
}

export interface SignupRequestPayload {
    ssnAttrName?: string;
    SSN: string;
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
}

export enum ESignUpFieldName {
    ssn = 'ssn',
    firstName = 'firstName',
    lastName = 'lastName',
    email = 'email',
}

export interface HeaderMessage {
    msg: string;
    btn: ButtonInterface;
}
