import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './component/app.component';
import { EditComponent } from './component/edit.component';
import { WikiComponent } from './component/wiki.component';
import { MoreOptionComponent } from './component/more-option.component';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
    imports: [BrowserModule, AppRoutingModule ],
  declarations: [AppComponent,
                 EditComponent,
                 WikiComponent,
                 MoreOptionComponent,
                 
                 ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
