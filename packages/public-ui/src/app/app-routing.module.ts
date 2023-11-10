import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentityProofingComponent } from './common/identity-proofing/identity-proofing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { DrivingLicenseComponent } from './driving-license/driving-license.component';
import { AuthGuard } from './guards/auth.guard';
import { ConfirmationComponent } from './Item/confirmation/confirmation.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { RegisteredSuccessComponent } from './pages/registered-success.component';
import { MfaConsentComponent } from './mfa/mfa-consent/mfa-consent.component';
import { MfaOptionsComponent } from './mfa/mfa-options/mfa-options.component';
import { MfaOtpComponent } from './mfa/mfa-otp/mfa-otp.component';

import { SuccessRedirectComponent } from './pages/success-redirect/success-redirect.component';
import { RedirectComponent } from './redirect/redirect.component';
import { SignupComponent } from './signup/signup.component';
import { UnemploymentRegistrationComponent } from './unemployment-registration/unemployment-registration.component';
import { CheckoutPageComponent } from './Item/checkout-page/checkout-page.component';
import { CardConsentComponent } from './Item/card-consent/card-consent.component';
import { LicenseRenewalSuccessComponent } from './pages/license-renewal-success.component';
import { ConfirmationSuccessComponent } from './pages/success-confirmation.component';
import { HomeComponent } from './home/home.component';
import { ManageConsentsComponent } from './manage-consents/manage-consents.component';
import { QrCodeComponent } from './qr-code/qr-code.component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

    { path: 'signup', component: SignupComponent },

    { path: 'identity-proofing', component: IdentityProofingComponent },

    { path: 'success-message/:name', component: SuccessRedirectComponent },

    { path: 'confirmation-success', component: ConfirmationSuccessComponent },

    { path: 'qr-code', component: QrCodeComponent },

    { path: 'mfa-otp', component: MfaOtpComponent },

    { path: 'mfa-methods', component: MfaOptionsComponent },

    { path: 'mfa-consent', component: MfaConsentComponent },

    { path: 'delete-account', component: DeleteAccountComponent },

    { path: 'dashboard', component: DashboardComponent },

    { path: 'signup', component: SignupComponent },

    { path: 'home', component: HomeComponent },

    { path: 'delete-account', component: DeleteAccountComponent },

    { path: 'registered', component: RegisteredSuccessComponent },

    { path: 'redirect', component: RedirectComponent },

    {
        path: 'renewed',
        component: LicenseRenewalSuccessComponent,
    },

    {
        path: 'unemployment-registration',
        canActivate: [AuthGuard],
        component: UnemploymentRegistrationComponent,
    },

    {
        path: 'manage-account',
        canActivate: [AuthGuard],
        component: ManageAccountComponent,
    },

    {
        path: 'driving-license-renewal',
        canActivate: [AuthGuard],
        component: DrivingLicenseComponent,
    },

    {
        path: 'checkout',
        canActivate: [AuthGuard],
        component: CheckoutPageComponent,
    },

    {
        path: 'card-consent',
        canActivate: [AuthGuard],
        component: CardConsentComponent,
    },

    {
        path: 'confirmation',
        canActivate: [AuthGuard],
        component: ConfirmationComponent,
    },

    {
        path: 'manage-consent',
        canActivate: [AuthGuard],
        component: ManageConsentsComponent,
    },

    {
        path: 'admin',
        loadChildren: () =>
            import('./admin/admin.module').then(m => m.AdminModule),
    },

    {
        path: '**',
        redirectTo: '/dashboard',
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
            scrollOffset: [0, 64],
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
