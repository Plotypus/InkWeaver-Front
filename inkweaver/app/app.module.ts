import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RoutingModule } from './routing.module';

import { AppComponent } from './app.component';
import { EditComponent } from './edit/edit.component';
import { WikiComponent } from './wiki/wiki.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
    imports: [BrowserModule, RoutingModule],
    declarations: [
        AppComponent,
        EditComponent,
        WikiComponent,
        SettingsComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }
