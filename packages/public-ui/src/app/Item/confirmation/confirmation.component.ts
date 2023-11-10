import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import {
    ButtonInterface,
    FormFeildInterface,
} from 'src/app/models/signup-component.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { ConsentService } from 'src/app/services/consent.service';
import { RadioButton } from 'src/app/unemployment-registration/unemployment-registration.component';
import {
    DEFAULT_ERROR,
    ITERATE,
    OPERATION,
    SCHEMAS,
    VALIDATION_MSSG,
} from 'src/app/util/constant';
import { UpdateDetails, USER_URN } from '../../models/user-detail.model';
import { ATTRIBUTE } from '../../util/constant';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
    heading: String = 'Confirmation';

    loading: boolean = false;

    message: any = {
        text: 'Please verify the following information and click Submit',
    };

    confirmationForm: FormGroup;

    formFields: FormFeildInterface[] = [
        {
            key: 'purchaseType',
            label: 'Purchase type:',
            fieldName: 'purchaseType',
            readonly: true,
        },
        {
            key: 'cardType',
            label: 'Credit card type',
            fieldName: 'creditCardType',
            readonly: true,
        },
        {
            label: 'Full Name (as shown on card)',
            fieldName: 'fullName',
            readonly: true,
        },
        { key: 'price', label: 'Price:', fieldName: 'price', readonly: true },
        {
            key: 'driverLicenseNumber',
            label: "Driver's license number",
            fieldName: 'licenseNumber',
            readonly: true,
        },
        {
            key: 'firstName',
            label: 'First name',
            fieldName: 'firstName',
            readonly: true,
        },
        {
            key: 'lastName',
            label: 'Last name',
            fieldName: 'lastName',
            readonly: true,
        },
        {
            key: 'homeAddress',
            label: 'Home address',
            fieldName: 'homeAddress',
            readonly: true,
        },
        {
            key: 'cardConsent',
            label: 'Consent to store credit card',
            fieldName: 'canStoreCreditCard',
            type: 'radio',
            readonly: true,
        },
        {
            key: 'infoConsent',
            label: 'Consent to share credit card information',
            fieldName: 'canShareCreditCard',
            type: 'radio',
            readonly: true,
        },
    ];

    errMessage: string = VALIDATION_MSSG;

    tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;

    licenseNumber: string;

    firstName: string;

    lastName: string;

    homeAddress: string;

    continueButtonConfig: ButtonInterface = {
        name: 'Submit',
        type: 'submit',
    };

    radioLabel: RadioButton[] = [
        {
            name: 'Yes',
            value: true,
        },
        {
            name: 'No',
            value: false,
        },
    ];

    checkoutItemDetail;

    consentStoreDetail;

    shareApproval: boolean;

    storeApproval: boolean;

    confirmationInfoConfig: any = {};

    constructor(
        private service: AuthService,
        public configService: ConfigService,
        private consentService: ConsentService,
        public notificationService: NotificationService,
        public router: Router,
        private readonly commonService: CommonService
    ) {
        this.checkoutItemDetail = this.consentService.checkoutDetail;
        this.consentStoreDetail = this.consentService.consentDetail;
    }

    ngOnInit(): void {
        this.initConfirmationForm();
        this.loadLabels();
    }

    initConfirmationForm(): void {
        this.confirmationForm = new FormGroup({
            purchaseType: new FormControl(''),
            creditCardType: new FormControl(''),
            fullName: new FormControl(''),
            price: new FormControl(''),
            licenseNumber: new FormControl(''),
            firstName: new FormControl(''),
            lastName: new FormControl(''),
            homeAddress: new FormControl(''),
            canStoreCreditCard: new FormControl(''),
            canShareCreditCard: new FormControl(''),
        });
    }

    getFormValue(): void {
        this.loading = true;
        const userProfile = this.commonService.userData;
        this.loading = false;

        this.storeApproval = this.consentStoreDetail?.storeConsentState;
        this.shareApproval = this.consentStoreDetail?.shareConsentstate;

        this.setUserProfile(userProfile);
    }

    setUserProfile(userProfile): void {
        this.confirmationForm.patchValue({
            purchaseType: this.formFields.find(
                formField => formField.key === 'purchaseType'
            ).value,
            creditCardType: this.checkoutItemDetail?.paymentType || '-',
            fullName: this.checkoutItemDetail?.fullName || '-',
            price: this.formFields.find(formField => formField.key === 'price')
                .value,
            licenseNumber: userProfile[USER_URN].customAttributes.find(
                attr => attr.name === ATTRIBUTE.LICENSENUMBER
            )?.values,
            firstName: userProfile.name.givenName,
            lastName: userProfile.name.familyName,
            homeAddress: userProfile.addresses[0].formatted,
            canStoreCreditCard: this.storeApproval,
            canShareCreditCard: this.shareApproval,
        });
    }

    onConfirmation(): any {
        this.loading = true;
        const confirmationPayload: UpdateDetails = {
            schemas: SCHEMAS,
            Operations: [
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.TRANSACTIONID,
                            values: ['false'],
                        },
                    ],
                },
            ],
        };
        if (this.storeApproval) {
            const cardType = this.checkoutItemDetail?.paymentType;
            const cardNumber = this.checkoutItemDetail?.cardNumber;
            const cardExpiration = this.checkoutItemDetail?.cardExpiration;
            const fullName = this.checkoutItemDetail?.fullName;
            confirmationPayload.Operations.push(
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CREDITCARDTYPE,
                            values: [cardType],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CARDNUMBER,
                            values: [cardNumber],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CARDEXPIRATION,
                            values: [cardExpiration],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CREITCARDFULLNAME,
                            values: [fullName],
                        },
                    ],
                }
            );
        }

        this.submitForm(confirmationPayload);
    }

    submitForm(payload): void {
        this.service.updateUserDetails(payload, this.tenantUrl).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['confirmation-success']);
            },
            error: (err: any) => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.detail || DEFAULT_ERROR
                );
            },
        });
    }

    loadLabels() {
        if (this.configService.config?.['confirmationPage']) {
            this.confirmationInfoConfig = this.configService.config?.[
                'confirmationPage'
            ];
            this.formFields = this.configService.getFormattedConfig(
                this.formFields,
                this.configService.config,
                'confirmationPage',
                'form',
                this.confirmationInfoConfig
            );
            this.formFields = this.configService.getFormattedConfig(
                this.formFields,
                this.configService.config,
                'userAttrs',
                'attrs',
                this.confirmationInfoConfig
            );
            if (this.confirmationInfoConfig?.button) {
                this.continueButtonConfig = this.confirmationInfoConfig?.button;
            }
            if (this.confirmationInfoConfig?.message) {
                this.message = this.confirmationInfoConfig?.message;
            }
        }
        this.getFormValue();
    }
}
