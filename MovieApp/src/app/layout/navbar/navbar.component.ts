import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {AwsCognitoService} from "../../auth/aws-cognito.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // use styleUrls instead of styleUrl
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

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
