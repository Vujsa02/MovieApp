import { Component } from '@angular/core';
import {AwsCognitoService} from "../../auth/aws-cognito.service";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(
    private awsCognitoService: AwsCognitoService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  isLoggedIn(): boolean {
    return this.awsCognitoService.isLoggedIn();
  }

  logout(): void {
    this.awsCognitoService.logout();
    this.router.navigate(['/login']);
    this.toastr.success('Logged out successfully', 'Success', {
      timeOut: 5000
    });

  }

}
