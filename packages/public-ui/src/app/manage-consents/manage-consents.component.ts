import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { switchMap } from 'rxjs';
import { NotificationService } from '../common/Notification/notificationService';
import { UpdateDetails, USER_URN } from '../models/user-detail.model';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { ConsentService, ECONSENTSTYLE } from '../services/consent.service';
import { EOTPType, MfaService } from '../services/mfa.service';
import {
    ATTRIBUTE,
    DEFAULT_ERROR,
    FAILURE,
    ITERATE,
    OPERATION,
    PURPOSEID,
    SCHEMAS,
} from '../util/constant';

@Component({
    selector: 'app-manage-consents',
    templateUrl: './manage-consents.component.html',
    styleUrls: ['./manage-consents.component.scss'],
})
export class ManageConsentsComponent implements OnInit {
    headingConfig: any = {
        text: 'Manage Consent',
    };

    subHeadingConfig: any = {
        text:
            'Use this page to manage your Consents. Check or uncheck the appropriate checkboxes to manage your consents.',
    };

    consentManageForm: FormGroup;

    loading: boolean;

    consentData: any[] = [];

    content: any[] = [];

    btnErrorDisabled: boolean;

    registerMobileNumber: string;

    transparent: number = ECONSENTSTYLE.TRANSPARENT;

    hide: number = ECONSENTSTYLE.HIDE;

    manageConsentConfig: any = {};

    consentRevokePayload: any = [];

    prevConsentStatus: any = [];

    constructor(
        private notificationService: NotificationService,
        private consentService: ConsentService,
        public configService: ConfigService,
        private service: AuthService,
        private mfaService: MfaService
    ) {
        this.loadLabels();
    }

    loadLabels(consentArray?) {
        if (this.configService.config?.['manageConsent']) {
            this.manageConsentConfig = this.configService.config?.[
                'manageConsent'
            ];
            if (this.manageConsentConfig?.headline) {
                this.headingConfig = this.manageConsentConfig?.headline;
            }
            if (this.manageConsentConfig?.subHeading) {
                this.subHeadingConfig = this.manageConsentConfig?.subHeading;
            }
            if (consentArray) {
                this.consentData = this.configService.getFormattedConfig(
                    consentArray,
                    this.configService.config,
                    'manageConsent',
                    'consentForm',
                    this.manageConsentConfig
                );
            }
        }
    }

    ngOnInit(): void {
        this.createManageConsentForm();
        this.getManageConsentDetails();
    }

    handleError(err) {
        this.loading = false;
        this.notificationService.sendError(err || DEFAULT_ERROR);
    }

    createManageConsentForm(): void {
        this.consentManageForm = new FormGroup({
            [PURPOSEID.CREDITCARDCONSENTDMV]: new FormControl(''),
            [PURPOSEID.CREDITCARDCONSENTAGENCIES]: new FormControl(''),
            [PURPOSEID.MFAMOBILENUMBER]: new FormControl(''),
        });
    }

    getManageConsentDetails(): void {
        this.loading = true;
        const purposeId = [
            PURPOSEID.CREDITCARDCONSENTDMV,
            PURPOSEID.CREDITCARDCONSENTAGENCIES,
            PURPOSEID.MFAMOBILENUMBER,
        ];

        this.consentService.getConsentDescription({ purposeId }).subscribe({
            next: res => {
                this.consentData = Object.values(res.purposes).map(
                    (item: any) => ({
                        key: item.id,
                        text: item.description,
                        purposeId: item.id,
                        formFieldName: item.id,
                        accessTypeId: item.accessTypes[ITERATE.ZERO]?.id,
                        attr: item.attributes.map(attr => attr.id),
                        assentUIDefault:
                            item.attributes?.[ITERATE.ZERO]?.accessTypes?.[
                                ITERATE.ZERO
                            ]?.assentUIDefault,
                        legalCategory:
                            item.attributes?.[ITERATE.ZERO]?.accessTypes?.[
                                ITERATE.ZERO
                            ]?.legalCategory,
                    })
                );

                this.loadLabels(this.consentData);

                this.content = this.consentData.map(item => ({
                    purposeId: item.purposeId,
                    accessTypeId: item.accessTypeId,
                    attributeId: item.attr?.[ITERATE.ZERO],
                }));

                this.setConsentStatus();
            },
            error: err => {
                this.btnErrorDisabled = true;
                this.handleError(err?.error?.message);
            },
        });

        this.mfaService.getEnrollments(EOTPType.SMS).subscribe({
            next: res => {
                this.registerMobileNumber = res?.smsotp[0]?.id;
            },
            error: err => this.handleError(err?.error?.Message),
        });
    }

