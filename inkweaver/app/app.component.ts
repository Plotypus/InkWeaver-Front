import { Component, OnInit } from '@angular/core';

import { ApiService } from './shared/api.service';

@Component({
    selector: 'ink-app',
    templateUrl: './app/app.component.html'
})
export class AppComponent {
    private data: any;

    constructor(private apiService: ApiService) { }

    ngOnInit() {
        this.data = this.apiService.data;

        let Parchment = Quill.import('parchment');
        let ID = new Parchment.Attributor.Attribute('id', 'id');
        Parchment.register(ID);
    }
}
