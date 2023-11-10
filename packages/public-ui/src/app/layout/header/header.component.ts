import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
    HeaderBtnProp,
    LogoAndTitle,
    MenuItem,
} from 'src/app/models/header.model';
import { UserLocalData } from 'src/app/models/user-detail.model';
import { ATTRIBUTE, DEFAULT_ERROR, USERDATA } from 'src/app/util/constant';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import environment from 'src/environments/environment';
import { NotificationService } from 'src/app/common/Notification/notificationService';
import { USER_URN } from '../../models/user-detail.model';
import { PushNotificationService } from 'src/app/services/push-notification.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
    constructor(
        public router: Router,
        private readonly service: AuthService,
        public configService: ConfigService,
        private notificationService: NotificationService,
        private pushNotificationService: PushNotificationService,
        private commonService: CommonService
    ) {}

    private readonly unsubscribeSignal: Subject<void> = new Subject<void>();

    userData: UserLocalData = {
        name: 'User',
        userId: '',
        isLoggedIn: false,
    };

    confirmBtnDisabled: boolean = true;

    loading: boolean = false;

    public showDeleteModal: boolean = false;

    profileConfig: any = {};

    public headingConfig: any = {
        text: 'Delete Account',
    };

    public confirmText: any = {
        text:
            'Are you sure you want to delete your account? If yes, please click on CONFIRM below',
    };

    public subHeadingConfig: any = {
        text: `Deleting your account will delete your account and any data related to it, with the exception of historical data related to your consent, and log information for past authentication attempts and any past action to modify your personal data`,
    };

    deleteAccountConfig: any;

    isAdmin: boolean;

    deleteConfirmText: string = 'Account fullname (For confimation)';

    deleteErrMsg: string = 'Full name does not match !';

    isDeleteError: boolean = false;

    fullnameNgModelDelete: string = '';

    optionsBeforeLogin: HeaderBtnProp[] = [
        {
            key: 'login',
            text: 'Login',
            id: 'login',
            click: true,
        },
        {
            key: 'signup',
            text: 'Sign Up',
            id: 'login',
            redirUrl: '/signup',
        },
    ];

    options: HeaderBtnProp[] = [
        {
            key: 'home',
            text: 'Home',
            id: 'home',
            redirUrl: '/',
        },
        {
            key: 'plans',
            text: 'Plans',
            id: 'plans',
            redirUrl: '/first-component',
        },
        {
            key: 'benefits',
            text: 'Benefits',
            id: 'benefits',
            redirUrl: '/first-component',
            cursor: 'text',
        },
        {
            key: 'about',
            text: 'About Us',
            id: 'aboutus',
            redirUrl: '/first-component',
            cursor: 'text',
        },
    ];

    optionsAfterLogin: HeaderBtnProp[] = [
        {
            key: 'accountCircle',
            icon: 'account_circle',
        },
        {
            key: 'shoppingCart',
            icon: 'shopping_cart',
            redirUrl: '/checkout',
        },
    ];

    matMenuItem: MenuItem[] = [
        {
            key: 'changePassword',
            text: 'Change Password',
            id: 'changePass',
            click: true,
        },
        {
            key: 'manageConsent',
            text: 'Manage Consent',
            id: 'mngConsent',
            redirUrl: 'manage-consent',
        },
        {
            key: 'mfa',
            text: 'Strengthen Your Security with MFA',
            id: 'mfa',
            redirUrl: 'mfa-methods',
        },
        {
            key: 'userinfo',
            text: 'Manage Your Personal Information',
            id: 'MYPI',
            redirUrl: 'manage-account',
        },
        {
            key: 'qrCode',
            text: 'Register Mobile Authentication',
            id: 'qrCode',
            redirUrl: 'qr-code',
        },
        {
            key: 'deleteAccount',
            text: 'Delete Account',
            id: 'deleteAcc',
            click: true,
        },
        {
            key: 'logout',
            text: 'Logout',
            idName: 'logout',
            id: 'logout',
            click: true,
        },
    ];

    logoAndTitle: LogoAndTitle = {
        logoImgPath: `${environment.baseUrl}/assets/images/logo.png`,
        titleText: this.configService.config?.product?.text,
        redirUrl: '/',
    };

    loginUrl = environment.loginUrl;

    redirectUrl = environment.redirectUrl;

    cartNotification: string = null;

    baseUrl = this.configService.tenantConfig.AUTH_SERVER_BASE_URL;

    themeId = this.configService.tenantConfig.THEME_ID || 'default';

    ngOnInit(): void {
        if (this.service.getUserLocalData()?.data?.profile) {
            this.userData.isLoggedIn = true;
            this.getDetails();
        }
        this.initConfig();
        this.loadLabels();
        this.pushNotificationService.deviceRegistered.subscribe(
            (flag: boolean) => {
                if (flag) {
                    this.matMenuItem = this.matMenuItem.filter(
                        item => item.id !== 'qrCode'
                    );
                } else if (
                    !this.matMenuItem.find(item => item.id === 'qrCode')
                ) {
                    this.matMenuItem.splice(4, 0, {
                        key: 'qrCode',
                        text: 'Register QR Code',
                        id: 'qrCode',
                        redirUrl: 'qr-code',
                    });
                }
            }
        );
    }

    initConfig() {
        const res: any = this.configService.config;

        const parentStyles = {
            color: res?.nav?.color,
        };
        this.optionsBeforeLogin = this.configService?.getFormattedConfig(
            this.optionsBeforeLogin,
            res,
            'nav',
            'optionsBeforeLogin',
            parentStyles
        );
        this.options = this.configService.getFormattedConfig(
            this.options,
            res,
            'nav',
            'options',
            parentStyles
        );
        this.matMenuItem = this.configService.getFormattedConfig(
            this.matMenuItem,
            res,
            'nav',
            'matMenuItem'
        );

        this.profileConfig = parentStyles;
    }

    loadLabels() {
        if (this.configService.config?.['deleteAccount']) {
            this.deleteAccountConfig = this.configService.config?.[
                'deleteAccount'
            ];

            if (this.deleteAccountConfig?.headline) {
                this.headingConfig = this.deleteAccountConfig?.headline;
            }
            if (this.deleteAccountConfig?.subheading) {
                this.subHeadingConfig = this.deleteAccountConfig?.subheading;
            }
            if (this.deleteAccountConfig?.confirmText) {
                this.confirmText = this.deleteAccountConfig?.confirmText;
            }
        }
    }

    loginRedirect(): any {
        location.href = this.loginUrl;
    }

    deleteAcc() {
        this.showDeleteModal = true;
    }

    logout() {
        this.service.logout();
        this.userData.isLoggedIn = false;
    }

    confirmDialog(): void {
        this.showDeleteModal = false;
        this.loading = true;
        this.service.deleteAccount().subscribe({
            next: () => {
                this.loading = false;
                sessionStorage.removeItem(USERDATA);
                this.router.navigate(['/delete-account']);
            },
            error: (err: any) => {
                this.loading = false;
                this.notificationService.sendError(
                    err?.error?.detail || DEFAULT_ERROR
                );
            },
        });
    }

    changePassword() {
        location.href = `${this.baseUrl}/authsvc/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:changepassword&login_hint=${this.userData.name}&themeId=${this.themeId}`;
    }

    onMatchingFullname(value: any) {
        if (value !== this.userData.name) {
            this.isDeleteError = true;
            this.confirmBtnDisabled = true;
        } else {
            this.confirmBtnDisabled = false;
            this.isDeleteError = false;
        }
    }

    getDetails() {
        const res = this.commonService.userData;
        if (res?.groups?.find(group => group.displayName === 'admin')) {
            this.isAdmin = true;
        }
        this.cartNotification = res?.[USER_URN]?.customAttributes?.find(
            attr => attr.name === ATTRIBUTE.TRANSACTIONID
        )?.values[0];

        this.userData.name = `${res?.name?.givenName} ${res?.name?.familyName}`;
        this.service.displayName.subscribe(name => {
            this.userData.name = `${name.fName} ${name.lName}`;
        });
        this.userData.userId = res?.id;
        this.isQRScanned();
    }

    isQRScanned() {
        this.pushNotificationService
            .isQrCodeScanned(this.userData.userId)
            .pipe(takeUntil(this.unsubscribeSignal))
            .subscribe({
                next: res => {
                    if (res?.signatures[0]?.enabled) {
                        this.matMenuItem = this.matMenuItem.filter(
                            item => item.id !== 'qrCode'
                        );
                    }
                },
                error: err => {
                    const message = err?.error?.message || DEFAULT_ERROR;
                    this.notificationService.sendError(message);
                },
            });
    }
}
