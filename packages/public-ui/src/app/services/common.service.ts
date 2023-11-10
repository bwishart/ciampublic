import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import environment from 'src/environments/environment';
import { NotificationService } from '../common/Notification/notificationService';

@Injectable({
    providedIn: 'root',
})
export class CommonService {
  private readonly baseUrl = environment.baseUrl;

  userCreds: any = {};

  public userData;

  loadedProfileApi: Subject<boolean> = new Subject<boolean>();

  constructor(
      private http: HttpClient,
      private readonly notificationService: NotificationService
  ) {}
    isEmpty(value: any) {
        if (!value) return true;
        if (Array.isArray(value)) return value.length === 0;
        return Object.keys(value)?.length === 0;
    }

    getCustomAttribute(data: any, key: string): string {
        const attr = data?.filter(ele => ele.name === key);
        if (attr?.[0]?.values?.[0] === 'undefined') {
            return '';
        }

        return attr?.[0]?.values?.[0];
    }

    replaceFirstFiveChars = s => 'X'.repeat(Math.min(5, s?.length)) + s?.slice(5);
    getUserData(): void {
      this.http.get<any>(`${this.baseUrl}/v2.0/me`).subscribe({
          next: res => {

              this.userData = res;
              this.userCreds = {
                  email: res?.emails[0]?.value,
                  name: `${res?.name?.givenName} ${res?.name?.familyName}`,
              }
              this.loadedProfileApi.next(false);
          },
          error: err => {
              this.loadedProfileApi.next(false);
              this.notificationService.sendError(err?.error?.message);
          },
      });
  }
}
