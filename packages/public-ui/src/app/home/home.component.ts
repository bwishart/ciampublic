import { Component } from '@angular/core';
import { Router } from '@angular/router';
import environment from 'src/environments/environment';
import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    constructor(
        private readonly router: Router,
        public configService: ConfigService
    ) {}

    loginUrl = environment.loginUrl;

    homeConfig: any;

    accountExists: any = {
        text: 'Already have an account?',
    };

    accountNotExists: any = {
        text: `Don’t have an account?`,
    };

    registerBtn: any = {
        text: 'Click here to register and set up a new account',
    };

    ngOnInit(): void {
        this.loadLabels();
    }

    loadLabels() {
        if (this.configService.config?.['redirectionPage']) {
            this.homeConfig = this.configService.config?.['redirectionPage'];

            if (this.homeConfig?.accountExists) {
                this.accountExists = this.homeConfig?.accountExists;
            }
            if (this.homeConfig?.accountNotExists) {
                this.accountNotExists = this.homeConfig?.accountNotExists;
            }
            if (this.homeConfig?.registerBtn) {
                this.registerBtn = this.homeConfig?.registerBtn;
            }
        }
    }

    callLogin(): any {
        location.href = this.loginUrl;
    }

    callSignUp(): any {
        this.router.navigate(['/signup']);
    }
}
