import { Component } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-registered-success',
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
export class RegisteredSuccessComponent {
    unEmpRegSuccessConfig: any;

    public message: any = {
        text:
            '<h4>Congratulations</h4> you have successfully registered for unemployment! Please <a href="/dashboard">click here</a> to return to the home screen',
    };

    constructor(public configService: ConfigService) {}

    ngOnInit(): void {
        this.loadLabels();
    }

    loadLabels() {
        if (this.configService.config?.['unEmploymentRegSuccess']) {
            this.unEmpRegSuccessConfig = this.configService.config?.[
                'unEmploymentRegSuccess'
            ];
            if (this.unEmpRegSuccessConfig?.message) {
                this.message = this.unEmpRegSuccessConfig?.message;
            }
        }
    }
}
