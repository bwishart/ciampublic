import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
// import environment from 'src/environments/environment';

@Component({
    selector: 'app-success-redirect',
    templateUrl: './success-redirect.component.html',
    // styleUrls: ['./success-redirect.component.scss'],
})
export class SuccessRedirectComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        public configService: ConfigService
    ) {}

    showBtn = this.route.snapshot.paramMap.get('showBtn');

    header = this.route.snapshot.paramMap.get('header');

    subHeader = this.route.snapshot.paramMap.get('subHeader');

    content = this.route.snapshot.paramMap.get('content');

    btnText = this.route.snapshot.paramMap.get('btnText');

    btnUrl = this.route.snapshot.paramMap.get('btnUrl');

    signupSuccessConfig: any = {};

    contentConfig: any = {
        text:
            'Please check your email for a welcome message and a link to reset your password',
    };

    ngOnInit(): void {
        this.loadLabels();
    }

    loadLabels() {
        if (this.configService.config?.['signupSuccessPopup']) {
            this.signupSuccessConfig = this.configService.config?.[
                'signupSuccessPopup'
            ];
            if (this.signupSuccessConfig?.content) {
                this.content = this.signupSuccessConfig?.content?.text;
                this.contentConfig = this.signupSuccessConfig?.content;
            }
        }
    }
}
