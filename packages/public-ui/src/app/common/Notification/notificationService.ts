import { EventEmitter, Injectable } from '@angular/core';

export enum ENotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
}
@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    public notify: any = new EventEmitter();

    public err: string = '';

    send(msg) {
        this.notify.emit({ msg });
    }

    sendSuccess(msg) {
        this.notify.emit({ msg, type: ENotificationType.SUCCESS });
    }

    sendError(msg) {
        this.err = msg;
        this.notify.emit({ msg, type: ENotificationType.ERROR });
    }
}
