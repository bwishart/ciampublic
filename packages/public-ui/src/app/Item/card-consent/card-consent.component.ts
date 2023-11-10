import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ConfigService } from 'src/app/services/config.service';
import {
    ConsentService,
    ECONSENTSTYLE,
} from 'src/app/services/consent.service';
import {
    consentErrorPrefix,
    DEFAULT_ERROR,
    FAILURE,
    ITERATE,
    OPERATION,
    PURPOSEID,
    STATE,
} from 'src/app/util/constant';

interface Radio {
    name: string;
    value: boolean;
}

@Component({
    selector: 'app-card-consent',
    templateUrl: './card-consent.component.html',
    styleUrls: ['./card-consent.component.scss'],
})
export class CardConsentComponent implements OnInit {
    consentData: any[] = [];

    content: any[] = [];

    consentForm: FormGroup;

    loading: boolean = true;

    shareResponsePayload;

    storeResponsePayload;

    radioBtn: Radio[] = [
        {
            name: 'Yes',
            value: true,
        },
        {
            name: 'No',
            value: false,
        },
    ];

    transparent: number = ECONSENTSTYLE.TRANSPARENT;

    hide: number = ECONSENTSTYLE.HIDE;
    headingConfig: any = {
        text: 'USER CONSENT',
    };

    noteConfig: any = {
        text:
            '*NOTE:  No Transactions will be made without your prior approval',
    };

    buttonConfig: any = {
        name: 'Continue',
    };

    cardConsentConfig: any = {};

    constructor(
        private consentService: ConsentService,
        private notificationService: NotificationService,
        private router: Router,
        public configService: ConfigService
    ) {
        this.loadLabels();
    }

    ngOnInit(): void {
        this.initConsentForm();
        this.consentDescription();
    }

    initConsentForm(): void {
        this.consentForm = new FormGroup({
            [PURPOSEID.CREDITCARDCONSENTDMV]: new FormControl(
                null,
                Validators.required
            ),
            [PURPOSEID.CREDITCARDCONSENTAGENCIES]: new FormControl(
                null,
                Validators.required
            ),
        });
    }

    consentDescription(): void {
        this.loading = true;
        const purposeId = [
            PURPOSEID.CREDITCARDCONSENTDMV,
            PURPOSEID.CREDITCARDCONSENTAGENCIES,
        ];

        this.consentService.getConsentDescription({ purposeId }).subscribe({
            next: (res: any) => {
                Object.values(res?.purposes).forEach(value => {
                    this.consentData.push(value);
                });
                this.splitConsentData();
            },
            error: (err: any) => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }

    splitConsentData(): any {
        this.content = this.consentData.map((data: any) => ({
            key: data.id,
            text: data.description,
            purposeId: data.id,
            fieldName: data.id,
            accessTypeId: data?.accessTypes?.[ITERATE.ZERO]?.id,
            attr: data.attributes.map(attr => attr.id),
            assentUIDefault:
                data?.attributes?.[ITERATE.ZERO]?.accessTypes?.[ITERATE.ZERO]
                    ?.assentUIDefault,
            legalCategory:
                data?.attributes?.[ITERATE.ZERO]?.accessTypes?.[ITERATE.ZERO]
                    ?.legalCategory,
        }));

        this.loadLabels(this.content);
        this.setInitialState(this.content);
    }

    setInitialState(data): void {
        const items = data.map(item => ({
            purposeId: item.purposeId,
            accessTypeId: item.accessTypeId,
            attributeId: item.attr?.[ITERATE.ZERO],
        }));
        const payload = { trace: 'true', items };

        this.consentService.consentApprovalStatus(payload).subscribe({
            next: res => {
                this.loading = false;

                res.forEach(item => {
                    if (item?.result?.[ITERATE.ZERO]?.approved) {
                        this.consentForm
                            .get([item.purposeId])
                            .setValue(item?.result?.[ITERATE.ZERO]?.approved);
                    } else {
                        this.consentForm
                            .get([item.purposeId])
                            .setValue(
                                this.content.find(
                                    res => res.purposeId === item.purposeId
                                )?.assentUIDefault
                            );
                    }
                    this.content = this.consentService.getAssentImplicit(
                        item.purposeId,
                        item?.result?.[ITERATE.ZERO],
                        this.content
                    );
                });
                this.checkConsentAvailable();
            },
            error: err => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }

    checkConsentAvailable(): void {
        const byPassConsent = this.content.every(
            type =>
                type.legalCategory === ECONSENTSTYLE.HIDE ||
                type.rule === ECONSENTSTYLE.IMPLICIT
        );
        if (byPassConsent) {
            this.frwdCardConsentState();
        }
    }

    consentSubmit(): any {
        this.loading = true;
        const consentPayload = [];

        this.content.forEach(item => {
            item.attr.forEach(attr => {
                consentPayload.push({
                    op: OPERATION.ADD,
                    value: {
                        purposeId: item.purposeId,
                        state: this.consentForm.get([item.purposeId]).value
                            ? STATE.ALLOW
                            : STATE.DENY,
                        attributeId: attr,
                        accessTypeId: item.accessTypeId,
                    },
                });
            });
        });

        this.consentService.updateConsent(consentPayload).subscribe({
            next: (response: any) => {
                this.loading = false;
                const error = response?.results?.find(
                    res => res.result === FAILURE
                );
                if (error) {
                    this.notificationService.sendError(
                        `${consentErrorPrefix} ${error.error}`
                    );
                } else {
                    this.notificationService.sendSuccess(
                        response?.messageDescription
                    );
                }
                this.frwdCardConsentState();
            },
            error: (err: any) => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.message || DEFAULT_ERROR
                );
            },
        });
    }

    frwdCardConsentState(): void {
        this.consentService.consentDetail = {
            storeConsentState: this.consentForm.get([
                PURPOSEID.CREDITCARDCONSENTDMV,
            ]).value,
            shareConsentstate: this.consentForm.get([
                PURPOSEID.CREDITCARDCONSENTAGENCIES,
            ]).value,
        };
        this.router.navigate(['/confirmation']);
    }

    loadLabels(cardConsent?) {
        if (this.configService.config?.['creditCardConsent']) {
            this.cardConsentConfig = this.configService.config?.[
                'creditCardConsent'
            ];
            if (this.cardConsentConfig?.headline) {
                this.headingConfig = this.cardConsentConfig?.headline;
            }
            if (this.cardConsentConfig?.note) {
                this.noteConfig = this.cardConsentConfig?.note;
            }
            if (cardConsent) {
                this.content = this.configService.getFormattedConfig(
                    cardConsent,
                    this.configService.config,
                    'creditCardConsent',
                    'consentForm',
                    this.cardConsentConfig
                );
            }
            if (this.cardConsentConfig?.button) {
                this.buttonConfig = this.cardConsentConfig?.button;
            }
        }
    }
}
