import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutItem } from 'src/app/models/item.model';
import { CommonService } from 'src/app/services/common.service';
import { ConsentService } from 'src/app/services/consent.service';
import { NotificationService } from '../../common/Notification/notificationService';
import { FormFeildInterface } from '../../models/signup-component.model';
import { UserDetail, USER_URN } from '../../models/user-detail.model';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { ATTRIBUTE, CARDTYPE, DEFAULT_ERROR } from '../../util/constant';
import { nonWhitespaceRegExp, numberValidation } from '../../util/validations';

@Component({
    selector: 'app-checkout-page',
    templateUrl: './checkout-page.component.html',
    styleUrls: ['./checkout-page.component.scss'],
})
export class CheckoutPageComponent implements OnInit {
    headlineConfig: any = { text: 'Check Out' };

    cardOptions = [CARDTYPE.AMEX, CARDTYPE.VISA];

    formFields: FormFeildInterface[] = [
        {
            key: 'paymentType',
            label: 'Payment Type',
            placeholder: 'Select your payment type',
            fieldName: 'paymentType',
            type: 'select',
        },
        {
            key: 'creditCardNumber',
            label: 'Credit Card Number',
            placeholder: 'Enter your credit card number',
            fieldName: 'cardNumber',
        },
        {
            key: 'fullName',
            label: 'Full Name (as shown on card)',
            placeholder: 'Enter your full name',
            fieldName: 'fullName',
            type: 'text',
        },
        {
            key: 'creditCardExpiration',
            label: 'Credit Card Expiration',
            placeholder: 'Enter your credit card expiration',
            fieldName: 'cardExpiration',
            type: 'month',
        },
        {
            key: 'securityCode',
            label: 'Security Code',
            placeholder: 'Enter your security code',
            fieldName: 'securityCode',
            type: 'password',
        },
    ];

    checkoutForm: FormGroup;

    loading: boolean = true;

    date = new Date();

    transactionNoteConfig: any = {
        text:
            'There is a $50.00 renewal fee that will be charged to your credit card. Your card will not be charged until you have a chance to review the transaction.',
    };

    errMessage: string = 'This field is required with valid';

    btnConfig: any = {
        name: 'Continue',
    };

    checkoutConfig: any = {};

    constructor(
        private service: AuthService,
        public configService: ConfigService,
        private notificationService: NotificationService,
        public router: Router,
        private consentService: ConsentService,
        private commonService: CommonService
    ) {
        this.loadLabels();
    }

    ngOnInit(): void {
        this.initCheckoutForm();
        this.getUserDetails();
    }

    loadLabels() {
        if (this.configService.config?.['checkout']) {
            this.checkoutConfig = this.configService.config?.['checkout'];
            this.formFields = this.configService.getFormattedConfig(
                this.formFields,
                this.configService.config,
                'checkout',
                'form',
                this.checkoutConfig
            );
            this.formFields = this.configService.getFormattedConfig(
                this.formFields,
                this.configService.config,
                'userAttrs',
                'attrs',
                this.checkoutConfig
            );
            if (this.checkoutConfig?.headline) {
                this.headlineConfig = this.checkoutConfig?.headline;
            }
            if (this.checkoutConfig?.transactionNote) {
                this.transactionNoteConfig = this.checkoutConfig?.transactionNote;
            }
            if (this.checkoutConfig?.button) {
                this.btnConfig = this.checkoutConfig?.button;
            }
        }
    }

    initCheckoutForm(): void {
        this.checkoutForm = new FormGroup({
            paymentType: new FormControl('', Validators.required),
            cardNumber: new FormControl('', [
                Validators.required,
                Validators.pattern(numberValidation),
                Validators.pattern(nonWhitespaceRegExp),
                Validators.minLength(19),
            ]),
            fullName: new FormControl('', [
                Validators.required,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            cardExpiration: new FormControl('', [
                Validators.required,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            securityCode: new FormControl('', [
                Validators.required,
                Validators.pattern(numberValidation),
                Validators.pattern(nonWhitespaceRegExp),
                Validators.minLength(3),
            ]),
        });
    }

    private getUserDetails(): void {
        const res: UserDetail = this.commonService.userData;
        this.setFormValue(res);
        this.loading = false;
    }

    private setFormValue(userData: UserDetail): void {
        let creditCardNumber =
            this.commonService.getCustomAttribute(
                userData?.[USER_URN]?.customAttributes,
                ATTRIBUTE.CARDNUMBER
            ) || '';
        if (creditCardNumber) {
            creditCardNumber = `${creditCardNumber.substring(
                0,
                4
            )} ${creditCardNumber.substring(4, 8)} ${creditCardNumber.substring(
                8,
                12
            )} ${creditCardNumber.substring(12, 16)}`;
        }

        this.checkoutForm.patchValue({
            fullName: `${userData?.name?.givenName} ${userData?.name?.familyName}`,
            paymentType:
                this.commonService.getCustomAttribute(
                    userData?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CREDITCARDTYPE
                ) || '',
            cardNumber: creditCardNumber,
            cardExpiration:
                this.commonService.getCustomAttribute(
                    userData?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.CARDEXPIRATION
                ) || '',
        });
    }

    onCheckout(): void {
        let creditCardNumber = this.checkoutForm
            .get('cardNumber')
            .value?.trim()
            .replace(/ /g, '');

        if (creditCardNumber.length > 16) {
            creditCardNumber = creditCardNumber.substring(0, 16);
        }
        this.loading = true;
        const frwdPayload: CheckoutItem = {
            paymentType: this.checkoutForm.get('paymentType').value,
            cardNumber: creditCardNumber,
            fullName: this.checkoutForm.get('fullName').value.trim(),
            cardExpiration: this.checkoutForm.get('cardExpiration').value,
            securityCode: this.checkoutForm.get('securityCode').value.trim(),
        };
        this.consentService.checkoutDetail = frwdPayload;
        this.loading = false;
        this.router.navigate(['/card-consent']);
    }
}
