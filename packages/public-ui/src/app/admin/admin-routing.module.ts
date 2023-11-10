import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '../guards/admin.guard';
import { ColorPaletteComponent } from './configure/color-palette/color-palette.component';
import { ConfigureComponent } from './configure/configure.component';
import { CustomizeComponent } from './configure/customize/customize.component';
import { ISVTemplateComponent } from './configure/isv-templates/isv-templates.component';
import { LayoutComponent } from './configure/layout/layout.component';
import { DashboardUiComponent } from './dashboard-ui/dashboard-ui.component';
import { RunSetupComponent } from './setup/run-setup/run-setup.component';
import { SetupInstructionsComponent } from './setup/setup-instructions/setup-instructions.component';
import { SetupComponent } from './setup/setup.component';
import { TenantConfigurationComponent } from './setup/tenant-configuration/tenant-configuration.component';
import { UserIdentitiesComponent } from './setup/user-identities/user-identities.component';

const routes: Routes = [
    {
        path: '',
        canActivate: [AdminGuard],
        component: DashboardUiComponent,
        children: [
            {
                path: 'setup',
                canActivate: [AdminGuard],
                component: SetupComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'tenant-config',
                    },
                    {
                        path: 'tenant-config',
                        canActivate: [AdminGuard],
                        component: TenantConfigurationComponent,
                        pathMatch: 'full',
                    },
                    {
                        path: 'run-setup',
                        canActivate: [AdminGuard],
                        component: RunSetupComponent,
                    },
                    {
                        path: 'setup-instructions',
                        canActivate: [AdminGuard],
                        component: SetupInstructionsComponent,
                    },
                    {
                        path: 'user-identities',
                        canActivate: [AdminGuard],
                        component: UserIdentitiesComponent,
                    },
                ],
            },
            {
                path: 'configure',
                canActivate: [AdminGuard],
                component: ConfigureComponent,
                children: [
                    {
                        path: '',
                        canActivate: [AdminGuard],
                        component: LayoutComponent,
                        pathMatch: 'full',
                    },
                    {
                        path: 'customize',
                        canActivate: [AdminGuard],
                        component: CustomizeComponent,
                    },
                    {
                        path: 'color-palette',
                        canActivate: [AdminGuard],
                        component: ColorPaletteComponent,
                    },
                    {
                        path: 'isv-templates',
                        canActivate: [AdminGuard],
                        component: ISVTemplateComponent,
                        children: [
                            {
                                path: ':path',
                                canActivate: [AdminGuard],
                                component: ISVTemplateComponent,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
