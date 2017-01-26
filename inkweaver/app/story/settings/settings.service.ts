import { Injectable } from '@angular/core';

import { ApiService } from '../../shared/api.service';

@Injectable()
export class SettingsService {
    constructor(private parser: ApiService) { }
}