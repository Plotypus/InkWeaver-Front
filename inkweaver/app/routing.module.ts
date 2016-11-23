import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditComponent } from './edit/edit.component';
import { WikiComponent } from './wiki/wiki.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
    { path: '', redirectTo: '/edit', pathMatch: 'full' }, // temporary will need to go to you stories page in the future
    { path: 'edit', component: EditComponent },
    { path: 'wiki', component: WikiComponent },
    { path: 'settings', component: SettingsComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class RoutingModule { }
