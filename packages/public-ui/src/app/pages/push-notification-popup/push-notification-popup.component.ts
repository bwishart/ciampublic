import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { LogoAndTitle } from 'src/app/models/header.model';
import { UserNotificationDetails } from 'src/app/models/push-notification.model';
import { ButtonInterface } from 'src/app/models/signup-component.model';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { ECONSENTSTYLE } from 'src/app/services/consent.service';
import { MfaService } from 'src/app/services/mfa.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import {
    DEFAULT_ERROR,
    PUSH_NOTIFICATION_BLOCKTIME,
    PUSH_NOTIFICATION_MAX_POLLTIME,
} from 'src/app/util/constant';
import environment from 'src/environments/environment';
@Component({
    selector: 'app-push-notification-popup',
    templateUrl: './push-notification-popup.component.html',
    styleUrls: ['./push-notification-popup.component.scss'],
})
export class PushNotificationPopupComponent implements OnInit, OnDestroy {
    buttonType: ButtonInterface = {
        type: 'submit',
        name: 'Resend notification',
    };

    hide: number = ECONSENTSTYLE.HIDE;

    transparent: number = ECONSENTSTYLE.TRANSPARENT;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter();

    @Input() userSignatureData: UserNotificationDetails;

    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private configService: ConfigService,
        private notificationService: NotificationService,
        private pushNotificatioService: PushNotificationService,
        private authService: AuthService,
        private mfaService: MfaService
    ) {}

    logoAndTitle: LogoAndTitle = {
        logoImgPath: `${environment.baseUrl}/assets/images/logo.png`,
        titleText: this.configService.config?.product?.text,
    };

    userNotificationDetails: UserNotificationDetails = {
        authId: '',
        signatureId: '',
        pushId: '',
        status: '',
    };

    countRequest: number = 0;
    blockTime: number = PUSH_NOTIFICATION_BLOCKTIME;
    maxPollTime: number = PUSH_NOTIFICATION_MAX_POLLTIME;
    userData: any;
    isButton: boolean = true;
    countDownTime: string;
    interval: any;
    error: string = '';
    isTimerBtn: boolean = false;
    isSendingNotification: boolean = true;

    ngOnInit(): void {
        this.pushNotificationFLow();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private pushNotificationFLow() {
        this.userData = this.authService.getUserLocalData();
        this.userNotificationDetails = { ...this.userSignatureData };
        this.pushNotificatioService
            .sendPushNotification(this.userNotificationDetails)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: response => {
                    this.userNotificationDetails.pushId = response.pushId;
                    this.userNotificationDetails.expiryTime =
                        response.expiryTime;
                    this.initCountDown(this.userNotificationDetails.expiryTime);
                    this.pushNotificatioService
                        .verifyPushNotification({
                            authId: this.userNotificationDetails.authId,
                            pushId: this.userNotificationDetails.pushId,
                        })
                        .pipe(takeUntil(this.ngUnsubscribe))
                        .subscribe({
                            next: resp => {
                                this.userNotificationDetails.status =
                                    resp.status;
                                this.isSendingNotification = false;
                                this.notificationPolling();
                            },
                            error: err => {
                                const message =
                                    err?.error?.message || DEFAULT_ERROR;
                                this.notificationService.sendError(message);
                            },
                        });
                },
                error: err => {
                    const message = err?.error?.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                },
            });
    }

    private notificationPolling() {
        if (this.userNotificationDetails.status === 'PENDING') {
            if (this.maxPollTime <= this.countRequest) {
                this.isButton = false;
                this.isTimerBtn = false;
                return;
            }
            this.countRequest += this.blockTime;
            setTimeout(() => {
                this.verifyNotification();
            }, this.blockTime * 1000);
        } else if (this.userNotificationDetails.status === 'TIMEOUT') {
            this.isButton = false;
            this.isTimerBtn = false;
            return;
        } else if (this.userNotificationDetails.status === 'VERIFY_SUCCESS') {
            this.closePopup(true, this.userNotificationDetails.key);
            return;
        } else {
            this.notificationService.sendError('User denied the request');
            this.closePopup(false);
            return;
        }
    }

    public resendNotification() {
        this.pushNotificatioService
            .sendPushNotification(this.userNotificationDetails)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.userNotificationDetails.pushId = res.pushId;
                    this.isButton = true;
                    this.isTimerBtn = true;
                    this.countRequest = 0;
                    this.initCountDown(res.expiryTime);
                    this.verifyNotification();
                },
                error: err => {
                    const message = err?.error?.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                },
            });
    }

    private verifyNotification() {
        this.pushNotificatioService
            .verifyPushNotification({
                authId: this.userNotificationDetails.authId,
                pushId: this.userNotificationDetails.pushId,
            })
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.userNotificationDetails.status = res.status;
                    this.notificationPolling();
                },
                error: err => {
                    const message = err?.error?.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                },
            });
    }

    initCountDown(expiry) {
        const timeLeft = this.mfaService.getCountDown(expiry).timeleft;
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = setInterval(() => {
            const countDown = this.mfaService.getCountDown(expiry);
            this.countDownTime = countDown.countDownValue;
            this.isButton = this.countDownTime !== '0:0';
            this.isTimerBtn = this.countDownTime !== '0:0';
        }, 1000);

        setTimeout(() => {
            clearInterval(this.interval);
            this.error = 'Your authentication has expired!';
            this.isTimerBtn = false;
        }, timeLeft);
    }

    public closePopup(saveData: boolean, key?: string) {
        this.ngOnDestroy();
        this.closeDialog.emit({ saveData, key });
    }
}
