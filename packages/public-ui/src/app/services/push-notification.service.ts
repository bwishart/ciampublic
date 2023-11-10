import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import environment from 'src/environments/environment';
import { Observable } from 'rxjs';
import { UserNotificationDetails } from '../models/push-notification.model';

@Injectable({
    providedIn: 'root',
})
export class PushNotificationService {
    constructor(
        private readonly configService: ConfigService,
        private http: HttpClient
    ) {}

    tenantUrl = this.configService?.tenantConfig?.AUTH_SERVER_BASE_URL;

    backendUrl = environment.baseUrl;

    public deviceRegistered: EventEmitter<any> = new EventEmitter();

    getSignaturesByOwner(payload: { userId: string }): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/notification/initiate`,
            payload
        );
    }

    sendPushNotification(payload: UserNotificationDetails): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/notification/push`,
            payload
        );
    }

    verifyPushNotification(payload: UserNotificationDetails): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/notification/verify`,
            payload
        );
    }

    getQRCode(payload: any): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/notification/enroll`,
            payload
        );
    }

    isQrCodeScanned(test_userid: string): Observable<any> {
        return this.http.get<any>(
            `${this.backendUrl}/v1.0/authnmethods/signatures?_embedded=true&search=owner%20%3D%20%22${test_userid}%22`
        );
    }

    deleteQrCodeRegistration(qrCodeId: string): Observable<any> {
        return this.http.delete<any>(
            `${this.backendUrl}/v1.0/authenticators/?qrCodeId=${qrCodeId}`
        );
    }
}
