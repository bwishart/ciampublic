import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService, EStyles } from 'src/app/services/config.service';
import environment from 'src/environments/environment';

interface IIdentityProofingConfig {
    text: string;
    changeLayout: boolean;
    timeOutValue: number;
}
@Component({
    selector: 'app-identity-proofing',
    templateUrl: './identity-proofing.component.html',
    styleUrls: ['./identity-proofing.component.scss'],
})
export class IdentityProofingComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        public router: Router,
        public configService: ConfigService
    ) {}

    data: any = '';

    name: string = '';

    message: string = 'Identity proofing...';

    successHeader: string = 'Congratulations';

    successSubHeader: string = 'Your account is ready';

    successContent: string =
        'Please check your email for a welcome message and a link to reset your password';

    successBtnText: string = 'Access account';

    successBtnUrl: string = environment.loginUrl;

    inlineStyles: EStyles;

    config: any;

    ngOnInit(): void {
        this.config = this.configService.config['identityProofing'];
        if (this.config?.changeLayout) {
            this.redirectToSignUpSuccess();
        }
        this.name = this.route.snapshot.params['name'];
        this.data = history.state;
        let timeOutValue: number = 50000;
        if (this.config) {
            timeOutValue = this.config.timeOutValue || timeOutValue;
            this.message = this.config.text || this.message;
            this.inlineStyles = this.configService.getInlineStyles(this.config);
        }
        if (!this.config?.changeLayout) {
            setTimeout(() => {
                this.redirectToSignUpSuccess();
            }, timeOutValue);
        }
    }

    redirectToSignUpSuccess() {
        this.router.navigate(
            [
                '/success-message/signup',
                {
                    header: this.successHeader,
                    subHeader: this.successSubHeader,
                    content: this.config.successContent || this.successContent,
                    btnText: this.successBtnText,
                    btnUrl: this.successBtnUrl,
                    showBtn: true,
                },
            ],
            {
                state: this.data,
            }
        );
    }
}
