import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ConfigService } from 'src/app/services/config.service';
import {
    ConsentService,
    ECONSENTSTYLE,
} from 'src/app/services/consent.service';
import { MfaService } from 'src/app/services/mfa.service';

import {
    DEFAULT_ERROR,
    ITERATE,
    OPERATION,
    PURPOSEID,
    STATE,
} from 'src/app/util/constant';

@Component({
    selector: 'app-mfa-consent',
    templateUrl: './mfa-consent.component.html',
    styleUrls: ['./mfa-consent.component.scss'],
})
export class MfaConsentComponent implements OnInit {
    consentForm: FormGroup;

    loading: boolean = false;

    mfaMethod: string;

    phoneNumber: string;

    type: string;

    heading: string = '';

    headingColorConfig: any = {};

    consentData: any;

    consentConfig: any = {};

    constructor(
        private notificationService: NotificationService,
        private mfaService: MfaService,
        private router: Router,
        public configService: ConfigService,
        private consentService: ConsentService
    ) {}

    ngOnInit(): void {
        this.mfaMethod = history.state?.mfaMethod;
        this.phoneNumber = history.state?.phoneNumber;
        this.type = history.state?.type;

        this.createMfconsentForm();
        this.consentDescription();
    }

    createMfconsentForm(): any {
        this.consentForm = new FormGroup({
            termsAndConditions: new FormControl(null, Validators.required),
        });
    }

    consentDescription(): void {
        this.loading = true;
        const purposeId = [PURPOSEID.MFAMOBILENUMBER];

        this.consentService.getConsentDescription({ purposeId }).subscribe({
            next: (res: any) => {
                this.consentForm
                    .get('termsAndConditions')
                    .setValue(
                        res.purposes[PURPOSEID.MFAMOBILENUMBER].attributes?.[
                            ITERATE.ZERO
                        ]?.accessTypes?.[ITERATE.ZERO]?.assentUIDefault
                    );

                this.heading =
                    res.purposes[PURPOSEID.MFAMOBILENUMBER].description;
                this.consentData = {
                    purposeId: res.purposes[PURPOSEID.MFAMOBILENUMBER].id,
                    accessTypeId:
                        res.purposes[PURPOSEID.MFAMOBILENUMBER].accessTypes[
                            ITERATE.ZERO
                        ].id,
                    attributeId:
                        res.purposes[PURPOSEID.MFAMOBILENUMBER].attributes[
                            ITERATE.ZERO
                        ].id,
                    assentUIDefault:
                        res.purposes[PURPOSEID.MFAMOBILENUMBER].attributes[
                            ITERATE.ZERO
                        ].accessTypes[ITERATE.ZERO].assentUIDefault,
                    legalCategory:
                        res.purposes[PURPOSEID.MFAMOBILENUMBER].attributes[
                            ITERATE.ZERO
                        ].accessTypes[ITERATE.ZERO].legalCategory,
                };

                const {
                    purposeId,
                    accessTypeId,
                    attributeId,
                } = this.consentData;

                const payload = {
                    trace: true,
                    items: [{ purposeId, accessTypeId, attributeId }],
                };
                this.consentService.consentApprovalStatus(payload).subscribe(
                    response => {
                        this.loading = false;

                        this.consentData = {
                            ...this.consentData,
                            rule:
                                response[ITERATE.ZERO].result[ITERATE.ZERO]
                                    .trace?.rule?.decision,
                        };

                        const value =
                            response[ITERATE.ZERO].result[ITERATE.ZERO]
                                .approved || this.consentData.assentUIDefault;

                        const decision =
                            this.consentData.legalCategory ===
                                ECONSENTSTYLE.HIDE ||
                            this.consentData.legalCategory ===
                                ECONSENTSTYLE.TRANSPARENT ||
                            this.consentData.rule === ECONSENTSTYLE.IMPLICIT;
                        this.loadLabels();
                        if (value || decision) {
                            this.consentForm
                                .get('termsAndConditions')
                                .patchValue(value);

                            this.onSubmit();
                        }
                    },
                    err => {
                        this.handleError(err);
                    }
                );
            },
            error: (err: any) => {
                this.loadLabels();
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }

    loadLabels() {
        if (this.configService.config?.['mfaConsent']) {
            this.consentConfig = this.configService.config?.['mfaConsent'];
            if (this.consentConfig?.description) {
                this.headingColorConfig = this.consentConfig?.description;
            }
            if (this.consentConfig?.description?.text) {
                this.heading = this.consentConfig?.description.text;
            }
        }
    }

    onSubmit() {
        this.loading = true;
        const payload = [
            {
                op: OPERATION.ADD,
                value: {
                    purposeId: this.consentData.purposeId,
                    state: this.consentForm.get('termsAndConditions').value
                        ? STATE.ALLOW
                        : STATE.DENY,
                    attributeId: this.consentData.attributeId,
                    accessTypeId: this.consentData.accessTypeId,
                },
            },
        ];

        this.consentService.updateConsent(payload).subscribe(() => {
            this.notificationService.sendSuccess(
                'Your consent is updated successfully !'
            );
            if (!this.mfaMethod || !this.phoneNumber || !this.type) {
                return;
            }

            this.mfaService
                .registrationMfa({
                    mfaMethod: this.mfaMethod,
                    phoneNumber: this.phoneNumber,
                    type: this.type,
                })
                .subscribe(
                    RegistrationMfaRes => {
                        this.notificationService.sendSuccess(
                            RegistrationMfaRes?.message
                        );
                        this.redirectToOTPpage(RegistrationMfaRes.data);
                        this.loading = false;
                    },
                    err => {
                        this.handleError(err);
                        this.router.navigate(['/mfa-methods']);
                    }
                );
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
}
