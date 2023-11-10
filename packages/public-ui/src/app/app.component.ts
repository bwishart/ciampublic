import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from './services/common.service';
import { ConfigService } from './services/config.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'ISV-Public';
    loaded: boolean = true;

    constructor(
        private router: Router,
        private readonly configService: ConfigService,
        public commonService: CommonService
    ) {}

    ngOnInit(): void {
        // keep this code for configuration reference
        console.log('this.configService ', this.configService);
        this.configService.validateConfig();
        this.preloadUserData();
        this.commonService.loadedProfileApi.subscribe(flag => {
            this.loaded = flag;
        });
    }

    preloadUserData(): void {
      if (JSON.parse(sessionStorage.getItem('userdata'))?.data?.profile) {
          this.commonService.getUserData();
      } else {
          this.loaded = false;
      }
  }
    checkRoutes() {
        if (
            this.router.url.includes('admin') ||
            this.router.url.includes('delete-account') ||
            this.router.url.includes('home')
        )
            return false;
        return true;
    }
}
