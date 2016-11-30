import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import {
    TabMenuModule,
    TabViewModule,
    EditorModule,
    SharedModule,
    ButtonModule
} from 'primeng/primeng';

import { RoutingModule } from './routing.module';
import { EditModule } from './edit/edit.module';
import { WikiModule } from './wiki/wiki.module';
import { SettingsModule } from './settings/settings.module';

import { ParserService } from './shared/parser.service';
import { WebSocketService } from './shared/websocket.service';

import { AppComponent } from './app.component';

@NgModule({
    imports: [
        // Angular Modules
        BrowserModule,
        FormsModule,

        // PrimeNG Modules
        TabMenuModule,
        TabViewModule,
        EditorModule,
        SharedModule,
        ButtonModule,

        // App Modules
        RoutingModule,
        EditModule,
        WikiModule,
        SettingsModule
    ],
    providers: [
        ParserService,
        WebSocketService
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
