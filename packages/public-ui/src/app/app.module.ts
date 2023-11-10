import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { SignupComponent } from './signup/signup.component';
import { DialogComponent } from './common/dialog/dialog.component';
import { MaterialModule } from './material/material.module';
import { AdminModule } from './admin/admin.module';

import { LoadingSpinnerComponent } from './common/loading-spinner/loading-spinner.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { AccessTokenInterceptor } from './services/token.interceptor.service';
import { MaskDirective } from './custom-directive/mask.directive';
import { NotificationComponent } from './common/Notification/notification.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import {
    configProviderFactory,
    ConfigService,
} from './services/config.service';
import { SuccessRedirectComponent } from './pages/success-redirect/success-redirect.component';
import { IdentityProofingComponent } from './common/identity-proofing/identity-proofing.component';
import { DrivingLicenseComponent } from './driving-license/driving-license.component';
import { UnemploymentRegistrationComponent } from './unemployment-registration/unemployment-registration.component';
import { RegisteredSuccessComponent } from './pages/registered-success.component';
import { MfaOtpComponent } from './mfa/mfa-otp/mfa-otp.component';
import { MfaOptionsComponent } from './mfa/mfa-options/mfa-options.component';
import { MfaConsentComponent } from './mfa/mfa-consent/mfa-consent.component';
import { RedirectComponent } from './redirect/redirect.component';
import { ConfirmationComponent } from './Item/confirmation/confirmation.component';
import { CheckoutPageComponent } from './Item/checkout-page/checkout-page.component';
import { CardConsentComponent } from './Item/card-consent/card-consent.component';
import { LicenseRenewalSuccessComponent } from './pages/license-renewal-success.component';
import { ConfirmationSuccessComponent } from './pages/success-confirmation.component';
import { HomeComponent } from './home/home.component';
import { ManageConsentsComponent } from './manage-consents/manage-consents.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { QRCodeModule } from 'angular2-qrcode';
import { PushNotificationPopupComponent } from './pages/push-notification-popup/push-notification-popup.component';

@NgModule({
    declarations: [
        AppComponent,
        NotificationComponent,
        HeaderComponent,
        SignupComponent,
        DialogComponent,
        LoadingSpinnerComponent,
        DashboardComponent,
        ManageAccountComponent,
        MaskDirective,
        DeleteAccountComponent,
        UnemploymentRegistrationComponent,
        SuccessRedirectComponent,
        IdentityProofingComponent,
        RegisteredSuccessComponent,
        MfaOtpComponent,
        MfaOptionsComponent,
        MfaConsentComponent,
        DrivingLicenseComponent,
        RedirectComponent,
        CheckoutPageComponent,
        ConfirmationComponent,
        CardConsentComponent,
        LicenseRenewalSuccessComponent,
        ConfirmationSuccessComponent,
        HomeComponent,
        ManageConsentsComponent,
        QrCodeComponent,
        PushNotificationPopupComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MaterialModule,
        AdminModule,
        HttpClientModule,
        QRCodeModule,
    ],
    providers: [
        Title,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AccessTokenInterceptor,
            multi: true,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: configProviderFactory,
            deps: [ConfigService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
