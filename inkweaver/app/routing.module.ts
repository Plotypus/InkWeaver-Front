import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { StoryComponent } from './story/story.component';
import { EditComponent } from './story/edit/edit.component';
import { WikiComponent } from './story/wiki/wiki.component';
import { StatsComponent } from './story/stats/stats.component';

const routes: Routes = [
    { path: '', redirectTo: '/login',pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'user', component: UserComponent },
    {
        path: 'story', component: StoryComponent,
        children: [
            { path: '', redirectTo: '/edit', pathMatch: 'full' },
            { path: 'edit', component: EditComponent },
            { path: 'wiki', component: WikiComponent },
            { path: 'stats', component: StatsComponent },
            { path: '**', component: EditComponent }
        ]
    },
    { path: '**', component: LoginComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class RoutingModule { }
