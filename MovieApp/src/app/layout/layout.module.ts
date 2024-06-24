import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {NavbarComponent} from "./navbar/navbar.component";
import {MatToolbar} from "@angular/material/toolbar";
import {RouterLink} from "@angular/router";


@NgModule({
  declarations: [
    NavbarComponent
  ],
    imports: [
        CommonModule,
        MatToolbar,
        RouterLink,
        NgOptimizedImage
    ],
  exports: [
    NavbarComponent
  ]
})
export class LayoutModule { }
