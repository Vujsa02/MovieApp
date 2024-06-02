import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavbarComponent} from "./navbar/navbar.component";
import {MatToolbar} from "@angular/material/toolbar";


@NgModule({
  declarations: [
    NavbarComponent
  ],
  imports: [
    CommonModule,
    MatToolbar
  ],
  exports: [
    NavbarComponent
  ]
})
export class LayoutModule { }
