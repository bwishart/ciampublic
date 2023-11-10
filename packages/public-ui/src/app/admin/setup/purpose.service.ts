import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ATTRIBUTE, PURPOSEID } from 'src/app/util/constant';
import environment from 'src/environments/environment';

export enum EAccessTypes {
    SHARE = 'share',
    STORE = 'store',
    READ = 'read',
}

export interface IPurposeProps {
    accessTypes: string[];
    attributes: {
        name: string;
        accessTypes: string[];
    }[];
}

export interface IPurposeConfig {
    [key: string]: IPurposeProps;
}

const purposeConfigPublic: IPurposeConfig = {
    [PURPOSEID.CREDITCARDCONSENTAGENCIES]: {
        accessTypes: [EAccessTypes.SHARE],
        attributes: [
            {
                name: ATTRIBUTE.CARDNUMBER,
                accessTypes: [EAccessTypes.SHARE],
            },
            {
                name: ATTRIBUTE.CARDEXPIRATION,
                accessTypes: [EAccessTypes.SHARE],
            },
        ],
    },
    [PURPOSEID.CREDITCARDCONSENTDMV]: {
        accessTypes: [EAccessTypes.STORE],
        attributes: [
            {
                name: ATTRIBUTE.CARDNUMBER,
                accessTypes: [EAccessTypes.STORE],
            },
            {
                name: ATTRIBUTE.CARDEXPIRATION,
                accessTypes: [EAccessTypes.STORE],
            },
        ],
    },
    [PURPOSEID.MFAMOBILENUMBER]: {
        accessTypes: [EAccessTypes.READ],
        attributes: [
            {
                name: 'mobile_number',
                accessTypes: [EAccessTypes.READ],
            },
        ],
    },
};

const purposeConfigDist = {};

const purposeConfigHealtcare = {};

@Injectable({
    providedIn: 'root',
})
export class PurposeService {
    public purposeConfig: IPurposeConfig = purposeConfigPublic;

    constructor(private http: HttpClient) {
        if (environment.workflow === 'healthcare') {
            this.purposeConfig = purposeConfigHealtcare;
        } else if (environment.workflow === 'distribution') {
            this.purposeConfig = purposeConfigDist;
        } else {
            this.purposeConfig = purposeConfigPublic;
        }
    }

    public testPurposes() {
        this.http.get(`${environment.baseUrl}/dpcm/purposes`).subscribe({
            next: () => {},
            error: () => {},
        });
    }
}
