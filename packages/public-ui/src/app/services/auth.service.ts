import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import environment from 'src/environments/environment';
import { Router } from '@angular/router';
import { SignupRequestPayload } from '../models/signup-component.model';
import { TITLEURL, USERDATA } from '../util/constant';
import { UserLocalData } from '../models/user-detail.model';

interface IAuthData {
    apiAccessToken: string;
}
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly baseUrl = environment.baseUrl;

    public authData: IAuthData;

    public authSubject: Subject<IAuthData> = new Subject<IAuthData>();

    public displayName = new EventEmitter();

    constructor(private http: HttpClient, private router: Router) {}

    getUserLocalData(): any {
        const user = JSON.parse(sessionStorage.getItem(USERDATA));
        return user;
    }

    signup(payload: SignupRequestPayload): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/signUp`, payload);
    }

    logout() {
        sessionStorage.removeItem(USERDATA);
        sessionStorage.removeItem(TITLEURL);
        location.href = `${this.baseUrl}/logout`; // TODO add theme id
    }

    updateUserDetails(payload: any, tenantUrl: string): Observable<any> {
        const id = this.getUserLocalData()?.data?.profile?.id;
        return this.http.patch<any>(
            `${this.baseUrl}/v2.0/userInfo/${id}`,
            payload
        );
    }

    fetchAPIAccessToken() {
        return fetch(environment.redirectUrl).then(response => response.json());
    }

    deleteAccount() {
        const userData: any = this.getUserLocalData();
        const userFilteredData: UserLocalData = {
            userId: userData?.data?.profile?.id,
            issuerUrl: userData?.data?.issuer,
        };

        return this.http.delete(
            `${this.baseUrl}/v2.0/userInfo/${userFilteredData.userId}`
        );
    }

    refreshToken() {
        return this.http.get(`${environment.redirectUrl}`, {
            withCredentials: true,
        });
    }
}
