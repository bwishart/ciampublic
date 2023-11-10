import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import environment from 'src/environments/environment';
import { CheckoutItem, ConsentDescription } from '../models/item.model';
import { OPERATION, STATE } from '../util/constant';
import { ConfigService } from './config.service';

export enum ECONSENTSTYLE {
    HIDE = 1,
    TRANSPARENT = 2,
    IMPLICIT = 'ASSENT_IMPLICIT',
}

@Injectable({
    providedIn: 'root',
})
export class ConsentService {
    constructor(
        private readonly configService: ConfigService,
        private http: HttpClient
    ) {}

    tenantUrl = this.configService?.tenantConfig?.AUTH_SERVER_BASE_URL;

    backendUrl = environment.baseUrl;

    public checkoutDetail: CheckoutItem;

    public consentDetail: any;

    getConsentDescription(payload: ConsentDescription): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/dpcm/data-subject`,
            payload
        );
    }

    updateConsent(payload: any): Observable<any> {
        return this.http.patch<any>(
            `${this.backendUrl}/dpcm/data-consents`,
            payload
        );
    }

    consentApprovalStatus(payload: any): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/dpcm/data-usage`,
            payload
        );
    }

    addConsentPayload(state, id, consentArray): any {
        const payload = [];

        const filterConsent = consentArray.find(
            option => option.purposeId === id
        );
        if (!filterConsent) {
            return;
        }

        filterConsent.attr.forEach(attr => {
            payload.push({
                op: OPERATION.ADD,
                value: {
                    purposeId: filterConsent.purposeId,
                    state: state ? STATE.ALLOW : STATE.DENY,
                    attributeId: attr,
                    accessTypeId: filterConsent.accessTypeId,
                },
            });
        });
        return payload;
    }

    getAssentImplicit(item, result, consents): any {
        const index = consents.findIndex(
            id => id?.formFieldName === item || id?.purposeId === item
        );
        consents[index] = {
            ...consents[index],
            rule: result?.trace?.rule?.decision,
        };

        return consents;
    }
}
