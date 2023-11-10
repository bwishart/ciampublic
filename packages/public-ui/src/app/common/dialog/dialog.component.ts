import { Component, Input } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    @Input() header: string;

    @Input() content: string;

    @Input() subHeader: string;

    @Input() headerStyles: any;

    @Input() subHeaderStyles: any = {};

    @Input() contentStyles: any = {};

    @Input() popupContStyle: any = {};

    @Input() show: boolean = false;

    @Input() isTransparent: boolean = false;

    @Input() isDeleteModal: boolean = false;

    @Input() isRemoveDeviceModal: boolean = false;

    constructor(public configService: ConfigService) {}
}
