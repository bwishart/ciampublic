import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import environment from 'src/environments/environment';
import { ConfigService, ITenantConfig } from './config.service';
import { NotificationService } from '../common/Notification/notificationService';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    baseUrl = environment.baseUrl;

    constructor(
        private readonly http: HttpClient,
        private readonly notificationService: NotificationService,
        private configService: ConfigService
    ) {}

    saveAdminSetup(payload: ITenantConfig) {
        return this.http
            .put<any>(`${this.baseUrl}/configure-tenant`, payload)
            .subscribe(
                res => {
                    this.configService.tenantConfig = res.data;
                    location.reload();
                    this.notificationService.sendSuccess(res.message);
                },
                err => {
                    this.notificationService.sendError(err?.error?.message);
                }
            );
    }

    getAdminRouteFlag() {
        return this.http.get<any>(`${this.baseUrl}/admin-flag`);
    }
}
