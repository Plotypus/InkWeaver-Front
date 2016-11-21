import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditComponent } from './component/edit.component';
import { WikiComponent } from './component/wiki.component';
import { MoreOptionComponent } from './component/more-option.component';


const routes: Routes = [
    { path: '', redirectTo: '/edit', pathMatch: 'full' },// temporary will need to go to you stories page in the future
    { path: 'edit', component: EditComponent },
    { path: 'wiki', component: WikiComponent },
    { path: 'more-option', component: MoreOptionComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }