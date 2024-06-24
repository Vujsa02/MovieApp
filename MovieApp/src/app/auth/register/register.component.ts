import { Component } from '@angular/core';
import { AwsCognitoService } from '../aws-cognito.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  birthdate: string = '';
  errorMessage: string = '';

  constructor(
    private awsCognitoService: AwsCognitoService,
    private router: Router,
    private snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {}

  register() {
    if (!this.validateForm()) {
      return;
    }

    this.awsCognitoService.register(this.username, this.password, this.email, this.firstName, this.lastName, this.birthdate)
      .then(result => {
        console.log('User registered:', result);
        // Show success message using MatSnackBar
        this.toastr.success('User registered successfully', 'Success', {
          timeOut: 5000
        });
        // Redirect to login page upon successful registration
        this.router.navigate(['/login']);
      })
      .catch(error => {
        console.error('Error registering user:', error);
        this.toastr.error('Failed to register user', 'Error', {
          timeOut: 5000
        });

      });
  }

  validateForm(): boolean {
    // Basic validation, you can add more specific validation as needed
    if (!this.username || !this.password || !this.email || !this.firstName || !this.lastName || !this.birthdate) {
      this.errorMessage = 'All fields are required.';
      return false;
    }

    return true;
  }
}
