import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import environment from 'src/environments/environment';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
    public logo = {
        file: null,
        preview: `${environment.baseUrl}/assets/images/logo.png`,
    };

    public hero = {
        file: null,
        preview: `${environment.baseUrl}/assets/images/hero.png`,
    };

    public layoutConfigurableKeys: string[] = [];

    constructor(public configService: ConfigService) {}

    ngOnInit(): void {
        this.layoutConfigurableKeys = this.getLayoutConfigurableKeys();
    }

    getLayoutConfigurableKeys() {
        const { config } = this.configService;
        return Object.keys(config).filter(
            (key: any) => config[key].changeLayout !== undefined
        );
    }

    onFileChange = (event: any, imageKind: string) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this[imageKind] = {
                    file,
                    preview: e.target.result,
                };
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    uploadLogo() {
        this.configService.uploadImage(this.logo.file, 'logo.png');
    }

    uploadHero() {
        this.configService.uploadImage(this.hero.file, 'hero.png');
    }

    saveLayout() {
        this.configService.saveConfig(this.configService.config);
    }

    getLayoutLabel(key) {
        switch (key) {
            case 'dashboardTiles':
                return 'Display dashboard tiles as links';
            case 'identityProofing':
                return 'Hide identity proofing during sign up';
            default:
                return key;
        }
    }
}
