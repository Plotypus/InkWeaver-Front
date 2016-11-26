import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LayoutModule } from '@progress/kendo-angular-layout';

import { RoutingModule } from './routing.module';
import { EditModule } from './edit/edit.module';
import { WikiModule } from './wiki/wiki.module';
import { SettingsModule } from './settings/settings.module';

import { AppComponent } from './app.component';
import { WebSocketService } from './shared/websocket.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ButtonsModule,
        LayoutModule,
        RoutingModule,
        EditModule,
        WikiModule,
        SettingsModule
    ],
    providers: [
        WebSocketService
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
