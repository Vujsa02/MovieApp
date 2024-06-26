import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';

import {HomeComponent} from "./home/home.component";
import {BrowserModule} from "@angular/platform-browser";
import {MatToolbar} from "@angular/material/toolbar";
import {HttpClientModule} from "@angular/common/http";
import {MovieModule} from "./movie/movie.module";
import {AppRoutingModule} from "./app-routing.module";
import {AuthModule} from "./auth/auth.module";
import {MatButtonModule} from "@angular/material/button";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ToastrModule} from "ngx-toastr";
import {SubscribeComponent} from "./sub/subscribe/subscribe.component";
import {MatListOption, MatSelectionList} from "@angular/material/list";
import {MaterialModule} from "./infrastructure/material/material.module";
import {MatDialogModule} from "@angular/material/dialog";
import {ConfirmDeleteDialogComponent} from "./dialogs/confirm-delete-dialog/confirm-delete-dialog.component";
import {ReviewDialogComponent} from "./dialogs/review-dialog/review-dialog.component";
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SubscribeComponent,
    ConfirmDeleteDialogComponent,
    ReviewDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatButtonModule,
    HttpClientModule,
    AppRoutingModule,
    HttpClientModule,
    MovieModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    ToastrModule.forRoot({
      timeOut: 3000, // Set the duration for toastr messages (milliseconds)
      positionClass: 'toast-top-right', // Set the position of toastr messages
      preventDuplicates: true, // Prevent duplicate toastr messages
    }),
    LayoutModule,
    MatSelectionList,
    MatListOption,
    MaterialModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
