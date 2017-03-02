import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { PanelModule, MenuModule, ButtonModule } from 'primeng/primeng';

// Modules, services, and components
import { RoutingModule } from './routing.module';
import { SharedModule } from './shared/shared.module';
import { LoginModule } from './login/login.module';
import { UserModule } from './user/user.module';
import { StoryModule } from './story/story.module';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        PanelModule,
        MenuModule,
        ButtonModule,
        RoutingModule,
        SharedModule,
        LoginModule,
        UserModule,
        StoryModule,
    ],
    declarations: [
        AppComponent

    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
