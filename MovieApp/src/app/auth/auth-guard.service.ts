// auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AwsCognitoService } from './aws-cognito.service'; // Adjust path as per your project

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private awsCognitoService: AwsCognitoService, private router: Router) {}

  canActivate(): boolean {
    if (this.awsCognitoService.isLoggedIn()) {
      return true; // Allow access to the route
    } else {
      this.router.navigate(['/login']); // Redirect to login page if not logged in
      return false;
    }
  }
}
