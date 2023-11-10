export const USERDATA = 'userdata';
export const TITLEURL = 'titleURL';
export const DEFAULT_SCCUESS = 'Your profile is saved!';
export const DEFAULT_ERROR = 'Something went wrong';

export const CONSENT_SUCCUESS = 'Your consent is saved!';
export const FAILURE = 'failure';

export enum TYPE {
    WORK = 'work',
}

export enum OPERATION {
    REPLACE = 'replace',
    ADD = 'add',
    REMOVE = 'remove',
}

export enum ATTRIBUTE {
    SSN = 'ssn',
    LICENSENUMBER = 'driverLicenseNumber',
    TRANSACTIONID = 'trasnsactionid',
    CARDNUMBER = 'creditCardNumber',
    CARDEXPIRATION = 'creditCardExpiration',
    LASTEMPLOYERNAME = 'lastEmployerName',
    LASTEMPLOYMENTDATE = 'lastEmploymentDate',
    UNEMPLOYMENTCOLLECTED = 'isUnemploymentCollected',
    UNEMPLOYMENTCOLLECTEDDATE = 'unemployemntCollectedDate',
    CREITCARDFULLNAME = 'creditCardFullName',
    ENABLE_MFA = 'enableMfa',
    CREDITCARDTYPE = 'creditCardType',
    TESTREL1 = 'testrel12',
    TESTREL3 = 'testrel3',
}

export const uniqueAttributes: string[] = [ATTRIBUTE.SSN];

export const booleanAttributes: string[] = [
    ATTRIBUTE.TRANSACTIONID,
    ATTRIBUTE.ENABLE_MFA,
];

export const SCHEMAS = ['urn:ietf:params:scim:api:messages:2.0:PatchOp'];

export const VALIDATION_MSSG = 'This field is required with valid';

export enum CARDTYPE {
    AMEX = 'Amex',
    VISA = 'Visa',
}

export enum PURPOSEID {
    CREDITCARDCONSENTAGENCIES = 'creditCardConsentAgencies',
    CREDITCARDCONSENTDMV = 'creditCardConsentDMV',
    MFAMOBILENUMBER = 'mfaMobileNumber',
}

export enum ITERATE {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
}

export enum STATE {
    ALLOW = 1,
    DENY = 2,
}

export enum ENOTICE {
    SSNPUSH = 'ssn',
    UPDATEPUSH = 'update',
}

export interface ISVError {
    message?: string;
}

export const consentErrorPrefix =
    'Your consent is saved but there was some error:';

export const PUSH_NOTIFICATION_BLOCKTIME = 3;
export const PUSH_NOTIFICATION_MAX_POLLTIME = 60;
