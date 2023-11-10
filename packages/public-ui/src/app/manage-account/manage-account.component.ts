import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EOTPType } from 'src/app/services/mfa.service';
import { NotificationService } from '../common/Notification/notificationService';
import { UserNotificationDetails } from '../models/push-notification.model';
import {
    FormFeildInterface,
    HeaderMessage,
} from '../models/signup-component.model';
import {
    UpdateDetails,
    UserDetail,
    UserLocalData,
    USER_URN,
} from '../models/user-detail.model';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common.service';
import { ConfigService } from '../services/config.service';
import { PushNotificationService } from '../services/push-notification.service';
import {
    ATTRIBUTE,
    DEFAULT_ERROR,
    DEFAULT_SCCUESS,
    ENOTICE,
    OPERATION,
    SCHEMAS,
    VALIDATION_MSSG,
} from '../util/constant';
import { nonWhitespaceRegExp } from '../util/validations';

@Component({
    selector: 'app-manage-account',
    templateUrl: './manage-account.component.html',
    styleUrls: ['./manage-account.component.scss'],
})
export class ManageAccountComponent implements OnInit, OnDestroy {
    message: HeaderMessage = {
        msg: 'Manage Your Personal Information',
        btn: {
            name: 'Submit',
            type: 'submit',
        },
    };

    userData: UserLocalData = {
        name: 'User',
        userId: '',
        isLoggedIn: false,
        email: '',
    };

    qrCodeId: string;

    // cardOptions = [CARDTYPE.AMEX, CARDTYPE.VISA];

    errMessage: string = VALIDATION_MSSG;

    manageAccountConfig: any;

    info =
        'Please verify your personal information and make changes where allowed.';

    note = '(Note that not all information can be changed)';

    isQrCodeEnabled: boolean;

    showRmvDevModal: boolean;

    rmvDevheadingConfig: any = {
        text: 'Remove Device',
    };
    rmvDevsubHeadingConfig: any = {
        text: '',
    };
    rmvDevcontent: any = {
        text: 'Are you sure want to remove your device',
    };

    registeredDeviceForm: FormGroup;

    registeredDevices: FormFeildInterface[] = [
        {
            label: 'Device type',
            fieldName: 'deviceType',
            readonly: true,
            nooutline: true,
        },
        {
            label: 'Device added',
            fieldName: 'deviceAdded',
            readonly: true,
            nooutline: true,
        },
        {
            label: 'Enabled',
            fieldName: 'enabled',
            readonly: true,
            nooutline: true,
        },
        {
            label: 'Methods',
            fieldName: 'methods',
            readonly: true,
            nooutline: true,
        },
        {
            label: 'Action',
            fieldName: 'action',
            readonly: true,
            nooutline: true,
        },
    ];

    formFields: FormFeildInterface[] = [
        {
            label: 'SSN',
            key: 'ssn',
            fieldName: 'ssn',
            readonly: true,
            nooutline: true,
        },
        {
            label: 'First Name',
            key: 'firstName',
            placeholder: 'Enter your first name',
            fieldName: 'firstName',
        },
        {
            label: 'Last Name',
            key: 'lastName',
            placeholder: 'Enter your last name',
            fieldName: 'lastName',
        },
        {
            label: 'Email',
            key: 'email',
            placeholder: 'Enter your email',
            fieldName: 'email',
            type: 'email',
        },
        {
            label: 'User Name',
            placeholder: '',
            fieldName: 'userName',
            readonly: true,
            nooutline: true,
        },
        {
            key: 'homeAddress',
            label: 'Home Address',
            placeholder: 'Enter your address',
            fieldName: 'address',
        },
        {
            key: 'driverLicenseNumber',
            label: 'Driver’s License Number',
            fieldName: 'licenseNumber',
            readonly: true,
            nooutline: true,
        },
        // {
        //     label: 'Card Payment Type',
        //     placeholder: 'Select your payment type',
        //     fieldName: 'paymentType',
        //     type: 'select',
        // },
        // {
        //     label: 'Full Name (as shown on card)',
        //     placeholder: 'Enter your full name',
        //     fieldName: 'fullName',
        // },
        // {
        //     label: 'Credit Card Number',
        //     placeholder: 'Enter your credit card number',
        //     fieldName: 'cardNumber',
        // },
        // {
        //     label: 'Credit Card Expiration',
        //     placeholder: 'Enter your credit card expiration',
        //     fieldName: 'cardExpiration',
        //     type: 'month',
        // },
    ];

