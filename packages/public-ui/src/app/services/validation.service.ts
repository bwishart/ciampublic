import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import environment from 'src/environments/environment';
import {
    DrivingLicenseMatching,
    UserIdenityMatching,
} from '../models/user-detail.model';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    constructor(private http: HttpClient) {}

    backendUrl = environment.baseUrl;

    validateUser(payload: UserIdenityMatching): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/validate/identity`,
            payload
        );
    }

    validateLicenseNumber(payLoad: DrivingLicenseMatching): Observable<any> {
        return this.http.post<any>(
            `${this.backendUrl}/validate/license`,
            payLoad
        );
    }
}
