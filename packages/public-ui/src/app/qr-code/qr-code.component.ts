import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    Renderer2,
    HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import environment from 'src/environments/environment';
import { NotificationService } from '../common/Notification/notificationService';
import { QRcodeDetails } from '../models/push-notification.model';
import { AuthService } from '../services/auth.service';
import { ConfigService, EStyles } from '../services/config.service';
import { PushNotificationService } from '../services/push-notification.service';
import { DEFAULT_ERROR, PUSH_NOTIFICATION_BLOCKTIME } from '../util/constant';

@Component({
    selector: 'app-qr-code',
    templateUrl: './qr-code.component.html',
    styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent implements OnInit, OnDestroy {
    @ViewChild('qrCode') qrCode: ElementRef;

    QRdata: QRcodeDetails = {
        code: '',
        accountName: '',
        registrationUri: '',
        version: {
            number: '',
            platform: '',
        },
    };

    loading: boolean = true;
    userID: string = '';
    userName: string = '';
    qrInfo: string = '';

    inlineStyles: EStyles;

    imgPath = `${environment.baseUrl}/assets/images/app-store.png`;

    message: string = 'Identity proofing';

    config: any;

    private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

    public width: number;

    userData: any;

    public getScreenWidth: any;

    public getScreenHeight: any;

    constructor(
        public router: Router,
        private notificationService: NotificationService,
        private pushNotificatioService: PushNotificationService,
        public configService: ConfigService,
        private readonly authService: AuthService,
        private renderer: Renderer2
    ) {}

    ngAfterViewInit() {
        this.getScreenWidth = window.innerWidth;
        this.getScreenHeight = window.innerHeight;
        if (this.getScreenHeight >= 488 && this.getScreenHeight < 580) {
            this.width = 135;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-5px'
            );
        } else if (this.getScreenHeight >= 500 && this.getScreenHeight < 580) {
            this.width = 170;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-5px'
            );
        } else if (this.getScreenHeight >= 580 && this.getScreenHeight < 700) {
            this.width = 180;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-5px'
            );
        } else if (
            (this.getScreenHeight >= 700 && this.getScreenHeight <= 781) ||
            this.getScreenWidth < 1344
        ) {
            this.width = 200;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-1px'
            );
        } else if (
            (this.getScreenHeight > 781 && this.getScreenHeight < 874) ||
            (this.getScreenWidth >= 1344 && this.getScreenWidth <= 1527)
        ) {
            this.width = 250;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-12px'
            );
        } else if (this.getScreenHeight >= 874) {
            this.width = 300;
            if (this.getScreenWidth > 1527 && this.getScreenWidth < 2200) {
                this.width = 300;
                this.renderer.setStyle(
                    this.qrCode.nativeElement,
                    'margin-top',
                    '-5px'
                );
            } else {
                this.width = 400;
                this.renderer.setStyle(
                    this.qrCode.nativeElement,
                    'margin-top',
                    '-12px'
                );
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (event.target.innerHeight >= 488 && event.target.innerHeight < 500) {
            this.width = 135;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-5px'
            );
        } else if (
            event.target.innerHeight >= 500 &&
            event.target.innerHeight < 580
        ) {
            this.width = 170;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-5px'
            );
        } else if (
            event.target.innerHeight >= 580 &&
            event.target.innerHeight < 700
        ) {
            this.width = 180;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-5px'
            );
        } else if (
            (event.target.innerHeight >= 700 &&
                event.target.innerHeight <= 781) ||
            event.target.innerWidth < 1344
        ) {
            this.width = 200;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-1px'
            );
        } else if (
            (event.target.innerHeight > 781 &&
                event.target.innerHeight < 874) ||
            (event.target.innerWidth >= 1344 && event.target.innerWidth <= 1527)
        ) {
            this.width = 250;
            this.renderer.setStyle(
                this.qrCode.nativeElement,
                'margin-top',
                '-12px'
            );
        } else if (event.target.innerHeight >= 874) {
            this.width = 300;
            if (
                event.target.innerWidth > 1527 &&
                event.target.innerWidth < 2200
            ) {
                this.width = 300;
                this.renderer.setStyle(
                    this.qrCode.nativeElement,
                    'margin-top',
                    '-5px'
                );
            } else {
                this.width = 400;
                this.renderer.setStyle(
                    this.qrCode.nativeElement,
                    'margin-top',
                    '-12px'
                );
            }
        }
    }

    ngOnInit(): void {
        this.width = 300;
        this.userData = this.authService.getUserLocalData();
        this.userName = this.userData.data?.profile?.emails[0]?.value;
        this.userID = this.userData.data?.profile?.id;
        this.listQRData();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    listQRData(): void {
        this.pushNotificatioService
            .getQRCode({
                owner: this.userID,
                accountName: this.userName,
            })
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    delete res.qrcode;
                    this.QRdata = {
                        ...res,
                    };
                    this.qrInfo = JSON.stringify(this.QRdata);
                    this.loading = false;
                    this.isQrCodeScanned();
                },
                error: (err: any) => {
                    this.loading = false;
                    this.notificationService.sendError(
                        err?.error?.message || DEFAULT_ERROR
                    );
                    this.redirectToSignUpSuccess();
                },
            });
    }

    isQrCodeScanned(): void {
        this.pushNotificatioService
            .isQrCodeScanned(this.userID)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (
                        res?.signatures[0]?.enabled &&
                        res?.signatures[0]?.validated
                    ) {
                        this.getSignupContent();
                    } else {
                        this.notificationPolling();
                    }
                },
                error: err => {
                    const message = err?.error?.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                },
            });
    }

    private notificationPolling() {
        setTimeout(() => {
            this.isQrCodeScanned();
        }, PUSH_NOTIFICATION_BLOCKTIME * 1000);
    }

    getSignupContent() {
        this.config = this.configService.config['identityProofing'];

        if (this.config?.changeLayout) {
            this.redirectToSignUpSuccess();
        }

        if (this.config) {
            this.message = this.config.text || this.message;
            this.inlineStyles = this.configService.getInlineStyles(this.config);
        }
        if (!this.config?.changeLayout) {
            this.redirectToSignUpSuccess();
        }
    }

    redirectToSignUpSuccess() {
        if (this.userData?.data?.profile) {
            this.pushNotificatioService.deviceRegistered.emit(true);
            this.notificationService.sendSuccess(
                'Device registered successfully'
            );
            this.router.navigate(['/manage-account']);
        }
    }
}
