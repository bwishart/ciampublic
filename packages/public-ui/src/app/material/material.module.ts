import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';

const MaterialModules = [
    MatSnackBarModule,
    MatIconModule,
    MatRadioModule,
    MatMenuModule,
    MatBadgeModule,
];
@NgModule({
    imports: [MaterialModules],
    exports: [MaterialModules],
})
export class MaterialModule {}