    accountForm: FormGroup;

    deviceDropdown: boolean;

    infoDropdown: boolean = true;

    loading: boolean = true;

    date = new Date();

    showSSN: boolean = false;

    mailOtpData: any = { type: EOTPType.EMAIL, isShowFullSSN: true };

    userSignatureData: UserNotificationDetails = {
        authId: '',
        signatureId: '',
    };

    private readonly unsubscribeSignal: Subject<void> = new Subject<void>();

    showPopup: boolean;

    isNotRegQRCode: boolean;

    userSSN;

    showSSNPushConfig;
    accountUpdatePushConfig;

    constructor(
        private service: AuthService,
        public configService: ConfigService,
        private notificationService: NotificationService,
        private commonService: CommonService,
        private pushNotificationService: PushNotificationService,
        public router: Router
    ) {}

    ngOnInit(): void {
        this.loadLabels();
        this.showSSN = history?.state?.isShowFullSSNVerified;
        this.initAccountManageForm();
        this.initRegisteredDeviceForm();
        this.getUserDetails();
    }

    ngOnDestroy(): void {
        this.unsubscribeSignal.next();
        this.unsubscribeSignal.complete();
    }

    getSSNLabel(): string {
        return this.formFields.find(formField => formField.key === 'ssn').label;
    }

    loadLabels() {
        if (this.configService.config?.['pushNotification']) {
            const config = this.configService.config?.['pushNotification'];

            this.formFields = this.configService.getFormattedConfig(
                this.formFields,
                this.configService.config,
                'userAttrs',
                'attrs',
                this.manageAccountConfig
            );

            this.showSSNPushConfig = {
                title: config?.showSSN?.title,
                message: config?.showSSN?.message,
            };
            this.accountUpdatePushConfig = {
                title: config?.accountUpdate?.title,
                message: config?.accountUpdate?.message,
            };
        }
    }

