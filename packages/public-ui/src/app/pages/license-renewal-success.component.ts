import { Component } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-license-renewal-success',
    template: `
        <div class="overlay">
            <div class="modal">
                <div class="modal-content">
                    <p [innerHtml]="message.text"></p>
                </div>
            </div>
        </div>
    `,
})
export class LicenseRenewalSuccessComponent {
    licenseRenewalSuccessConfig: any;

    public message: any = {
        text:
            'You have 1 item in your shopping cart. Please  <a href="/dashboard">click home page</a> to return to your home page and check out or, <a href="/checkout">click check out now</a> to finish the transaction.',
    };

    constructor(public configService: ConfigService) {}

    ngOnInit(): void {
        this.loadLabels();
    }

    loadLabels() {
        if (this.configService.config?.['licenseRenewalSuccess']) {
            this.licenseRenewalSuccessConfig = this.configService.config?.[
                'licenseRenewalSuccess'
            ];
            if (this.licenseRenewalSuccessConfig?.message) {
                this.message = this.licenseRenewalSuccessConfig?.message;
            }
        }
    }
}
