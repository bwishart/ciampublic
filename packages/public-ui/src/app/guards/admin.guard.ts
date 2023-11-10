import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { NotificationService } from '../common/Notification/notificationService';
import { AdminService } from '../services/admin.service';

@Injectable({
    providedIn: 'root',
})
export class AdminGuard implements CanActivate {
    constructor(
        private readonly router: Router,
        private notification: NotificationService,
        private AdminService: AdminService
    ) {}
    canActivate(): Observable<boolean> | boolean {
        return this.AdminService.getAdminRouteFlag().pipe(
            map(res => {
                if (res) return true;
                this.router.navigate(['/dashboard']);
                return false;
            }),
            catchError(err => {
                console.log(err);
                return of(false);
            })
        );
    }
}