    setConsentStatus(): void {
        const payload = { trace: 'true', items: this.content };
        this.consentService.consentApprovalStatus(payload).subscribe({
            next: res => {
                this.loading = false;

                res.forEach(item => {
                    if (item?.result?.[ITERATE.ZERO]?.approved) {
                        this.consentManageForm
                            .get([item.purposeId])
                            .setValue(item?.result?.[ITERATE.ZERO]?.approved);
                    } else {
                        this.consentManageForm
                            .get([item.purposeId])
                            .setValue(
                                this.consentData.find(
                                    res => res.purposeId === item.purposeId
                                )?.assentUIDefault
                            );
                    }
                    this.consentData = this.consentService.getAssentImplicit(
                        item.purposeId,
                        item?.result?.[ITERATE.ZERO],
                        this.consentData
                    );
                    this.prevConsentStatus.push({
                        [item.purposeId]: this.consentManageForm.get([
                            item.purposeId,
                        ]).value,
                    });
                });
            },
            error: err => {
                this.btnErrorDisabled = true;
                this.handleError(err?.error?.message);
            },
        });
    }

    change(e, name): void {
        if (
            e.target.checked !==
            this.prevConsentStatus.find(id => Object.keys(id)[0] === name)?.[
                name
            ]
        ) {
            this.consentRevokePayload.push(
                ...this.consentService.addConsentPayload(
                    e.target.checked,
                    name,
                    this.consentData
                )
            );
        } else {
            this.consentRevokePayload = this.consentRevokePayload.filter(
                i => i.value.purposeId !== name
            );
        }
    }

    onSubmit(): void {
        this.loading = true;

        const revokeCreditCard: UpdateDetails = {
            schemas: SCHEMAS,
            Operations: [
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CARDNUMBER,
                            values: [],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CARDEXPIRATION,
                            values: [],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CREITCARDFULLNAME,
                            values: [],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.CREDITCARDTYPE,
                            values: [],
                        },
                    ],
                },
            ],
        };

        const storeCheck =
            !this.consentManageForm.get(PURPOSEID.CREDITCARDCONSENTDMV).value &&
            this.consentManageForm.get(PURPOSEID.CREDITCARDCONSENTDMV).dirty;

        const mfaCheck =
            !this.consentManageForm.get(PURPOSEID.MFAMOBILENUMBER).value &&
            this.consentManageForm.get(PURPOSEID.MFAMOBILENUMBER).dirty &&
            this.registerMobileNumber;

        this.consentService.updateConsent(this.consentRevokePayload).subscribe({
            next: response => {
                const error = response?.results?.find(
                    res => res.result === FAILURE
                );
                if (error) {
                    this.handleError(error.error);
                } else {
                    if (storeCheck) {
                        this.removeCardDetail(response, revokeCreditCard);
                    }

                    if (mfaCheck) {
                        this.removeMFA();
                    }

                    if (!storeCheck && !mfaCheck) {
                        this.loading = false;
                        this.notificationService.sendSuccess(
                            response?.messageDescription
                        );
                    }
                    this.reset();
                }
            },
            error: (err: any) => {
                this.handleError(err?.error?.message);
            },
        });
    }

    removeCardDetail(response, payload): void {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service.updateUserDetails(payload, tenantUrl).subscribe({
            next: () => {
                this.loading = false;
                this.notificationService.sendSuccess(
                    response?.messageDescription
                );
            },
            error: (err: any) => {
                this.handleError(err?.error?.detail);
            },
        });
    }

    removeMFA(): void {
        this.mfaService
            .deleteEnrollment(EOTPType.SMS, this.registerMobileNumber)
            .pipe(switchMap(() => this.mfaService.toggleMFA('false')))
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.notificationService.sendSuccess(
                        'MFA enrollment removed successfully!'
                    );
                },
                error: err => {
                    this.handleError(
                        err || 'Error occured while disabling MFA!'
                    );
                },
            });
    }

    reset(): void {
        this.consentData = [];
        this.content = [];
        this.consentRevokePayload = [];
        this.prevConsentStatus = [];
        this.getManageConsentDetails();
    }
}