    private initRegisteredDeviceForm(): void {
        this.registeredDeviceForm = new FormGroup({
            deviceType: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            deviceAdded: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            enabled: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            methods: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            action: new FormControl('Remove', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
        });
    }

    initAccountManageForm(): void {
        this.accountForm = new FormGroup({
            ssn: new FormControl(''),
            firstName: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            lastName: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            email: new FormControl('', [
                Validators.email,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            userName: new FormControl(''),
            address: new FormControl('', [
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            licenseNumber: new FormControl(''),
            // cardNumber: new FormControl('', [
            //     Validators.pattern(numberValidation),
            //     Validators.pattern(nonWhitespaceRegExp),
            //     Validators.minLength(14),
            //     Validators.maxLength(16),
            //     Validators.required,
            // ]),
            // cardExpiration: new FormControl('', [
            //     Validators.pattern(nonWhitespaceRegExp),
            // ]),
            // fullName: new FormControl('', [
            //     Validators.pattern(nonWhitespaceRegExp),
            //     Validators.required,
            // ]),
            // paymentType: new FormControl('', Validators.required),
        });
    }

    private getUserDetails(): any {
        const res = this.commonService.userData;
        this.userData.name = `${res?.name?.givenName} ${res?.name?.familyName}`;
        this.userData.email = res?.emails[0]?.value;
        this.userData.userId = res?.id;
        this.userSSN = res?.[USER_URN]?.customAttributes;
        this.setFormValue(res);
        this.getRegisteredDevices();
        this.loading = false;
    }

    userDeviceDropdown(): void {
        this.deviceDropdown = !this.deviceDropdown;
    }

    userInfoDropdown(): void {
        this.infoDropdown = !this.infoDropdown;
    }

    getRegisteredDevices(): void {
        this.pushNotificationService
            .isQrCodeScanned(this.userData.userId)
            .pipe(takeUntil(this.unsubscribeSignal))
            .subscribe({
                next: res => {
                    this.qrCodeId = res?.signatures[0]?._embedded?.id;
                    this.setRegisteredDeviceFormValue(res);
                },
                error: err => {
                    const message = err?.error?.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                },
            });
    }

    private setRegisteredDeviceFormValue(deviceData: any): void {
        const date = new Date(deviceData?.signatures[0]?.creationTime);
        this.isQrCodeEnabled = !deviceData?.signatures[0]?.enabled;

        this.registeredDeviceForm.patchValue({
            deviceType:
                deviceData?.signatures[0]?._embedded?.attributes?.deviceType,
            deviceAdded: date.toLocaleString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            }),
            enabled: deviceData?.signatures[0]?.enabled ? 'Yes' : 'No',
            methods:
                deviceData?.signatures.length > 1
                    ? 'Fingerprint & Touch approval'
                    : 'Touch approval',
        });
        this.loading = false;
    }

    deleteQrCodeRegistration(): void {
        this.loading = true;
        this.showRmvDevModal = false;
        this.pushNotificationService
            .deleteQrCodeRegistration(this.qrCodeId)
            .pipe(takeUntil(this.unsubscribeSignal))
            .subscribe({
                next: res => {
                    this.pushNotificationService.deviceRegistered.emit(false);
                    this.getRegisteredDevices();
                    this.notificationService.sendSuccess(
                        'Device removed successfully'
                    );
                },
                error: err => {
                    this.loading = false;
                    const message = err?.error?.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                },
            });
    }

    private setFormValue(userData: UserDetail): void {
        this.accountForm.patchValue({
            ssn:
                this.showFullSSN(userData?.[USER_URN]?.customAttributes) || '-',
            firstName: userData?.name?.givenName,
            lastName: userData?.name?.familyName,
            email: userData?.emails?.[0]?.value,
            userName: userData?.userName,
            address: userData?.addresses?.[0]?.formatted,
            licenseNumber:
                this.commonService.getCustomAttribute(
                    userData?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.LICENSENUMBER
                ) || '-',
            // cardNumber: this.getCustomAttribute(
            //     userData?.[USER_URN]?.customAttributes,
            //     ATTRIBUTE.CARDNUMBER
            // ),
            // cardExpiration: this.getCustomAttribute(
            //     userData?.[USER_URN]?.customAttributes,
            //     ATTRIBUTE.CARDEXPIRATION
            // ),
            // paymentType: this.getCustomAttribute(
            //     userData?.[USER_URN]?.customAttributes,
            //     ATTRIBUTE.CREDITCARDTYPE
            // ),
            // fullName:
            //     this.getCustomAttribute(
            //         userData?.[USER_URN]?.customAttributes,
            //         ATTRIBUTE.CREITCARDFULLNAME
            //     ) || '',
        });
    }

    private showFullSSN(customAttr) {
        const txt = this.commonService.getCustomAttribute(
            customAttr,
            ATTRIBUTE.SSN
        );
        let ssn = this.commonService.replaceFirstFiveChars(txt) || '-';
        if (this.showSSN) {
            ssn = this.commonService.getCustomAttribute(
                customAttr,
                ATTRIBUTE.SSN
            );
        }
        return ssn;
    }

    change(): void {
        this.loading = true;
        this.showPushNotification(ENOTICE.SSNPUSH);
    }

    onManageFormSubmit(): any {
        this.loading = true;
        this.showPushNotification(ENOTICE.UPDATEPUSH);
    }

    private showPushNotification(option): void {
        const userData = this.service.getUserLocalData();
        this.pushNotificationService
            .getSignaturesByOwner({ userId: userData.data.profile.id })
            .pipe(takeUntil(this.unsubscribeSignal))
            .subscribe({
                next: res => {
                    this.userSignatureData.authId = res.authId;
                    this.userSignatureData.signatureId = res.signatureId;
                    this.userSignatureData.key = option;
                    this.userSignatureData.title =
                        option === ENOTICE.SSNPUSH
                            ? this.showSSNPushConfig.title
                            : this.accountUpdatePushConfig.title;
                    this.userSignatureData.message =
                        option === ENOTICE.SSNPUSH
                            ? this.showSSNPushConfig.message
                            : this.accountUpdatePushConfig.message;

                    this.userSignatureData.additionalData =
                        option === ENOTICE.UPDATEPUSH
                            ? this.getAccountData(this.formFields)
                            : [];

                    this.loading = false;
                    this.showPopup = true;
                },
                error: () => {
                    this.loading = false;
                    this.isNotRegQRCode = true;
                    this.switchToOtp(option);
                },
            });
    }
    private getAccountData(data): Array<any> {
        const arr = [];
        data.map(field => {
            if (
                field.fieldName !== 'ssn' &&
                field.fieldName !== 'userName' &&
                this.accountForm.get(field.fieldName).dirty
            ) {
                arr.push({
                    name: field.label,
                    value: this.accountForm.get(field.fieldName).value,
                });
            }
        });
        return arr;
    }

    private switchToOtp(option): void {
        if (option === ENOTICE.SSNPUSH) {
            this.router.navigate(['/mfa-otp'], {
                state: this.mailOtpData,
            });
        } else {
            this.updateAccount();
        }
    }

    public closePushNotification(event) {
        this.showPopup = false;
        if (event.saveData && event.key === ENOTICE.SSNPUSH) {
            this.showSSN = true;
            this.accountForm
                .get('ssn')
                .setValue(
                    this.commonService.getCustomAttribute(
                        this.userSSN,
                        ATTRIBUTE.SSN
                    )
                );
        }
        if (event.saveData && event.key === ENOTICE.UPDATEPUSH) {
            this.updateAccount();
        }
    }

    updateAccount(): any {
        this.loading = true;
        const fName = this.accountForm.get('firstName').value?.trim();
        const lName = this.accountForm.get('lastName').value?.trim();
        const email = this.accountForm.get('email').value?.trim();
        const address = this.accountForm.get('address').value?.trim();
        // const cardNumber = this.accountForm.get('cardNumber').value?.trim();
        // const cardExpiration = this.accountForm.get('cardExpiration').value;
        // const paymentType = this.accountForm.get('paymentType').value;
        // const fullName = this.accountForm.get('fullName').value?.trim();

        const payloadRequest: UpdateDetails = {
            schemas: SCHEMAS,
            Operations: [
                {
                    op: OPERATION.REPLACE,
                    path: 'name.givenName',
                    value: fName,
                },
                {
                    op: OPERATION.REPLACE,
                    path: 'name.familyName',
                    value: lName,
                },
                {
                    op: OPERATION.REPLACE,
                    path: 'emails[type eq "work"].value',
                    value: email,
                },
                {
                    op: OPERATION.REPLACE,
                    path: 'addresses[type eq "work"].formatted',
                    value: address,
                },
                {
                    op: OPERATION.REPLACE,
                    path: 'emails[type eq "work"].value',
                    value: email,
                },
                // {
                //     op: OPERATION.ADD,
                //     path: `${USER_URN}:customAttributes`,
                //     value: [
                //         {
                //             name: `${ATTRIBUTE.CARDNUMBER}`,
                //             values: [`${cardNumber}`],
                //         },
                //     ],
                // },
                // {
                //     op: OPERATION.ADD,
                //     path: `${USER_URN}:customAttributes`,
                //     value: [
                //         {
                //             name: `${ATTRIBUTE.CARDEXPIRATION}`,
                //             values: [`${cardExpiration}`],
                //         },
                //     ],
                // },
                // {
                //     op: OPERATION.ADD,
                //     path: `${USER_URN}:customAttributes`,
                //     value: [
                //         {
                //             name: ATTRIBUTE.CREITCARDFULLNAME,
                //             values: [fullName],
                //         },
                //     ],
                // },
                // {
                //     op: OPERATION.ADD,
                //     path: `${USER_URN}:customAttributes`,
                //     value: [
                //         {
                //             name: `${ATTRIBUTE.CREDITCARDTYPE}`,
                //             values: [`${paymentType}`],
                //         },
                //     ],
                // },
            ],
        };
        this.submitForm(payloadRequest, { fName, lName });
    }

    private submitForm(payloadRequest, EName): any {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service
            .updateUserDetails(payloadRequest, tenantUrl)
            .pipe(takeUntil(this.unsubscribeSignal))
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.notificationService.sendSuccess(DEFAULT_SCCUESS);
                    this.service.displayName.emit(EName);
                    this.resetForm();
                },
                error: (err: any) => {
                    this.loading = false;
                    this.notificationService.sendError(
                        err?.error?.detail || DEFAULT_ERROR
                    );
                },
            });
    }
    private resetForm(): void {
        this.loading = true;
        this.initAccountManageForm();
        this.commonService.getUserData();
        this.commonService.loadedProfileApi.subscribe(res => {
            if (!res) {
                this.getUserDetails();
            }
        });
    }
}
