import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../common/Notification/notificationService';
import { UserDetail, USER_URN } from '../models/user-detail.model';
import { AuthService } from '../services/auth.service';
import { DEFAULT_ERROR, ATTRIBUTE } from '../util/constant';
import { ConfigService } from '../services/config.service';
import { CommonService } from '../services/common.service';

@Component({
    selector: 'app-redirect',
    template: '',
})
export class RedirectComponent implements OnInit {
    constructor(
        private router: Router,
        private service: AuthService,
        private configService: ConfigService,
        private notificationService: NotificationService,
        private commonService: CommonService
    ) {}

    ngOnInit(): void {
        const redirectPath = sessionStorage.getItem('titleURL');
        this.getUserDetails(redirectPath);
    }

    getUserDetails(redirectPath) {
      const userData: UserDetail= this.commonService.userData
                const isPaymentNotDone = this.commonService.getCustomAttribute(
                    userData?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.TRANSACTIONID
                );
                const lastEmpName = this.commonService.getCustomAttribute(
                    userData?.[USER_URN]?.customAttributes,
                    ATTRIBUTE.LASTEMPLOYERNAME
                );
                if (
                    (redirectPath === '/driving-license-renewal' &&
                        (isPaymentNotDone === 'true' || !isPaymentNotDone)) ||
                    (redirectPath === '/unemployment-registration' &&
                        !lastEmpName)
                ) {
                    this.router.navigate([redirectPath]);
                } else {
                    this.router.navigate(['/dashboard']);
                }
    }
}
