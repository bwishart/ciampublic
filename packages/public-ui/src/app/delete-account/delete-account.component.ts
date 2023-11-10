import { Component } from '@angular/core';
import environment from 'src/environments/environment';
import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-delete-account',
    templateUrl: './delete-account.component.html',
    styleUrls: ['./delete-account.component.scss'],
})
export class DeleteAccountComponent {
    deleteAccountSuccessConfig: any;

    logoutUrl: string = `${environment.baseUrl}/logout`;

    successText: any = {
        text: 'Your account has been deleted successfully',
    };

    constructor(public configService: ConfigService) {}

    ngOnInit(): void {
        this.loadLabels();
    }

    loadLabels() {
        if (this.configService.config?.['deleteAccountSuccess']) {
            this.deleteAccountSuccessConfig = this.configService.config?.[
                'deleteAccountSuccess'
            ];
            if (this.deleteAccountSuccessConfig?.successText) {
                this.successText = this.deleteAccountSuccessConfig?.successText;
            }
        }
    }
}
