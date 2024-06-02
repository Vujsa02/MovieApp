import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';

import {HomeComponent} from "./home/home.component";
import {BrowserModule} from "@angular/platform-browser";
import {MatToolbar} from "@angular/material/toolbar";
import {HttpClientModule} from "@angular/common/http";


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    LayoutModule,
    BrowserModule,
    HttpClientModule,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
