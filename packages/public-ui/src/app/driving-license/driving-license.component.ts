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
import { CommonService } from '../services/common.service';
import { ConfigService } from '../services/config.service';
import { ValidationService } from '../services/validation.service';
import {
    ATTRIBUTE,
    DEFAULT_ERROR,
    VALIDATION_MSSG,
    OPERATION,
    SCHEMAS,
} from '../util/constant';

@Component({
    selector: 'app-driving-license',
    templateUrl: './driving-license.component.html',
})
export class DrivingLicenseComponent implements OnInit {
    headingConfig: any = {
        text: "Driver's License Renewal",
    };

    tenantUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;

    form1Fields: FormFeildInterface[] = [
        {
            key: 'driverLicenseNumber',
            label: "Driver's license number",
            fieldName: 'licenseNumber',
            placeholder: "Enter driver's license number",
        },
    ];

    showOtherFields: boolean = false;

    form2Fields: FormFeildInterface[] = [
        {
            key: 'driverLicenseNumber',
            label: "Driver's license number",
            fieldName: 'licenseNumber',
            placeholder: "Enter driver's license number",
            readonly: true,
        },
        {
            label: 'First name',
            fieldName: 'firstName',
            readonly: true,
        },
        {
            label: 'Last name',
            fieldName: 'lastName',
            readonly: true,
        },
        {
            key: 'homeAddress',
            label: 'Home address',
            fieldName: 'homeAddress',
        },
    ];

    subHeading: string;

    errMessage: string = VALIDATION_MSSG;

    showBtn: string = 'true';

    btnText: string = 'Redirect to homepage';

    message: string = `Your Driver's license and relevant information was found and is displayed below`;

    showMessage: boolean;

    btnUrl: string = '/dashboard';

    continueButtonConfig: ButtonInterface = {
        name: 'Continue',
        type: 'submit',
    };

    drivingLicenseRenewalForm: FormGroup;

    loading: boolean = false;

    invalidDetails: boolean = false;

    formFields: any;

    constructor(
        private service: AuthService,
        private notificationService: NotificationService,
        public configService: ConfigService,
        private validationService: ValidationService,
        private readonly commonService: CommonService,
        public router: Router
    ) {}

    driverLicenseInfoConfig: any = {};

    ngOnInit(): void {
        this.createDrivingLicenseRenewalForm();
        this.loadLabels();
        this.formFields = this.form1Fields;
    }

    loadLabels() {
        if (this.configService.config?.['driverLicense']) {
            this.driverLicenseInfoConfig = this.configService.config?.[
                'driverLicense'
            ];
            this.form1Fields = this.configService.getFormattedConfig(
                this.form1Fields,
                this.configService.config,
                'userAttrs',
                'attrs',
                this.driverLicenseInfoConfig
            );
            this.form2Fields = this.configService.getFormattedConfig(
                this.form2Fields,
                this.configService.config,
                'userAttrs',
                'attrs',
                this.driverLicenseInfoConfig
            );
            if (this.driverLicenseInfoConfig?.heading) {
                this.headingConfig = this.driverLicenseInfoConfig?.heading;
            }
            if (this.driverLicenseInfoConfig?.button) {
                this.continueButtonConfig = this.driverLicenseInfoConfig?.button;
            }
        }
    }

    createDrivingLicenseRenewalForm(): any {
        this.drivingLicenseRenewalForm = new FormGroup({
            licenseNumber: new FormControl(null, Validators.required),
            firstName: new FormControl(null),
            lastName: new FormControl(null),
            homeAddress: new FormControl(null),
        });
    }

    submitForm(): any {
        this.invalidDetails = false;
        if (!this.showOtherFields) {
            this.loading = true;
            const userDetails: any = this.commonService.userData;
            const payLoad: any = {
                licenseNumber: this.drivingLicenseRenewalForm
                    .get('licenseNumber')
                    .value.trim(),
                ssn: userDetails?.[USER_URN]?.customAttributes.find(
                    attr => attr.name === ATTRIBUTE.SSN
                )?.values[0],
            };

            this.validationService.validateLicenseNumber(payLoad).subscribe({
                next: () => {
                    this.drivingLicenseRenewalForm.reset(
                        this.drivingLicenseRenewalForm.value
                    );
                    this.showOtherFields = true;

                    this.drivingLicenseRenewalForm.patchValue({
                        firstName: userDetails.name.givenName,
                        lastName: userDetails.name.familyName,
                        homeAddress: userDetails.addresses?.[0].formatted,
                    });
                    this.drivingLicenseRenewalForm.controls[
                        'firstName'
                    ].setValidators([Validators.required]);
                    this.drivingLicenseRenewalForm.controls[
                        'lastName'
                    ].setValidators([Validators.required]);
                    this.drivingLicenseRenewalForm.controls[
                        'homeAddress'
                    ].setValidators([Validators.required]);
                    this.loading = false;

                    this.formFields = this.form2Fields;
                    this.loadLabels();
                    this.showMessage = true;
                    this.headingConfig.text =
                        'Please verify your home address.';
                    this.subHeading =
                        'If it is incorrect, please correct it before clicking Continue';
                },
                error: (err: any) => {
                    this.loading = false;
                    this.invalidDetails = true;
                    this.notificationService.sendError(
                        err?.error?.message || DEFAULT_ERROR
                    );
                },
            });
        } else {
            this.loading = true;
            const drivingLicenseNumber = this.drivingLicenseRenewalForm
                .get('licenseNumber')
                .value.trim();
            const firstName = this.drivingLicenseRenewalForm
                .get('firstName')
                .value.trim();
            const lastName = this.drivingLicenseRenewalForm
                .get('lastName')
                .value.trim();
            const address = this.drivingLicenseRenewalForm
                .get('homeAddress')
                .value.trim();

            const payloadRequest: UpdateDetails = {
                schemas: SCHEMAS,
                Operations: [
                    {
                        op: OPERATION.ADD,
                        path: `${USER_URN}:customAttributes`,
                        value: [
                            {
                                name: ATTRIBUTE.LICENSENUMBER,
                                values: [drivingLicenseNumber],
                            },
                        ],
                    },
                    {
                        op: OPERATION.REPLACE,
                        path: 'name.givenName',
                        value: firstName,
                    },
                    {
                        op: OPERATION.REPLACE,
                        path: 'name.familyName',
                        value: lastName,
                    },
                    {
                        op: OPERATION.REPLACE,
                        path: 'addresses[type eq "work"].formatted',
                        value: address,
                    },
                    {
                        op: OPERATION.ADD,
                        path: `${USER_URN}:customAttributes`,
                        value: [
                            {
                                name: ATTRIBUTE.TRANSACTIONID,
                                values: ['true'],
                            },
                        ],
                    },
                ],
            };
            this.addUserDetails(payloadRequest);
        }
    }

    validateLicenseNumber(): boolean {
        return this.drivingLicenseRenewalForm.value.licenseNumber;
    }

    private addUserDetails(payloadRequest): any {
        this.invalidDetails = false;
        this.service
            .updateUserDetails(payloadRequest, this.tenantUrl)
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.commonService.getUserData();
                    this.router.navigate(['/renewed']);
                },
                error: (err: any) => {
                    this.loading = false;
                    this.invalidDetails = true;
                    this.notificationService.sendError(
                        err?.error?.detail || DEFAULT_ERROR
                    );
                },
            });
    }
}
