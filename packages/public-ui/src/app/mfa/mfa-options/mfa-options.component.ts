import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ConfigService } from 'src/app/services/config.service';
import { ConsentService } from 'src/app/services/consent.service';
import { EOTPType, MfaService } from 'src/app/services/mfa.service';
import {
    DEFAULT_ERROR,
    ITERATE,
    OPERATION,
    PURPOSEID,
    STATE,
} from 'src/app/util/constant';

export interface RadioButton {
    label: string;
    key: string;
    value: string;
}
@Component({
    selector: 'app-mfa-options',
    templateUrl: './mfa-options.component.html',
    styleUrls: ['./mfa-options.component.scss'],
})
export class MfaOptionsComponent implements OnInit {
    mfaOptionsForm: FormGroup;

    isValidated: boolean;

    radioLabel: RadioButton[] = [
        {
            key: 'email',
            label: 'Email',
            value: 'email',
        },
        {
            key: 'phoneNumber',
            label: 'Phone',
            value: 'phoneNumber',
        },
    ];

    infoConfig: any = {
        text: 'Please enter the phone number you want to use for MFA',
    };

    methodsConfig: any = {};

    buttonConfig: any = {
        name: 'Submit',
    };

    loading: boolean = false;

    registeredNumber: string;

    registeredNumberId: string;

    constructor(
        public router: Router,
        private notificationService: NotificationService,
        private mfaService: MfaService,
        private consentService: ConsentService,
        public configService: ConfigService
    ) {}

    ngOnInit(): void {
        this.loading = true;
        this.loadLabels();
        this.mfaService.getEnrollments(EOTPType.SMS).subscribe(
            (res: any) => {
                this.registeredNumber = res?.smsotp[0]?.attributes?.phoneNumber;
                this.registeredNumberId = res?.smsotp[0]?.id;
                this.isValidated = res?.smsotp[0]?.validated;
                if (!this.registeredNumber && !history.state.register) {
                    this.redirectToOTPpage({ type: EOTPType.EMAIL });
                }
                this.loading = false;
            },
            err => this.handleError(err)
        );
        this.createmfaOptionsForm();
        this.mfaService.getEnrollments(EOTPType.EMAIL).subscribe(
            () => {},
            err => this.handleError(err)
        );
    }

    deleteEnrollment() {
        this.mfaService
            .deleteEnrollment(EOTPType.SMS, this.registeredNumberId)
            .subscribe({
                next: () => {
                    this.registeredNumber = null;
                    this.registeredNumberId = null;
                    this.removeConsent();
                    this.mfaService.toggleMFA('false').subscribe({
                        next: () => {
                            this.notificationService.sendSuccess(
                                'MFA enrollment removed successfully!'
                            );
                        },
                        error: () =>
                            this.notificationService.sendError(
                                'Error occured while disabling MFA!'
                            ),
                    });
                },
                error: err => this.handleError(err),
            });
    }

    createmfaOptionsForm(): any {
        this.mfaOptionsForm = new FormGroup({
            isMobOrEmail: new FormControl('phoneNumber', Validators.required),
            phoneNumber: new FormControl(null, Validators.required),
        });
    }

    mfaOption() {
        this.notificationService.sendSuccess(
            'Your selected option has been saved !'
        );
        this.router.navigate(['/mfa-consent']);
    }

    onSelectedMfaMethod() {
        const mfaMethod = this.mfaOptionsForm.get('isMobOrEmail').value;
        const phoneNumber = this.mfaOptionsForm.get('phoneNumber')?.value;
        let type = 'email';

        if (mfaMethod === 'phoneNumber') {
            type = 'sms';
        }
        this.router.navigate(['/mfa-consent'], {
            state: { mfaMethod, phoneNumber, type },
        });
    }

    handleError(err) {
        const message = err?.error?.message || 'Something Went Wrong';
        this.notificationService.sendError(message);
        this.loading = false;
    }

    redirectToOTPpage(data) {
        this.router.navigate(['/mfa-otp'], {
            state: {
                ...data,
            },
        });
    }

    removeConsent() {
        const purposeId = [PURPOSEID.MFAMOBILENUMBER];
        this.consentService.getConsentDescription({ purposeId }).subscribe({
            next: (res: any) => {
                const payload = [
                    {
                        op: OPERATION.ADD,
                        value: {
                            purposeId: res.purposes.mfaMobileNumber.id,
                            state: STATE.DENY,
                            attributeId:
                                res.purposes.mfaMobileNumber.attributes[
                                    ITERATE.ZERO
                                ].id,
                            accessTypeId:
                                res.purposes.mfaMobileNumber.accessTypes[
                                    ITERATE.ZERO
                                ].id,
                        },
                    },
                ];

                this.consentService.updateConsent(payload).subscribe(
                    () => {},
                    err => {
                        this.notificationService.sendError(
                            err?.error?.message || DEFAULT_ERROR
                        );
                    }
                );
            },
            error: (err: any) => {
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }

    loadLabels() {
        if (this.configService.config?.['mfaMethods']) {
            this.methodsConfig = this.configService.config?.['mfaMethods'];
            if (this.methodsConfig?.button) {
                this.buttonConfig = this.methodsConfig?.button;
            }
            if (this.methodsConfig?.info) {
                this.infoConfig = this.methodsConfig?.info;
            }
            if (this.methodsConfig?.radioLabel) {
                this.radioLabel = this.configService.getFormattedConfig(
                    this.radioLabel,
                    this.configService.config,
                    'mfaMethods',
                    'radioLabel',
                    this.methodsConfig
                );
                this.radioLabel = this.configService.getFormattedConfig(
                    this.radioLabel,
                    this.configService.config,
                    'userAttrs',
                    'attrs',
                    this.methodsConfig
                );
            }
        }
    }
}
