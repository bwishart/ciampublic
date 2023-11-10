import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import environment from 'src/environments/environment';
import { USER_URN } from '../models/user-detail.model';
import { AuthService } from '../services/auth.service';
import { CommonService } from '../services/common.service';
import { ConfigService } from '../services/config.service';
import { ATTRIBUTE, TITLEURL } from '../util/constant';

export interface HeaderContentProp {
    text: string;
    url?: string;
    disabled?: boolean;
    completedText?: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    userToken: any;

    heading: String = 'Convenience and comfort in digital world';

    content: String = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore`;

    imagePath: String = `${environment.baseUrl}/assets/images/hero.png`;

    dashboardConfig: any;

    loading: boolean;

    buttonTitles: any[] = [
        {
            key: 'tile1',
            text: 'Register For Unemployment',
            url: '/unemployment-registration',
            disabled: false,
            completedText: 'Registered',
        },
        {
            key: 'tile2',
            text: 'Renew Driver’s License',
            url: '/driving-license-renewal',
            disabled: false,
            completedText: 'Renewed',
        },
        {
            key: 'tile3',
        },
        {
            key: 'tile4',
        },
        {
            key: 'tile5',
        },
        {
            key: 'tile6',
        },
        {
            key: 'tile7',
        },
        {
            key: 'tile8',
        },
    ];

    loginUrl = environment.loginUrl;

    showTilesAsLinks: boolean = false;

    constructor(
        private service: AuthService,
        private configService: ConfigService,
        private router: Router,
        private readonly commonService:CommonService
    ) {}

    ngOnInit(): void {
        this.loading = true;
        this.userToken = this.service.getUserLocalData()?.data?.profile;
        if (this.userToken) {
          const data = this.commonService.userData
                data?.[USER_URN]?.customAttributes?.forEach((attr: any) => {
                    if (
                        attr.name === ATTRIBUTE.LASTEMPLOYERNAME &&
                        attr.values
                    ) {
                        this.buttonTitles.find(
                            title => title.key === 'tile1'
                        ).disabled = true;
                    }
                    if (
                        attr.name === ATTRIBUTE.TRANSACTIONID &&
                        attr.values[0] === 'false'
                    ) {
                        this.buttonTitles.find(
                            title => title.key === 'tile2'
                        ).disabled = true;
                    }
                });
                this.loading = false;
        } else {
            this.loading = false;
        }

        this.loadLabels();
    }

    loadLabels() {
        this.dashboardConfig = this.configService.config?.['dashboard'];
        const dashboardTiles = this.configService.config?.['dashboardTiles'];
        if (dashboardTiles) {
            this.showTilesAsLinks = dashboardTiles.changeLayout;
        }

        this.buttonTitles = this.configService.getFormattedConfig(
            this.buttonTitles,
            this.configService.config,
            'dashboardTiles',
            'tiles',
            dashboardTiles
        );
    }

    navigate(title): any {
        if (!this.userToken) {
            this.router.navigate(['/home']);
            sessionStorage.setItem(TITLEURL, title.url);
        } else {
            this.router.navigate([title.url]);
            sessionStorage.removeItem(TITLEURL);
        }
    }
}
