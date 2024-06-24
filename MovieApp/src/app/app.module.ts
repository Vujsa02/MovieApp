import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';

import {HomeComponent} from "./home/home.component";
import {BrowserModule} from "@angular/platform-browser";
import {MatToolbar} from "@angular/material/toolbar";
import {HttpClientModule} from "@angular/common/http";
import {MovieModule} from "./movie/movie.module";
import {AppRoutingModule} from "./app-routing.module";
import {MaterialModule} from "./infrastructure/material/material.module";
import { ToastrModule } from 'ngx-toastr';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,

  ],
  imports: [
    MaterialModule,
    LayoutModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MovieModule,
    ToastrModule.forRoot({
      timeOut: 3000, // Set the duration for toastr messages (milliseconds)
      positionClass: 'toast-top-right', // Set the position of toastr messages
      preventDuplicates: true, // Prevent duplicate toastr messages
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
