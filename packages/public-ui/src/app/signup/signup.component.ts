import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
    catchError,
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    EMPTY,
    filter,
    switchMap,
    tap,
} from 'rxjs';
import environment from 'src/environments/environment';
import {
    ButtonInterface,
    ESignUpFieldName,
    FormFeildInterface,
    SignupRequestPayload,
} from '../models/signup-component.model';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { ValidationService } from '../services/validation.service';
import { ATTRIBUTE, DEFAULT_ERROR } from '../util/constant';
import { nonWhitespaceRegExp } from '../util/validations';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
    loading: boolean = false;

    inputType: FormFeildInterface[] = [
        {
            key: 'ssn',
            label: 'SSN',
            placeholder: '',
            fieldName: ESignUpFieldName.ssn,
        },
        {
            key: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name',
            fieldName: ESignUpFieldName.firstName,
        },
        {
            key: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            fieldName: ESignUpFieldName.lastName,
        },
        {
            key: 'email',
            label: 'Email',
            placeholder: '',
            fieldName: ESignUpFieldName.email,
        },
    ];

    requiredErrMessage: string = ' is required.';

    buttonType: ButtonInterface = {
        type: 'submit',
        name: 'Signup',
    };

    signupForm: FormGroup = new FormGroup({});

    loginUrl = environment.loginUrl;

    userAddress: string;

    formError: string;

    matchingError: string;

    matching: boolean;

    signupConfig: any;

    headlingConfig: any = {
        text: 'Signup',
    };

    subHeadlingConfig: any = {
        text: 'Signup to create your account below',
    };

    emailNote: any = {
        text:
            "If you don't have an email account, <a href='https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp'>Click here</a> to get one ",
    };

    loginNote: any = {
        text:
            "Already have an account? <a href='/login'>Click here</a> login url should come here",
    };

    errorMsgSSN: any = {
        text: 'SSN is invalid, please enter a valid SSN',
    };

    constructor(
        private readonly authservice: AuthService,
        public router: Router,
        private readonly validationService: ValidationService,
        public configService: ConfigService
    ) {}

    ngOnInit(): void {
        this.createAccountForm();
        this.checkIdentityMatching();
        this.loadLabels();
    }

    createAccountForm(): any {
        this.signupForm = new FormGroup({
            [ESignUpFieldName.ssn]: new FormControl(null, [
                Validators.required,
            ]),
            [ESignUpFieldName.firstName]: new FormControl(null, [
                Validators.required,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            [ESignUpFieldName.lastName]: new FormControl(null, [
                Validators.required,
                Validators.pattern(nonWhitespaceRegExp),
            ]),
            [ESignUpFieldName.email]: new FormControl(null, [
                Validators.required,
                Validators.email,
            ]),
        });
    }

    checkIdentityMatching(): void {
        combineLatest({
            [ESignUpFieldName.ssn]: this.signupForm
                .get(ESignUpFieldName.ssn)
                .valueChanges.pipe(
                    debounceTime(1000),
                    distinctUntilChanged(),
                    filter(value => value && value.length > 0)
                ),

            [ESignUpFieldName.firstName]: this.signupForm
                .get(ESignUpFieldName.firstName)
                .valueChanges.pipe(
                    debounceTime(1000),
                    distinctUntilChanged(),
                    filter(value => value && value.length > 0)
                ),

            [ESignUpFieldName.lastName]: this.signupForm
                .get(ESignUpFieldName.lastName)
                .valueChanges.pipe(
                    debounceTime(500),
                    distinctUntilChanged(),
                    filter(value => value && value.length > 0)
                ),
        })
            .pipe(
                tap(() => {
                    this.matching = true;
                }),
                debounceTime(2000),
                switchMap(res =>
                    this.validationService
                        .validateUser({
                            ssn: res[ESignUpFieldName.ssn].replace(/-/g, ''),
                            firstName: res[ESignUpFieldName.firstName],
                            lastName: res[ESignUpFieldName.lastName],
                        })
                        .pipe(
                            catchError(err => {
                                this.matching = false;
                                this.matchingError =
                                    err?.error?.message || DEFAULT_ERROR;
                                return EMPTY;
                            })
                        )
                )
            )
            .subscribe(res => {
                this.matching = false;
                this.matchingError = '';
                this.userAddress = res.address;
            });
    }

    loadLabels() {
        if (this.configService.config?.['signup']) {
            this.signupConfig = this.configService.config?.['signup'];
            this.inputType = this.configService.getFormattedConfig(
                this.inputType,
                this.configService.config,
                'userAttrs',
                'attrs',
                this.signupConfig
            );
            if (this.signupConfig?.headline) {
                this.headlingConfig = this.signupConfig?.headline;
            }
            if (this.signupConfig?.subheading) {
                this.subHeadlingConfig = this.signupConfig?.subheading;
            }
            if (this.signupConfig?.button) {
                this.buttonType = this.signupConfig?.button;
            }
            if (this.signupConfig?.emailNote) {
                this.emailNote = this.signupConfig?.emailNote;
            }
            if (this.signupConfig?.loginNote) {
                this.loginNote = this.signupConfig?.loginNote;
            }
            if (this.signupConfig?.errorMsgSSN) {
                this.errorMsgSSN = this.signupConfig?.errorMsgSSN;
            }
        }
    }

    onFormSubmit(): any {
        if (!this.signupForm.valid) {
            return;
        }
        this.loading = true;
        let ssnId = this.signupForm
            .get(ESignUpFieldName.ssn)
            .value.replace(/-/g, '');
        const fName = this.signupForm
            .get(ESignUpFieldName.firstName)
            .value.trim();
        const lName = this.signupForm
            .get(ESignUpFieldName.lastName)
            .value.trim();
        const email = this.signupForm.get(ESignUpFieldName.email).value;
        if (ssnId.length > 9) {
            ssnId = ssnId.substring(0, 9);
        }
        const userCredentials: SignupRequestPayload = {
            ssnAttrName: ATTRIBUTE.SSN,
            SSN: ssnId,
            firstName: fName,
            lastName: lName,
            email,
            address: this.userAddress,
        };
        this.authservice.signup(userCredentials).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/identity-proofing']);
                this.signupForm.reset();
            },
            error: (err: HttpErrorResponse) => {
                this.signupForm.controls[ESignUpFieldName.ssn].setValue(
                    `${ssnId.substring(0, 3)}-${ssnId.substring(
                        3,
                        5
                    )}-${ssnId.substring(5, 9)}`
                );
                this.loading = false;
                this.formError = err?.error?.message || 'Something went wrong!';
            },
        });
    }
}
