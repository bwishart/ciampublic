import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../common/Notification/notificationService';
import {
    ButtonInterface,
    FormFeildInterface,
} from '../models/signup-component.model';
import { UpdateDetails, USER_URN } from '../models/user-detail.model';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import {
    ATTRIBUTE,
    DEFAULT_ERROR,
    OPERATION,
    SCHEMAS,
    VALIDATION_MSSG,
} from '../util/constant';
import { nonWhitespaceRegExp } from '../util/validations';

export interface RadioButton {
    name: string;
    value: boolean;
}

@Component({
    selector: 'app-unemployment-registration',
    templateUrl: './unemployment-registration.component.html',
    styleUrls: ['./unemployment-registration.component.scss'],
})
export class UnemploymentRegistrationComponent implements OnInit {
    formTitle: String = 'Unemployment Registration';

    registrationForm: FormGroup;

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

    inputType: FormFeildInterface[] = [
        {
            label: 'Last employer name',
            placeholder: 'Enter Last Employer Name',
            fieldName: 'lastEmployerName',
            type: 'text',
            key: 'lastEmployerName',
        },
        {
            key: 'lastEmploymentDate',
            label: 'Last date of employment',
            placeholder: 'Select date',
            fieldName: 'lastEmploymentDate',
            type: 'date',
        },
        {
            label: 'Have you collected unemployment before?',
            fieldName: 'isUnEmploymentCollected',
            type: 'radio',
            key: 'isUnEmploymentCollected',
        },
        {
            label: 'Enter the date',
            fieldName: 'date',
            type: 'date',
        },
    ];

    unEmpRegConfig: any = {};

    headlingConfig: any = {
        text: 'Unemployment Registration',
    };

    buttonType: ButtonInterface = {
        type: 'submit',
        name: 'Submit',
    };

    errMessage: string = VALIDATION_MSSG;

    date = new Date().toISOString().split('T')[0];

    loading: boolean = false;

    constructor(
        private service: AuthService,
        private notificationService: NotificationService,
        public router: Router,
        public configService: ConfigService
    ) {}

    ngOnInit(): void {
        this.createunEmploymentRegForm();
        this.setCustomValidation();
        this.loadLabels();
    }

    createunEmploymentRegForm(): any {
        this.registrationForm = new FormGroup({
            lastEmployerName: new FormControl(null, [
                Validators.required,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            lastEmploymentDate: new FormControl(null, Validators.required),
            isUnEmploymentCollected: new FormControl(
                false,
                Validators.required
            ),
            date: new FormControl(null),
        });
    }

    private setCustomValidation(): void {
        this.registrationForm
            .get('isUnEmploymentCollected')
            .valueChanges.subscribe(value => {
                if (value) {
                    this.registrationForm
                        .get('date')
                        .setValidators(Validators.required);
                } else {
                    this.registrationForm.get('date').clearValidators();
                }
                this.registrationForm.get('date').updateValueAndValidity();
            });
    }

    unEmployemntForm(): any {
        this.loading = true;

        const lastEmployerName = this.registrationForm
            .get('lastEmployerName')
            .value.trim();
        const lastEmploymentDate = this.registrationForm.get(
            'lastEmploymentDate'
        ).value;
        const isUnEmploymentCollected = this.registrationForm.get(
            'isUnEmploymentCollected'
        ).value;
        const unEmpCollectedDate = this.registrationForm.get('date').value;

        const payloadRequest: UpdateDetails = {
            schemas: SCHEMAS,
            Operations: [
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.LASTEMPLOYERNAME,
                            values: [lastEmployerName],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.LASTEMPLOYMENTDATE,
                            values: [lastEmploymentDate],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.UNEMPLOYMENTCOLLECTED,
                            values: [`${isUnEmploymentCollected}`],
                        },
                    ],
                },
                {
                    op: OPERATION.ADD,
                    path: `${USER_URN}:customAttributes`,
                    value: [
                        {
                            name: ATTRIBUTE.UNEMPLOYMENTCOLLECTEDDATE,
                            values: isUnEmploymentCollected
                                ? [unEmpCollectedDate]
                                : [],
                        },
                    ],
                },
            ],
        };

        this.submitForm(payloadRequest);
    }

    private submitForm(payloadRequest): any {
        const tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;
        this.service.updateUserDetails(payloadRequest, tenantUrl).subscribe({
            next: () => {
                this.loading = false;
                this.registrationForm.reset();
                this.router.navigate(['/registered']);
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
        if (this.configService.config?.['unEmployementReg']) {
            this.unEmpRegConfig = this.configService.config?.[
                'unEmployementReg'
            ];
            this.inputType = this.configService.getFormattedConfig(
                this.inputType,
                this.configService.config,
                'userAttrs',
                'attrs',
                this.unEmpRegConfig
            );
            if (this.unEmpRegConfig?.headline) {
                this.headlingConfig = this.unEmpRegConfig?.headline;
            }
        }
    }
}
