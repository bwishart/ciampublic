import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpContextToken,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export const useBaseURL = new HttpContextToken(() => false);
@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        let header = request;
        const headers = {
            withCredentials: true,
            Accept: 'application/scim+json',
        };
        header = request.clone(headers);
        return next.handle(header);
    }
}
