import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { ConfigService } from 'src/app/services/config.service';
import { EOTPType, MfaService } from 'src/app/services/mfa.service';

@Component({
    selector: 'app-mfa-otp',
    templateUrl: './mfa-otp.component.html',
    styleUrls: ['./mfa-otp.component.scss'],
})
export class MfaOtpComponent implements OnInit {
    mfaOtpVerification: any = {};

    count: Number = 0;

    loading: boolean = false;

    otp: string = '';

    state;

    correlation: string;

    countDownTime: string;

    error: string = '';

    interval: any;

    otpConfig: any = {};

    mailMsgConfig: any = {
        text: 'OTP sent to your mail!',
    };

    buttonConfig: any = {
        name: 'Submit',
    };

    ngOnInit() {
        this.state = history?.state;
        if (this.state?.type === EOTPType.EMAIL) {
            this.onResendOtp();
        } else if (this.state?.type === EOTPType.SMS) {
            this.initCountDown(this.state?.expiry);
            this.correlation = this.state?.correlation;
        }

        this.loadLabels();
    }

    constructor(
        public router: Router,
        private notificationService: NotificationService,
        private mfaService: MfaService,
        public configService: ConfigService
    ) {}

    onSubmit() {
        const { otp } = this;
        this.mfaOtpVerification.otp = otp;
        this.loading = true;
        if (this.state?.type === EOTPType.SMS) {
            this.mfaService
                .registrationOtp({ ...this.state, ...this.mfaOtpVerification })
                .subscribe(
                    (res: any) => {
                        this.notificationService.sendSuccess(res?.message);
                        this.correlation = res?.data?.correlation;
                        this.loading = false;
                        this.mfaService.toggleMFA('true').subscribe(
                            () => {},
                            () =>
                                this.notificationService.sendError(
                                    'Error occured while enabling MFA!'
                                )
                        );
                        this.router.navigate(['/mfa-methods']);
                    },
                    (error: any) => {
                        const message =
                            error?.error?.message || 'Something Went Wrong !';
                        this.loading = false;
                        this.notificationService.sendError(message);
                    }
                );
        } else {
            this.mfaService.verifyOtp(this.mfaOtpVerification).subscribe(
                (res: any) => {
                    this.notificationService.sendSuccess(res?.message);
                    this.loading = false;
                    if (this.state?.isShowFullSSN) {
                        this.router.navigate(['/manage-account'], {
                            state: { isShowFullSSNVerified: true },
                        });
                    } else {
                        this.router.navigate(['/mfa-methods'], {
                            state: { register: true },
                        });
                    }
                },
                (error: any) => {
                    const message =
                        error?.error?.message || 'Something Went Wrong !';
                    this.loading = false;
                    this.notificationService.sendError(message);
                }
            );
        }
    }

    onResendOtp() {
        this.loading = true;
        this.error = '';
        if (this.state.type === EOTPType.SMS) {
            this.mfaService.smsOtp({ ...this.state }).subscribe(res => {
                this.correlation = res.correlation;
                this.mfaOtpVerification.id = res.id;
                if (!this.mfaOtpVerification?.verificationId) {
                    this.mfaOtpVerification.verificationId = this.state.verificationId;
                }
                this.loading = false;
                this.initCountDown(res.expiry);
                this.notificationService.sendSuccess('OTP sent to your phone!');
            });
        } else {
            this.mfaService.mailOtp().subscribe(res => {
                this.correlation = res.correlation;
                this.mfaOtpVerification.id = res.id;
                this.loading = false;
                this.initCountDown(res.expiry);
                this.notificationService.sendSuccess(this.mailMsgConfig.text);
            });
        }
    }

    initCountDown(expiry) {
        const timeLeft = this.mfaService.getCountDown(expiry).timeleft;
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
            const countDown = this.mfaService.getCountDown(expiry);
            this.countDownTime = countDown.countDownValue;
        }, 1000);

        setTimeout(() => {
            clearInterval(this.interval);
            this.error = 'Your OTP has expired!';
        }, timeLeft);
    }

    loadLabels() {
        if (this.configService.config?.['mfaOtp']) {
            this.otpConfig = this.configService.config?.['mfaOtp'];
            if (this.otpConfig?.mailMessage) {
                this.mailMsgConfig = this.otpConfig?.mailMessage;
            }
            if (this.otpConfig?.button) {
                this.buttonConfig = this.otpConfig?.button;
            }
        }
    }
}
